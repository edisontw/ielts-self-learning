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
    primary: lesson('R05', 'Matching Headings: Main Idea, Not Keywords'),
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
    primary: lesson('L04', 'Distractors: The First Answer Is Often Not the Answer'),
    transfer: lesson('QL01', 'Question Type Lab: Listening Multiple Choice')
  },
  {
    id: 'listening-correction',
    family: 'listening-correction',
    skills: ['listening'],
    tags: ['listening-correction'],
    primary: lesson('L04', 'Distractors: The First Answer Is Often Not the Answer'),
    transfer: lesson('QL06', 'Question Type Lab: Listening Sentence Completion')
  },
  {
    id: 'reading-scope',
    family: 'reading-scope',
    skills: ['reading'],
    tags: ['reading-scope'],
    primary: lesson('R04', 'True / False / Not Given: Evidence, Not Assumptions'),
    transfer: lesson('QR01', 'Question Type Lab: True / False / Not Given')
  }
];

export function existingPracticeRuleFor(error = {}) {
  const skill = String(error.skill || '').toLowerCase();
  const tag = String(error.errorTag || '');
  return EXISTING_PRACTICE_RULES.find(rule => rule.skills.includes(skill) && rule.tags.includes(tag)) || null;
}

export function existingPracticeRecommendationFor(error = {}) {
  const rule = existingPracticeRuleFor(error);
  if (!rule) return null;
  return { ...rule, familyData: EXISTING_PRACTICE_FAMILIES[rule.family] };
}
