import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../question-type-lab-v1.js';
import '../question-type-lab-v2.js';
import '../mini-test-data-v2.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const source=fs.readFileSync(path.join(root,'diagnostics-v1.js'),'utf8');
const portability=fs.readFileSync(path.join(root,'data-portability-v1.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const assert=(condition,message)=>{ if(!condition) throw new Error(message); };

class MemoryStorage {
  constructor(seed={}) { this.map=new Map(Object.entries(seed)); }
  getItem(key){ return this.map.has(key)?this.map.get(key):null; }
  setItem(key,value){ this.map.set(key,String(value)); }
  removeItem(key){ this.map.delete(key); }
}

Object.defineProperty(globalThis,'window',{configurable:true,writable:true,value:{
  localStorage:new MemoryStorage(),
  innerWidth:1280,
  innerHeight:800,
  speechSynthesis:{},
  SpeechSynthesisUtterance:function(){},
  MediaRecorder:function(){},
  URL:{createObjectURL(){return 'blob:test';}}
}});
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{
  language:'en-US',
  mediaDevices:{getUserMedia(){}},
  clipboard:{writeText(){} }
}});
Object.defineProperty(globalThis,'isSecureContext',{configurable:true,writable:true,value:true});
Object.defineProperty(globalThis,'File',{configurable:true,writable:true,value:function(){}});
Object.defineProperty(globalThis,'FileReader',{configurable:true,writable:true,value:function(){}});
if (typeof globalThis.Blob==='undefined') Object.defineProperty(globalThis,'Blob',{configurable:true,writable:true,value:function(){}});

const { APP_VERSION, collectBackup } = await import('../data-portability-v1.js');
const { runDiagnostics, reportText, STUDY_PLAN_SCHEMA_VERSION } = await import('../diagnostics-v1.js');

const core={
  placement:{overallStage:'B2'},
  profile:{targetBand:7}, study:{preferredMinutes:30},
  completedLessons:['LB01','R01','QR01'],
  lessonAnswers:{'R01-Q1':{selected:'PRIVATE ANSWER TEXT',checked:true}},
  errors:[{id:'e1',question:'PRIVATE ERROR QUESTION'}], fixedErrors:[], studyHistory:[],
  notes:{}, writingDrafts:{W05:'PRIVATE ESSAY CONTENT'}, speakingTranscripts:{S04:'PRIVATE TRANSCRIPT CONTENT'}, ui:{chineseHelp:false}
};
const adaptive={
  reviewHistory:[], vocabularyHistory:[], learningHistory:[],
  reviewSchedule:{e1:{dueAt:Date.now()-1000}}, repairProgress:{}, vocabularySchedule:{v1:{dueAt:Date.now()-1000}},
  skillPerformance:{},
  miniTestHistory:[{testId:'MR01'},{testId:'MR02'}],
  productiveEvidence:{writing:[{id:'pe1'}],speaking:[]}, productivePriority:{},
  aiFeedbackReturns:{writing:[{id:'fb1',priorities:['PRIVATE AI FEEDBACK CONTENT'],retryEvidenceId:null}],speaking:[]}
};
const plan={
  version:1, config:{weeks:4,daysPerWeek:3,minutesPerSession:30}, manualDone:[],
  weeks:[{week:1,sessions:[{kind:'lesson',sourceId:'R01'},{kind:'mini-test',sourceId:'MR02'},{kind:'review',sourceId:'REVIEW-W1'}]}]
};
const storage=new MemoryStorage({
  'ielts-self-learning-v1':JSON.stringify(core),
  'ielts-adaptive-v1':JSON.stringify(adaptive),
  'ielts-study-plan-v1':JSON.stringify(plan),
  'ielts-theme':'dark'
});

