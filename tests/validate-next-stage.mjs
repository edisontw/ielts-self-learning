import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../data.js';
import { CORE_LESSON_META } from '../adaptive-data.js';
import { VOCABULARY_ITEMS } from '../learning-extension-data.js';
import { QUESTION_TYPE_LABS, QUESTION_TYPE_LAB_META, QUESTION_TYPE_LAB_VOCABULARY } from '../question-type-lab-v1.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const productive = fs.readFileSync(path.join(root, 'productive-evidence-v1.js'), 'utf8');
const labUI = fs.readFileSync(path.join(root, 'question-type-lab-ui.js'), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const ids = ['QR01','QR02','QL01','QL02'];
assert(QUESTION_TYPE_LABS.length === 4, 'Question Type Lab V1 must contain exactly 4 first-batch labs.');
assert(ids.every(id => QUESTION_TYPE_LABS.some(l => l.id === id)), 'Question Type Lab IDs are incomplete.');
assert(ids.every(id => LESSONS.some(l => l.id === id)), 'Every lab must register in LESSONS.');
assert(ids.every(id => CORE_LESSON_META.some(l => l.id === id)), 'Every lab must register adaptive metadata.');
assert(QUESTION_TYPE_LAB_META.length === 4, 'Question Type Lab metadata must match lab count.');

const questionIds = [];
for (const lab of QUESTION_TYPE_LABS) {
  assert(lab.lessonType === 'question-type', `${lab.id} must use question-type lessonType.`);
  assert(['reading','listening'].includes(lab.skill), `${lab.id} must be Reading or Listening.`);
  assert(lab.questionType && lab.examRelevance === 'very-high', `${lab.id} must expose IELTS question-type metadata.`);
  assert(Array.isArray(lab.sections) && lab.sections.length >= 7, `${lab.id} must be a complete lab.`);
  assert(Array.isArray(lab.errorTags) && lab.errorTags.length >= 3, `${lab.id} needs diagnostic error tags.`);
  assert(Array.isArray(lab.repairLessons) && lab.repairLessons.length >= 1, `${lab.id} needs repair links.`);
  const quizzes = lab.sections.flatMap(s => s.blocks || []).filter(b => b.type === 'quiz');
  assert(quizzes.length >= 3, `${lab.id} must include checked practice.`);
  for (const q of quizzes) {
    assert(q.id && q.errorTag, `${lab.id} quiz needs ID and error tag.`);
    assert(q.options.includes(q.answer), `${q.id} answer must appear in options.`);
    assert(q.rationale?.length >= 20, `${q.id} needs explanatory rationale.`);
    questionIds.push(q.id);
  }
}
assert(new Set(questionIds).size === questionIds.length, 'Question Type Lab quiz IDs must be unique.');

assert(QUESTION_TYPE_LAB_VOCABULARY.length === 4, 'Each first-batch lab should seed one vocabulary item.');
for (const item of QUESTION_TYPE_LAB_VOCABULARY) {
  assert(ids.includes(item.sourceLesson), `${item.id} must point to a Question Type Lab.`);
  assert(VOCABULARY_ITEMS.some(v => v.id === item.id), `${item.id} must register in Vocabulary Review.`);
}

const labIndex = index.indexOf('./question-type-lab-v1.js');
const appIndex = index.indexOf('./app.js');
assert(labIndex >= 0 && appIndex > labIndex, 'Question Type Lab registry must load before app.js.');
assert(index.includes('./question-type-lab-ui.js'), 'Question Type Lab UI must load.');
assert(index.includes('./productive-evidence-v1.js'), 'Productive evidence runtime must load.');
assert(labUI.includes('data-question-type-lab-index'), 'IELTS page must expose a dedicated Question Type Lab index.');

for (const token of ['productiveEvidence','attemptKind','writing','speaking','data-productive-today','data-productive-progress','process evidence']) {
  assert(productive.toLowerCase().includes(token.toLowerCase()), `Productive evidence runtime is missing ${token}.`);
}
assert(productive.includes("['task','I answered the exact task.']"), 'Writing evidence must include task fulfilment self-check.');
assert(productive.includes("['continuity','I continued after small mistakes instead of restarting.']"), 'Speaking evidence must include continuity/retry behaviour.');
assert(productive.includes("attemptKind === 'retry'"), 'Productive evidence must distinguish retry attempts.');
assert(productive.includes('not an IELTS band score'), 'Productive evidence must explicitly avoid false band scoring.');

console.log('✓ Productive evidence: Writing + Speaking first/retry process signals');
console.log('✓ Productive evidence remains separate from objective-question accuracy');
console.log('✓ Question Type Lab V1: QR01 / QR02 / QL01 / QL02 registered');
console.log(`✓ ${questionIds.length} Question Type Lab checks have answers, rationales, and error tags`);
console.log('✓ Question Type Lab vocabulary and IELTS index registered');
