export const LISTENING_SEQUENCE_TAG_BY_QUESTION_ID = Object.freeze({
  'ML02-Q4': 'listening-spatial-sequence',
  'ML03-Q4': 'listening-spatial-sequence',
  'ML04-Q3': 'listening-procedural-sequence'
});

const LISTENING_SEQUENCE_TAG_BY_TEST_ID = Object.freeze({
  ML02: 'listening-spatial-sequence',
  ML03: 'listening-spatial-sequence',
  ML04: 'listening-procedural-sequence'
});

export const READING_DEFINITION_TAG_BY_QUESTION_ID = Object.freeze({
  'MR02-Q4': 'reading-explicit-definition',
  'MR04-Q4': 'reading-distinction'
});

const READING_DEFINITION_TAG_BY_TEST_ID = Object.freeze({
  MR02: 'reading-explicit-definition',
  MR04: 'reading-distinction'
});

export const LISTENING_FINAL_MEANING_TAG_BY_QUESTION_ID = Object.freeze({
  'ML02-Q9': 'listening-conditional-outcome',
  'ML04-Q10': 'listening-conditional-outcome'
});

const LISTENING_FINAL_MEANING_TAG_BY_TEST_ID = Object.freeze({
  ML02: 'listening-conditional-outcome',
  ML04: 'listening-conditional-outcome'
});

export function normalizedMiniTestErrorTag(item = {}) {
  const tag = String(item.errorTag || '');
  const id = String(item.questionId || item.id || '');
  const testId = String(item.testId || '');

  if (tag === 'listening-sequence') {
    if (LISTENING_SEQUENCE_TAG_BY_QUESTION_ID[id]) return LISTENING_SEQUENCE_TAG_BY_QUESTION_ID[id];
    return LISTENING_SEQUENCE_TAG_BY_TEST_ID[testId] || tag;
  }

  if (tag === 'reading-definition') {
    if (READING_DEFINITION_TAG_BY_QUESTION_ID[id]) return READING_DEFINITION_TAG_BY_QUESTION_ID[id];
    return READING_DEFINITION_TAG_BY_TEST_ID[testId] || tag;
  }

  if (tag === 'listening-final-meaning') {
    if (LISTENING_FINAL_MEANING_TAG_BY_QUESTION_ID[id]) return LISTENING_FINAL_MEANING_TAG_BY_QUESTION_ID[id];
    return LISTENING_FINAL_MEANING_TAG_BY_TEST_ID[testId] || tag;
  }

  return tag;
}

export function listeningSequenceSubtype(item = {}) {
  const tag = normalizedMiniTestErrorTag(item);
  if (tag === 'listening-spatial-sequence') return 'spatial-route';
  if (tag === 'listening-procedural-sequence') return 'procedural-event';
  return '';
}

export function readingDefinitionSubtype(item = {}) {
  const tag = normalizedMiniTestErrorTag(item);
  if (tag === 'reading-explicit-definition') return 'explicit-definition';
  if (tag === 'reading-distinction') return 'concept-distinction';
  return '';
}

export function listeningFinalMeaningSubtype(item = {}) {
  const tag = normalizedMiniTestErrorTag(item);
  if (tag === 'listening-conditional-outcome') return 'conditional-outcome';
  return '';
}
