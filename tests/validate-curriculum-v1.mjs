import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS, SKILL_META } from '../data.js';
import { REPAIR_LESSONS, CORE_LESSON_META } from '../adaptive-data.js';
import { VOCABULARY_ITEMS } from '../learning-extension-data.js';
import '../curriculum-batch-01.js';
import { CURRICULUM_BATCH_02, BATCH_02_META, BATCH_02_VOCABULARY } from '../curriculum-batch-02.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'curriculum-ui-v1.js'), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const expected = {
  'learning-better': ['LB01','LB02','LB03','LB04'],
  reading: ['R01','R02','R03','R04','R05'],
  listening: ['L01','L02','L03','L04','L05'],
  writing: ['W01','W02','W03','W04','W05'],
  speaking: ['S01','S02','S03','S04','S05'],
  repair: ['VG01','VG02','VG03'],
  'ielts-strategy': ['I01','I02','I03']
};
const expectedIds = Object.values(expected).flat();
const batchIds = ['LB02','LB03','LB04','W04','W05','S02','S03','S04','S05','I01','I02','I03'];

assert(expectedIds.length === 30 && new Set(expectedIds).size === 30, 'Curriculum map must define 30 unique unit IDs.');
assert(CURRICULUM_BATCH_02.length === 12, 'Batch 02 must contain the 12 remaining curriculum lessons.');
assert(batchIds.every(id => CURRICULUM_BATCH_02.some(l => l.id === id)), 'Batch 02 lesson IDs are incomplete.');
assert(expected['repair'].every(id => REPAIR_LESSONS.some(l => l.id === id)), 'VG01–VG03 repair lessons must remain available.');
assert(expectedIds.filter(id => !id.startsWith('VG')).every(id => LESSONS.some(l => l.id === id)), 'All non-repair curriculum units must register in LESSONS.');
assert(expectedIds.filter(id => !id.startsWith('VG')).every(id => CORE_LESSON_META.some(l => l.id === id)), 'Every non-repair curriculum unit needs adaptive metadata.');
assert(BATCH_02_META.length === CURRICULUM_BATCH_02.length, 'Batch 02 adaptive metadata must match lesson count.');
assert(SKILL_META['ielts-strategy']?.label === 'IELTS Strategy', 'IELTS Strategy skill metadata must be registered.');

const questionIds = [];
for (const lesson of CURRICULUM_BATCH_02) {
  assert(lesson.slug && lesson.title && lesson.description, `${lesson.id}: identity fields missing.`);
  assert(lesson.skill && lesson.subskill && lesson.lessonType, `${lesson.id}: classification fields missing.`);
  assert(lesson.cefr && lesson.ieltsRange && Number.isFinite(lesson.difficulty), `${lesson.id}: level metadata missing.`);
  assert(Number.isFinite(lesson.estimatedMinutes) && lesson.estimatedMinutes >= 12, `${lesson.id}: study time invalid.`);
  assert(lesson.objective && lesson.chinese, `${lesson.id}: objective or Chinese scaffolding missing.`);
  assert(Array.isArray(lesson.sections) && lesson.sections.length >= 7, `${lesson.id}: must contain at least 7 stages.`);
  assert(Array.isArray(lesson.errorTags) && lesson.errorTags.length >= 2, `${lesson.id}: adaptive error tags missing.`);
  assert(Array.isArray(lesson.repairLessons) && Array.isArray(lesson.relatedLessons) && Array.isArray(lesson.nextLessons), `${lesson.id}: lesson graph fields missing.`);
  const quizzes = lesson.sections.flatMap(s => s.blocks || []).filter(b => b.type === 'quiz');
  assert(quizzes.length >= 2, `${lesson.id}: needs at least two checked questions.`);
  for (const q of quizzes) {
    assert(q.id && q.prompt && q.errorTag, `${lesson.id}: quiz identity/error tag missing.`);
    assert(Array.isArray(q.options) && q.options.includes(q.answer), `${q.id}: answer must occur in options.`);
    assert(q.rationale?.length >= 20, `${q.id}: rationale must explain the answer.`);
    questionIds.push(q.id);
  }
}
assert(new Set(questionIds).size === questionIds.length, 'Batch 02 quiz IDs must be unique.');

assert(BATCH_02_VOCABULARY.length >= 8, 'Batch 02 should add lesson-derived Vocabulary Review items.');
for (const item of BATCH_02_VOCABULARY) {
  assert(batchIds.includes(item.sourceLesson), `${item.id}: vocabulary source must be a Batch 02 lesson.`);
  assert(item.collocations?.length >= 2 && item.distractors?.length >= 2, `${item.id}: vocabulary review support is incomplete.`);
  assert(VOCABULARY_ITEMS.some(v => v.id === item.id), `${item.id}: vocabulary item failed to register.`);
}

const distribution = {
  'learning-better': LESSONS.filter(l => l.skill === 'learning-better' && expected['learning-better'].includes(l.id)).length,
  reading: LESSONS.filter(l => l.skill === 'reading' && expected.reading.includes(l.id)).length,
  listening: LESSONS.filter(l => l.skill === 'listening' && expected.listening.includes(l.id)).length,
  writing: LESSONS.filter(l => l.skill === 'writing' && expected.writing.includes(l.id)).length,
  speaking: LESSONS.filter(l => l.skill === 'speaking' && expected.speaking.includes(l.id)).length,
  repair: REPAIR_LESSONS.filter(l => expected.repair.includes(l.id)).length,
  'ielts-strategy': LESSONS.filter(l => l.skill === 'ielts-strategy' && expected['ielts-strategy'].includes(l.id)).length
};
assert(JSON.stringify(distribution) === JSON.stringify({'learning-better':4,reading:5,listening:5,writing:5,speaking:5,repair:3,'ielts-strategy':3}), `Curriculum distribution mismatch: ${JSON.stringify(distribution)}`);

const batch02Index = index.indexOf('./curriculum-batch-02.js');
const appIndex = index.indexOf('./app.js');
assert(batch02Index >= 0 && batch02Index < appIndex, 'Batch 02 must register before app.js.');
assert(index.includes('./curriculum-ui-v1.js'), 'Curriculum UI integration must be loaded.');
assert(ui.includes("data.ieltsStrategyIndex") || ui.includes('ieltsStrategyIndex'), 'IELTS Strategy UI integration missing.');
assert(ui.includes('/30'), 'Progress UI must represent the 30-unit curriculum.');
assert(ui.includes('First 30-unit curriculum complete'), 'Learn scope message must be updated for the completed curriculum.');

console.log('✓ First curriculum complete: 30 unique units');
console.log('✓ Distribution: LB 4 / Reading 5 / Listening 5 / Writing 5 / Speaking 5 / VG Repair 3 / IELTS Strategy 3');
console.log(`✓ Batch 02: 12 complete lessons / ${questionIds.length} checked questions`);
console.log(`✓ Batch 02 Vocabulary Review: ${BATCH_02_VOCABULARY.length} items`);
console.log('✓ IELTS Strategy page integration and 30-unit progress UI present');
