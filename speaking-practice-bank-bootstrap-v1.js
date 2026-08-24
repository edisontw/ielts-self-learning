let runtimeLoaded = false;
let recoveryPending = false;

function onSpeakingLesson() {
  return location.hash.includes('/lesson/SPB01');
}

function workspaceMount() {
  return document.querySelector('[data-speaking-bank-mount]');
}

async function ensureSpeakingWorkspace() {
  if (!onSpeakingLesson()) return;
  const mount = workspaceMount();
  if (!mount || mount.querySelector('[data-spb-workspace]')) return;

  if (!runtimeLoaded) {
    runtimeLoaded = true;
    try {
      await import('./speaking-practice-bank-runtime-v1.js');
    } catch (error) {
      runtimeLoaded = false;
      console.error('Could not load Speaking Practice Bank runtime.', error);
    }
    return;
  }

  // The base app can rebuild a lesson without changing the hash (for example,
  // after an appearance change). The runtime already listens for hashchange,
  // so replay that route event only when its mounted workspace is actually gone.
  // Keep a short lock so the resulting base render cannot create a feedback loop.
  if (recoveryPending) return;
  recoveryPending = true;
  setTimeout(() => {
    window.dispatchEvent(new Event('hashchange'));
    setTimeout(() => { recoveryPending = false; }, 80);
  }, 0);
}

if (typeof document !== 'undefined') {
  const app = document.querySelector('#app') || document.documentElement;
  new MutationObserver(() => { void ensureSpeakingWorkspace(); }).observe(app, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(() => { void ensureSpeakingWorkspace(); }, 0));
  setTimeout(() => { void ensureSpeakingWorkspace(); }, 0);
}

export { ensureSpeakingWorkspace };
