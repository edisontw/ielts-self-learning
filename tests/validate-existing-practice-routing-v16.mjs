import fs from 'node:fs';
import { LESSONS } from '../data.js';
import '../curriculum-batch-01.js';
import '../question-type-lab-v1.js';
import '../question-type-lab-v2.js';
import {
  EXISTING_PRACTICE_FAMILIES,
  EXISTING_PRACTICE_RULES,
  existingPracticeRecommendationFor
} from '../existing-practice-routing-v16.js';
import {
  READING_EVIDENCE_QUESTION_TYPES,
  readingEvidenceQuestionType
} from '../reading-evidence-routing-v16.js';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const route = error => existingPracticeRecommendationFor(error);
const ids = error => {
  const rec = route(error);
  return rec ? [rec.primary.id, rec.transfer.id] : null;
};

assert(Object.keys(EXISTING_PRACTICE_FAMILIES).length === 11, 'Batch 5 must expose eleven existing-practice family/subtype cards');
assert(EXISTING_PRACTICE_FAMILIES['reading-detail'].auditedQuestions === 21, 'Reading detail count must remain 21');
assert(EXISTING_PRACTICE_FAMILIES['listening-detail'].auditedQuestions === 16, 'Listening detail count must remain 16');
assert(EXISTING_PRACTICE_FAMILIES['listening-distractor'].auditedQuestions === 14, 'Listening distractor count must remain 14');
assert(EXISTING_PRACTICE_FAMILIES['listening-correction'].auditedQuestions === 11, 'Listening correction count must remain 11');
assert(EXISTING_PRACTICE_FAMILIES['reading-scope'].auditedQuestions === 10, 'Reading scope count must remain 10');
assert(EXISTING_PRACTICE_FAMILIES['reading-information-function'].auditedQuestions === 10, 'Reading information-function count must remain 10');
assert(EXISTING_PRACTICE_FAMILIES['reading-evidence-tfng'].auditedQuestions === 2, 'Reading evidence TFNG subtype count must be 2 Mini Test items');
assert(EXISTING_PRACTICE_FAMILIES['reading-evidence-mcq'].auditedQuestions === 3, 'Reading evidence MCQ subtype count must be 3 Mini Test items');
assert(EXISTING_PRACTICE_FAMILIES['reading-contradiction'].auditedQuestions === 7, 'Reading contradiction count must remain 7');
assert(EXISTING_PRACTICE_FAMILIES['reading-not-given'].auditedQuestions === 7, 'Reading Not Given count must remain 7');
assert(EXISTING_PRACTICE_FAMILIES['reading-summary-logic'].auditedQuestions === 7, 'Reading summary-logic count must remain 7');

assert(JSON.stringify(ids({ skill:'reading', errorTag:'detail' })) === JSON.stringify(['R02','QR03']), 'Generic Reading detail must route to R02 → QR03');
assert(JSON.stringify(ids({ skill:'listening', errorTag:'detail' })) === JSON.stringify(['L05','QL05']), 'Generic Listening detail must route to L05 → QL05');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-heading-detail' })) === JSON.stringify(['R05','QR02']), 'Heading-specific detail must route to R05 → QR02');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-detail-confusion' })) === JSON.stringify(['R05','QR02']), 'Reading detail-confusion must route to R05 → QR02');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-mcq-detail' })) === JSON.stringify(['R02','QR03']), 'Reading MCQ detail must route to R02 → QR03');
assert(JSON.stringify(ids({ skill:'listening', errorTag:'listening-missed-detail' })) === JSON.stringify(['L05','QL05']), 'Listening missed detail must route to L05 → QL05');
assert(JSON.stringify(ids({ skill:'listening', errorTag:'listening-requested-detail' })) === JSON.stringify(['L05','QL05']), 'Listening requested detail must route to L05 → QL05');
assert(JSON.stringify(ids({ skill:'listening', errorTag:'distractor' })) === JSON.stringify(['L04','QL01']), 'Generic Listening distractor must route to L04 → QL01');
assert(JSON.stringify(ids({ skill:'listening', errorTag:'listening-correction' })) === JSON.stringify(['L04','QL06']), 'Listening correction must route to L04 → QL06');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-scope' })) === JSON.stringify(['R04','QR01']), 'Reading scope must route to R04 → QR01');

assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-information-function' })) === JSON.stringify(['R02','QR05']), 'Reading information-function must route to R02 → QR05');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-contradiction' })) === JSON.stringify(['R04','QR01']), 'Reading contradiction must route to R04 → QR01');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-not-given' })) === JSON.stringify(['R04','QR01']), 'Reading Not Given must route to R04 → QR01');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-summary-logic' })) === JSON.stringify(['R02','QR06']), 'Reading summary logic must route to R02 → QR06');

