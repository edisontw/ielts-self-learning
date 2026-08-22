import { MINI_TESTS } from './mini-test-data-v1.js';

const CORE_KEY='ielts-self-learning-v1';
const ADAPTIVE_KEY='ielts-adaptive-v1';
let session=null;
let timerId=null;
const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const testById=id=>MINI_TESTS.find(t=>t.id===id);

function removeMiniTestsFromLearn(){
  if(!location.hash.includes('/learn')) return;
  const titles=new Set(MINI_TESTS.map(t=>`Mini Test: ${t.title}`));
  document.querySelectorAll('#main .lesson-card').forEach(card=>{
    if(titles.has(card.querySelector('h3')?.textContent?.trim())) card.remove();
  });
}

function testHistory(){
  return read(ADAPTIVE_KEY).miniTestHistory||[];
}

function injectIndex(){
  if(!location.hash.includes('/ielts')||document.querySelector('[data-mini-test-index]')||session) return;
  const main=document.querySelector('#main');
  if(!main) return;
  const history=testHistory();
  const cards=MINI_TESTS.map(test=>{
    const attempts=history.filter(x=>x.testId===test.id).sort((a,b)=>b.ts-a.ts);
    const latest=attempts[0];
    return `<article class="card lesson-card"><div class="cluster"><div class="lesson-icon">${test.skill==='reading'?'R':'L'}</div><span class="chip warning">Test Mode</span></div><div><h3>${esc(test.title)}</h3><p class="muted" style="margin-top:8px">${esc(test.description)}</p></div><div class="meta"><span>${test.questions.length} questions</span><span>${Math.round(test.timeLimitSeconds/60)} min</span><span>${test.skill==='listening'?'one prototype playback':'one submission'}</span></div>${latest?`<div class="callout" style="margin-top:12px"><strong>Latest: ${latest.correct}/${latest.total}</strong><br><span class="small muted">${new Date(latest.ts).toLocaleDateString()} · diagnostic score only, not an IELTS band</span></div>`:''}<footer><div class="small muted">No hints or answer feedback before submission.</div><button class="btn primary" data-mini-action="start" data-test-id="${test.id}">${attempts.length?'Retake after review':'Start test'}</button></footer></article>`;
  }).join('');
  const section=document.createElement('section');
  section.dataset.miniTestIndex='true';
  section.style.marginTop='26px';
  section.innerHTML=`<div class="page-head" style="margin-bottom:14px"><div><div class="eyebrow">Mini Tests · Test Mode V1</div><h2>Test transfer after skill practice.</h2><p class="muted">Mini Tests are separate from the 30-unit curriculum and Question Type Lab. They are timed, reveal no answers during the attempt, and feed submitted item results back into observed Reading/Listening performance.</p></div></div><div class="grid two">${cards}</div>`;
  const lab=document.querySelector('[data-question-type-lab-index]');
  if(lab) lab.insertAdjacentElement('afterend',section); else main.appendChild(section);
}

function setMainHidden(hidden){
  const main=document.querySelector('#main');
  if(!main)return;
  [...main.children].forEach(child=>{
    if(child.dataset.miniTestPlayer==='true') return;
    if(hidden){ child.dataset.miniWasHidden=child.hidden?'1':'0'; child.hidden=true; }
    else if(child.dataset.miniWasHidden!=null){ child.hidden=child.dataset.miniWasHidden==='1'; delete child.dataset.miniWasHidden; }
  });
}

function formatTime(sec){
  const m=Math.max(0,Math.floor(sec/60)); const s=Math.max(0,sec%60);
  return `${m}:${String(s).padStart(2,'0')}`;
}

function remaining(){
  if(!session)return 0;
  return Math.max(0,session.test.timeLimitSeconds-Math.floor((Date.now()-session.startedAt)/1000));
}

function startTimer(){
  clearInterval(timerId);
  timerId=setInterval(()=>{
    if(!session||session.submitted){clearInterval(timerId);return;}
    const left=remaining();
    const el=document.querySelector('[data-mini-timer]');
    if(el)el.textContent=formatTime(left);
    if(left<=0)submitTest(true);
  },250);
}

