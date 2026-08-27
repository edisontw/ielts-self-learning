import fs from 'node:fs';
import { REPAIR_LESSONS, repairMatchesError } from '../adaptive-data.js';
import '../repair-registry-v15.js';
import { V16_SKILL_REPAIR_FAMILIES, V16_SKILL_REPAIR_LESSONS } from '../skill-repair-registry-v16.js';
import { repairReadyToComplete } from '../repair-retry-v1.js';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const byId = id => V16_SKILL_REPAIR_LESSONS.find(lesson => lesson.id === id);

const rr01 = byId('RR01');
const rr02 = byId('RR02');
const lr01 = byId('LR01');
assert(rr01 && rr02 && lr01 && V16_SKILL_REPAIR_LESSONS.length === 3, 'V1.6 must register RR01, RR02 and LR01');

assert(V16_SKILL_REPAIR_FAMILIES['reading-main-idea'].auditedQuestions === 23, 'RR01 evidence count must match the skill-aware audit: 23 Reading main-idea signals');
assert(V16_SKILL_REPAIR_FAMILIES['listening-number'].auditedQuestions === 27, 'LR01 evidence count must match the skill-aware audit: 27 Listening number signals');
assert(V16_SKILL_REPAIR_FAMILIES['reading-inference'].auditedQuestions === 9, 'RR02 evidence count must match the skill-aware audit: 9 Reading inference signals');
assert(rr01.evidence?.auditedQuestions === 23 && lr01.evidence?.auditedQuestions === 27 && rr02.evidence?.auditedQuestions === 9, 'Lesson evidence metadata must preserve audited counts');

assert(repairMatchesError(rr01, { errorTag:'reading-main-idea', skill:'reading' }), 'RR01 must match reading-main-idea Reading errors');
assert(repairMatchesError(rr01, { errorTag:'main-idea', skill:'reading' }), 'RR01 must accept bare Full Mock main-idea only when the question skill is Reading');
assert(!repairMatchesError(rr01, { errorTag:'main-idea', skill:'listening' }), 'RR01 must reject bare Listening main-idea errors');
assert(repairMatchesError(lr01, { errorTag:'listening-number', skill:'listening' }), 'LR01 must match listening-number errors');
assert(repairMatchesError(lr01, { errorTag:'number', skill:'listening' }), 'LR01 must accept bare Full Mock number when the question skill is Listening');
assert(!repairMatchesError(lr01, { errorTag:'number', skill:'reading' }), 'LR01 must reject a number tag if the question skill is not Listening');
assert(repairMatchesError(rr02, { errorTag:'reading-inference', skill:'reading' }), 'RR02 must match reading-inference Reading errors');
assert(repairMatchesError(rr02, { errorTag:'inference', skill:'reading' }), 'RR02 must accept bare Full Mock inference only when the question skill is Reading');
assert(!repairMatchesError(rr02, { errorTag:'inference', skill:'listening' }), 'RR02 must reject bare Listening inference errors');

const vg04 = REPAIR_LESSONS.find(lesson => lesson.id === 'VG04');
assert(vg04 && repairMatchesError(vg04, { errorTag:'reading-paraphrase', skill:'reading' }), 'Existing cross-skill VG04 routing must remain compatible when no errorSkills constraint is declared');
assert(!REPAIR_LESSONS.some(lesson => /^R[RL]\d+|^LR\d+/.test(lesson.id)), 'V1.6 skill Repair must stay separate from the Vocabulary / Grammar REPAIR_LESSONS registry');

