import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../data.js';
import { CORE_LESSON_META } from '../adaptive-data.js';
import { VOCABULARY_ITEMS } from '../learning-extension-data.js';
import { CURRICULUM_BATCH_01, BATCH_01_META, BATCH_01_VOCABULARY } from '../curriculum-batch-01.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const audioFallback = fs.readFileSync(path.join(root, 'audio-fallback.js'), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const requiredIds = ['R02','R03','R04','R05','L02','L03','L04','L05','W02','W03'];
const primaryRequestedIds = ['R02','R03','R04','R05','L02','L03','L04','L05'];

assert(CURRICULUM_BATCH_01.length === 10, 'Batch 01 must contain 10 complete lessons.');
assert(requiredIds.every(id => CURRICULUM_BATCH_01.some(l => l.id === id)), 'Batch 01 lesson IDs are incomplete.');
assert(primaryRequestedIds.every(id => LESSONS.some(l => l.id === id)), 'Requested Reading/Listening lessons must register in LESSONS.');
assert(requiredIds.every(id => CORE_LESSON_META.some(l => l.id === id)), 'Every Batch 01 lesson needs adaptive metadata.');
assert(BATCH_01_META.length === requiredIds.length, 'Batch metadata count must match the lesson count.');

const questionIds = [];
for (const lesson of CURRICULUM_BATCH_01) {
  assert(lesson.slug && lesson.title && lesson.description, `${lesson.id} must have identity fields.`);
  assert(lesson.skill && lesson.subskill && lesson.lessonType, `${lesson.id} must have classification fields.`);
  assert(lesson.cefr && lesson.ieltsRange && Number.isFinite(lesson.difficulty), `${lesson.id} must have level metadata.`);
  assert(Number.isFinite(lesson.estimatedMinutes) && lesson.estimatedMinutes >= 15, `${lesson.id} must have a realistic study time.`);
  assert(lesson.objective && lesson.chinese, `${lesson.id} must include objective and Chinese scaffolding.`);
  assert(Array.isArray(lesson.sections) && lesson.sections.length >= 7, `${lesson.id} must be a complete multi-stage lesson.`);
  assert(Array.isArray(lesson.errorTags) && lesson.errorTags.length >= 2, `${lesson.id} must expose adaptive error tags.`);
  assert(Array.isArray(lesson.repairLessons), `${lesson.id} must expose repair links.`);
  assert(Array.isArray(lesson.relatedLessons) && Array.isArray(lesson.nextLessons), `${lesson.id} must expose lesson graph links.`);
  const quizzes = lesson.sections.flatMap(section => section.blocks || []).filter(block => block.type === 'quiz');
  assert(quizzes.length >= 2, `${lesson.id} must contain checked practice.`);
  for (const q of quizzes) {
    assert(q.id && q.prompt && q.errorTag, `${lesson.id} quiz items need IDs, prompts, and error tags.`);
    assert(Array.isArray(q.options) && q.options.includes(q.answer), `${q.id} answer must be present in options.`);
    assert(q.rationale && q.rationale.length >= 20, `${q.id} must explain the answer.`);
    questionIds.push(q.id);
  }
}
assert(new Set(questionIds).size === questionIds.length, 'Batch 01 quiz IDs must be unique.');

assert(BATCH_01_VOCABULARY.length >= 8, 'Batch 01 should seed Vocabulary Review with lesson-derived items.');
for (const item of BATCH_01_VOCABULARY) {
  assert(requiredIds.includes(item.sourceLesson), `${item.id} must point to a Batch 01 source lesson.`);
  assert(CURRICULUM_BATCH_01.some(l => l.id === item.sourceLesson), `${item.id} source lesson must exist.`);
  assert(item.distractors.length >= 2, `${item.id} must include recall distractors.`);
  assert(item.collocations.length >= 2, `${item.id} must include collocation support.`);
  assert(VOCABULARY_ITEMS.some(v => v.id === item.id), `${item.id} must register in VOCABULARY_ITEMS.`);
}

const lessonScriptIndex = index.indexOf('./curriculum-batch-01.js');
const appScriptIndex = index.indexOf('./app.js');
assert(lessonScriptIndex >= 0, 'index.html must load curriculum-batch-01.js.');
assert(appScriptIndex >= 0 && lessonScriptIndex < appScriptIndex, 'Curriculum registration must load before app.js.');
assert(index.includes('./audio-fallback.js'), 'index.html must load browser audio fallback.');
for (const audio of ['l02-connected-speech.mp3','l03-listening-paraphrase.mp3','l04-distractors.mp3','l05-predict.mp3']) {
  assert(audioFallback.includes(audio), `Audio fallback must contain ${audio}.`);
}

console.log('✓ Curriculum Batch 01: R02–R05 / L02–L05 complete');
console.log('✓ Continuation step: W02–W03 complete');
console.log(`✓ ${questionIds.length} checked lesson questions have unique IDs, answers, rationales, and error tags`);
console.log(`✓ ${BATCH_01_VOCABULARY.length} lesson-derived Vocabulary Review items registered`);
console.log('✓ Adaptive metadata and lesson graph links registered');
console.log('✓ Listening browser-voice fallback loaded for L02–L05');
