import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const store = new Map();
globalThis.localStorage = {
  getItem:key => store.has(key) ? store.get(key) : null,
  setItem:(key,value) => store.set(key,String(value)),
  removeItem:key => store.delete(key),
  clear:() => store.clear()
};

const {
  BACKUP_FORMAT,
  BACKUP_SCHEMA_VERSION,
  BACKUP_KEYS,
  LEARNER_KEYS,
  collectBackup,
  validateBackup,
  applyBackup,
  resetLearnerData,
  summarizeBackup
} = await import('../data-portability-v1.js');

const CORE_KEY='ielts-self-learning-v1';
const ADAPTIVE_KEY='ielts-adaptive-v1';
const PLAN_KEY='ielts-study-plan-v1';
const THEME_KEY='ielts-theme';

const core = {
  profile:{targetBand:7}, study:{preferredMinutes:30}, placement:{total:18},
  completedLessons:['R01','L01'], lessonAnswers:{}, notes:{}, errors:[{id:'e1'}], fixedErrors:[], studyHistory:[], writingDrafts:{}, speakingTranscripts:{}, ui:{chineseHelp:false}
};
const adaptive = {
  reviewSchedule:{}, repairProgress:{}, reviewHistory:[], vocabularySchedule:{}, vocabularyHistory:[],
  skillPerformance:{reading:{answered:4,correct:3,accuracy:.75}}, learningHistory:[],
  productiveEvidence:{writing:[{id:'pe1'}],speaking:[]}, productivePriority:{},
  aiFeedbackReturns:{writing:[{id:'af1'}],speaking:[]}, miniTestHistory:[{testId:'MR01'}]
};
const plan = {
  version:1, config:{weeks:4,daysPerWeek:3,minutesPerSession:20},
  weeks:[{week:1,phase:'Foundation',sessions:[]}], manualDone:[], summary:{totalSessions:0,examSessions:0,examRatio:0}
};
localStorage.setItem(CORE_KEY,JSON.stringify(core));
localStorage.setItem(ADAPTIVE_KEY,JSON.stringify(adaptive));
localStorage.setItem(PLAN_KEY,JSON.stringify(plan));
localStorage.setItem(THEME_KEY,'dark');

const backup=collectBackup();
assert(backup.format===BACKUP_FORMAT,'Export must use the documented backup format.');
assert(backup.schemaVersion===BACKUP_SCHEMA_VERSION,'Export must use the current backup schema version.');
assert(BACKUP_KEYS.length===4&&BACKUP_KEYS.includes(THEME_KEY),'Backup allow-list must contain exactly the known learner/theme keys.');
assert(LEARNER_KEYS.length===3&&!LEARNER_KEYS.includes(THEME_KEY),'Reset learner keys must intentionally exclude appearance preference.');
validateBackup(backup);
const summary=summarizeBackup(backup);
assert(summary.placement===true,'Backup summary must detect Placement.');
assert(summary.coreCompleted===2,'Backup summary must count core completion.');
assert(summary.errors===1,'Backup summary must count saved errors.');
assert(summary.miniTests===1,'Backup summary must count Mini Test history.');
assert(summary.productiveAttempts===1,'Backup summary must count productive evidence.');
assert(summary.feedbackReturns===1,'Backup summary must count AI feedback returns.');
assert(summary.planWeeks===1,'Backup summary must count Study Plan weeks.');
assert(summary.theme==='dark','Backup must include theme preference.');

const unknown=structuredClone(backup);
unknown.data['unrelated-storage-key']={x:1};
let rejectedUnknown=false;
try{validateBackup(unknown)}catch(error){rejectedUnknown=error.message.includes('unknown storage keys')}
assert(rejectedUnknown,'Import must reject unknown localStorage keys.');

const incomplete=structuredClone(backup);
delete incomplete.data[PLAN_KEY];
let rejectedMissing=false;
try{validateBackup(incomplete)}catch(error){rejectedMissing=error.message.includes('incomplete')}
assert(rejectedMissing,'Import must reject incomplete backup envelopes.');

const malformed=structuredClone(backup);
malformed.data[CORE_KEY].completedLessons={bad:true};
let rejectedCore=false;
try{validateBackup(malformed)}catch(error){rejectedCore=error.message.includes('completedLessons')}
assert(rejectedCore,'Import must reject malformed core learner arrays.');

const badPlan=structuredClone(backup);
badPlan.data[PLAN_KEY]={version:9,config:{},weeks:[],manualDone:[]};
let rejectedPlan=false;
try{validateBackup(badPlan)}catch(error){rejectedPlan=error.message.includes('Unsupported Study Plan')}
assert(rejectedPlan,'Import must reject unsupported Study Plan versions.');

const replacement=structuredClone(backup);
replacement.data[CORE_KEY]={...core,completedLessons:['R01','R02','R03']};
replacement.data[ADAPTIVE_KEY]=null;
replacement.data[PLAN_KEY]=null;
replacement.data[THEME_KEY]='light';
applyBackup(replacement);
assert(JSON.parse(localStorage.getItem(CORE_KEY)).completedLessons.length===3,'Import must replace core learner data.');
assert(localStorage.getItem(ADAPTIVE_KEY)===null,'Import must remove a key when backup stores null.');
assert(localStorage.getItem(PLAN_KEY)===null,'Import must remove a missing Study Plan represented by null.');
assert(localStorage.getItem(THEME_KEY)==='light','Import must restore appearance preference.');

localStorage.setItem(ADAPTIVE_KEY,JSON.stringify(adaptive));
localStorage.setItem(PLAN_KEY,JSON.stringify(plan));
resetLearnerData();
assert(localStorage.getItem(CORE_KEY)===null,'Reset must remove core learner data.');
assert(localStorage.getItem(ADAPTIVE_KEY)===null,'Reset must remove adaptive learner data.');
assert(localStorage.getItem(PLAN_KEY)===null,'Reset must remove Study Plan data.');
assert(localStorage.getItem(THEME_KEY)==='light','Reset must preserve Light/Dark preference.');

const source=fs.readFileSync(path.join(root,'data-portability-v1.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(source.includes("accept=\"application/json,.json\""),'Import control must accept JSON backup files.');
assert(source.includes('MAX_BACKUP_CHARS = 5_000_000'),'Import must enforce a bounded backup size.');
assert(source.includes("No file is uploaded to a server."),'UI must state that backup/import stays local.');
assert(source.includes('previous data was restored'),'Import must attempt rollback if localStorage write fails.');
assert(source.includes('Reset removes only learner-data keys'),'Reset scope must be explicit in the UI.');
assert(index.indexOf('./data-portability-v1.js')>index.indexOf('./study-plan-v1.js'),'Data portability should load after Study Plan so its Progress card can anchor last.');

console.log('✓ Local data export uses a versioned, allow-listed backup envelope');
console.log('✓ Import rejects unknown, incomplete and malformed data before writing');
console.log('✓ Import replaces/removes only known IELTS storage keys');
console.log('✓ Learner-data reset preserves the Light/Dark appearance preference');
console.log('✓ Backup summary covers Placement, core progress, errors, Mini Tests, productive evidence, AI feedback and Study Plan');
