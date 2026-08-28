import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-listening-sequence-split');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = '2af534688a2cf90a758f070c34fd153331195b15';
const results = [];
const pageErrors = [];

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const pass = (name, detail = {}) => { results.push({ name, status:'PASS', ...detail }); console.log(`✓ ${name}`); };
const shot = async (page, name) => page.screenshot({ path:path.join(OUT, `${name}.png`), fullPage:true });

async function goto(page, route) {
  await page.goto(`${BASE}#/${route}`, { waitUntil:'domcontentloaded' });
  await page.waitForSelector('#main', { timeout:20000 });
  await page.waitForTimeout(900);
  const text = await page.locator('#main').textContent();
  assert(!text?.includes('The page could not start normally.'), `${route} showed boot recovery`);
  assert(!text?.includes('Lesson not found'), `${route} showed Lesson not found`);
}

async function resetState(page, adaptive = {}) {
  await page.goto(`${BASE}#/today`, { waitUntil:'domcontentloaded' });
  await page.waitForSelector('#main', { timeout:20000 });
  await page.evaluate(({ coreKey, adaptiveKey, guideKey, adaptiveValue }) => {
    localStorage.clear();
    localStorage.setItem(guideKey, 'true');
    localStorage.setItem(coreKey, JSON.stringify({
      errors:[], fixedErrors:[], lessonAnswers:{}, studyHistory:[], completedLessons:[],
      profile:{ targetBand:7, placementSections:{ vocabulary:3, grammar:3, reading:3, listening:3 }, recommendedDifficulty:3 },
      study:{ preferredMinutes:20 }, ui:{ chineseHelp:false }
    }));
    localStorage.setItem(adaptiveKey, JSON.stringify({ repairProgress:{}, learningHistory:[], reviewSchedule:{}, ...adaptiveValue }));
  }, { coreKey:CORE, adaptiveKey:ADAPTIVE, guideKey:GUIDE, adaptiveValue:adaptive });
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#main', { timeout:20000 });
  await page.waitForTimeout(800);
}

async function runUnansweredMiniTestAndSave(page, testId, questionId, expectedTag) {
  await goto(page, 'ielts');
  const start = page.locator(`[data-mini-action="start"][data-test-id="${testId}"]`).first();
  await start.waitFor({ timeout:15000 });
  await start.click();
  await page.locator('[data-mini-test-player]').waitFor({ timeout:15000 });
  await page.locator('[data-mini-action="submit"]').click();
  await page.locator('[data-mini-action="save-errors"]').waitFor({ timeout:15000 });

  const resultText = await page.locator('[data-mini-test-player]').textContent();
  assert(resultText?.includes(expectedTag), `${testId} result review did not display normalized ${expectedTag}`);
  await page.locator('[data-mini-action="save-errors"]').click();
  await page.waitForTimeout(300);

  const saved = await page.evaluate(({ coreKey, qid }) => {
    const core = JSON.parse(localStorage.getItem(coreKey) || '{}');
    return (core.errors || []).find(error => error.questionId === qid) || null;
  }, { coreKey:CORE, qid:questionId });
  assert(saved?.errorTag === expectedTag, `${questionId} saved ${saved?.errorTag || 'no tag'} instead of ${expectedTag}`);
  return saved;
}

async function errorCardState(page, questionId) {
  return page.evaluate(qid => {
    const core = JSON.parse(localStorage.getItem('ielts-self-learning-v1') || '{}');
    const error = (core.errors || []).find(row => row.questionId === qid);
    if (!error) return null;
    const marker = document.querySelector(`[data-error-id="${CSS.escape(error.id)}"]`);
    const card = marker?.closest('.error-item');
    if (!card) return { error, cardFound:false };
    return {
      error,
      cardFound:true,
      hasRetry:Boolean(card.querySelector('[data-action="retry-error"]')),
      hasExistingRoute:Boolean(card.querySelector('[data-v16-existing-practice-error-route]')),
      text:card.textContent || ''
    };
  }, questionId);
}

