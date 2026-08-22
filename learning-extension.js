import { LESSONS } from './data.js';
import { CORE_LESSON_META, REPAIR_LESSONS, RECOMMENDATION_WEIGHTS } from './adaptive-data.js';
import { VOCABULARY_ITEMS, VOCAB_REVIEW_RATINGS } from './learning-extension-data.js';

const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const DAY = 86400000;
let scheduled = false;
let applying = false;

const read = key => {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch { return {}; }
};
const writeAdaptive = value => localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(value));
const esc = (value = '') => String(value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[ch]));
const skillLabel = skill => ({ reading:'Reading', listening:'Listening', writing:'Writing', speaking:'Speaking', vocabulary:'Vocabulary', grammar:'Grammar', 'learning-better':'Learning Better' })[skill] || skill;

function ensureAdaptive(core, adaptive = read(ADAPTIVE_KEY)) {
  adaptive.reviewSchedule ||= {};
  adaptive.repairProgress ||= {};
  adaptive.reviewHistory ||= [];
  adaptive.vocabularySchedule ||= {};
  adaptive.vocabularyHistory ||= [];
  adaptive.skillPerformance ||= {};
  adaptive.learningHistory ||= [];

  for (const item of eligibleVocabulary(core, adaptive)) {
    adaptive.vocabularySchedule[item.id] ||= {
      dueAt: Date.now(), intervalDays: 0, attempts: 0, lastRating: null,
      selected: null, checked: false, lastCorrect: null
    };
  }
  return adaptive;
}

function eligibleVocabulary(core, adaptive) {
  const completed = new Set(core.completedLessons || []);
  const repairDone = new Set(Object.entries(adaptive.repairProgress || {}).filter(([,v]) => v?.completed).map(([id]) => id));
  return VOCABULARY_ITEMS.filter(item => completed.has(item.sourceLesson) || repairDone.has(item.sourceLesson));
}

function quizMap() {
  const map = new Map();
  for (const lesson of LESSONS) {
    for (const section of lesson.sections || []) {
      for (const block of section.blocks || []) {
        if (block.type === 'quiz') map.set(block.id, { lesson, block });
      }
    }
  }
  return map;
}

function computeSkillPerformance(core, adaptive) {
  const stats = {};
  const add = (skill, correct) => {
    stats[skill] ||= { answered: 0, correct: 0 };
    stats[skill].answered++;
    if (correct) stats[skill].correct++;
  };
  const map = quizMap();
  for (const [id, answer] of Object.entries(core.lessonAnswers || {})) {
    if (!answer?.checked) continue;
    const found = map.get(id);
    if (!found) continue;
    add(found.lesson.skill, answer.selected === found.block.answer);
  }
  for (const repair of REPAIR_LESSONS) {
    const answers = adaptive.repairProgress?.[repair.id]?.answers || {};
    repair.questions.forEach((q, index) => {
      const saved = answers[index];
      if (saved?.checked) add(repair.skill, saved.selected === q.answer);
    });
  }
  for (const [skill, value] of Object.entries(stats)) {
    const accuracy = value.answered ? value.correct / value.answered : null;
    adaptive.skillPerformance[skill] = {
      ...value,
      accuracy,
      confidence: value.answered >= 8 ? 'Moderate' : value.answered >= 4 ? 'Emerging' : 'Low',
      updatedAt: Date.now()
    };
  }
  return stats;
}

function placementWeakness(core, skill) {
  const sec = core.profile?.placementSections || {};
  if (skill === 'reading') return sec.reading == null ? .45 : (6 - sec.reading) / 6;
  if (skill === 'listening') return sec.listening == null ? .45 : (6 - sec.listening) / 6;
  if (skill === 'vocabulary') return sec.vocabulary == null ? .45 : (6 - sec.vocabulary) / 6;
  if (skill === 'grammar') return sec.grammar == null ? .45 : (6 - sec.grammar) / 6;
  if (skill === 'writing') {
    const g = sec.grammar == null ? .45 : (6 - sec.grammar) / 6;
    const v = sec.vocabulary == null ? .45 : (6 - sec.vocabulary) / 6;
    return Math.max(g, v) * .85 + .15;
  }
  if (skill === 'speaking') return .55;
  return .35;
}

function observedWeakness(core, adaptive, skill) {
  const base = placementWeakness(core, skill);
  const perf = adaptive.skillPerformance?.[skill];
  if (!perf?.answered) return base;
  const actual = 1 - perf.accuracy;
  const actualWeight = perf.answered >= 8 ? .65 : perf.answered >= 4 ? .45 : .25;
  return base * (1 - actualWeight) + actual * actualWeight;
}

