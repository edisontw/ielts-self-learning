import { WRITING_TASK1_PROMPTS } from './writing-task1-v1.js';

const STORAGE_KEY='ielts-writing-task1-v1';
const CORE_KEY='ielts-self-learning-v1';
const esc=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const read=(key,fallback={})=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return structuredClone(fallback);}};
const save=state=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
const defaults={activeId:'WT1-LINE-01',mode:'practice',drafts:{},plans:{},attempts:[]};
let timerSeconds=1200;
let timerHandle=null;

function state(){return Object.assign(structuredClone(defaults),read(STORAGE_KEY,{}));}
function patch(fn){const s=state();fn(s);save(s);return s;}
function promptById(id){return WRITING_TASK1_PROMPTS.find(p=>p.id===id)||WRITING_TASK1_PROMPTS[0];}
function words(text=''){return (String(text).trim().match(/\S+/g)||[]).length;}
function maxValue(series=[]){return Math.max(1,...series.flatMap(s=>s.values||[]).map(Number));}
function niceMax(value){const step=value<=20?5:value<=60?10:value<=120?20:50;return Math.ceil(value/step)*step;}

function renderLegend(series){return `<div class="wt1-legend">${series.map((s,i)=>`<span><i class="wt1-swatch swatch-${i%6}"></i>${esc(s.name)}</span>`).join('')}</div>`;}

function renderLine(v){
  const width=680,height=310,pad={l:52,r:24,t:24,b:46};
  const innerW=width-pad.l-pad.r,innerH=height-pad.t-pad.b;
  const top=niceMax(maxValue(v.series));
  const x=i=>pad.l+(v.years.length===1?0:(i/(v.years.length-1))*innerW);
  const y=n=>pad.t+innerH-(Number(n)/top)*innerH;
  const ticks=[0,.25,.5,.75,1].map(f=>Math.round(top*f));
  const grid=ticks.map(t=>`<g><line x1="${pad.l}" y1="${y(t)}" x2="${width-pad.r}" y2="${y(t)}" class="wt1-grid"/><text x="${pad.l-8}" y="${y(t)+4}" text-anchor="end">${t}</text></g>`).join('');
  const lines=v.series.map((s,si)=>{const pts=s.values.map((n,i)=>`${x(i)},${y(n)}`).join(' ');const dots=s.values.map((n,i)=>`<circle cx="${x(i)}" cy="${y(n)}" r="4" class="series-${si%6}"/>`).join('');return `<polyline points="${pts}" class="wt1-line series-${si%6}"/>${dots}`;}).join('');
  const labels=v.years.map((year,i)=>`<text x="${x(i)}" y="${height-18}" text-anchor="middle">${year}</text>`).join('');
  return `<div class="wt1-chart">${renderLegend(v.series)}<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(v.yLabel)} line graph">${grid}${lines}${labels}<text class="wt1-axis-label" x="${width/2}" y="${height-2}" text-anchor="middle">${esc(v.xLabel)}</text><text class="wt1-axis-label" transform="translate(14 ${height/2}) rotate(-90)" text-anchor="middle">${esc(v.yLabel)}</text></svg></div>`;
}

function renderBar(v){
  const width=680,height=320,pad={l:52,r:20,t:28,b:60};
  const innerW=width-pad.l-pad.r,innerH=height-pad.t-pad.b,top=niceMax(maxValue(v.series));
  const groups=v.categories.length,seriesN=v.series.length,groupW=innerW/groups,barW=Math.min(34,(groupW-18)/seriesN);
  const y=n=>pad.t+innerH-(Number(n)/top)*innerH;
  const ticks=[0,.25,.5,.75,1].map(f=>Math.round(top*f));
  const grid=ticks.map(t=>`<g><line x1="${pad.l}" y1="${y(t)}" x2="${width-pad.r}" y2="${y(t)}" class="wt1-grid"/><text x="${pad.l-8}" y="${y(t)+4}" text-anchor="end">${t}</text></g>`).join('');
  let bars='';
  v.categories.forEach((cat,ci)=>{const centre=pad.l+ci*groupW+groupW/2;v.series.forEach((s,si)=>{const value=Number(s.values[ci]);const x=centre-(seriesN*barW)/2+si*barW;bars+=`<rect x="${x}" y="${y(value)}" width="${barW-3}" height="${pad.t+innerH-y(value)}" class="series-${si%6}"/><title>${esc(s.name)}: ${value}</title>`;});bars+=`<text x="${centre}" y="${height-29}" text-anchor="middle">${esc(cat)}</text>`;});
  return `<div class="wt1-chart">${renderLegend(v.series)}<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(v.yLabel||'Bar chart')}">${grid}${bars}<text class="wt1-axis-label" x="${width/2}" y="${height-4}" text-anchor="middle">${esc(v.xLabel||'')}</text><text class="wt1-axis-label" transform="translate(14 ${height/2}) rotate(-90)" text-anchor="middle">${esc(v.yLabel||'')}</text></svg></div>`;
}

