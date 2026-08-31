const out=document.querySelector('#result');
const frame=document.querySelector('#app');
out.textContent='V113_NEW_LEARNER_ACTIVATION_RUNNING';

const CORE='ielts-self-learning-v1';
const PLAN='ielts-study-plan-v1';
const wait=async(fn,label,timeout=24000)=>{const start=Date.now();while(Date.now()-start<timeout){try{const value=fn();if(value)return value}catch{}await new Promise(resolve=>setTimeout(resolve,50))}throw new Error(`Timed out waiting for ${label}`)};
const read=key=>JSON.parse(localStorage.getItem(key)||'{}');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const text=node=>node?.textContent?.replace(/\s+/g,' ').trim()||'';
const isVisible=node=>{if(!node)return false;const style=node.ownerDocument.defaultView.getComputedStyle(node);const r=node.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&r.width>0&&r.height>0};

function assertNoOverflow(doc,label){
  const html=doc.documentElement;
  const body=doc.body;
  if(html.scrollWidth>html.clientWidth+1||body.scrollWidth>body.clientWidth+1){
    throw new Error(`${label}: horizontal overflow html ${html.scrollWidth}/${html.clientWidth}, body ${body.scrollWidth}/${body.clientWidth}`);
  }
}

function assertMobileNav(doc,label){
  const mobile=doc.querySelector('.mobile-nav');
  const sidebar=doc.querySelector('.sidebar');
  assert(mobile&&isVisible(mobile),`${label}: mobile navigation is not visible at 390px`);
  assert(sidebar&&!isVisible(sidebar),`${label}: desktop sidebar is still visible at 390px`);
  const labels=[...mobile.querySelectorAll('[data-nav]')].filter(isVisible).map(button=>text(button));
  for(const expected of ['Today','Learn','IELTS','Improve','Progress']){
    assert(labels.some(label=>label.includes(expected)),`${label}: ${expected} is missing from the compact workspace navigation`);
  }
}

function assertTargets(doc,label){
  const tooSmall=[...doc.querySelectorAll('button:not([disabled]),a[href]')].filter(isVisible).filter(node=>{
    const r=node.getBoundingClientRect();return r.width<24||r.height<24;
  });
  if(tooSmall.length){
    const sample=tooSmall.slice(0,4).map(node=>`${text(node).slice(0,28)} ${Math.round(node.getBoundingClientRect().width)}x${Math.round(node.getBoundingClientRect().height)}`).join(' | ');
    throw new Error(`${label}: pointer target below 24px — ${sample}`);
  }
}

async function checkpoint(doc,label){
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  assertNoOverflow(doc,label);
  assertMobileNav(doc,label);
  assertTargets(doc,label);
}

async function loadFresh(){
  localStorage.clear();
  sessionStorage.clear();
  frame.style.width='390px';
  frame.style.height='1180px';
  const loaded=new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  frame.src=`../index.html?activation=${Date.now()}#/today`;
  await loaded;
  const doc=frame.contentDocument;
  await wait(()=>doc.querySelector('#main')&&doc.querySelector('.app-shell'),'fresh Today');
  await wait(()=>doc.querySelector('[data-site-guide-welcome]'),'fresh learner Getting Started guide');
  return doc;
}

