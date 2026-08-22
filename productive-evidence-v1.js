import { LESSONS } from './data.js';

const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
const writeAdaptive = state => {
  const next = JSON.stringify(state);
  if (localStorage.getItem(ADAPTIVE_KEY) !== next) localStorage.setItem(ADAPTIVE_KEY, next);
};

const CRITERIA = {
  writing: [
    ['task','I answered the exact task.'],
    ['position','My position / purpose is clear.'],
    ['development','I developed the main idea instead of only naming it.'],
    ['organization','Each paragraph or section has a clear job.'],
    ['language','I checked recurring grammar and collocation problems.']
  ],
  speaking: [
    ['direct','I answered the question directly.'],
    ['development','I added a reason, detail, example, comparison, or explanation.'],
    ['continuity','I continued after small mistakes instead of restarting.'],
    ['repetition','I avoided repeating the same idea unnecessarily.'],
    ['natural','I used natural spoken language rather than memorised essay phrases.']
  ]
};

function ensure(adaptive = read(ADAPTIVE_KEY)) {
  adaptive.productiveEvidence ||= { writing: [], speaking: [] };
  adaptive.productiveEvidence.writing ||= [];
  adaptive.productiveEvidence.speaking ||= [];
  adaptive.productivePriority ||= {};
  return adaptive;
}

