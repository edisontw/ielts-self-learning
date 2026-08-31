const out = document.querySelector('#result');
const frame = document.querySelector('#app');
const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const GUIDE_KEY = 'ielts-site-guide-dismissed-v1';
const DAY = 86400000;
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
const adaptive = () => JSON.parse(localStorage.getItem(ADAPTIVE_KEY) || '{}');

const loadApp = async hash => {
  const loaded = new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
  frame.src = `../index.html?uat=${Date.now()}${hash}`;
  await loaded;
  return frame.contentDocument;
};
const navigate = async hash => {
  frame.contentWindow.location.hash = hash;
  await wait(() => frame.contentWindow.location.hash === hash, `navigation ${hash}`);
  return frame.contentDocument;
};
const cardFor = (doc, id) => doc.querySelector(`.lesson-card [data-lesson="${id}"]`)?.closest('.lesson-card') || null;
const optionFor = (doc, questionId, value) => [...doc.querySelectorAll(`[data-quiz-option="${questionId}"]`)].find(node => node.dataset.value === value);

try {
  // A1 / usability regression: skill identity, Chinese help, filtering and reversible completion.
  localStorage.setItem(CORE_KEY, JSON.stringify({ notes: { 'uat-marker': 'preserve-me' } }));
  let doc = await loadApp('#/learn');
  const win = frame.contentWindow;

  const grid = await wait(() => doc.querySelector('.learn-simplified-grid'), 'Learn lesson grid');
  let cards = [...grid.querySelectorAll('.lesson-card')];
  assert(cards.length >= 20, `Expected core lesson cards, got ${cards.length}`);

  const representatives = ['LB01', 'R01', 'L01', 'W01', 'S01'];
  await wait(() => representatives.every(id => cardFor(doc, id)?.dataset.skill), 'skill identity attributes');
  const learningBetter = cardFor(doc, 'LB01');
  assert(learningBetter?.querySelector('[data-v113-skill-name]')?.textContent.includes('Learning Better'), 'Learning Better full label is missing');
  assert(learningBetter?.querySelector('[data-v113-skill-name]')?.textContent.includes('Study Skills'), 'Learning Better meaning is not clarified as study skills');
  assert(learningBetter?.querySelector('.lesson-icon')?.textContent.trim() !== 'LB', 'Ambiguous LB icon is still exposed');

  const accentColors = new Set(representatives.map(id => win.getComputedStyle(cardFor(doc, id)).borderTopColor));
  assert(accentColors.size === 5, `Expected five distinct skill accent colors, got ${[...accentColors].join(' | ')}`);

  let chineseToggle = await wait(() => doc.querySelector('[data-action="toggle-chinese"]'), 'Chinese help toggle');
  await wait(() => chineseToggle.getAttribute('aria-pressed') === 'false', 'Chinese help initial state');
  assert(chineseToggle.textContent.includes('關'), `Chinese help should show an explicit off state, got ${chineseToggle.textContent}`);
  chineseToggle.click();
  chineseToggle = await wait(() => frame.contentDocument.querySelector('[data-action="toggle-chinese"][aria-pressed="true"]'), 'Chinese help enabled state');
  doc = frame.contentDocument;
  assert(chineseToggle.textContent.includes('開'), `Chinese help should show an explicit on state, got ${chineseToggle.textContent}`);
  const l01Chinese = await wait(() => cardFor(doc, 'L01')?.querySelector('[data-v113-chinese-assist]'), 'visible Chinese lesson summary');
  assert(/[\u3400-\u9fff]/.test(l01Chinese.textContent), 'Chinese help did not expose Traditional Chinese lesson guidance');

  const toolbar = await wait(() => doc.querySelector('[data-learn-toolbar]'), 'Learn skill toolbar');
  const listening = toolbar.querySelector('[data-learn-filter="listening"]');
  assert(listening, 'Listening filter is missing');
  listening.click();
  await wait(() => listening.getAttribute('aria-pressed') === 'true', 'Listening filter active state');

  cards = [...doc.querySelector('.learn-simplified-grid').querySelectorAll('.lesson-card')];
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
  assert(frame.contentDocument.querySelector('.lesson-top .callout')?.textContent.includes('中文說明'), 'Chinese help did not persist into the lesson page');
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

  // A2 / core learning loop: wrong → Error Notebook → Retry → Corrected → spaced review → reschedule.
  localStorage.clear();
  localStorage.setItem(GUIDE_KEY, 'true');
  localStorage.setItem(CORE_KEY, JSON.stringify({
    placement: { completed: true, stage: 'B2' },
    notes: { 'a2-marker': 'preserve-a2' }
  }));
  const { LESSONS } = await import('../data.js');
  const r01 = LESSONS.find(lesson => lesson.id === 'R01');
  const q = r01?.sections?.flatMap(section => section.blocks || []).find(block => block.id === 'R01-Q1');
  assert(q, 'R01-Q1 canonical question is missing');
  const wrong = q.options.find(value => value !== q.answer);

  doc = await loadApp('#/lesson/R01');
  let quiz = await wait(() => doc.querySelector('[data-quiz="R01-Q1"]'), 'R01-Q1 quiz');
  optionFor(doc, q.id, wrong)?.click();
  quiz = await wait(() => frame.contentDocument.querySelector('[data-quiz="R01-Q1"]'), 'R01-Q1 selected rerender');
  quiz.querySelector(`[data-check-quiz="${q.id}"]`).click();
  quiz = await wait(() => frame.contentDocument.querySelector(`[data-quiz="${q.id}"] .feedback.wrong`), 'R01-Q1 wrong feedback');
  const saveError = quiz.closest('[data-quiz]')?.querySelector(`[data-save-error="${q.id}"]`) || frame.contentDocument.querySelector(`[data-save-error="${q.id}"]`);
  assert(saveError, 'Save error action missing after wrong lesson answer');
  saveError.click();
  const errorRow = await wait(() => (core().errors || []).find(error => error.questionId === q.id), 'saved R01-Q1 error');
  assert(core().notes?.['a2-marker'] === 'preserve-a2', 'Saving an error removed learner notes');

  doc = await navigate('#/improve');
  let retry = await wait(() => frame.contentDocument.querySelector(`[data-action="retry-error"][data-error-id="${errorRow.id}"]`), 'Error Notebook Retry question');
  let errorCard = retry.closest('.error-item');
  assert(errorCard?.textContent.includes('Retry required'), 'Active lesson error does not communicate that a retry is required');
  retry.click();
  await wait(() => frame.contentWindow.location.hash === '#/lesson/R01', 'Error Notebook retry navigation');
  doc = frame.contentDocument;
  quiz = await wait(() => doc.querySelector(`[data-quiz="${q.id}"]`), 'retry-reset R01-Q1');
  assert(!quiz.querySelector('.feedback'), 'Retry question retained stale checked feedback');

  optionFor(doc, q.id, q.answer)?.click();
  quiz = await wait(() => frame.contentDocument.querySelector(`[data-quiz="${q.id}"]`), 'correct option selected');
  quiz.querySelector(`[data-check-quiz="${q.id}"]`).click();
  await wait(() => (core().fixedErrors || []).includes(errorRow.id), 'saved error auto-corrected after successful retry');
  await wait(() => adaptive().reviewSchedule?.[errorRow.id]?.lastRating === 'corrected-in-retry', 'corrected error spaced-review scheduling');

  let schedule = adaptive().reviewSchedule[errorRow.id];
  assert(schedule.mastered === true, 'Successful retry did not mark the review schedule mastered');
  assert(schedule.intervalDays === 3, `Successful retry should seed a 3-day review interval, got ${schedule.intervalDays}`);
  assert(schedule.dueAt > Date.now() + 2.5 * DAY, 'Successful retry did not move review out of the immediate queue');

  doc = await navigate('#/improve');
  const fixedControl = await wait(() => frame.contentDocument.querySelector(`[data-action="mark-fixed"][data-error-id="${errorRow.id}"]`), 'Corrected Error Notebook state');
  errorCard = fixedControl.closest('.error-item');
  assert(fixedControl.textContent.includes('Corrected'), 'Corrected lesson error is not visibly labelled Corrected');
  assert(!errorCard.querySelector('[data-action="retry-error"]'), 'Corrected lesson error still exposes immediate Retry question');
  let reviewRoot = await wait(() => frame.contentDocument.querySelector('[data-adaptive-root="review"]'), 'Review Queue after correction');
  assert(reviewRoot.textContent.includes('You are caught up'), 'Corrected error remained due immediately instead of entering spaced review');
  assert(reviewRoot.textContent.includes('scheduled later'), 'Corrected error is not visible as a scheduled-later review');

  const nextAdaptive = adaptive();
  nextAdaptive.reviewSchedule[errorRow.id].dueAt = Date.now() - 1000;
  localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(nextAdaptive));
  await navigate('#/learn');
  doc = await navigate('#/today');
  const todayReview = await wait(() => frame.contentDocument.querySelector('[data-adaptive-root="today"]'), 'Today due-review priority');
  assert(todayReview.textContent.includes('1 review item') && todayReview.textContent.includes('due'), 'A due corrected error did not become Today’s highest-priority review');

  doc = await navigate('#/improve');
  reviewRoot = await wait(() => frame.contentDocument.querySelector('[data-adaptive-root="review"]'), 'due Review Queue');
  assert(reviewRoot.textContent.includes('1 due now'), 'Forced-due corrected error did not enter Review Queue');
  const reviewItem = await wait(() => frame.contentDocument.querySelector(`[data-review-id="${errorRow.id}"]`), 'due review item');
  reviewItem.querySelector(`[data-adaptive-action="reveal-review"][data-error-id="${errorRow.id}"]`).click();
  await wait(() => !frame.contentDocument.querySelector(`[data-review-answer="${errorRow.id}"]`)?.hidden, 'review answer reveal');
  const good = frame.contentDocument.querySelector(`[data-adaptive-action="rate-review"][data-error-id="${errorRow.id}"][data-rating="good"]`);
  assert(good, 'Good recall rating is missing');
  good.click();
  await wait(() => adaptive().reviewSchedule?.[errorRow.id]?.attempts === 1, 'review rating persistence');
  schedule = adaptive().reviewSchedule[errorRow.id];
  assert(schedule.lastRating === 'good', `Expected good review rating, got ${schedule.lastRating}`);
  assert(schedule.intervalDays >= 6 && schedule.dueAt > Date.now() + 5.5 * DAY, 'Good recall did not increase the spaced-review interval');
  assert((adaptive().reviewHistory || []).some(row => row.errorId === errorRow.id && row.rating === 'good'), 'Review history did not record the recall rating');

  doc = await navigate('#/today');
  const todayAfterReview = await wait(() => frame.contentDocument.querySelector('[data-adaptive-root="today"]'), 'Today after review reschedule');
  assert(!todayAfterReview.textContent.includes('review item') || !todayAfterReview.textContent.includes('due'), 'Completed spaced review remained incorrectly due on Today');

  // Test Mode guard: a Mini Test miss may route to targeted practice but never to fake single-question retry.
  const seededCore = core();
  seededCore.errors ||= [];
  seededCore.errors.push({
    id: 'uat-mini-test-error', ts: Date.now(), questionId: 'MR01-Q1', lessonId: 'MR01', skill: 'reading',
    errorTag: 'reading-evidence', question: 'Mini Test Test-Mode guard', myAnswer: 'FALSE', correctAnswer: 'TRUE', rationale: 'UAT guard'
  });
  localStorage.setItem(CORE_KEY, JSON.stringify(seededCore));
  doc = await loadApp('#/improve');
  const miniCard = await wait(() => frame.contentDocument.querySelector('[data-error-prompt="uat-mini-test-error"]')?.closest('.error-item'), 'Mini Test Error Notebook item');
  assert(!miniCard.querySelector('[data-action="retry-error"]'), 'Mini Test error exposed an invalid single-question Retry action');
  const transfer = await wait(() => miniCard.querySelector('[data-v16-existing-practice-error-route]'), 'Mini Test targeted-practice route');
  assert(transfer.querySelector('[data-lesson]'), 'Mini Test error has no safe test-level/targeted-practice route after single-question Retry is withheld');

  out.textContent = 'V17_PRODUCTION_E2E_PASS';
} catch (error) {
  out.textContent = `V17_PRODUCTION_E2E_FAIL: ${error.stack || error}`;
}