function errorReviewDue(core, adaptive) {
  const now = Date.now();
  return (core.errors || []).filter(error => (adaptive.reviewSchedule?.[error.id]?.dueAt ?? error.ts ?? now) <= now).length;
}
function vocabularyDue(core, adaptive) {
  const now = Date.now();
  const eligible = new Set(eligibleVocabulary(core, adaptive).map(x => x.id));
  return Object.entries(adaptive.vocabularySchedule || {}).filter(([id,s]) => eligible.has(id) && (s.dueAt || 0) <= now).length;
}

function recentCounts(core, adaptive) {
  const since = Date.now() - 7 * DAY;
  const counts = { reading:0, listening:0, writing:0, speaking:0, vocabulary:0, grammar:0, 'learning-better':0 };
  const skillById = new Map([...CORE_LESSON_META, ...REPAIR_LESSONS].map(x => [x.id, x.skill]));
  for (const row of core.studyHistory || []) {
    if ((row.ts || 0) < since) continue;
    const skill = skillById.get(row.lessonId);
    if (skill && counts[skill] != null) counts[skill]++;
  }
  for (const row of adaptive.learningHistory || []) {
    if ((row.ts || 0) < since) continue;
    if (row.skill && counts[row.skill] != null) counts[row.skill]++;
  }
  return counts;
}

function candidateLessons() {
  const repair = REPAIR_LESSONS.map(x => ({ ...x, targetRelevance: x.skill === 'grammar' ? .8 : .75 }));
  return [...CORE_LESSON_META, ...repair];
}

function scoreCandidate(core, adaptive, lesson) {
  const counts = recentCounts(core, adaptive);
  const weakness = observedWeakness(core, adaptive, lesson.skill);
  const dueForSkill = (core.errors || []).filter(e => e.skill === lesson.skill && (adaptive.reviewSchedule?.[e.id]?.dueAt ?? e.ts ?? 0) <= Date.now()).length;
  const dueReview = Math.min(1, dueForSkill / 2);
  const exposure = counts[lesson.skill] || 0;
  const skillBalance = exposure >= 2 ? 0 : exposure === 1 ? .55 : 1;
  const recommendedDifficulty = Number(core.profile?.recommendedDifficulty || 3);
  const difficultyMatch = Math.max(0, 1 - Math.abs(recommendedDifficulty - lesson.difficulty) / 3);
  const available = Number(core.study?.preferredMinutes || 20);
  const timeMatch = lesson.estimatedMinutes <= available ? 1 : Math.max(.15, available / lesson.estimatedMinutes);
  const recent = [...(core.studyHistory || []), ...(adaptive.learningHistory || [])].slice(-6).some(x => x.lessonId === lesson.id);
  const breakdown = {
    weakness: weakness * RECOMMENDATION_WEIGHTS.weakness,
    dueReview: dueReview * RECOMMENDATION_WEIGHTS.dueReview,
    targetRelevance: lesson.targetRelevance * RECOMMENDATION_WEIGHTS.targetRelevance,
    skillBalance: skillBalance * RECOMMENDATION_WEIGHTS.skillBalance,
    difficultyMatch: difficultyMatch * RECOMMENDATION_WEIGHTS.difficultyMatch,
    timeMatch: timeMatch * RECOMMENDATION_WEIGHTS.timeMatch,
    recentPenalty: recent ? RECOMMENDATION_WEIGHTS.recentRepetitionPenalty : 0
  };
  return { lesson, breakdown, score: Object.entries(breakdown).reduce((sum,[k,v]) => sum + (k === 'recentPenalty' ? -v : v), 0) };
}

