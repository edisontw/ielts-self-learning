const CORE_KEY = 'ielts-self-learning-v1';
let reloadAfterExternalCoreWrite = false;

function validCore() {
  try {
    const core = JSON.parse(localStorage.getItem(CORE_KEY) || '{}');
    return core && typeof core === 'object' && Array.isArray(core.errors || []);
  } catch {
    return false;
  }
}

function markCoreChanged() {
  if (validCore()) reloadAfterExternalCoreWrite = true;
}

const markMockCoreChanged = markCoreChanged;
const markMiniTestCoreChanged = markCoreChanged;

function reloadBaseState() {
  if (!reloadAfterExternalCoreWrite) return;
  reloadAfterExternalCoreWrite = false;
  setTimeout(() => window.location.reload(), 0);
}

function handleExitAfterExternalCoreWrite(event) {
  if (!reloadAfterExternalCoreWrite) return;
  const mockExit = event.target?.closest?.('[data-mock-action="exit"]');
  const miniExit = event.target?.closest?.('[data-mini-action="exit"]');
  if (!mockExit && !miniExit) return;
  reloadBaseState();
}

function handleRouteChangeAfterExternalCoreWrite() {
  reloadBaseState();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('ielts-mock-errors-saved', markMockCoreChanged);
  window.addEventListener('ielts-mini-test-errors-saved', markMiniTestCoreChanged);
  window.addEventListener('hashchange', handleRouteChangeAfterExternalCoreWrite);
  document.addEventListener('click', handleExitAfterExternalCoreWrite);
}

export {
  markMockCoreChanged,
  markMiniTestCoreChanged,
  handleExitAfterExternalCoreWrite,
  handleRouteChangeAfterExternalCoreWrite
};
