import { registerRenderEnhancement, scheduleEnhancementPass } from './render-lifecycle-v15.js';

const CORE_KEY='ielts-self-learning-v1';
const ADAPTIVE_KEY='ielts-adaptive-v1';
const MOCK_KEY='ielts-mock-v1';
const WRITING_BASELINE_WORDS=150;
const SPEAKING_BASELINE_WORDS=60;

const read=(key,fallback={})=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return structuredClone(fallback);}};
const esc=(value='')=>String(value).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));

function latestByKey(rows,keyFn){
  const map=new Map();
  for(const row of rows||[]){
    const key=keyFn(row);
    if(!key)continue;
    const previous=map.get(key);
    if(!previous||Number(row.ts||0)>=Number(previous.ts||0))map.set(key,row);
  }
  return [...map.entries()].map(([key,row])=>({key,row}));
}

function timedEvidence(adaptive,mock,skill){
  const mini=latestByKey((adaptive.miniTestHistory||[]).filter(x=>x.skill===skill),x=>x.testId)
    .map(({key,row})=>({source:'Mini Test',form:key,ts:row.ts||0,correct:Number(row.correct||0),total:Number(row.total||0)}));
  const mockForms=latestByKey((mock.history||[]).filter(x=>x?.[skill]),x=>x.testId)
    .map(({key,row})=>({source:'Full Mock',form:key,ts:row.ts||0,correct:Number(row[skill]?.raw||0),total:40}));
  const forms=[...mini,...mockForms].sort((a,b)=>b.ts-a.ts);
  return {forms,count:forms.length,latest:forms[0]||null,status:forms.length>=2?'stronger':forms.length===1?'baseline':'missing'};
}

function substantialFirstAttempts(adaptive,skill,minWords){
  return (adaptive.productiveEvidence?.[skill]||[])
    .filter(x=>x.attemptKind==='first'&&Number(x.wordCount||0)>=minWords)
    .sort((a,b)=>Number(b.ts||0)-Number(a.ts||0));
}

function fullMockWritingEvidence(mock){
  return (mock.history||[]).filter(row=>{
    const counts=Object.values(row.writing?.wordCounts||{}).map(Number).sort((a,b)=>a-b);
    return counts.length>=2&&counts.at(-2)>=WRITING_BASELINE_WORDS&&counts.at(-1)>=250;
  }).sort((a,b)=>Number(b.ts||0)-Number(a.ts||0));
}

function productiveEvidence(adaptive,mock,skill){
  if(skill==='writing'){
    const first=substantialFirstAttempts(adaptive,'writing',WRITING_BASELINE_WORDS);
    const fullMock=fullMockWritingEvidence(mock);
    return {
      count:first.length+fullMock.length,
      firstCount:first.length,
      fullMockCount:fullMock.length,
      latest:first[0]||fullMock[0]||null,
      status:fullMock.length||first.length>=2?'stronger':first.length===1?'baseline':'missing'
    };
  }
  const first=substantialFirstAttempts(adaptive,'speaking',SPEAKING_BASELINE_WORDS);
  const blocks=new Set(first.map(x=>x.blockId||x.lessonId||x.id));
  return {count:first.length,firstCount:first.length,fullMockCount:0,latest:first[0]||null,status:blocks.size>=2?'stronger':first.length?'baseline':'missing'};
}

