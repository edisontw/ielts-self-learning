import { LESSONS } from './data.js';
import { CORE_LESSON_META, REPAIR_LESSONS, RECOMMENDATION_WEIGHTS } from './adaptive-data.js';
import { VOCABULARY_ITEMS, VOCAB_REVIEW_RATINGS } from './learning-extension-data.js';
import { repairReadyToComplete, resetRepairAnswer } from './repair-retry-v1.js';
import { registerRenderEnhancement } from './render-lifecycle-v15.js';

const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const DAY = 86400000;
let applying = false;

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch { return {}; }
}
function saveAdaptive(state) {
  const next = JSON.stringify(state);
  if (localStorage.getItem(ADAPTIVE_KEY) !== next) localStorage.setItem(ADAPTIVE_KEY, next);
}
function esc(value = '') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function label(skill) { return ({reading:'Reading',listening:'Listening',writing:'Writing',speaking:'Speaking',vocabulary:'Vocabulary',grammar:'Grammar','learning-better':'Learning Better'})[skill] || skill; }

function eligibleVocabulary(core, adaptive) {
  const done = new Set(core.completedLessons || []);
  const repaired = new Set(Object.entries(adaptive.repairProgress || {}).filter(([,v]) => v?.completed).map(([id]) => id));
  return VOCABULARY_ITEMS.filter(item => done.has(item.sourceLesson) || repaired.has(item.sourceLesson));
}
function ensureAdaptive(core, adaptive = read(ADAPTIVE_KEY)) {
  adaptive.reviewSchedule ||= {};
  adaptive.repairProgress ||= {};
  adaptive.reviewHistory ||= [];
  adaptive.vocabularySchedule ||= {};
  adaptive.vocabularyHistory ||= [];
  adaptive.skillPerformance ||= {};
  adaptive.learningHistory ||= [];
  for (const item of eligibleVocabulary(core, adaptive)) {
    adaptive.vocabularySchedule[item.id] ||= { dueAt: Date.now(), intervalDays: 0, attempts: 0, selected: null, checked: false, lastCorrect: null, lastRating: null };
  }
  return adaptive;
}

const quizMap = new Map();
for (const lesson of LESSONS) {
  for (const section of lesson.sections || []) {
    for (const block of section.blocks || []) {
      if (block.type === 'quiz') quizMap.set(block.id, { lesson, block });
    }
  }
}

