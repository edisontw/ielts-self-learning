const out=document.querySelector('#result');
const frame=document.querySelector('#app');
out.textContent='V113_RETURNING_CONTINUITY_RUNNING';

const CORE='ielts-self-learning-v1';
const ADAPTIVE='ielts-adaptive-v1';
const PLAN='ielts-study-plan-v1';
const GUIDE='ielts-site-guide-dismissed-v1';
const DAY=86400000;
const settle=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const wait=async(fn,label,timeout=18000)=>{const start=Date.now();while(Date.now()-start<timeout){try{const value=fn();if(value)return value}catch{}await settle(60)}throw new Error(`Timed out waiting for ${label}`)};
const read=key=>JSON.parse(localStorage.getItem(key)||'{}');
const localDate=ts=>{const d=new Date(ts-new Date(ts).getTimezoneOffset()*60000);return d.toISOString().slice(0,10)};

function seedReturningLearner(){
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem(GUIDE,'true');
  const now=Date.now();
  const fourDaysAgo=now-4*DAY;
  const core={
    profile:{targetBand:7,stage:'B2',referenceLevel:'B2',recommendedDifficulty:3,confidence:'Moderate',placementSections:{vocabulary:4,grammar:4,reading:3,listening:4}},
    study:{preferredMinutes:20},
    placement:{total:15,sectionScores:{vocabulary:4,grammar:4,reading:3,listening:4},ts:now-21*DAY},
    completedLessons:['R01','L01','W01'],
    lessonAnswers:{},notes:{},fixedErrors:[],
    errors:[{id:'returning-due-1',ts:fourDaysAgo,questionId:'MR01-Q5',lessonId:'MR01',skill:'reading',errorTag:'reading-inference',question:'Which conclusion is supported by the passage?',myAnswer:'A',correctAnswer:'C',rationale:'The correct answer stays within the evidence rather than extending the claim.'}],
    studyHistory:[
      {ts:now-6*DAY,lessonId:'R01',type:'lesson-complete'},
      {ts:now-5*DAY,lessonId:'L01',type:'lesson-complete'},
      {ts:now-4*DAY,lessonId:'W01',type:'lesson-complete'}
    ],
    writingDrafts:{},speakingTranscripts:{},ui:{chineseHelp:false}
  };
  const adaptive={
    reviewSchedule:{'returning-due-1':{dueAt:now-2*DAY,intervalDays:0,attempts:0,lastReviewedAt:null,lastRating:null}},
    reviewHistory:[],repairProgress:{},learningHistory:[],vocabularySchedule:{},vocabularyHistory:[],
    skillPerformance:{reading:{answered:12,correct:6,accuracy:.5,confidence:'Moderate',updatedAt:fourDaysAgo}},
    miniTestHistory:[{testId:'MR01',skill:'reading',correct:6,total:12,ts:fourDaysAgo}],
    productiveEvidence:{writing:[{id:'returning-w-first',ts:now-5*DAY,skill:'writing',lessonId:'W01',blockId:'w01',attemptKind:'first',criteria:['task','position','organization'],score:.6,wordCount:185}],speaking:[]},
    productivePriority:{writing:{score:.42,attempts:1,retries:0,average:.6,latestAt:now-5*DAY,lessonId:'W01'}},
    aiFeedbackReturns:{writing:[],speaking:[]}
  };
  const plan={
    version:1,generatedAt:fourDaysAgo,startDate:localDate(fourDaysAgo),
    config:{weeks:4,daysPerWeek:3,minutesPerSession:20},targetBand:7,profileReady:true,
    priorities:[{skill:'reading',score:.72},{skill:'writing',score:.58},{skill:'listening',score:.45}],
    dueAtGeneration:{errors:1,vocab:0},manualDone:[],summary:{totalSessions:12,examSessions:3,examRatio:.25},
    weeks:[
      {week:1,phase:'Foundation',sessions:[
        {key:'W1-S1-review-REVIEW-W1',session:1,kind:'review',sourceId:'REVIEW-W1',title:'Adaptive Review Queue',skill:'review',minutes:15,reason:'Clear the review item that became due while you were away.',examSpecific:false},
        {key:'W1-S2-lesson-R02',session:2,kind:'lesson',sourceId:'R02',title:'Reading: next core step',skill:'reading',minutes:20,reason:'Continue the current Study Plan session after review is cleared.',examSpecific:false},
        {key:'W1-S3-lesson-L02',session:3,kind:'lesson',sourceId:'L02',title:'Listening: next core step',skill:'listening',minutes:20,reason:'Keep skill balance after the Reading session.',examSpecific:false}
      ]},
      {week:2,phase:'Build',sessions:[]},{week:3,phase:'Transfer',sessions:[]},{week:4,phase:'Test & Review',sessions:[]}
    ]
  };
  localStorage.setItem(CORE,JSON.stringify(core));
  localStorage.setItem(ADAPTIVE,JSON.stringify(adaptive));
  localStorage.setItem(PLAN,JSON.stringify(plan));
}