const healthy=runDiagnostics(storage);
assert(healthy.status==='healthy',`Expected healthy diagnostics, got ${healthy.status}: ${healthy.errors.join(' | ')} / ${healthy.warnings.join(' | ')}`);
assert(healthy.counts.coreCompleted===2,'Diagnostics must count only the fixed 30-unit core, not Labs.');
assert(healthy.counts.labsCompleted===1,'Diagnostics must count Lab completion separately.');
assert(healthy.counts.miniAttempts===2&&healthy.counts.miniForms===2,'Diagnostics must summarize Mini Test attempts and distinct forms.');
assert(healthy.counts.reviewDue===1&&healthy.counts.vocabularyDue===1,'Diagnostics must count currently due review and vocabulary items.');
assert(healthy.counts.productiveAttempts===1,'Diagnostics must count productive attempts.');
assert(healthy.counts.feedbackReturns===1&&healthy.counts.feedbackPending===1,'Diagnostics must distinguish pending AI feedback returns.');
assert(healthy.counts.planWeeks===1&&healthy.counts.planSessions===3,'Diagnostics must summarize Study Plan size.');
assert(healthy.capabilities.localStorage&&healthy.capabilities.speechSynthesis&&healthy.capabilities.microphoneAPI&&healthy.capabilities.mediaRecorder,'Browser capability detection must expose prototype media requirements.');

const text=reportText(healthy);
for(const secret of ['PRIVATE ANSWER TEXT','PRIVATE ERROR QUESTION','PRIVATE ESSAY CONTENT','PRIVATE TRANSCRIPT CONTENT','PRIVATE AI FEEDBACK CONTENT']) {
  assert(!text.includes(secret),`Diagnostic report must not leak learner content: ${secret}`);
}
assert(text.includes('Privacy: no essay text'),'Diagnostic report must state its privacy boundary.');

const badJson=new MemoryStorage({'ielts-self-learning-v1':'{broken'});
const broken=runDiagnostics(badJson);
assert(broken.status==='error'&&broken.errors.some(x=>x.includes('not valid JSON')),'Malformed learner JSON must be reported as a data issue.');

const badRefs=new MemoryStorage({
  'ielts-self-learning-v1':JSON.stringify({...core,completedLessons:['LB01','UNKNOWN-LESSON']}),
  'ielts-adaptive-v1':JSON.stringify({...adaptive,miniTestHistory:[{testId:'UNKNOWN-TEST'}]}),
  'ielts-study-plan-v1':JSON.stringify({...plan,weeks:[{week:1,sessions:[{kind:'lesson',sourceId:'MISSING-LESSON'},{kind:'mini-test',sourceId:'MISSING-TEST'}]}]})
});
const refs=runDiagnostics(badRefs);
assert(refs.status==='error','Broken content references must produce diagnostic error status.');
assert(refs.errors.some(x=>x.includes('Unknown completed lesson IDs')),'Unknown completed lesson IDs must be reported.');
assert(refs.errors.some(x=>x.includes('Unknown Mini Test IDs')),'Unknown Mini Test history IDs must be reported.');
assert(refs.errors.some(x=>x.includes('Study Plan references missing content')),'Missing Study Plan content references must be reported.');

assert(APP_VERSION==='0.11.0','Backup APP_VERSION must be v0.11.0.');
assert(pkg.version===APP_VERSION,'package.json and backup APP_VERSION must match.');
assert(STUDY_PLAN_SCHEMA_VERSION===1,'Diagnostics must expose Study Plan schema version 1.');
assert(collectBackup(storage).appVersion===APP_VERSION,'Exported backup metadata must use the current app version.');

for(const token of ['data-diagnostics-panel','Copy diagnostic report','Read-only diagnostics','Browser capabilities','Local data counts']) {
  assert(source.includes(token),`Diagnostics UI missing ${token}.`);
}
assert(source.includes("['lesson','lab','productive-retry']"),'Diagnostics must validate lesson-like Study Plan references.');
assert(source.includes("item?.kind==='mini-test'"),'Diagnostics must validate Mini Test Study Plan references.');
assert(source.includes('no essay text, transcript text, selected-answer text or AI feedback content included'),'Copied report must explicitly exclude learner content.');
assert(portability.includes("const APP_VERSION = '0.11.0'"),'Data portability metadata must match the diagnostics release.');
const dataIndex=index.indexOf('./data-portability-v1.js');
const diagIndex=index.indexOf('./diagnostics-v1.js');
assert(dataIndex>=0&&diagIndex>dataIndex,'Diagnostics must load after data portability so version/schema metadata are available.');

console.log('✓ Diagnostics reports app, backup and Study Plan schema versions');
console.log('✓ Healthy local data, browser capabilities and learner-data counts are summarized');
console.log('✓ Malformed JSON and stale curriculum / Mini Test / Study Plan references are detected');
console.log('✓ Copied diagnostics exclude essay, transcript, answer and AI-feedback content');
console.log('✓ Backup metadata and package version remain aligned at v0.11.0');
