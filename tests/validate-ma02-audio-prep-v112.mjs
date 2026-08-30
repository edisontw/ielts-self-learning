import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MA02 } from '../mock-test-data-v2.js';
import { MOCK_AUDIO, PLAYER_NOTE } from '../mock-test-audio-upgrade-v1.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const specPath=path.join(root,'media/audio/mock-tests/ma02-production-audio-spec-v1.json');
const spec=JSON.parse(fs.readFileSync(specPath,'utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const words=text=>{
  const withoutLabels=String(text).replace(/^[A-Za-z]+:\s*/gm,'');
  return (withoutLabels.match(/\b[\w’'-]+(?:-[\w’'-]+)*\b/g)||[]).length;
};
const rebuild=part=>part.segments.map(segment=>`${segment.sourcePrefix?`${segment.speaker}: `:''}${segment.text}`).join('\n');

assert(spec.version==='1.0','Unexpected MA02 production spec version');
assert(spec.mockTestId==='MA02','Production spec must target MA02');
assert(spec.status==='production-prep','MA02 audio spec must remain production-prep until recordings pass QA');
assert(spec.sourceOfTruth==='mock-test-data-v2.js','MA02 source-of-truth declaration changed');
assert(spec.outputFormat?.container==='mp3','Production output must be MP3');
assert(spec.outputFormat?.channels===1,'Production output must remain mono');
assert(spec.outputFormat?.sampleRateHz===44100,'Production prep must target 44.1 kHz');
assert(spec.outputFormat?.targetBitrateKbps===192,'Production prep must target 192 kbps');
assert(Array.isArray(spec.parts)&&spec.parts.length===4,`Expected 4 MA02 audio parts, got ${spec.parts?.length}`);
assert(MA02.listening.parts.length===4,'MA02 Listening source no longer has four parts');

const expectedFiles=[
  'media/audio/mock-tests/ma02-listening-part1-printmaking-workshop-booking.mp3',
  'media/audio/mock-tests/ma02-listening-part2-observatory-visitor-orientation.mp3',
  'media/audio/mock-tests/ma02-listening-part3-local-history-digitisation-project.mp3',
  'media/audio/mock-tests/ma02-listening-part4-seed-banks-seed-storage.mp3'
];
assert(JSON.stringify(spec.parts.map(x=>x.file))===JSON.stringify(expectedFiles),'Canonical MA02 file names changed');
assert(new Set(expectedFiles).size===4,'MA02 production file names must be unique');

const expectedSpeakerCounts=[2,1,3,1];
for(let i=0;i<4;i++){
  const plan=spec.parts[i],source=MA02.listening.parts[i];
  assert(plan.part===i+1,`Spec part numbering mismatch at index ${i}`);
  assert(plan.partId===source.id,`Part ${i+1} source id mismatch: ${plan.partId} != ${source.id}`);
  assert(plan.title===source.title,`Part ${i+1} title drifted from MA02 source`);
  const rebuilt=rebuild(plan);
  assert(rebuilt===source.script,`Part ${i+1} production segments no longer reconstruct the exact MA02 script`);
  const count=words(rebuilt);
  assert(count===plan.scriptWordCount,`Part ${i+1} word-count contract drifted: spec ${plan.scriptWordCount}, calculated ${count}`);
  assert(Array.isArray(plan.targetDurationSeconds)&&plan.targetDurationSeconds.length===2&&plan.targetDurationSeconds[0]<plan.targetDurationSeconds[1],`Part ${i+1} duration range invalid`);
  assert(Array.isArray(plan.targetPaceWpm)&&plan.targetPaceWpm.length===2&&plan.targetPaceWpm[0]>=125&&plan.targetPaceWpm[1]<=155,`Part ${i+1} pace range is outside natural production bounds`);
  const speakers=new Set(plan.segments.map(x=>x.speaker));
  assert(speakers.size===expectedSpeakerCounts[i],`Part ${i+1} expected ${expectedSpeakerCounts[i]} distinct voice role(s), got ${speakers.size}`);
  assert(Object.keys(plan.voices||{}).length===speakers.size,`Part ${i+1} voice direction does not cover every role`);
  assert((plan.criticalQa||[]).length>=5,`Part ${i+1} needs at least five answer-bearing QA checks`);
}

assert(MA02.audioStatus==='browser-voice-gate','Do not mark MA02 production-live before approved MP3 files exist');
assert(MA02.sourcePolicy?.notes?.includes('separate production recordings'),'MA02 source policy must retain the separate production-recording gate');
assert(Array.isArray(MOCK_AUDIO.MA02)&&MOCK_AUDIO.MA02.length===4&&MOCK_AUDIO.MA02.every(x=>x===''),'Prep stage must not wire unapproved MA02 production sources');
assert(PLAYER_NOTE.MA02?.includes('Browser voice beta'),'Prep stage UI must continue to label MA02 browser voice beta');

console.log('V112_MA02_AUDIO_PREP_PASS '+JSON.stringify({parts:4,files:expectedFiles,wordCounts:spec.parts.map(x=>x.scriptWordCount),speakerCounts:expectedSpeakerCounts,status:spec.status}));
