const CORE_KEY = 'ielts-self-learning-v1';
let reloadAfterMockExit = false;

function validCore() {
  try {
    const core = JSON.parse(localStorage.getItem(CORE_KEY) || '{}');
    return core && typeof core === 'object' && Array.isArray(core.errors || []);
  } catch {
    return false;
  }
}

function markMockCoreChanged() {
  if (validCore()) reloadAfterMockExit = true;
}

function handleExitAfterExternalCoreWrite(event) {
  if (!reloadAfterMockExit) return;
  const exit = event.target?.closest?.('[data-mock-action="exit"]');
  if (!exit) return;
  reloadAfterMockExit = false;
  setTimeout(() => window.location.reload(), 0);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('ielts-mock-errors-saved', markMockCoreChanged);
  document.addEventListener('click', handleExitAfterExternalCoreWrite);
}

export { markMockCoreChanged, handleExitAfterExternalCoreWrite };