function renderAdaptiveToday(core, adaptive) {
  const root = document.querySelector('[data-adaptive-root="today"]');
  if (!root) return;
  if (!core.placement) {
    root.hidden = true;
    return;
  }
  root.hidden = false;
  const errorDue = errorReviewDue(core, adaptive);
  const vocabDue = vocabularyDue(core, adaptive);
  if (errorDue || vocabDue) {
    root.innerHTML = `<div class="adaptive-top"><div><div class="eyebrow">Adaptive Today · retrieval first</div><h2>${errorDue + vocabDue} review item${errorDue + vocabDue === 1 ? '' : 's'} due</h2></div><span class="chip warning">Spaced review</span></div>
      <p class="muted">${errorDue ? `${errorDue} saved error${errorDue===1?'':'s'}` : ''}${errorDue && vocabDue ? ' · ' : ''}${vocabDue ? `${vocabDue} vocabulary item${vocabDue===1?'':'s'}` : ''}. Retrieval practice comes before new material when review is due.</p>
      <div class="cluster"><button class="btn primary" data-nav="improve">Open Review Queue</button><span class="small muted">≈ ${Math.min(12, Math.max(3, (errorDue+vocabDue)*2))} min</span></div>`;
    return;
  }
  const ranked = candidateLessons().map(x => scoreCandidate(core, adaptive, x)).sort((a,b)=>b.score-a.score);
  const rec = ranked[0];
  const b = rec.breakdown;
  root.innerHTML = `<div class="adaptive-top"><div><div class="eyebrow">Adaptive Today · placement + real performance</div><h2>${esc(rec.lesson.title)}</h2></div><span class="score-badge">${Math.round(rec.score)}</span></div>
    <p class="muted">Placement starts the profile. Checked lesson answers increasingly influence weakness as evidence accumulates.</p>
    <div class="adaptive-breakdown"><span>Weakness ${Math.round(b.weakness)}</span><span>Review ${Math.round(b.dueReview)}</span><span>Target ${Math.round(b.targetRelevance)}</span><span>Balance ${Math.round(b.skillBalance)}</span><span>Difficulty ${Math.round(b.difficultyMatch)}</span><span>Time ${Math.round(b.timeMatch)}</span>${b.recentPenalty?`<span class="penalty">Recent −${Math.round(b.recentPenalty)}</span>`:''}</div>
    <div class="cluster"><button class="btn primary" data-lesson="${rec.lesson.id}">Start recommended lesson</button><span class="small muted">${rec.lesson.estimatedMinutes} min · ${skillLabel(rec.lesson.skill)} · Difficulty ${rec.lesson.difficulty}/5</span></div>`;
}

function vocabularyQueueHTML(core, adaptive) {
  const eligible = eligibleVocabulary(core, adaptive);
  const now = Date.now();
  const due = eligible.filter(item => (adaptive.vocabularySchedule?.[item.id]?.dueAt || 0) <= now);
  const later = eligible.filter(item => (adaptive.vocabularySchedule?.[item.id]?.dueAt || 0) > now);
  return `<section class="card extension-card" data-extension-root="vocabulary">
    <div class="adaptive-top"><div><div class="eyebrow">Vocabulary Review</div><h2>${due.length ? `${due.length} due now` : eligible.length ? 'Vocabulary is scheduled' : 'Build vocabulary from lessons'}</h2></div><span class="chip primary">Context → recall → reuse</span></div>
    <p class="muted">Cards unlock from completed lessons. Review the phrase in context instead of memorising an isolated word list.</p>
    ${due.length ? `<div class="vocab-stack">${due.slice(0,5).map(item => vocabCardHTML(item, adaptive.vocabularySchedule[item.id])).join('')}</div>` : eligible.length ? '<div class="empty-state"><strong>No vocabulary is due.</strong><p>Return when the next interval is ready.</p></div>' : '<div class="empty-state"><strong>No vocabulary cards unlocked yet.</strong><p>Complete R01, L01, W01, or VG01 to seed lesson-based vocabulary review.</p></div>'}
    ${later.length ? `<details class="scheduled-reviews"><summary>${later.length} scheduled later</summary>${later.slice(0,8).map(item=>`<div class="scheduled-row"><span>${esc(item.term)}</span><span class="small muted">${new Date(adaptive.vocabularySchedule[item.id].dueAt).toLocaleDateString()}</span></div>`).join('')}</details>` : ''}
  </section>`;
}

