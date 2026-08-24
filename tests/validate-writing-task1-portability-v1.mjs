class MemoryStorage {
  constructor(seed={}){this.map=new Map(Object.entries(seed));}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.map.set(key,String(value));}
  removeItem(key){this.map.delete(key);}
}

const CORE_KEY='ielts-self-learning-v1';
const WT1_KEY='ielts-writing-task1-v1';
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

globalThis.localStorage=new MemoryStorage({
  [CORE_KEY]:JSON.stringify({writingDrafts:{'WT1-LINE-01':'portable draft'},notes:{'wt1-plan-WT1-LINE-01':'portable plan'}}),
  [WT1_KEY]:JSON.stringify({activeId:'WT1-BAR-01',mode:'test',drafts:{'WT1-LINE-01':'stale draft'},plans:{'WT1-LINE-01':'stale plan'},attempts:[{id:'ui-only'}]})
});

const { hydrateWorkspaceFromCore, mirrorDraft, mirrorPlan, syncCurrentWorkspace } = await import('../writing-task1-portability-v1.js');

hydrateWorkspaceFromCore();
let ui=JSON.parse(localStorage.getItem(WT1_KEY));
assert(ui.activeId==='WT1-BAR-01','Hydration must preserve the selected Task 1 prompt.');
assert(ui.mode==='test','Hydration must preserve Practice/Test mode.');
assert(ui.drafts['WT1-LINE-01']==='portable draft','Portable core draft must replace stale UI-cache draft.');
assert(ui.plans['WT1-LINE-01']==='portable plan','Portable core plan must replace stale UI-cache plan.');

mirrorDraft('WT1-TABLE-01','new table draft');
mirrorPlan('WT1-TABLE-01','overview + two detail groups');
let core=JSON.parse(localStorage.getItem(CORE_KEY));
assert(core.writingDrafts['WT1-TABLE-01']==='new table draft','Task 1 drafts must be mirrored into core.writingDrafts.');
assert(core.notes['wt1-plan-WT1-TABLE-01']==='overview + two detail groups','Task 1 plans must be mirrored into core.notes.');

ui=JSON.parse(localStorage.getItem(WT1_KEY));
ui.drafts['WT1-MAP-01']='map draft';
ui.plans['WT1-MAP-01']='map plan';
localStorage.setItem(WT1_KEY,JSON.stringify(ui));
syncCurrentWorkspace();
core=JSON.parse(localStorage.getItem(CORE_KEY));
assert(core.writingDrafts['WT1-MAP-01']==='map draft','Workspace sync must preserve cached drafts in portable core data.');
assert(core.notes['wt1-plan-WT1-MAP-01']==='map plan','Workspace sync must preserve cached plans in portable core data.');

// Simulate learner-data reset: core is removed while the UI cache still exists.
localStorage.removeItem(CORE_KEY);
hydrateWorkspaceFromCore();
ui=JSON.parse(localStorage.getItem(WT1_KEY));
assert(Object.keys(ui.drafts).length===0,'Reset core data must clear stale Task 1 draft cache.');
assert(Object.keys(ui.plans).length===0,'Reset core data must clear stale Task 1 plan cache.');
assert(ui.activeId==='WT1-BAR-01'&&ui.mode==='test','Reset must keep harmless Task 1 UI preferences.');

console.log('✓ Task 1 drafts and plans use the existing portable core learner record');
console.log('✓ Backup/import hydration restores Task 1 workspace content from core data');
console.log('✓ Learner-data reset cannot leave stale Task 1 drafts or plans in the UI cache');
