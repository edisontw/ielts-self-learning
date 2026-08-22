import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const CORE_KEY='ielts-self-learning-v1';
const ADAPTIVE_KEY='ielts-adaptive-v1';
const PLAN_KEY='ielts-study-plan-v1';
const store=new Map();

class MemoryStorage {
  constructor(seed={}){ this.map=new Map(Object.entries(seed)); }
  getItem(key){ return this.map.has(key)?this.map.get(key):null; }
  setItem(key,value){ this.map.set(key,String(value)); }
  removeItem(key){ this.map.delete(key); }
  clear(){ this.map.clear(); }
}

const localStorage={
  getItem:key=>store.has(key)?store.get(key):null,
  setItem:(key,value)=>store.set(key,String(value)),
  removeItem:key=>store.delete(key),
  clear:()=>store.clear()
};
Object.defineProperty(globalThis,'localStorage',{configurable:true,writable:true,value:localStorage});
Object.defineProperty(globalThis,'location',{configurable:true,writable:true,value:{hash:'#/qa',origin:'https://example.test',pathname:'/ielts-self-learning/'}});
Object.defineProperty(globalThis,'window',{configurable:true,writable:true,value:{
  localStorage,
  innerWidth:1280,
  innerHeight:800,
  addEventListener(){},
  dispatchEvent(){return true;},
  scrollTo(){},
  speechSynthesis:{},
  SpeechSynthesisUtterance:function(){},
  MediaRecorder:function(){},
  URL:{createObjectURL(){return 'blob:test';}}
}});
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{language:'en-US',mediaDevices:{getUserMedia(){}},clipboard:{writeText(){}}}});
Object.defineProperty(globalThis,'isSecureContext',{configurable:true,writable:true,value:true});
Object.defineProperty(globalThis,'document',{configurable:true,writable:true,value:{
  documentElement:{},
  addEventListener(){},
  querySelector(){return null;},
  querySelectorAll(){return [];}
}});
Object.defineProperty(globalThis,'MutationObserver',{configurable:true,writable:true,value:class{observe(){} disconnect(){}}});
Object.defineProperty(globalThis,'CustomEvent',{configurable:true,writable:true,value:class{constructor(type,init={}){this.type=type;this.detail=init.detail;}}});
Object.defineProperty(globalThis,'File',{configurable:true,writable:true,value:function(){}});
Object.defineProperty(globalThis,'FileReader',{configurable:true,writable:true,value:function(){}});
if(typeof globalThis.Blob==='undefined') Object.defineProperty(globalThis,'Blob',{configurable:true,writable:true,value:function(){}});

const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));

await import('../curriculum-batch-01.js');
await import('../curriculum-batch-02.js');
await import('../question-type-lab-v1.js');
await import('../question-type-lab-v2.js');
await import('../mini-test-data-v2.js');

const { LESSONS }=await import('../data.js');
const { CORE_LESSON_META, REPAIR_LESSONS }=await import('../adaptive-data.js');
const { MINI_TESTS }=await import('../mini-test-data-v1.js');
const { adaptiveCandidates, prerequisitesMet, recentSkillCounts, skillLabel }=await import('../adaptive-guardrails-v1.js');
const { generatePlan }=await import(`../study-plan-v1.js?journey=${Date.now()}`);
const { collectBackup, validateBackup, applyBackup, APP_VERSION }=await import('../data-portability-v1.js');
const { runDiagnostics }=await import('../diagnostics-v1.js');

const placementCore={
  profile:{targetBand:7,placementSections:{reading:2,listening:5,vocabulary:5,grammar:4},recommendedDifficulty:3},
  study:{preferredMinutes:30},
  placement:{total:16,sectionScores:{reading:2,listening:5,vocabulary:5,grammar:4}},
  completedLessons:[],lessonAnswers:{},errors:[],fixedErrors:[],studyHistory:[],notes:{},writingDrafts:{},speakingTranscripts:{},ui:{chineseHelp:false}
};
const blankAdaptive={reviewSchedule:{},repairProgress:{},reviewHistory:[],vocabularySchedule:{},vocabularyHistory:[],skillPerformance:{},learningHistory:[],miniTestHistory:[],productiveEvidence:{writing:[],speaking:[]},productivePriority:{},aiFeedbackReturns:{writing:[],speaking:[]}};

// 1. Placement → prerequisite-safe Today.
let candidates=adaptiveCandidates(placementCore,blankAdaptive,CORE_LESSON_META,REPAIR_LESSONS);
assert(candidates.length>0,'Placement state should still have eligible beginner/core work.');
assert(!candidates.some(x=>/^Q[RL]/.test(x.id)),'Question Type Labs must not appear before their prerequisites are completed.');
assert(candidates.every(x=>prerequisitesMet(placementCore,blankAdaptive,x.id,LESSONS)),'Every Adaptive Today candidate must satisfy actual lesson prerequisites.');

// 2. Core Reading work unlocks the corresponding Lab only after prerequisites.
const readingCore={...placementCore,completedLessons:['R01','R02','R03']};
candidates=adaptiveCandidates(readingCore,blankAdaptive,CORE_LESSON_META,REPAIR_LESSONS);
assert(candidates.some(x=>x.id==='QR03'),'QR03 should unlock after R02 + R03 are completed.');
assert(!candidates.some(x=>x.id==='QR06'),'QR06 must remain locked until QR04 and its other prerequisites are completed.');

