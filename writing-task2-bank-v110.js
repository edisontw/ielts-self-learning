import { registerRenderEnhancement, scheduleEnhancementPass } from './render-lifecycle-v15.js';

const CORE_KEY='ielts-self-learning-v1';
const ADAPTIVE_KEY='ielts-adaptive-v1';
const BANK_OWNER='WT2-BANK';
const CRITERIA=[
  ['task','I answered every part of the exact task and maintained a clear position.'],
  ['position','My introduction gives a precise position or clear response to the required questions.'],
  ['development','Each main idea is explained before or alongside examples.'],
  ['organization','Paragraphs have distinct jobs and the progression is easy to follow.'],
  ['language','I checked recurring grammar, sentence-boundary and collocation problems.']
];

export const WRITING_TASK2_PROMPTS=[
  {
    id:'WT2-OP-01',family:'opinion',familyLabel:'Opinion',title:'Public transport or new roads',difficulty:3,
    prompt:'Some people think governments should spend more money on improving public transport than on building new roads. To what extent do you agree or disagree?',
    requirements:['State how far you agree or disagree.','Keep the same position throughout the essay.','Develop reasons that directly compare the value of the two spending priorities.']
  },
  {
    id:'WT2-OP-02',family:'opinion',familyLabel:'Opinion',title:'Community service at university',difficulty:4,
    prompt:'University students should be required to complete a period of unpaid community service as part of their degree. To what extent do you agree or disagree?',
    requirements:['Take a clear position on whether the requirement should apply.','Address practical or educational consequences of making it compulsory.','Avoid discussing volunteering in general without answering the compulsory-degree requirement.']
  },
  {
    id:'WT2-DISC-01',family:'discussion',familyLabel:'Discussion + opinion',title:'Online and classroom education',difficulty:3,
    prompt:'Some people believe online education can replace most classroom teaching, while others think face-to-face learning will always be essential. Discuss both views and give your own opinion.',
    requirements:['Explain why online education could replace much classroom teaching.','Explain why face-to-face learning may remain essential.','Give and maintain your own judgement.']
  },
  {
    id:'WT2-DISC-02',family:'discussion',familyLabel:'Discussion + opinion',title:'What museums should display',difficulty:4,
    prompt:'Some people think museums should mainly present the history and culture of their local area, while others believe they should show objects and ideas from many parts of the world. Discuss both views and give your own opinion.',
    requirements:['Develop the case for a strong local focus.','Develop the case for wider international representation.','Make your own position explicit rather than ending with two balanced summaries only.']
  },
  {
    id:'WT2-ADV-01',family:'advantages',familyLabel:'Advantages / disadvantages',title:'A four-day working week',difficulty:3,
    prompt:'In some organisations, employees work four longer days instead of five standard days each week. Do the advantages of this arrangement outweigh the disadvantages?',
    requirements:['Identify meaningful advantages and disadvantages.','Compare their importance, not just their number.','State clearly which side is stronger overall.']
  },
  {
    id:'WT2-ADV-02',family:'advantages',familyLabel:'Advantages / disadvantages',title:'Companies moving to regional areas',difficulty:4,
    prompt:'Some governments encourage large companies to move offices and factories away from major cities to smaller towns and regional areas. Do the advantages of this policy outweigh the disadvantages?',
    requirements:['Discuss consequences for both major cities and receiving regions where relevant.','Explain the most important benefits and costs.','Make an explicit outweigh judgement.']
  },
  {
    id:'WT2-PS-01',family:'problems-solutions',familyLabel:'Problems / solutions',title:'Long urban commuting times',difficulty:3,
    prompt:'In many cities, people are spending more time travelling between home and work or study. What problems does this cause, and what measures could governments and employers take to reduce these problems?',
    requirements:['Explain problems caused by longer commuting time.','Propose measures that governments and/or employers can realistically take.','Link solutions to the problems instead of listing unrelated transport policies.']
  },
  {
    id:'WT2-PS-02',family:'problems-solutions',familyLabel:'Problems / solutions',title:'Household food waste',difficulty:4,
    prompt:'Large amounts of edible food are thrown away by households in many countries. Why does this happen, and what can be done to reduce household food waste?',
    requirements:['Explain plausible causes of household food waste.','Propose actions that address those causes.','Keep the focus on household waste rather than food loss during farming or manufacturing.']
  },
  {
    id:'WT2-TWO-01',family:'two-part',familyLabel:'Two-part question',title:'Growth of second-hand shopping',difficulty:3,
    prompt:'More people are buying second-hand clothes, furniture and electronic devices instead of purchasing new products. Why is second-hand shopping becoming more popular? Is this a positive or negative development?',
    requirements:['Answer why second-hand shopping is becoming more popular.','Make a clear positive/negative judgement.','Support the judgement with consequences, not only reasons for the trend.']
  },
  {
    id:'WT2-TWO-02',family:'two-part',familyLabel:'Two-part question',title:'Car-free areas in city centres',difficulty:4,
    prompt:'An increasing number of cities are creating car-free areas in their centres. Why are cities introducing these areas? How might this change affect residents and local businesses?',
    requirements:['Explain why cities are introducing car-free areas.','Explain effects on residents and local businesses.','Cover both questions clearly; do not turn the essay into a simple agree/disagree response.']
  }
].map(p=>({...p,source:{type:'original',label:'Original IELTS-style Task 2 practice'}}));

