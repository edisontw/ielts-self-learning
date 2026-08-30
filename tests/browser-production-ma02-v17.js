const out=document.querySelector('#result');
const frame=document.querySelector('#app');
out.textContent='V17_PRODUCTION_E2E_RUNNING';

const CORE='ielts-self-learning-v1';
const MOCK='ielts-mock-v1';
const GUIDE='ielts-site-guide-dismissed-v1';
let loadSerial=0;
const wait=async(fn,label,timeout=18000)=>{const start=Date.now();while(Date.now()-start<timeout){try{const value=fn();if(value)return value}catch{}await new Promise(r=>setTimeout(r,60))}throw new Error(`Timed out waiting for ${label}`)};
const includes=(node,text)=>Boolean(node?.textContent?.includes(text));
const load=async(hash,width=1280,height=900)=>{frame.style.width=`${width}px`;frame.style.height=`${height}px`;const loaded=new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));frame.src=`../index.html?e2e=${Date.now()}-${++loadSerial}${hash}`;await loaded;return frame.contentDocument};
const seedGuide=()=>localStorage.setItem(GUIDE,'true');
const notebookDiagnostics=()=>{
  const doc=frame.contentDocument;
  return [...(doc?.querySelectorAll('#main .error-item')||[])].map(item=>({
    id:item.querySelector('[data-error-id]')?.dataset.errorId||'',
    tag:[...item.querySelectorAll('.chip')].map(x=>x.textContent?.trim()).filter(Boolean).join('|'),
    retry:Boolean(item.querySelector('[data-action="retry-error"]')),
    route:item.querySelector('[data-v16-existing-practice-error-route]')?.textContent?.trim()||''
  }));
};

