import './mini-test-data-v2.js';
import { MINI_TESTS } from './mini-test-data-v1.js';

const CORE_KEY='ielts-self-learning-v1';
const ADAPTIVE_KEY='ielts-adaptive-v1';
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const esc=(v='')=>String(v).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
const testById=id=>MINI_TESTS.find(t=>t.id===id);

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

function latestDistinctAttempts(adaptive,skill,limit=2){
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
  const rows=latestDistinctAttempts(adaptive,skill,2);
  if(rows.length<2)return [];
  const [a,b]=rows;
  const shared=Object.keys(a.missedErrorTags||{}).filter(tag=>(b.missedErrorTags||{})[tag]);
  return shared
    .map(tag=>({tag,count:(a.missedErrorTags[tag]||0)+(b.missedErrorTags[tag]||0),tests:[a.testId,b.testId]}))
    .sort((x,y)=>y.count-x.count||x.tag.localeCompare(y.tag));
}

function skillSummary(adaptive,skill){
  const rows=[...(adaptive.miniTestHistory||[])].filter(x=>x.skill===skill).sort((a,b)=>(b.ts||0)-(a.ts||0));
  const distinct=new Set(rows.map(x=>x.testId)).size;
  const latest=rows[0]||null;
  const recurring=recurringPatterns(adaptive,skill);
  return {attempts:rows.length,distinct,latest,recurring};
}

function renderSkill(adaptive,skill){
  const s=skillSummary(adaptive,skill);
  const label=skill==='reading'?'Reading':'Listening';
  const pattern=s.recurring.length
    ? `<div class="callout warning" style="margin-top:10px"><strong>Recurring pattern${s.recurring.length===1?'':'s'}:</strong> ${s.recurring.slice(0,3).map(x=>esc(x.tag)).join(' · ')}<br><span class="small muted">Repeated across the two most recent different ${label} Mini Tests. Review the related skill before the next timed check.</span></div>`
    : `<p class="small muted" style="margin-top:10px">${s.distinct<2?'Complete two different Mini Tests to detect recurring error patterns.':'No error tag repeated across the two most recent different Mini Tests.'}</p>`;
  return `<div class="card subtle"><div class="cluster" style="justify-content:space-between"><strong>${label}</strong><span class="chip">${s.distinct}/2 test forms used</span></div><p class="muted" style="margin-top:8px">${s.attempts} attempt${s.attempts===1?'':'s'}${s.latest?` · latest ${s.latest.correct}/${s.latest.total}`:''}</p>${pattern}</div>`;
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
  section.innerHTML=`<div class="adaptive-top"><div><div class="eyebrow">Mini Test transfer evidence</div><h2>Look for patterns across different test forms.</h2></div><span class="chip primary">Diagnostic, not Band scoring</span></div><p class="muted">The site compares missed error tags across the two most recent different Mini Tests for each skill. A repeated tag is stronger evidence than one isolated miss.</p><div class="grid two" style="margin-top:14px">${renderSkill(adaptive,'reading')}${renderSkill(adaptive,'listening')}</div><div class="cluster" style="margin-top:14px"><button class="btn soft" data-nav="progress">Review / rebalance Study Plan</button><span class="small muted">Rebalancing remains an explicit learner action; a test result does not silently rewrite the calendar.</span></div>`;
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
