import { SPEAKING_PART1_TOPICS, SPEAKING_PART2_CARDS, SPEAKING_PART3_SETS } from './speaking-practice-bank-v1.js';

const CORE_KEY='ielts-self-learning-v1';
const UI_KEY='ielts-speaking-bank-ui-v1';
const esc=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const read=(key,fallback={})=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return structuredClone(fallback);}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const wordCount=text=>(String(text||'').trim().match(/\S+/g)||[]).length;

const UI_DEFAULT={mode:'part1',part1TopicId:'P1-HOME',part1Index:0,part2Id:'P2-SKILL',part3Id:'P3-SKILL',part3Index:0,attemptKind:'first'};
let recorder=null;
let recorderStream=null;
let recorderChunks=[];
let recordingUrl=null;
let timerHandle=null;
let timerSeconds=0;
let timerLabel='Practice';

function coreState(){
  const core=read(CORE_KEY,{});
  core.speakingTranscripts ||= {};
  core.notes ||= {};
  core.studyHistory ||= [];
  return core;
}
function saveCore(core){write(CORE_KEY,core);}
function uiState(){return {...UI_DEFAULT,...read(UI_KEY,{})};}
function saveUI(ui){write(UI_KEY,ui);}
function patchUI(fn){const ui=uiState();fn(ui);saveUI(ui);return ui;}

function part1Topic(id){return SPEAKING_PART1_TOPICS.find(x=>x.id===id)||SPEAKING_PART1_TOPICS[0];}
function part2Card(id){return SPEAKING_PART2_CARDS.find(x=>x.id===id)||SPEAKING_PART2_CARDS[0];}
function part3Set(id){return SPEAKING_PART3_SETS.find(x=>x.id===id)||SPEAKING_PART3_SETS[0];}
function discussionForPart2(id){return SPEAKING_PART3_SETS.find(x=>x.part2Id===id)||SPEAKING_PART3_SETS[0];}

function currentPrompt(ui=uiState()){
  if(ui.mode==='part1'){
    const topic=part1Topic(ui.part1TopicId);const index=Math.min(topic.questions.length-1,Math.max(0,ui.part1Index||0));const q=topic.questions[index];
    return {id:q.id,part:'Part 1',partKey:'part1',title:topic.title,text:q.text,index,topicId:topic.id};
  }
  if(ui.mode==='part2'){
    const card=part2Card(ui.part2Id);
    return {id:`SPB-${card.id}`,part:'Part 2',partKey:'part2',title:card.title,text:card.cue,card};
  }
  if(ui.mode==='part3'){
    const set=part3Set(ui.part3Id);const index=Math.min(set.questions.length-1,Math.max(0,ui.part3Index||0));const q=set.questions[index];
    return {id:q.id,part:'Part 3',partKey:'part3',title:set.title,text:q.text,index,setId:set.id,set};
  }
  return null;
}

function transcriptFor(prompt){return coreState().speakingTranscripts[prompt?.id]||'';}
function saveTranscript(id,text){const core=coreState();core.speakingTranscripts[id]=text;saveCore(core);}
function prepNoteId(prompt){return `spb-prep-${prompt.id}`;}
function prepNoteFor(prompt){return coreState().notes[prepNoteId(prompt)]||'';}
function savePrepNote(prompt,text){const core=coreState();core.notes[prepNoteId(prompt)]=text;saveCore(core);}

function optionList(items,active,labeler=x=>x.title){return items.map(x=>`<option value="${x.id}" ${x.id===active?'selected':''}>${esc(labeler(x))}</option>`).join('');}
function qNav(questions,index,attr){return `<div class="spb-qnav">${questions.map((q,i)=>`<button class="btn ${i===index?'primary':'soft'} small-btn" ${attr}="${i}">${i+1}</button>`).join('')}</div>`;}