await fs.mkdir(OUT, { recursive:true });
const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1280, height:900 } });
const page = await context.newPage();
page.on('pageerror', error => pageErrors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') console.log(`console.error: ${message.text()}`); });

try {
  await resetState(page);

  const ml02 = await runUnansweredMiniTestAndSave(page, 'ML02', 'ML02-Q4', 'listening-spatial-sequence');
  pass('V1.6-SEQ-A ML02-Q4 result and new Error Notebook evidence use listening-spatial-sequence', { savedTag:ml02.errorTag });
  await shot(page, 'v16-seq-a-ml02-spatial-result');

  await page.locator('[data-mini-action="exit"]').click();
  await page.waitForTimeout(500);
  const ml04 = await runUnansweredMiniTestAndSave(page, 'ML04', 'ML04-Q3', 'listening-procedural-sequence');
  pass('V1.6-SEQ-B ML04-Q3 result and new Error Notebook evidence use listening-procedural-sequence', { savedTag:ml04.errorTag });
  await shot(page, 'v16-seq-b-ml04-procedural-result');

  await page.locator('[data-mini-action="exit"]').click();
  await page.waitForTimeout(500);
  await goto(page, 'improve');
  const spatialCard = await errorCardState(page, 'ML02-Q4');
  const proceduralCard = await errorCardState(page, 'ML04-Q3');
  assert(spatialCard?.cardFound && !spatialCard.hasRetry && !spatialCard.hasExistingRoute, `ML02-Q4 gained a fake Retry or synthetic Core→Lab route: ${JSON.stringify(spatialCard)}`);
  assert(proceduralCard?.cardFound && !proceduralCard.hasRetry && !proceduralCard.hasExistingRoute, `ML04-Q3 gained a fake Retry or synthetic route: ${JSON.stringify(proceduralCard)}`);
  const improveText = await page.locator('#main').textContent();
  assert(!improveText?.includes('LR02'), 'LR02 appeared in deployed Improve despite subthreshold split evidence');
  pass('V1.6-SEQ-C Error Notebook preserves Mini Test boundary and creates neither synthetic sequence route nor LR02');
  await shot(page, 'v16-seq-c-improve-no-lr02');

  await goto(page, 'lesson/QL03');
  const ql03Text = await page.locator('#main').textContent();
  assert(ql03Text?.includes('Question Type Lab: Map & Plan Labelling'), 'QL03 direct teaching owner did not render');
  assert(ql03Text?.includes('Track movement from a fixed starting point'), 'QL03 deployed objective does not expose spatial tracking teaching');
  pass('V1.6-SEQ-D QL03 remains the deployed direct teaching owner for spatial route tracking');
  await shot(page, 'v16-seq-d-ql03-owner');

  const legacyHistory = [
    { id:'legacy-ml04', ts:300, testId:'ML04', skill:'listening', correct:9, total:10, missedErrorTags:{'listening-sequence':1} },
    { id:'legacy-ml03', ts:200, testId:'ML03', skill:'listening', correct:9, total:10, missedErrorTags:{'listening-sequence':1} },
    { id:'legacy-ml02', ts:100, testId:'ML02', skill:'listening', correct:9, total:10, missedErrorTags:{'listening-sequence':1} }
  ];
  await resetState(page, { miniTestHistory:legacyHistory });
  await goto(page, 'ielts');
  const trends = page.locator('[data-mini-test-trends]');
  await trends.waitFor({ timeout:15000 });
  const trendText = await trends.textContent();
  assert(trendText?.includes('listening-spatial-sequence'), `Legacy history did not normalize to spatial sequence: ${trendText}`);
  assert(trendText?.includes('(2/3 recent forms)'), `Spatial recurrence was not limited to ML02/ML03 two-form evidence: ${trendText}`);
  assert(!trendText?.includes('listening-procedural-sequence'), `Single ML04 procedural signal was falsely shown as recurring: ${trendText}`);
  assert(!/\blistening-sequence\b/.test(trendText || ''), `Historical umbrella sequence still appears as a recurring trend: ${trendText}`);
  pass('V1.6-SEQ-E legacy ML02/ML03/ML04 umbrella history normalizes to 2-form spatial recurrence only');
  await shot(page, 'v16-seq-e-legacy-trend-normalized');

  await goto(page, 'learn');
  await goto(page, 'ielts');
  const rerenderTrendText = await page.locator('[data-mini-test-trends]').textContent();
  assert(rerenderTrendText?.includes('listening-spatial-sequence') && rerenderTrendText?.includes('(2/3 recent forms)'), 'Normalized spatial trend disappeared after Learn → IELTS rerender');
  assert(!rerenderTrendText?.includes('listening-procedural-sequence') && !/\blistening-sequence\b/.test(rerenderTrendText || ''), 'Heterogeneous sequence returned after rerender');
  pass('V1.6-SEQ-F semantic split and legacy normalization survive production rerender');
  await shot(page, 'v16-seq-f-rerender-stable');

  assert(pageErrors.length === 0, `Deployed sequence split page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-listening-sequence-split.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 Listening sequence split deployed QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-listening-sequence-split.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-seq-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