function currentLesson() {
  const match = location.hash.match(/#\/lesson\/([^/?#]+)/);
  if (!match) return null;
  return LESSONS.find(l => l.id === match[1]) || null;
}

function wordCount(text='') { return (String(text).trim().match(/\S+/g) || []).length; }

function sourceForLesson(lesson) {
  if (!lesson) return null;
  if (lesson.skill === 'writing') {
    const el = document.querySelector('.writing-input');
    return el ? { blockId: el.dataset.writingId, text: el.value, words: wordCount(el.value) } : null;
  }
  if (lesson.skill === 'speaking') {
    const el = document.querySelector('.speaking-input');
    return el ? { blockId: el.dataset.speakingId, text: el.value, words: wordCount(el.value) } : null;
  }
  return null;
}

function latestEvents(adaptive, skill, limit=4) {
  return [...(adaptive.productiveEvidence?.[skill] || [])].sort((a,b)=>b.ts-a.ts).slice(0,limit);
}

function summary(adaptive, skill) {
  const events = adaptive.productiveEvidence?.[skill] || [];
  if (!events.length) return { attempts:0, retries:0, average:null, latest:null, improvement:null };
  const ordered = [...events].sort((a,b)=>a.ts-b.ts);
  const retries = ordered.filter(x => x.attemptKind === 'retry').length;
  const recent = ordered.slice(-4);
  const average = recent.reduce((sum,x)=>sum+x.score,0) / recent.length;
  const latest = ordered.at(-1);
  const first = [...ordered].reverse().find(x => x.attemptKind === 'first') || ordered[0];
  const retry = [...ordered].reverse().find(x => x.attemptKind === 'retry');
  const improvement = retry && first ? retry.score - first.score : null;
  return { attempts:events.length, retries, average, latest, improvement };
}

function updatePriority(adaptive) {
  for (const skill of ['writing','speaking']) {
    const s = summary(adaptive, skill);
    if (!s.attempts) { delete adaptive.productivePriority[skill]; continue; }
    const noRetryBoost = s.retries === 0 ? 0.12 : 0;
    const lowProcess = 1 - s.average;
    const score = Math.min(1, lowProcess * 0.8 + noRetryBoost);
    adaptive.productivePriority[skill] = {
      score,
      attempts:s.attempts,
      retries:s.retries,
      average:s.average,
      latestAt:s.latest?.ts || null,
      lessonId:s.latest?.lessonId || null,
      updatedAt:Date.now()
    };
  }
}

function evidenceCard(lesson) {
  const adaptive = ensure();
  const s = summary(adaptive, lesson.skill);
  const criteria = CRITERIA[lesson.skill];
  const latest = latestEvents(adaptive, lesson.skill, 1)[0];
  return `<section class="lesson-section productive-evidence-card" data-productive-evidence-card>
    <div class="eyebrow">Productive-skill evidence</div>
    <h2 style="margin-top:6px">Save an attempt, then make the retry measurable.</h2>
    <p class="muted">This is <strong>process evidence</strong>, not an IELTS band score. It records whether your Writing revision or Speaking retry fixed the priorities you were practising.</p>
    <div class="grid two" style="margin-top:14px">
      <label class="stack"><strong>Attempt type</strong><select class="text-input" data-pe-kind><option value="first">First attempt</option><option value="retry">Revision / retry</option></select></label>
      <div class="card subtle"><strong>Evidence so far</strong><p class="small muted" style="margin-top:6px">${s.attempts} attempt${s.attempts===1?'':'s'} · ${s.retries} retr${s.retries===1?'y':'ies'}${s.average==null?'':` · recent self-check ${Math.round(s.average*100)}%`}</p>${latest?`<p class="small muted">Latest: ${latest.lessonId} · ${new Date(latest.ts).toLocaleDateString()}</p>`:''}</div>
    </div>
    <div class="checklist" style="margin-top:14px">${criteria.map(([id,label])=>`<label class="check-item"><input type="checkbox" data-pe-criterion="${id}"> ${esc(label)}</label>`).join('')}</div>
    <div class="cluster" style="margin-top:14px"><button class="btn primary" data-pe-action="save" data-skill="${lesson.skill}" data-lesson-id="${lesson.id}">Save attempt evidence</button><span class="small muted">Your current ${lesson.skill === 'writing' ? 'draft' : 'transcript'} must contain enough language to count as evidence.</span></div>
    ${s.improvement == null ? '' : `<div class="callout ${s.improvement >= 0 ? 'success' : 'warning'}" style="margin-top:14px">Latest recorded retry change: <strong>${s.improvement >= 0 ? '+' : ''}${Math.round(s.improvement*100)} percentage points</strong> across the five self-check criteria.</div>`}
  </section>`;
}

function injectLessonEvidence() {
  const lesson = currentLesson();
  if (!lesson || !['writing','speaking'].includes(lesson.skill) || document.querySelector('[data-productive-evidence-card]')) return;
  const sections = [...document.querySelectorAll('.lesson-shell > .lesson-section')];
  const finish = sections.at(-1);
  if (!finish) return;
  finish.insertAdjacentHTML('beforebegin', evidenceCard(lesson));
}

function saveEvidence(button) {
  const lesson = LESSONS.find(l => l.id === button.dataset.lessonId);
  if (!lesson) return;
  const source = sourceForLesson(lesson);
  const minWords = lesson.skill === 'writing' ? 40 : 15;
  if (!source || source.words < minWords) {
    alert(`Add at least ${minWords} words to the current ${lesson.skill === 'writing' ? 'draft' : 'transcript'} before saving productive evidence.`);
    return;
  }
  const card = button.closest('[data-productive-evidence-card]');
  const checked = [...card.querySelectorAll('[data-pe-criterion]')].filter(x => x.checked).map(x => x.dataset.peCriterion);
  const attemptKind = card.querySelector('[data-pe-kind]')?.value || 'first';
  const adaptive = ensure();
  const event = {
    id:`pe-${Date.now()}-${lesson.id}`,
    ts:Date.now(), skill:lesson.skill, lessonId:lesson.id, blockId:source.blockId,
    attemptKind, criteria:checked, score:checked.length / CRITERIA[lesson.skill].length, wordCount:source.words
  };
  adaptive.productiveEvidence[lesson.skill].push(event);
  updatePriority(adaptive);
  writeAdaptive(adaptive);
  window.dispatchEvent(new CustomEvent('ielts-productive-evidence-change', { detail:event }));
  card.replaceWith(htmlToNode(evidenceCard(lesson)));
}

function htmlToNode(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function injectToday() {
  if (!location.hash.includes('/today')) return;
  const root = document.querySelector('[data-adaptive-root="today"]');
  if (!root || document.querySelector('[data-productive-today]')) return;
  const adaptive = ensure();
  updatePriority(adaptive);
  writeAdaptive(adaptive);
  const ranked = Object.entries(adaptive.productivePriority || {}).sort((a,b)=>b[1].score-a[1].score);
  if (!ranked.length) return;
  const [skill,p] = ranked[0];
  const lessonId = p.lessonId || (skill === 'writing' ? 'W05' : 'S04');
  const lesson = LESSONS.find(l => l.id === lessonId) || LESSONS.find(l => l.id === (skill === 'writing' ? 'W05' : 'S04'));
  if (!lesson) return;
  const section = document.createElement('section');
  section.className = 'card extension-card';
  section.dataset.productiveToday = 'true';
  section.style.marginTop = '18px';
  section.innerHTML = `<div class="adaptive-top"><div><div class="eyebrow">Productive evidence · ${skill === 'writing' ? 'Writing' : 'Speaking'}</div><h2>${p.retries === 0 ? 'Complete a feedback → retry cycle' : 'Revisit the weakest productive pattern'}</h2></div><span class="chip warning">Process evidence</span></div><p class="muted">${p.attempts} recorded attempt${p.attempts===1?'':'s'} · ${p.retries} retr${p.retries===1?'y':'ies'} · recent self-check ${Math.round(p.average*100)}%. This signal is kept separate from objective-question accuracy and is not an IELTS score.</p><div class="cluster"><button class="btn soft" data-lesson="${lesson.id}">${p.retries === 0 ? 'Return and retry' : 'Practise again'}</button><span class="small muted">Priority signal ${Math.round(p.score*100)}/100</span></div>`;
  root.insertAdjacentElement('afterend', section);
}

function injectProgress() {
  if (!location.hash.includes('/progress') || document.querySelector('[data-productive-progress]')) return;
  const anchor = document.querySelector('[data-runtime-root="performance"]') || [...document.querySelectorAll('#main .card')].find(x => x.textContent.includes('Observed learning profile'));
  if (!anchor) return;
  const adaptive = ensure();
  const cards = ['writing','speaking'].map(skill => {
    const s = summary(adaptive, skill);
    return `<div class="card subtle"><div class="cluster" style="justify-content:space-between"><strong>${skill === 'writing' ? 'Writing' : 'Speaking'}</strong><span class="chip">${s.attempts} attempts</span></div>${s.attempts ? `<p class="muted" style="margin-top:8px">${s.retries} retr${s.retries===1?'y':'ies'} · recent process self-check ${Math.round(s.average*100)}%</p><p class="small muted">${s.improvement == null ? 'A first attempt is recorded; save a revision/retry to measure change.' : `Recorded retry change ${s.improvement >= 0 ? '+' : ''}${Math.round(s.improvement*100)} points.`}</p>` : `<p class="muted" style="margin-top:8px">No productive evidence yet. Complete a Writing draft or Speaking transcript, self-check it, then retry after feedback.</p>`}</div>`;
  }).join('');
  anchor.insertAdjacentHTML('afterend', `<section class="card extension-card" data-productive-progress style="margin-top:18px"><div class="eyebrow">Productive-skill evidence</div><h2 style="margin:8px 0">Writing and Speaking now have retry evidence.</h2><p class="muted">Objective questions and productive self-checks are shown separately. The latter measure the learning process and revision behaviour, not an official band score.</p><div class="grid two" style="margin-top:14px">${cards}</div></section>`);
}

function apply() {
  injectLessonEvidence();
  injectToday();
  injectProgress();
}

document.addEventListener('click', e => {
  const button = e.target.closest('[data-pe-action="save"]');
  if (button) saveEvidence(button);
});
window.addEventListener('hashchange', () => setTimeout(apply,0));
window.addEventListener('ielts-productive-evidence-change', () => setTimeout(apply,0));
new MutationObserver(apply).observe(document.documentElement, { childList:true, subtree:true });
setTimeout(apply,0);
