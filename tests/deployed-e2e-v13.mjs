import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts');
const CORE='ielts-self-learning-v1', ADAPTIVE='ielts-adaptive-v1', PLAN='ielts-study-plan-v1', MOCK='ielts-mock-v1', THEME='ielts-theme';
const results=[];
const warnings=[];

const assert=(condition,message)=>{ if(!condition) throw new Error(message); };
const log=(name,detail={})=>{ results.push({name,status:'PASS',...detail}); console.log(`✓ ${name}`); };
const shot=async(page,name)=>{ await page.screenshot({path:path.join(OUT,`${name}.png`),fullPage:true}); };
const goto=async(page,hash)=>{ await page.goto(`${BASE}#/${hash}`,{waitUntil:'domcontentloaded'}); await page.waitForSelector('#main',{timeout:20000}); await page.waitForTimeout(800); };

async function lessonQuiz(page, lessonId, index=0){
  return await page.evaluate(async ({lessonId,index,base})=>{
    const {LESSONS}=await import(`${base}data.js`);
    const lesson=LESSONS.find(x=>x.id===lessonId);
    const qs=(lesson?.sections||[]).flatMap(s=>s.blocks||[]).filter(b=>b?.type==='quiz');
    const q=qs[index];
    return q?{id:q.id,answer:q.answer,prompt:q.prompt}:null;
  },{lessonId,index,base:BASE});
}

async function repairData(page,id){
  return await page.evaluate(async ({id,base})=>{
    const {REPAIR_LESSONS}=await import(`${base}adaptive-data.js`);
    const lesson=REPAIR_LESSONS.find(x=>x.id===id);
    return lesson?{id:lesson.id,title:lesson.title,questions:lesson.questions.map(q=>({answer:q.answer,prompt:q.prompt}))}:null;
  },{id,base:BASE});
}

async function clickDatasetValue(locator, attr, wanted){
  const n=await locator.count();
  for(let i=0;i<n;i++){
    const el=locator.nth(i);
    if(await el.getAttribute(attr)===wanted){ await el.click(); return; }
  }
  throw new Error(`No option with ${attr}=${wanted}`);
}

async function playProductionAudio(page,label){
  const audio=page.locator('audio').first();
  await audio.waitFor({state:'attached',timeout:15000});
  const src=await audio.getAttribute('src');
  assert(src,`${label}: audio src missing`);
  const absolute=new URL(src,page.url()).href;
  const response=await page.context().request.get(absolute);
  assert(response.ok(),`${label}: deployed audio GET failed: ${response.status()} ${absolute}`);
  const size=(await response.body()).length;
  assert(size>1000,`${label}: deployed audio unexpectedly small (${size} bytes)`);
  const playback=await audio.evaluate(async a=>{
    a.muted=true;
    try { await a.play(); await new Promise(r=>setTimeout(r,200)); const ready=a.readyState; const source=a.dataset.listeningMediaSource||''; a.pause(); return {ok:true,ready,source}; }
    catch(e){ return {ok:false,error:String(e),ready:a.readyState,source:a.dataset.listeningMediaSource||''}; }
  });
  assert(playback.ok,`${label}: HTML audio playback did not start: ${playback.error||'unknown'}`);
  assert(playback.ready>=2,`${label}: insufficient media readiness (${playback.ready})`);
  console.log(`  ${label}: ${absolute} · ${size} bytes · readyState ${playback.ready} · ${playback.source||'native production media'}`);
  return {src:absolute,size,readyState:playback.ready,source:playback.source};
}

