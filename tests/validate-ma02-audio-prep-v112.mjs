import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { MA02 } from '../mock-test-data-v2.js';
import { mockTestById } from '../mock-test-registry-v17.js';
import { MOCK_AUDIO, MA02_AUDIO, PLAYER_NOTE, CENTER_NOTE } from '../mock-test-audio-upgrade-v1.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const spec=JSON.parse(fs.readFileSync(path.join(root,'media/audio/mock-tests/ma02-production-audio-spec-v1.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'media/audio/mock-tests/ma02-production-assets-v1.json'),'utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const fileSha256=filePath=>crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
const words=text=>{
  const withoutLabels=String(text).replace(/^[A-Za-z]+:\s*/gm,'');
  return (withoutLabels.match(/\b[\w’'-]+(?:-[\w’'-]+)*\b/g)||[]).length;
};
const rebuild=part=>part.segments.map(segment=>`${segment.sourcePrefix?`${segment.speaker}: `:''}${segment.text}`).join('\n');

assert(spec.version==='1.0','Unexpected MA02 production spec version');
assert(spec.mockTestId==='MA02','Production spec must target MA02');
assert(spec.status==='production-prep','The immutable generation specification must retain its production-prep baseline status');
assert(spec.sourceOfTruth==='mock-test-data-v2.js','MA02 source-of-truth declaration changed');
assert(spec.outputFormat?.container==='mp3','Production output must be MP3');
assert(spec.outputFormat?.channels===1,'Production output must remain mono');
assert(spec.outputFormat?.sampleRateHz===44100,'Production output must remain 44.1 kHz');
assert(spec.outputFormat?.targetBitrateKbps===192,'Production output must remain 192 kbps');
assert(Array.isArray(spec.parts)&&spec.parts.length===4,`Expected 4 MA02 audio parts, got ${spec.parts?.length}`);
assert(MA02.listening.parts.length===4,'MA02 Listening source no longer has four parts');

const expected=[
  {id:'MA02-L1',path:'media/audio/mock-tests/ma02-listening-part1-printmaking-workshop-booking.mp3',sizeBytes:2170505,sha256:'c43a245b012190b5a134054ac0ca07de45ec8e4ef83ec2f021d352dc0c544bb9',duration:[90,105]},
  {id:'MA02-L2',path:'media/audio/mock-tests/ma02-listening-part2-observatory-visitor-orientation.mp3',sizeBytes:2742900,sha256:'47928c0d6fc24ba7c15aa2a86758768cdfe5e3b7486bf6b220b4b2aba0c6e75a',duration:[110,125]},
  {id:'MA02-L3',path:'media/audio/mock-tests/ma02-listening-part3-local-history-digitisation-project.mp3',sizeBytes:2682087,sha256:'04ce16d9d1f9df125cb5e832c28bda20dfe94c7dc9dd5cdbc8ae16c3d29b81f1',duration:[110,125]},
  {id:'MA02-L4',path:'media/audio/mock-tests/ma02-listening-part4-seed-banks-seed-storage.mp3',sizeBytes:3085835,sha256:'df66122a0d7ca5a05a6792bb7f957a042cf6a69b729ac1d30f23d3753dd05fa4',duration:[128,145]}
];
const expectedFiles=expected.map(item=>item.path);
assert(JSON.stringify(spec.parts.map(x=>x.file))===JSON.stringify(expectedFiles),'Canonical MA02 file names changed');
assert(JSON.stringify(MA02_AUDIO.map(x=>x.replace(/^\.\//,'')))===JSON.stringify(expectedFiles),'Runtime MA02 source paths must match the production specification');
assert(JSON.stringify(MOCK_AUDIO.MA02)===JSON.stringify(MA02_AUDIO),'MOCK_AUDIO must expose the four approved MA02 sources');

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
  const speakers=new Set(plan.segments.map(x=>x.speaker));
  assert(speakers.size===expectedSpeakerCounts[i],`Part ${i+1} expected ${expectedSpeakerCounts[i]} distinct voice role(s), got ${speakers.size}`);
  assert(Object.keys(plan.voices||{}).length===speakers.size,`Part ${i+1} voice direction does not cover every role`);
  assert((plan.criticalQa||[]).length>=5,`Part ${i+1} needs at least five answer-bearing QA checks`);
}

assert(release.version===1&&release.mockTestId==='MA02','MA02 release manifest identity is invalid');
assert(['production-ready','production-live'].includes(release.status),`Unexpected MA02 release status: ${release.status}`);
assert(Array.isArray(release.assets)&&release.assets.length===4,'MA02 release manifest must contain four assets');
assert(new Set(release.assets.map(asset=>asset.id)).size===4,'MA02 release asset ids must be unique');
assert(new Set(release.assets.map(asset=>asset.path)).size===4,'MA02 release asset paths must be unique');

for(const contract of expected){
  const asset=release.assets.find(item=>item.id===contract.id);
  assert(asset,`${contract.id} missing from MA02 release manifest`);
  assert(asset.path===contract.path,`${contract.id} path does not match the runtime contract`);
  assert(asset.sizeBytes===contract.sizeBytes,`${contract.id} manifest size is incorrect`);
  assert(asset.sha256===contract.sha256,`${contract.id} manifest SHA-256 is incorrect`);
  assert(asset.durationSeconds>=contract.duration[0]&&asset.durationSeconds<=contract.duration[1],`${contract.id} duration is outside the production target`);
  assert(asset.sampleRateHz===44100&&asset.channels===1&&asset.bitrateKbps===192,`${contract.id} format metadata is not mono 44.1 kHz / 192 kbps`);
  assert(asset.provenance?.syntheticVoice===true,`${contract.id} must disclose synthetic voice provenance`);
  assert(asset.qa?.transcriptAlignment?.includes('canonical repository script'),`${contract.id} must preserve canonical transcript policy`);
  const absolute=path.join(root,asset.path);
  assert(fs.existsSync(absolute),`${contract.id} production MP3 is missing`);
  assert(fs.statSync(absolute).size===contract.sizeBytes,`${contract.id} file size differs from the approved asset`);
  assert(fileSha256(absolute)===contract.sha256,`${contract.id} checksum differs from the approved asset`);
  if(asset.status==='production-live'){
    assert(asset.qa?.technicalPlayback?.includes('passed'),`${contract.id} production-live status requires passed deployed playback QA`);
  }else{
    assert(asset.status==='production-ready',`${contract.id} status must be production-ready or production-live`);
    assert(asset.qa?.technicalPlayback?.includes('pending deployed verification'),`${contract.id} production-ready status must retain pending deployed verification`);
  }
}

const runtimeMA02=mockTestById('MA02');
assert(runtimeMA02?.audioStatus==='production-mp3','MA02 registry must expose production MP3 status');
assert(runtimeMA02?.sourcePolicy?.notes?.includes('production MP3 recordings'),'MA02 source policy must describe production MP3 recordings');
assert(PLAYER_NOTE.MA02?.includes('Production MP3'),'MA02 player note must label production MP3');
assert(PLAYER_NOTE.MA02?.includes('fallback'),'MA02 player note must disclose browser-voice fallback');
assert(CENTER_NOTE.includes('MA01 and MA02 use production MP3'),'Mock Center audio note must describe both production mocks');

console.log('V112_MA02_AUDIO_RELEASE_PASS '+JSON.stringify({parts:4,files:expectedFiles,status:release.status,sizes:expected.map(x=>x.sizeBytes),sha256:expected.map(x=>x.sha256)}));