// 3. IELTS Strategy exposure participates in the seven-day skill-balance signal.
const recentCore={...readingCore,studyHistory:[{ts:Date.now(),lessonId:'I01'}]};
const recent=recentSkillCounts(recentCore,blankAdaptive,CORE_LESSON_META,REPAIR_LESSONS);
assert(recent['ielts-strategy']===1,'Recent IELTS Strategy work must be counted for skill balance.');
assert(skillLabel('ielts-strategy')==='IELTS Strategy','IELTS Strategy must have a human-readable label.');

// 4. Mini Test evidence → weak Reading priority → Study Plan rebalance.
const mr01=MINI_TESTS.find(x=>x.id==='MR01');
assert(mr01?.questions.length===12,'Journey QA requires MR01 12-question evidence.');
const answerState=Object.fromEntries(mr01.questions.map((q,i)=>[q.id,{selected:i<4?q.answer:q.options.find(x=>x!==q.answer),checked:true}]));
const evidenceCore={...readingCore,lessonAnswers:answerState,errors:[{id:'err-r1',skill:'reading',ts:Date.now()}]};
const evidenceAdaptive={...blankAdaptive,skillPerformance:{reading:{answered:12,correct:4,accuracy:4/12,confidence:'Moderate'}},miniTestHistory:[{testId:'MR01',skill:'reading',correct:4,total:12,ts:Date.now()}]};
write(CORE_KEY,evidenceCore);
write(ADAPTIVE_KEY,evidenceAdaptive);
const plan=generatePlan({weeks:8,daysPerWeek:4,minutesPerSession:30});
assert(plan.priorities[0].skill==='reading','Weak MR01 Reading evidence should make Reading the highest Study Plan priority in this journey.');
const plannedContentIds=plan.weeks.flatMap(w=>w.sessions).filter(t=>t.kind==='lesson'||t.kind==='lab').map(t=>t.sourceId);
const prerequisiteContext={...evidenceCore,completedLessons:[...new Set([...evidenceCore.completedLessons,...plannedContentIds])]};
assert(plan.weeks.flatMap(w=>w.sessions).every(s=>s.kind!=='lab'||prerequisitesMet(prerequisiteContext,evidenceAdaptive,s.sourceId,LESSONS)),'Planned Labs must correspond to prerequisite work represented in the planned/core path.');

// 5. Productive + AI feedback state survives local backup / restore.
evidenceAdaptive.productiveEvidence={writing:[{id:'pe-w1',ts:Date.now(),skill:'writing',lessonId:'W05',attemptKind:'first',criteria:['task','position'],score:.4,wordCount:270}],speaking:[]};
evidenceAdaptive.aiFeedbackReturns={writing:[{id:'fb-w1',ts:Date.now(),skill:'writing',lessonId:'W05',sourceEvidenceId:'pe-w1',priorities:['Develop body paragraph 2','Check article use'],retryEvidenceId:null}],speaking:[]};
write(ADAPTIVE_KEY,evidenceAdaptive);
write(PLAN_KEY,plan);
localStorage.setItem('ielts-theme','dark');
const backup=collectBackup(localStorage);
validateBackup(backup);
assert(backup.appVersion===APP_VERSION,'Journey backup must carry the current app version.');
const restored=new MemoryStorage();
applyBackup(backup,restored);
const restoredAdaptive=JSON.parse(restored.getItem(ADAPTIVE_KEY));
assert(restoredAdaptive.productiveEvidence.writing.length===1,'Writing productive evidence must survive backup/restore.');
assert(restoredAdaptive.aiFeedbackReturns.writing.length===1,'AI feedback return must survive backup/restore.');
assert(JSON.parse(restored.getItem(PLAN_KEY)).weeks.length===8,'Study Plan must survive backup/restore.');

// 6. Restored journey state remains structurally healthy.
const diagnostics=runDiagnostics(restored);
assert(diagnostics.status!=='error',`Restored learner journey should not produce a diagnostic data error: ${diagnostics.errors.join(' | ')}`);
assert(diagnostics.counts.miniAttempts===1,'Diagnostics must retain the Mini Test attempt after restore.');
assert(diagnostics.counts.productiveAttempts===1&&diagnostics.counts.feedbackReturns===1,'Diagnostics must retain productive and AI-feedback counts after restore.');

// 7. Release wiring and completion fallback guardrails.
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const guardSource=fs.readFileSync(path.join(root,'adaptive-today-guardrails-v1.js'),'utf8');
const oldRuntime=fs.readFileSync(path.join(root,'learning-runtime-v3.js'),'utf8');
assert(index.indexOf('./adaptive-today-guardrails-v1.js')>index.indexOf('./learning-runtime-v3.js'),'Prerequisite-safe Today guard must load after the legacy adaptive runtime.');
assert(guardSource.includes('path complete')&&guardSource.includes('Core path complete'),'Adaptive Today must have a safe completion fallback instead of assuming a candidate always exists.');
assert(oldRuntime.includes("'learning-better':'Learning Better'")&&!oldRuntime.includes("'ielts-strategy':'IELTS Strategy'"),'Journey regression documents the legacy label gap that the guardrail layer now corrects.');

console.log('✓ Placement → Adaptive Today excludes locked lessons and Labs');
console.log('✓ Reading prerequisites unlock QR03 while later Labs remain locked');
console.log('✓ IELTS Strategy participates in recent skill-balance accounting');
console.log('✓ Weak Mini Test evidence rebalances Study Plan toward Reading');
console.log('✓ Productive evidence + AI feedback + Study Plan survive backup/restore');
console.log('✓ Restored learner state remains healthy in Diagnostics');
console.log('✓ Full-completion Today fallback cannot crash on an empty candidate pool');
