import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../data.js';
import { MINI_TESTS } from '../mini-test-data-v1.js';
import { MINI_TESTS_V2 } from '../mini-test-data-v2.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const runtime=fs.readFileSync(path.join(root,'learning-runtime-v3.js'),'utf8');
const studyPlan=fs.readFileSync(path.join(root,'study-plan-v1.js'),'utf8');
const trendsSource=fs.readFileSync(path.join(root,'mini-test-trends-v1.js'),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

assert(MINI_TESTS_V2.length===2,'Mini Test V2 must add exactly MR02 and ML02.');
assert(MINI_TESTS.length===4,'Combined Mini Test bank must contain four tests after V2 registration.');
for(const id of ['MR01','ML01','MR02','ML02'])assert(MINI_TESTS.some(t=>t.id===id),`Missing ${id}.`);

const mr2=MINI_TESTS.find(t=>t.id==='MR02');
const ml2=MINI_TESTS.find(t=>t.id==='ML02');
assert(mr2?.skill==='reading'&&mr2.questions.length===12,'MR02 must contain 12 Reading questions.');
assert(ml2?.skill==='listening'&&ml2.questions.length===10,'ML02 must contain 10 Listening questions.');
assert(mr2.timeLimitSeconds===720,'MR02 must use a 12-minute timer.');
assert(ml2.timeLimitSeconds===540,'ML02 must use a 9-minute timer.');
assert(mr2.passage?.length>1200,'MR02 needs a substantive original Reading passage.');
assert(ml2.script?.length>1200,'ML02 needs a substantive one-play Listening script.');

const ids=[];
for(const test of MINI_TESTS){
  assert(LESSONS.some(l=>l.id===test.id&&l.lessonType==='mini-test'),`${test.id} must register in LESSONS as a mini-test.`);
  for(const item of test.questions){
    assert(item.options.includes(item.answer),`${item.id} answer must occur in options.`);
    assert(item.rationale?.length>=20,`${item.id} needs a useful rationale.`);
    assert(item.errorTag,`${item.id} needs an error tag.`);
    ids.push(item.id);
  }
}
assert(new Set(ids).size===ids.length,'All four Mini Tests must use unique question IDs.');

const shared=(a,b)=>{
  const aa=new Set(a.questions.map(q=>q.errorTag));
  return [...new Set(b.questions.map(q=>q.errorTag))].filter(x=>aa.has(x));
};
assert(shared(MINI_TESTS.find(t=>t.id==='MR01'),mr2).length>=3,'Reading forms need shared error-tag dimensions for cross-form pattern detection.');
assert(shared(MINI_TESTS.find(t=>t.id==='ML01'),ml2).length>=3,'Listening forms need shared error-tag dimensions for cross-form pattern detection.');

const v2Index=index.indexOf('./mini-test-data-v2.js');
const runtimeIndex=index.indexOf('./learning-runtime-v3.js');
assert(v2Index>=0&&runtimeIndex>v2Index,'Mini Test V2 data must register before learning-runtime builds its quiz map.');
assert(index.includes('./mini-test-trends-v1.js'),'Mini Test trend analysis must load.');
assert(runtime.includes('const quizMap = new Map()')&&runtime.includes('for (const lesson of LESSONS)'),'Observed-performance runtime must derive quiz evidence from registered LESSONS.');
assert(runtime.includes("if (!answer?.checked) continue")&&runtime.includes('answer.selected === found.block.answer'),'Checked Mini Test answers must feed objective skill performance.');
assert(studyPlan.includes('adaptive.skillPerformance?.[skill]'),'Study Plan priority must consume observed skill performance updated by Mini Test answers.');

for(const token of ['missedErrorTags','latestDistinctAttempts','recurringPatterns','two most recent different Mini Tests','Diagnostic, not Band scoring','Rebalancing remains an explicit learner action']){
  assert(trendsSource.includes(token),`Mini Test trend runtime missing ${token}.`);
}
assert(!trendsSource.includes('bandScore')&&!trendsSource.includes('estimatedBand'),'Mini Test trends must not create pseudo IELTS band scoring.');

const store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,String(value))};
globalThis.location={hash:'#/qa'};
globalThis.window={addEventListener(){},dispatchEvent(){return true;}};
globalThis.document={documentElement:{},querySelector(){return null;},createElement(){return {className:'',dataset:{},style:{},innerHTML:'',insertAdjacentElement(){}}}};
globalThis.MutationObserver=class{observe(){}};
globalThis.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail}};
const { recurringPatterns }=await import(`../mini-test-trends-v1.js?test=${Date.now()}`);
const fake={miniTestHistory:[
  {id:'a',ts:20,testId:'MR02',skill:'reading',missedErrorTags:{'reading-main-idea':1,'reading-scope':1}},
  {id:'b',ts:10,testId:'MR01',skill:'reading',missedErrorTags:{'reading-main-idea':2,'reading-paraphrase':1}}
]};
const patterns=recurringPatterns(fake,'reading');
assert(patterns.length===1&&patterns[0].tag==='reading-main-idea'&&patterns[0].count===3,'Recurring pattern detection must require the same tag across two different recent forms.');

console.log('✓ Mini Test bank expanded to MR01 / ML01 / MR02 / ML02');
console.log('✓ MR02 12 questions / 12 min; ML02 10 questions / 9 min');
console.log('✓ V2 registers before observed-performance runtime so new answers enter the learner profile');
console.log('✓ Cross-form recurring error tags are detected without producing IELTS band estimates');
console.log('✓ Study Plan continues to consume the resulting observed Reading/Listening performance');
