import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const source = fs.readFileSync(path.join(root, 'boot-guard-v1.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const { normalizeCoreState } = await import('../boot-guard-v1.js');
const normalized = normalizeCoreState({
  profile: { targetBand: '7.5', recommendedDifficulty: '4', placementSections: null },
  study: { preferredMinutes: '30' },
  completedLessons: null,
  lessonAnswers: null,
  errors: null,
  fixedErrors: null,
  studyHistory: null,
  ui: null
});

assert(normalized.profile.targetBand === 7.5, 'String targetBand must normalize to a number.');
assert(normalized.profile.recommendedDifficulty === 4, 'String difficulty must normalize to a number.');
assert(normalized.study.preferredMinutes === 30, 'String study minutes must normalize to a number.');
for (const key of ['completedLessons','errors','fixedErrors','studyHistory']) assert(Array.isArray(normalized[key]), `${key} must normalize to an array.`);
assert(normalized.lessonAnswers && typeof normalized.lessonAnswers === 'object', 'lessonAnswers must normalize to an object.');
assert(normalized.ui && normalized.ui.chineseHelp === false, 'ui state must receive a safe default.');

const guardIndex = index.indexOf('./boot-guard-v1.js');
const appIndex = index.indexOf('./app.js');
assert(guardIndex >= 0 && guardIndex < appIndex, 'Boot guard must load before app.js.');
for (const token of ['The page could not start normally.', 'ielts-self-learning-recovery-v1-', 'unhandledrejection', 'repairStoredCore']) {
  assert(source.includes(token), `Boot guard missing ${token}`);
}
for (const token of ['actions/configure-pages@v5','actions/upload-pages-artifact@v4','actions/deploy-pages@v4','pages: write','id-token: write']) {
  assert(workflow.includes(token), `Pages workflow missing ${token}`);
}
assert(fs.existsSync(path.join(root, '.nojekyll')), '.nojekyll must be present for static deployment.');

console.log('✓ Stale local learner state is normalized before app startup');
console.log('✓ Blank startup now renders a recoverable error screen instead of an empty page');
console.log('✓ GitHub Pages has an explicit validated deployment workflow');