function questionHTML(item,index){
  const selected=session?.answers[item.id]||'';
  return `<div class="quiz-card" data-mini-question="${item.id}"><div class="cluster"><span class="chip">${index+1}</span><span class="small muted">${esc(item.errorTag)}</span></div><div class="q-title" style="margin-top:10px">${esc(item.prompt)}</div><div class="options">${item.options.map((o,i)=>`<button class="option ${selected===o?'selected':''}" data-mini-option data-qid="${item.id}" data-value="${esc(o)}"><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div></div>`;
}

function playerHTML(){
  const t=session.test;
  const answered=Object.keys(session.answers).length;
  const content=t.skill==='reading'?`<section class="card"><div class="eyebrow">Reading passage</div><h2 style="margin:7px 0 14px">${esc(t.passageTitle)}</h2><div class="reading-passage">${t.passage.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}</div></section>`:`<section class="card"><div class="eyebrow">Listening recording</div><h2 style="margin:7px 0">One prototype playback</h2><p class="muted">The transcript stays hidden until submission. Browser speech synthesis is prototype audio, not production IELTS audio.</p><button class="btn ${session.played?'soft':'primary'}" data-mini-action="play-audio" ${session.played?'disabled':''}>${session.played?'Recording played':'Play recording once'}</button></section>`;
  return `<section data-mini-test-player="true"><div class="page-head"><div><button class="btn ghost small-btn" data-mini-action="exit">← Exit test</button><div class="eyebrow" style="margin-top:18px">Test Mode · ${esc(t.skill)}</div><h1>${esc(t.title)}</h1><p class="lede">No hints, transcript, answer checking, or rationale until you submit.</p></div><div class="card" style="min-width:180px"><div class="small muted">Time remaining</div><div style="font-size:30px;font-weight:800" data-mini-timer>${formatTime(remaining())}</div><div class="small muted" data-mini-answered>${answered}/${t.questions.length} answered</div></div></div>${content}<section style="margin-top:18px"><div class="stack">${t.questions.map(questionHTML).join('')}</div></section><div class="card" style="margin-top:18px"><div class="cluster" style="justify-content:space-between"><div><strong>Submit once</strong><div class="small muted">Unanswered items count as incorrect. Feedback appears only after submission.</div></div><button class="btn primary" data-mini-action="submit">Submit Mini Test</button></div></div></section>`;
}

function startTest(id){
  const test=testById(id); if(!test)return;
  session={test,answers:{},startedAt:Date.now(),submitted:false,played:false};
  const main=document.querySelector('#main'); if(!main)return;
  setMainHidden(true);
  const player=document.createElement('section'); player.dataset.miniTestPlayer='true';
  main.appendChild(player);
  player.outerHTML=playerHTML();
  startTimer();
  window.scrollTo({top:0,behavior:'smooth'});
}

function selectOption(button){
  if(!session||session.submitted)return;
  session.answers[button.dataset.qid]=button.dataset.value;
  const card=button.closest('[data-mini-question]');
  card.querySelectorAll('[data-mini-option]').forEach(x=>x.classList.toggle('selected',x===button));
  const status=document.querySelector('[data-mini-answered]');
  if(status)status.textContent=`${Object.keys(session.answers).length}/${session.test.questions.length} answered`;
}

function playAudio(){
  if(!session||session.submitted||session.test.skill!=='listening'||session.played)return;
  if(!('speechSynthesis'in window)){ alert('Browser speech synthesis is unavailable. This prototype Listening Mini Test cannot play on this browser.'); return; }
  session.played=true;
  const btn=document.querySelector('[data-mini-action="play-audio"]'); if(btn){btn.disabled=true;btn.textContent='Recording played';btn.classList.remove('primary');btn.classList.add('soft');}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(session.test.script.replace(/\n+/g,' '));
  u.lang='en-US'; u.rate=1; u.pitch=1;
  speechSynthesis.speak(u);
}

function persistSubmission(result){
  const core=read(CORE_KEY); core.lessonAnswers||={}; core.studyHistory||=[];
  for(const item of session.test.questions){
    core.lessonAnswers[item.id]={selected:session.answers[item.id]||'',checked:true};
  }
  core.studyHistory.push({ts:result.ts,type:'mini-test-submit',lessonId:session.test.id,score:result.correct,total:result.total});
  write(CORE_KEY,core);
  const adaptive=read(ADAPTIVE_KEY); adaptive.miniTestHistory||=[]; adaptive.miniTestHistory.push(result); write(ADAPTIVE_KEY,adaptive);
  window.dispatchEvent(new CustomEvent('ielts-mini-test-submitted',{detail:result}));
}

function resultHTML(result){
  const t=session.test;
  const items=t.questions.map((item,index)=>{
    const mine=session.answers[item.id]||'Unanswered'; const correct=mine===item.answer;
    return `<article class="error-item"><div class="cluster"><span class="chip">${index+1}</span><span class="chip ${correct?'success':'warning'}">${correct?'Correct':'Review'}</span><span class="small muted">${esc(item.errorTag)}</span></div><strong>${esc(item.prompt)}</strong><div class="error-answer"><div><span class="small muted">Your answer</span><br>${esc(mine)}</div><div><span class="small muted">Correct answer</span><br>${esc(item.answer)}</div></div><p class="muted">${esc(item.rationale)}</p></article>`;
  }).join('');
  const transcript=t.skill==='listening'?`<details class="card" style="margin-top:18px"><summary><strong>Review transcript after submission</strong></summary><div class="reading-passage" style="margin-top:12px">${t.script.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}</div></details>`:'';
  return `<section data-mini-test-player="true"><section class="page-head"><div><div class="eyebrow">Mini Test result · diagnostic only</div><h1>${esc(t.title)}</h1><p class="lede">This score is evidence from one short test. It is not an IELTS band estimate.</p></div><div class="score-circle">${result.correct}<span class="small">/${result.total}</span></div></section><div class="grid three"><div class="card stat"><div class="stat-value">${Math.round(result.correct/result.total*100)}%</div><div class="stat-label">items correct</div></div><div class="card stat"><div class="stat-value">${result.unanswered}</div><div class="stat-label">unanswered</div></div><div class="card stat"><div class="stat-value">${formatTime(result.durationSeconds)}</div><div class="stat-label">time used</div></div></div>${transcript}<section class="card" style="margin-top:18px"><div class="eyebrow">Item review</div><h2 style="margin:7px 0 14px">Evidence → Error → Repair</h2>${items}<div class="cluster" style="margin-top:18px"><button class="btn primary" data-mini-action="save-errors">Save missed items to Error Notebook</button><button class="btn soft" data-mini-action="retake">Retake after review</button><button class="btn ghost" data-mini-action="exit">Back to IELTS</button></div></section></section>`;
}

function submitTest(timedOut=false){
  if(!session||session.submitted)return;
  session.submitted=true; clearInterval(timerId); speechSynthesis?.cancel?.();
  const correct=session.test.questions.filter(item=>session.answers[item.id]===item.answer).length;
  const unanswered=session.test.questions.filter(item=>!session.answers[item.id]).length;
  const result={id:`mt-${Date.now()}-${session.test.id}`,ts:Date.now(),testId:session.test.id,skill:session.test.skill,correct,total:session.test.questions.length,unanswered,durationSeconds:Math.min(session.test.timeLimitSeconds,Math.floor((Date.now()-session.startedAt)/1000)),timedOut};
  session.result=result; persistSubmission(result);
  const player=document.querySelector('[data-mini-test-player]'); if(player)player.outerHTML=resultHTML(result);
  window.scrollTo({top:0,behavior:'smooth'});
}

function saveErrors(button){
  if(!session?.submitted)return;
  const core=read(CORE_KEY); core.errors||=[];
  let added=0;
  for(const item of session.test.questions){
    const mine=session.answers[item.id]||'';
    if(mine===item.answer||core.errors.some(e=>e.questionId===item.id))continue;
    core.errors.push({id:`err-${Date.now()}-${item.id}`,ts:Date.now(),questionId:item.id,lessonId:session.test.id,skill:session.test.skill,question:item.prompt,myAnswer:mine||'Unanswered',correctAnswer:item.answer,rationale:item.rationale,errorTag:item.errorTag});
    added++;
  }
  write(CORE_KEY,core);
  button.disabled=true; button.textContent=added?`${added} missed item${added===1?'':'s'} saved`:'Missed items already saved';
  window.dispatchEvent(new CustomEvent('ielts-mini-test-errors-saved'));
}

function exitTest(){
  clearInterval(timerId); if('speechSynthesis'in window)speechSynthesis.cancel();
  document.querySelector('[data-mini-test-player]')?.remove(); session=null; setMainHidden(false); injectIndex(); window.scrollTo({top:0,behavior:'smooth'});
}

function retake(){
  if(!session)return; const id=session.test.id;
  document.querySelector('[data-mini-test-player]')?.remove(); session=null; setMainHidden(false); startTest(id);
}

function apply(){ removeMiniTestsFromLearn(); injectIndex(); }

document.addEventListener('click',e=>{
  const option=e.target.closest('[data-mini-option]'); if(option)return selectOption(option);
  const btn=e.target.closest('[data-mini-action]'); if(!btn)return;
  const a=btn.dataset.miniAction;
  if(a==='start')startTest(btn.dataset.testId);
  else if(a==='play-audio')playAudio();
  else if(a==='submit')submitTest(false);
  else if(a==='save-errors')saveErrors(btn);
  else if(a==='retake')retake();
  else if(a==='exit')exitTest();
});
window.addEventListener('hashchange',()=>{ if(session)exitTest(); setTimeout(apply,0); });
window.addEventListener('ielts-mini-test-submitted',()=>setTimeout(apply,0));
new MutationObserver(()=>{ if(!session)apply(); }).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(apply,0);
