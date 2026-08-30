import { MOCK_TESTS as MOCK_TESTS_V1, approximateBand, MOCK_BAND_REFERENCE } from './mock-test-data-v1.js';
import { MOCK_TESTS_V2 } from './mock-test-data-v2.js';

const MA02_PRODUCTION_NOTE='All MA02 passages, scripts, questions and productive-skill prompts are newly written and independent from MA01. Writing Task 1 uses synthetic data. Listening uses production MP3 recordings, with labelled browser speech synthesis only as fallback if a recording cannot play.';
const MOCK_TESTS_V2_PRODUCTION=MOCK_TESTS_V2.map(test=>test.id==='MA02'?{
  ...test,
  audioStatus:'production-mp3',
  sourcePolicy:{...test.sourcePolicy,notes:MA02_PRODUCTION_NOTE}
}:test);

export const MOCK_TESTS=[...MOCK_TESTS_V1,...MOCK_TESTS_V2_PRODUCTION];
export { approximateBand, MOCK_BAND_REFERENCE };

export function mockTestById(id='') {
  return MOCK_TESTS.find(test=>test.id===id) || MOCK_TESTS[0] || null;
}

export function mockAudioStatus(test) {
  return test?.audioStatus || (test?.id==='MA01' ? 'production-mp3' : 'browser-voice-gate');
}