try{
  let doc=await loadFresh();
  const win=frame.contentWindow;

  // Fresh learner: one concise four-step path and self-explanatory workspace navigation.
  const welcome=doc.querySelector('[data-site-guide-welcome]');
  const steps=[...welcome.querySelectorAll('.site-guide-step')];
  assert(steps.length===4,`Expected four Getting Started steps, got ${steps.length}`);
  for(const label of ['Quick Placement','Create a Study Plan','Work from Today','Repair and retry']){
    assert(steps.some(step=>text(step).includes(label)),`Getting Started is missing ${label}`);
  }
  const first=steps.find(step=>text(step).includes('Quick Placement'));
  assert(first?.classList.contains('active')&&text(first).includes('Next'),'Quick Placement is not clearly marked as the fresh learner next step');
  assert(text(first).includes('not an official IELTS band'),'Placement purpose does not guard against fake IELTS precision');
  const startFromGuide=welcome.querySelector('[data-site-guide-nav="placement"]');
  assert(startFromGuide&&text(startFromGuide).includes('Start Quick Placement'),'Fresh learner guide has no direct Placement CTA');
  await checkpoint(doc,'fresh Today');

  startFromGuide.click();
  await wait(()=>win.location.hash==='#/placement','Placement navigation');
  doc=frame.contentDocument;
  const placementIntro=await wait(()=>doc.querySelector('.placement-shell [data-action="start-placement"]')?.closest('.placement-shell'),'Placement introduction');
  assert(text(placementIntro).includes('24 questions'),'Placement introduction does not state its bounded 24-item scope');
  assert(text(placementIntro).includes('not an official IELTS test')&&text(placementIntro).includes('not a precise band prediction'),'Placement introduction does not explain its diagnostic-only role');
  await checkpoint(doc,'Placement introduction');

  const canonical=await fetch('../content/placement/quick-placement-v1.json').then(response=>{if(!response.ok)throw new Error(`Placement fixture HTTP ${response.status}`);return response.json();});
  const questions=canonical.sections.flatMap(section=>section.questions);
  assert(questions.length===24,`Canonical Placement fixture contains ${questions.length} questions instead of 24`);
  doc.querySelector('[data-action="start-placement"]').click();

  // Complete the real 24-question UI. Using canonical answers keeps this an activation/navigation test rather than an ability test.
  for(let index=0;index<questions.length;index++){
    const q=questions[index];
    await wait(()=>text(doc.querySelector('.placement-step > span.small.muted'))===`${index+1}/24`,`Placement question ${index+1}/24`);
    const answer=[...doc.querySelectorAll('[data-placement-option]')].find(button=>button.dataset.placementOption===q.answer);
    assert(answer,`Canonical answer control missing for ${q.id}`);
    answer.click();
    await wait(()=>[...doc.querySelectorAll('[data-placement-option]')].some(button=>button.dataset.placementOption===q.answer&&button.classList.contains('selected')),`selected answer ${q.id}`);
    const next=doc.querySelector('[data-action="placement-next"]');
    assert(next&&!next.disabled,`Placement Next remains disabled after answering ${q.id}`);
    next.click();
  }

  const result=await wait(()=>doc.querySelector('.placement-shell .score-circle')?.closest('.placement-shell'),'Placement result');
  assert(text(result).includes('24/24')||text(result).includes('24 /24'),'Correctly answered Placement did not produce 24/24');
  assert(text(result).includes('not an official or exact IELTS band'),'Placement result lost the no-fake-band disclosure');
  assert(!/IELTS\s+Band\s+[0-9]/i.test(text(result)),'Placement result presents a fake IELTS band');
  assert(text(result).includes('Section profile')&&text(result).includes('Best Next Opportunities'),'Placement result does not explain the skill profile and next opportunities');
  const save=doc.querySelector('[data-action="save-placement-result"]');
  assert(save&&text(save).includes('Save profile & start learning'),'Placement result has no clear continuation action');
  await checkpoint(doc,'Placement result');

  save.click();
  await wait(()=>win.location.hash==='#/today'&&read(CORE).placement,'saved Placement → Today');
  doc=frame.contentDocument;
  const afterPlacement=await wait(()=>doc.querySelector('[data-site-guide-welcome]'),'post-Placement Getting Started state');
  const planStep=[...afterPlacement.querySelectorAll('.site-guide-step')].find(step=>text(step).includes('Create a Study Plan'));
  assert(planStep?.classList.contains('active')&&text(planStep).includes('Next'),'Getting Started did not advance from Placement to Study Plan');
  const createPlan=afterPlacement.querySelector('[data-site-guide-nav="progress"]');
  assert(createPlan&&text(createPlan).includes('Create Study Plan'),'Study Plan is not discoverable after Placement');
  await checkpoint(doc,'Today after Placement');

  createPlan.click();
  await wait(()=>win.location.hash==='#/progress','Progress / Study Plan navigation');
  doc=frame.contentDocument;
  const builder=await wait(()=>doc.querySelector('[data-study-plan-builder]'),'Study Plan builder');
  const generate=builder.querySelector('[data-sp-action="generate"]');
  assert(generate&&text(generate).includes('Create study plan'),'Study Plan builder has no primary creation action');
  assert(builder.querySelector('[data-sp-weeks]')&&builder.querySelector('[data-sp-days]')&&builder.querySelector('[data-sp-minutes]'),'Study Plan does not expose plan length, study days and minutes/session');
  builder.querySelector('[data-sp-weeks]').value='4';
  builder.querySelector('[data-sp-days]').value='3';
  builder.querySelector('[data-sp-minutes]').value='20';
  await checkpoint(doc,'Study Plan builder');
  generate.click();

  const plan=await wait(()=>{const value=read(PLAN);return value?.weeks?.length===4&&value?.summary?.totalSessions===12?value:null;},'saved 4-week Study Plan');
  assert(plan.profileReady===true,'Study Plan does not recognize the saved Placement profile');
  const firstSession=plan.weeks[0]?.sessions?.[0];
  assert(firstSession?.title&&firstSession?.reason,'Study Plan first session lacks a title or rationale');
  doc=frame.contentDocument;
  await wait(()=>text(doc.querySelector('[data-study-plan-builder]')).includes('12')&&text(doc.querySelector('[data-study-plan-builder]')).includes('planned sessions'),'rendered Study Plan summary');
  await checkpoint(doc,'generated Study Plan');

  const todayNav=doc.querySelector('.mobile-nav [data-nav="today"]');
  assert(todayNav&&isVisible(todayNav),'390px Study Plan page has no visible Today route');
  todayNav.click();
  await wait(()=>win.location.hash==='#/today','Study Plan → Today navigation');
  doc=frame.contentDocument;
  const primary=await wait(()=>doc.querySelector('[data-today-primary-action]'),'Today primary action after Study Plan');
  await wait(()=>doc.querySelector('#main')?.dataset.todayPrimaryKind==='study-plan','Study Plan selected as Today primary action');
  assert(text(primary).includes(firstSession.title),`Today primary action does not match Study Plan session: expected ${firstSession.title}, got ${text(primary).slice(0,140)}`);
  assert(text(primary).includes(firstSession.reason),'Today does not explain why the first Study Plan action is recommended');
  const fullPrimaries=[...doc.querySelectorAll('[data-today-primary-action]')].filter(isVisible);
  assert(fullPrimaries.length===1,`Today exposes ${fullPrimaries.length} full-size primary actions instead of one`);

  const afterPlanGuide=await wait(()=>doc.querySelector('[data-site-guide-welcome]'),'post-plan Getting Started state');
  const studyStep=[...afterPlanGuide.querySelectorAll('.site-guide-step')].find(step=>text(step).includes('Work from Today'));
  assert(studyStep?.classList.contains('active')&&text(studyStep).includes('Next'),'Getting Started did not advance to Work from Today after plan creation');
  await checkpoint(doc,'Today with Study Plan');

  // Open the recommended plan action to prove there is no prerequisite/navigation dead end.
  const action=primary.querySelector('[data-lesson]')||primary.querySelector('[data-nav]')||primary.querySelector('[data-mini-action]');
  assert(action,'Today Study Plan primary card has no actionable destination');
  const lessonId=action.dataset.lesson||'';
  action.click();
  if(lessonId){
    await wait(()=>win.location.hash===`#/lesson/${lessonId}`&&text(doc.querySelector('#main')).includes(firstSession.title),'first Study Plan lesson opens');
    assert(!text(doc.querySelector('#main')).includes('Lesson not found'),'First Study Plan action leads to a missing/locked lesson');
  }else{
    await wait(()=>win.location.hash!=='#/today','first Study Plan action navigation');
  }
  doc=frame.contentDocument;
  await checkpoint(doc,'first Study Plan action');

  out.textContent='V113_NEW_LEARNER_ACTIVATION_PASS';
}catch(error){
  out.textContent=`V113_NEW_LEARNER_ACTIVATION_FAIL: ${error.stack||error}`;
}
