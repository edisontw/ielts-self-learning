import { registerRenderEnhancement, scheduleEnhancementPass } from './render-lifecycle-v15.js';

const CORE_KEY='ielts-self-learning-v1';
const esc=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

function read(key){
  try{return JSON.parse(localStorage.getItem(key)||'{}');}
  catch{return {};}
}

function restoreCandidates(main){
  main.querySelector('[data-today-secondary-v18]')?.remove();
  main.querySelectorAll('[data-today-candidate-v18]').forEach(card=>{
    card.hidden=card.dataset.todayWasHiddenV18==='1';
    delete card.dataset.todayWasHiddenV18;
    delete card.dataset.todayCandidateV18;
    delete card.dataset.todayPrimaryAction;
    card.classList.remove('elevated');
    card.querySelector('[data-today-primary-label-v18]')?.remove();
    const promoted=card.querySelector('[data-today-promoted-button-v18]');
    if(promoted){
      promoted.className=promoted.dataset.todayOriginalClassV18||promoted.className;
      delete promoted.dataset.todayOriginalClassV18;
      delete promoted.dataset.todayPromotedButtonV18;
    }
  });
}

function actionableButton(card){
  const buttons=[...card.querySelectorAll('button')].filter(button=>!button.disabled);
  return buttons.find(button=>button.dataset.lesson)
    || buttons.find(button=>button.dataset.miniAction==='start')
    || buttons.find(button=>button.dataset.nav&&button.dataset.nav!=='progress')
    || null;
}

function actionKey(button){
  if(!button)return '';
  if(button.dataset.lesson)return `lesson:${button.dataset.lesson}`;
  if(button.dataset.miniAction==='start')return `mini:${button.dataset.testId||''}`;
  if(button.dataset.nav)return `nav:${button.dataset.nav}`;
  return '';
}

function candidate(card,type,rank,source){
  if(!card)return null;
  const action=actionableButton(card);
  if(!action)return null;
  return {card,type,rank,source,action,key:actionKey(action),title:card.querySelector('h2')?.textContent?.trim()||action.textContent?.trim()||source};
}

function candidates(main){
  const adaptive=main.querySelector('[data-adaptive-root="today"]');
  const adaptiveText=adaptive?.textContent||'';
  const due=Boolean(adaptive&&(/review item/i.test(adaptiveText)||(/Spaced review/i.test(adaptiveText)&&adaptive.querySelector('[data-nav="improve"]'))));
  return [
    candidate(adaptive,due?'due-review':'adaptive',due?400:100,due?'Due review':'Adaptive next step'),
    candidate(main.querySelector('[data-study-plan-today]'),'study-plan',300,'Study plan'),
    candidate(main.querySelector('[data-ai-feedback-today]'),'ai-feedback',200,'Feedback retry'),
    candidate(main.querySelector('[data-productive-today]'),'productive',150,'Productive retry')
  ].filter(Boolean).sort((a,b)=>b.rank-a.rank);
}

function promote(primary){
  primary.card.dataset.todayPrimaryAction='true';
  primary.card.classList.add('elevated');
  const label=document.createElement('div');
  label.className='eyebrow';
  label.dataset.todayPrimaryLabelV18='true';
  label.textContent='Do this now';
  primary.card.insertAdjacentElement('afterbegin',label);
  primary.action.dataset.todayOriginalClassV18=primary.action.className;
  primary.action.dataset.todayPromotedButtonV18='true';
  primary.action.classList.remove('soft','ghost','small-btn');
  primary.action.classList.add('primary');
}

function secondaryButton(row){
  const button=row.action.cloneNode(true);
  button.className='btn soft small-btn';
  delete button.dataset.todayPromotedButtonV18;
  delete button.dataset.todayOriginalClassV18;
  button.textContent=`${row.source}: ${row.title}`;
  return button;
}

function addSecondaries(primary,rows){
  const seen=new Set([primary.key]);
  const unique=[];
  for(const row of rows){
    if(!row.key||seen.has(row.key))continue;
    seen.add(row.key);
    unique.push(row);
    if(unique.length===2)break;
  }
  if(!unique.length)return;
  const section=document.createElement('section');
  section.className='today-shortcuts';
  section.dataset.todaySecondaryV18='true';
  section.innerHTML=`<span class="small muted">Other useful options</span><div class="cluster" data-today-secondary-actions-v18></div>`;
  const actions=section.querySelector('[data-today-secondary-actions-v18]');
  unique.forEach(row=>actions.appendChild(secondaryButton(row)));
  primary.card.insertAdjacentElement('afterend',section);
}

export function orchestrateToday(){
  if(typeof document==='undefined'||!location.hash.includes('/today'))return;
  const main=document.querySelector('#main');
  if(!main)return;
  restoreCandidates(main);
  const core=read(CORE_KEY);
  if(!core.placement)return;
  const rows=candidates(main);
  if(!rows.length)return;
  rows.forEach(row=>{
    row.card.dataset.todayCandidateV18=row.type;
    row.card.dataset.todayWasHiddenV18=row.card.hidden?'1':'0';
  });
  const primary=rows[0];
  rows.slice(1).forEach(row=>{row.card.hidden=true;});
  promote(primary);
  addSecondaries(primary,rows.slice(1));
  main.dataset.todayPrimaryKind=primary.type;
}

function requestOrchestration(){
  scheduleEnhancementPass();
  for(const delay of [0,60,180,500])setTimeout(orchestrateToday,delay);
}

if(typeof document!=='undefined'){
  registerRenderEnhancement(orchestrateToday);
  window.addEventListener('hashchange',requestOrchestration);
  window.addEventListener('ielts-study-plan-change',requestOrchestration);
  window.addEventListener('ielts-mini-test-submitted',requestOrchestration);
  window.addEventListener('ielts-productive-evidence-change',requestOrchestration);
  window.addEventListener('ielts-ai-feedback-return-change',requestOrchestration);
  window.addEventListener('pageshow',requestOrchestration);
  requestOrchestration();
}
