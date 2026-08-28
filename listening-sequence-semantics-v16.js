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

export function normalizedMiniTestErrorTag(item = {}) {
  const tag = String(item.errorTag || '');
  if (tag !== 'listening-sequence') return tag;
  const id = String(item.questionId || item.id || '');
  if (LISTENING_SEQUENCE_TAG_BY_QUESTION_ID[id]) return LISTENING_SEQUENCE_TAG_BY_QUESTION_ID[id];
  const testId = String(item.testId || '');
  return LISTENING_SEQUENCE_TAG_BY_TEST_ID[testId] || tag;
}

export function listeningSequenceSubtype(item = {}) {
  const tag = normalizedMiniTestErrorTag(item);
  if (tag === 'listening-spatial-sequence') return 'spatial-route';
  if (tag === 'listening-procedural-sequence') return 'procedural-event';
  return '';
}
