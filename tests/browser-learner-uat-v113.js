const out = document.querySelector('#result');
const frame = document.querySelector('#app');
const CORE_KEY = 'ielts-self-learning-v1';
out.textContent = 'V113_LEARNER_UAT_RUNNING';

const wait = async (fn, label, timeout = 20000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { const value = fn(); if (value) return value; } catch {}
    await new Promise(resolve => setTimeout(resolve, 60));
  }
  throw new Error(`Timed out waiting for ${label}`);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const core = () => JSON.parse(localStorage.getItem(CORE_KEY) || '{}');

const loadApp = async hash => {
  const loaded = new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
  frame.src = `../index.html?uat=${Date.now()}${hash}`;
  await loaded;
  return frame.contentDocument;
};

try {
  localStorage.setItem(CORE_KEY, JSON.stringify({ notes: { 'uat-marker': 'preserve-me' } }));
  let doc = await loadApp('#/learn');
  const win = frame.contentWindow;

  const toolbar = await wait(() => doc.querySelector('[data-learn-toolbar]'), 'Learn skill toolbar');
  const listening = toolbar.querySelector('[data-learn-filter="listening"]');
  assert(listening, 'Listening filter is missing');
  listening.click();
  await wait(() => listening.getAttribute('aria-pressed') === 'true', 'Listening filter active state');

  const grid = await wait(() => doc.querySelector('.learn-simplified-grid'), 'Learn lesson grid');
  const cards = [...grid.querySelectorAll('.lesson-card')];
  assert(cards.length >= 20, `Expected core lesson cards, got ${cards.length}`);
  const visibleIds = cards
    .filter(card => win.getComputedStyle(card).display !== 'none')
    .map(card => card.querySelector('[data-lesson]')?.dataset.lesson || '');
  assert(visibleIds.length === 5, `Listening filter should show 5 lessons, got ${visibleIds.join(', ')}`);
  assert(visibleIds.every(id => /^L\d+$/.test(id)), `Listening filter exposed non-listening lesson(s): ${visibleIds.join(', ')}`);
  const hiddenNonListening = cards.filter(card => !/^L\d+$/.test(card.querySelector('[data-lesson]')?.dataset.lesson || ''));
  assert(hiddenNonListening.every(card => card.hidden && win.getComputedStyle(card).display === 'none'), 'Non-listening cards are not actually hidden');

  win.location.hash = '#/lesson/L01';
  let completion = await wait(() => frame.contentDocument.querySelector('[data-action="complete-lesson"][data-lesson-id="L01"]'), 'initial completion control');
  assert(completion.textContent.trim() === 'Mark lesson complete', `Unexpected initial completion label: ${completion.textContent}`);
  completion.click();

  completion = await wait(() => frame.contentDocument.querySelector('[data-action="uncomplete-lesson"][data-lesson-id="L01"]'), 'reversible completed state');
  assert(completion.textContent.trim() === 'Mark incomplete', `Completed lesson should offer Mark incomplete, got ${completion.textContent}`);
  assert((core().completedLessons || []).includes('L01'), 'L01 completion was not persisted');
  assert(core().notes?.['uat-marker'] === 'preserve-me', 'Marking complete removed existing learner notes');

  const reloaded = new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
  completion.click();
  await reloaded;
  doc = frame.contentDocument;
  completion = await wait(() => doc.querySelector('[data-action="complete-lesson"][data-lesson-id="L01"]'), 'incomplete state after reload');
  assert(completion.textContent.trim() === 'Mark lesson complete', `Incomplete lesson did not restore completion action: ${completion.textContent}`);
  assert(!(core().completedLessons || []).includes('L01'), 'L01 remained completed after Mark incomplete');
  assert(core().notes?.['uat-marker'] === 'preserve-me', 'Mark incomplete deleted learner notes');
  assert((core().studyHistory || []).some(row => row.type === 'lesson-incomplete' && row.lessonId === 'L01'), 'Lesson-incomplete history event was not recorded');

  out.textContent = 'V17_PRODUCTION_E2E_PASS';
} catch (error) {
  out.textContent = `V17_PRODUCTION_E2E_FAIL: ${error.stack || error}`;
}
