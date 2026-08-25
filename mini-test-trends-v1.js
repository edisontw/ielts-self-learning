import './mini-test-data-v3.js';
import { MINI_TESTS } from './mini-test-data-v1.js';

const CORE_KEY='ielts-self-learning-v1';
const ADAPTIVE_KEY='ielts-adaptive-v1';
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const esc=(v='')=>String(v).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
const testById=id=>MINI_TESTS.find(t=>t.id===id);
const formCount=skill=>MINI_TESTS.filter(t=>t.skill===skill).length;

function tagCountsForSubmission(result){
  const test=testById(result?.testId);
  if(!test)return {};
  const core=read(CORE_KEY);
  const counts={};
  for(const item of test.questions){
    const saved=core.lessonAnswers?.[item.id];
    if(saved?.selected===item.answer)continue;
    counts[item.errorTag]=(counts[item.errorTag]||0)+1;
  }
  return counts;
}

function annotateSubmission(result){
  if(!result?.id||!result?.testId)return null;
  const adaptive=read(ADAPTIVE_KEY);
  adaptive.miniTestHistory||=[];
  const row=adaptive.miniTestHistory.find(x=>x.id===result.id);
  if(!row)return null;
  const counts=tagCountsForSubmission(result);
  row.missedErrorTags=counts;
  row.missedTagTotal=Object.values(counts).reduce((a,b)=>a+b,0);
  row.patternAnnotatedAt=Date.now();
  write(ADAPTIVE_KEY,adaptive);
  window.dispatchEvent(new CustomEvent('ielts-mini-test-patterns-change',{detail:{result:row}}));
  return row;
}

function latestDistinctAttempts(adaptive,skill,limit=4){
  const rows=[...(adaptive.miniTestHistory||[])]
    .filter(x=>x.skill===skill&&x.missedErrorTags)
    .sort((a,b)=>(b.ts||0)-(a.ts||0));
  const seen=new Set();
  const out=[];
  for(const row of rows){
    if(seen.has(row.testId))continue;
    seen.add(row.testId);
    out.push(row);
    if(out.length>=limit)break;
  }
  return out;
}

function recurringPatterns(adaptive,skill){
  const rows=latestDistinctAttempts(adaptive,skill,Math.min(4,formCount(skill)));
  if(rows.length<2)return [];
  const patterns=new Map();
  for(const row of rows){
    for(const [tag,count] of Object.entries(row.missedErrorTags||{})){
      if(!count)continue;
      const current=patterns.get(tag)||{tag,count:0,tests:[],forms:0};
      current.count+=count;
      current.tests.push(row.testId);
      current.forms+=1;
      patterns.set(tag,current);
    }
  }
  return [...patterns.values()]
    .filter(x=>x.forms>=2)
    .sort((a,b)=>b.forms-a.forms||b.count-a.count||a.tag.localeCompare(b.tag));
}

function skillSummary(adaptive,skill){
  const rows=[...(adaptive.miniTestHistory||[])].filter(x=>x.skill===skill).sort((a,b)=>(b.ts||0)-(a.ts||0));
  const distinct=new Set(rows.map(x=>x.testId)).size;
  const latest=rows[0]||null;
  const recurring=recurringPatterns(adaptive,skill);
  return {attempts:rows.length,distinct,latest,recurring,available:formCount(skill)};
}

function renderSkill(adaptive,skill){
  const s=skillSummary(adaptive,skill);
  const label=skill==='reading'?'Reading':'Listening';
  const pattern=s.recurring.length
    ? `<div class="callout warning" style="margin-top:10px"><strong>Recurring / persistent patterns:</strong><br>${s.recurring.slice(0,3).map(x=>`${esc(x.tag)} <span class="small muted">(${x.forms}/${Math.min(4,s.distinct)} recent forms)</span>`).join('<br>')}<br><span class="small muted">A tag must appear in at least two different recent ${label} Mini Tests. Three or four forms provide stronger evidence than a single repeated pair.</span></div>`
    : `<p class="small muted" style="margin-top:10px">${s.distinct<2?'Complete two different Mini Tests to detect recurring error patterns.':`No error tag repeated across the ${Math.min(4,s.distinct)} most recent different Mini Tests.`}</p>`;
  return `<div class="card subtle"><div class="cluster" style="justify-content:space-between"><strong>${label}</strong><span class="chip">${s.distinct}/${s.available} test forms used</span></div><p class="muted" style="margin-top:8px">${s.attempts} attempt${s.attempts===1?'':'s'}${s.latest?` · latest ${s.latest.correct}/${s.latest.total}`:''}</p>${pattern}</div>`;
}

function injectTrends(){
  if(!location.hash.includes('/ielts')||document.querySelector('[data-mini-test-trends]'))return;
  const index=document.querySelector('[data-mini-test-index]');
  if(!index)return;
  const adaptive=read(ADAPTIVE_KEY);
  const section=document.createElement('section');
  section.className='card extension-card';
  section.dataset.miniTestTrends='true';
  section.style.marginTop='18px';
  section.innerHTML=`<div class="adaptive-top"><div><div class="eyebrow">Mini Test transfer evidence</div><h2>Look for patterns across different test forms.</h2></div><span class="chip primary">Diagnostic, not Band scoring</span></div><p class="muted">The site now compares missed error tags across up to the four most recent different Mini Tests for each skill. A pattern must recur on at least two forms; recurrence on three or four forms is stronger evidence of a persistent weakness.</p><div class="grid two" style="margin-top:14px">${renderSkill(adaptive,'reading')}${renderSkill(adaptive,'listening')}</div><div class="cluster" style="margin-top:14px"><button class="btn soft" data-nav="progress">Review / rebalance Study Plan</button><span class="small muted">Rebalancing remains an explicit learner action; a test result does not silently rewrite the calendar.</span></div>`;
  index.insertAdjacentElement('afterend',section);
}

function refresh(){
  document.querySelector('[data-mini-test-trends]')?.remove();
  injectTrends();
}

window.addEventListener('ielts-mini-test-submitted',e=>{annotateSubmission(e.detail);setTimeout(refresh,0)});
window.addEventListener('ielts-mini-test-patterns-change',()=>setTimeout(refresh,0));
window.addEventListener('hashchange',()=>setTimeout(injectTrends,0));
new MutationObserver(()=>injectTrends()).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(injectTrends,0);

export { tagCountsForSubmission, recurringPatterns, latestDistinctAttempts };
