const out=document.querySelector('#result');
const frame=document.querySelector('#app');
out.textContent='V113_PRODUCTIVE_HANDOFF_RUNNING';

const CORE='ielts-self-learning-v1';
const ADAPTIVE='ielts-adaptive-v1';
const GUIDE='ielts-site-guide-dismissed-v1';
const settle=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const wait=async(fn,label,timeout=18000)=>{const start=Date.now();while(Date.now()-start<timeout){try{const value=fn();if(value)return value}catch{}await settle(60)}throw new Error(`Timed out waiting for ${label}`)};
const makeWords=n=>Array.from({length:n},(_,i)=>`word${i+1}`).join(' ');
const input=(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
const read=k=>JSON.parse(localStorage.getItem(k)||'{}');
const includes=(node,text)=>Boolean(node?.textContent?.includes(text));

async function selectChecks(doc,selector,count,label){
  await settle(220);
  for(let index=0;index<count;index++){
    const before=[...doc.querySelectorAll(selector)];
    const box=before[index];
    if(!box)throw new Error(`${label} checkbox ${index+1} is missing`);
    if(!box.checked){
      box.click();
      if(!box.checked)throw new Error(`${label} checkbox ${index+1} click was cancelled immediately (likely preventDefault)`);
    }
    await settle(45);
    const current=[...doc.querySelectorAll(selector)][index];
    if(current!==box)throw new Error(`${label} checkbox ${index+1} DOM node was replaced after click; replacement checked=${Boolean(current?.checked)}`);
    if(!current?.checked)throw new Error(`${label} checkbox ${index+1} was reset after click without DOM replacement`);
  }
  const checked=[...doc.querySelectorAll(selector)].filter(box=>box.checked).length;
  if(checked<count)throw new Error(`${label} retained only ${checked}/${count} selected self-check criteria`);
}

function trapClipboard(win){
  let copied='';
  const writeText=async text=>{copied=String(text)};
  try{Object.defineProperty(win.navigator,'clipboard',{configurable:true,value:{writeText}})}catch{
    try{win.navigator.clipboard.writeText=writeText}catch{}
  }
  return ()=>copied;
}

function assertProviderNeutral(text,label){
  if(/\b(ChatGPT|Claude|Gemini|Copilot|Perplexity)\b/i.test(text))throw new Error(`${label} handoff unexpectedly requires a named AI platform`);
}

localStorage.clear();
sessionStorage.clear();
localStorage.setItem(GUIDE,'true');
localStorage.setItem(CORE,JSON.stringify({
  profile:{targetBand:7,stage:'B2',referenceLevel:'B2',recommendedDifficulty:3,confidence:'Moderate',placementSections:{vocabulary:3,grammar:3,reading:3,listening:3}},
  study:{preferredMinutes:20},placement:{total:12,ts:Date.now()},completedLessons:[],lessonAnswers:{},notes:{},errors:[],fixedErrors:[],studyHistory:[],writingDrafts:{},speakingTranscripts:{},ui:{chineseHelp:false}
}));
localStorage.setItem(ADAPTIVE,JSON.stringify({repairProgress:{},learningHistory:[],reviewSchedule:{},vocabularySchedule:{},skillPerformance:{},miniTestHistory:[],productiveEvidence:{writing:[],speaking:[]},productivePriority:{},aiFeedbackReturns:{writing:[],speaking:[]}}));

try{
  frame.src=`../index.html?a4=${Date.now()}#/ielts`;
  await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  let doc=frame.contentDocument,win=frame.contentWindow;

  const task2Card=await wait(()=>doc.querySelector('[data-wt2-bank-card]'),'Task 2 bank card');
  task2Card.querySelector('[data-wt2-open]').click();
  await wait(()=>doc.querySelector('[data-wt2-workspace]'),'Task 2 workspace');
  let draft=doc.querySelector('[data-wt2-draft]');
  input(draft,makeWords(260));
  await wait(()=>doc.querySelector('[data-wt2-count]')?.textContent==='260 words','260-word Writing attempt');
  await selectChecks(doc,'[data-wt2-criterion]',3,'Writing first-attempt self-check');
  doc.querySelector('[data-wt2-save-evidence]').click();
  await wait(()=>read(ADAPTIVE).productiveEvidence?.writing?.length===1,'Writing first-attempt evidence');
  let adaptive=read(ADAPTIVE);
  const writingFirst=adaptive.productiveEvidence.writing[0];
  if(writingFirst.attemptKind!=='first'||writingFirst.wordCount!==260||writingFirst.criteria?.length!==3||Number(writingFirst.score)!==0.6)throw new Error(`Writing self-check evidence is invalid: ${JSON.stringify(writingFirst)}`);

  const writingCopy=doc.querySelector('[data-wt2-copy]');
  const writingAiSection=writingCopy?.closest('section');
  if(!writingCopy||writingCopy.disabled)throw new Error('Writing AI coaching copy action is unavailable after the learner attempt');
  if(!includes(writingAiSection,'Copy coaching feedback only after your own attempt.')||!includes(writingAiSection,'Return with 2–3 actionable priorities'))throw new Error('Writing AI handoff does not explain the attempt → priorities → revision sequence');
  if(writingAiSection.querySelector('a[href]'))throw new Error('Writing AI handoff unexpectedly requires navigation to a specific external platform');
  const getWritingClipboard=trapClipboard(win);
  writingCopy.click();
  const writingPrompt=await wait(()=>getWritingClipboard(),'Writing coaching prompt clipboard');
  for(const required of [
    'IELTS Academic Writing learning coach',
    'This is learning feedback, not an official IELTS score.',
    'TARGET: Band 7 (learning target only)',
    'Do not give a fake precise band score.',
    'identify my three highest-priority problems',
    'ask me to revise before showing a complete model answer'
  ])if(!writingPrompt.includes(required))throw new Error(`Writing coaching prompt lost guardrail: ${required}`);
  if(!writingPrompt.includes('MY RESPONSE:')||!writingPrompt.includes('word260'))throw new Error('Writing coaching prompt did not include the learner response');
  assertProviderNeutral(writingPrompt,'Writing');
  await wait(()=>writingCopy.textContent==='Copied','Writing copied-state feedback');

  let writingPriorities=[...doc.querySelectorAll('[data-wt2-feedback]')];
  input(writingPriorities[0],'Make the position more precise.');
  input(writingPriorities[1],'Develop the second body idea before the example.');
  doc.querySelector('[data-wt2-save-feedback]').click();
  await wait(()=>read(ADAPTIVE).aiFeedbackReturns?.writing?.length===1,'Writing returned coaching priorities');
  adaptive=read(ADAPTIVE);
  const writingFeedback=adaptive.aiFeedbackReturns.writing[0];
  if(writingFeedback.priorities?.length!==2||writingFeedback.appliedByEvidenceId)throw new Error(`Writing returned feedback was not stored as pending priorities: ${JSON.stringify(writingFeedback)}`);
  if('band' in writingFeedback||'score' in writingFeedback)throw new Error('Writing returned coaching priorities persisted an AI band/score');
  await wait(()=>doc.querySelector('[data-wt2-kind]')?.value==='retry','Writing retry preselection');
  draft=doc.querySelector('[data-wt2-draft]');
  input(draft,makeWords(275));
  await wait(()=>doc.querySelector('[data-wt2-count]')?.textContent==='275 words','275-word Writing retry');
  await selectChecks(doc,'[data-wt2-criterion]',5,'Writing retry self-check');
  doc.querySelector('[data-wt2-save-evidence]').click();
  await wait(()=>read(ADAPTIVE).productiveEvidence?.writing?.length===2,'Writing retry evidence');
  adaptive=read(ADAPTIVE);
  const writingRetry=adaptive.productiveEvidence.writing[1];
  const writingLinked=adaptive.aiFeedbackReturns.writing[0];
  if(writingRetry.attemptKind!=='retry'||writingRetry.criteria?.length!==5||writingLinked.appliedByEvidenceId!==writingRetry.id||Number(writingLinked.comparison?.processDelta)<=0)throw new Error('Writing feedback → retry state did not close visibly in learner data');
  await wait(()=>includes(doc.querySelector('[data-wt2-workspace]'),'Feedback → retry cycle recorded.'),'Writing retry completion state');

  win.location.hash='#/lesson/SPB01';
  await wait(()=>frame.contentDocument.querySelector('[data-speaking-sampler]'),'Speaking sampler');
  doc=frame.contentDocument;win=frame.contentWindow;
  let fields=[...doc.querySelectorAll('[data-sps-transcript]')];
  input(fields[0],makeWords(25));input(fields[1],makeWords(25));input(fields[2],makeWords(150));input(fields[3],makeWords(50));input(fields[4],makeWords(50));
  await wait(()=>doc.querySelector('[data-sps-part="total"]')?.textContent==='300','300-word Speaking transcript sample');
  await selectChecks(doc,'[data-sps-criterion]',3,'Speaking first-sample self-check');
  doc.querySelector('[data-sps-save]').click();
  await wait(()=>read(ADAPTIVE).productiveEvidence?.speaking?.length===1,'Speaking first-sample evidence');
  adaptive=read(ADAPTIVE);
  const speakingFirst=adaptive.productiveEvidence.speaking[0];
  if(speakingFirst.attemptKind!=='first'||speakingFirst.wordCount!==300||speakingFirst.criteria?.length!==3||Number(speakingFirst.score)!==0.6)throw new Error(`Speaking self-check evidence is invalid: ${JSON.stringify(speakingFirst)}`);

  const speakingCopy=doc.querySelector('[data-sps-copy]');
  const speakingAiSection=speakingCopy?.closest('section');
  if(!speakingCopy||speakingCopy.disabled)throw new Error('Speaking AI coaching copy action is unavailable after a complete transcript sample');
  if(!includes(speakingAiSection,'Transcript-only AI coaching')||!includes(speakingAiSection,'Pronunciation, pauses, stress and actual fluency cannot be judged from transcript text. Check those from your recording.'))throw new Error('Speaking transcript-only limitation is not explicit at the handoff');
  if(speakingAiSection.querySelector('a[href]'))throw new Error('Speaking AI handoff unexpectedly requires navigation to a specific external platform');
  const getSpeakingClipboard=trapClipboard(win);
  speakingCopy.click();
  const speakingPrompt=await wait(()=>getSpeakingClipboard(),'Speaking coaching prompt clipboard');
  for(const required of [
    'IELTS Speaking learning coach',
    'This is learning feedback, not an official IELTS score.',
    'This is transcript-only evidence:',
    'do not score or judge pronunciation, stress, intonation, pauses, hesitation or actual speech rate from text',
    'do not give a fake precise official band score',
    'ask me to retry this same linked sample before showing any model answer'
  ])if(!speakingPrompt.includes(required))throw new Error(`Speaking coaching prompt lost guardrail: ${required}`);
  if(!speakingPrompt.includes('A1: word1')||!speakingPrompt.includes('RESPONSE: word1'))throw new Error('Speaking coaching prompt did not include the transcript evidence');
  assertProviderNeutral(speakingPrompt,'Speaking');
  await wait(()=>speakingCopy.textContent==='Copied','Speaking copied-state feedback');

  let speakingPriorities=[...doc.querySelectorAll('[data-sps-feedback]')];
  input(speakingPriorities[0],'Develop the Part 3 comparison before the example.');
  input(speakingPriorities[1],'Reduce repeated vocabulary across the sample.');
  doc.querySelector('[data-sps-save-feedback]').click();
  await wait(()=>read(ADAPTIVE).aiFeedbackReturns?.speaking?.length===1,'Speaking returned coaching priorities');
  adaptive=read(ADAPTIVE);
  const speakingFeedback=adaptive.aiFeedbackReturns.speaking[0];
  if(speakingFeedback.priorities?.length!==2||speakingFeedback.appliedByEvidenceId)throw new Error(`Speaking returned feedback was not stored as pending priorities: ${JSON.stringify(speakingFeedback)}`);
  if('band' in speakingFeedback||'score' in speakingFeedback)throw new Error('Speaking returned coaching priorities persisted an AI band/score');
  await wait(()=>doc.querySelector('[data-sps-kind]')?.value==='retry','Speaking retry preselection');
  fields=[...doc.querySelectorAll('[data-sps-transcript]')];
  input(fields[2],makeWords(170));
  await wait(()=>doc.querySelector('[data-sps-part="total"]')?.textContent==='320','320-word Speaking retry');
  await selectChecks(doc,'[data-sps-criterion]',5,'Speaking retry self-check');
  doc.querySelector('[data-sps-save]').click();
  await wait(()=>read(ADAPTIVE).productiveEvidence?.speaking?.length===2,'Speaking retry evidence');
  adaptive=read(ADAPTIVE);
  const speakingRetry=adaptive.productiveEvidence.speaking[1];
  const speakingLinked=adaptive.aiFeedbackReturns.speaking[0];
  if(speakingRetry.attemptKind!=='retry'||speakingRetry.criteria?.length!==5||speakingLinked.appliedByEvidenceId!==speakingRetry.id||Number(speakingLinked.comparison?.processDelta)<=0)throw new Error('Speaking feedback → retry state did not close visibly in learner data');
  await wait(()=>includes(doc.querySelector('[data-speaking-sampler]'),'Speaking feedback → retry cycle recorded.'),'Speaking retry completion state');

  out.textContent='V113_PRODUCTIVE_HANDOFF_PASS';
}catch(error){
  out.textContent=`V113_PRODUCTIVE_HANDOFF_FAIL: ${error.stack||error}`;
}
