import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-reading-definition-split');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = '4c4eb01fb854df0f16a9905c019762575d2704bb';
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

async function goto(page, route) {
  await openRoute(page, route);
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
  await goto(page, 'ielts');
  await selectMiniStage(page);
  const start = page.locator(`[data-mini-action="start"][data-test-id="${testId}"]`).first();
  await start.waitFor({ timeout:15000 });
  await start.click();
  await page.locator('[data-mini-test-player]').waitFor({ timeout:15000 });
  await page.locator('[data-mini-action="submit"]').click();
  await page.locator('[data-mini-action="save-errors"]').waitFor({ timeout:15000 });

  const resultText = await page.locator('[data-mini-test-player]').textContent();
  assert(resultText?.includes(expectedTag), `${testId} result review did not display normalized ${expectedTag}`);
  assert(!resultText?.includes('reading-definition'), `${testId} still displayed heterogeneous reading-definition umbrella`);

  await page.locator('[data-mini-action="save-errors"]').click();
  await page.waitForTimeout(300);
  const saved = await page.evaluate(({ coreKey, qid }) => {
    const core = JSON.parse(localStorage.getItem(coreKey) || '{}');
    return (core.errors || []).find(error => error.questionId === qid) || null;
  }, { coreKey:CORE, qid:questionId });
  assert(saved?.errorTag === expectedTag, `${questionId} saved ${saved?.errorTag || 'no tag'} instead of ${expectedTag}`);
  return saved;
}

async function trendText(page) {
  await goto(page, 'ielts');
  await selectMiniStage(page);
  const trends = page.locator('[data-mini-test-trends]');
  await trends.waitFor({ timeout:15000 });
  return (await trends.textContent()) || '';
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
      mr02: mod.normalizedMiniTestErrorTag({ questionId:'MR02-Q4', errorTag:'reading-definition' }),
      mr04: mod.normalizedMiniTestErrorTag({ questionId:'MR04-Q4', errorTag:'reading-definition' }),
      legacy02: mod.normalizedMiniTestErrorTag({ testId:'MR02', errorTag:'reading-definition' }),
      legacy04: mod.normalizedMiniTestErrorTag({ testId:'MR04', errorTag:'reading-definition' }),
      unknown: mod.normalizedMiniTestErrorTag({ questionId:'UNKNOWN', errorTag:'reading-definition' })
    };
  });
  assert(direct.mr02==='reading-explicit-definition' && direct.legacy02==='reading-explicit-definition', `MR02 production normalizer mismatch: ${JSON.stringify(direct)}`);
  assert(direct.mr04==='reading-distinction' && direct.legacy04==='reading-distinction', `MR04 production normalizer mismatch: ${JSON.stringify(direct)}`);
  assert(direct.unknown==='reading-definition', `Unknown Reading definition history was guessed: ${JSON.stringify(direct)}`);
  pass('V1.6-RDEF-A deployed normalizer splits MR02 explicit definition from MR04 concept distinction and preserves unknown guardrail', direct);

  const mr02 = await runUnansweredMiniTestAndSave(page, 'MR02', 'MR02-Q4', 'reading-explicit-definition');
  pass('V1.6-RDEF-B actual MR02-Q4 result and saved Error Notebook evidence use reading-explicit-definition', { savedTag:mr02.errorTag });
  await shot(page, 'v16-rdef-b-mr02-explicit-definition');

  await resetState(page);
  const mr04 = await runUnansweredMiniTestAndSave(page, 'MR04', 'MR04-Q4', 'reading-distinction');
  pass('V1.6-RDEF-C actual MR04-Q4 result and saved Error Notebook evidence use reading-distinction', { savedTag:mr04.errorTag });
  await shot(page, 'v16-rdef-c-mr04-distinction');

  const legacyReadingHistory = [
    { id:'legacy-mr04', ts:400, testId:'MR04', skill:'reading', correct:11, total:12, missedErrorTags:{'reading-definition':1} },
    { id:'legacy-mr02', ts:200, testId:'MR02', skill:'reading', correct:11, total:12, missedErrorTags:{'reading-definition':1} }
  ];
  await resetState(page, { miniTestHistory:legacyReadingHistory });
  const legacyReadingText = await trendText(page);
  assert(!legacyReadingText.includes('reading-definition'), `Legacy umbrella Reading definition still appears recurring: ${legacyReadingText}`);
  assert(!legacyReadingText.includes('reading-explicit-definition'), `One-form explicit-definition was falsely marked recurring: ${legacyReadingText}`);
  assert(!legacyReadingText.includes('reading-distinction'), `One-form distinction was falsely marked recurring: ${legacyReadingText}`);
  pass('V1.6-RDEF-D legacy MR02/MR04 reading-definition history no longer creates false two-form recurrence');
  await shot(page, 'v16-rdef-d-legacy-reading-no-false-recurrence');

  const finalMeaningHistory = [
    { id:'fm4', ts:400, testId:'ML04', skill:'listening', correct:9, total:10, missedErrorTags:{'listening-final-meaning':1} },
    { id:'fm2', ts:200, testId:'ML02', skill:'listening', correct:9, total:10, missedErrorTags:{'listening-final-meaning':1} }
  ];
  await resetState(page, { miniTestHistory:finalMeaningHistory });
  const finalMeaningText = await trendText(page);
  assert(finalMeaningText.includes('listening-final-meaning'), `Unrelated two-form final-meaning recurrence disappeared: ${finalMeaningText}`);
  assert(finalMeaningText.includes('(2/2 recent forms)'), `Final-meaning recurrence did not remain two-form evidence: ${finalMeaningText}`);
  pass('V1.6-RDEF-E listening-final-meaning remains an unchanged two-form watch signal; normalization did not overreach');
  await shot(page, 'v16-rdef-e-final-meaning-watch-preserved');

  await goto(page, 'learn');
  const rerenderText = await trendText(page);
  assert(rerenderText.includes('listening-final-meaning') && rerenderText.includes('(2/2 recent forms)'), 'Unrelated trend evidence disappeared after Learn → IELTS rerender');
  assert(!rerenderText.includes('reading-definition'), 'Reading definition umbrella reappeared after route rerender');
  pass('V1.6-RDEF-F semantic normalization and unrelated trends remain stable after production rerender');
  await shot(page, 'v16-rdef-f-rerender-stable');

  assert(pageErrors.length===0, `Deployed Reading definition split page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-reading-definition-split.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 Reading definition split deployed QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-reading-definition-split.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-rdef-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