const evidenceIds = Object.keys(READING_EVIDENCE_QUESTION_TYPES).sort();
assert(JSON.stringify(evidenceIds) === JSON.stringify(['MR01-Q1','MR02-Q5','MR02-Q6','MR03-Q5','MR04-Q5']), 'Reading evidence question-type registry must cover exactly the five non-retriable Mini Test evidence items');
assert(readingEvidenceQuestionType({ skill:'reading', errorTag:'reading-evidence', questionId:'MR01-Q1' }) === 'true-false-not-given', 'MR01-Q1 must be classified as TFNG evidence');
assert(readingEvidenceQuestionType({ skill:'reading', errorTag:'reading-evidence', questionId:'MR03-Q5' }) === 'multiple-choice', 'MR03-Q5 must be classified as MCQ evidence');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-evidence', questionId:'MR01-Q1' })) === JSON.stringify(['R04','QR01']), 'TFNG Reading evidence must route to R04 → QR01');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-evidence', questionId:'MR02-Q6' })) === JSON.stringify(['R04','QR01']), 'Second TFNG Reading evidence item must route to R04 → QR01');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-evidence', questionId:'MR02-Q5' })) === JSON.stringify(['R02','QR03']), 'MCQ Reading evidence must route to R02 → QR03');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-evidence', questionId:'MR03-Q5' })) === JSON.stringify(['R02','QR03']), 'Supported-statement MCQ evidence must route to R02 → QR03');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-evidence', questionId:'MR04-Q5' })) === JSON.stringify(['R02','QR03']), 'Supporting-example MCQ evidence must route to R02 → QR03');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-evidence', questionType:'true-false-not-given' })) === JSON.stringify(['R04','QR01']), 'Explicit future TFNG metadata must route without a question-id registry entry');
assert(JSON.stringify(ids({ skill:'reading', errorTag:'reading-evidence', questionType:'multiple-choice' })) === JSON.stringify(['R02','QR03']), 'Explicit future MCQ metadata must route without a question-id registry entry');
assert(route({ skill:'reading', errorTag:'reading-evidence', questionId:'UNKNOWN-EVIDENCE' }) === null, 'Unknown Reading evidence must remain unrouted instead of guessing a transfer Lab');
assert(route({ skill:'reading', errorTag:'reading-evidence', questionId:'R02-Q1' }) === null, 'Core R02 evidence keeps direct lesson Retry and must not be forced into Mini Test transfer routing');
assert(route({ skill:'reading', errorTag:'reading-evidence', questionId:'R04-Q3' }) === null, 'Core R04 evidence keeps direct lesson Retry and must not be forced into Mini Test transfer routing');

assert(route({ skill:'reading', errorTag:'number' }) === null, 'Reading number must not enter existing-practice routing');
assert(route({ skill:'listening', errorTag:'main-idea' }) === null, 'Listening main idea must not enter existing-practice routing');
assert(route({ skill:'reading', errorTag:'reading-main-idea' }) === null, 'RR01 evidence must remain owned by Skill Repair');
assert(route({ skill:'reading', errorTag:'inference' }) === null, 'RR02 generic inference must remain owned by Skill Repair');
assert(route({ skill:'reading', errorTag:'reading-inference' }) === null, 'RR02 prefixed inference must remain owned by Skill Repair');
assert(route({ skill:'listening', errorTag:'number' }) === null, 'LR01 number must remain owned by Skill Repair');
assert(route({ skill:'listening', errorTag:'reading-scope' }) === null, 'Skill constraints must prevent cross-routing');

for (const rule of EXISTING_PRACTICE_RULES) {
  assert(LESSONS.some(item => item.id === rule.primary.id), `${rule.id} primary route does not exist: ${rule.primary.id}`);
  assert(LESSONS.some(item => item.id === rule.transfer.id), `${rule.id} transfer route does not exist: ${rule.transfer.id}`);
}

const runtime = fs.readFileSync('existing-practice-routing-runtime-v16.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
assert(runtime.includes('registerRenderEnhancement(renderExistingPracticeRouting)'), 'Existing-practice routing must reuse the shared V1.5 lifecycle');
assert(!runtime.includes('MutationObserver') && !runtime.includes('setInterval'), 'Existing-practice routing must not add observer/polling lifecycle debt');
assert(!runtime.includes('localStorage.setItem'), 'Existing-practice routing must remain recommendation-only and must not add learner state');
assert(runtime.includes('data-v16-existing-practice-improve'), 'Improve must expose a distinct existing-practice routing surface');
assert(runtime.includes('data-v16-existing-practice-error-route'), 'Error Notebook must expose per-error existing-practice navigation');
assert(runtime.includes('data-action="retry-error"'), 'Error Notebook routing must preserve original lesson Retry as the stronger action');
assert(index.includes('existing-practice-routing-runtime-v16.js'), 'Production index must load the existing-practice routing runtime');
assert(index.indexOf('skill-repair-runtime-v16.js') < index.indexOf('existing-practice-routing-runtime-v16.js'), 'Existing-practice surface must render after Skill Repair so the two recommendation types stay distinct');

console.log('✓ V1.6 Batch 5 classifies the five non-retriable Reading evidence Mini Test items by actual question type');
console.log('✓ Improve keeps TFNG evidence and MCQ evidence as separate subtype cards instead of collapsing two transfer routes');
console.log('✓ TFNG evidence → R04/QR01; MCQ evidence → R02/QR03; unknown evidence remains unrouted');
console.log('✓ Existing saved errors work from stable questionId values without learner-state or backup migration');
console.log('✓ Core R02/R04 evidence keeps direct lesson Retry and RR01/RR02/LR01 ownership remains unchanged');
