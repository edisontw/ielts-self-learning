import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-listening-conditional-outcome');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = 'c39232b3bfb847feb517ce2199c6cd3004ac3b47';
const results = [];
const pageErrors = [];

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const pass = (name, detail = {}) => { results.push({ name, status:'PASS', ...detail }); console.log(`✓ ${name}`); };
const shot = async (page, name) => page.screenshot({ path:path.join(OUT, `${name}.png`), fullPage:true });

async function openRoute(page, route, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await page.goto(`${BASE}#/${route}`, { waitUntil:'domcontentloaded', timeout:20000 });
      const status = response?.status() || 0;
      if (status >= 500) throw new Error(`production returned HTTP ${status}`);
      await page.waitForSelector('#main', { timeout:15000 });
      await page.waitForTimeout(800);
      const text = await page.locator('#main').textContent();
      assert(!text?.includes('The page could not start normally.'), `${route} showed boot recovery`);
      assert(!text?.includes('Lesson not found'), `${route} showed Lesson not found`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      console.log(`production navigation retry ${attempt}/${attempts}: ${route} — ${String(error.message || error)}`);
      await page.waitForTimeout(1000 * attempt);
    }
  }
  throw lastError;
}

async function resetState(page, adaptive = {}) {
  await openRoute(page, 'today');
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
  await openRoute(page, 'today');
}

async function selectMiniStage(page) {
  const tab = page.locator('button[data-ielts-stage="mini"]');
  await tab.waitFor({ timeout:15000 });
  if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
  await page.locator('[data-mini-test-index]').waitFor({ state:'visible', timeout:15000 });
}