function renderTable(v){return `<div class="wt1-table-wrap"><table class="wt1-data-table"><thead><tr>${v.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${v.rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th>${esc(cell)}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}

function renderPie(v){
  return `<div class="wt1-pies">${v.panels.map((panel,pi)=>{let cursor=0;const stops=panel.values.map(([label,value],i)=>{const start=cursor;cursor+=Number(value);return `var(--wt1-pie-${i%6}) ${start}% ${cursor}%`;}).join(',');return `<div class="wt1-pie-card"><div class="wt1-pie" style="background:conic-gradient(${stops})" role="img" aria-label="${esc(panel.name)} pie chart"></div><strong>${esc(panel.name)}</strong><div class="wt1-pie-legend">${panel.values.map(([label,value],i)=>`<span><i class="wt1-swatch swatch-${i%6}"></i>${esc(label)} ${value}%</span>`).join('')}</div></div>`;}).join('')}</div>`;
}

function renderProcess(v){return `<div class="wt1-process" role="img" aria-label="${v.cyclic?'Cyclical':'Linear'} process with ${v.stages.length} stages">${v.stages.map(([n,label],i)=>`<div class="wt1-process-step"><span class="wt1-step-no">${esc(n)}</span><strong>${esc(label)}</strong></div>${i<v.stages.length-1?'<div class="wt1-arrow" aria-hidden="true">→</div>':''}`).join('')}${v.cyclic?'<div class="wt1-cycle-note">↺ The finished product can re-enter the collection stage.</div>':''}</div>`;}

function mapSvg(label,items){const W=600,H=330,sx=48,sy=34;return `<div class="wt1-map-card"><strong>${esc(label)}</strong><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)} map">${items.map((item,i)=>{const x=item.x*sx,y=item.y*sy,w=item.w*sx,h=item.h*sy;return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="map-${i%6}"/><text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle">${esc(item.label)}</text>`;}).join('')}</svg></div>`;}
function renderMap(v){return `<div class="wt1-maps">${mapSvg(v.beforeLabel,v.before)}${mapSvg(v.afterLabel,v.after)}</div>`;}

function renderAccessible(prompt){const v=prompt.visual;if(v.kind==='line'||v.kind==='bar'){const headers=[v.kind==='line'?v.xLabel:'Category',...v.series.map(s=>s.name)];const cats=v.kind==='line'?v.years:v.categories;const rows=cats.map((cat,i)=>[cat,...v.series.map(s=>s.values[i])]);return renderTable({headers,rows});}if(v.kind==='table')return renderTable(v);if(v.kind==='pie')return `<ul>${v.panels.flatMap(p=>p.values.map(([k,n])=>`<li>${esc(p.name)} — ${esc(k)}: ${n}%</li>`)).join('')}</ul>`;if(v.kind==='mixed')return `${renderTable({headers:['Facility',...v.bar.series.map(s=>s.name)],rows:v.bar.categories.map((c,i)=>[c,...v.bar.series.map(s=>s.values[i])])})}<ul>${v.pie.values.map(([k,n])=>`<li>${esc(v.pie.name)} — ${esc(k)}: ${n}%</li>`).join('')}</ul>`;if(v.kind==='process')return `<ol>${v.stages.map(([,label])=>`<li>${esc(label)}</li>`).join('')}</ol>`;if(v.kind==='map')return `<div class="grid two"><div><strong>${esc(v.beforeLabel)}</strong><ul>${v.before.map(x=>`<li>${esc(x.label)}</li>`).join('')}</ul></div><div><strong>${esc(v.afterLabel)}</strong><ul>${v.after.map(x=>`<li>${esc(x.label)}</li>`).join('')}</ul></div></div>`;return '';
}

function renderVisual(prompt){const v=prompt.visual;let html='';if(v.kind==='line')html=renderLine(v);else if(v.kind==='bar')html=renderBar(v);else if(v.kind==='table')html=renderTable(v);else if(v.kind==='pie')html=renderPie(v);else if(v.kind==='mixed')html=`<div class="wt1-mixed">${renderBar({...v.bar,xLabel:'Facility',yLabel:'GWh'})}${renderPie({panels:[v.pie]})}</div>`;else if(v.kind==='process')html=renderProcess(v);else if(v.kind==='map')html=renderMap(v);return `${html}<details class="wt1-accessible"><summary>Accessible data / diagram description</summary>${renderAccessible(prompt)}</details>`;}

