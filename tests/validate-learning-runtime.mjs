import fs from 'node:fs';
import { VOCABULARY_ITEMS, VOCAB_REVIEW_RATINGS } from '../learning-extension-data.js';
import { REPAIR_LESSONS } from '../adaptive-data.js';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../learning-extension.css', import.meta.url), 'utf8');
const runtime = fs.readFileSync(new URL('../learning-runtime-v3.js', import.meta.url), 'utf8');
const repairIndex = fs.readFileSync(new URL('../learn-repair-cards.js', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(index.includes('./learning-extension.css'), 'Learning extension CSS must be loaded.');
assert(index.includes('./learning-runtime-v3.js'), 'Stable learning runtime v3 must be loaded.');
assert(index.includes('./learn-repair-cards.js'), 'Learn index must load repair lesson cards.');
assert(!index.includes('./learning-runtime-v2.js'), 'Superseded runtime v2 must not be loaded.');
assert(VOCABULARY_ITEMS.length >= 8, 'Vocabulary review should seed at least 8 lesson-based items.');
assert(new Set(VOCABULARY_ITEMS.map(x => x.id)).size === VOCABULARY_ITEMS.length, 'Vocabulary item IDs must be unique.');
assert(VOCABULARY_ITEMS.every(x => x.term && x.sourceLesson && x.answer && x.distractors.length >= 2), 'Every vocabulary item needs source, answer and distractors.');
assert(Object.keys(VOCAB_REVIEW_RATINGS).join(',') === 'again,hard,good,easy', 'Vocabulary review ratings must remain Again/Hard/Good/Easy.');
assert(REPAIR_LESSONS.map(x => x.id).join(',') === 'VG01,VG02,VG03', 'Repair lesson routes must remain VG01–VG03.');
assert(runtime.includes("#/lesson/${oldRepair.dataset.repairId}"), 'Repair recommendations must route to standard lesson URLs.');
assert(runtime.includes('skillPerformance'), 'Runtime must calculate observed skill performance.');
assert(runtime.includes('Placement starts the profile'), 'Today recommendation must explain placement-to-performance transition.');
assert(runtime.includes('previous?.answered === stat.answered'), 'Runtime must avoid rewriting unchanged performance state.');
assert(runtime.includes("localStorage.getItem(ADAPTIVE_KEY) !== next"), 'Runtime must avoid redundant localStorage writes.');
assert(repairIndex.includes('data-lesson="${lesson.id}"'), 'Learn repair cards must use the standard data-lesson route contract.');
assert(css.includes('min-height:44px'), 'Mobile QA CSS must preserve 44px primary tap targets.');
assert(css.includes('env(safe-area-inset-bottom)'), 'Mobile bottom navigation should respect safe-area inset.');

console.log('✓ Stable throttled learning runtime v3 is mounted');
console.log('✓ VG01–VG03 use standard lesson routes and Learn index cards');
console.log(`✓ Vocabulary Review: ${VOCABULARY_ITEMS.length} lesson-based items`);
console.log('✓ Skill performance feeds adaptive profile without redundant storage writes');
console.log('✓ Mobile QA guardrails present');
