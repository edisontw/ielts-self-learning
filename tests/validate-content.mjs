import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_LESSON_META, REPAIR_LESSONS, RECOMMENDATION_WEIGHTS, REVIEW_RATINGS } from '../adaptive-data.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const placementPath = path.join(root, 'content', 'placement', 'quick-placement-v1.json');
const indexPath = path.join(root, 'index.html');
const placement = JSON.parse(fs.readFileSync(placementPath, 'utf8'));
const index = fs.readFileSync(indexPath, 'utf8');

const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(Array.isArray(placement.sections) && placement.sections.length === 4, 'Placement must have exactly 4 sections.');
assert(placement.sections.every(s => s.questions.length === 6), 'Every placement section must have exactly 6 questions.');
const questions = placement.sections.flatMap(s => s.questions);
assert(questions.length === 24, 'Placement must have exactly 24 questions.');
assert(new Set(questions.map(q => q.id)).size === 24, 'Placement question IDs must be unique.');
assert(questions.every(q => q.options.includes(q.answer)), 'Every placement answer must be present in its options.');

assert(CORE_LESSON_META.length === 5, 'Adaptive recommendation engine expects 5 core V1.2 lessons.');
assert(new Set(CORE_LESSON_META.map(l => l.id)).size === CORE_LESSON_META.length, 'Core lesson IDs must be unique.');
assert(REPAIR_LESSONS.length === 3, 'V1 repair layer expects VG01–VG03.');
assert(REPAIR_LESSONS.every(l => l.lessonType === 'repair'), 'All VG objects must be repair lessons.');
assert(REPAIR_LESSONS.every(l => l.questions.every(q => q.options.includes(q.answer))), 'Repair answers must appear in options.');
assert(Object.keys(REVIEW_RATINGS).join(',') === 'again,hard,good,easy', 'Review ratings must remain Again/Hard/Good/Easy.');

const positiveWeightTotal = RECOMMENDATION_WEIGHTS.weakness + RECOMMENDATION_WEIGHTS.dueReview + RECOMMENDATION_WEIGHTS.targetRelevance + RECOMMENDATION_WEIGHTS.skillBalance + RECOMMENDATION_WEIGHTS.difficultyMatch + RECOMMENDATION_WEIGHTS.timeMatch;
assert(positiveWeightTotal === 100, 'Positive Today recommendation weights must total 100.');
assert(RECOMMENDATION_WEIGHTS.recentRepetitionPenalty > 0, 'Recent repetition penalty must be positive.');

assert(index.includes('./adaptive.css'), 'index.html must load adaptive.css.');
assert(index.includes('./adaptive.js'), 'index.html must load adaptive.js.');

console.log('✓ Placement: 4 sections / 24 unique questions');
console.log('✓ Adaptive Today weights: 100% + repetition penalty');
console.log('✓ Review Queue ratings and scheduling data valid');
console.log('✓ Repair lessons: VG01 / VG02 / VG03 valid');
console.log('✓ Adaptive CSS/JS loaded by index.html');
