import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../data.js';
import { MINI_TESTS } from '../mini-test-data-v1.js';
import '../mini-test-data-v2.js';
import { MINI_TESTS_V3 } from '../mini-test-data-v3.js';
import {
  LISTENING_SEQUENCE_TAG_BY_QUESTION_ID,
  READING_DEFINITION_TAG_BY_QUESTION_ID,
  LISTENING_FINAL_MEANING_TAG_BY_QUESTION_ID,
  normalizedMiniTestErrorTag,
  listeningSequenceSubtype,
  readingDefinitionSubtype,
  listeningFinalMeaningSubtype
} from '../listening-sequence-semantics-v16.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const trendsSource=fs.readFileSync(path.join(root,'mini-test-trends-v1.js'),'utf8');
const runtimeSource=fs.readFileSync(path.join(root,'mini-test-runtime-v1.js'),'utf8');
const ux=fs.readFileSync(path.join(root,'ux-polish-v1.js'),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

assert(MINI_TESTS_V3.length===4,'Mini Test V3 must add exactly MR03, ML03, MR04 and ML04.');
assert(MINI_TESTS.length===8,'Combined Mini Test bank must contain eight tests after V3 registration.');
const expectedIds=['MR01','ML01','MR02','ML02','MR03','ML03','MR04','ML04'];
for(const id of expectedIds)assert(MINI_TESTS.some(t=>t.id===id),`Missing ${id}.`);

const reading=MINI_TESTS.filter(t=>t.skill==='reading');
const listening=MINI_TESTS.filter(t=>t.skill==='listening');
assert(reading.length===4&&listening.length===4,'Mini Test bank must contain four Reading and four Listening forms.');
assert(reading.every(t=>t.questions.length===12&&t.timeLimitSeconds===720),'Every Reading form must contain 12 questions and a 12-minute timer.');
assert(listening.every(t=>t.questions.length===10&&t.timeLimitSeconds===540),'Every Listening form must contain 10 questions and a 9-minute timer.');
assert(MINI_TESTS.reduce((sum,t)=>sum+t.questions.length,0)===88,'Eight Mini Tests must contain 88 questions total.');

for(const test of MINI_TESTS_V3){
  assert(test.source?.type==='original'&&test.source?.createdDate==='2026-08-25',`${test.id} must disclose original-content provenance.`);
  if(test.skill==='reading')assert(test.passage?.length>2500,`${test.id} needs a substantive original Reading passage.`);
  if(test.skill==='listening')assert(test.script?.length>1800,`${test.id} needs a substantive one-play Listening script.`);
}

const questionIds=[];
for(const test of MINI_TESTS){
  assert(LESSONS.some(l=>l.id===test.id&&l.lessonType==='mini-test'),`${test.id} must register in LESSONS as a mini-test.`);
  for(const item of test.questions){
    assert(item.id&&item.prompt&&item.errorTag,`${test.id} has incomplete question metadata.`);
    assert(Array.isArray(item.options)&&item.options.includes(item.answer),`${item.id} answer must occur in options.`);
    assert(item.rationale?.length>=20,`${item.id} needs a useful rationale.`);
    questionIds.push(item.id);
  }
}
assert(new Set(questionIds).size===questionIds.length,'All 88 Mini Test question IDs must be unique.');

const overlap=(a,b)=>{
  const aa=new Set(a.questions.map(q=>normalizedMiniTestErrorTag(q)));
  return [...new Set(b.questions.map(q=>normalizedMiniTestErrorTag(q)))].filter(tag=>aa.has(tag));
};
for(const skillForms of [reading,listening]){
  for(const newer of skillForms.slice(2)){
    const previous=skillForms.filter(t=>t.id!==newer.id);
    assert(Math.max(...previous.map(old=>overlap(old,newer).length))>=5,`${newer.id} needs at least five shared diagnostic dimensions with an earlier form.`);
  }
}

assert(JSON.stringify(LISTENING_SEQUENCE_TAG_BY_QUESTION_ID)===JSON.stringify({
  'ML02-Q4':'listening-spatial-sequence',
  'ML03-Q4':'listening-spatial-sequence',
  'ML04-Q3':'listening-procedural-sequence'
}),'Listening sequence subtype registry must contain exactly the three audited Mini Test questions.');
assert(listeningSequenceSubtype({questionId:'ML02-Q4',errorTag:'listening-sequence'})==='spatial-route','ML02-Q4 must normalize to spatial-route sequence.');
assert(listeningSequenceSubtype({id:'ML03-Q4',errorTag:'listening-sequence'})==='spatial-route','ML03-Q4 must normalize to spatial-route sequence.');
assert(listeningSequenceSubtype({questionId:'ML04-Q3',errorTag:'listening-sequence'})==='procedural-event','ML04-Q3 must normalize to procedural/event sequence.');
assert(normalizedMiniTestErrorTag({questionId:'UNKNOWN',errorTag:'listening-sequence'})==='listening-sequence','Unknown legacy sequence IDs must not be guessed into a subtype.');
assert(normalizedMiniTestErrorTag({testId:'ML02',errorTag:'listening-sequence'})==='listening-spatial-sequence','Historical ML02 trend evidence must normalize by test form.');
assert(normalizedMiniTestErrorTag({testId:'ML03',errorTag:'listening-sequence'})==='listening-spatial-sequence','Historical ML03 trend evidence must normalize by test form.');
assert(normalizedMiniTestErrorTag({testId:'ML04',errorTag:'listening-sequence'})==='listening-procedural-sequence','Historical ML04 trend evidence must normalize by test form.');

assert(JSON.stringify(READING_DEFINITION_TAG_BY_QUESTION_ID)===JSON.stringify({
  'MR02-Q4':'reading-explicit-definition',
  'MR04-Q4':'reading-distinction'
}),'Reading definition subtype registry must contain exactly the two audited Mini Test questions.');
assert(readingDefinitionSubtype({questionId:'MR02-Q4',errorTag:'reading-definition'})==='explicit-definition','MR02-Q4 must normalize to explicit-definition retrieval.');
assert(readingDefinitionSubtype({questionId:'MR04-Q4',errorTag:'reading-definition'})==='concept-distinction','MR04-Q4 must normalize to concept distinction.');
assert(normalizedMiniTestErrorTag({questionId:'UNKNOWN',errorTag:'reading-definition'})==='reading-definition','Unknown legacy reading-definition IDs must not be guessed into a subtype.');
assert(normalizedMiniTestErrorTag({testId:'MR02',errorTag:'reading-definition'})==='reading-explicit-definition','Historical MR02 reading-definition evidence must normalize by test form.');
assert(normalizedMiniTestErrorTag({testId:'MR04',errorTag:'reading-definition'})==='reading-distinction','Historical MR04 reading-definition evidence must normalize by test form.');

assert(JSON.stringify(LISTENING_FINAL_MEANING_TAG_BY_QUESTION_ID)===JSON.stringify({
  'ML02-Q9':'listening-conditional-outcome',
  'ML04-Q10':'listening-conditional-outcome'
}),'Listening final-meaning semantic registry must contain exactly the two audited conditional-outcome questions.');
assert(listeningFinalMeaningSubtype({questionId:'ML02-Q9',errorTag:'listening-final-meaning'})==='conditional-outcome','ML02-Q9 must normalize to a conditional outcome.');
assert(listeningFinalMeaningSubtype({questionId:'ML04-Q10',errorTag:'listening-final-meaning'})==='conditional-outcome','ML04-Q10 must normalize to a conditional outcome.');
assert(normalizedMiniTestErrorTag({questionId:'UNKNOWN',errorTag:'listening-final-meaning'})==='listening-final-meaning','Unknown legacy final-meaning IDs must not be guessed into a subtype.');
assert(normalizedMiniTestErrorTag({testId:'ML02',errorTag:'listening-final-meaning'})==='listening-conditional-outcome','Historical ML02 final-meaning evidence must normalize by test form.');
assert(normalizedMiniTestErrorTag({testId:'ML04',errorTag:'listening-final-meaning'})==='listening-conditional-outcome','Historical ML04 final-meaning evidence must normalize by test form.');

const v3Index=index.indexOf('./mini-test-data-v3.js');
const appIndex=index.indexOf('./app.js');
const learningIndex=index.indexOf('./learning-runtime-v3.js');
assert(v3Index>=0&&appIndex>v3Index&&learningIndex>v3Index,'Mini Test V3 data must register before app and observed-performance runtimes.');
assert(ux.includes("['mini','3','Mini Tests','8 tests']"),'IELTS stage navigation must show eight Mini Tests.');
for(const token of ['mini-test-data-v3.js','limit=4','x.forms>=2','up to the four most recent different Mini Tests','Three or four forms provide stronger evidence','normalizedMiniTestErrorTag']){
  assert(trendsSource.includes(token),`Mini Test trend runtime missing V3/semantic contract token: ${token}`);
}
assert(runtimeSource.includes('normalizedMiniTestErrorTag')&&runtimeSource.includes('errorTag:displayTag(item)'),'Mini Test Error Notebook saves must persist normalized semantic Mini Test tags.');
assert(!trendsSource.includes('bandScore')&&!trendsSource.includes('estimatedBand'),'Mini Test trends must not create pseudo IELTS band scoring.');

const store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,String(value))};
globalThis.location={hash:'#/qa'};
globalThis.window={addEventListener(){},dispatchEvent(){return true;}};
globalThis.document={documentElement:{},querySelector(){return null;},createElement(){return {className:'',dataset:{},style:{},innerHTML:'',insertAdjacentElement(){}}}};
globalThis.MutationObserver=class{observe(){}};
globalThis.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail}};
const { recurringPatterns, latestDistinctAttempts }=await import(`../mini-test-trends-v1.js?test=${Date.now()}`);
const fake={miniTestHistory:[
  {id:'d',ts:40,testId:'MR04',skill:'reading',missedErrorTags:{'reading-main-idea':1,'reading-scope':1}},
  {id:'c',ts:30,testId:'MR03',skill:'reading',missedErrorTags:{'reading-main-idea':2,'reading-reference':1}},
  {id:'b',ts:20,testId:'MR02',skill:'reading',missedErrorTags:{'reading-main-idea':1,'reading-scope':2}},
  {id:'a',ts:10,testId:'MR01',skill:'reading',missedErrorTags:{'reading-paraphrase':1}}
]};
const distinct=latestDistinctAttempts(fake,'reading');
assert(distinct.length===4&&distinct.map(x=>x.testId).join(',')==='MR04,MR03,MR02,MR01','Trend analysis must retain up to four recent distinct forms.');
const patterns=recurringPatterns(fake,'reading');
const mainIdea=patterns.find(x=>x.tag==='reading-main-idea');
const scope=patterns.find(x=>x.tag==='reading-scope');
assert(mainIdea?.forms===3&&mainIdea.count===4,'A tag repeated across three forms must be detected as stronger persistent evidence.');
assert(scope?.forms===2&&scope.count===3,'A tag repeated across two forms must remain recurring evidence.');
assert(!patterns.some(x=>x.tag==='reading-reference'),'A one-form miss must not be labelled recurring.');

