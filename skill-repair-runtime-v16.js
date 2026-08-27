import { repairMatchesError } from './adaptive-data.js';
import { repairReadyToComplete } from './repair-retry-v1.js';
import { registerRenderEnhancement } from './render-lifecycle-v15.js';
import { V16_SKILL_REPAIR_LESSONS } from './skill-repair-registry-v16.js';

const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch { return {}; }
}
function esc(value = '') {
  return String(value).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
}
function activeErrors(core) {
  const fixed = new Set(core.fixedErrors || []);
  return (core.errors || []).filter(error => error?.id && !fixed.has(error.id));
}
function matchCount(lesson, errors) {
  return errors.filter(error => repairMatchesError(lesson, error)).length;
}
function icon(skill) {
  return skill === 'reading' ? 'R' : skill === 'listening' ? 'L' : '↗';
}
function lessonCards(core, adaptive) {
  const errors = activeErrors(core);
  return V16_SKILL_REPAIR_LESSONS.map(lesson => {
    const matches = matchCount(lesson, errors);
    const completed = adaptive.repairProgress?.[lesson.id]?.completed;
    return { lesson, matches, completed };
  }).sort((a, b) => b.matches - a.matches || a.lesson.id.localeCompare(b.lesson.id));
}

function learnHTML(rows, fingerprint) {
  return `<section data-v16-skill-repair-learn data-runtime-fingerprint="${esc(fingerprint)}" style="margin-top:28px"><div class="page-head" style="margin-bottom:16px"><div><div class="eyebrow">Reading & Listening Skill Repair</div><h2>Repair recurring comprehension and test-execution patterns.</h2><p class="muted">These units are separate from Vocabulary & Grammar Repair and do not change the 30-unit core denominator.</p></div></div><div class="grid two repair-learn-grid">${rows.map(({lesson,completed})=>`<article class="card lesson-card"><div class="cluster"><div class="lesson-icon">${icon(lesson.skill)}</div><span class="chip ${completed?'success':'warning'}">${completed?'Completed':'Skill Repair'}</span></div><div><h3>${esc(lesson.title)}</h3><p class="muted" style="margin-top:8px">${esc(lesson.objective)}</p></div><div class="meta"><span>${esc(lesson.cefr)}</span><span>${lesson.estimatedMinutes} min</span><span>Difficulty ${lesson.difficulty}/5</span></div><footer><div class="small muted">${lesson.evidence.auditedQuestions} audited ${esc(lesson.evidence.family)} signals.</div><button class="btn soft" data-lesson="${lesson.id}">${completed?'Review':'Open'}</button></footer></article>`).join('')}</div></section>`;
}

function improveHTML(rows, fingerprint) {
  const totalMatches = rows.reduce((sum, row) => sum + row.matches, 0);
  return `<section class="card adaptive-card" data-v16-skill-repair-improve data-runtime-fingerprint="${esc(fingerprint)}"><div class="adaptive-top"><div><div class="eyebrow">Reading & Listening Skill Repair</div><h2>${totalMatches ? 'Target the process behind repeated errors' : 'No active skill-repair signal yet'}</h2></div><span class="chip primary">Evidence-driven</span></div><p class="muted">Generic Full Mock tags are matched with the question skill, so a Reading main-idea error cannot recommend a Listening unit and a Listening number error cannot recommend a Reading unit.</p><div class="repair-grid">${rows.map(({lesson,matches,completed})=>`<article class="repair-card"><div class="cluster"><span class="chip">${lesson.id}</span>${matches?`<span class="chip warning">${matches} active match${matches===1?'':'es'}</span>`:''}</div><h3>${esc(lesson.title)}</h3><p class="muted">${esc(lesson.objective)}</p><div class="meta"><span>${esc(lesson.skill === 'reading' ? 'Reading' : 'Listening')}</span><span>${lesson.estimatedMinutes} min</span><span>${lesson.evidence.auditedQuestions} audit signals</span></div><button class="btn soft" data-lesson="${lesson.id}">${completed?'Review skill repair':'Open skill repair'}</button></article>`).join('')}</div></section>`;
}

function renderLearn(core, adaptive) {
  if (!location.hash.includes('/learn')) return;
  const rows = lessonCards(core, adaptive);
  const fingerprint = rows.map(row => `${row.lesson.id}:${row.completed?1:0}`).join('|');
  const existing = document.querySelector('[data-v16-skill-repair-learn]');
  if (existing?.dataset.runtimeFingerprint === fingerprint) return;
  const html = learnHTML(rows, fingerprint);
  if (existing) { existing.outerHTML = html; return; }
  const baseRepair = document.querySelector('[data-repair-learn-index]');
  if (baseRepair) { baseRepair.insertAdjacentHTML('afterend', html); return; }
  const main = document.querySelector('#main');
  if (main) main.insertAdjacentHTML('beforeend', html);
}

function renderImprove(core, adaptive) {
  if (!location.hash.includes('/improve')) return;
  const rows = lessonCards(core, adaptive);
  const fingerprint = rows.map(row => `${row.lesson.id}:${row.matches}:${row.completed?1:0}`).join('|');
  const existing = document.querySelector('[data-v16-skill-repair-improve]');
  if (existing?.dataset.runtimeFingerprint === fingerprint) return;
  const html = improveHTML(rows, fingerprint);
  if (existing) { existing.outerHTML = html; return; }
  const baseRepair = document.querySelector('[data-adaptive-root="repair"]');
  if (baseRepair) baseRepair.insertAdjacentHTML('afterend', html);
}

function renderSkillRepairSurfaces() {
  const core = read(CORE_KEY);
  const adaptive = read(ADAPTIVE_KEY);
  renderLearn(core, adaptive);
  renderImprove(core, adaptive);
}

function handleCompletion(event) {
  const button = event.target.closest('[data-lrv="repair-complete"]');
  if (!button) return;
  const lesson = V16_SKILL_REPAIR_LESSONS.find(item => item.id === button.dataset.rid);
  if (!lesson) return;
  const adaptive = read(ADAPTIVE_KEY);
  adaptive.repairProgress ||= {};
  adaptive.learningHistory ||= [];
  const progress = adaptive.repairProgress[lesson.id] ||= { answers:{} };
  if (!repairReadyToComplete(lesson, progress) || progress.completed) return;
  progress.completed = true;
  progress.completedAt = Date.now();
  adaptive.learningHistory.push({ ts:Date.now(), type:'repair-complete', lessonId:lesson.id, skill:lesson.skill });
  localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(adaptive));
  window.dispatchEvent(new CustomEvent('ielts-adaptive-state-change'));
}

if (typeof document !== 'undefined') document.addEventListener('click', handleCompletion);
renderSkillRepairSurfaces();
registerRenderEnhancement(renderSkillRepairSurfaces);
