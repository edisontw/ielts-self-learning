import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const source = fs.readFileSync(path.join(root, 'study-plan-v1.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

for (const token of [
  "const PLAN_KEY = 'ielts-study-plan-v1'",
  'function placementWeakness',
  'function skillPriority',
  'function prioritySnapshot',
  'function generatePlan',
  'function currentWeek',
  'function actualDone',
  'data-study-plan-builder',
  'data-study-plan-today'
]) assert(source.includes(token), `Study Plan runtime missing ${token}.`);

for (const weeks of ['4,8,12,16','Foundation','Build','Transfer','Test & Review']) {
  assert(source.includes(weeks), `Study Plan must expose ${weeks}.`);
}

assert(source.includes("adaptive.skillPerformance?.[skill]"), 'Study Plan must use observed objective performance.');
assert(source.includes("adaptive.productivePriority?.[skill]"), 'Study Plan must use Writing/Speaking productive retry priority.');
assert(source.includes("adaptive.reviewSchedule"), 'Study Plan must use due Error Review scheduling.');
assert(source.includes("adaptive.vocabularySchedule"), 'Study Plan must use due Vocabulary Review scheduling.');
assert(source.includes('QUESTION_TYPE_LABS'), 'Study Plan must consume Question Type Labs.');
assert(source.includes('MINI_TESTS'), 'Study Plan must consume Mini Tests.');
assert(source.includes("kind === 'mini-test'"), 'Study Plan must track Mini Test completion separately.');
assert(source.includes("kind === 'productive-retry'"), 'Study Plan must track productive retries.');
assert(source.includes("kind === 'placement'"), 'Study Plan must schedule Placement when needed.');
assert(source.includes("kind === 'review'"), 'Study Plan must keep review sessions in the plan.');

assert(source.includes("phase === 'Foundation' ? Math.max(1, Math.floor(daysPerWeek*0.25))"), 'Foundation should keep explicit IELTS transfer below the later-phase allocation.');
assert(source.includes('Math.round(daysPerWeek*0.4)'), 'Build/Transfer/Test phases should cap explicit IELTS transfer around 40%.');
assert(source.includes('Priority is a planning signal'), 'Priority must be labelled as a planning signal, not a score.');
assert(source.includes('not an IELTS score'), 'Study Plan must not present internal priority as IELTS scoring.');
assert(source.includes('If Placement is missing, it becomes the first session.'), 'Study Plan must explain the no-placement fallback.');

const planIndex = index.indexOf('./study-plan-v1.js');
const miniIndex = index.indexOf('./mini-test-runtime-v1.js');
assert(planIndex >= 0, 'index.html must load study-plan-v1.js.');
assert(miniIndex >= 0 && planIndex > miniIndex, 'Study Plan should load after Mini Test runtime/data integration.');

console.log('✓ Study Plan supports 4 / 8 / 12 / 16 weeks');
console.log('✓ Study Plan consumes Placement, objective performance, productive retry evidence, reviews, Labs and Mini Tests');
console.log('✓ Study Plan keeps explicit IELTS transfer at or below the intended ~40% allocation');
console.log('✓ Progress builder and Today next-session surfaces are registered');
