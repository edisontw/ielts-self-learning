const out=document.querySelector('#result');
const frame=document.querySelector('#app');
out.textContent='V17_PRODUCTION_E2E_RUNNING';

const CORE='ielts-self-learning-v1';
const MOCK='ielts-mock-v1';
const ADAPTIVE='ielts-adaptive-v1';
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

  ma02.querySelector('[data-mock-test="MA02"][data-mock-start="reading"]').click();
  let player=await wait(()=>doc.querySelector('[data-mock-player][data-mock-test-id="MA02"]'),'MA02 Reading player');
  if(!includes(player,'Academic Mock 02')||!doc.querySelector('#mock-q-MA02-R01'))throw new Error('MA02 Reading did not bind to MA02 data');
  player.querySelector('[data-mock-action="submit"]').click();
  player=await wait(()=>doc.querySelector('[data-mock-player].mock-result'),'MA02 Reading result');
  const history=JSON.parse(localStorage.getItem(MOCK)||'{}').history||[];
  if(history.length!==1||history[0].testId!=='MA02'||history[0].mode!=='reading')throw new Error('MA02 history did not persist under the existing mock schema');
  player.querySelector('[data-mock-action="save-errors"]').click();
  const saved=JSON.parse(localStorage.getItem(CORE)||'{}').errors||[];
  if(saved.length!==40||saved.some(error=>error.lessonId!=='MA02'||!String(error.questionId).startsWith('MA02-R')))throw new Error('MA02 Reading errors did not persist with unique MA02 ids');

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
  player.querySelector('[data-mock-action="exit"]').click();

  localStorage.clear();seedGuide();
  const now=Date.now();
  localStorage.setItem(CORE,JSON.stringify({
    errors:[
      {id:'v17-conditional',ts:now,questionId:'MA02-L09',lessonId:'MA02',skill:'listening',errorTag:'conditional-outcome',question:'Late payment outcome',myAnswer:'A',correctAnswer:'B',rationale:'QA'},
      {id:'v17-spatial',ts:now+1,questionId:'MA02-L11',lessonId:'MA02',skill:'listening',errorTag:'spatial-sequence',question:'First location after ticket desk',myAnswer:'A',correctAnswer:'B',rationale:'QA'}
    ],
    fixedErrors:[],lessonAnswers:{},studyHistory:[],completedLessons:[],
    profile:{targetBand:7,placementSections:{vocabulary:3,grammar:3,reading:3,listening:3},recommendedDifficulty:3},study:{preferredMinutes:20},ui:{chineseHelp:false}
  }));
  localStorage.setItem(ADAPTIVE,JSON.stringify({repairProgress:{},learningHistory:[],reviewSchedule:{}}));
  doc=await load('#/improve');
  const routing=await wait(()=>doc.querySelector('[data-v16-existing-practice-improve]'),'V1.7 existing-practice routing');
  const conditional=routing.querySelector('[data-existing-practice-family="listening-conditional-outcome"]');
  const spatial=routing.querySelector('[data-existing-practice-family="listening-spatial-sequence"]');
  if(!includes(conditional,'L04')||conditional.querySelector('[data-lesson="L04"]')===null)throw new Error('Conditional outcome does not route to exact owner L04');
  if(!includes(spatial,'QL03')||spatial.querySelector('[data-lesson="QL03"]')===null)throw new Error('Spatial sequence does not route to exact owner QL03');
  const errorCard=id=>doc.querySelector(`[data-error-id="${id}"]`)?.closest('.error-item');
  const conditionalCard=await wait(()=>errorCard('v17-conditional'),'Conditional Error Notebook card');
  const spatialCard=await wait(()=>errorCard('v17-spatial'),'Spatial Error Notebook card');
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
  const spatialRouteAfterReturn=await wait(()=>doc.querySelector('[data-error-id="v17-spatial"]')?.closest('.error-item')?.querySelector('[data-v16-existing-practice-error-route]'),'Spatial Error Notebook CTA after Improve return');
  spatialRouteAfterReturn.querySelector('[data-lesson="QL03"]').click();
  await wait(()=>frame.contentWindow.location.hash==='#/lesson/QL03'&&frame.contentDocument.querySelector('#main')?.textContent.includes('Listening Maps & Directions'),'QL03 CTA navigation');

  localStorage.clear();seedGuide();
  doc=await load('#/ielts',390,844);
  await wait(()=>doc.querySelector('[data-mock-card="MA02"]'),'390px MA02 card');
  if(!doc.querySelector('[data-mock-card="MA01"]')||!doc.querySelector('[data-mock-card="MA02"]'))throw new Error('Both mock cards are not reachable at 390px');
  const root=doc.documentElement,body=doc.body;
  if(root.scrollWidth>root.clientWidth+2||body.scrollWidth>body.clientWidth+2)throw new Error(`390px horizontal overflow: root ${root.scrollWidth}/${root.clientWidth}, body ${body.scrollWidth}/${body.clientWidth}`);
  const mobileStart=doc.querySelector('[data-mock-card="MA02"] [data-mock-start="listening"]');
  if(!mobileStart||mobileStart.getBoundingClientRect().width<1||mobileStart.getBoundingClientRect().height<1)throw new Error('MA02 mobile start control is not visible/tappable');

  out.textContent='V17_PRODUCTION_E2E_PASS';
}catch(error){
  out.textContent=`V17_PRODUCTION_E2E_FAIL: ${error.stack||error}`;
}