function formatTimer(){const m=Math.floor(timerSeconds/60),s=timerSeconds%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function updateTimerDisplay(){document.querySelector('[data-wt1-timer]')?.replaceChildren(document.createTextNode(formatTimer()));if(timerSeconds===0){clearInterval(timerHandle);timerHandle=null;document.querySelector('[data-wt1-timer-card]')?.classList.add('finished');}}
function startTimer(){if(timerHandle||timerSeconds<=0)return;timerHandle=setInterval(()=>{timerSeconds=Math.max(0,timerSeconds-1);updateTimerDisplay();},1000);}
function pauseTimer(){clearInterval(timerHandle);timerHandle=null;}
function resetTimer(){pauseTimer();timerSeconds=1200;document.querySelector('[data-wt1-timer-card]')?.classList.remove('finished');updateTimerDisplay();}

function coachingPrompt(prompt,draft){
  const core=read(CORE_KEY,{});const target=core.profile?.targetBand||7;
  return `You are acting as an IELTS Academic Writing learning coach.\n\nTARGET:\nBand ${target} (learning target only; do not claim an official score)\n\nTASK:\n${prompt.prompt}\n\nVISUAL TYPE:\n${prompt.type}\n\nMY DRAFT:\n${draft}\n\nPlease coach this draft using the public IELTS Academic Writing criteria: Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.\n\nDo not give a fake precise band score. Instead:\n1. Identify the three highest-priority problems.\n2. Quote only short phrases from my draft when needed.\n3. Check whether I selected the main features and included a useful overview.\n4. Check whether comparisons/grouping are accurate and efficient.\n5. Separate factual/data-reporting errors from optional style improvements.\n6. Give one short repair exercise for each priority.\n7. Ask me to revise before showing a complete model answer.`;
}

async function copyText(text,button){try{await navigator.clipboard.writeText(text);const old=button.textContent;button.textContent='Copied';setTimeout(()=>button.textContent=old,1400);}catch{const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();}}

function promptTypeLabel(type){return ({line:'Line graph',bar:'Bar chart',table:'Table',pie:'Pie charts',mixed:'Mixed charts',process:'Process',map:'Map / plan'})[type]||type;}

function workspaceHtml(s){
  const prompt=promptById(s.activeId);const draft=s.drafts[prompt.id]||'';const plan=s.plans[prompt.id]||'';
  return `<div class="wt1-workspace" data-wt1-workspace>
    <div class="wt1-toolbar">
      <label class="stack wt1-select"><strong>Practice prompt</strong><select class="text-input" data-wt1-select>${WRITING_TASK1_PROMPTS.map(p=>`<option value="${p.id}" ${p.id===prompt.id?'selected':''}>${p.id.replace('WT1-','')} · ${esc(p.title)}</option>`).join('')}</select></label>
      <div class="wt1-mode"><strong>Mode</strong><div class="cluster"><button class="btn ${s.mode==='practice'?'primary':'soft'}" data-wt1-mode="practice">Practice</button><button class="btn ${s.mode==='test'?'primary':'soft'}" data-wt1-mode="test">20-min Test</button></div></div>
      <div class="wt1-timer-card ${s.mode==='test'?'':'muted-mode'}" data-wt1-timer-card><span class="small muted">Timer</span><strong data-wt1-timer>${formatTimer()}</strong><div class="cluster"><button class="btn ghost small-btn" data-wt1-timer-action="start">Start</button><button class="btn ghost small-btn" data-wt1-timer-action="pause">Pause</button><button class="btn ghost small-btn" data-wt1-timer-action="reset">Reset</button></div></div>
    </div>
    <div class="wt1-task-head"><div><div class="eyebrow">${promptTypeLabel(prompt.type)} · ${prompt.id}</div><h3>${esc(prompt.title)}</h3></div><span class="chip primary">Original practice</span></div>
    <div class="wt1-task-prompt">${esc(prompt.prompt)}</div>
    <div class="wt1-visual-shell">${renderVisual(prompt)}</div>
    <div class="grid two wt1-plan-grid">
      <label class="stack"><strong>My plan</strong><textarea class="text-area wt1-plan" data-wt1-plan placeholder="Overview features…\nDetail group 1…\nDetail group 2…">${esc(plan)}</textarea></label>
      <div class="card subtle"><strong>Planning support</strong><p class="small muted">In Practice Mode, make your own selection first. Then reveal the suggested feature hierarchy to compare decisions.</p><button class="btn soft" data-wt1-reveal ${s.mode==='test'?'disabled':''}>${s.mode==='test'?'Hidden in Test Mode':'Reveal planning notes'}</button><div data-wt1-notes hidden><p><strong>High-value features</strong></p><ul>${prompt.keyFeatures.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><strong>Possible grouping:</strong> ${esc(prompt.groupingHint)}</p></div></div>
    </div>
    <div class="wt1-editor-wrap"><div class="cluster wt1-editor-head"><div><strong>Task 1 response</strong><div class="small muted">Aim for at least 150 words. Drafts are saved locally.</div></div><span class="chip ${words(draft)>=150?'success':'warning'}" data-wt1-count>${words(draft)} words</span></div><textarea class="text-area workspace-editor writing-input wt1-editor" data-writing-id="${prompt.id}" data-wt1-draft placeholder="Write your Task 1 response here…">${esc(draft)}</textarea><div class="cluster"><button class="btn primary" data-wt1-copy>Copy AI coaching prompt</button><button class="btn soft" data-wt1-save-attempt>Save attempt</button><span class="small muted" data-wt1-status></span></div></div>
    <div class="small muted wt1-source">Source: ${esc(prompt.source.label)}. This is original IELTS-style practice, not an official IELTS question.</div>
  </div>`;
}

function mountWorkspace(){
  if(!location.hash.includes('/lesson/WT1-05'))return;
  const mount=document.querySelector('[data-wt1-bank-mount]');if(!mount||mount.querySelector('[data-wt1-workspace]'))return;
  mount.innerHTML=workspaceHtml(state());
}

function remount(){const mount=document.querySelector('[data-wt1-bank-mount]');if(mount)mount.innerHTML=workspaceHtml(state());updateTimerDisplay();}

function injectIeltsCard(){
  if(!location.hash.includes('/ielts')||document.querySelector('[data-wt1-ielts-card]'))return;
  const head=document.querySelector('#main .page-head');if(!head)return;
  head.insertAdjacentHTML('afterend',`<section class="focus-card" data-wt1-ielts-card style="margin-bottom:18px"><div class="eyebrow">Academic Writing · Task 1</div><h2>5 lessons + 12 full practice prompts</h2><p class="lede">Learn feature selection, overview writing, comparison and grouping, then practise line graphs, bar charts, tables, pie/mixed charts, processes and maps.</p><div class="cluster"><button class="btn primary" data-lesson="WT1-01">Start Task 1 course</button><button class="btn soft" data-lesson="WT1-05">Open 12-prompt workspace</button></div></section>`);
}

function apply(){mountWorkspace();injectIeltsCard();}

document.addEventListener('input',e=>{
  const draft=e.target.closest('[data-wt1-draft]');if(draft){const id=draft.dataset.writingId;patch(s=>s.drafts[id]=draft.value);const count=document.querySelector('[data-wt1-count]');if(count){const n=words(draft.value);count.textContent=`${n} words`;count.className=`chip ${n>=150?'success':'warning'}`;}return;}
  const plan=e.target.closest('[data-wt1-plan]');if(plan){const id=state().activeId;patch(s=>s.plans[id]=plan.value);}
});

document.addEventListener('change',e=>{
  const select=e.target.closest('[data-wt1-select]');if(select){pauseTimer();timerSeconds=1200;patch(s=>s.activeId=select.value);remount();}
});

document.addEventListener('click',e=>{
  const mode=e.target.closest('[data-wt1-mode]');if(mode){patch(s=>s.mode=mode.dataset.wt1Mode);if(mode.dataset.wt1Mode==='practice')pauseTimer();else resetTimer();remount();return;}
  const action=e.target.closest('[data-wt1-timer-action]');if(action){if(action.dataset.wt1TimerAction==='start')startTimer();if(action.dataset.wt1TimerAction==='pause')pauseTimer();if(action.dataset.wt1TimerAction==='reset')resetTimer();return;}
  const reveal=e.target.closest('[data-wt1-reveal]');if(reveal&&!reveal.disabled){const notes=document.querySelector('[data-wt1-notes]');if(notes){notes.hidden=!notes.hidden;reveal.textContent=notes.hidden?'Reveal planning notes':'Hide planning notes';}return;}
  const copy=e.target.closest('[data-wt1-copy]');if(copy){const s=state(),p=promptById(s.activeId),draft=s.drafts[p.id]||'';copyText(coachingPrompt(p,draft),copy);return;}
  const saveAttempt=e.target.closest('[data-wt1-save-attempt]');if(saveAttempt){const s=state(),p=promptById(s.activeId),draft=s.drafts[p.id]||'',n=words(draft);patch(x=>x.attempts.push({id:`wt1-${Date.now()}`,promptId:p.id,ts:Date.now(),mode:x.mode,wordCount:n}));const status=document.querySelector('[data-wt1-status]');if(status)status.textContent=`Attempt saved · ${n} words`;}
});

window.addEventListener('hashchange',()=>setTimeout(apply,0));
new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(apply,0);
