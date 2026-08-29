import { MOCK_TESTS as MOCK_TESTS_V1, approximateBand, MOCK_BAND_REFERENCE } from './mock-test-data-v1.js';
import { MOCK_TESTS_V2 } from './mock-test-data-v2.js';

export const MOCK_TESTS=[...MOCK_TESTS_V1,...MOCK_TESTS_V2];
export { approximateBand, MOCK_BAND_REFERENCE };

export function mockTestById(id='') {
  return MOCK_TESTS.find(test=>test.id===id) || MOCK_TESTS[0] || null;
}

export function mockAudioStatus(test) {
  return test?.audioStatus || (test?.id==='MA01' ? 'production-mp3' : 'browser-voice-gate');
}
