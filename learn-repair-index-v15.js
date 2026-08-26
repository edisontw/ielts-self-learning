import './repair-registry-v15.js';
import { REPAIR_LESSONS } from './adaptive-data.js';
import { registerRenderEnhancement } from './render-lifecycle-v15.js';

const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

function adaptiveState() {
  try { return JSON.parse(localStorage.getItem(ADAPTIVE_KEY) || '{}'); }
  catch { return {}; }
}

function renderRepairIndex() {
  if (!location.hash.includes('/learn') || document.querySelector('[data-repair-learn-index]')) return;
  const main = document.querySelector('#main');
  if (!main) return;
  const note = [...main.querySelectorAll('.card.subtle')].find(x => x.textContent.includes('V1.2 scope'));
  const state = adaptiveState();
  const cards = REPAIR_LESSONS.map(lesson => {
    const completed = state.repairProgress?.[lesson.id]?.completed;
    return `<article class="card lesson-card"><div class="cluster"><div class="lesson-icon">${lesson.skill==='vocabulary'?'V':'G'}</div><span class="chip ${completed?'success':'warning'}">${completed?'Completed':'Repair'}</span></div><div><h3>${esc(lesson.title)}</h3><p class="muted" style="margin-top:8px">${esc(lesson.objective)}</p></div><div class="meta"><span>${lesson.cefr}</span><span>${lesson.estimatedMinutes} min</span><span>Difficulty ${lesson.difficulty}/5</span></div><footer><div class="small muted">Triggered by placement and error patterns.</div><button class="btn soft" data-lesson="${lesson.id}">${completed?'Review':'Open'}</button></footer></article>`;
  }).join('');
  const html = `<section data-repair-learn-index style="margin-top:28px"><div class="page-head" style="margin-bottom:16px"><div><div class="eyebrow">Vocabulary & Grammar Repair</div><h2>Short lessons when the data shows a gap.</h2></div></div><div class="grid three repair-learn-grid">${cards}</div></section>`;
  if (note) note.insertAdjacentHTML('beforebegin', html);
  else main.insertAdjacentHTML('beforeend', html);
}

// Initial #/learn loads should render immediately; subsequent app renders use the shared lifecycle.
renderRepairIndex();
registerRenderEnhancement(renderRepairIndex);