function part1Panel(ui){const topic=part1Topic(ui.part1TopicId);const index=Math.min(3,Math.max(0,ui.part1Index||0));const q=topic.questions[index];return `<div class="spb-prompt-panel">
  <div class="spb-picker"><label class="stack"><strong>Topic set</strong><select class="text-input" data-spb-select="part1">${optionList(SPEAKING_PART1_TOPICS,topic.id)}</select></label><div><strong>Question</strong>${qNav(topic.questions,index,'data-spb-p1-index')}</div></div>
  <div class="eyebrow">Part 1 · familiar topic</div><h3>${esc(q.text)}</h3><p class="muted">Practice target: answer directly, then add a reason, detail or small example. The optional 45-second timer is a pacing drill, not an official IELTS per-question limit.</p>
  <div class="cluster"><button class="btn soft" data-spb-random="part1">Random Part 1 question</button><button class="btn soft" data-spb-timer="45" data-spb-timer-label="Part 1 pacing">45s pacing timer</button></div>
</div>`;}

function part2Panel(ui){const card=part2Card(ui.part2Id);const linked=discussionForPart2(card.id);return `<div class="spb-prompt-panel">
  <label class="stack"><strong>Cue card</strong><select class="text-input" data-spb-select="part2">${optionList(SPEAKING_PART2_CARDS,card.id)}</select></label>
  <div class="eyebrow">Part 2 · long turn</div><h3>${esc(card.cue)}</h3><div class="spb-cue"><p>You should say:</p><ul>${card.bullets.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="grid two"><div class="card subtle"><strong>Possible follow-up</strong><ul>${card.followUps.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="card subtle"><strong>Linked Part 3 theme</strong><p>${esc(linked.title)}</p><button class="btn soft" data-spb-linked-part3="${linked.id}">Open linked Part 3</button></div></div>
  <div class="cluster"><button class="btn soft" data-spb-random="part2">Random cue card</button><button class="btn soft" data-spb-timer="60" data-spb-timer-label="Preparation">Prep 01:00</button><button class="btn soft" data-spb-timer="120" data-spb-timer-label="Long turn">Speak 02:00</button></div>
</div>`;}

function part3Panel(ui){const set=part3Set(ui.part3Id);const index=Math.min(3,Math.max(0,ui.part3Index||0));const q=set.questions[index];return `<div class="spb-prompt-panel">
  <div class="spb-picker"><label class="stack"><strong>Discussion theme</strong><select class="text-input" data-spb-select="part3">${optionList(SPEAKING_PART3_SETS,set.id)}</select></label><div><strong>Question</strong>${qNav(set.questions,index,'data-spb-p3-index')}</div></div>
  <div class="eyebrow">Part 3 · discussion</div><h3>${esc(q.text)}</h3><p class="muted">Move beyond a personal answer. Give a position, explain why, then add a comparison, example, consequence or qualified prediction where useful.</p>
  <div class="cluster"><button class="btn soft" data-spb-random="part3">Random Part 3 question</button><button class="btn soft" data-spb-timer="90" data-spb-timer-label="Part 3 practice">90s practice timer</button></div>
</div>`;}

function recentAttempts(){return coreState().studyHistory.filter(x=>x.type==='speaking-bank-attempt').sort((a,b)=>b.ts-a.ts).slice(0,10);}
function retryPanel(){const attempts=recentAttempts();return `<div class="spb-prompt-panel"><div class="eyebrow">Retry bank</div><h3>Return to prompts you have already attempted.</h3><p class="muted">A retry should target one change, not simply produce another recording.</p>${attempts.length?`<div class="spb-retry-list">${attempts.map(x=>`<div class="card subtle"><div class="cluster" style="justify-content:space-between"><strong>${esc(x.part)} · ${esc(x.title||x.promptId)}</strong><span class="chip">${x.wordCount||0} words</span></div><p class="small muted">${new Date(x.ts).toLocaleDateString()} · ${esc(x.attemptKind||'first')} attempt${x.retryTarget?` · target: ${esc(x.retryTarget)}`:''}</p><button class="btn soft" data-spb-retry="${esc(x.promptId)}">Retry this prompt</button></div>`).join('')}</div>`:`<div class="empty-state"><p>No bank attempts saved yet. Complete a Part 1, 2 or 3 transcript and save the attempt.</p></div>`}</div>`;}

