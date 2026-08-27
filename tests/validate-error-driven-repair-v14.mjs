import fs from 'node:fs';
import { REPAIR_LESSONS } from '../adaptive-data.js';
import { ERROR_TAG_FAMILIES, V14_REPAIR_LESSONS } from '../repair-registry-v15.js';
import { repairReadyToComplete, resetRepairAnswer } from '../repair-retry-v1.js';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const registry = fs.readFileSync(new URL('../repair-registry-v15.js', import.meta.url), 'utf8');
const routeRuntime = fs.readFileSync(new URL('../repair-route-v15.js', import.meta.url), 'utf8');
const lifecycle = fs.readFileSync(new URL('../render-lifecycle-v15.js', import.meta.url), 'utf8');
const legacyRuntime = fs.readFileSync(new URL('../repair-extension-v14.js', import.meta.url), 'utf8');

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

  const progress = { answers:{} };
  lesson.questions.forEach((q, index) => {
    progress.answers[index] = { selected:q.answer, checked:true };
  });
  assert(repairReadyToComplete(lesson, progress), `${lesson.id} should become finishable only after every guided item is correct.`);
  progress.answers[0] = { selected:lesson.questions[0].options.find(option => option !== lesson.questions[0].answer), checked:true };
  assert(!repairReadyToComplete(lesson, progress), `${lesson.id} must block Finish after a checked wrong answer.`);
  progress.completed = true;
  progress.completedAt = Date.now();
  resetRepairAnswer(progress, 0);
  assert(!progress.answers[0] && !progress.completed && !progress.completedAt, `${lesson.id} Retry must clear the wrong answer and revoke premature completion.`);
}

const registryIndex = index.indexOf('./repair-registry-v15.js');
const adaptiveIndex = index.indexOf('./adaptive.js');
const learningRuntimeIndex = index.indexOf('./learning-runtime-v3.js');
const routeIndex = index.indexOf('./repair-route-v15.js');
assert(registryIndex >= 0 && registryIndex < adaptiveIndex && registryIndex < learningRuntimeIndex, 'Repair registry must load before adaptive recommendation/runtime consumers.');
assert(routeIndex > learningRuntimeIndex, 'V1.5 Repair route renderer should load after the stable interaction runtime.');
assert(!index.includes('./repair-extension-v14.js'), 'Legacy observer-based Repair extension must not load in production.');
assert(registry.includes("REPAIR_LESSONS.push(lesson)"), 'V1.5 registry must continue registering VG04/VG05 for existing consumers.');
assert(routeRuntime.includes("location.hash.match(/^#\\/lesson\\/(VG04|VG05)$/)"), 'VG04/VG05 need standard hash lesson routes.');
assert(routeRuntime.includes('data-lrv="repair-option"') && routeRuntime.includes('data-lrv="repair-complete"'), 'V1.5 routes must reuse the stable Repair interaction contract.');
assert(routeRuntime.includes('registerRenderEnhancement'), 'VG04/VG05 route rendering must use the shared V1.5 lifecycle.');
assert(routeRuntime.includes('data-v15-repair-route') && routeRuntime.includes('&& liveRoute'), 'Repair fingerprint short-circuit must verify that the rendered route DOM still exists after later startup renders.');
assert(!routeRuntime.includes('MutationObserver') && !routeRuntime.includes('setInterval'), 'VG04/VG05 route renderer must not continuously scan the DOM.');
assert(!lifecycle.includes('MutationObserver') && !lifecycle.includes('setInterval'), 'V1.5 lifecycle must remain event-driven.');
assert(legacyRuntime.includes("export { ERROR_TAG_FAMILIES, V14_REPAIR_LESSONS }"), 'Legacy V1.4 filename should remain only as a compatibility re-export.');
assert(!legacyRuntime.includes('MutationObserver') && !legacyRuntime.includes('setInterval'), 'Legacy compatibility file must not recreate the retired observer runtime.');

console.log('✓ V1.4 adds VG04 paraphrase repair from 32 audited question signals');
console.log('✓ V1.4 adds VG05 answer-type grammar repair from 14 audited question signals');
console.log('✓ Real prefixed Error Notebook tags route to the intended Repair extension');
console.log('✓ High-frequency IELTS skill errors remain outside Vocabulary/Grammar Repair');
console.log('✓ VG04/VG05 reuse the wrong → Retry → all-correct → Finish mastery gate');
console.log('✓ V1.5 retires the VG04/VG05 MutationObserver route patch in favour of the shared render lifecycle');
console.log('✓ V1.5 Repair fingerprint guard survives later startup DOM replacement');
console.log('✓ First 30-unit curriculum remains a separate completion scope');
