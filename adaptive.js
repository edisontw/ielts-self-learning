import { CORE_LESSON_META, REPAIR_LESSONS, RECOMMENDATION_WEIGHTS, REVIEW_RATINGS } from './adaptive-data.js';

const STORAGE_KEY = 'ielts-self-learning-v1';
const DAY = 86400000;
let applying = false;
let repairModal = null;

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('ielts-adaptive-state-change'));
}

function ensureAdaptiveState(state) {
  state.errors ||= [];
  state.fixedErrors ||= [];
  state.completedLessons ||= [];
  state.studyHistory ||= [];
  state.profile ||= {};
  state.study ||= { preferredMinutes: 20 };
  state.reviewSchedule ||= {};
  state.repairProgress ||= {};
  for (const error of state.errors) {
    state.reviewSchedule[error.id] ||= {
      dueAt: error.ts || Date.now(),
      intervalDays: 0,
      attempts: 0,
      lastReviewedAt: null,
      lastRating: null
    };
  }
  return state;
}

function skillForLesson(id) {
  return CORE_LESSON_META.find(l => l.id === id)?.skill || null;
}

function sectionWeakness(state, skill) {
  const sections = state.profile?.placementSections || {};
  if (skill === 'reading') return sections.reading == null ? 0.45 : (6 - sections.reading) / 6;
  if (skill === 'listening') return sections.listening == null ? 0.45 : (6 - sections.listening) / 6;
  if (skill === 'writing') {
    const g = sections.grammar == null ? 0.45 : (6 - sections.grammar) / 6;
    const v = sections.vocabulary == null ? 0.45 : (6 - sections.vocabulary) / 6;
    return Math.max(g, v) * 0.85 + 0.15;
  }
  if (skill === 'speaking') return 0.55;
  return 0.35;
}

function dueReviewItems(state) {
  const now = Date.now();
  return state.errors
    .filter(error => !state.fixedErrors.includes(error.id) || (state.reviewSchedule?.[error.id]?.dueAt || 0) <= now)
    .map(error => ({ error, schedule: state.reviewSchedule?.[error.id] || { dueAt: error.ts || now, intervalDays: 0, attempts: 0 } }))
    .filter(item => item.schedule.dueAt <= now)
    .sort((a, b) => a.schedule.dueAt - b.schedule.dueAt);
}

function recentSkillCounts(state) {
  const since = Date.now() - 7 * DAY;
  const counts = { reading: 0, listening: 0, writing: 0, speaking: 0, 'learning-better': 0 };
  for (const item of state.studyHistory || []) {
    if ((item.ts || 0) < since) continue;
    const skill = item.lessonId ? skillForLesson(item.lessonId) : null;
    if (skill && counts[skill] != null) counts[skill]++;
  }
  return counts;
}

function scoreLesson(state, lesson) {
  const weights = RECOMMENDATION_WEIGHTS;
  const counts = recentSkillCounts(state);
  const weakness = sectionWeakness(state, lesson.skill);
  const dueForSkill = dueReviewItems(state).filter(x => x.error.skill === lesson.skill).length;
  const dueReview = Math.min(1, dueForSkill / 2);
  const exposure = counts[lesson.skill] || 0;
  const skillBalance = exposure >= 2 ? 0 : exposure === 1 ? 0.55 : 1;
  const recDifficulty = Number(state.profile?.recommendedDifficulty || 3);
  const difficultyMatch = Math.max(0, 1 - Math.abs(recDifficulty - lesson.difficulty) / 3);
  const minutes = Number(state.study?.preferredMinutes || 20);
  const timeMatch = lesson.estimatedMinutes <= minutes ? 1 : Math.max(0.15, minutes / lesson.estimatedMinutes);
  const recent = (state.studyHistory || []).slice(-5).some(x => x.lessonId === lesson.id);
  const breakdown = {
    weakness: weakness * weights.weakness,
    dueReview: dueReview * weights.dueReview,
    targetRelevance: lesson.targetRelevance * weights.targetRelevance,
    skillBalance: skillBalance * weights.skillBalance,
    difficultyMatch: difficultyMatch * weights.difficultyMatch,
    timeMatch: timeMatch * weights.timeMatch,
    recentPenalty: recent ? weights.recentRepetitionPenalty : 0
  };
  const score = breakdown.weakness + breakdown.dueReview + breakdown.targetRelevance + breakdown.skillBalance + breakdown.difficultyMatch + breakdown.timeMatch - breakdown.recentPenalty;
  return { lesson, score, breakdown };
}