function timerHtml(){return `<div class="spb-timer" data-spb-timer-card><span class="small muted" data-spb-timer-label-display>${esc(timerLabel)}</span><strong data-spb-timer-display>${formatTime(timerSeconds)}</strong><div class="cluster"><button class="btn ghost small-btn" data-spb-timer-action="start">Start</button><button class="btn ghost small-btn" data-spb-timer-action="pause">Pause</button><button class="btn ghost small-btn" data-spb-timer-action="reset">Clear</button></div></div>`;}
function formatTime(total){const m=Math.floor(total/60),s=total%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function updateTimer(){const d=document.querySelector('[data-spb-timer-display]');if(d)d.textContent=formatTime(timerSeconds);const l=document.querySelector('[data-spb-timer-label-display]');if(l)l.textContent=timerLabel;document.querySelector('[data-spb-timer-card]')?.classList.toggle('finished',timerSeconds===0&&Boolean(timerLabel));}
function setTimer(seconds,label){clearInterval(timerHandle);timerHandle=null;timerSeconds=Number(seconds)||0;timerLabel=label||'Practice';updateTimer();}
function startTimer(){if(timerHandle||timerSeconds<=0)return;timerHandle=setInterval(()=>{timerSeconds=Math.max(0,timerSeconds-1);updateTimer();if(timerSeconds===0){clearInterval(timerHandle);timerHandle=null;}},1000);}
function pauseTimer(){clearInterval(timerHandle);timerHandle=null;}
function clearTimer(){pauseTimer();timerSeconds=0;timerLabel='Practice';updateTimer();}

function transcriptPanel(prompt,ui){if(!prompt)return '';const transcript=transcriptFor(prompt);const min=prompt.partKey==='part2'?60:prompt.partKey==='part3'?30:15;return `<div class="spb-response-panel">
  ${prompt.partKey==='part2'?`<label class="stack"><strong>1-minute preparation notes</strong><textarea class="text-area spb-prep" data-spb-prep="${prompt.id}" placeholder="Keywords only: route, detail, example, ending...">${esc(prepNoteFor(prompt))}</textarea></label>`:''}
  <div class="spb-recorder"><div><strong>Recording</strong><p class="small muted">The recording stays in this page only and is not included in backup. Keep the transcript as portable learning evidence.</p></div><div class="cluster"><button class="btn primary" data-spb-record="start">Start recording</button><button class="btn soft" data-spb-record="stop" disabled>Stop</button><span class="small muted" data-spb-record-status>Microphone optional.</span></div><div data-spb-audio-preview></div></div>
  <label class="stack"><div class="cluster" style="justify-content:space-between"><strong>Transcript / speaking notes</strong><span class="small muted" data-spb-word-count>${wordCount(transcript)} words</span></div><textarea class="text-area spb-transcript speaking-input" data-spb-transcript="${prompt.id}" data-speaking-id="${prompt.id}" placeholder="Paste or type what you said...">${esc(transcript)}</textarea></label>
  <div class="grid two"><div class="card subtle"><strong>Self-check after listening</strong><div class="checklist spb-checks"><label class="check-item"><input type="checkbox"> I answered the exact question.</label><label class="check-item"><input type="checkbox"> I developed the answer instead of repeating it.</label><label class="check-item"><input type="checkbox"> My ideas were easy to follow.</label><label class="check-item"><input type="checkbox"> I used enough vocabulary to express the idea naturally.</label><label class="check-item"><input type="checkbox"> Grammar errors did not repeatedly block meaning.</label><label class="check-item"><input type="checkbox"> On playback, I could understand my pronunciation without much effort.</label></div></div><div class="card subtle"><strong>Repair route</strong><p class="small muted">Choose a lesson only if the recording shows that pattern.</p><div class="spb-repair-links"><button class="btn soft small-btn" data-lesson="S01">S01 · develop</button><button class="btn soft small-btn" data-lesson="S02">S02 · flow</button><button class="btn soft small-btn" data-lesson="S03">S03 · no restart</button>${prompt.partKey==='part2'?'<button class="btn soft small-btn" data-lesson="S04">S04 · Part 2</button>':''}${prompt.partKey==='part3'?'<button class="btn soft small-btn" data-lesson="S05">S05 · Part 3</button>':''}</div></div></div>
  <div class="spb-save-row"><label class="stack"><strong>Attempt</strong><select class="text-input" data-spb-attempt-kind><option value="first" ${ui.attemptKind==='first'?'selected':''}>First attempt</option><option value="retry" ${ui.attemptKind==='retry'?'selected':''}>Retry</option></select></label><label class="stack"><strong>One retry target</strong><select class="text-input" data-spb-retry-target><option value="">Choose after listening</option><option value="development">answer development</option><option value="flow">flow / hesitation</option><option value="restart">avoid restarting</option><option value="vocabulary">vocabulary / paraphrase</option><option value="grammar">grammar control</option><option value="pronunciation">pronunciation clarity</option></select></label><div class="cluster spb-save-actions"><button class="btn primary" data-spb-save>Save attempt</button><button class="btn soft" data-spb-copy-ai>Copy AI coaching prompt</button></div></div>
  <p class="small muted">Minimum transcript for saving this practice record: ${min} words. Productive Evidence below remains the separate first-attempt/retry self-check system.</p>
</div>`;}

function aiPrompt(prompt,transcript){const part=prompt.part;const task=prompt.partKey==='part2'?`${prompt.card.cue}\nYou should say: ${prompt.card.bullets.join('; ')}`:prompt.text;return `You are acting as an IELTS Speaking learning coach.\n\nPART:\n${part}\n\nQUESTION / TASK:\n${task}\n\nMY TRANSCRIPT:\n${transcript}\n\nUse the public IELTS Speaking criteria as a learning reference: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.\n\nImportant evidence limit: this is a transcript-only review. Do not score or judge pronunciation, stress, intonation, actual speech rate, pauses, or hesitation from text. I will check those from my recording. Do not give a fake precise official IELTS band score.\n\nPlease:\n1. Identify the three highest-priority improvements supported by the transcript.\n2. Check whether I answered the exact question and developed the answer appropriately for ${part}.\n3. Comment on organisation/coherence, vocabulary/paraphrase, and grammar using short examples from my transcript.\n4. Separate clear errors from optional style improvements.\n5. Give one short repair drill for each priority.\n6. Give me one specific retry target for the same prompt.\n7. Ask me to retry before showing any model answer.`;}

async function copyText(text,button){try{await navigator.clipboard.writeText(text);}catch{const a=document.createElement('textarea');a.value=text;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();}const old=button.textContent;button.textContent='Copied';setTimeout(()=>button.textContent=old,1200);}

function workspaceHtml(){const ui=uiState();const prompt=currentPrompt(ui);const body=ui.mode==='part1'?part1Panel(ui):ui.mode==='part2'?part2Panel(ui):ui.mode==='part3'?part3Panel(ui):retryPanel();return `<div class="spb-workspace" data-spb-workspace>
  <div class="spb-topbar"><div><div class="eyebrow">Speaking Practice Bank</div><h2>108 original prompts · record → inspect → retry</h2></div>${timerHtml()}</div>
  <div class="spb-tabs"><button class="btn ${ui.mode==='part1'?'primary':'soft'}" data-spb-mode="part1">Part 1 · 48</button><button class="btn ${ui.mode==='part2'?'primary':'soft'}" data-spb-mode="part2">Part 2 · 12</button><button class="btn ${ui.mode==='part3'?'primary':'soft'}" data-spb-mode="part3">Part 3 · 48</button><button class="btn ${ui.mode==='retry'?'primary':'soft'}" data-spb-mode="retry">Retry bank · ${recentAttempts().length}</button></div>
  ${body}${ui.mode==='retry'?'':transcriptPanel(prompt,ui)}
  <div class="spb-source small muted">Original IELTS-style practice · format checked against IELTS public Speaking guidance on 2026-08-25 · not official IELTS material.</div>
</div>`;}

function mountWorkspace(){if(!location.hash.includes('/lesson/SPB01'))return;const mount=document.querySelector('[data-speaking-bank-mount]');if(!mount)return;mount.innerHTML=workspaceHtml();}
function injectIELTSCard(){if(!location.hash.includes('/ielts')||document.querySelector('[data-spb-ielts-card]'))return;const head=document.querySelector('#main .page-head');if(!head)return;head.insertAdjacentHTML('afterend',`<section class="card extension-card" data-spb-ielts-card style="margin-bottom:18px"><div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">Speaking depth</div><h2 style="margin:5px 0">Speaking Practice Bank</h2></div><span class="chip primary">108 prompts</span></div><p class="muted">12 Part 1 topics, 12 Part 2 cue cards and 12 linked Part 3 discussion sets. Record, keep a portable transcript, get targeted feedback and retry the same prompt.</p><button class="btn primary" data-lesson="SPB01">Open Speaking Practice Bank</button></section>`);}
function apply(){injectIELTSCard();mountWorkspace();}

function selectRetry(promptId){
  const ui=uiState();
  for(const topic of SPEAKING_PART1_TOPICS){const i=topic.questions.findIndex(q=>q.id===promptId);if(i>=0){ui.mode='part1';ui.part1TopicId=topic.id;ui.part1Index=i;ui.attemptKind='retry';saveUI(ui);return;}}
  const card=SPEAKING_PART2_CARDS.find(c=>`SPB-${c.id}`===promptId);if(card){ui.mode='part2';ui.part2Id=card.id;ui.attemptKind='retry';saveUI(ui);return;}
  for(const set of SPEAKING_PART3_SETS){const i=set.questions.findIndex(q=>q.id===promptId);if(i>=0){ui.mode='part3';ui.part3Id=set.id;ui.part3Index=i;ui.attemptKind='retry';saveUI(ui);return;}}
}

function randomize(part){const ui=uiState();if(part==='part1'){const t=SPEAKING_PART1_TOPICS[Math.floor(Math.random()*SPEAKING_PART1_TOPICS.length)];ui.part1TopicId=t.id;ui.part1Index=Math.floor(Math.random()*4);}else if(part==='part2'){ui.part2Id=SPEAKING_PART2_CARDS[Math.floor(Math.random()*SPEAKING_PART2_CARDS.length)].id;}else{const s=SPEAKING_PART3_SETS[Math.floor(Math.random()*SPEAKING_PART3_SETS.length)];ui.part3Id=s.id;ui.part3Index=Math.floor(Math.random()*4);}saveUI(ui);mountWorkspace();}

async function startRecording(){if(recorder?.state==='recording')return;if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){alert('Microphone recording is not available in this browser. You can still practise and type or paste a transcript.');return;}try{recorderStream=await navigator.mediaDevices.getUserMedia({audio:true});recorderChunks=[];recorder=new MediaRecorder(recorderStream);recorder.ondataavailable=e=>{if(e.data.size)recorderChunks.push(e.data);};recorder.onstop=()=>{const blob=new Blob(recorderChunks,{type:recorder.mimeType||'audio/webm'});if(recordingUrl)URL.revokeObjectURL(recordingUrl);recordingUrl=URL.createObjectURL(blob);const host=document.querySelector('[data-spb-audio-preview]');if(host)host.innerHTML=`<audio controls src="${recordingUrl}"></audio>`;recorderStream?.getTracks().forEach(t=>t.stop());recorderStream=null;setRecordState(false,'Recording ready. Listen once before self-checking.');};recorder.start();setRecordState(true,'Recording…');}catch{alert('Microphone permission was not available. You can still practise and save a transcript.');}}
function stopRecording(){if(recorder?.state==='recording')recorder.stop();}
function setRecordState(active,status){const start=document.querySelector('[data-spb-record="start"]'),stop=document.querySelector('[data-spb-record="stop"]'),label=document.querySelector('[data-spb-record-status]');if(start)start.disabled=active;if(stop)stop.disabled=!active;if(label)label.textContent=status;}

