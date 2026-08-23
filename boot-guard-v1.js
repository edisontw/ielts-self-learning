const CORE_KEY = 'ielts-self-learning-v1';
const RECOVERY_PREFIX = 'ielts-self-learning-recovery-v1-';

const DEFAULT_CORE = {
  profile: { targetBand: 7, stage: null, referenceLevel: null, recommendedDifficulty: 3, confidence: null, placementSections: null },
  study: { preferredMinutes: 20 },
  placement: null,
  completedLessons: [],
  lessonAnswers: {},
  notes: {},
  errors: [],
  fixedErrors: [],
  studyHistory: [],
  writingDrafts: {},
  speakingTranscripts: {},
  ui: { chineseHelp: false }
};

const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const objectOr = (value, fallback = {}) => isObject(value) ? value : { ...fallback };
const arrayOr = value => Array.isArray(value) ? value : [];

export function normalizeCoreState(input) {
  const source = isObject(input) ? input : {};
  const profile = objectOr(source.profile, DEFAULT_CORE.profile);
  const study = objectOr(source.study, DEFAULT_CORE.study);
  const ui = objectOr(source.ui, DEFAULT_CORE.ui);
  const targetBand = Number(profile.targetBand);
  const preferredMinutes = Number(study.preferredMinutes);
  return {
    ...source,
    profile: {
      ...DEFAULT_CORE.profile,
      ...profile,
      targetBand: Number.isFinite(targetBand) && targetBand >= 5 && targetBand <= 9 ? targetBand : 7,
      recommendedDifficulty: Number.isFinite(Number(profile.recommendedDifficulty)) ? Number(profile.recommendedDifficulty) : 3,
      placementSections: isObject(profile.placementSections) ? profile.placementSections : null
    },
    study: {
      ...DEFAULT_CORE.study,
      ...study,
      preferredMinutes: Number.isFinite(preferredMinutes) && preferredMinutes > 0 ? preferredMinutes : 20
    },
    placement: isObject(source.placement) ? source.placement : null,
    completedLessons: arrayOr(source.completedLessons),
    lessonAnswers: objectOr(source.lessonAnswers),
    notes: objectOr(source.notes),
    errors: arrayOr(source.errors),
    fixedErrors: arrayOr(source.fixedErrors),
    studyHistory: arrayOr(source.studyHistory),
    writingDrafts: objectOr(source.writingDrafts),
    speakingTranscripts: objectOr(source.speakingTranscripts),
    ui: { ...DEFAULT_CORE.ui, ...ui, chineseHelp: Boolean(ui.chineseHelp) }
  };
}

export function repairStoredCore(storage = globalThis.localStorage) {
  if (!storage) return null;
  let raw = null;
  try { raw = storage.getItem(CORE_KEY); } catch { return null; }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeCoreState(parsed);
    const next = JSON.stringify(normalized);
    if (next !== raw) storage.setItem(CORE_KEY, next);
    return normalized;
  } catch {
    try {
      storage.setItem(`${RECOVERY_PREFIX}${Date.now()}`, raw);
      storage.removeItem(CORE_KEY);
    } catch {}
    return null;
  }
}

function renderBootFailure(errors = []) {
  const app = document.querySelector('#app');
  if (!app || app.children.length) return;
  const message = errors.at(-1)?.message || 'The application did not finish loading.';
  app.innerHTML = `<main style="font-family:system-ui,-apple-system,sans-serif;max-width:760px;margin:9vh auto;padding:24px;color:#17211c">
    <section style="border:1px solid #d8e1dc;border-radius:16px;padding:24px;background:#fff;box-shadow:0 16px 50px rgba(20,40,30,.08)">
      <strong style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#557064">IELTS Learn</strong>
      <h1 style="font-size:28px;margin:8px 0 10px">The page could not start normally.</h1>
      <p style="line-height:1.6;color:#52615a">Your learning data has not been deleted. Reload once after this update. If the problem continues, use the recovery button to back up the old local state and start with a clean workspace.</p>
      <details style="margin:14px 0"><summary>Technical detail</summary><code style="display:block;white-space:pre-wrap;margin-top:8px">${String(message).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</code></details>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button data-boot-reload style="padding:10px 15px;border:0;border-radius:10px;background:#25684b;color:white;font-weight:700;cursor:pointer">Reload</button><button data-boot-clean style="padding:10px 15px;border:1px solid #cbd8d1;border-radius:10px;background:#f6faf8;color:#24382f;font-weight:700;cursor:pointer">Back up local state & restart</button></div>
    </section>
  </main>`;
  app.querySelector('[data-boot-reload]')?.addEventListener('click', () => location.reload());
  app.querySelector('[data-boot-clean]')?.addEventListener('click', () => {
    try {
      const raw = localStorage.getItem(CORE_KEY);
      if (raw) localStorage.setItem(`${RECOVERY_PREFIX}${Date.now()}`, raw);
      localStorage.removeItem(CORE_KEY);
    } catch {}
    location.reload();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  repairStoredCore();
  const errors = [];
  window.__ieltsBootErrors = errors;
  window.addEventListener('error', event => errors.push({ message: event.message || event.error?.message || 'Unknown script error' }));
  window.addEventListener('unhandledrejection', event => errors.push({ message: event.reason?.message || String(event.reason || 'Unhandled promise rejection') }));
  window.addEventListener('load', () => setTimeout(() => {
    if (!document.querySelector('#app .app-shell')) renderBootFailure(errors);
  }, 1200));
}

export { CORE_KEY, RECOVERY_PREFIX };
