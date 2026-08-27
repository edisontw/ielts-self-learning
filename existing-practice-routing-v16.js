import { readingEvidenceQuestionType } from './reading-evidence-routing-v16.js';

export const EXISTING_PRACTICE_FAMILIES = {
  'reading-detail': {
    label: 'Reading detail',
    skill: 'reading',
    auditedQuestions: 21,
    coverage: ['R02', 'R05', 'QR02', 'QR03'],
    reason: 'Claim/detail separation, heading detail traps, and true-but-irrelevant MCQ details are already taught in Core and Labs.'
  },
  'listening-detail': {
    label: 'Listening detail',
    skill: 'listening',
    auditedQuestions: 16,
    coverage: ['L02', 'L03', 'L05', 'QL05'],
    reason: 'Chunked detail retrieval, paraphrased detail, answer prediction, and exact requested detail are already taught.'
  },
  'listening-distractor': {
    label: 'Listening distractor',
    skill: 'listening',
    auditedQuestions: 14,
    coverage: ['L04', 'QL01'],
    reason: 'L04 and QL01 already teach first mention → correction/rejection → final option tracking.'
  },
  'listening-correction': {
    label: 'Listening correction',
    skill: 'listening',
    auditedQuestions: 11,
    coverage: ['L04', 'QL06'],
    reason: 'Correction language and delayed commitment are explicit teaching targets in existing Listening practice.'
  },
  'reading-scope': {
    label: 'Reading scope',
    skill: 'reading',
    auditedQuestions: 10,
    coverage: ['R04', 'QR01', 'QR03'],
    reason: 'R04 and QR01 teach exact-claim scope; QR03 reinforces broad/narrow option traps.'
  },
  'reading-information-function': {
    label: 'Reading information function',
    skill: 'reading',
    auditedQuestions: 10,
    coverage: ['R02', 'QR05'],
    reason: 'R02 teaches sentence/paragraph roles, while QR05 directly practises locating a finding, criticism, reason, example, or other requested information function.'
  },
  'reading-evidence': {
    label: 'Reading evidence',
    skill: 'reading',
    auditedQuestions: 9,
    coverage: ['R02', 'R04', 'QR01', 'QR03'],
    reason: 'Core R02/R04 evidence errors keep direct Retry. Mini Test evidence is routed by question type: TFNG evidence → R04/QR01; supported-statement or supporting-example MCQ evidence → R02/QR03.'
  },
  'reading-contradiction': {
    label: 'Reading contradiction',
    skill: 'reading',
    auditedQuestions: 7,
    coverage: ['R04', 'QR01'],
    reason: 'R04 and QR01 already teach exact-claim comparison: False requires evidence that contradicts the statement, not merely missing support.'
  },
  'reading-not-given': {
    label: 'Reading Not Given',
    skill: 'reading',
    auditedQuestions: 7,
    coverage: ['R04', 'QR01'],
    reason: 'R04 and QR01 already teach the key boundary between contradiction and absent evidence, so another Repair unit would duplicate TFNG instruction.'
  },
  'reading-summary-logic': {
    label: 'Reading summary logic',
    skill: 'reading',
    auditedQuestions: 7,
    coverage: ['R02', 'QR06'],
    reason: 'R02 teaches text structure and logical roles; QR06 directly practises following the compressed purpose → development → limitation → solution sequence in a summary.'
  }
};

const lesson = (id, title) => ({ id, title });