function saveAttempt(){const ui=uiState();const prompt=currentPrompt(ui);if(!prompt)return;const transcript=transcriptFor(prompt);const count=wordCount(transcript);const min=prompt.partKey==='part2'?60:prompt.partKey==='part3'?30:15;if(count<min){alert(`Add at least ${min} words to the transcript before saving this speaking attempt.`);return;}const kind=document.querySelector('[data-spb-attempt-kind]')?.value||ui.attemptKind||'first';const target=document.querySelector('[data-spb-retry-target]')?.value||'';const core=coreState();core.studyHistory.push({id:`spb-${Date.now()}-${prompt.id}`,ts:Date.now(),type:'speaking-bank-attempt',promptId:prompt.id,part:prompt.part,title:prompt.title,question:prompt.text,wordCount:count,attemptKind:kind,retryTarget:target});saveCore(core);patchUI(x=>x.attemptKind='retry');window.dispatchEvent(new CustomEvent('ielts-speaking-bank-attempt',{detail:{promptId:prompt.id,attemptKind:kind}}));mountWorkspace();}

function handleClick(event){
  const mode=event.target.closest('[data-spb-mode]');if(mode){patchUI(ui=>ui.mode=mode.dataset.spbMode);clearTimer();mountWorkspace();return;}
  const p1=event.target.closest('[data-spb-p1-index]');if(p1){patchUI(ui=>ui.part1Index=Number(p1.dataset.spbP1Index));mountWorkspace();return;}
  const p3=event.target.closest('[data-spb-p3-index]');if(p3){patchUI(ui=>ui.part3Index=Number(p3.dataset.spbP3Index));mountWorkspace();return;}
  const random=event.target.closest('[data-spb-random]');if(random){randomize(random.dataset.spbRandom);return;}
  const linked=event.target.closest('[data-spb-linked-part3]');if(linked){patchUI(ui=>{ui.mode='part3';ui.part3Id=linked.dataset.spbLinkedPart3;ui.part3Index=0;});mountWorkspace();return;}
  const timer=event.target.closest('[data-spb-timer]');if(timer){setTimer(timer.dataset.spbTimer,timer.dataset.spbTimerLabel);return;}
  const timerAction=event.target.closest('[data-spb-timer-action]');if(timerAction){({start:startTimer,pause:pauseTimer,reset:clearTimer})[timerAction.dataset.spbTimerAction]?.();return;}
  const record=event.target.closest('[data-spb-record]');if(record){record.dataset.spbRecord==='start'?startRecording():stopRecording();return;}
  const save=event.target.closest('[data-spb-save]');if(save){saveAttempt();return;}
  const copy=event.target.closest('[data-spb-copy-ai]');if(copy){const prompt=currentPrompt();const text=transcriptFor(prompt);if(wordCount(text)<10){alert('Add a transcript before copying the coaching prompt.');return;}copyText(aiPrompt(prompt,text),copy);return;}
  const retry=event.target.closest('[data-spb-retry]');if(retry){selectRetry(retry.dataset.spbRetry);clearTimer();mountWorkspace();}
}

