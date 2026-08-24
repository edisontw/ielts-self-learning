const WT1_KEY='ielts-writing-task1-v1';
const CORE_KEY='ielts-self-learning-v1';
const PLAN_PREFIX='wt1-plan-';

const read=(key,fallback={})=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return structuredClone(fallback);}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));

function coreState(){
  const core=read(CORE_KEY,{});
  core.writingDrafts ||= {};
  core.notes ||= {};
  return core;
}

function wt1State(){
  const wt1=read(WT1_KEY,{});
  wt1.activeId ||= 'WT1-LINE-01';
  wt1.mode ||= 'practice';
  wt1.drafts ||= {};
  wt1.plans ||= {};
  return wt1;
}

function hydrateWorkspaceFromCore(){
  const core=coreState();
  const wt1=wt1State();
  const corePromptIds=Object.keys(core.writingDrafts).filter(id=>id.startsWith('WT1-'));
  const corePlanIds=Object.keys(core.notes).filter(id=>id.startsWith(PLAN_PREFIX)).map(id=>id.slice(PLAN_PREFIX.length));

  // The core learner record is the portable source of truth. This also ensures
  // Reset learner data cannot leave stale Task 1 drafts in the UI-only key.
  wt1.drafts=Object.fromEntries(corePromptIds.map(id=>[id,core.writingDrafts[id]]));
  wt1.plans=Object.fromEntries(corePlanIds.map(id=>[id,core.notes[`${PLAN_PREFIX}${id}`]]));
  write(WT1_KEY,wt1);
}

function mirrorDraft(id,text){
  if(!id?.startsWith('WT1-'))return;
  const core=coreState();
  core.writingDrafts[id]=text;
  write(CORE_KEY,core);
}

function mirrorPlan(id,text){
  if(!id?.startsWith('WT1-'))return;
  const core=coreState();
  core.notes[`${PLAN_PREFIX}${id}`]=text;
  write(CORE_KEY,core);
}

function syncCurrentWorkspace(){
  const wt1=wt1State();
  for(const [id,text] of Object.entries(wt1.drafts||{})) mirrorDraft(id,text);
  for(const [id,text] of Object.entries(wt1.plans||{})) mirrorPlan(id,text);
}

if(typeof document!=='undefined'){
  // Run before the dynamic workspace mounts. After import/reload, portable CORE
  // data repopulates the UI cache; after reset, the cache is cleared.
  hydrateWorkspaceFromCore();

  document.addEventListener('input',event=>{
    const draft=event.target.closest?.('[data-wt1-draft]');
    if(draft){mirrorDraft(draft.dataset.writingId,draft.value);return;}
    const plan=event.target.closest?.('[data-wt1-plan]');
    if(plan){mirrorPlan(wt1State().activeId,plan.value);}
  });

  window.addEventListener('beforeunload',syncCurrentWorkspace);
}

export { WT1_KEY, CORE_KEY, PLAN_PREFIX, hydrateWorkspaceFromCore, mirrorDraft, mirrorPlan, syncCurrentWorkspace };
