const callbacks = new Set();
let scheduled = false;

export function scheduleEnhancementPass() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    for (const callback of [...callbacks]) {
      try { callback(); }
      catch (error) { console.error('V1.5 enhancement pass failed', error); }
    }
  });
}

export function registerRenderEnhancement(callback) {
  callbacks.add(callback);
  scheduleEnhancementPass();
  return () => callbacks.delete(callback);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('hashchange', scheduleEnhancementPass);
  window.addEventListener('ielts-adaptive-state-change', scheduleEnhancementPass);
  document.addEventListener('click', scheduleEnhancementPass);
  document.addEventListener('input', scheduleEnhancementPass);
}