function handleChange(event){const select=event.target.closest('[data-spb-select]');if(select){patchUI(ui=>{if(select.dataset.spbSelect==='part1'){ui.part1TopicId=select.value;ui.part1Index=0;}else if(select.dataset.spbSelect==='part2'){ui.part2Id=select.value;}else{ui.part3Id=select.value;ui.part3Index=0;}});mountWorkspace();return;}const kind=event.target.closest('[data-spb-attempt-kind]');if(kind)patchUI(ui=>ui.attemptKind=kind.value);}
function handleInput(event){const tx=event.target.closest('[data-spb-transcript]');if(tx){saveTranscript(tx.dataset.spbTranscript,tx.value);const counter=document.querySelector('[data-spb-word-count]');if(counter)counter.textContent=`${wordCount(tx.value)} words`;return;}const prep=event.target.closest('[data-spb-prep]');if(prep){const prompt=currentPrompt();if(prompt?.id===prep.dataset.spbPrep)savePrepNote(prompt,prep.value);}}

if(typeof document!=='undefined'){
  document.addEventListener('click',handleClick);
  document.addEventListener('change',handleChange);
  document.addEventListener('input',handleInput);
  window.addEventListener('hashchange',()=>{pauseTimer();setTimeout(apply,0);});
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(apply,0);
}

export { currentPrompt, aiPrompt, recentAttempts, transcriptFor, saveTranscript };
