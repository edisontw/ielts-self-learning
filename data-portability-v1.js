const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const PLAN_KEY = 'ielts-study-plan-v1';
const MOCK_KEY = 'ielts-mock-v1';
const THEME_KEY = 'ielts-theme';
const BACKUP_FORMAT = 'ielts-self-learning-backup';
const BACKUP_SCHEMA_VERSION = 2;
const LEGACY_BACKUP_SCHEMA_VERSION = 1;
const APP_VERSION = '0.14.0';
const MAX_BACKUP_CHARS = 5_000_000;
const BACKUP_KEYS = [CORE_KEY, ADAPTIVE_KEY, PLAN_KEY, MOCK_KEY, THEME_KEY];
const LEGACY_BACKUP_KEYS = [CORE_KEY, ADAPTIVE_KEY, PLAN_KEY, THEME_KEY];
const LEARNER_KEYS = [CORE_KEY, ADAPTIVE_KEY, PLAN_KEY, MOCK_KEY];

const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function parseStoredJSON(storage, key) {
  const raw = storage.getItem(key);
  if (raw == null || raw === '') return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

function collectBackup(storage = localStorage) {
  return {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    source: typeof location === 'undefined' ? null : `${location.origin || ''}${location.pathname || ''}`,
    data: {
      [CORE_KEY]: parseStoredJSON(storage, CORE_KEY),
      [ADAPTIVE_KEY]: parseStoredJSON(storage, ADAPTIVE_KEY),
      [PLAN_KEY]: parseStoredJSON(storage, PLAN_KEY),
      [MOCK_KEY]: parseStoredJSON(storage, MOCK_KEY),
      [THEME_KEY]: storage.getItem(THEME_KEY)
    }
  };
}

function assertArrayField(obj, field, label) {
  if (own(obj, field) && !Array.isArray(obj[field])) throw new Error(`${label}.${field} must be an array.`);
}

function assertObjectField(obj, field, label) {
  if (own(obj, field) && !isObject(obj[field])) throw new Error(`${label}.${field} must be an object.`);
}

function validateCore(core) {
  if (core == null) return;
  if (!isObject(core)) throw new Error('Core learner data must be an object or null.');
  for (const field of ['completedLessons','errors','fixedErrors','studyHistory']) assertArrayField(core, field, 'core');
  for (const field of ['profile','study','lessonAnswers','notes','writingDrafts','speakingTranscripts','ui']) assertObjectField(core, field, 'core');
  if (own(core, 'placement') && core.placement != null && !isObject(core.placement)) throw new Error('core.placement must be an object or null.');
}

function validateAdaptive(adaptive) {
  if (adaptive == null) return;
  if (!isObject(adaptive)) throw new Error('Adaptive learner data must be an object or null.');
  for (const field of ['reviewHistory','vocabularyHistory','learningHistory','miniTestHistory']) assertArrayField(adaptive, field, 'adaptive');
  for (const field of ['reviewSchedule','repairProgress','vocabularySchedule','skillPerformance','productiveEvidence','productivePriority','aiFeedbackReturns']) assertObjectField(adaptive, field, 'adaptive');
}

function validatePlan(plan) {
  if (plan == null) return;
  if (!isObject(plan)) throw new Error('Study Plan data must be an object or null.');
  if (plan.version !== 1) throw new Error('Unsupported Study Plan data version.');
  if (!isObject(plan.config)) throw new Error('Study Plan config is missing or invalid.');
  if (!Array.isArray(plan.weeks)) throw new Error('Study Plan weeks must be an array.');
  if (!Array.isArray(plan.manualDone || [])) throw new Error('Study Plan manualDone must be an array.');
  for (const week of plan.weeks) {
    if (!isObject(week) || !Array.isArray(week.sessions)) throw new Error('Each Study Plan week must contain a sessions array.');
  }
}

function validateMock(mock) {
  if (mock == null) return;
  if (!isObject(mock)) throw new Error('Mock Test data must be an object or null.');
  assertArrayField(mock, 'history', 'mock');
  for (const row of mock.history || []) {
    if (!isObject(row)) throw new Error('Each Mock Test history item must be an object.');
    if (row.testId != null && typeof row.testId !== 'string') throw new Error('Mock Test history testId must be a string.');
    if (row.mode != null && typeof row.mode !== 'string') throw new Error('Mock Test history mode must be a string.');
  }
}

function schemaKeys(schemaVersion) {
  return schemaVersion === LEGACY_BACKUP_SCHEMA_VERSION ? LEGACY_BACKUP_KEYS : BACKUP_KEYS;
}

function validateBackup(payload) {
  if (!isObject(payload)) throw new Error('Backup must be a JSON object.');
  if (payload.format !== BACKUP_FORMAT) throw new Error('This is not an IELTS Self-Learning backup file.');
  if (![LEGACY_BACKUP_SCHEMA_VERSION, BACKUP_SCHEMA_VERSION].includes(payload.schemaVersion)) throw new Error(`Unsupported backup schema version: ${payload.schemaVersion ?? 'missing'}.`);
  if (!isObject(payload.data)) throw new Error('Backup data is missing.');
  const allowed = schemaKeys(payload.schemaVersion);
  const keys = Object.keys(payload.data);
  const unknown = keys.filter(key => !allowed.includes(key));
  if (unknown.length) throw new Error(`Backup contains unknown storage keys: ${unknown.join(', ')}.`);
  const missing = allowed.filter(key => !own(payload.data, key));
  if (missing.length) throw new Error(`Backup is incomplete. Missing: ${missing.join(', ')}.`);
  if (JSON.stringify(payload).length > MAX_BACKUP_CHARS) throw new Error('Backup is larger than the supported 5 MB limit.');

  validateCore(payload.data[CORE_KEY]);
  validateAdaptive(payload.data[ADAPTIVE_KEY]);
  validatePlan(payload.data[PLAN_KEY]);
  if (payload.schemaVersion >= 2) validateMock(payload.data[MOCK_KEY]);
  const theme = payload.data[THEME_KEY];
  if (theme != null && !['light','dark'].includes(theme)) throw new Error('Theme must be light, dark, or null.');
  return payload;
}

function backupValue(payload, key) {
  if (key === MOCK_KEY && payload.schemaVersion === LEGACY_BACKUP_SCHEMA_VERSION) return null;
  return payload.data[key];
}

function applyBackup(payload, storage = localStorage) {
  validateBackup(payload);
  const before = Object.fromEntries(BACKUP_KEYS.map(key => [key, storage.getItem(key)]));
  try {
    for (const key of BACKUP_KEYS) {
      const value = backupValue(payload, key);
      if (value == null) storage.removeItem(key);
      else if (key === THEME_KEY) storage.setItem(key, value);
      else storage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    for (const key of BACKUP_KEYS) {
      const old = before[key];
      if (old == null) storage.removeItem(key); else storage.setItem(key, old);
    }
    throw new Error(`Import failed and previous data was restored: ${error.message}`);
  }
  return summarizeBackup(payload);
}

function resetLearnerData(storage = localStorage) {
  for (const key of LEARNER_KEYS) storage.removeItem(key);
}

function summarizeBackup(payload) {
  const data = payload?.data || {};
  const core = data[CORE_KEY] || {};
  const adaptive = data[ADAPTIVE_KEY] || {};
  const plan = data[PLAN_KEY] || null;
  const mock = data[MOCK_KEY] || null;
  const productive = adaptive.productiveEvidence || {};
  const feedback = adaptive.aiFeedbackReturns || {};
  return {
    placement: Boolean(core.placement),
    coreCompleted: Array.isArray(core.completedLessons) ? core.completedLessons.length : 0,
    errors: Array.isArray(core.errors) ? core.errors.length : 0,
    miniTests: Array.isArray(adaptive.miniTestHistory) ? adaptive.miniTestHistory.length : 0,
    mockTests: Array.isArray(mock?.history) ? mock.history.length : 0,
    productiveAttempts: ['writing','speaking'].reduce((sum,skill) => sum + (Array.isArray(productive[skill]) ? productive[skill].length : 0), 0),
    feedbackReturns: ['writing','speaking'].reduce((sum,skill) => sum + (Array.isArray(feedback[skill]) ? feedback[skill].length : 0), 0),
    planWeeks: Array.isArray(plan?.weeks) ? plan.weeks.length : 0,
    theme: data[THEME_KEY] || null
  };
}

function currentSummary() {
  return summarizeBackup(collectBackup());
}

function esc(value='') {
  return String(value).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
}

function toolsHTML() {
  const s = currentSummary();
  return `<section class="card extension-card" data-local-data-tools style="margin-top:18px">
    <div class="adaptive-top"><div><div class="eyebrow">Local data · Backup & restore</div><h2>Keep your learner data portable.</h2></div><span class="chip primary">Local-first</span></div>
    <p class="muted">Export one JSON backup before changing browsers or resetting this workspace. Import validates the backup before replacing local learner data. No file is uploaded to a server.</p>
    <div class="grid four" style="margin-top:14px">
      <div class="card stat"><div class="stat-value">${s.coreCompleted}</div><div class="stat-label">core lessons completed</div></div>
      <div class="card stat"><div class="stat-value">${s.errors}</div><div class="stat-label">saved errors</div></div>
      <div class="card stat"><div class="stat-value">${s.miniTests}</div><div class="stat-label">Mini Test attempts</div></div>
      <div class="card stat"><div class="stat-value">${s.mockTests}</div><div class="stat-label">Full Mock attempts</div></div>
    </div>
    <div class="cluster" style="margin-top:16px">
      <button class="btn primary" data-data-action="export">Export backup</button>
      <button class="btn soft" data-data-action="import">Import backup</button>
      <button class="btn danger" data-data-action="reset">Reset learner data</button>
      <input type="file" accept="application/json,.json" data-data-import-file hidden>
    </div>
    <div class="callout" style="margin-top:14px"><strong>Included:</strong> Placement, profile, core progress, answers, Error Notebook, review/vocabulary schedules, productive evidence, AI feedback returns, Mini Test history, Full Mock history, Study Plan, drafts/transcripts and theme.<br><span class="small muted">Reset removes only learner-data keys and keeps your Light/Dark appearance preference. Import is destructive only after validation and confirmation. Older schema-v1 backups remain importable; they contain no Full Mock history.</span></div>
  </section>`;
}

function injectTools() {
  if (!location.hash.includes('/progress') || document.querySelector('[data-local-data-tools]')) return;
  const main = document.querySelector('#main');
  if (!main) return;
  const anchor = document.querySelector('[data-study-plan-builder]') || document.querySelector('[data-productive-progress]') || main.lastElementChild;
  if (anchor) anchor.insertAdjacentHTML('afterend', toolsHTML()); else main.insertAdjacentHTML('beforeend', toolsHTML());
}

function filenameDate() {
  return new Date().toISOString().slice(0,10);
}

function exportBackup() {
  const payload = collectBackup();
  validateBackup(payload);
  const blob = new Blob([JSON.stringify(payload,null,2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ielts-self-learning-backup-${filenameDate()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importFile(file) {
  if (!file) return;
  if (file.size > MAX_BACKUP_CHARS) throw new Error('Backup file is larger than the supported 5 MB limit.');
  let payload;
  try { payload = JSON.parse(await file.text()); }
  catch { throw new Error('Backup file is not valid JSON.'); }
  validateBackup(payload);
  const s = summarizeBackup(payload);
  const exported = payload.exportedAt ? new Date(payload.exportedAt).toLocaleString() : 'unknown time';
  const ok = confirm(`Import backup from ${exported}?\n\nPlacement: ${s.placement ? 'yes' : 'no'}\nCore completed: ${s.coreCompleted}/30\nSaved errors: ${s.errors}\nMini Test attempts: ${s.miniTests}\nFull Mock attempts: ${s.mockTests}\nStudy Plan: ${s.planWeeks || 0} weeks\n\nThis replaces current learner data in this browser.`);
  if (!ok) return false;
  applyBackup(payload);
  return true;
}

function resetWithConfirmation() {
  const s = currentSummary();
  const ok = confirm(`Reset IELTS learner data in this browser?\n\nThis removes Placement, ${s.coreCompleted} completed core lesson(s), ${s.errors} saved error(s), Mini Test history, ${s.mockTests} Full Mock attempt(s), productive evidence, AI feedback and Study Plan data.\n\nYour Light/Dark appearance preference will be kept. Export a backup first if you may need this data later.`);
  if (!ok) return false;
  resetLearnerData();
  return true;
}

function reloadApp() {
  if (typeof window !== 'undefined' && window.location?.reload) window.location.reload();
}

function handleClick(event) {
  const button = event.target.closest('[data-data-action]');
  if (!button) return;
  const action = button.dataset.dataAction;
  if (action === 'export') {
    try { exportBackup(); }
    catch (error) { alert(`Could not export backup: ${error.message}`); }
  } else if (action === 'import') {
    document.querySelector('[data-data-import-file]')?.click();
  } else if (action === 'reset') {
    if (resetWithConfirmation()) reloadApp();
  }
}

async function handleFileChange(event) {
  const input = event.target.closest('[data-data-import-file]');
  if (!input) return;
  try {
    const imported = await importFile(input.files?.[0]);
    if (imported) reloadApp();
  } catch (error) {
    alert(`Could not import backup: ${error.message}`);
  } finally {
    input.value = '';
  }
}

function apply() { injectTools(); }

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleFileChange);
  window.addEventListener('hashchange', () => setTimeout(apply,0));
  new MutationObserver(apply).observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(apply,0);
}

export {
  APP_VERSION,
  BACKUP_FORMAT,
  BACKUP_SCHEMA_VERSION,
  BACKUP_KEYS,
  LEARNER_KEYS,
  MOCK_KEY,
  collectBackup,
  validateBackup,
  applyBackup,
  resetLearnerData,
  summarizeBackup
};
