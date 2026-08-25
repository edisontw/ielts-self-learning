import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../data.js';
import { MINI_TESTS } from '../mini-test-data-v1.js';
import '../mini-test-data-v2.js';
import { MINI_TESTS_V3 } from '../mini-test-data-v3.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const trendsSource=fs.readFileSync(path.join(root,'mini-test-trends-v1.js'),'utf8');
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
  if(test.skill==='listening')assert(test.script?.length>2500,`${test.id} needs a substantive one-play Listening script.`);
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
  const aa=new Set(a.questions.map(q=>q.errorTag));
  return [...new Set(b.questions.map(q=>q.errorTag))].filter(tag=>aa.has(tag));
};
for(const skillForms of [reading,listening]){
  for(const newer of skillForms.slice(2)){
    const previous=skillForms.filter(t=>t.id!==newer.id);
    assert(Math.max(...previous.map(old=>overlap(old,newer).length))>=5,`${newer.id} needs at least five shared diagnostic dimensions with an earlier form.`);
  }
}

const v3Index=index.indexOf('./mini-test-data-v3.js');
const appIndex=index.indexOf('./app.js');
const learningIndex=index.indexOf('./learning-runtime-v3.js');
assert(v3Index>=0&&appIndex>v3Index&&learningIndex>v3Index,'Mini Test V3 data must register before app and observed-performance runtimes.');
assert(ux.includes("['mini','3','Mini Tests','8 tests']"),'IELTS stage navigation must show eight Mini Tests.');
for(const token of ['mini-test-data-v3.js','limit=4','x.forms>=2','up to the four most recent different Mini Tests','Three or four forms provide stronger evidence']){
  assert(trendsSource.includes(token),`Mini Test trend runtime missing V3 contract token: ${token}`);
}
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

console.log('✓ Mini Test bank expanded to 8 forms: MR01–MR04 / ML01–ML04');
console.log('✓ Bank size: 4 Reading × 12 + 4 Listening × 10 = 88 questions');
console.log('✓ MR03/MR04 and ML03/ML04 preserve shared diagnostic dimensions with earlier forms');
console.log('✓ Trend analysis now uses up to four distinct forms and requires recurrence on at least two');
console.log('✓ Three- or four-form repetition is surfaced as stronger persistent evidence without Band scoring');
