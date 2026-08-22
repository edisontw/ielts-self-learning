import { LESSONS } from './data.js';

const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const esc = (value='') => String(value).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
const write = state => localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(state));

function ensure(adaptive=read(ADAPTIVE_KEY)) {
  adaptive.productiveEvidence ||= { writing:[], speaking:[] };
  adaptive.productiveEvidence.writing ||= [];
  adaptive.productiveEvidence.speaking ||= [];
  adaptive.aiFeedbackReturns ||= { writing:[], speaking:[] };
  adaptive.aiFeedbackReturns.writing ||= [];
  adaptive.aiFeedbackReturns.speaking ||= [];
  return adaptive;
}

function currentLesson() {
  const match = location.hash.match(/#\/lesson\/([^/?#]+)/);
  if (!match) return null;
  return LESSONS.find(x => x.id === match[1]) || null;
}

function productiveEvents(adaptive, skill, lessonId=null) {
  return (adaptive.productiveEvidence?.[skill] || [])
    .filter(x => !lessonId || x.lessonId === lessonId)
    .sort((a,b) => a.ts-b.ts);
}

function feedbackEvents(adaptive, skill, lessonId=null) {
  return (adaptive.aiFeedbackReturns?.[skill] || [])
    .filter(x => !lessonId || x.lessonId === lessonId)
    .sort((a,b) => a.ts-b.ts);
}

function latestSourceAttempt(adaptive, lesson) {
  return productiveEvents(adaptive, lesson.skill, lesson.id).at(-1) || null;
}

function comparison(source, retry) {
  if (!source || !retry) return null;
  const before = new Set(source.criteria || []);
  const after = new Set(retry.criteria || []);
  return {
    processDelta: Number(retry.score || 0) - Number(source.score || 0),
    wordCountDelta: Number(retry.wordCount || 0) - Number(source.wordCount || 0),
    criteriaAdded: [...after].filter(x => !before.has(x)),
    criteriaLost: [...before].filter(x => !after.has(x))
  };
}

function linkRetryToFeedback(retryEvent, adaptive=ensure()) {
  if (!retryEvent || retryEvent.attemptKind !== 'retry' || !['writing','speaking'].includes(retryEvent.skill)) return null;
  const pending = [...feedbackEvents(adaptive, retryEvent.skill, retryEvent.lessonId)]
    .reverse()
    .find(x => !x.appliedByEvidenceId && x.ts <= retryEvent.ts && x.sourceEvidenceId !== retryEvent.id);
  if (!pending) return null;
  const source = productiveEvents(adaptive, retryEvent.skill).find(x => x.id === pending.sourceEvidenceId) || null;
  pending.appliedByEvidenceId = retryEvent.id;
  pending.appliedAt = retryEvent.ts;
  pending.comparison = comparison(source, retryEvent);
  write(adaptive);
  window.dispatchEvent(new CustomEvent('ielts-ai-feedback-return-change', { detail:pending }));
  return pending;
}

function saveFeedback(button) {
  const lesson = LESSONS.find(x => x.id === button.dataset.lessonId);
  if (!lesson || !['writing','speaking'].includes(lesson.skill)) return;
  const adaptive = ensure();
  const source = latestSourceAttempt(adaptive, lesson);
  if (!source) {
    alert('Save productive evidence for your current attempt before logging external AI feedback.');
    return;
  }
  const card = button.closest('[data-ai-feedback-return]');
  const priorities = [...card.querySelectorAll('[data-af-priority]')]
    .map(x => x.value.trim())
    .filter(Boolean)
    .slice(0,3);
  if (priorities.length < 2) {
    alert('Add at least two actionable feedback priorities. Keep them short and specific.');
    return;
  }
  const event = {
    id:`afr-${Date.now()}-${lesson.id}`,
    ts:Date.now(),
    skill:lesson.skill,
    lessonId:lesson.id,
    sourceEvidenceId:source.id,
    sourceAttemptKind:source.attemptKind,
    priorities,
    appliedByEvidenceId:null,
    appliedAt:null,
    comparison:null
  };
  adaptive.aiFeedbackReturns[lesson.skill].push(event);
  write(adaptive);
  window.dispatchEvent(new CustomEvent('ielts-ai-feedback-return-change', { detail:event }));
  replaceLessonCard(lesson);
}

function deltaText(row) {
  if (!row?.comparison) return 'Waiting for the next saved revision / retry.';
  const d = row.comparison.processDelta;
  const word = row.comparison.wordCountDelta;
  const added = row.comparison.criteriaAdded?.length ? ` · improved checks: ${row.comparison.criteriaAdded.join(', ')}` : '';
  return `Process self-check change ${d>=0?'+':''}${Math.round(d*100)} points · word-count change ${word>=0?'+':''}${word}${added}`;
}

function lessonCardHTML(lesson) {
  const adaptive = ensure();
  const source = latestSourceAttempt(adaptive, lesson);
  const rows = feedbackEvents(adaptive, lesson.skill, lesson.id);
  const pending = [...rows].reverse().find(x => !x.appliedByEvidenceId);
  const latest = rows.at(-1);
  const status = pending
    ? `<div class="callout warning" style="margin-top:14px"><strong>Feedback logged — now revise.</strong><br><span class="small">${pending.priorities.map((p,i)=>`${i+1}. ${esc(p)}`).join('<br>')}</span><div class="small muted" style="margin-top:8px">${esc(deltaText(pending))}</div></div>`
    : latest?.appliedByEvidenceId
      ? `<div class="callout success" style="margin-top:14px"><strong>Feedback → retry cycle recorded.</strong><br><span class="small">${latest.priorities.map((p,i)=>`${i+1}. ${esc(p)}`).join('<br>')}</span><div class="small muted" style="margin-top:8px">${esc(deltaText(latest))}</div></div>`
      : '';
  return `<section class="lesson-section" data-ai-feedback-return>
    <div class="eyebrow">AI feedback return · revision log</div>
    <h2 style="margin-top:6px">Bring back 2–3 changes, not an AI score.</h2>
    <p class="muted">After using the copied prompt on an external LLM, return only the most useful actionable changes. Any AI-generated band or score stays outside the learner profile.</p>
    ${source ? `<div class="card subtle" style="margin-top:14px"><strong>Feedback source</strong><div class="small muted" style="margin-top:5px">${esc(source.lessonId)} · ${esc(source.attemptKind)} attempt · ${source.wordCount} words · process self-check ${Math.round((source.score||0)*100)}%</div></div>` : `<div class="callout warning" style="margin-top:14px"><strong>No saved attempt evidence yet.</strong><br><span class="small">Save Productive-skill evidence first. That attempt becomes the anchor for feedback and the next retry.</span></div>`}
    <div class="stack" style="margin-top:14px">
      <label><strong>Priority 1</strong><input class="text-input" data-af-priority maxlength="220" placeholder="Example: Make the topic sentence answer the exact question."></label>
      <label><strong>Priority 2</strong><input class="text-input" data-af-priority maxlength="220" placeholder="Example: Add one concrete explanation before the example."></label>
      <label><strong>Priority 3 <span class="small muted">optional</span></strong><input class="text-input" data-af-priority maxlength="220" placeholder="Example: Fix repeated article errors."></label>
    </div>
    <div class="cluster" style="margin-top:14px"><button class="btn primary" data-af-action="save" data-lesson-id="${esc(lesson.id)}" ${source?'':'disabled'}>Save feedback priorities</button><span class="small muted">No AI band, rating, or examiner score is imported.</span></div>
    ${status}
  </section>`;
}

function htmlToNode(html) {
  const t=document.createElement('template');
  t.innerHTML=html.trim();
  return t.content.firstElementChild;
}

function replaceLessonCard(lesson) {
  const old=document.querySelector('[data-ai-feedback-return]');
  if (old) old.replaceWith(htmlToNode(lessonCardHTML(lesson)));
}

function injectLesson() {
  const lesson=currentLesson();
  if (!lesson || !['writing','speaking'].includes(lesson.skill) || document.querySelector('[data-ai-feedback-return]')) return;
  const productive=document.querySelector('[data-productive-evidence-card]');
  if (productive) productive.insertAdjacentHTML('afterend', lessonCardHTML(lesson));
}

function feedbackSummary(adaptive, skill) {
  const rows=feedbackEvents(adaptive,skill);
  return {
    total:rows.length,
    pending:rows.filter(x=>!x.appliedByEvidenceId).length,
    applied:rows.filter(x=>x.appliedByEvidenceId).length,
    latest:rows.at(-1)||null
  };
}

function injectProgress() {
  if (!location.hash.includes('/progress') || document.querySelector('[data-ai-feedback-progress]')) return;
  const anchor=document.querySelector('[data-productive-progress]');
  if (!anchor) return;
  const adaptive=ensure();
  const cards=['writing','speaking'].map(skill=>{
    const s=feedbackSummary(adaptive,skill);
    return `<div class="card subtle"><div class="cluster" style="justify-content:space-between"><strong>${skill==='writing'?'Writing':'Speaking'}</strong><span class="chip">${s.applied}/${s.total} applied</span></div><p class="muted" style="margin-top:8px">${s.total ? `${s.pending} feedback set${s.pending===1?'':'s'} waiting for a retry.` : 'No returned AI feedback logged yet.'}</p>${s.latest?.comparison?`<div class="small muted">Latest: ${esc(deltaText(s.latest))}</div>`:''}</div>`;
  }).join('');
  anchor.insertAdjacentHTML('afterend', `<section class="card extension-card" data-ai-feedback-progress style="margin-top:18px"><div class="eyebrow">AI feedback → revision evidence</div><h2 style="margin:8px 0">Track what you changed after external feedback.</h2><p class="muted">Only actionable feedback priorities and revision links are stored. External AI scores are not learner-profile evidence.</p><div class="grid two" style="margin-top:14px">${cards}</div></section>`);
}

function injectToday() {
  if (!location.hash.includes('/today') || document.querySelector('[data-ai-feedback-today]')) return;
  const adaptive=ensure();
  const pending=['writing','speaking'].flatMap(skill=>feedbackEvents(adaptive,skill).filter(x=>!x.appliedByEvidenceId)).sort((a,b)=>b.ts-a.ts)[0];
  if (!pending) return;
  const anchor=document.querySelector('[data-productive-today]') || document.querySelector('[data-adaptive-root="today"]');
  if (!anchor) return;
  const lesson=LESSONS.find(x=>x.id===pending.lessonId);
  if (!lesson) return;
  const section=document.createElement('section');
  section.className='card extension-card';
  section.dataset.aiFeedbackToday='true';
  section.style.marginTop='18px';
  section.innerHTML=`<div class="adaptive-top"><div><div class="eyebrow">Feedback waiting for revision · ${pending.skill}</div><h2>Turn external feedback into a retry.</h2></div><span class="chip warning">${pending.priorities.length} priorities</span></div><p class="muted">${pending.priorities.map((p,i)=>`${i+1}. ${esc(p)}`).join('<br>')}</p><button class="btn soft" data-lesson="${esc(lesson.id)}">Return and revise</button>`;
  anchor.insertAdjacentElement('afterend',section);
}

function apply() {
  injectLesson();
  injectProgress();
  injectToday();
}

document.addEventListener('click',e=>{
  const button=e.target.closest('[data-af-action="save"]');
  if (button) saveFeedback(button);
});
window.addEventListener('ielts-productive-evidence-change',e=>{
  const adaptive=ensure();
  const linked=linkRetryToFeedback(e.detail,adaptive);
  if (linked) {
    const lesson=currentLesson();
    if (lesson?.id===linked.lessonId) replaceLessonCard(lesson);
  }
  setTimeout(apply,0);
});
window.addEventListener('ielts-ai-feedback-return-change',()=>setTimeout(apply,0));
window.addEventListener('hashchange',()=>setTimeout(apply,0));
new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(apply,0);

export { ensure, feedbackSummary, comparison, linkRetryToFeedback };