const legacyListening={miniTestHistory:[
  {id:'l4',ts:40,testId:'ML04',skill:'listening',missedErrorTags:{'listening-sequence':1}},
  {id:'l3',ts:30,testId:'ML03',skill:'listening',missedErrorTags:{'listening-sequence':1}},
  {id:'l2',ts:20,testId:'ML02',skill:'listening',missedErrorTags:{'listening-sequence':1}}
]};
const listeningPatterns=recurringPatterns(legacyListening,'listening');
const spatial=listeningPatterns.find(x=>x.tag==='listening-spatial-sequence');
assert(spatial?.forms===2&&spatial.count===2,'Historical ML02/ML03 sequence misses must recur only as spatial-route evidence.');
assert(!listeningPatterns.some(x=>x.tag==='listening-procedural-sequence'),'The single ML04 procedural sequence miss must stay subthreshold.');
assert(!listeningPatterns.some(x=>x.tag==='listening-sequence'),'The heterogeneous umbrella sequence tag must never appear as a recurring trend after normalization.');

const legacyReadingDefinition={miniTestHistory:[
  {id:'r4',ts:40,testId:'MR04',skill:'reading',missedErrorTags:{'reading-definition':1}},
  {id:'r2',ts:20,testId:'MR02',skill:'reading',missedErrorTags:{'reading-definition':1}}
]};
const definitionPatterns=recurringPatterns(legacyReadingDefinition,'reading');
assert(!definitionPatterns.some(x=>x.tag==='reading-definition'),'The heterogeneous reading-definition umbrella tag must never appear as recurring trend evidence.');
assert(!definitionPatterns.some(x=>x.tag==='reading-explicit-definition'),'MR02 explicit-definition is only one form and must stay subthreshold.');
assert(!definitionPatterns.some(x=>x.tag==='reading-distinction'),'MR04 concept-distinction is only one form and must stay subthreshold.');

