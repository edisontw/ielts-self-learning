export const READING_STRUCTURE_QUESTION_TYPES = Object.freeze({
  'MR01-Q10': 'matching-information',
  'MA01-R08': 'multiple-choice'
});

const SUPPORTED_TYPES = new Set(['matching-information', 'multiple-choice']);

export function readingStructureQuestionType(error = {}) {
  const skill = String(error.skill || '').toLowerCase();
  const tag = String(error.errorTag || '');
  if (skill !== 'reading' || !['reading-structure', 'structure'].includes(tag)) return '';

  const explicit = String(error.questionType || '').toLowerCase();
  if (SUPPORTED_TYPES.has(explicit)) return explicit;

  return READING_STRUCTURE_QUESTION_TYPES[String(error.questionId || '')] || '';
}