let activeId=WRITING_TASK2_PROMPTS[0].id;
let mode='practice';
let opened=false;
let timerSeconds=2400;
let timerHandle=null;

const esc=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const words=(text='')=>(String(text).trim().match(/\S+/g)||[]).length;
const promptById=(id)=>WRITING_TASK2_PROMPTS.find(p=>p.id===id)||WRITING_TASK2_PROMPTS[0];

function ensureCore(){
  const core=read(CORE_KEY);
  core.writingDrafts||={};
  core.notes||={};
  return core;
}
function ensureAdaptive(){
  const adaptive=read(ADAPTIVE_KEY);
  adaptive.productiveEvidence||={writing:[],speaking:[]};
  adaptive.productiveEvidence.writing||=[];
  adaptive.productiveEvidence.speaking||=[];
  adaptive.productivePriority||={};
  adaptive.aiFeedbackReturns||={writing:[],speaking:[]};
  adaptive.aiFeedbackReturns.writing||=[];
  adaptive.aiFeedbackReturns.speaking||=[];
  return adaptive;
}
function saveDraft(id,text){const core=ensureCore();core.writingDrafts[id]=text;write(CORE_KEY,core);}
function savePlan(id,text){const core=ensureCore();core.notes[`WT2PLAN-${id}`]=text;write(CORE_KEY,core);}
function evidenceFor(adaptive,promptId){return (adaptive.productiveEvidence.writing||[]).filter(x=>x.lessonId===BANK_OWNER&&x.blockId===promptId).sort((a,b)=>a.ts-b.ts);}
function feedbackFor(adaptive,promptId){return (adaptive.aiFeedbackReturns.writing||[]).filter(x=>x.lessonId===BANK_OWNER&&x.promptId===promptId).sort((a,b)=>a.ts-b.ts);}
function pendingFeedback(adaptive,promptId){return [...feedbackFor(adaptive,promptId)].reverse().find(x=>!x.appliedByEvidenceId)||null;}
function latestEvidence(adaptive,promptId){return evidenceFor(adaptive,promptId).at(-1)||null;}
function updateWritingPriority(adaptive){
  const rows=[...(adaptive.productiveEvidence.writing||[])].sort((a,b)=>a.ts-b.ts);
  if(!rows.length){delete adaptive.productivePriority.writing;return;}
  const retries=rows.filter(x=>x.attemptKind==='retry').length;
  const recent=rows.slice(-4);
  const average=recent.reduce((s,x)=>s+Number(x.score||0),0)/recent.length;
  adaptive.productivePriority.writing={
    score:Math.min(1,(1-average)*.8+(retries===0?.12:0)),
    attempts:rows.length,retries,average,latestAt:rows.at(-1)?.ts||null,lessonId:'W05',updatedAt:Date.now()
  };
}
function comparison(source,retry){
  const before=new Set(source?.criteria||[]),after=new Set(retry?.criteria||[]);
  return {processDelta:Number(retry?.score||0)-Number(source?.score||0),wordCountDelta:Number(retry?.wordCount||0)-Number(source?.wordCount||0),criteriaAdded:[...after].filter(x=>!before.has(x)),criteriaLost:[...before].filter(x=>!after.has(x))};
}
function linkPendingFeedback(adaptive,retry){
  if(retry.attemptKind!=='retry')return null;
  const pending=[...feedbackFor(adaptive,retry.blockId)].reverse().find(x=>!x.appliedByEvidenceId&&x.ts<=retry.ts);
  if(!pending)return null;
  const source=(adaptive.productiveEvidence.writing||[]).find(x=>x.id===pending.sourceEvidenceId)||null;
  pending.appliedByEvidenceId=retry.id;pending.appliedAt=retry.ts;pending.comparison=comparison(source,retry);return pending;
}
function coachingPrompt(prompt,draft){
  const core=ensureCore();const target=core.profile?.targetBand||7;
  return `You are an IELTS Academic Writing learning coach. This is learning feedback, not an official IELTS score.\n\nTARGET: Band ${target} (learning target only)\n\nTASK TYPE: ${prompt.familyLabel}\n\nTASK:\n${prompt.prompt}\n\nMY RESPONSE:\n${draft}\n\nUse the public IELTS Academic Writing criteria: Task Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.\n\nDo not give a fake precise band score. Instead:\n1. Identify my three highest-priority problems.\n2. Check whether I answered every part of this exact task and maintained the required position/judgement.\n3. Check whether each main idea is developed with explanation, consequence, comparison or example.\n4. Identify one organization problem and recurring language problems only when supported by my text.\n5. Quote only short phrases from my response when needed.\n6. Give one short repair action for each priority.\n7. Ask me to revise this response before showing a complete model answer.`;
}
async function copyText(text,button){
  try{await navigator.clipboard.writeText(text);const old=button.textContent;button.textContent='Copied';setTimeout(()=>button.textContent=old,1200)}
  catch{const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();}
}
function timerText(){const m=Math.floor(timerSeconds/60),s=timerSeconds%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function updateTimer(){const el=document.querySelector('[data-wt2-timer]');if(el)el.textContent=timerText();if(timerSeconds===0){clearInterval(timerHandle);timerHandle=null;}}
function startTimer(){if(timerHandle||timerSeconds<=0)return;timerHandle=setInterval(()=>{timerSeconds=Math.max(0,timerSeconds-1);updateTimer();},1000);}
function pauseTimer(){clearInterval(timerHandle);timerHandle=null;}
function resetTimer(){pauseTimer();timerSeconds=2400;updateTimer();}

function feedbackStatus(adaptive,prompt){
  const rows=feedbackFor(adaptive,prompt.id),pending=pendingFeedback(adaptive,prompt.id),latest=rows.at(-1);
  if(pending)return `<div class="callout warning" style="margin-top:12px"><strong>Feedback waiting for revision.</strong><br>${pending.priorities.map((x,i)=>`${i+1}. ${esc(x)}`).join('<br>')}<div class="small muted" style="margin-top:7px">Revise this same prompt, choose <strong>Revision / retry</strong>, then save evidence again.</div></div>`;
  if(latest?.appliedByEvidenceId){const d=latest.comparison?.processDelta||0;return `<div class="callout success" style="margin-top:12px"><strong>Feedback → retry cycle recorded.</strong><div class="small muted">Process self-check change ${d>=0?'+':''}${Math.round(d*100)} points.</div></div>`;}
  return '';
}
function workspaceHTML(){
  const prompt=promptById(activeId),core=ensureCore(),adaptive=ensureAdaptive();
  const draft=core.writingDrafts[prompt.id]||'',plan=core.notes[`WT2PLAN-${prompt.id}`]||'',count=words(draft),pending=pendingFeedback(adaptive,prompt.id),latest=latestEvidence(adaptive,prompt.id);
  const kind=pending?'retry':'first';
  return `<div data-wt2-workspace style="margin-top:18px">
    <div class="card elevated">
      <div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">Task 2 Practice Bank · V1.10</div><h2 style="margin-top:6px">10 full-length prompts across 5 task families</h2></div><span class="chip primary">Original practice</span></div>
      <div class="grid two" style="margin-top:14px">
        <label class="stack"><strong>Practice prompt</strong><select class="text-input" data-wt2-select>${WRITING_TASK2_PROMPTS.map(p=>`<option value="${p.id}" ${p.id===prompt.id?'selected':''}>${p.familyLabel} · ${esc(p.title)}</option>`).join('')}</select></label>
        <div><strong>Mode</strong><div class="cluster" style="margin-top:7px"><button class="btn ${mode==='practice'?'primary':'soft'}" data-wt2-mode="practice">Practice</button><button class="btn ${mode==='test'?'primary':'soft'}" data-wt2-mode="test">40-min Test</button><span class="chip" data-wt2-timer>${timerText()}</span><button class="btn ghost small-btn" data-wt2-timer-action="start">Start</button><button class="btn ghost small-btn" data-wt2-timer-action="pause">Pause</button><button class="btn ghost small-btn" data-wt2-timer-action="reset">Reset</button></div></div>
      </div>
      <div style="margin-top:18px"><div class="eyebrow">${prompt.familyLabel} · ${prompt.id} · Difficulty ${prompt.difficulty}/5</div><h3 style="margin-top:6px">${esc(prompt.title)}</h3><div class="reading-passage" style="margin-top:10px"><p>${esc(prompt.prompt)}</p></div></div>
      <div class="grid two" style="margin-top:16px">
        <label class="stack"><strong>My plan</strong><textarea class="text-area" data-wt2-plan placeholder="Position / answer to each task part…\nBody 1 idea + development…\nBody 2 idea + development…">${esc(plan)}</textarea></label>
        <div class="card subtle"><strong>Task checklist</strong>${mode==='test'?'<p class="small muted" style="margin-top:8px">Hidden in Test Mode. Complete the timed attempt before reviewing task requirements.</p>':`<ul style="margin-top:8px">${prompt.requirements.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`}</div>
      </div>
      <div style="margin-top:16px"><div class="cluster" style="justify-content:space-between"><div><strong>Task 2 response</strong><div class="small muted">Aim for at least 250 words. Drafts use the existing local writing store.</div></div><span class="chip ${count>=250?'success':'warning'}" data-wt2-count>${count} words</span></div><textarea class="text-area workspace-editor writing-input" style="margin-top:8px" data-wt2-draft data-writing-id="${prompt.id}" placeholder="Write your complete Task 2 response here…">${esc(draft)}</textarea></div>
      <section class="card subtle" style="margin-top:16px"><div class="eyebrow">Productive evidence</div><div class="grid two" style="margin-top:10px"><label class="stack"><strong>Attempt type</strong><select class="text-input" data-wt2-kind><option value="first" ${kind==='first'?'selected':''}>First attempt</option><option value="retry" ${kind==='retry'?'selected':''}>Revision / retry</option></select></label><div><strong>Evidence so far</strong><p class="small muted" style="margin-top:7px">${evidenceFor(adaptive,prompt.id).length} saved attempt${evidenceFor(adaptive,prompt.id).length===1?'':'s'}${latest?` · latest ${latest.wordCount} words · self-check ${Math.round((latest.score||0)*100)}%`:''}</p></div></div><div class="checklist" style="margin-top:12px">${CRITERIA.map(([id,label])=>`<label class="check-item"><input type="checkbox" data-wt2-criterion="${id}"> ${esc(label)}</label>`).join('')}</div><div class="cluster" style="margin-top:12px"><button class="btn primary" data-wt2-save-evidence ${count>=250?'':'disabled'}>${pending?'Save revision / retry evidence':'Save attempt evidence'}</button><span class="small muted">250+ words required; this is process evidence, not an IELTS band.</span></div></section>
      <section class="card subtle" style="margin-top:16px"><div class="eyebrow">AI feedback → revision</div><p class="muted" style="margin-top:7px">Copy coaching feedback only after your own attempt. Return with 2–3 actionable priorities, then revise this same prompt.</p><div class="cluster"><button class="btn ${mode==='test'?'soft':'primary'}" data-wt2-copy ${mode==='test'?'disabled':''}>${mode==='test'?'AI coaching hidden in Test Mode':'Copy AI coaching prompt'}</button></div><div class="stack" style="margin-top:12px"><label><strong>Priority 1</strong><input class="text-input" data-wt2-feedback maxlength="220" placeholder="One concrete change from feedback"></label><label><strong>Priority 2</strong><input class="text-input" data-wt2-feedback maxlength="220" placeholder="A second concrete change"></label><label><strong>Priority 3 <span class="small muted">optional</span></strong><input class="text-input" data-wt2-feedback maxlength="220" placeholder="Optional third change"></label></div><div class="cluster" style="margin-top:12px"><button class="btn soft" data-wt2-save-feedback ${latest&&!pending?'':'disabled'}>Save feedback priorities</button><span class="small muted">Save attempt evidence first. External AI scores are not imported.</span></div>${feedbackStatus(adaptive,prompt)}</section>
      <div class="small muted" style="margin-top:12px">Source: ${esc(prompt.source.label)}. Not an official IELTS question and not affiliated with IELTS.</div>
    </div>
  </div>`;
}
function bankHTML(){return `<section class="focus-card" data-wt2-bank-card style="margin-bottom:18px"><div class="eyebrow">Academic Writing · Task 2</div><h2>Practice breadth after W05: 5 task families × 2 full essays</h2><p class="lede">Use complete 250+ word prompts to transfer W01–W05 skills across Opinion, Discussion, Advantages/Disadvantages, Problems/Solutions and Two-part questions.</p><div class="cluster"><button class="btn primary" data-wt2-open>${opened?'Close Task 2 Practice Bank':'Open Task 2 Practice Bank'}</button><button class="btn soft" data-lesson="W05">Review the full Task 2 workflow first</button></div>${opened?workspaceHTML():''}</section>`;}
function mount(){
  if(!location.hash.includes('/ielts'))return;
  const existing=document.querySelector('[data-wt2-bank-card]');
  if(existing)return;
  const anchor=document.querySelector('[data-wt1-ielts-card]')||document.querySelector('#main .page-head');
  if(anchor)anchor.insertAdjacentHTML('afterend',bankHTML());
}
function rerender(){const old=document.querySelector('[data-wt2-bank-card]');if(old)old.outerHTML=bankHTML();else mount();}
function saveEvidence(){
  const prompt=promptById(activeId),core=ensureCore(),draft=core.writingDrafts[prompt.id]||'',count=words(draft);if(count<250)return;
  const card=document.querySelector('[data-wt2-workspace]');const criteria=[...card.querySelectorAll('[data-wt2-criterion]')].filter(x=>x.checked).map(x=>x.dataset.wt2Criterion);const attemptKind=card.querySelector('[data-wt2-kind]')?.value||'first';
  const adaptive=ensureAdaptive();const event={id:`pe-${Date.now()}-${prompt.id}`,ts:Date.now(),skill:'writing',lessonId:BANK_OWNER,blockId:prompt.id,promptId:prompt.id,attemptKind,criteria,score:criteria.length/CRITERIA.length,wordCount:count};adaptive.productiveEvidence.writing.push(event);linkPendingFeedback(adaptive,event);updateWritingPriority(adaptive);write(ADAPTIVE_KEY,adaptive);window.dispatchEvent(new CustomEvent('ielts-productive-evidence-change',{detail:event}));rerender();
}
function saveFeedback(){
  const prompt=promptById(activeId),adaptive=ensureAdaptive(),source=latestEvidence(adaptive,prompt.id);if(!source||pendingFeedback(adaptive,prompt.id))return;
  const priorities=[...document.querySelectorAll('[data-wt2-feedback]')].map(x=>x.value.trim()).filter(Boolean).slice(0,3);if(priorities.length<2){alert('Add at least two actionable feedback priorities.');return;}
  const event={id:`afr-${Date.now()}-${prompt.id}`,ts:Date.now(),skill:'writing',lessonId:BANK_OWNER,promptId:prompt.id,sourceEvidenceId:source.id,sourceAttemptKind:source.attemptKind,priorities,appliedByEvidenceId:null,appliedAt:null,comparison:null};adaptive.aiFeedbackReturns.writing.push(event);write(ADAPTIVE_KEY,adaptive);window.dispatchEvent(new CustomEvent('ielts-ai-feedback-return-change',{detail:event}));rerender();
}

document.addEventListener('input',e=>{
  if(e.target.matches('[data-wt2-draft]')){saveDraft(activeId,e.target.value);const n=words(e.target.value),count=document.querySelector('[data-wt2-count]'),saveButton=document.querySelector('[data-wt2-save-evidence]');if(count){count.textContent=`${n} words`;count.className=`chip ${n>=250?'success':'warning'}`;}if(saveButton)saveButton.disabled=n<250;}
  if(e.target.matches('[data-wt2-plan]'))savePlan(activeId,e.target.value);
});
document.addEventListener('change',e=>{
  if(e.target.matches('[data-wt2-select]')){activeId=e.target.value;resetTimer();rerender();}
});
document.addEventListener('click',e=>{
  const open=e.target.closest('[data-wt2-open]');if(open){opened=!opened;pauseTimer();rerender();return;}
  const m=e.target.closest('[data-wt2-mode]');if(m){mode=m.dataset.wt2Mode;if(mode==='practice')pauseTimer();else resetTimer();rerender();return;}
  const t=e.target.closest('[data-wt2-timer-action]');if(t){if(t.dataset.wt2TimerAction==='start')startTimer();if(t.dataset.wt2TimerAction==='pause')pauseTimer();if(t.dataset.wt2TimerAction==='reset')resetTimer();return;}
  const copy=e.target.closest('[data-wt2-copy]');if(copy&&!copy.disabled){const p=promptById(activeId),draft=ensureCore().writingDrafts[p.id]||'';copyText(coachingPrompt(p,draft),copy);return;}
  if(e.target.closest('[data-wt2-save-evidence]')){saveEvidence();return;}
  if(e.target.closest('[data-wt2-save-feedback]')){saveFeedback();return;}
});
window.addEventListener('ielts-productive-evidence-change',()=>setTimeout(()=>{if(opened&&location.hash.includes('/ielts'))rerender();},0));
window.addEventListener('ielts-ai-feedback-return-change',()=>setTimeout(()=>{if(opened&&location.hash.includes('/ielts'))rerender();},0));
registerRenderEnhancement(mount);

export { coachingPrompt, words };
