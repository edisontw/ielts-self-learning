import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MINI_TESTS } from '../mini-test-data-v1.js';
import '../mini-test-data-v2.js';
import { miniTestAudioSrc } from '../listening-media-v1.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const specPath=path.join(root,'media','audio','mini-tests','production-audio-spec-v1.json');
const docPath=path.join(root,'docs','mini-test-production-audio-pack-v1.md');
const spec=JSON.parse(fs.readFileSync(specPath,'utf8'));
const doc=fs.readFileSync(docPath,'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const normalize=text=>String(text||'')
  .replace(/\b(?:Advisor|Student|Coordinator|Participant):\s*/g,'')
  .replace(/[’‘]/g,"'")
  .replace(/[“”]/g,'"')
  .replace(/\s+/g,' ')
  .trim();

const wordCount=text=>(normalize(text).match(/\b[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*\b/gu)||[]).length;
const stripDotSlash=value=>String(value||'').replace(/^\.\//,'');

assert(spec.version===1,'Audio preparation spec version must remain 1.');
assert(spec.global?.wordingRule?.includes('Do not add'),'Global wording lock must forbid script changes.');
assert(spec.global?.testModeRule?.includes('one continuous recording'),'Mini Test audio must remain one continuous recording.');

for(const id of ['ML01','ML02']) {
  const test=MINI_TESTS.find(item=>item.id===id);
  const item=spec.tests?.[id];
  assert(test,`${id} must exist in the combined Mini Test bank.`);
  assert(item,`${id} must exist in the production audio spec.`);
  assert(test.skill==='listening',`${id} must remain a Listening Mini Test.`);
  assert(stripDotSlash(miniTestAudioSrc(id))===item.outputPath,`${id} runtime audio path must match the production spec.`);
  assert(Array.isArray(item.targetPaceWpm)&&item.targetPaceWpm.length===2,`${id} must define a target pace range.`);
  assert(Array.isArray(item.targetDurationSeconds)&&item.targetDurationSeconds.length===2,`${id} must define a target duration range.`);
  assert(item.targetPaceWpm[0]>=130&&item.targetPaceWpm[1]<=155,`${id} target pace must remain a natural test-like range.`);
  assert(Object.keys(item.voices||{}).length===2,`${id} must define two distinct speakers.`);
  assert(Array.isArray(item.segments)&&item.segments.length>=10,`${id} must define the complete speaker-turn sequence.`);
  assert(item.segments.every(segment=>segment.speaker&&segment.text&&Number.isFinite(segment.pauseAfterMs)),`${id} every segment needs speaker, text and pause timing.`);
  assert(item.segments.every(segment=>segment.pauseAfterMs>=0&&segment.pauseAfterMs<=700),`${id} turn pauses must stay within the documented maximum.`);

  const reconstructed=normalize(item.segments.map(segment=>segment.text).join(' '));
  const source=normalize(test.script);
  assert(reconstructed===source,`${id} production segments must reconstruct the current Mini Test transcript exactly.`);
  // approxWordCount is production-planning metadata. Older counts included one speaker label per turn;
  // the exact wording lock above is authoritative, so tolerate at most that bookkeeping difference.
  const wordDelta=Math.abs(wordCount(test.script)-item.approxWordCount);
  assert(wordDelta<=item.segments.length,`${id} approximate word count is too far from the current transcript.`);

  const covered=new Set((item.criticalTiming||[]).flatMap(cue=>cue.questionIds||[]));
  for(const question of test.questions) assert(covered.has(question.id),`${id} ${question.id} must be covered by a critical timing / distractor note.`);
  assert((item.criticalTiming||[]).every(cue=>cue.spokenEvidence&&cue.direction),`${id} every critical timing cue needs evidence and delivery direction.`);
}

assert(doc.includes('ML01 — Research Skills Workshops'),'Production guide must document ML01.');
assert(doc.includes('ML02 — Community Photography Walk'),'Production guide must document ML02.');
assert(doc.includes('Platform-agnostic generation prompt'),'Production guide must include copyable generation prompts.');
assert(doc.includes('Post-production QA checklist'),'Production guide must include post-production QA.');
assert(doc.includes('Do not use copyrighted commercial IELTS recordings'),'Production guide must include provenance / copyright guardrails.');

console.log('✓ ML01 / ML02 production audio paths match the runtime');
console.log('✓ Production segment text reconstructs both current Mini Test transcripts exactly');
console.log('✓ Approximate word-count metadata remains within one speaker-label token per turn');
console.log('✓ Every ML01 / ML02 question is covered by a distractor / timing note');
console.log('✓ Pace, duration, pause, voice and one-continuous-recording contracts are defined');
console.log('✓ Generation prompts, post-production QA and provenance rules are documented');
