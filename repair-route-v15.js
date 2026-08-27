import './repair-registry-v15.js';
import { REPAIR_LESSONS } from './adaptive-data.js';
import { repairReadyToComplete } from './repair-retry-v1.js';
import { registerRenderEnhancement } from './render-lifecycle-v15.js';

const ADAPTIVE_KEY = 'ielts-adaptive-v1';

function readAdaptive() {
  try { return JSON.parse(localStorage.getItem(ADAPTIVE_KEY) || '{}'); }
  catch { return {}; }
}
function esc(value = '') {
  return String(value).replace(/[&<>'\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '\"':'&quot;' }[c]));
}
function skillLabel(skill) {
  return ({ vocabulary:'Vocabulary', grammar:'Grammar' })[skill] || skill;
}
function questionHTML(lesson, question, index, saved = {}) {
  const correct = saved.checked && saved.selected === question.answer;
  return `<div class="quiz-card"><div class="q-title">${esc(question.prompt)}</div><div class="options">${question.options.map((option,i)=>`<button class="option ${saved.checked ? (option===question.answer?'correct':(option===saved.selected?'wrong':'')) : (option===saved.selected?'selected':'')}" data-lrv="repair-option" data-rid="${lesson.id}" data-q="${index}" data-value="${esc(option)}" ${saved.checked?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(option)}</span></button>`).join('')}</div><div class="cluster"><button class="btn small-btn ${saved.checked?'soft':'primary'}" data-lrv="repair-check" data-rid="${lesson.id}" data-q="${index}" ${!saved.selected||saved.checked?'disabled':''}>${saved.checked?'Checked':'Check'}</button>${saved.checked&&!correct?`<button class="btn primary small-btn" data-lrv="repair-retry" data-rid="${lesson.id}" data-q="${index}">Retry</button>`:''}</div>${saved.checked?`<div class="feedback ${correct?'correct':'wrong'}"><strong>${correct?'Correct':'Not yet'}</strong><br>${esc(question.rationale)}</div>`:''}</div>`;
}

function evidenceHTML(lesson) {
  if (!lesson.evidence) return '';
  return `<div class="callout"><strong>Why this repair exists</strong><br>${lesson.evidence.auditedQuestions} tagged questions in the ${esc(lesson.evidence.auditDate)} bank audit belong to the ${esc(lesson.evidence.family)} family.</div>`;
}

function renderRepairRoute() {
  const match = location.hash.match(/^#\/lesson\/(VG\d+)$/);
  if (!match) return;
  const main = document.querySelector('#main');
  if (!main) return;
  const lesson = REPAIR_LESSONS.find(item => item.id === match[1]);
  if (!lesson) return;
  const adaptive = readAdaptive();
  const progress = adaptive.repairProgress?.[lesson.id] || { answers:{} };
  const ready = repairReadyToComplete(lesson, progress);
  const fingerprint = `${lesson.id}|${JSON.stringify(progress)}`;
  const liveRoute = main.querySelector(`[data-v15-repair-route="${lesson.id}"]`);
  if (main.dataset.v15RepairFingerprint === fingerprint && liveRoute) return;
  main.dataset.runtimeLesson = lesson.id;
  main.dataset.v15RepairFingerprint = fingerprint;
  const subtype = lesson.evidence ? 'Error-driven Repair' : 'Repair';
  main.innerHTML = `<article class="lesson-shell extension-lesson" data-v15-repair-route="${lesson.id}"><div class="lesson-top"><button class="btn ghost small-btn" data-nav="improve">← Improve</button><div class="eyebrow" style="margin-top:20px">${skillLabel(lesson.skill)} · ${subtype}</div><h1 class="lesson-title">${esc(lesson.title)}</h1><div class="meta"><span>${lesson.cefr}</span><span>${lesson.estimatedMinutes} min</span><span>Difficulty ${lesson.difficulty}/5</span>${progress.completed?'<span class="chip success">Completed</span>':''}</div><p class="lede">${esc(lesson.objective)}</p>${evidenceHTML(lesson)}</div><section class="lesson-section"><h2>1. Learn</h2>${lesson.learn.map(item=>`<p>${esc(item)}</p>`).join('')}<div class="callout"><strong>Notice these patterns</strong><br>${lesson.examples.map(esc).join(' · ')}</div></section><section class="lesson-section"><h2>2. Guided Practice</h2>${lesson.questions.map((q,i)=>questionHTML(lesson,q,i,progress.answers?.[i])).join('')}</section><section class="lesson-section"><h2>3. Review and reuse</h2><p>Explain the rule in your own words, then make one new example.</p><textarea class="text-area" data-runtime-note="${lesson.id}" placeholder="My own example...">${esc(progress.note||'')}</textarea></section><section class="lesson-section"><div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">Finish</div><h2 style="margin-top:6px">Repair → retry → review</h2><p class="small muted">${progress.completed?'Repair evidence saved.':ready?'All guided-practice checks are correct.':'Complete every guided-practice item correctly before finishing.'}</p></div><button class="btn primary" data-lrv="repair-complete" data-rid="${lesson.id}" ${!ready||progress.completed?'disabled':''}>${progress.completed?'Completed ✓':'Mark repair complete'}</button></div></section></article>`;
}

renderRepairRoute();
registerRenderEnhancement(renderRepairRoute);