try{
  let doc=frame.contentDocument;
  const center=await wait(()=>frame.contentDocument?.querySelector('[data-mock-center]'),'V1.7 Mock Center');
  doc=frame.contentDocument;
  seedGuide();
  if(!includes(center,'IELTS Mock Test Center · V1.7'))throw new Error('V1.7 Mock Center marker missing');
  const ma01=center.querySelector('[data-mock-card="MA01"]');
  const ma02=center.querySelector('[data-mock-card="MA02"]');
  if(!ma01||!ma02)throw new Error('MA01/MA02 selector cards are not both deployed');
  if(!includes(ma02,'Academic Mock 02')||!includes(ma02,'Browser voice beta'))throw new Error('MA02 learner-facing status copy missing');

  // Reading: verify MA02 data, result priorities, submit/history, and Error Notebook persistence IDs.
  ma02.querySelector('[data-mock-test="MA02"][data-mock-start="reading"]').click();
  let player=await wait(()=>doc.querySelector('[data-mock-player][data-mock-test-id="MA02"]'),'MA02 Reading player');
  if(!includes(player,'Academic Mock 02')||!doc.querySelector('#mock-q-MA02-R01'))throw new Error('MA02 Reading did not bind to MA02 data');
  player.querySelector('[data-mock-action="submit"]').click();
  player=await wait(()=>doc.querySelector('[data-mock-player].mock-result'),'MA02 Reading result');
  const readingPriorities=await wait(()=>player.querySelector('[data-result-priorities-v18]'),'V1.8 MA02 Reading result priorities');
  if(!includes(readingPriorities,'Your priorities')||!readingPriorities.querySelector('[data-result-recommended-next]')||!readingPriorities.querySelector('[data-lesson]'))throw new Error('MA02 Reading result does not expose an evidence-backed recommended next step');
  const history=JSON.parse(localStorage.getItem(MOCK)||'{}').history||[];
  if(history.length!==1||history[0].testId!=='MA02'||history[0].mode!=='reading')throw new Error('MA02 history did not persist under the existing mock schema');
  player.querySelector('[data-mock-action="save-errors"]').click();
  const saved=JSON.parse(localStorage.getItem(CORE)||'{}').errors||[];
  if(saved.length!==40||saved.some(error=>error.lessonId!=='MA02'||!String(error.questionId).startsWith('MA02-R')))throw new Error('MA02 Reading errors did not persist with unique MA02 ids');

  // Writing: verify dynamic MA02 task IDs rather than MA01 hard-coding.
  localStorage.clear();seedGuide();
  doc=await load('#/ielts');
  await wait(()=>doc.querySelector('[data-mock-card="MA02"]'),'MA02 card before Writing');
  doc.querySelector('[data-mock-test="MA02"][data-mock-start="writing"]').click();
  player=await wait(()=>doc.querySelector('[data-mock-player][data-mock-test-id="MA02"]'),'MA02 Writing player');
  if(!player.querySelector('textarea[data-mock-writing="MA02-W1"]'))throw new Error('MA02 Writing Task 1 id is not dynamic');
  player.querySelector('[data-mock-part="1"]').click();
  player=await wait(()=>doc.querySelector('textarea[data-mock-writing="MA02-W2"]')?.closest('[data-mock-player]'),'MA02 Writing Task 2');
  if(!includes(player,'Some people think governments should spend more money making existing cities better places to live'))throw new Error('MA02 Writing Task 2 content missing');
  player.querySelector('[data-mock-action="exit"]').click();

  // Listening: verify browser-voice gate and V1.8 priorities, then use the real submit → save errors → Exit
  // handoff so the base app must reload its in-memory Error Notebook state.
  localStorage.clear();seedGuide();
  doc=await load('#/ielts');
  await wait(()=>doc.querySelector('[data-mock-card="MA02"]'),'MA02 card before Listening');
  doc.querySelector('[data-mock-test="MA02"][data-mock-start="listening"]').click();
  player=await wait(()=>doc.querySelector('[data-mock-player][data-mock-test-id="MA02"]'),'MA02 Listening player');
  const audioPanel=player.querySelector('.mock-audio-panel');
  if(!includes(audioPanel,'Browser voice beta'))throw new Error('MA02 browser-voice beta gate is not visible in Listening');
  const play=audioPanel.querySelector('[data-mock-action="play"]');
  if(!play||play.disabled)throw new Error('MA02 one-play browser-voice control is unavailable');
  if(frame.contentWindow.speechSynthesis&&frame.contentWindow.SpeechSynthesisUtterance){
    play.click();
    await wait(()=>includes(audioPanel,'browser voice fallback')||includes(audioPanel,'Browser voice fallback'),'MA02 browser-voice fallback playback status');
    frame.contentWindow.speechSynthesis.cancel();
  }

  player.querySelector('[data-mock-action="submit"]').click();
  player=await wait(()=>doc.querySelector('[data-mock-player].mock-result'),'MA02 Listening result');
  const listeningPriorities=await wait(()=>player.querySelector('[data-result-priorities-v18]'),'V1.8 MA02 Listening result priorities');
  if(!includes(listeningPriorities,'Your priorities')||!listeningPriorities.querySelector('[data-result-recommended-next]'))throw new Error('MA02 Listening result priority summary missing');
  if(!listeningPriorities.querySelector('[data-lesson="L04"]')||!listeningPriorities.querySelector('[data-lesson="QL03"]'))throw new Error('MA02 Listening result priorities do not reuse the audited L04 / QL03 teaching owners');
  const saveListening=player.querySelector('[data-mock-action="save-errors"]');
  if(!saveListening)throw new Error('MA02 Listening result has no Save missed items action');
  saveListening.click();
  const listeningCore=JSON.parse(localStorage.getItem(CORE)||'{}');
  const listeningErrors=listeningCore.errors||[];
  if(listeningErrors.length!==40||listeningErrors.some(error=>error.lessonId!=='MA02'||!String(error.questionId).startsWith('MA02-L')))throw new Error('MA02 Listening missed items did not persist as 40 unique MA02 errors');
  const conditionalSaved=listeningErrors.find(error=>error.questionId==='MA02-L09');
  const spatialSaved=listeningErrors.find(error=>error.questionId==='MA02-L11');
  if(!conditionalSaved||conditionalSaved.errorTag!=='conditional-outcome')throw new Error('MA02-L09 conditional-outcome error was not saved correctly');
  if(!spatialSaved||spatialSaved.errorTag!=='spatial-sequence')throw new Error('MA02-L11 spatial-sequence error was not saved correctly');

  const reloadedAfterExit=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Mock Error Notebook handoff did not reload the base app after Exit')),12000);
    frame.addEventListener('load',()=>{clearTimeout(timer);resolve();},{once:true});
  });
  player.querySelector('[data-mock-action="exit"]').click();
  await reloadedAfterExit;
  doc=frame.contentDocument;
  frame.contentWindow.location.hash='#/improve';
  await wait(()=>frame.contentWindow.location.hash==='#/improve'&&doc.querySelector('#main')?.textContent.includes('Errors are learning data.'),'Improve after Mock Error Notebook handoff');

  // The post-MA02 semantic audit makes only these two V1.7 families actionable,
  // both by returning to exact existing teaching rather than adding Repair.
  const routing=await wait(()=>doc.querySelector('[data-v16-existing-practice-improve]'),'V1.7 existing-practice routing');
  const conditional=routing.querySelector('[data-existing-practice-family="listening-conditional-outcome"]');
  const spatial=routing.querySelector('[data-existing-practice-family="listening-spatial-sequence"]');
  if(!includes(conditional,'L04')||conditional.querySelector('[data-lesson="L04"]')===null)throw new Error('Conditional outcome does not route to exact owner L04');
  if(!includes(spatial,'QL03')||spatial.querySelector('[data-lesson="QL03"]')===null)throw new Error('Spatial sequence does not route to exact owner QL03');

  const errorCard=id=>doc.querySelector(`[data-error-id="${id}"]`)?.closest('.error-item');
  let conditionalCard=null,spatialCard=null;
  try{conditionalCard=await wait(()=>errorCard(conditionalSaved.id),'Conditional Error Notebook card')}catch(error){throw new Error(`${error.message}; notebook=${JSON.stringify(notebookDiagnostics())}`)}
  try{spatialCard=await wait(()=>errorCard(spatialSaved.id),'Spatial Error Notebook card')}catch(error){throw new Error(`${error.message}; notebook=${JSON.stringify(notebookDiagnostics())}`)}
  let conditionalRoute=null,spatialRoute=null;
  try{conditionalRoute=await wait(()=>conditionalCard.querySelector('[data-v16-existing-practice-error-route]'),'Conditional Error Notebook CTA')}catch(error){throw new Error(`${error.message}; notebook=${JSON.stringify(notebookDiagnostics())}`)}
  try{spatialRoute=await wait(()=>spatialCard.querySelector('[data-v16-existing-practice-error-route]'),'Spatial Error Notebook CTA')}catch(error){throw new Error(`${error.message}; notebook=${JSON.stringify(notebookDiagnostics())}`)}
  if(!includes(conditionalRoute,'Review L04'))throw new Error('Conditional Error Notebook CTA does not point to L04');
  if(!includes(spatialRoute,'Review QL03'))throw new Error('Spatial Error Notebook CTA does not point to QL03');

  conditionalRoute.querySelector('[data-lesson="L04"]').click();
  await wait(()=>frame.contentWindow.location.hash==='#/lesson/L04'&&frame.contentDocument.querySelector('#main')?.textContent.includes("Don't Fall for the Distractor"),'L04 CTA navigation');
  frame.contentWindow.location.hash='#/improve';
  await wait(()=>frame.contentWindow.location.hash==='#/improve'&&frame.contentDocument.querySelector('[data-existing-practice-family="listening-spatial-sequence"]'),'Improve return for QL03');
  doc=frame.contentDocument;
  const spatialRouteAfterReturn=await wait(()=>doc.querySelector(`[data-error-id="${spatialSaved.id}"]`)?.closest('.error-item')?.querySelector('[data-v16-existing-practice-error-route]'),'Spatial Error Notebook CTA after Improve return');
  spatialRouteAfterReturn.querySelector('[data-lesson="QL03"]').click();
  await wait(()=>frame.contentWindow.location.hash==='#/lesson/QL03'&&frame.contentDocument.querySelector('#main')?.textContent.includes('Question Type Lab: Map & Plan Labelling'),'QL03 CTA navigation');

  // Mobile: use the same staged IELTS navigation a learner sees, then verify both mocks
  // and the MA02 Listening section control are reachable without page-level overflow.
  localStorage.clear();seedGuide();
  doc=await load('#/ielts',390,844);
  const mockStage=await wait(()=>doc.querySelector('[data-ielts-stage="mock"]'),'390px Full Mock stage tab');
  mockStage.click();
  const visibleCenter=await wait(()=>{
    const center=doc.querySelector('[data-mock-center]');
    return center&&!center.hidden?center:null;
  },'390px visible Full Mock center');
  const mobileMa01=visibleCenter.querySelector('[data-mock-card="MA01"]');
  const mobileMa02=visibleCenter.querySelector('[data-mock-card="MA02"]');
  if(!mobileMa01||!mobileMa02)throw new Error('Both mock cards are not reachable at 390px after selecting Full Mock');
  const root=doc.documentElement,body=doc.body;
  if(root.scrollWidth>root.clientWidth+2||body.scrollWidth>body.clientWidth+2)throw new Error(`390px horizontal overflow: root ${root.scrollWidth}/${root.clientWidth}, body ${body.scrollWidth}/${body.clientWidth}`);
  const mobileStart=mobileMa02.querySelector('[data-mock-start="listening"]');
  if(!mobileStart||mobileStart.getBoundingClientRect().width<1||mobileStart.getBoundingClientRect().height<1)throw new Error('MA02 mobile Listening start control is not visible/tappable after selecting Full Mock');

  out.textContent='V17_PRODUCTION_E2E_PASS';
}catch(error){
  out.textContent=`V17_PRODUCTION_E2E_FAIL: ${error.stack||error}`;
}
