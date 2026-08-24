import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../data.js';
import { CORE_LESSON_META } from '../adaptive-data.js';
import { SPEAKING_PART1_TOPICS, SPEAKING_PART2_CARDS, SPEAKING_PART3_SETS, SPEAKING_LINKED_SETS, SPEAKING_BANK_LESSON } from '../speaking-practice-bank-v1.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const runtime=fs.readFileSync(path.join(root,'speaking-practice-bank-runtime-v1.js'),'utf8');
const bootstrap=fs.readFileSync(path.join(root,'speaking-practice-bank-bootstrap-v1.js'),'utf8');
const ux=fs.readFileSync(path.join(root,'ux-polish-v1.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

assert(SPEAKING_PART1_TOPICS.length===12,'Speaking bank must contain exactly 12 Part 1 topic sets.');
assert(SPEAKING_PART1_TOPICS.every(t=>t.questions.length===4),'Each Part 1 topic must contain exactly four questions.');
assert(SPEAKING_PART1_TOPICS.flatMap(t=>t.questions).length===48,'Part 1 bank must contain 48 questions.');
assert(SPEAKING_PART2_CARDS.length===12,'Speaking bank must contain exactly 12 Part 2 cue cards.');
assert(SPEAKING_PART2_CARDS.every(c=>c.bullets.length===4),'Every Part 2 cue card must contain four planning bullets.');
assert(SPEAKING_PART2_CARDS.every(c=>c.followUps.length===2),'Every Part 2 cue card must contain two follow-up questions.');
assert(SPEAKING_PART3_SETS.length===12,'Speaking bank must contain exactly 12 Part 3 discussion sets.');
assert(SPEAKING_PART3_SETS.every(s=>s.questions.length===4),'Each Part 3 set must contain exactly four questions.');
assert(SPEAKING_PART3_SETS.flatMap(s=>s.questions).length===48,'Part 3 bank must contain 48 questions.');
assert(SPEAKING_LINKED_SETS.length===12,'Each Part 2 card must have one linked practice set.');

const p1Ids=new Set(SPEAKING_PART1_TOPICS.map(x=>x.id));
const p2Ids=new Set(SPEAKING_PART2_CARDS.map(x=>x.id));
const p3Ids=new Set(SPEAKING_PART3_SETS.map(x=>x.id));
assert(p1Ids.size===12&&p2Ids.size===12&&p3Ids.size===12,'Part set IDs must be unique.');
for(const card of SPEAKING_PART2_CARDS){
  assert(p1Ids.has(card.part1TopicId),`${card.id}: linked Part 1 topic is missing.`);
  assert(SPEAKING_PART3_SETS.filter(s=>s.part2Id===card.id).length===1,`${card.id}: must link to exactly one Part 3 set.`);
}
for(const set of SPEAKING_LINKED_SETS){
  assert(p1Ids.has(set.part1TopicId)&&p2Ids.has(set.part2Id)&&p3Ids.has(set.part3Id),`${set.id}: linked set references missing bank content.`);
}

const questionIds=[...SPEAKING_PART1_TOPICS.flatMap(t=>t.questions.map(q=>q.id)),...SPEAKING_PART3_SETS.flatMap(s=>s.questions.map(q=>q.id)),...SPEAKING_PART2_CARDS.map(c=>`SPB-${c.id}`)];
assert(questionIds.length===108,'The bank must expose exactly 108 prompt/question IDs.');
assert(new Set(questionIds).size===108,'All 108 Speaking bank prompt/question IDs must be unique.');

const allSource=[...SPEAKING_PART1_TOPICS,...SPEAKING_PART2_CARDS,...SPEAKING_PART3_SETS];
assert(allSource.every(x=>x.source?.type==='original'),'Every Speaking bank item must disclose original-content provenance.');
assert(allSource.every(x=>x.source?.formatCheckedDate==='2026-08-25'),'Every Speaking bank item must retain the format-check date.');

assert(SPEAKING_BANK_LESSON.id==='SPB01'&&SPEAKING_BANK_LESSON.skill==='speaking','SPB01 must register as a Speaking lesson.');
assert(SPEAKING_BANK_LESSON.sections.length>=7,'SPB01 must contain a complete guided-practice flow.');
assert(SPEAKING_BANK_LESSON.repairLessons.join(',')==='S01,S02,S03,S04,S05','SPB01 repair path must point to the existing S01–S05 curriculum.');
assert(LESSONS.some(l=>l.id==='SPB01'),'SPB01 must register in LESSONS.');
assert(CORE_LESSON_META.some(l=>l.id==='SPB01'),'SPB01 must register adaptive metadata.');

assert(runtime.includes("const CORE_KEY='ielts-self-learning-v1'"),'Speaking bank must use the portable core learner record.');
assert(runtime.includes('speakingTranscripts||={}'),'Speaking bank transcripts must use core.speakingTranscripts.');
assert(runtime.includes("type:'speaking-bank-attempt'"),'Speaking bank attempts must use portable studyHistory.');
assert(runtime.includes('MediaRecorder'),'Speaking bank must support browser recording when available.');
assert(runtime.includes('class=\"text-area spb-transcript speaking-input\"'),'Speaking bank transcript must expose the existing Productive Evidence hook.');
assert(runtime.includes('data-spb-timer=\"60\"')&&runtime.includes('data-spb-timer=\"120\"'),'Part 2 must expose 1-minute preparation and 2-minute long-turn timers.');
assert(runtime.includes('not an official IELTS per-question limit'),'Part 1 pacing timer must not be presented as an official time limit.');
assert(runtime.includes('Do not score or judge pronunciation'),'Transcript-only AI feedback must explicitly reject pronunciation scoring.');
assert(runtime.includes('Do not give a fake precise official IELTS band score'),'AI feedback must reject fake precise band scores.');
assert(runtime.includes('data-spb-retry'),'Runtime must provide a retry-bank interaction.');
assert(runtime.includes('data-lesson=\"S01\"')&&runtime.includes('data-lesson=\"S05\"'),'Runtime must expose S01–S05 repair routes.');
assert(!runtime.includes('new MutationObserver'),'Speaking response runtime must not continuously redraw while recording.');

assert(bootstrap.includes("import('./speaking-practice-bank-runtime-v1.js')"),'Speaking bootstrap must lazy-load the runtime after the lesson mount exists.');
assert(bootstrap.includes("mount.querySelector('[data-spb-workspace]')"),'Bootstrap must no-op while the live workspace is already mounted.');
assert(bootstrap.includes('new MutationObserver'),'Bootstrap must detect delayed base-app lesson rendering.');
assert(bootstrap.includes('recoveryPending'),'Bootstrap must throttle recovery after a base-app rerender.');
assert(ux.includes('injectSpeakingBankCard(main)')&&ux.includes('data-spb-ielts-card'),'The persistent IELTS UX layer must preserve the Speaking bank entry card.');

assert(index.includes('./speaking-practice-bank-v1.js'),'Speaking bank data must load in index.html.');
assert(index.includes('./speaking-practice-bank-bootstrap-v1.js'),'Speaking bank bootstrap must load in index.html.');
assert(!index.includes('src="./speaking-practice-bank-runtime-v1.js"'),'Speaking response runtime must be lazy-loaded instead of eagerly executed before the lesson mount exists.');
assert(index.includes('./speaking-practice-bank-v1.css'),'Speaking bank stylesheet must load in index.html.');

console.log('✓ Speaking Practice Bank: 12 Part 1 topics / 48 questions');
console.log('✓ Speaking Practice Bank: 12 Part 2 cue cards / 12 linked Part 3 sets / 48 Part 3 questions');
console.log('✓ Total bank size: 108 original speaking prompts/questions');
console.log('✓ Recorder, timers, transcript portability, AI evidence limits and retry workflow are present');
console.log('✓ Lazy bootstrap mounts SPB01 only after the base lesson DOM exists and preserves live recorder state');
console.log('✓ SPB01 integrates with existing S01–S05 repair lessons, Productive Evidence and simplified IELTS UX');