function updatePerformance(core, adaptive) {
  const stats = {};
  const add = (skill, correct) => {
    stats[skill] ||= { answered: 0, correct: 0 };
    stats[skill].answered += 1;
    if (correct) stats[skill].correct += 1;
  };
  for (const [id, answer] of Object.entries(core.lessonAnswers || {})) {
    if (!answer?.checked) continue;
    const found = quizMap.get(id);
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
  for (const [skill, stat] of Object.entries(stats)) {
    const previous = adaptive.skillPerformance[skill];
    if (previous?.answered === stat.answered && previous?.correct === stat.correct) continue;
    adaptive.skillPerformance[skill] = {
      ...stat,
      accuracy: stat.correct / stat.answered,
      confidence: stat.answered >= 8 ? 'Moderate' : stat.answered >= 4 ? 'Emerging' : 'Low',
      updatedAt: Date.now()
    };
  }
}

function baseWeakness(core, skill) {
  const p = core.profile?.placementSections || {};
  if (['reading','listening','vocabulary','grammar'].includes(skill)) return p[skill] == null ? 0.45 : (6 - p[skill]) / 6;
  if (skill === 'writing') {
    const grammar = p.grammar == null ? 0.45 : (6 - p.grammar) / 6;
    const vocab = p.vocabulary == null ? 0.45 : (6 - p.vocabulary) / 6;
    return Math.max(grammar, vocab) * 0.85 + 0.15;
  }
  if (skill === 'speaking') return 0.55;
  return 0.35;
}
function combinedWeakness(core, adaptive, skill) {
  const base = baseWeakness(core, skill);
  const perf = adaptive.skillPerformance?.[skill];
  if (!perf?.answered) return base;
  const actual = 1 - perf.accuracy;
  const actualWeight = perf.answered >= 8 ? 0.65 : perf.answered >= 4 ? 0.45 : 0.25;
  return base * (1 - actualWeight) + actual * actualWeight;
}
function dueErrors(core, adaptive) {
  const now = Date.now();
  return (core.errors || []).filter(error => (adaptive.reviewSchedule?.[error.id]?.dueAt ?? error.ts ?? now) <= now);
}
function dueVocabulary(core, adaptive) {
  const now = Date.now();
  const eligible = new Set(eligibleVocabulary(core, adaptive).map(x => x.id));
  return VOCABULARY_ITEMS.filter(item => eligible.has(item.id) && (adaptive.vocabularySchedule?.[item.id]?.dueAt || 0) <= now);
}
function recentCounts(core, adaptive) {
  const since = Date.now() - 7 * DAY;
  const out = { reading:0, listening:0, writing:0, speaking:0, vocabulary:0, grammar:0, 'learning-better':0 };
  const byId = new Map([...CORE_LESSON_META, ...REPAIR_LESSONS].map(x => [x.id, x.skill]));
  for (const row of core.studyHistory || []) {
    if ((row.ts || 0) < since) continue;
    const skill = byId.get(row.lessonId);
    if (skill && out[skill] != null) out[skill] += 1;
  }
  for (const row of adaptive.learningHistory || []) {
    if ((row.ts || 0) >= since && row.skill && out[row.skill] != null) out[row.skill] += 1;
  }
  return out;
}
function candidates() { return [...CORE_LESSON_META, ...REPAIR_LESSONS.map(x => ({...x, targetRelevance: x.skill === 'grammar' ? 0.8 : 0.75}))]; }
function scoreCandidate(core, adaptive, lesson) {
  const counts = recentCounts(core, adaptive);
  const weakness = combinedWeakness(core, adaptive, lesson.skill);
  const dueForSkill = dueErrors(core, adaptive).filter(x => x.skill === lesson.skill).length;
  const dueReview = Math.min(1, dueForSkill / 2);
  const exposure = counts[lesson.skill] || 0;
  const skillBalance = exposure >= 2 ? 0 : (exposure === 1 ? 0.55 : 1);
  const recDifficulty = Number(core.profile?.recommendedDifficulty || 3);
  const difficultyMatch = Math.max(0, 1 - Math.abs(recDifficulty - lesson.difficulty) / 3);
  const available = Number(core.study?.preferredMinutes || 20);
  const timeMatch = lesson.estimatedMinutes <= available ? 1 : Math.max(0.15, available / lesson.estimatedMinutes);
  const recent = [...(core.studyHistory || []), ...(adaptive.learningHistory || [])].slice(-6).some(x => x.lessonId === lesson.id);
  const b = {
    weakness: weakness * RECOMMENDATION_WEIGHTS.weakness,
    dueReview: dueReview * RECOMMENDATION_WEIGHTS.dueReview,
    targetRelevance: lesson.targetRelevance * RECOMMENDATION_WEIGHTS.targetRelevance,
    skillBalance: skillBalance * RECOMMENDATION_WEIGHTS.skillBalance,
    difficultyMatch: difficultyMatch * RECOMMENDATION_WEIGHTS.difficultyMatch,
    timeMatch: timeMatch * RECOMMENDATION_WEIGHTS.timeMatch,
    recentPenalty: recent ? RECOMMENDATION_WEIGHTS.recentRepetitionPenalty : 0
  };
  return { lesson, b, score: b.weakness + b.dueReview + b.targetRelevance + b.skillBalance + b.difficultyMatch + b.timeMatch - b.recentPenalty };
}

function renderToday(core, adaptive) {
  const root = document.querySelector('[data-adaptive-root="today"]');
  if (!root) return;
  if (!core.placement) { root.hidden = true; return; }
  root.hidden = false;
  const errors = dueErrors(core, adaptive);
  const vocab = dueVocabulary(core, adaptive);
  let html;
  let fingerprint;
  if (errors.length || vocab.length) {
    fingerprint = `review-${errors.length}-${vocab.length}`;
    html = `<div class="adaptive-top"><div><div class="eyebrow">Adaptive Today · retrieval first</div><h2>${errors.length + vocab.length} review item${errors.length + vocab.length === 1 ? '' : 's'} due</h2></div><span class="chip warning">Spaced review</span></div><p class="muted">${errors.length} saved error${errors.length === 1 ? '' : 's'} · ${vocab.length} vocabulary item${vocab.length === 1 ? '' : 's'}. Due retrieval comes before new material.</p><div class="cluster"><button class="btn primary" data-nav="improve">Open Review Queue</button><span class="small muted">≈ ${Math.min(12, Math.max(3, (errors.length + vocab.length) * 2))} min</span></div>`;
  } else {
    const rec = candidates().map(l => scoreCandidate(core, adaptive, l)).sort((a,b) => b.score - a.score)[0];
    const b = rec.b;
    fingerprint = `lesson-${rec.lesson.id}-${Math.round(rec.score)}-${Object.values(adaptive.skillPerformance).map(x=>`${x.answered}:${x.correct}`).join('|')}`;
    html = `<div class="adaptive-top"><div><div class="eyebrow">Adaptive Today · placement + real performance</div><h2>${esc(rec.lesson.title)}</h2></div><span class="score-badge">${Math.round(rec.score)}</span></div><p class="muted">Placement starts the profile. Checked lesson answers receive more weight as evidence accumulates.</p><div class="adaptive-breakdown"><span>Weakness ${Math.round(b.weakness)}</span><span>Review ${Math.round(b.dueReview)}</span><span>Target ${Math.round(b.targetRelevance)}</span><span>Balance ${Math.round(b.skillBalance)}</span><span>Difficulty ${Math.round(b.difficultyMatch)}</span><span>Time ${Math.round(b.timeMatch)}</span>${b.recentPenalty ? `<span class="penalty">Recent −${Math.round(b.recentPenalty)}</span>` : ''}</div><div class="cluster"><button class="btn primary" data-lesson="${rec.lesson.id}">Start recommended lesson</button><span class="small muted">${rec.lesson.estimatedMinutes} min · ${label(rec.lesson.skill)} · Difficulty ${rec.lesson.difficulty}/5</span></div>`;
  }
  if (root.dataset.runtimeFingerprint !== fingerprint) {
    root.dataset.runtimeFingerprint = fingerprint;
    root.innerHTML = html;
  }
}

function vocabCard(item, schedule) {
  const options = [item.answer, ...item.distractors];
  return `<article class="vocab-card"><div class="cluster"><span class="chip">${item.sourceLesson}</span><span class="small muted">${esc(item.meaning)}</span></div><strong>${esc(item.prompt)}</strong><div class="options">${options.map((o,i)=>`<button class="option ${schedule.checked ? (o===item.answer?'correct':(o===schedule.selected?'wrong':'')) : (o===schedule.selected?'selected':'')}" data-lrv="vocab-option" data-id="${item.id}" data-value="${esc(o)}" ${schedule.checked?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div><button class="btn small-btn ${schedule.checked?'soft':'primary'}" data-lrv="vocab-check" data-id="${item.id}" ${!schedule.selected||schedule.checked?'disabled':''}>${schedule.checked?'Checked':'Check'}</button>${schedule.checked ? `<div class="feedback ${schedule.lastCorrect?'correct':'wrong'}"><strong>${schedule.lastCorrect?'Correct':'Review the chunk'}</strong><br>${esc(item.term)} · ${esc(item.collocations.join(' · '))}</div><div class="rating-row"><span class="small muted">Next review:</span>${Object.entries(VOCAB_REVIEW_RATINGS).map(([key,r])=>`<button class="btn ghost small-btn" data-lrv="vocab-rate" data-id="${item.id}" data-rating="${key}">${r.label}</button>`).join('')}</div>` : ''}</article>`;
}
function injectVocabulary(core, adaptive) {
  if (!location.hash.includes('/improve') || document.querySelector('[data-runtime-root="vocab"]')) return;
  const anchor = document.querySelector('[data-adaptive-root="repair"]') || document.querySelector('[data-adaptive-root="review"]');
  if (!anchor) return;
  const eligible = eligibleVocabulary(core, adaptive);
  const now = Date.now();
  const due = eligible.filter(x => (adaptive.vocabularySchedule[x.id]?.dueAt || 0) <= now);
  const later = eligible.filter(x => (adaptive.vocabularySchedule[x.id]?.dueAt || 0) > now);
  const body = due.length ? `<div class="vocab-stack">${due.slice(0,5).map(x => vocabCard(x, adaptive.vocabularySchedule[x.id])).join('')}</div>` : (eligible.length ? '<div class="empty-state"><strong>No vocabulary is due.</strong><p>Return when the next interval is ready.</p></div>' : '<div class="empty-state"><strong>No cards unlocked yet.</strong><p>Complete R01, L01, W01, or VG01 to seed lesson-based vocabulary review.</p></div>');
  const laterHTML = later.length ? `<details class="scheduled-reviews"><summary>${later.length} scheduled later</summary>${later.slice(0,8).map(x=>`<div class="scheduled-row"><span>${esc(x.term)}</span><span class="small muted">${new Date(adaptive.vocabularySchedule[x.id].dueAt).toLocaleDateString()}</span></div>`).join('')}</details>` : '';
  anchor.insertAdjacentHTML('afterend', `<section class="card extension-card" data-runtime-root="vocab"><div class="adaptive-top"><div><div class="eyebrow">Vocabulary Review</div><h2>${due.length ? `${due.length} due now` : (eligible.length ? 'Vocabulary is scheduled' : 'Build vocabulary from lessons')}</h2></div><span class="chip primary">Context → recall → reuse</span></div><p class="muted">Cards unlock from completed lessons. Review phrases and collocations in context.</p>${body}${laterHTML}</section>`);
}
function injectPerformance(core, adaptive) {
  if (!location.hash.includes('/progress') || document.querySelector('[data-runtime-root="performance"]')) return;
  const anchor = [...document.querySelectorAll('#main .card')].find(x => x.textContent.includes('Section profile'));
  if (!anchor) return;
  const rows = ['reading','listening','writing','speaking','vocabulary','grammar'].map(skill => {
    const p = adaptive.skillPerformance[skill];
    const base = baseWeakness(core, skill);
    const priority = combinedWeakness(core, adaptive, skill);
    const pct = p?.answered ? Math.round(p.accuracy * 100) : Math.round((1 - base) * 100);
    return `<div class="profile-row lx-profile"><strong>${label(skill)}</strong><div class="meter"><span style="width:${pct}%"></span></div><span>${p?.answered ? `${p.correct}/${p.answered}` : 'placement'}</span><span class="small muted">priority ${Math.round(priority*100)}</span></div>`;
  }).join('');
  anchor.insertAdjacentHTML('afterend', `<section class="card extension-card" data-runtime-root="performance" style="margin-top:18px"><div class="eyebrow">Observed learning profile</div><h2 style="margin:8px 0 14px">Real answers now update the profile.</h2><p class="muted">Placement remains the starting signal. Actual checked answers receive progressively more weight as evidence grows.</p>${rows}</section>`);
}

function apply() {
  if (applying) return;
  applying = true;
  try {
    const core = read(CORE_KEY);
    const adaptive = ensureAdaptive(core);
    updatePerformance(core, adaptive);
    saveAdaptive(adaptive);
    renderToday(core, adaptive);
    injectVocabulary(core, adaptive);
    injectPerformance(core, adaptive);
  } finally { applying = false; }
}

function handleClick(event) {
  const oldRepair = event.target.closest('[data-adaptive-action="open-repair"]');
  if (oldRepair) {
    event.preventDefault();
    event.stopImmediatePropagation();
    location.hash = `#/lesson/${oldRepair.dataset.repairId}`;
    return;
  }
  const target = event.target.closest('[data-lrv]');
  if (!target) return;
  const core = read(CORE_KEY);
  const adaptive = ensureAdaptive(core);
  const action = target.dataset.lrv;
  if (action === 'vocab-option') {
    const s = adaptive.vocabularySchedule[target.dataset.id];
    if (!s.checked) s.selected = target.dataset.value;
  } else if (action === 'vocab-check') {
    const item = VOCABULARY_ITEMS.find(x => x.id === target.dataset.id);
    const s = adaptive.vocabularySchedule[item.id];
    if (s.selected) { s.checked = true; s.lastCorrect = s.selected === item.answer; }
  } else if (action === 'vocab-rate') {
    const s = adaptive.vocabularySchedule[target.dataset.id];
    const rating = VOCAB_REVIEW_RATINGS[target.dataset.rating];
    const days = Math.max(rating.minDays, Math.round((s.intervalDays || 1) * rating.multiplier));
    Object.assign(s, { intervalDays: days, dueAt: Date.now() + days * DAY, attempts: (s.attempts || 0) + 1, lastRating: target.dataset.rating, selected: null, checked: false });
    adaptive.vocabularyHistory.push({ ts:Date.now(), id:target.dataset.id, rating:target.dataset.rating, nextDays:days });
  } else if (action === 'repair-option') {
    const id = target.dataset.rid;
    const index = Number(target.dataset.q);
    adaptive.repairProgress[id] ||= { answers:{} };
    adaptive.repairProgress[id].answers ||= {};
    adaptive.repairProgress[id].answers[index] = { selected:target.dataset.value, checked:false };
  } else if (action === 'repair-check') {
    const saved = adaptive.repairProgress?.[target.dataset.rid]?.answers?.[Number(target.dataset.q)];
    if (saved?.selected) saved.checked = true;
  } else if (action === 'repair-retry') {
    const id=target.dataset.rid;
    adaptive.repairProgress[id] ||= { answers:{} };
    resetRepairAnswer(adaptive.repairProgress[id],Number(target.dataset.q));
  } else if (action === 'repair-complete') {
    const id = target.dataset.rid;
    const lesson = REPAIR_LESSONS.find(x => x.id === id);
    adaptive.repairProgress[id] ||= { answers:{} };
    if (!repairReadyToComplete(lesson,adaptive.repairProgress[id])) return;
    adaptive.repairProgress[id].completed = true;
    adaptive.repairProgress[id].completedAt = Date.now();
    adaptive.learningHistory.push({ ts:Date.now(), type:'repair-complete', lessonId:id, skill:lesson?.skill });
  }
  saveAdaptive(adaptive);
  document.querySelector('[data-runtime-root="vocab"]')?.remove();
  document.querySelector('[data-runtime-root="performance"]')?.remove();
  apply();
}
function handleInput(event) {
  const note = event.target.closest('[data-runtime-note]');
  if (!note) return;
  const core = read(CORE_KEY);
  const adaptive = ensureAdaptive(core);
  adaptive.repairProgress[note.dataset.runtimeNote] ||= { answers:{} };
  adaptive.repairProgress[note.dataset.runtimeNote].note = note.value;
  saveAdaptive(adaptive);
}

document.addEventListener('click', handleClick, true);
document.addEventListener('input', handleInput);
registerRenderEnhancement(apply);
