import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-batch5');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = 'fccd370ef596ae3b272ecfd1f40ee331f91d624d';
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
        { id:'qa-b5-tfng', ts:now, questionId:'MR01-Q1', lessonId:'MR01', skill:'reading', errorTag:'reading-evidence', question:'Batch 5 TFNG evidence deployed QA', myAnswer:'FALSE', correctAnswer:'TRUE', rationale:'QA' },
        { id:'qa-b5-mcq', ts:now, questionId:'MR03-Q5', lessonId:'MR03', skill:'reading', errorTag:'reading-evidence', question:'Batch 5 MCQ evidence deployed QA', myAnswer:'B', correctAnswer:'A', rationale:'QA' },
        { id:'qa-b5-unknown', ts:now, questionId:'UNKNOWN-EVIDENCE', lessonId:'MR99', skill:'reading', errorTag:'reading-evidence', question:'Batch 5 unknown evidence control', myAnswer:'A', correctAnswer:'B', rationale:'QA' },
        { id:'qa-b5-core', ts:now, questionId:'R04-Q3', lessonId:'R04', skill:'reading', errorTag:'reading-evidence', question:'Restoring urban wetlands can reduce the load on city drainage infrastructure after heavy rain.', myAnswer:'FALSE', correctAnswer:'TRUE', rationale:'QA' },
        { id:'qa-b5-inference', ts:now, questionId:'MA01-R05', lessonId:'MA01', skill:'reading', errorTag:'inference', question:'Batch 5 RR02 inference control', myAnswer:'A', correctAnswer:'B', rationale:'QA' }
      ],
      fixedErrors:[],
      lessonAnswers:{
        'MR01-Q1':{ selected:'FALSE', checked:true },
        'MR03-Q5':{ selected:'B', checked:true },
        'R04-Q3':{ selected:'FALSE', checked:true }
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
  assert(families['reading-evidence-tfng']?.match === '1 active match', `TFNG subtype aggregation wrong: ${JSON.stringify(families['reading-evidence-tfng'])}`);
  assert(families['reading-evidence-tfng']?.text.includes('R04 → QR01'), `TFNG subtype route wrong: ${JSON.stringify(families['reading-evidence-tfng'])}`);
  assert(families['reading-evidence-mcq']?.match === '1 active match', `MCQ subtype aggregation wrong: ${JSON.stringify(families['reading-evidence-mcq'])}`);
  assert(families['reading-evidence-mcq']?.text.includes('R02 → QR03'), `MCQ subtype route wrong: ${JSON.stringify(families['reading-evidence-mcq'])}`);
  pass('V1.6-B5-A deployed Improve separates TFNG and MCQ Reading evidence routes', { families });
  await shot(page, 'v16-b5-a-improve-subtypes');

  const tfng = await errorCardState(page, 'Batch 5 TFNG evidence deployed QA');
  const mcq = await errorCardState(page, 'Batch 5 MCQ evidence deployed QA');
  const unknown = await errorCardState(page, 'Batch 5 unknown evidence control');
  assert(tfng?.hasExistingRoute && tfng.routeText.includes('Review R04') && tfng.routeText.includes('Practise QR01'), `TFNG evidence card route wrong: ${JSON.stringify(tfng)}`);
  assert(mcq?.hasExistingRoute && mcq.routeText.includes('Review R02') && mcq.routeText.includes('Practise QR03'), `MCQ evidence card route wrong: ${JSON.stringify(mcq)}`);
  assert(unknown && !unknown.hasExistingRoute, `Unknown evidence was guessed into a route: ${JSON.stringify(unknown)}`);
  assert(!tfng.hasRetry && !mcq.hasRetry, 'Mini Test evidence exposed fake single-question Retry');
  pass('V1.6-B5-B old-format saved errors route by stable questionId while unknown evidence stays unrouted');
  await shot(page, 'v16-b5-b-error-notebook');

  const core = await errorCardState(page, 'Restoring urban wetlands can reduce the load on city drainage infrastructure after heavy rain.');
  const inference = await errorCardState(page, 'Batch 5 RR02 inference control');
  assert(core?.hasRetry, `Core R04 evidence lost direct Retry: ${JSON.stringify(core)}`);
  assert(!core?.hasExistingRoute, `Core R04 evidence got a competing reuse route: ${JSON.stringify(core)}`);
  assert(inference && !inference.hasExistingRoute, `RR02 inference was duplicated into reuse routing: ${JSON.stringify(inference)}`);
  pass('V1.6-B5-C Core direct Retry and RR02 ownership remain higher-priority contracts');
  await shot(page, 'v16-b5-c-priority-contracts');

  await goto(page, 'learn');
  await goto(page, 'improve');
  for (const question of ['Batch 5 TFNG evidence deployed QA','Batch 5 MCQ evidence deployed QA']) {
    const card = await errorCardState(page, question);
    assert(card && !card.hasRetry, `${question}: Mini Test became falsely retriable after rerender: ${JSON.stringify(card)}`);
    assert(card.hasExistingRoute, `${question}: subtype route disappeared after rerender: ${JSON.stringify(card)}`);
  }
  pass('V1.6-B5-D Mini Test Test Mode boundary survives production registry rerender');
  await shot(page, 'v16-b5-d-test-mode-boundary');

  let card = errorCardLocator(page, 'Batch 5 TFNG evidence deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="QR01"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QR01');
  await page.waitForTimeout(700);
  assert((await page.locator('#main').textContent()).includes('Question Type Lab: True / False / Not Given'), 'QR01 evidence transfer did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'Batch 5 MCQ evidence deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="QR03"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QR03');
  await page.waitForTimeout(700);
  assert((await page.locator('#main').textContent()).includes('Question Type Lab: Reading Multiple Choice'), 'QR03 evidence transfer did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'Batch 5 TFNG evidence deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="R04"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/R04');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes('True, False or Not Given?'), 'R04 evidence review did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'Batch 5 MCQ evidence deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="R02"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/R02');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes('Read for Structure, Not Just Words'), 'R02 evidence review did not render');
  pass('V1.6-B5-E deployed R04/QR01 and R02/QR03 destinations all render successfully');
  await shot(page, 'v16-b5-e-route-navigation');

  assert(pageErrors.length === 0, `Deployed V1.6 Batch 5 page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-batch5.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 Batch 5 deployed routing QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-batch5.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-b5-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
