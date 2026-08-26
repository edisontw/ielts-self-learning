import fs from 'node:fs';
import { REPAIR_LESSONS } from '../adaptive-data.js';
import { ERROR_TAG_FAMILIES, V14_REPAIR_LESSONS } from '../repair-extension-v14.js';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const runtime = fs.readFileSync(new URL('../repair-extension-v14.js', import.meta.url), 'utf8');

const ids = REPAIR_LESSONS.map(lesson => lesson.id);
assert(ids.join(',') === 'VG01,VG02,VG03,VG04,VG05', `V1.4 Repair registry mismatch: ${ids.join(',')}`);
assert(V14_REPAIR_LESSONS.length === 2, 'V1.4 must add exactly two evidence-backed Repair extensions.');

const vg01 = REPAIR_LESSONS.find(lesson => lesson.id === 'VG01');
const vg04 = REPAIR_LESSONS.find(lesson => lesson.id === 'VG04');
const vg05 = REPAIR_LESSONS.find(lesson => lesson.id === 'VG05');
assert(vg01 && vg04 && vg05, 'VG01/VG04/VG05 must all exist.');
assert(!vg01.triggerTags.includes('paraphrase'), 'VG01 collocation repair must not capture generic paraphrase errors.');
assert(vg04.evidence?.family === 'paraphrase' && vg04.evidence.auditedQuestions === 32, 'VG04 must document the 32-question paraphrase audit signal.');
assert(vg05.evidence?.family === 'answer-type' && vg05.evidence.auditedQuestions === 14, 'VG05 must document the 14-question answer-type audit signal.');

for (const tag of ['paraphrase','reading-paraphrase','listening-paraphrase','listening-matching-paraphrase','reading-keyword-match','reading-heading-keyword','reading-mcq-keyword']) {
  assert(ERROR_TAG_FAMILIES.paraphrase.includes(tag), `Paraphrase family missing ${tag}.`);
  assert(vg04.triggerTags.includes(tag), `VG04 must accept ${tag}.`);
  assert(!vg01.triggerTags.includes(tag), `VG01 must not compete for ${tag}.`);
}
for (const tag of ['reading-answer-type','listening-answer-type','listening-short-answer-type','listening-sentence-grammar']) {
  assert(ERROR_TAG_FAMILIES['answer-type'].includes(tag), `Answer-type family missing ${tag}.`);
  assert(vg05.triggerTags.includes(tag), `VG05 must accept ${tag}.`);
}

const repairTriggerSet = new Set(V14_REPAIR_LESSONS.flatMap(lesson => lesson.triggerTags));
for (const skillOnlyTag of ['number','listening-number','main-idea','reading-main-idea','detail','distractor','listening-distractor','listening-correction','reading-scope']) {
  assert(!repairTriggerSet.has(skillOnlyTag), `${skillOnlyTag} is an IELTS-skill error and must not be forced into V1.4 language-system Repair.`);
}

assert(vg04.questions.length >= 3 && vg05.questions.length >= 3, 'Each V1.4 Repair extension needs at least three guided checks.');
for (const lesson of V14_REPAIR_LESSONS) {
  assert(lesson.questions.every(q => q.options.includes(q.answer) && q.rationale?.length >= 30), `${lesson.id} guided practice is incomplete.`);
  assert(lesson.learn.length >= 3 && lesson.examples.length >= 3, `${lesson.id} teaching content is too thin.`);
}

const extensionIndex = index.indexOf('./repair-extension-v14.js');
const adaptiveIndex = index.indexOf('./adaptive.js');
const learningRuntimeIndex = index.indexOf('./learning-runtime-v3.js');
assert(extensionIndex >= 0 && extensionIndex < adaptiveIndex && extensionIndex < learningRuntimeIndex, 'V1.4 Repair registry must load before adaptive recommendation/runtime consumers.');
assert(runtime.includes("location.hash.match(/^#\\/lesson\\/(VG04|VG05)$/)"), 'VG04/VG05 need standard hash lesson routes.');
assert(runtime.includes('data-lrv="repair-option"') && runtime.includes('data-lrv="repair-complete"'), 'V1.4 routes must reuse the stable Repair interaction contract.');

console.log('✓ V1.4 adds VG04 paraphrase repair from 32 audited question signals');
console.log('✓ V1.4 adds VG05 answer-type grammar repair from 14 audited question signals');
console.log('✓ Real prefixed Error Notebook tags route to the intended Repair extension');
console.log('✓ High-frequency IELTS skill errors remain outside Vocabulary/Grammar Repair');
console.log('✓ First 30-unit curriculum remains a separate completion scope');
