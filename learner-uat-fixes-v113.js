const CORE_KEY = 'ielts-self-learning-v1';
const SCROLL_KEY = 'ielts-v113-lesson-scroll';

function readCore() {
  try { return JSON.parse(localStorage.getItem(CORE_KEY) || '{}'); }
  catch { return {}; }
}

function lessonIdFromRoute() {
  return (location.hash.match(/#\/lesson\/([^/?#]+)/)?.[1] || '').trim();
}

function isLessonComplete(id) {
  return Boolean(id && (readCore().completedLessons || []).includes(id));
}

function enhanceCompletionControl() {
  if (!location.hash.includes('/lesson/')) return;
  const button = document.querySelector('[data-action="complete-lesson"], [data-action="uncomplete-lesson"]');
  if (!button) return;
  const id = button.dataset.lessonId || lessonIdFromRoute();
  if (!id) return;

  const complete = isLessonComplete(id);
  button.dataset.lessonId = id;
  button.dataset.action = complete ? 'uncomplete-lesson' : 'complete-lesson';
  button.textContent = complete ? 'Mark incomplete' : 'Mark lesson complete';
  button.classList.toggle('primary', !complete);
  button.classList.toggle('soft', complete);
  button.setAttribute('aria-pressed', String(complete));

  const finish = button.closest('.lesson-section');
  const note = finish?.querySelector('p.muted');
  if (note) note.textContent = 'Completion is saved locally. You can mark this lesson incomplete without deleting answers or notes.';
}

function handleCompletionCapture(event) {
  const button = event.target?.closest?.('[data-action="uncomplete-lesson"]');
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  const id = button.dataset.lessonId || lessonIdFromRoute();
  if (!id) return;
  const core = readCore();
  core.completedLessons = (core.completedLessons || []).filter(item => item !== id);
  core.studyHistory ||= [];
  core.studyHistory.push({ ts: Date.now(), type: 'lesson-incomplete', lessonId: id });
  localStorage.setItem(CORE_KEY, JSON.stringify(core));
  sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  location.reload();
}

function restoreScroll() {
  const saved = sessionStorage.getItem(SCROLL_KEY);
  if (saved == null) return;
  sessionStorage.removeItem(SCROLL_KEY);
  const y = Number(saved);
  if (Number.isFinite(y)) requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleCompletionCapture, true);
  window.addEventListener('hashchange', () => setTimeout(enhanceCompletionControl, 0));
  new MutationObserver(() => queueMicrotask(enhanceCompletionControl)).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => { enhanceCompletionControl(); restoreScroll(); }, 0);
}

export { readCore, lessonIdFromRoute, isLessonComplete, enhanceCompletionControl, handleCompletionCapture };
