import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-post-batch5');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = '27a685cc6a5d4c5f98bf06fe9dbe5e93d1ca77f1';
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

async function errorCardState(page, questionText) {
  return page.evaluate(text => {
    const card = [...document.querySelectorAll('#main .error-item')].find(item => (item.textContent || '').includes(text));
    if (!card) return null;
    const route = card.querySelector('[data-v16-existing-practice-error-route]');
    return {
      text:card.textContent || '',
      hasRetry:Boolean(card.querySelector('[data-action="retry-error"]')),
      hasExistingRoute:Boolean(route),
      routeText:route?.textContent || ''
    };
  }, questionText);
}

function errorCardLocator(page, questionText) {
  return page.locator('#main .error-item').filter({ hasText:questionText }).first();
}

async function improveFamilyState(page) {
  const surface = page.locator('[data-v16-existing-practice-improve]');
  await surface.waitFor({ timeout:15000 });
  return surface.evaluate(root => Object.fromEntries([...root.querySelectorAll('[data-existing-practice-family]')].map(card => {
    const family = card.dataset.existingPracticeFamily;
    const chips = [...card.querySelectorAll('.chip')].map(x => x.textContent.trim());
    return [family, { text:card.textContent || '', match:chips.find(x => x.includes('active match')) || '' }];
  })));
}