for (const lesson of V16_SKILL_REPAIR_LESSONS) {
  assert(lesson.requiresErrorEvidence === true, `${lesson.id} must require observed error evidence`);
  assert(Array.isArray(lesson.errorSkills) && lesson.errorSkills.length === 1, `${lesson.id} must declare one explicit skill constraint`);
  assert(lesson.questions?.length === 3, `${lesson.id} must provide three guided-practice checks`);
  for (const [index, question] of lesson.questions.entries()) {
    assert(question.options.includes(question.answer), `${lesson.id} Q${index + 1} answer must exist in its options`);
    assert(question.rationale?.length > 20, `${lesson.id} Q${index + 1} needs a meaningful rationale`);
  }
  const allCorrect = { answers:{} };
  lesson.questions.forEach((question, index) => { allCorrect.answers[index] = { selected:question.answer, checked:true }; });
  assert(repairReadyToComplete(lesson, allCorrect), `${lesson.id} must reuse the all-correct Repair mastery gate`);
  const oneWrong = structuredClone(allCorrect);
  oneWrong.answers[0].selected = lesson.questions[0].options.find(option => option !== lesson.questions[0].answer);
  assert(!repairReadyToComplete(lesson, oneWrong), `${lesson.id} must block completion while any guided answer is wrong`);
}

assert(rr01.questions.every(question => question.context?.length > 100), 'RR01 must use new paragraph contexts rather than context-free main-idea questions');
assert(rr02.questions.every(question => question.context?.length > 100), 'RR02 must use new evidence contexts rather than context-free inference questions');
for (const question of rr02.questions) {
  assert(question.options.some(option => /always|every|only cause|entirely|sharp/i.test(option)), 'RR02 should include an overclaim/speculation distractor in each guided check');
}
assert(lr01.media?.length === 2, 'LR01 must use two production Listening recordings');
for (const media of lr01.media) {
  assert(media.src.startsWith('media/audio/question-type-labs/'), `LR01 media must reuse a Question Type Lab production asset: ${media.src}`);
  assert(fs.existsSync(media.src), `Missing LR01 production audio: ${media.src}`);
  assert(fs.statSync(media.src).size > 1000, `LR01 production audio is unexpectedly small: ${media.src}`);
  assert(media.transcript?.length > 80, `LR01 media must retain a practice transcript for post-attempt review: ${media.id}`);
}

const indexHTML = fs.readFileSync('index.html', 'utf8');
const routeRuntime = fs.readFileSync('repair-route-v15.js', 'utf8');
const skillRuntime = fs.readFileSync('skill-repair-runtime-v16.js', 'utf8');
assert(indexHTML.includes('skill-repair-runtime-v16.js'), 'Production index must load the V1.6 skill Repair runtime');
assert(routeRuntime.includes('(?:VG|RR|LR)'), 'Unified Repair route must accept VG, RR and LR IDs');
assert(routeRuntime.includes('V16_SKILL_REPAIR_LESSONS'), 'Unified Repair route must resolve V1.6 skill Repair data');
assert(routeRuntime.includes('<audio controls'), 'Unified Repair route must render LR01 production audio controls');
assert(routeRuntime.includes('question.context'), 'Unified Repair route must render RR01/RR02 reading contexts');
assert(skillRuntime.includes('repairMatchesError'), 'Skill Repair recommendations must use tag + skill matching');
assert(skillRuntime.includes('data-v16-skill-repair-improve'), 'Improve must expose a separate V1.6 Skill Repair surface');
assert(skillRuntime.includes('data-v16-skill-repair-learn'), 'Learn must expose a separate V1.6 Skill Repair index');
assert(!skillRuntime.includes('MutationObserver') && !skillRuntime.includes('setInterval'), 'V1.6 must stay on the shared event-driven lifecycle');

console.log('✓ V1.6 RR01 uses 23 skill-aware Reading main-idea signals');
console.log('✓ V1.6 LR01 uses 27 skill-aware Listening number signals and real production audio');
console.log('✓ V1.6 Batch 2 RR02 uses 9 recurrent Reading inference signals identified as the only untreated overlap-audit gap');
console.log('✓ Bare Full Mock main-idea / number / inference tags cannot cross-route between Reading and Listening Skill Repair');
console.log('✓ RR01 / RR02 / LR01 remain outside Vocabulary / Grammar Repair and the 30-unit core denominator');
console.log('✓ V1.6 reuses the V1.5 lifecycle and all-correct Repair mastery gate');
