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
  // DOMContentLoaded waits for module scripts (including top-level await), so
  // this is the deterministic initial pass after the base app has rendered.
  document.addEventListener('DOMContentLoaded', scheduleEnhancementPass, { once:true });
  window.addEventListener('hashchange', scheduleEnhancementPass);
  window.addEventListener('ielts-adaptive-state-change', scheduleEnhancementPass);
  document.addEventListener('click', scheduleEnhancementPass);
  // Do not schedule on every input event. Repair notes are persisted by the
  // interaction runtime and must keep the active textarea/focus stable while typing.
}
