import { QUESTION_TYPE_LABS } from './question-type-lab-v1.js';

const CORE_KEY = 'ielts-self-learning-v1';
const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const readCore = () => { try { return JSON.parse(localStorage.getItem(CORE_KEY) || '{}'); } catch { return {}; } };

function injectLab() {
  if (!location.hash.includes('/ielts') || document.querySelector('[data-question-type-lab-index]')) return;
  const main = document.querySelector('#main');
  if (!main) return;
  const completed = new Set(readCore().completedLessons || []);
  const done = QUESTION_TYPE_LABS.filter(l => completed.has(l.id)).length;
  const cards = QUESTION_TYPE_LABS.map(l => `<article class="card lesson-card clickable">
    <div class="cluster"><div class="lesson-icon">${l.skill === 'reading' ? 'R' : 'L'}</div><span class="chip ${completed.has(l.id)?'success':'warning'}">${completed.has(l.id)?'Completed':'Question Type Lab'}</span></div>
    <div><h3>${esc(l.title.replace('Question Type Lab: ',''))}</h3><p class="muted" style="margin-top:8px">${esc(l.description)}</p></div>
    <div class="meta"><span>${l.cefr}</span><span>${l.estimatedMinutes} min</span><span>${esc(l.questionType)}</span></div>
    <footer><div class="small muted">${esc(l.objective)}</div><button class="btn soft" data-lesson="${l.id}">${completed.has(l.id)?'Review lab':'Open lab'}</button></footer>
  </article>`).join('');
  const section = document.createElement('section');
  section.dataset.questionTypeLabIndex = 'true';
  section.style.marginTop = '24px';
  section.innerHTML = `<div class="page-head" style="margin-bottom:14px"><div><div class="eyebrow">Question Type Lab · V1</div><h2>Train one exam decision at a time.</h2><p class="muted">These labs are separate from the 30-unit core curriculum. They reuse the same Error → Repair → Retry → Review system.</p></div><div><span class="chip primary">${done}/${QUESTION_TYPE_LABS.length} complete</span></div></div><div class="grid two">${cards}</div>`;
  const strategy = document.querySelector('[data-ielts-strategy-index]');
  if (strategy) strategy.insertAdjacentElement('afterend', section);
  else main.appendChild(section);
}

function apply(){ injectLab(); }
window.addEventListener('hashchange', () => setTimeout(apply, 0));
document.addEventListener('click', () => setTimeout(apply, 80));
new MutationObserver(apply).observe(document.documentElement, { childList:true, subtree:true });
setTimeout(apply, 0);
