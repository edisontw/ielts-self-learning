export const READING_EVIDENCE_QUESTION_TYPES = Object.freeze({
  'MR01-Q1': 'true-false-not-given',
  'MR02-Q5': 'multiple-choice',
  'MR02-Q6': 'true-false-not-given',
  'MR03-Q5': 'multiple-choice',
  'MR04-Q5': 'multiple-choice'
});

const SUPPORTED_TYPES = new Set(['true-false-not-given', 'multiple-choice']);

export function readingEvidenceQuestionType(error = {}) {
  const skill = String(error.skill || '').toLowerCase();
  const tag = String(error.errorTag || '');
  if (skill !== 'reading' || tag !== 'reading-evidence') return null;

  const explicit = String(error.questionType || '');
  if (SUPPORTED_TYPES.has(explicit)) return explicit;

  return READING_EVIDENCE_QUESTION_TYPES[String(error.questionId || '')] || null;
}