// Specific rules precede generic Full Mock fallbacks.
export const EXISTING_PRACTICE_RULES = [
  {
    id: 'reading-heading-detail',
    family: 'reading-detail',
    skills: ['reading'],
    tags: ['reading-heading-detail', 'reading-detail-confusion'],
    primary: lesson('R05', 'Matching Headings Without Reading Every Line'),
    transfer: lesson('QR02', 'Question Type Lab: Matching Headings')
  },
  {
    id: 'reading-mcq-detail',
    family: 'reading-detail',
    skills: ['reading'],
    tags: ['reading-mcq-detail'],
    primary: lesson('R02', 'Read for Structure, Not Just Words'),
    transfer: lesson('QR03', 'Question Type Lab: Reading Multiple Choice')
  },
  {
    id: 'reading-detail-generic',
    family: 'reading-detail',
    skills: ['reading'],
    tags: ['detail'],
    primary: lesson('R02', 'Read for Structure, Not Just Words'),
    transfer: lesson('QR03', 'Question Type Lab: Reading Multiple Choice')
  },
  {
    id: 'listening-detail',
    family: 'listening-detail',
    skills: ['listening'],
    tags: ['detail', 'listening-missed-detail', 'listening-requested-detail'],
    primary: lesson('L05', 'Predict Before You Listen'),
    transfer: lesson('QL05', 'Question Type Lab: Listening Short Answer')
  },
  {
    id: 'listening-distractor',
    family: 'listening-distractor',
    skills: ['listening'],
    tags: ['distractor', 'listening-distractor', 'listening-first-mention', 'listening-option-tracking', 'listening-change-of-mind', 'change-of-mind'],
    primary: lesson('L04', "Don't Fall for the Distractor"),
    transfer: lesson('QL01', 'Question Type Lab: Listening Multiple Choice')
  },
  {
    id: 'listening-correction',
    family: 'listening-correction',
    skills: ['listening'],
    tags: ['listening-correction'],
    primary: lesson('L04', "Don't Fall for the Distractor"),
    transfer: lesson('QL06', 'Question Type Lab: Listening Sentence Completion')
  },
  {
    id: 'reading-scope',
    family: 'reading-scope',
    skills: ['reading'],
    tags: ['reading-scope'],
    primary: lesson('R04', 'True, False or Not Given?'),
    transfer: lesson('QR01', 'Question Type Lab: True / False / Not Given')
  },
  {
    id: 'reading-information-function',
    family: 'reading-information-function',
    skills: ['reading'],
    tags: ['reading-information-function'],
    primary: lesson('R02', 'Read for Structure, Not Just Words'),
    transfer: lesson('QR05', 'Question Type Lab: Matching Information')
  },
  {
    id: 'reading-evidence-tfng',
    family: 'reading-evidence',
    skills: ['reading'],
    tags: ['reading-evidence'],
    questionTypes: ['true-false-not-given'],
    primary: lesson('R04', 'True, False or Not Given?'),
    transfer: lesson('QR01', 'Question Type Lab: True / False / Not Given')
  },
  {
    id: 'reading-evidence-mcq',
    family: 'reading-evidence',
    skills: ['reading'],
    tags: ['reading-evidence'],
    questionTypes: ['multiple-choice'],
    primary: lesson('R02', 'Read for Structure, Not Just Words'),
    transfer: lesson('QR03', 'Question Type Lab: Reading Multiple Choice')
  },
  {
    id: 'reading-contradiction',
    family: 'reading-contradiction',
    skills: ['reading'],
    tags: ['reading-contradiction'],
    primary: lesson('R04', 'True, False or Not Given?'),
    transfer: lesson('QR01', 'Question Type Lab: True / False / Not Given')
  },
  {
    id: 'reading-not-given',
    family: 'reading-not-given',
    skills: ['reading'],
    tags: ['reading-not-given'],
    primary: lesson('R04', 'True, False or Not Given?'),
    transfer: lesson('QR01', 'Question Type Lab: True / False / Not Given')
  },
  {
    id: 'reading-summary-logic',
    family: 'reading-summary-logic',
    skills: ['reading'],
    tags: ['reading-summary-logic'],
    primary: lesson('R02', 'Read for Structure, Not Just Words'),
    transfer: lesson('QR06', 'Question Type Lab: Summary Completion')
  }
];

export function existingPracticeRuleFor(error = {}) {
  const skill = String(error.skill || '').toLowerCase();
  const tag = String(error.errorTag || '');
  const evidenceType = readingEvidenceQuestionType(error);
  return EXISTING_PRACTICE_RULES.find(rule => {
    if (!rule.skills.includes(skill) || !rule.tags.includes(tag)) return false;
    if (rule.questionTypes?.length && !rule.questionTypes.includes(evidenceType)) return false;
    return true;
  }) || null;
}

export function existingPracticeRecommendationFor(error = {}) {
  const rule = existingPracticeRuleFor(error);
  if (!rule) return null;
  return { ...rule, familyData: EXISTING_PRACTICE_FAMILIES[rule.family] };
}
