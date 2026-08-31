const out=document.querySelector('#result');
const frame=document.querySelector('#app');
out.textContent='V113_TRANSFER_E2E_RUNNING';

const ADAPTIVE='ielts-adaptive-v1';
const GUIDE='ielts-site-guide-dismissed-v1';
const RETURN='ielts-return-context-v18';
let loadSerial=0;
const wait=async(fn,label,timeout=18000)=>{const start=Date.now();while(Date.now()-start<timeout){try{const value=fn();if(value)return value}catch{}await new Promise(r=>setTimeout(r,60))}throw new Error(`Timed out waiting for ${label}`)};
const includes=(node,text)=>Boolean(node?.textContent?.includes(text));
const load=async(hash='#/ielts')=>{const loaded=new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));frame.src=`../index.html?e2e=${Date.now()}-${++loadSerial}${hash}`;await loaded;return frame.contentDocument};

try{
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem(GUIDE,'true');

  let doc=await load('#/ielts');
  const miniTab=await wait(()=>doc.querySelector('[data-ielts-stage="mini"]'),'Mini Tests stage tab');
  miniTab.click();
  const miniIndex=await wait(()=>{const node=doc.querySelector('[data-mini-test-index]');return node&&!node.hidden?node:null;},'visible Mini Tests stage');
  const mr01=[...miniIndex.querySelectorAll('[data-mini-action="start"]')].find(button=>button.dataset.testId==='MR01');
  if(!mr01)throw new Error('MR01 start control is missing from the Mini Tests stage');

  mr01.click();
  let player=await wait(()=>doc.querySelector('[data-mini-test-player="true"]'),'MR01 Test Mode player');
  if(!includes(player,'Reading Mini Test 01')||!includes(player,'No hints, transcript, answer checking, or rationale until you submit.'))throw new Error('MR01 did not open in Test Mode');
  if(player.querySelector('[data-result-priorities-v18]'))throw new Error('Result priorities appeared before MR01 submission');

  player.querySelector('[data-mini-action="submit"]').click();
  player=await wait(()=>doc.querySelector('[data-mini-test-player="true"] .score-circle')?.closest('[data-mini-test-player="true"]'),'MR01 submitted result');
  if(!includes(player,'0/12')&&!includes(player,'0 /12'))throw new Error('Blank MR01 submission did not produce the expected 0/12 result');
  if(!includes(player,'Item review')||!includes(player,'Evidence → Error → Repair'))throw new Error('MR01 submitted item review is missing');

  const priorities=await wait(()=>player.querySelector('[data-result-priorities-v18]'),'MR01 result priorities');
  if(!includes(priorities,'Your priorities')||!priorities.querySelector('[data-result-recommended-next]'))throw new Error('MR01 result does not expose evidence-backed priorities');
  const recommended=priorities.querySelector('[data-result-priority] [data-lesson]');
  if(!recommended)throw new Error('MR01 top priority has no targeted-practice action');
  const targetId=recommended.dataset.lesson||'';
  if(targetId!=='RR01')throw new Error(`Expected MR01 top priority RR01 from two main-idea misses; got ${targetId||'(none)'}`);

  const before=JSON.parse(localStorage.getItem(ADAPTIVE)||'{}').miniTestHistory||[];
  if(before.length!==1||before[0].testId!=='MR01'||before[0].correct!==0||before[0].total!==12)throw new Error(`MR01 history did not persist exactly one submitted attempt: ${JSON.stringify(before)}`);
  const originalResultId=before[0].id;

  recommended.click();
  await wait(()=>frame.contentWindow.location.hash==='#/lesson/RR01'&&frame.contentDocument.querySelector('#main')?.textContent.includes('Main Idea vs Supporting Detail'),'RR01 targeted practice navigation');
  doc=frame.contentDocument;
  const returnBanner=await wait(()=>doc.querySelector('[data-return-context-v18]'),'MR01 return-path banner');
  if(!includes(returnBanner,'Reading Mini Test 01 → Main Idea vs Supporting Detail'))throw new Error('Targeted-practice banner does not name the Mini Test source and RR01 destination');
  if(!includes(returnBanner,'Return to Reading Mini Test 01 review'))throw new Error('MR01 return CTA is not named for the submitted review');

  const savedContext=JSON.parse(frame.contentWindow.sessionStorage.getItem(RETURN)||'null');
  if(savedContext?.kind!=='mini-result'||savedContext?.sourceLabel!=='Reading Mini Test 01'||!savedContext?.snapshotHtml)throw new Error(`Mini Test return context was not captured correctly: ${JSON.stringify(savedContext)}`);

  returnBanner.querySelector('[data-return-context-action="return"]').click();
  const returned=await wait(()=>frame.contentDocument.querySelector('[data-return-review-v18]'),'returned MR01 read-only review');
  if(!includes(returned,'Returned review · read-only')||!includes(returned,'Reading Mini Test 01'))throw new Error('Returned MR01 review header is missing');
  const snapshot=returned.querySelector('[data-return-review-content] [data-mini-test-player="true"]');
  if(!snapshot||!includes(snapshot,'0/12')&&!includes(snapshot,'0 /12'))throw new Error('Returned MR01 snapshot lost the submitted score');
  if(!snapshot.querySelector('[data-result-priorities-v18] [data-lesson="RR01"]'))throw new Error('Returned MR01 review lost its evidence-backed RR01 priority');
  if(snapshot.querySelector('[data-mini-action]'))throw new Error('Returned MR01 review re-enabled Test Mode actions');
  const disabledLegacy=[...snapshot.querySelectorAll('button')].filter(button=>/Save missed items|Retake after review|Back to IELTS/.test(button.textContent||''));
  if(disabledLegacy.length!==3||disabledLegacy.some(button=>!button.disabled||button.getAttribute('aria-disabled')!=='true'))throw new Error('Submitted Mini Test action buttons are not disabled in the read-only snapshot');

  const during=JSON.parse(localStorage.getItem(ADAPTIVE)||'{}').miniTestHistory||[];
  if(during.length!==1||during[0].id!==originalResultId)throw new Error('Returning to the submitted review created or replaced a Mini Test attempt');

  returned.querySelector('[data-return-context-action="close-review"]').click();
  await wait(()=>!frame.contentDocument.querySelector('[data-return-review-v18]')&&frame.contentDocument.querySelector('[data-mini-test-index]'),'close returned MR01 review');
  const after=JSON.parse(localStorage.getItem(ADAPTIVE)||'{}').miniTestHistory||[];
  if(after.length!==1||after[0].id!==originalResultId)throw new Error('Closing the returned review changed Mini Test history');
  if(frame.contentWindow.sessionStorage.getItem(RETURN)!==null)throw new Error('Return context was not cleared after closing the submitted review');

  out.textContent='V113_TRANSFER_E2E_PASS';
}catch(error){
  out.textContent=`V113_TRANSFER_E2E_FAIL: ${error.stack||error}`;
}