async function openApp(){
  seedReturningLearner();
  frame.src=`../index.html?returning=${Date.now()}#/today`;
  await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  const doc=frame.contentDocument;
  await wait(()=>doc.querySelector('[data-today-primary-action]'),'returning Today primary action');
  await settle(550);
  return doc;
}

try{
  const doc=await openApp();
  const win=frame.contentWindow;
  const main=()=>doc.querySelector('#main');

  if(main()?.dataset.todayPrimaryKind!=='due-review')throw new Error(`Expected due-review first, got ${main()?.dataset.todayPrimaryKind||'none'}`);
  const duePrimary=doc.querySelector('[data-today-primary-action]');
  const improve=duePrimary?.querySelector('[data-nav="improve"]');
  if(!improve)throw new Error('Returning Today did not route the due review to Improve.');
  if(duePrimary.querySelector('[data-lesson="R01"]'))throw new Error('Already-completed R01 was surfaced as the returning primary action.');
  improve.click();

  await wait(()=>win.location.hash.includes('/improve'),'Improve navigation');
  const reviewItem=await wait(()=>doc.querySelector('[data-review-id="returning-due-1"]'),'due Review Queue item');
  const reveal=reviewItem.querySelector('[data-adaptive-action="reveal-review"]');
  if(!reveal)throw new Error('Review item has no Reveal answer action.');
  reveal.click();
  await wait(()=>!doc.querySelector('[data-review-answer="returning-due-1"]')?.hidden,'revealed review answer');
  const good=doc.querySelector('[data-adaptive-action="rate-review"][data-error-id="returning-due-1"][data-rating="good"]');
  if(!good)throw new Error('Review item has no Good rating action.');
  good.click();

  await wait(()=>{
    const adaptive=read(ADAPTIVE);
    return adaptive.reviewHistory?.length===1 && adaptive.reviewSchedule?.['returning-due-1']?.dueAt>Date.now();
  },'saved spaced-review result');
  await wait(()=>doc.querySelector('[data-adaptive-root="review"]')?.textContent.includes('caught up'),'caught-up Review Queue');
  await wait(()=>read(PLAN).reviewEvidenceDone?.includes('W1-S1-review-REVIEW-W1'),'Study Plan review evidence sync');

  win.location.hash='#/today';
  await wait(()=>main()?.dataset.todayPrimaryKind==='study-plan','Study Plan handoff after review');
  await settle(650);
  const nextPrimary=doc.querySelector('[data-today-primary-action]');
  if(!nextPrimary?.querySelector('[data-lesson="R02"]')){
    const key=nextPrimary?.querySelector('[data-nav],[data-lesson]')?.dataset?.lesson || nextPrimary?.querySelector('[data-nav]')?.dataset?.nav || 'none';
    throw new Error(`Review completion did not advance to R02; primary destination=${key}; text=${nextPrimary?.textContent?.trim().slice(0,180)||'missing'}`);
  }
  if(nextPrimary.querySelector('[data-nav="improve"]'))throw new Error('Due Review remained primary after it was successfully rated.');
  const secondary=[...doc.querySelectorAll('[data-today-secondary-actions-v18] button')];
  if(secondary.some(button=>button.dataset.lesson==='R01'))throw new Error('Recently completed R01 was recycled as a secondary action.');
  if(!nextPrimary.textContent.includes('Continue the current Study Plan session after review is cleared.'))throw new Error('Today does not explain why the next Study Plan action is being shown.');

  const progress=nextPrimary.querySelector('[data-nav="progress"]');
  if(!progress)throw new Error('Study Plan primary action has no View full plan route.');
  progress.click();
  await wait(()=>win.location.hash.includes('/progress'),'Progress navigation');
  const builder=await wait(()=>doc.querySelector('[data-study-plan-builder]'),'Study Plan builder');
  const reviewRow=[...builder.querySelectorAll('.card.subtle')].find(row=>row.textContent.includes('Adaptive Review Queue'));
  if(!reviewRow?.textContent.includes('Done'))throw new Error('Progress did not mark the completed returning review session as Done.');
  if(!reviewRow.textContent.includes('Auto tracked from review evidence'))throw new Error('Progress did not identify the review session as evidence-tracked.');
  if(reviewRow.querySelector('[data-sp-action="toggle-done"]'))throw new Error('Evidence-tracked review still exposes a misleading manual Undo control.');
  const r02=builder.querySelector('[data-lesson="R02"]')?.closest('.card.subtle');
  if(!r02)throw new Error('Progress no longer contains the R02 next Study Plan session.');
  if(r02.textContent.includes('Done'))throw new Error('R02 was incorrectly marked complete before the learner opened it.');
  if(!r02.textContent.includes('Continue the current Study Plan session after review is cleared.'))throw new Error('Progress lost the rationale for the next R02 session.');

  const adaptive=read(ADAPTIVE);
  if(adaptive.reviewSchedule['returning-due-1'].attempts!==1)throw new Error('Review attempt count is not exactly one.');
  if(adaptive.reviewHistory[0]?.rating!=='good')throw new Error('Review history did not preserve the learner rating.');

  out.textContent='V113_RETURNING_CONTINUITY_PASS';
}catch(error){
  out.textContent=`V113_RETURNING_CONTINUITY_FAIL: ${error.stack||error}`;
}