function adaptiveRecommendation(state) {
  const due = dueReviewItems(state);
  if (due.length) return { type: 'review', due, score: 100 + Math.min(20, due.length * 2) };
  const ranked = CORE_LESSON_META.map(l => scoreLesson(state, l)).sort((a, b) => b.score - a.score);
  return { type: 'lesson', ...ranked[0], ranked };
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[ch]));
}

function prettySkill(skill) {
  return ({ reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', vocabulary: 'Vocabulary', grammar: 'Grammar', 'learning-better': 'Learning Better' })[skill] || skill;
}

function dueLabel(ts) {
  const diff = Math.round((ts - Date.now()) / DAY);
  if (diff <= 0) return 'Due now';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

function recommendationHTML(state) {
  const rec = adaptiveRecommendation(state);
  if (rec.type === 'review') {
    const first = rec.due[0].error;
    return `<section class="card adaptive-card" data-adaptive-root="today">
      <div class="adaptive-top"><div><div class="eyebrow">Adaptive Today · highest priority</div><h2>${rec.due.length} review item${rec.due.length === 1 ? '' : 's'} due</h2></div><span class="chip warning">Spaced review</span></div>
      <p class="muted">Review comes before new material because these errors are due now. Start with <strong>${esc(prettySkill(first.skill))}</strong>: ${esc(first.errorTag || 'saved error')}.</p>
      <div class="cluster"><button class="btn primary" data-nav="improve">Open Review Queue</button><span class="small muted">≈ ${Math.min(10, Math.max(3, rec.due.length * 2))} min</span></div>
    </section>`;
  }
  const b = rec.breakdown;
  return `<section class="card adaptive-card" data-adaptive-root="today">
    <div class="adaptive-top"><div><div class="eyebrow">Adaptive Today · weighted recommendation</div><h2>${esc(rec.lesson.title)}</h2></div><span class="score-badge">${Math.round(rec.score)}</span></div>
    <p class="muted">Selected from placement weakness, due review, IELTS relevance, weekly skill balance, difficulty, available time, and recent repetition.</p>
    <div class="adaptive-breakdown">
      <span>Weakness ${Math.round(b.weakness)}</span><span>Review ${Math.round(b.dueReview)}</span><span>Target ${Math.round(b.targetRelevance)}</span><span>Balance ${Math.round(b.skillBalance)}</span><span>Difficulty ${Math.round(b.difficultyMatch)}</span><span>Time ${Math.round(b.timeMatch)}</span>${b.recentPenalty ? `<span class="penalty">Recent −${Math.round(b.recentPenalty)}</span>` : ''}
    </div>
    <div class="cluster"><button class="btn primary" data-lesson="${rec.lesson.id}">Start recommended lesson</button><span class="small muted">${rec.lesson.estimatedMinutes} min · Difficulty ${rec.lesson.difficulty}/5</span></div>
  </section>`;
}

function reviewQueueHTML(state) {
  const due = dueReviewItems(state);
  const scheduled = state.errors.filter(e => !due.some(d => d.error.id === e.id)).map(error => ({ error, schedule: state.reviewSchedule?.[error.id] })).filter(x => x.schedule).sort((a,b)=>a.schedule.dueAt-b.schedule.dueAt);
  return `<section class="card adaptive-card" data-adaptive-root="review">
    <div class="adaptive-top"><div><div class="eyebrow">Review Queue</div><h2>${due.length ? `${due.length} due now` : 'You are caught up'}</h2></div><span class="chip ${due.length ? 'warning' : 'success'}">Spaced review V1</span></div>
    <p class="muted">Do not re-read the explanation first. Try to recall why the answer was wrong, reveal the answer, then rate the recall.</p>
    <div class="review-stack">
      ${due.length ? due.slice(0, 6).map(({ error, schedule }) => reviewItemHTML(error, schedule)).join('') : '<div class="empty-state"><strong>No reviews are due.</strong><p>New saved errors automatically enter the queue. Successful recall increases the interval.</p></div>'}
    </div>
    ${scheduled.length ? `<details class="scheduled-reviews"><summary>${scheduled.length} scheduled later</summary>${scheduled.slice(0,8).map(({error,schedule})=>`<div class="scheduled-row"><span>${esc(error.question)}</span><span class="small muted">${dueLabel(schedule.dueAt)}</span></div>`).join('')}</details>` : ''}
  </section>`;
}

function reviewItemHTML(error, schedule) {
  return `<article class="review-item" data-review-id="${esc(error.id)}">
    <div class="cluster"><span class="chip">${esc(prettySkill(error.skill))}</span><span class="chip warning">${esc(error.errorTag || 'error')}</span><span class="small muted">Attempt ${schedule.attempts || 0}</span></div>
    <strong>${esc(error.question)}</strong>
    <div class="recall-box">Before revealing the answer: explain what made your previous answer wrong.</div>
    <button class="btn soft small-btn" data-adaptive-action="reveal-review" data-error-id="${esc(error.id)}">Reveal answer</button>
    <div class="review-answer" data-review-answer="${esc(error.id)}" hidden>
      <div class="error-answer"><div><span class="small muted">Your old answer</span><br>${esc(error.myAnswer)}</div><div><span class="small muted">Correct answer</span><br>${esc(error.correctAnswer)}</div></div>
      <p class="muted">${esc(error.rationale || '')}</p>
      <div class="rating-row"><span class="small muted">How well did you recall it?</span>${Object.entries(REVIEW_RATINGS).map(([key,r])=>`<button class="btn ghost small-btn" data-adaptive-action="rate-review" data-error-id="${esc(error.id)}" data-rating="${key}">${r.label}</button>`).join('')}</div>
    </div>
  </article>`;
}

function suggestedRepairs(state) {
  const tags = state.errors.filter(e => !state.fixedErrors.includes(e.id)).map(e => e.errorTag).filter(Boolean);
  const sections = state.profile?.placementSections || {};
  return REPAIR_LESSONS.map(lesson => {
    let score = 0;
    score += tags.filter(t => lesson.triggerTags.includes(t)).length * 3;
    for (const skill of lesson.placementSkills) if (sections[skill] != null) score += Math.max(0, 4 - sections[skill]);
    return { lesson, score };
  }).sort((a,b)=>b.score-a.score);
}

function repairLessonsHTML(state) {
  const ranked = suggestedRepairs(state);
  return `<section class="card adaptive-card" data-adaptive-root="repair">
    <div class="adaptive-top"><div><div class="eyebrow">Repair Lessons</div><h2>Short lessons triggered by your data</h2></div><span class="chip primary">Vocabulary + Grammar</span></div>
    <div class="repair-grid">${ranked.map(({lesson,score},i)=>`<article class="repair-card"><div class="cluster"><span class="chip">${lesson.id}</span>${i===0&&score>0?'<span class="chip warning">Recommended</span>':''}</div><h3>${esc(lesson.title)}</h3><p class="muted">${esc(lesson.objective)}</p><div class="meta"><span>${lesson.cefr}</span><span>${lesson.estimatedMinutes} min</span><span>Difficulty ${lesson.difficulty}/5</span></div><button class="btn soft" data-adaptive-action="open-repair" data-repair-id="${lesson.id}">${state.repairProgress?.[lesson.id]?.completed ? 'Review repair lesson' : 'Open repair lesson'}</button></article>`).join('')}</div>
  </section>`;
}

function renderRepairModal(state) {
  document.querySelector('[data-adaptive-modal]')?.remove();
  if (!repairModal) return;
  const lesson = REPAIR_LESSONS.find(l => l.id === repairModal.id);
  if (!lesson) return;
  const answers = state.repairProgress?.[lesson.id]?.answers || {};
  const root = document.createElement('div');
  root.dataset.adaptiveModal = 'true';
  root.className = 'adaptive-modal-backdrop';
  root.innerHTML = `<div class="adaptive-modal" role="dialog" aria-modal="true">
    <div class="adaptive-top"><div><div class="eyebrow">${lesson.lessonType} · ${lesson.id}</div><h2>${esc(lesson.title)}</h2></div><button class="btn ghost" data-adaptive-action="close-repair">✕</button></div>
    <p class="lede">${esc(lesson.objective)}</p>
    <div class="repair-learn">${lesson.learn.map(x=>`<p>${esc(x)}</p>`).join('')}<div class="callout"><strong>Useful patterns</strong><br>${lesson.examples.map(esc).join(' · ')}</div></div>
    <div class="stack">${lesson.questions.map((q,idx)=>repairQuestionHTML(lesson, q, idx, answers[idx])).join('')}</div>
    <div class="cluster" style="margin-top:18px"><button class="btn primary" data-adaptive-action="complete-repair" data-repair-id="${lesson.id}">Mark repair complete</button><button class="btn soft" data-adaptive-action="close-repair">Close</button></div>
  </div>`;
  document.body.appendChild(root);
}

function repairQuestionHTML(lesson, q, idx, saved) {
  const checked = saved?.checked;
  return `<div class="quiz-card"><strong>${esc(q.prompt)}</strong><div class="options">${q.options.map((o,i)=>`<button class="option ${checked ? (o===q.answer?'correct':(o===saved?.selected?'wrong':'')) : (o===saved?.selected?'selected':'')}" data-adaptive-action="repair-option" data-repair-id="${lesson.id}" data-question-index="${idx}" data-value="${esc(o)}" ${checked?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div><button class="btn small-btn ${checked?'soft':'primary'}" data-adaptive-action="repair-check" data-repair-id="${lesson.id}" data-question-index="${idx}" ${!saved?.selected||checked?'disabled':''}>${checked?'Checked':'Check'}</button>${checked?`<div class="feedback ${saved.selected===q.answer?'correct':'wrong'}"><strong>${saved.selected===q.answer?'Correct':'Not yet'}</strong><br>${esc(q.rationale)}</div>`:''}</div>`;
}

function injectAdaptiveUI() {
  if (applying) return;
  applying = true;
  try {
    const state = ensureAdaptiveState(readState());
    writeStateSilently(state);
    const main = document.querySelector('#main');
    if (!main) return;
    const route = location.hash.replace(/^#\/?/, '') || 'today';
    if (route === 'today' && !main.querySelector('[data-adaptive-root="today"]')) {
      const focus = main.querySelector('.focus-card');
      if (focus) focus.insertAdjacentHTML('beforebegin', recommendationHTML(state));
      else main.querySelector('.page-head')?.insertAdjacentHTML('afterend', recommendationHTML(state));
    }
    if (route === 'improve') {
      const notebook = [...main.querySelectorAll('.card')].find(card => card.textContent.includes('Error Notebook'));
      if (notebook && !main.querySelector('[data-adaptive-root="review"]')) notebook.insertAdjacentHTML('beforebegin', reviewQueueHTML(state));
      if (notebook && !main.querySelector('[data-adaptive-root="repair"]')) notebook.insertAdjacentHTML('afterend', repairLessonsHTML(state));
    }
    renderRepairModal(state);
  } finally { applying = false; }
}

function writeStateSilently(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function rateReview(errorId, rating) {
  const state = ensureAdaptiveState(readState());
  const item = state.reviewSchedule[errorId];
  const rule = REVIEW_RATINGS[rating];
  if (!item || !rule) return;
  const nextDays = rule.nextDays(item.intervalDays || 0);
  item.intervalDays = nextDays;
  item.dueAt = Date.now() + nextDays * DAY;
  item.attempts = (item.attempts || 0) + 1;
  item.lastReviewedAt = Date.now();
  item.lastRating = rating;
  if (rule.mastery) {
    if (!state.fixedErrors.includes(errorId)) state.fixedErrors.push(errorId);
  } else {
    state.fixedErrors = state.fixedErrors.filter(id => id !== errorId);
  }
  state.studyHistory.push({ ts: Date.now(), type: 'error-review', errorId, rating, nextDays });
  writeState(state);
  showMiniToast(`Review saved · next in ${nextDays} day${nextDays===1?'':'s'}`);
  forceAppRefresh();
}

function showMiniToast(text) {
  const old = document.querySelector('.adaptive-toast');
  old?.remove();
  const el = document.createElement('div');
  el.className = 'adaptive-toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

function forceAppRefresh() {
  window.dispatchEvent(new Event('hashchange'));
  setTimeout(injectAdaptiveUI, 0);
}

function handleAdaptiveClick(event) {
  const el = event.target.closest('[data-adaptive-action]');
  if (!el) return;
  const action = el.dataset.adaptiveAction;
  if (action === 'reveal-review') {
    const box = document.querySelector(`[data-review-answer="${CSS.escape(el.dataset.errorId)}"]`);
    if (box) box.hidden = false;
  }
  if (action === 'rate-review') rateReview(el.dataset.errorId, el.dataset.rating);
  if (action === 'open-repair') { repairModal = { id: el.dataset.repairId }; injectAdaptiveUI(); }
  if (action === 'close-repair') { repairModal = null; renderRepairModal(ensureAdaptiveState(readState())); }
  if (action === 'repair-option') {
    const state = ensureAdaptiveState(readState());
    const id = el.dataset.repairId;
    const idx = Number(el.dataset.questionIndex);
    state.repairProgress[id] ||= { answers: {}, completed: false };
    state.repairProgress[id].answers ||= {};
    state.repairProgress[id].answers[idx] = { selected: el.dataset.value, checked: false };
    writeStateSilently(state);
    renderRepairModal(state);
  }
  if (action === 'repair-check') {
    const state = ensureAdaptiveState(readState());
    const id = el.dataset.repairId;
    const idx = Number(el.dataset.questionIndex);
    if (state.repairProgress?.[id]?.answers?.[idx]) state.repairProgress[id].answers[idx].checked = true;
    writeStateSilently(state);
    renderRepairModal(state);
  }
  if (action === 'complete-repair') {
    const state = ensureAdaptiveState(readState());
    const id = el.dataset.repairId;
    state.repairProgress[id] ||= { answers: {} };
    state.repairProgress[id].completed = true;
    state.repairProgress[id].completedAt = Date.now();
    state.studyHistory.push({ ts: Date.now(), type: 'repair-complete', lessonId: id });
    writeState(state);
    repairModal = null;
    showMiniToast('Repair lesson saved as complete');
    forceAppRefresh();
  }
}

document.addEventListener('click', handleAdaptiveClick);
window.addEventListener('hashchange', () => setTimeout(injectAdaptiveUI, 0));
window.addEventListener('ielts-adaptive-state-change', () => setTimeout(injectAdaptiveUI, 0));

const observer = new MutationObserver(() => {
  if (!applying) queueMicrotask(injectAdaptiveUI);
});
observer.observe(document.documentElement, { childList: true, subtree: true });

injectAdaptiveUI();