const legacyFinalMeaning={miniTestHistory:[
  {id:'fm4',ts:40,testId:'ML04',skill:'listening',missedErrorTags:{'listening-final-meaning':1}},
  {id:'fm2',ts:20,testId:'ML02',skill:'listening',missedErrorTags:{'listening-final-meaning':1}}
]};
const finalMeaningPatterns=recurringPatterns(legacyFinalMeaning,'listening');
const conditionalOutcome=finalMeaningPatterns.find(x=>x.tag==='listening-conditional-outcome');
assert(conditionalOutcome?.forms===2&&conditionalOutcome.count===2,'Historical ML02/ML04 final-meaning misses must recur as conditional-outcome evidence.');
assert(!finalMeaningPatterns.some(x=>x.tag==='listening-final-meaning'),'The coarse final-meaning label must not remain learner-facing after normalization.');

console.log('✓ Mini Test bank expanded to 8 forms: MR01–MR04 / ML01–ML04');
console.log('✓ Bank size: 4 Reading × 12 + 4 Listening × 10 = 88 questions');
console.log('✓ ML02/ML03 spatial route sequence is separated from ML04 procedural/event sequence before persistence, trend detection, and audit');
console.log('✓ MR02 explicit definition is separated from MR04 concept distinction before persistence, trend detection, and audit');
console.log('✓ ML02/ML04 final-meaning evidence is refined to the coherent listening-conditional-outcome micro-skill before persistence and trend detection');
console.log('✓ Trend analysis still uses up to four distinct forms and requires recurrence on at least two');
console.log('✓ Legacy sequence/definition/final-meaning history normalizes without coarse or false recurring evidence');