function nextMissing(snapshot){
  if(!snapshot.placement.ready)return {key:'placement',label:'Take Quick Placement',detail:'Establish the short starting profile first.',action:'placement'};
  if(snapshot.reading.status==='missing')return {key:'reading',label:'Run a timed Reading baseline',detail:'Start MR01 in Test Mode. One timed form is enough for the first evidence layer.',action:'mini',id:'MR01'};
  if(snapshot.listening.status==='missing')return {key:'listening',label:'Run a timed Listening baseline',detail:'Start ML01 in Test Mode. Production audio is already available for this form.',action:'mini',id:'ML01'};
  if(snapshot.writing.status==='missing')return {key:'writing',label:'Write one substantial first attempt',detail:`Use a full Task 1 workspace and save first-attempt evidence at ${WRITING_BASELINE_WORDS}+ words.`,action:'lesson',id:'WT1-05'};
  if(snapshot.speaking.status==='missing')return {key:'speaking',label:'Record one substantial Speaking baseline',detail:`Use the Speaking Practice Bank, create/edit a transcript, and save first-attempt evidence at ${SPEAKING_BASELINE_WORDS}+ words.`,action:'lesson',id:'SPB01'};
  return {key:'ready',label:'Return to Today',detail:'All four skills now have a baseline signal. Keep learning; stronger evidence can accumulate naturally from later Test Mode and retry work.',action:'nav',id:'today'};
}

export function buildDiagnosticSnapshot(core={},adaptive={},mock={}){
  const reading=timedEvidence(adaptive,mock,'reading');
  const listening=timedEvidence(adaptive,mock,'listening');
  const writing=productiveEvidence(adaptive,mock,'writing');
  const speaking=productiveEvidence(adaptive,mock,'speaking');
  const placement={ready:Boolean(core.placement),confidence:core.profile?.confidence||core.placement?.confidence||null,ts:core.placement?.ts||null};
  const skills={reading,listening,writing,speaking};
  const coverage=Object.values(skills).filter(x=>x.status!=='missing').length;
  const stronger=Object.values(skills).filter(x=>x.status==='stronger').length;
  const snapshot={placement,reading,listening,writing,speaking,coverage,stronger,baselineReady:Boolean(placement.ready&&coverage===4)};
  snapshot.next=nextMissing(snapshot);
  return snapshot;
}

function statusChip(status){
  if(status==='stronger')return '<span class="chip success">Broader evidence</span>';
  if(status==='baseline')return '<span class="chip primary">Baseline evidence</span>';
  return '<span class="chip warning">Missing</span>';
}

function timedCard(skill,label,evidence){
  const latest=evidence.latest;
  return `<article class="card subtle" data-diagnostic-skill="${skill}"><div class="cluster" style="justify-content:space-between"><strong>${label}</strong>${statusChip(evidence.status)}</div><p class="small muted" style="margin-top:8px">${evidence.count?`${evidence.count} distinct timed form${evidence.count===1?'':'s'} recorded.`:'No timed Test/Mock evidence yet.'}</p>${latest?`<p><strong>${esc(latest.form)}</strong> · ${latest.correct}/${latest.total}</p>`:''}<p class="small muted">${evidence.status==='stronger'?'Two or more independent timed forms reduce reliance on one result.':'A single timed form is a baseline signal, not a precise IELTS estimate.'}</p></article>`;
}

function writingCard(evidence){
  return `<article class="card subtle" data-diagnostic-skill="writing"><div class="cluster" style="justify-content:space-between"><strong>Writing</strong>${statusChip(evidence.status)}</div><p class="small muted" style="margin-top:8px">${evidence.firstCount} substantial first attempt${evidence.firstCount===1?'':'s'} (${WRITING_BASELINE_WORDS}+ words) · ${evidence.fullMockCount} complete Mock Writing baseline${evidence.fullMockCount===1?'':'s'}.</p><p class="small muted">A complete Mock Writing baseline requires both Task 1 (150+ words) and Task 2 (250+ words). This site still does not auto-score Writing as an official band.</p></article>`;
}

function speakingCard(evidence){
  return `<article class="card subtle" data-diagnostic-skill="speaking"><div class="cluster" style="justify-content:space-between"><strong>Speaking</strong>${statusChip(evidence.status)}</div><p class="small muted" style="margin-top:8px">${evidence.firstCount} substantial first attempt${evidence.firstCount===1?'':'s'} (${SPEAKING_BASELINE_WORDS}+ transcript words).</p><p class="small muted">Speaking Mock beta completion alone is not counted: without a saved transcript or quality evidence it cannot support a skill baseline.</p></article>`;
}