await fs.mkdir(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
page.on('console',m=>{ if(m.type()==='error') console.log(`console.error: ${m.text()}`); });
page.on('dialog',d=>d.accept());

try {
  // Bootstrap a real learner profile through the deployed Quick Placement UI.
  await goto(page,'placement');
  await page.locator('[data-action="start-placement"]').click();
  let placementAudio=null;
  for(let i=0;i<24;i++){
    await page.locator('.placement-question .option').first().click();
    if(i===18) placementAudio=await playProductionAudio(page,'Quick Placement');
    await page.locator('[data-action="placement-next"]').click();
    await page.waitForTimeout(80);
  }
  await page.locator('[data-action="save-placement-result"]').click();
  await page.waitForTimeout(500);
  const coreAfterPlacement=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),CORE);
  assert(coreAfterPlacement.placement && coreAfterPlacement.profile?.placementSections,'Quick Placement result was not saved');
  log('Quick Placement completed and saved on deployed site',{total:coreAfterPlacement.placement.total});

  // Create a real Study Plan before the backup/restore scenario.
  await goto(page,'progress');
  await page.locator('[data-study-plan-builder]').waitFor({timeout:15000});
  await page.locator('[data-sp-action="generate"]').click();
  await page.waitForTimeout(400);
  const plan=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),PLAN);
  assert(Array.isArray(plan.weeks)&&plan.weeks.length===8,'Study Plan was not generated with default 8-week configuration');
  log('Study Plan generated through deployed Progress UI',{weeks:plan.weeks.length});

  // 1. Desktop lesson wrong -> Save error -> Retry -> correct -> Improve = Corrected.
  await goto(page,'lesson/LB01');
  const lb=await lessonQuiz(page,'LB01');
  assert(lb,'LB01 quiz not found');
  const lbOpts=page.locator(`[data-quiz="${lb.id}"] [data-quiz-option]`);
  const lbValues=await lbOpts.evaluateAll(els=>els.map(e=>e.dataset.value));
  const lbWrong=lbValues.find(v=>v!==lb.answer);
  assert(lbWrong,'LB01 wrong option not found');
  await clickDatasetValue(lbOpts,'data-value',lbWrong);
  await page.locator(`[data-check-quiz="${lb.id}"]`).click();
  await page.locator(`[data-quiz="${lb.id}"] .feedback.wrong`).waitFor();
  await page.locator(`[data-save-error="${lb.id}"]`).click();
  await page.waitForTimeout(250);
  await page.locator(`[data-retry-quiz="${lb.id}"]`).click();
  await clickDatasetValue(page.locator(`[data-quiz="${lb.id}"] [data-quiz-option]`),'data-value',lb.answer);
  await page.locator(`[data-check-quiz="${lb.id}"]`).click();
  await page.locator(`[data-quiz="${lb.id}"] .feedback.correct`).waitFor();
  await goto(page,'improve');
  const lbError=page.locator('article.error-item',{hasText:lb.prompt}).first();
  await lbError.waitFor();
  assert((await lbError.textContent()).includes('Corrected'),'Improve did not show Corrected after successful lesson retry');
  log('1. Lesson wrong -> Save error -> Retry -> correct -> Improve shows Corrected');
  await shot(page,'01-desktop-error-corrected');

  // 2. VG Repair wrong -> Retry -> correct -> finish only after mastery.
  await goto(page,'lesson/VG01');
  const vg=await repairData(page,'VG01');
  assert(vg?.questions?.length,'VG01 repair data missing');
  const firstRepair=page.locator('[data-lrv="repair-option"][data-q="0"]');
  const firstValues=await firstRepair.evaluateAll(els=>els.map(e=>e.dataset.value));
  const vgWrong=firstValues.find(v=>v!==vg.questions[0].answer);
  await clickDatasetValue(firstRepair,'data-value',vgWrong);
  await page.locator('[data-lrv="repair-check"][data-q="0"]').click();
  await page.locator('.feedback.wrong').first().waitFor();
  assert(await page.locator('[data-lrv="repair-complete"]').isDisabled(),'Repair Finish enabled after a wrong guided item');
  await page.locator('[data-lrv="repair-retry"][data-q="0"]').click();
  for(let i=0;i<vg.questions.length;i++){
    await clickDatasetValue(page.locator(`[data-lrv="repair-option"][data-q="${i}"]`),'data-value',vg.questions[i].answer);
    await page.locator(`[data-lrv="repair-check"][data-q="${i}"]`).click();
    await page.waitForTimeout(80);
  }
  const finish=page.locator('[data-lrv="repair-complete"]');
  assert(!(await finish.isDisabled()),'Repair Finish did not enable after all guided items were correct');
  await finish.click();
  await page.waitForTimeout(250);
  assert((await page.locator('[data-lrv="repair-complete"]').textContent()).includes('Completed'),'Repair completion was not persisted in UI');
  log('2. VG Repair retry loop and mastery gate');
  await shot(page,'02-vg01-repair-completed');

  // 3. Mobile 390px Error Notebook -> Retry navigation / overflow / tap targets.
  await page.setViewportSize({width:390,height:844});
  await goto(page,'lesson/R01');
  const rq=await lessonQuiz(page,'R01');
  assert(rq,'R01 quiz not found');
  const rOpts=page.locator(`[data-quiz="${rq.id}"] [data-quiz-option]`);
  const rValues=await rOpts.evaluateAll(els=>els.map(e=>e.dataset.value));
  const rWrong=rValues.find(v=>v!==rq.answer);
  await clickDatasetValue(rOpts,'data-value',rWrong);
  await page.locator(`[data-check-quiz="${rq.id}"]`).click();
  await page.locator(`[data-save-error="${rq.id}"]`).click();
  await goto(page,'improve');
  const overflow=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,bodyWidth:document.body.scrollWidth}));
  assert(overflow.scrollWidth<=overflow.clientWidth+1,`390px Improve has horizontal overflow: ${overflow.scrollWidth} > ${overflow.clientWidth}`);
  const rError=page.locator('article.error-item',{hasText:rq.prompt}).first();
  const retry=rError.locator('[data-action="retry-error"]');
  await retry.scrollIntoViewIfNeeded();
  const retryBox=await retry.boundingBox();
  assert(retryBox && retryBox.width>=24 && retryBox.height>=24,`Retry tap target below WCAG 2.2 minimum: ${JSON.stringify(retryBox)}`);
  if(retryBox.height<44||retryBox.width<44) warnings.push(`390px Retry question tap target is ${Math.round(retryBox.width)}x${Math.round(retryBox.height)} px; usable and WCAG-minimum compliant, but below a 44px mobile comfort target.`);
  const mobileTargets=await page.locator('.mobile-nav button').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),w:r.width,h:r.height}}));
  assert(mobileTargets.every(x=>x.w>=24&&x.h>=24),`Mobile nav has sub-minimum target: ${JSON.stringify(mobileTargets)}`);
  await retry.click();
  await page.waitForURL(/#\/lesson\/R01$/);
  assert((await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)),'390px lesson route overflows after Error Notebook retry navigation');
  await clickDatasetValue(page.locator(`[data-quiz="${rq.id}"] [data-quiz-option]`),'data-value',rq.answer);
  await page.locator(`[data-check-quiz="${rq.id}"]`).click();
  await goto(page,'improve');
  assert((await page.locator('article.error-item',{hasText:rq.prompt}).first().textContent()).includes('Corrected'),'Mobile retry did not resolve Error Notebook item');
  log('3. Mobile 390px Error Notebook retry navigation / overflow / tap targets',{retryTap:retryBox,mobileTargets});
  await shot(page,'03-mobile-390-improve');
  await page.setViewportSize({width:1280,height:900});

  // 4. Placement + L01-L05 production audio; then one browser-voice fallback.
  const audioChecks=[{label:'Quick Placement',...placementAudio}];
  for(const id of ['L01','L02','L03','L04','L05']){
    await goto(page,`lesson/${id}`);
    audioChecks.push({label:id,...await playProductionAudio(page,id)});
  }
  log('4a. Placement + L01-L05 production audio starts from deployed MP3s',{audioChecks});

  const fallbackContext=await browser.newContext({viewport:{width:1280,height:900}});
  const fallbackPage=await fallbackContext.newPage();
  await fallbackPage.route('**/l05-predict.mp3**',r=>r.abort('failed'));
  await goto(fallbackPage,'lesson/L05');
  const fbAudio=fallbackPage.locator('audio').first();
  await fbAudio.evaluate(async a=>{a.load();try{await a.play()}catch{}});
  const fb=fallbackPage.locator('[data-listening-fallback-controls]');
  await fb.waitFor({state:'visible',timeout:15000});
  assert((await fb.textContent()).includes('Production audio unavailable'),'Fallback was not clearly labelled as production audio unavailable');
  const fbBtn=fb.locator('[data-listening-fallback-play]');
  await fbBtn.click();
  await fallbackPage.waitForTimeout(250);
  const fbText=await fb.textContent();
  assert(fbText.includes('Browser voice fallback · not production IELTS audio'),`Browser-voice fallback label missing: ${fbText}`);
  log('4b. Browser-voice fallback appears and is explicitly labelled when MP3 fails');
  await shot(fallbackPage,'04-browser-voice-fallback');
  await fallbackContext.close();

  // 5. Mini Test + Full Mock Test Mode and Error Notebook handoff.
  await goto(page,'ielts');
  const mrStart=page.locator('[data-mini-action="start"][data-test-id="MR01"]');
  await mrStart.waitFor({timeout:15000});
  await mrStart.click();
  await page.locator('[data-mini-test-player]').waitFor();
  const miniText=await page.locator('[data-mini-test-player]').textContent();
  assert(miniText.includes('No hints, transcript, answer checking, or rationale until you submit.'),'Mini Test Mode constraints missing');
  assert(await page.locator('[data-mini-test-player] .feedback').count()===0,'Mini Test leaked answer feedback before submission');
  await page.locator('[data-mini-action="submit"]').click();
  await page.locator('[data-mini-action="save-errors"]').waitFor();
  await page.locator('[data-mini-action="save-errors"]').click();
  const miniState=await page.evaluate(({a,c})=>({adaptive:JSON.parse(localStorage.getItem(a)||'{}'),core:JSON.parse(localStorage.getItem(c)||'{}')}),{a:ADAPTIVE,c:CORE});
  assert(miniState.adaptive.miniTestHistory?.some(x=>x.testId==='MR01'),'MR01 history missing after deployed submission');
  assert(miniState.core.errors?.some(e=>e.lessonId==='MR01'),'MR01 missed items did not reach Error Notebook');
  await goto(page,'improve');
  const mrItems=page.locator('article.error-item',{hasText:'MR01'});
  const mrRetries=await page.locator('article.error-item [data-action="retry-error"]').evaluateAll(els=>els.filter(e=>e.closest('article')?.textContent?.includes('MR01')).length);
  assert(mrRetries===0,'Mini Test error exposed an invalid single-question lesson retry route');

  await goto(page,'ielts');
  await page.locator('[data-mock-start="full"]').waitFor({timeout:15000});
  await page.locator('[data-mock-start="full"]').click();
  await page.locator('[data-mock-player]').waitFor();
  let mockText=await page.locator('[data-mock-player]').textContent();
  assert(mockText.includes('Audio plays once per part. Transcript and answers stay hidden until submission.'),'Full Mock Listening constraints missing');
  assert(mockText.includes('No pause, seek or replay controls.'),'Full Mock Listening replay restriction missing');
  await page.locator('[data-mock-action="submit"]').click();
  await page.waitForTimeout(250);
  mockText=await page.locator('[data-mock-player]').textContent();
  assert(mockText.includes('60 minutes · 3 passages · 40 questions. No answer checking before submission.'),'Full Mock Reading constraints missing');
  await page.locator('[data-mock-action="submit"]').click();
  await page.waitForTimeout(250);
  mockText=await page.locator('[data-mock-player]').textContent();
  assert(mockText.includes('60 minutes total · Task 1 at least 150 words · Task 2 at least 250 words.'),'Full Mock Writing constraints missing');
  await page.locator('[data-mock-action="submit"]').click();
  await page.locator('[data-mock-action="save-errors"]').waitFor();
  await page.locator('[data-mock-action="save-errors"]').click();
  const mockState=await page.evaluate(({m,c})=>({mock:JSON.parse(localStorage.getItem(m)||'{}'),core:JSON.parse(localStorage.getItem(c)||'{}')}),{m:MOCK,c:CORE});
  assert(mockState.mock.history?.some(x=>x.mode==='Full L/R/W'),'Full Mock history missing after deployed full-session submission');
  assert(mockState.core.errors?.some(e=>e.lessonId==='MA01'),'Full Mock L/R misses did not reach Error Notebook');
  await goto(page,'improve');
  const invalidMockRetry=await page.locator('[data-action="retry-error"]').evaluateAll(els=>els.some(e=>e.closest('article')?.textContent?.includes('MA01')));
  assert(!invalidMockRetry,'Full Mock error exposed an invalid single-question lesson retry route');
  log('5. Mini Test + Full Mock strict Test Mode and Error Notebook handoff');
  await shot(page,'05-test-handoff-improve');

  // 6. Export -> reset -> import -> all learner state returns.
  await goto(page,'progress');
  await page.locator('[data-local-data-tools]').waitFor({timeout:15000});
  const before=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),[CORE,ADAPTIVE,PLAN,MOCK,THEME]);
  const downloadPromise=page.waitForEvent('download');
  await page.locator('[data-data-action="export"]').click();
  const download=await downloadPromise;
  const backupPath=path.join(OUT,'learner-backup.json');
  await download.saveAs(backupPath);
  const backup=JSON.parse(await fs.readFile(backupPath,'utf8'));
  assert(backup.schemaVersion===2,'Exported backup is not schema v2');
  await page.locator('[data-data-action="reset"]').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(700);
  const afterReset=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),[CORE,ADAPTIVE,PLAN,MOCK,THEME]);
  assert(afterReset[CORE]===null&&afterReset[ADAPTIVE]===null&&afterReset[PLAN]===null&&afterReset[MOCK]===null,'Reset did not remove all learner-data keys');
  assert(afterReset[THEME]===before[THEME],'Reset unexpectedly removed theme preference');
  await goto(page,'progress');
  const input=page.locator('[data-data-import-file]');
  await input.setInputFiles(backupPath);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(900);
  const restored=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),[CORE,ADAPTIVE,PLAN,MOCK,THEME]);
  for(const k of [CORE,ADAPTIVE,PLAN,MOCK,THEME]) assert(restored[k]===before[k],`Restored ${k} does not exactly match exported state`);
  const restoredCore=JSON.parse(restored[CORE]), restoredAdaptive=JSON.parse(restored[ADAPTIVE]), restoredPlan=JSON.parse(restored[PLAN]), restoredMock=JSON.parse(restored[MOCK]);
  assert(restoredCore.placement,'Placement missing after import');
  assert(restoredCore.fixedErrors?.length>=2,'Corrected lesson errors missing after import');
  assert(restoredAdaptive.repairProgress?.VG01?.completed===true,'VG01 Repair completion missing after import');
  assert(restoredAdaptive.miniTestHistory?.some(x=>x.testId==='MR01'),'Mini Test history missing after import');
  assert(restoredMock.history?.some(x=>x.mode==='Full L/R/W'),'Full Mock history missing after import');
  assert(restoredPlan.weeks?.length===8,'Study Plan missing after import');
  log('6. Export backup -> reset -> import restores all learner state',{fixedErrors:restoredCore.fixedErrors.length,miniAttempts:restoredAdaptive.miniTestHistory.length,mockAttempts:restoredMock.history.length,planWeeks:restoredPlan.weeks.length});
  await shot(page,'06-restored-progress');

  if(pageErrors.length) throw new Error(`Browser page errors: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT,'results.json'),JSON.stringify({base:BASE,results,warnings,pageErrors},null,2));
  console.log('\nAll deployed V1.3 manual E2E scenarios passed.');
  if(warnings.length){ console.log('\nWarnings:'); warnings.forEach(w=>console.log(`- ${w}`)); }
} catch(error){
  await shot(page,'FAIL-current-page').catch(()=>{});
  await fs.writeFile(path.join(OUT,'results.json'),JSON.stringify({base:BASE,results,warnings,pageErrors,error:String(error?.stack||error)},null,2));
  console.error(error);
  process.exitCode=1;
} finally {
  await context.close();
  await browser.close();
}