await fs.mkdir(OUT, { recursive:true });
const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1280, height:900 } });
const page = await context.newPage();
page.on('pageerror', error => pageErrors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') console.log(`console.error: ${message.text()}`); });

try {
  await page.goto(`${BASE}#/today`, { waitUntil:'domcontentloaded' });
  await page.waitForSelector('#main', { timeout:20000 });
  await page.evaluate(({ coreKey, adaptiveKey, guideKey }) => {
    localStorage.clear();
    localStorage.setItem(guideKey, 'true');
    const now = Date.now();
    localStorage.setItem(coreKey, JSON.stringify({
      errors:[
        { id:'qa-pb5-structure-mi', ts:now, questionId:'MR01-Q10', lessonId:'MR01', skill:'reading', errorTag:'reading-structure', question:'Post-Batch5 Matching Information structure deployed QA', myAnswer:'Paragraph 2', correctAnswer:'Paragraph 3', rationale:'QA' },
        { id:'qa-pb5-structure-mcq', ts:now, questionId:'MA01-R08', lessonId:'MA01', skill:'reading', errorTag:'structure', question:'Post-Batch5 MCQ structure deployed QA', myAnswer:'To prove cool roofs are ineffective', correctAnswer:'To show alternative or complementary heat strategies', rationale:'QA' },
        { id:'qa-pb5-structure-unknown', ts:now, questionId:'UNKNOWN-STRUCTURE', lessonId:'MR99', skill:'reading', errorTag:'reading-structure', question:'Post-Batch5 unknown structure control', myAnswer:'A', correctAnswer:'B', rationale:'QA' },
        { id:'qa-pb5-core-structure', ts:now, questionId:'R02-Q3', lessonId:'R02', skill:'reading', errorTag:'reading-structure', question:'Post-Batch5 Core structure direct-Retry control', myAnswer:'Adding another unrelated example', correctAnswer:'Drawing a conclusion from the limitation', rationale:'QA' },
        { id:'qa-pb5-attitude', ts:now, questionId:'QL04-Q2', lessonId:'QL04', skill:'listening', errorTag:'listening-attitude', question:'Post-Batch5 Listening attitude direct-Retry control', myAnswer:'A', correctAnswer:'C', rationale:'QA' },
        { id:'qa-pb5-word-limit', ts:now, questionId:'QR04-Q1', lessonId:'QR04', skill:'reading', errorTag:'reading-word-limit', question:'Post-Batch5 Reading word-limit direct-Retry control', myAnswer:'new reflective coating', correctAnswer:'reflective coating', rationale:'QA' }
      ],
      fixedErrors:[],
      lessonAnswers:{
        'R02-Q3':{ selected:'Adding another unrelated example', checked:true },
        'QL04-Q2':{ selected:'A', checked:true },
        'QR04-Q1':{ selected:'new reflective coating', checked:true }
      },
      studyHistory:[], completedLessons:[],
      profile:{ targetBand:7, placementSections:{ vocabulary:3, grammar:3, reading:3, listening:3 }, recommendedDifficulty:3 },
      study:{ preferredMinutes:20 }, ui:{ chineseHelp:false }
    }));
    localStorage.setItem(adaptiveKey, JSON.stringify({ repairProgress:{}, learningHistory:[], reviewSchedule:{} }));
  }, { coreKey:CORE, adaptiveKey:ADAPTIVE, guideKey:GUIDE });

  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#main', { timeout:20000 });
  await page.waitForTimeout(900);

  await goto(page, 'improve');
  const families = await improveFamilyState(page);
  assert(families['reading-structure-matching-information']?.match === '1 active match', `Matching Information structure aggregation wrong: ${JSON.stringify(families['reading-structure-matching-information'])}`);
  assert(families['reading-structure-matching-information']?.text.includes('R02 → QR05'), `Matching Information structure route wrong: ${JSON.stringify(families['reading-structure-matching-information'])}`);
  assert(families['reading-structure-mcq']?.match === '1 active match', `MCQ structure aggregation wrong: ${JSON.stringify(families['reading-structure-mcq'])}`);
  assert(families['reading-structure-mcq']?.text.includes('R02 → QR03'), `MCQ structure route wrong: ${JSON.stringify(families['reading-structure-mcq'])}`);
  pass('V1.6-PB5-A deployed Improve separates Reading structure Matching Information and MCQ routes', { families });
  await shot(page, 'v16-pb5-a-improve-structure-subtypes');

  const matchingInfo = await errorCardState(page, 'Post-Batch5 Matching Information structure deployed QA');
  const mcq = await errorCardState(page, 'Post-Batch5 MCQ structure deployed QA');
  const unknown = await errorCardState(page, 'Post-Batch5 unknown structure control');
  assert(matchingInfo?.hasExistingRoute && matchingInfo.routeText.includes('Review R02') && matchingInfo.routeText.includes('Practise QR05'), `Matching Information structure card route wrong: ${JSON.stringify(matchingInfo)}`);
  assert(mcq?.hasExistingRoute && mcq.routeText.includes('Review R02') && mcq.routeText.includes('Practise QR03'), `MCQ structure card route wrong: ${JSON.stringify(mcq)}`);
  assert(unknown && !unknown.hasExistingRoute, `Unknown structure was guessed into a route: ${JSON.stringify(unknown)}`);
  assert(!matchingInfo.hasRetry && !mcq.hasRetry, 'Mini Test / Full Mock structure exposed fake single-question Retry');
  pass('V1.6-PB5-B stable questionId routes both transfer subtypes while unknown structure stays unrouted');
  await shot(page, 'v16-pb5-b-error-notebook-structure');

  const core = await errorCardState(page, 'Post-Batch5 Core structure direct-Retry control');
  const attitude = await errorCardState(page, 'Post-Batch5 Listening attitude direct-Retry control');
  const wordLimit = await errorCardState(page, 'Post-Batch5 Reading word-limit direct-Retry control');
  assert(core?.hasRetry && !core.hasExistingRoute, `Core R02 structure priority wrong: ${JSON.stringify(core)}`);
  assert(attitude?.hasRetry && !attitude.hasExistingRoute, `Listening attitude was given a synthetic reuse route: ${JSON.stringify(attitude)}`);
  assert(wordLimit?.hasRetry && !wordLimit.hasExistingRoute, `Reading word-limit was given a synthetic reuse route: ${JSON.stringify(wordLimit)}`);
  pass('V1.6-PB5-C direct Retry remains stronger and intentionally deferred families do not gain synthetic reuse CTAs');
  await shot(page, 'v16-pb5-c-priority-and-deferred-controls');

  await goto(page, 'learn');
  await goto(page, 'improve');
  for (const question of ['Post-Batch5 Matching Information structure deployed QA','Post-Batch5 MCQ structure deployed QA']) {
    const card = await errorCardState(page, question);
    assert(card && !card.hasRetry, `${question}: Test/Mock error became falsely retriable after rerender: ${JSON.stringify(card)}`);
    assert(card.hasExistingRoute, `${question}: subtype route disappeared after rerender: ${JSON.stringify(card)}`);
  }
  pass('V1.6-PB5-D Mini Test / Full Mock boundary and subtype routes survive production rerender');
  await shot(page, 'v16-pb5-d-rerender-boundary');

  let card = errorCardLocator(page, 'Post-Batch5 Matching Information structure deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="QR05"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QR05');
  await page.waitForTimeout(700);
  assert((await page.locator('#main').textContent()).includes('Question Type Lab: Matching Information'), 'QR05 structure transfer did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'Post-Batch5 MCQ structure deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="QR03"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QR03');
  await page.waitForTimeout(700);
  assert((await page.locator('#main').textContent()).includes('Question Type Lab: Reading Multiple Choice'), 'QR03 structure transfer did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'Post-Batch5 Matching Information structure deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="R02"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/R02');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes('Read for Structure, Not Just Words'), 'R02 structure review did not render');
  pass('V1.6-PB5-E deployed R02 / QR05 / QR03 route destinations render successfully');
  await shot(page, 'v16-pb5-e-route-navigation');

  assert(pageErrors.length === 0, `Deployed V1.6 post-Batch5 page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-post-batch5.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 post-Batch5 deployed routing QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-post-batch5.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-pb5-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