function actionButton(next){
  if(next.action==='placement')return '<button class="btn primary" data-nav="placement">Take Quick Placement</button>';
  if(next.action==='mini')return `<button class="btn primary" data-mini-action="start" data-test-id="${esc(next.id)}">${esc(next.label)}</button>`;
  if(next.action==='lesson')return `<button class="btn primary" data-lesson="${esc(next.id)}">${esc(next.label)}</button>`;
  return `<button class="btn primary" data-nav="${esc(next.id)}">${esc(next.label)}</button>`;
}

function renderCenter(snapshot){
  const placement=snapshot.placement.ready
    ? `<span class="chip success">Quick Placement · ${esc(snapshot.placement.confidence||'saved')}</span>`
    : '<span class="chip warning">Quick Placement missing</span>';
  return `<section class="card extension-card" data-diagnostic-center style="margin-top:18px"><div class="adaptive-top"><div><div class="eyebrow">V1.9 · Diagnostic Evidence Center</div><h2>Build a four-skill baseline without pretending one test is the whole profile.</h2></div><div class="score-badge">${snapshot.coverage}/4</div></div><div class="cluster" style="margin-top:10px">${placement}<span class="chip">${snapshot.stronger} skill${snapshot.stronger===1?'':'s'} with broader evidence</span></div><p class="muted" style="margin-top:12px">This is evidence coverage, not an IELTS band. Quick Placement starts the profile; timed Reading/Listening and substantial Writing/Speaking attempts make the profile more trustworthy over separate sessions.</p><div class="grid two" style="margin-top:14px">${timedCard('reading','Reading',snapshot.reading)}${timedCard('listening','Listening',snapshot.listening)}${writingCard(snapshot.writing)}${speakingCard(snapshot.speaking)}</div><div class="callout ${snapshot.baselineReady?'success':'warning'}" style="margin-top:14px" data-diagnostic-next><strong>${snapshot.baselineReady?'Four-skill baseline ready':'Next missing diagnostic action'}</strong><br>${esc(snapshot.next.detail)}<div class="cluster" style="margin-top:12px">${actionButton(snapshot.next)}</div></div><details style="margin-top:14px"><summary><strong>Why this is not yet a dedicated full diagnostic exam</strong></summary><p class="small muted">The original V1.1 plan allowed longer skill-specific diagnostic sessions. V1.9 first reuses real evidence already generated by Quick Placement, Mini Tests, Full Mocks and productive attempts. It does not relabel a 9–12 minute Mini Test or one Writing/Speaking sample as a complete exam-equivalent diagnosis. Dedicated diagnostic assets should be added only if this evidence layer proves insufficient.</p></details></section>`;
}

function inject(){
  if(!location.hash.includes('/progress')||document.querySelector('[data-diagnostic-center]'))return;
  const anchor=document.querySelector('[data-productive-progress]')||document.querySelector('[data-runtime-root="performance"]')||[...document.querySelectorAll('#main .card')].find(x=>x.textContent.includes('Section profile'));
  if(!anchor)return;
  const snapshot=buildDiagnosticSnapshot(read(CORE_KEY),read(ADAPTIVE_KEY),read(MOCK_KEY));
  const t=document.createElement('template');
  t.innerHTML=renderCenter(snapshot).trim();
  anchor.insertAdjacentElement('afterend',t.content.firstElementChild);
}

function refresh(){
  document.querySelector('[data-diagnostic-center]')?.remove();
  inject();
}

if(typeof window!=='undefined'&&typeof document!=='undefined'){
  registerRenderEnhancement(inject);
  window.addEventListener('ielts-mini-test-submitted',()=>{refresh();scheduleEnhancementPass();});
  window.addEventListener('ielts-productive-evidence-change',()=>{refresh();scheduleEnhancementPass();});
  window.addEventListener('ielts-ai-feedback-return-change',scheduleEnhancementPass);
}
