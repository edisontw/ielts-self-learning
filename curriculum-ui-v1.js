import { LESSONS } from './data.js';
import { REPAIR_LESSONS } from './adaptive-data.js';

const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const ALL_30_IDS = [
  'LB01','LB02','LB03','LB04',
  'R01','R02','R03','R04','R05',
  'L01','L02','L03','L04','L05',
  'W01','W02','W03','W04','W05',
  'S01','S02','S03','S04','S05',
  'VG01','VG02','VG03',
  'I01','I02','I03'
];

const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };

function completedCount() {
  const core = read(CORE_KEY);
  const adaptive = read(ADAPTIVE_KEY);
  const done = new Set(core.completedLessons || []);
  for (const lesson of REPAIR_LESSONS) if (adaptive.repairProgress?.[lesson.id]?.completed) done.add(lesson.id);
  return ALL_30_IDS.filter(id => done.has(id)).length;
}

function injectIELTSStrategies(main) {
  if (document.querySelector('[data-ielts-strategy-index]')) return;
  const lessons = LESSONS.filter(l => l.skill === 'ielts-strategy');
  if (!lessons.length) return;
  const core = read(CORE_KEY);
  const completed = new Set(core.completedLessons || []);
  const cards = lessons.map(l => `<article class="card lesson-card clickable">
    <div class="cluster"><div class="lesson-icon">I</div><span class="chip ${completed.has(l.id)?'success':'primary'}">${completed.has(l.id)?'Completed':'IELTS Strategy'}</span></div>
    <div><h3>${esc(l.title)}</h3><p class="muted" style="margin-top:8px">${esc(l.description)}</p></div>
    <div class="meta"><span>${esc(l.cefr)}</span><span>IELTS ${esc(l.ieltsRange)}</span><span>${l.estimatedMinutes} min</span></div>
    <footer><div class="small muted">${esc(l.objective)}</div><button class="btn soft" data-lesson="${l.id}">${completed.has(l.id)?'Review':'Open'}</button></footer>
  </article>`).join('');
  const section = document.createElement('section');
  section.dataset.ieltsStrategyIndex = 'true';
  section.style.marginTop = '22px';
  section.innerHTML = `<div class="page-head" style="margin-bottom:14px"><div><div class="eyebrow">IELTS Strategy</div><h2>Use test knowledge to make better learning decisions.</h2><p class="muted">These units connect test structure, plateau diagnosis, and practice-test review to the Error → Repair → Retry loop.</p></div></div><div class="grid three">${cards}</div>`;
  const modeRule = [...main.querySelectorAll('section.card')].find(x => x.textContent.includes('Mode rule'));
  if (modeRule) modeRule.insertAdjacentElement('beforebegin', section); else main.appendChild(section);
}

function updateLearnScope(main) {
  const note = [...main.querySelectorAll('.card.subtle')].find(x => x.textContent.includes('V1.2 scope'));
  if (!note || note.dataset.curriculumUpdated) return;
  note.dataset.curriculumUpdated = 'true';
  note.innerHTML = `<strong>First 30-unit curriculum complete:</strong> Learning Better 4 · Reading 5 · Listening 5 · Writing 5 · Speaking 5 · Vocabulary/Grammar Repair 3 · IELTS Strategy 3. New units continue to use the same lesson renderer, adaptive metadata, Error Notebook, Repair, Review Queue, Vocabulary Review, and skill-performance evidence.`;
}

function updateProgress(main) {
  const label = [...main.querySelectorAll('.stat-label')].find(x => x.textContent.includes('core lessons completed') || x.textContent.includes('curriculum units completed'));
  if (!label) return;
  const stat = label.closest('.stat');
  const value = stat?.querySelector('.stat-value');
  const wanted = `${completedCount()}/30`;
  if (value && value.textContent !== wanted) value.textContent = wanted;
  if (label.textContent !== 'curriculum units completed') label.textContent = 'curriculum units completed';
}

function apply() {
  const main = document.querySelector('#main');
  if (!main) return;
  const hash = location.hash || '#/today';
  if (hash.includes('/ielts')) injectIELTSStrategies(main);
  if (hash.includes('/learn')) updateLearnScope(main);
  if (hash.includes('/progress')) updateProgress(main);
}

window.addEventListener('hashchange', () => setTimeout(apply, 0));
window.addEventListener('storage', () => setTimeout(apply, 0));
document.addEventListener('click', () => setTimeout(apply, 80));
new MutationObserver(() => apply()).observe(document.documentElement, { childList:true, subtree:true });
setTimeout(apply, 0);
