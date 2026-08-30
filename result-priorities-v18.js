import './repair-registry-v15.js';
import { REPAIR_LESSONS, repairMatchesError } from './adaptive-data.js';
import { V16_SKILL_REPAIR_LESSONS } from './skill-repair-registry-v16.js';
import { existingPracticeRecommendationFor } from './existing-practice-routing-v17.js';

const esc=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

function repairPriority(error){
  const skillRepair=V16_SKILL_REPAIR_LESSONS.find(lesson=>repairMatchesError(lesson,error));
  if(skillRepair){
    return {
      key:`skill-repair:${skillRepair.id}`,
      kind:'skill-repair',
      skill:error.skill,
      label:skillRepair.evidence?.family || skillRepair.title,
      reason:`Repeated transfer evidence has an audited instructional gap owned by ${skillRepair.id}.`,
      primary:{id:skillRepair.id,title:skillRepair.title},
      transfer:null,
      evidenceCount:Number(skillRepair.evidence?.auditedQuestions||0)
    };
  }

  const languageRepair=REPAIR_LESSONS.find(lesson=>repairMatchesError(lesson,error));
  if(languageRepair){
    return {
      key:`repair:${languageRepair.id}`,
      kind:'repair',
      skill:error.skill,
      label:languageRepair.title,
      reason:`This error matches the existing ${languageRepair.id} Vocabulary / Grammar Repair taxonomy.`,
      primary:{id:languageRepair.id,title:languageRepair.title},
      transfer:null,
      evidenceCount:Number(languageRepair.evidence?.auditedQuestions||0)
    };
  }

  return null;
}

export function authorizedPriorityFor(error={}){
  const existing=existingPracticeRecommendationFor(error);
  if(existing){
    return {
      key:`existing:${existing.family}:${existing.primary.id}:${existing.transfer?.id||''}`,
      kind:'existing-practice',
      skill:error.skill,
      label:existing.familyData?.label || existing.family,
      reason:existing.familyData?.reason || 'Existing Core/Lab teaching already owns this transfer pattern.',
      primary:existing.primary,
      transfer:existing.transfer||null,
      evidenceCount:Number(existing.familyData?.auditedQuestions||0)
    };
  }
  return repairPriority(error);
}

export function buildResultPriorities(errors=[],limit=3){
  const groups=new Map();
  for(const error of errors){
    if(!error?.errorTag||!error?.skill)continue;
    const priority=authorizedPriorityFor(error);
    if(!priority)continue;
    const row=groups.get(priority.key)||{...priority,count:0,itemIds:[]};
    row.count+=1;
    if(error.questionId)row.itemIds.push(error.questionId);
    groups.set(priority.key,row);
  }
  return [...groups.values()]
    .sort((a,b)=>b.count-a.count||b.evidenceCount-a.evidenceCount||a.label.localeCompare(b.label))
    .slice(0,limit);
}

function routeText(priority){
  return priority.transfer
    ? `${priority.primary.id} → ${priority.transfer.id}`
    : priority.primary.id;
}

function actionButtons(priority,isPrimary=false){
  return `<button class="btn ${isPrimary?'primary':'soft'}" data-lesson="${esc(priority.primary.id)}">${isPrimary?'Start':'Review'} ${esc(priority.primary.id)}</button>${priority.transfer?`<button class="btn ghost small-btn" data-lesson="${esc(priority.transfer.id)}">Then practise ${esc(priority.transfer.id)}</button>`:''}`;
}

export function resultPriorityPanelHTML(errors=[],options={}){
  if(!errors.length)return '';
  const priorities=buildResultPriorities(errors,3);
  const sourceLabel=options.sourceLabel||'this attempt';
  if(!priorities.length){
    return `<section class="card result-priorities-v18" data-result-priorities-v18>
      <div class="eyebrow">What to fix next</div>
      <h2 style="margin:7px 0 9px">Review the missed items before choosing more practice.</h2>
      <p class="muted">${esc(sourceLabel)} produced ${errors.length} missed item${errors.length===1?'':'s'}, but none maps to an already-authorized Repair or existing-practice route. Review the evidence below instead of creating a recommendation from sparse signals.</p>
    </section>`;
  }

  const top=priorities[0];
  return `<section class="card result-priorities-v18" data-result-priorities-v18>
    <div class="cluster" style="justify-content:space-between;align-items:flex-start">
      <div><div class="eyebrow">What to fix next</div><h2 style="margin:7px 0 9px">Your priorities</h2></div>
      <span class="chip primary">${priorities.length} evidence-backed priorit${priorities.length===1?'y':'ies'}</span>
    </div>
    <p class="muted">Grouped from missed items in ${esc(sourceLabel)}. These suggestions reuse teaching ownership that was already validated elsewhere; this result does not create a new Repair route.</p>
    <div class="repair-grid" style="margin-top:14px">${priorities.map((priority,index)=>`<article class="repair-card" data-result-priority="${esc(priority.key)}">
      <div class="cluster"><span class="chip">${esc(priority.skill)}</span><span class="chip warning">${priority.count} missed item${priority.count===1?'':'s'}</span></div>
      <h3>${esc(priority.label)}</h3>
      <p class="muted">${esc(priority.reason)}</p>
      <div class="meta"><span>${esc(routeText(priority))}</span>${priority.evidenceCount?`<span>${priority.evidenceCount} audit signals</span>`:''}</div>
      <div class="cluster">${actionButtons(priority,index===0)}</div>
    </article>`).join('')}</div>
    <div class="callout" style="margin-top:14px" data-result-recommended-next>
      <strong>Recommended next step: ${esc(top.primary.id)} — ${esc(top.primary.title)}</strong>
      <div class="small muted" style="margin-top:5px">Start with the largest authorized pattern from this attempt, then return to the full item review below.</div>
    </div>
  </section>`;
}