function vocabCardHTML(item, schedule) {
  const options = [item.answer, ...item.distractors];
  const checked = schedule.checked;
  return `<article class="vocab-card" data-vocab-id="${item.id}"><div class="cluster"><span class="chip">${esc(item.sourceLesson)}</span><span class="small muted">${esc(item.meaning)}</span></div><strong>${esc(item.prompt)}</strong><div class="options">${options.map((o,i)=>`<button class="option ${checked?(o===item.answer?'correct':o===schedule.selected?'wrong':''):(o===schedule.selected?'selected':'')}" data-ext-action="vocab-option" data-vocab-id="${item.id}" data-value="${esc(o)}" ${checked?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div><button class="btn small-btn ${checked?'soft':'primary'}" data-ext-action="vocab-check" data-vocab-id="${item.id}" ${!schedule.selected||checked?'disabled':''}>${checked?'Checked':'Check'}</button>${checked?`<div class="feedback ${schedule.lastCorrect?'correct':'wrong'}"><strong>${schedule.lastCorrect?'Correct':'Review the chunk'}</strong><br>${esc(item.term)} · ${esc(item.collocations.join(' · '))}</div><div class="rating-row"><span class="small muted">Schedule next review:</span>${Object.entries(VOCAB_REVIEW_RATINGS).map(([key,r])=>`<button class="btn ghost small-btn" data-ext-action="vocab-rate" data-vocab-id="${item.id}" data-rating="${key}">${r.label}</button>`).join('')}</div>`:''}</article>`;
}

function injectVocabulary(core, adaptive) {
  if (!location.hash.includes('/improve')) return;
  if (document.querySelector('[data-extension-root="vocabulary"]')) return;
  const anchor = document.querySelector('[data-adaptive-root="repair"]') || document.querySelector('[data-adaptive-root="review"]');
  if (!anchor) return;
  anchor.insertAdjacentHTML('afterend', vocabularyQueueHTML(core, adaptive));
}

function injectPerformance(core, adaptive) {
  if (!location.hash.includes('/progress')) return;
  if (document.querySelector('[data-extension-root="performance"]')) return;
  const target = document.querySelector('#main .card[style*="margin-top:18px"]');
  if (!target) return;
  const skills = ['reading','listening','writing','speaking','vocabulary','grammar'];
  const rows = skills.map(skill => {
    const p = adaptive.skillPerformance?.[skill];
    const base = placementWeakness(core, skill);
    const combined = observedWeakness(core, adaptive, skill);
    return `<div class="profile-row"><strong>${skillLabel(skill)}</strong><div class="meter"><span style="width:${p?.answered ? Math.round(p.accuracy*100) : Math.round((1-base)*100)}%"></span></div><span>${p?.answered ? `${p.correct}/${p.answered}` : 'placement'}</span><span class="small muted">priority ${Math.round(combined*100)}</span></div>`;
  }).join('');
  target.insertAdjacentHTML('afterend', `<section class="card extension-card" data-extension-root="performance" style="margin-top:18px"><div class="eyebrow">Observed learning profile</div><h2 style="margin:8px 0 14px">Placement is no longer the only signal.</h2><p class="muted">Checked lesson answers update skill evidence. With more answers, real performance receives more weight in recommendations.</p>${rows}</section>`);
}

function renderRepairRoute(core, adaptive) {
  const match = location.hash.match(/^#\/lesson\/(VG0[1-3])$/);
  if (!match) return;
  const lesson = REPAIR_LESSONS.find(x => x.id === match[1]);
  const main = document.querySelector('#main');
  if (!lesson || !main || main.dataset.extLesson === lesson.id) return;
  const progress = adaptive.repairProgress?.[lesson.id] || { answers:{} };
  main.dataset.extLesson = lesson.id;
  main.innerHTML = `<article class="lesson-shell extension-lesson"><div class="lesson-top"><button class="btn ghost small-btn" data-nav="improve">← Improve</button><div class="eyebrow" style="margin-top:20px">${skillLabel(lesson.skill)} · Repair</div><h1 class="lesson-title">${esc(lesson.title)}</h1><div class="meta"><span>${lesson.cefr}</span><span>${lesson.estimatedMinutes} min</span><span>Difficulty ${lesson.difficulty}/5</span>${progress.completed?'<span class="chip success">Completed</span>':''}</div><p class="lede">${esc(lesson.objective)}</p></div>
    <section class="lesson-section"><h2>1. Learn</h2>${lesson.learn.map(x=>`<p>${esc(x)}</p>`).join('')}<div class="callout"><strong>Notice these patterns</strong><br>${lesson.examples.map(esc).join(' · ')}</div></section>
    <section class="lesson-section"><h2>2. Guided Practice</h2>${lesson.questions.map((q,i)=>repairQuestionHTML(lesson,q,i,progress.answers?.[i])).join('')}</section>
    <section class="lesson-section"><h2>3. Review and reuse</h2><p>Explain the rule in your own words, then produce one new example before leaving the lesson.</p><textarea class="text-area" data-ext-repair-note="${lesson.id}" placeholder="My own example...">${esc(progress.note || '')}</textarea></section>
    <section class="lesson-section"><div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">Finish</div><h2 style="margin-top:6px">Repair → retry → review</h2></div><button class="btn primary" data-ext-action="complete-repair" data-repair-id="${lesson.id}">${progress.completed?'Completed ✓':'Mark repair complete'}</button></div></section></article>`;
}

function repairQuestionHTML(lesson, q, index, saved = {}) {
  return `<div class="quiz-card"><div class="q-title">${esc(q.prompt)}</div><div class="options">${q.options.map((o,i)=>`<button class="option ${saved.checked?(o===q.answer?'correct':o===saved.selected?'wrong':''):(o===saved.selected?'selected':'')}" data-ext-action="repair-option" data-repair-id="${lesson.id}" data-question-index="${index}" data-value="${esc(o)}" ${saved.checked?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div><button class="btn small-btn ${saved.checked?'soft':'primary'}" data-ext-action="repair-check" data-repair-id="${lesson.id}" data-question-index="${index}" ${!saved.selected||saved.checked?'disabled':''}>${saved.checked?'Checked':'Check'}</button>${saved.checked?`<div class="feedback ${saved.selected===q.answer?'correct':'wrong'}"><strong>${saved.selected===q.answer?'Correct':'Not yet'}</strong><br>${esc(q.rationale)}</div>`:''}</div>`;
}

function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; apply(); });
}

function apply() {
  if (applying) return;
  applying = true;
  try {
    const core = read(CORE_KEY);
    const adaptive = ensureAdaptive(core);
    computeSkillPerformance(core, adaptive);
    writeAdaptive(adaptive);
    renderAdaptiveToday(core, adaptive);
    injectVocabulary(core, adaptive);
    injectPerformance(core, adaptive);
    renderRepairRoute(core, adaptive);
  } finally { applying = false; }
}

function handleClick(event) {
  const openRepair = event.target.closest('[data-adaptive-action="open-repair"]');
  if (openRepair) {
    event.preventDefault(); event.stopImmediatePropagation();
    location.hash = `#/lesson/${openRepair.dataset.repairId}`;
    return;
  }
  const target = event.target.closest('[data-ext-action]');
  if (!target) return;
  const action = target.dataset.extAction;
  const core = read(CORE_KEY);
  const adaptive = ensureAdaptive(core);

  if (action === 'vocab-option') {
    const s = adaptive.vocabularySchedule[target.dataset.vocabId];
    if (!s?.checked) s.selected = target.dataset.value;
  }
  if (action === 'vocab-check') {
    const item = VOCABULARY_ITEMS.find(x => x.id === target.dataset.vocabId);
    const s = adaptive.vocabularySchedule[item.id];
    if (s?.selected) { s.checked = true; s.lastCorrect = s.selected === item.answer; }
  }
  if (action === 'vocab-rate') {
    const id = target.dataset.vocabId;
    const rating = VOCAB_REVIEW_RATINGS[target.dataset.rating];
    const s = adaptive.vocabularySchedule[id];
    const prev = s.intervalDays || 1;
    const days = Math.max(rating.minDays, Math.round(prev * rating.multiplier));
    s.intervalDays = days; s.dueAt = Date.now() + days * DAY; s.attempts = (s.attempts || 0) + 1; s.lastRating = target.dataset.rating; s.selected = null; s.checked = false;
    adaptive.vocabularyHistory.push({ ts:Date.now(), id, rating:target.dataset.rating, nextDays:days });
  }
  if (action === 'repair-option') {
    const id = target.dataset.repairId; const i = Number(target.dataset.questionIndex);
    adaptive.repairProgress[id] ||= { answers:{} }; adaptive.repairProgress[id].answers ||= {};
    adaptive.repairProgress[id].answers[i] = { selected:target.dataset.value, checked:false };
  }
  if (action === 'repair-check') {
    const id = target.dataset.repairId; const i = Number(target.dataset.questionIndex);
    const saved = adaptive.repairProgress?.[id]?.answers?.[i]; if (saved?.selected) saved.checked = true;
  }
  if (action === 'complete-repair') {
    const id = target.dataset.repairId;
    adaptive.repairProgress[id] ||= { answers:{} };
    adaptive.repairProgress[id].completed = true; adaptive.repairProgress[id].completedAt = Date.now();
    const lesson = REPAIR_LESSONS.find(x => x.id === id);
    adaptive.learningHistory.push({ ts:Date.now(), type:'repair-complete', lessonId:id, skill:lesson?.skill });
  }
  writeAdaptive(adaptive);
  scheduleApply();
}

function handleInput(event) {
  const note = event.target.closest('[data-ext-repair-note]');
  if (!note) return;
  const core = read(CORE_KEY); const adaptive = ensureAdaptive(core); const id = note.dataset.extRepairNote;
  adaptive.repairProgress[id] ||= { answers:{} }; adaptive.repairProgress[id].note = note.value; writeAdaptive(adaptive);
}

document.addEventListener('click', handleClick, true);
document.addEventListener('input', handleInput);
window.addEventListener('hashchange', scheduleApply);
window.addEventListener('ielts-adaptive-state-change', scheduleApply);
new MutationObserver(scheduleApply).observe(document.querySelector('#app'), { childList:true, subtree:true });
scheduleApply();
