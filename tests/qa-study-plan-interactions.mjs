import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const store = new Map();

globalThis.localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key,value) => store.set(key,String(value)),
  removeItem: key => store.delete(key),
  clear: () => store.clear()
};
globalThis.location = { hash:'#/qa' };
globalThis.window = {
  addEventListener(){},
  dispatchEvent(){ return true; },
  scrollTo(){}
};
globalThis.document = {
  documentElement:{},
  addEventListener(){},
  querySelector(){ return null; },
  querySelectorAll(){ return []; }
};
globalThis.MutationObserver = class { observe(){} disconnect(){} };
globalThis.CustomEvent = class { constructor(type,init={}){ this.type=type; this.detail=init.detail; } };

const assert = (condition,message) => { if(!condition) throw new Error(message); };
const write = (key,value) => localStorage.setItem(key,JSON.stringify(value));

await import('../curriculum-batch-01.js');
await import('../curriculum-batch-02.js');
await import('../question-type-lab-v1.js');
await import('../question-type-lab-v2.js');
const { generatePlan, phaseFor, actualDone } = await import(`../study-plan-v1.js?qa=${Date.now()}`);

const baseCore = {
  profile:{ targetBand:7, placementSections:null },
  study:{ preferredMinutes:30 },
  placement:null,
  completedLessons:[], lessonAnswers:{}, errors:[], studyHistory:[]
};
write(CORE_KEY,baseCore);
write(ADAPTIVE_KEY,{});

const fourWeek = generatePlan({weeks:4,daysPerWeek:3,minutesPerSession:20});
assert(fourWeek.weeks.length===4,'4-week plan must contain four weeks.');
assert(fourWeek.summary.totalSessions===12,'4-week × 3-day plan must contain 12 sessions.');
assert(fourWeek.weeks[0].sessions[0].kind==='placement','Missing Placement must be session 1.');
assert(['Foundation','Build','Transfer','Test & Review'].every((phase,i)=>phaseFor(i+1,4)===phase),'4-week phase sequence is incorrect.');
assert(fourWeek.weeks.every(w=>w.sessions.length===3),'Each week must match configured study days.');
assert(fourWeek.weeks.flatMap(w=>w.sessions).every(s=>s.minutes<=20),'Sessions must respect the 20-minute cap.');

const coreWithProfile = {
  ...baseCore,
  profile:{ targetBand:7, placementSections:{reading:2,listening:5,vocabulary:5,grammar:4} },
  placement:{ total:16, sectionScores:{reading:2,listening:5,vocabulary:5,grammar:4} }
};
const adaptive = {
  skillPerformance:{ reading:{answered:12,correct:5,accuracy:5/12} },
  productivePriority:{ writing:{score:.9,attempts:1,retries:0,average:.4} },
  productiveEvidence:{ writing:[{attemptKind:'retry',ts:1}], speaking:[] },
  miniTestHistory:[], reviewSchedule:{}, vocabularySchedule:{}
};
write(CORE_KEY,coreWithProfile);
write(ADAPTIVE_KEY,adaptive);

const longPlan = generatePlan({weeks:12,daysPerWeek:5,minutesPerSession:30});
assert(longPlan.summary.totalSessions===60,'12-week × 5-day plan must contain 60 sessions.');
assert(longPlan.priorities[0].skill==='reading','Observed weak Reading evidence should raise Reading priority.');
const productive = longPlan.weeks.flatMap(w=>w.sessions).filter(s=>s.kind==='productive-retry'&&s.skill==='writing');
assert(productive.length>=2,'Long plan should contain repeated Writing retry opportunities when Writing has productive priority.');
assert(productive.every((s,i)=>i===0||s.requiredRetryCount>productive[i-1].requiredRetryCount),'Repeated productive retries must require increasing retry counts.');

const baselineAdaptive = structuredClone(adaptive);
assert(!actualDone(productive[0],coreWithProfile,baselineAdaptive,longPlan),'A retry completed before plan generation must not complete the first planned retry.');
const afterOne = structuredClone(adaptive);
afterOne.productiveEvidence.writing.push({attemptKind:'retry',ts:Date.now()});
assert(actualDone(productive[0],coreWithProfile,afterOne,longPlan),'One new retry should complete the first planned retry.');
assert(!actualDone(productive[1],coreWithProfile,afterOne,longPlan),'One new retry must not complete a later planned retry.');

const lessonTask = longPlan.weeks.flatMap(w=>w.sessions).find(s=>s.kind==='lesson');
assert(lessonTask,'Plan should contain at least one lesson task.');
longPlan.manualDone=[lessonTask.key];
assert(!actualDone(lessonTask,coreWithProfile,afterOne,longPlan),'ManualDone must not fake completion of auto-tracked lessons.');
const reviewTask = longPlan.weeks.flatMap(w=>w.sessions).find(s=>s.kind==='review');
assert(reviewTask,'Plan should contain review sessions.');
longPlan.manualDone=[reviewTask.key];
assert(actualDone(reviewTask,coreWithProfile,afterOne,longPlan),'Review/buffer sessions must remain manually completable.');

const studyPlanSource = fs.readFileSync(path.join(root,'study-plan-v1.js'),'utf8');
const miniSource = fs.readFileSync(path.join(root,'mini-test-runtime-v1.js'),'utf8');
const styles = fs.readFileSync(path.join(root,'styles.css'),'utf8');
const extensionStyles = fs.readFileSync(path.join(root,'learning-extension.css'),'utf8');

assert(studyPlanSource.includes('data-mini-action="start"') && studyPlanSource.includes('data-test-id='),'Study Plan Mini Test control should launch the specified test directly.');
assert(studyPlanSource.includes("taskItem.kind === 'review' && (plan.manualDone || []).includes(taskItem.key)"),'Manual completion must be restricted to review sessions.');
assert(studyPlanSource.includes('refreshAfterPlacement()'),'A pre-placement plan must refresh after Placement becomes available.');
assert(miniSource.includes("const stopSpeech=()=>{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }"),'Mini Test speech cancellation must be guarded.');
assert(!miniSource.includes('speechSynthesis?.cancel?.()'),'Mini Test must not reference an undeclared speechSynthesis global during Reading submit.');
assert(miniSource.includes('aria-live="polite"'),'Mini Test timer should expose polite live updates.');
assert(styles.includes('.grid.two, .grid.three, .grid.four { grid-template-columns: 1fr; }'),'Phone layout must collapse multi-column Study Plan grids.');
assert(styles.includes('.cluster { display: flex; flex-wrap: wrap;'),'Study Plan action rows must be able to wrap on narrow widths.');
assert(extensionStyles.includes('.btn,.option,.time-chip{min-height:44px}'),'Phone primary controls should keep a 44px tap target.');

console.log('✓ Study Plan 4-week configuration and phase sequence');
console.log('✓ Study Plan respects study-day and per-session time limits');
console.log('✓ Productive retries are individually tracked instead of bulk-completed');
console.log('✓ Only Review/buffer sessions allow manual completion');
console.log('✓ Study Plan can launch a specific Mini Test directly');
console.log('✓ Reading Mini Test submit is safe without Web Speech API');
console.log('✓ Mobile grid, wrapping and tap-target guardrails are present');