async function runUnansweredMiniTestAndSave(page, testId, questionId, expectedTag) {
  await openRoute(page, 'ielts');
  await selectMiniStage(page);
  const start = page.locator(`[data-mini-action="start"][data-test-id="${testId}"]`).first();
  await start.waitFor({ timeout:15000 });
  await start.click();
  await page.locator('[data-mini-test-player]').waitFor({ timeout:15000 });
  await page.locator('[data-mini-action="submit"]').click();
  await page.locator('[data-mini-action="save-errors"]').waitFor({ timeout:15000 });
  const resultText = await page.locator('[data-mini-test-player]').textContent();
  assert(resultText?.includes(expectedTag), `${testId} result did not display ${expectedTag}`);
  assert(!resultText?.includes('listening-final-meaning'), `${testId} result still displayed coarse listening-final-meaning`);
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
    const card = [...document.querySelectorAll('#main .error-item')].find(item => (item.textContent || '').includes(error.question || ''));
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

  const direct = await page.evaluate(async () => {
    const mod = await import('./listening-sequence-semantics-v16.js');
    return {
      ml02: mod.normalizedMiniTestErrorTag({ questionId:'ML02-Q9', errorTag:'listening-final-meaning' }),
      ml04: mod.normalizedMiniTestErrorTag({ questionId:'ML04-Q10', errorTag:'listening-final-meaning' }),
      unknown: mod.normalizedMiniTestErrorTag({ questionId:'UNKNOWN', errorTag:'listening-final-meaning' })
    };
  });
  assert(direct.ml02==='listening-conditional-outcome'&&direct.ml04==='listening-conditional-outcome','deployed normalizer did not map both audited questions');
  assert(direct.unknown==='listening-final-meaning','unknown legacy final-meaning evidence was guessed');
  pass('V1.6-COND-A deployed normalizer maps the two audited final-meaning questions to listening-conditional-outcome and preserves the unknown guardrail');

  const ml02 = await runUnansweredMiniTestAndSave(page, 'ML02', 'ML02-Q9', 'listening-conditional-outcome');
  pass('V1.6-COND-B actual ML02-Q9 result and saved Error Notebook evidence use listening-conditional-outcome', { savedTag:ml02.errorTag });
  await shot(page, 'v16-cond-b-ml02-result');
  await page.locator('[data-mini-action="exit"]').click();
  await page.waitForTimeout(900);

  const ml04 = await runUnansweredMiniTestAndSave(page, 'ML04', 'ML04-Q10', 'listening-conditional-outcome');
  pass('V1.6-COND-C actual ML04-Q10 result and saved Error Notebook evidence use listening-conditional-outcome', { savedTag:ml04.errorTag });
  await shot(page, 'v16-cond-c-ml04-result');
  await page.locator('[data-mini-action="exit"]').click();
  await page.waitForTimeout(900);

  await openRoute(page, 'improve');
  const ml02Card = await errorCardState(page, 'ML02-Q9');
  const ml04Card = await errorCardState(page, 'ML04-Q10');
  assert(ml02Card?.cardFound&&!ml02Card.hasRetry&&!ml02Card.hasExistingRoute,`ML02-Q9 gained a fake Retry or route: ${JSON.stringify(ml02Card)}`);
  assert(ml04Card?.cardFound&&!ml04Card.hasRetry&&!ml04Card.hasExistingRoute,`ML04-Q10 gained a fake Retry or route: ${JSON.stringify(ml04Card)}`);
  const improveText = await page.locator('#main').textContent();
  assert(!improveText?.includes('LR02'),'A new LR Repair appeared for two-form conditional-outcome evidence');
  pass('V1.6-COND-D Improve preserves Test boundaries: no single-question Retry, existing-practice CTA, or new LR Repair for the two-form family');
  await shot(page, 'v16-cond-d-improve-no-route');

  await openRoute(page, 'lesson/L04');
  const l04Text = await page.locator('#main').textContent();
  assert(l04Text?.includes('conditional option'),'L04 no longer exposes conditional-option teaching');
  assert(l04Text?.includes('FINAL meaning'),'L04 no longer exposes FINAL-meaning teaching');
  pass('V1.6-COND-E L04 remains the deployed exact teaching owner for conditional-option final meaning');
  await shot(page, 'v16-cond-e-l04-owner');

  const legacyHistory = [
    { id:'legacy-ml04', ts:200, testId:'ML04', skill:'listening', correct:9, total:10, missedErrorTags:{'listening-final-meaning':1} },
    { id:'legacy-ml02', ts:100, testId:'ML02', skill:'listening', correct:9, total:10, missedErrorTags:{'listening-final-meaning':1} }
  ];
  await resetState(page, { miniTestHistory:legacyHistory });
  await openRoute(page, 'ielts');
  await selectMiniStage(page);
  const trends = page.locator('[data-mini-test-trends]');
  await trends.waitFor({ timeout:15000 });
  const trendText = await trends.textContent();
  assert(trendText?.includes('listening-conditional-outcome'),`legacy trend did not normalize to conditional-outcome: ${trendText}`);
  assert(trendText?.includes('(2/2 recent forms)'),`conditional-outcome was not retained as genuine two-form recurrence: ${trendText}`);
  assert(!trendText?.includes('listening-final-meaning'),`coarse final-meaning label remains learner-facing: ${trendText}`);
  await openRoute(page, 'learn');
  await openRoute(page, 'ielts');
  await selectMiniStage(page);
  const rerenderText = await page.locator('[data-mini-test-trends]').textContent();
  assert(rerenderText?.includes('listening-conditional-outcome')&&rerenderText?.includes('(2/2 recent forms)'),'conditional-outcome trend disappeared after rerender');
  assert(!rerenderText?.includes('listening-final-meaning'),'coarse final-meaning label returned after rerender');
  pass('V1.6-COND-F legacy two-form history normalizes to listening-conditional-outcome and survives production rerender');
  await shot(page, 'v16-cond-f-legacy-trend');

  assert(pageErrors.length===0, `Deployed conditional-outcome page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-listening-conditional-outcome.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 Listening conditional-outcome deployed QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-listening-conditional-outcome.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-cond-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
