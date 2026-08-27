import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-batch4');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = '52b92cc20b81f5feb2d60c2909cbbb35c1652975';
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
        { id:'qa-b4-information', ts:now, questionId:'MR01-Q9', lessonId:'MR01', skill:'reading', errorTag:'reading-information-function', question:'Batch 4 information function deployed QA', myAnswer:'Paragraph 2', correctAnswer:'Paragraph 4', rationale:'QA' },
        { id:'qa-b4-contradiction', ts:now, questionId:'MR01-Q3', lessonId:'MR01', skill:'reading', errorTag:'reading-contradiction', question:'Batch 4 contradiction deployed QA', myAnswer:'TRUE', correctAnswer:'FALSE', rationale:'QA' },
        { id:'qa-b4-not-given', ts:now, questionId:'MR01-Q2', lessonId:'MR01', skill:'reading', errorTag:'reading-not-given', question:'Batch 4 Not Given deployed QA', myAnswer:'FALSE', correctAnswer:'NOT GIVEN', rationale:'QA' },
        { id:'qa-b4-summary', ts:now, questionId:'MR03-Q11', lessonId:'MR03', skill:'reading', errorTag:'reading-summary-logic', question:'Batch 4 summary logic deployed QA', myAnswer:'public path', correctAnswer:'storage capacity', rationale:'QA' },
        { id:'qa-b4-evidence-deferred', ts:now, questionId:'MR03-Q5', lessonId:'MR03', skill:'reading', errorTag:'reading-evidence', question:'Batch 4 evidence deferred control', myAnswer:'B', correctAnswer:'A', rationale:'QA' },
        { id:'qa-b4-inference-control', ts:now, questionId:'MA01-R05', lessonId:'MA01', skill:'reading', errorTag:'inference', question:'Batch 4 RR02 inference control', myAnswer:'A', correctAnswer:'B', rationale:'QA' },
        { id:'qa-b4-retriable', ts:now, questionId:'R05-Q6', lessonId:'R05', skill:'reading', errorTag:'reading-detail-confusion', question:'Why is heading “Replacing books completely” a trap for Paragraph C?', myAnswer:'A', correctAnswer:'B', rationale:'QA' }
      ],
      fixedErrors:[],
      lessonAnswers:{
        'MR01-Q9':{ selected:'Paragraph 2', checked:true },
        'MR01-Q3':{ selected:'TRUE', checked:true },
        'MR01-Q2':{ selected:'FALSE', checked:true },
        'MR03-Q11':{ selected:'public path', checked:true },
        'MR03-Q5':{ selected:'B', checked:true },
        'R05-Q6':{ selected:'A', checked:true }
      },
      studyHistory:[], completedLessons:[],
      profile:{ targetBand:7, placementSections:{ vocabulary:3, grammar:3, reading:3, listening:3 }, recommendedDifficulty:3 },
      study:{ preferredMinutes:20 }, ui:{ chineseHelp:false }
    }));
    localStorage.setItem(adaptiveKey, JSON.stringify({ repairProgress:{}, learningHistory:[], reviewSchedule:{} }));
  }, { coreKey:CORE, adaptiveKey:ADAPTIVE, guideKey:GUIDE });

  // Hydrate app.js and enhancement runtimes from the same seeded learner state.
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#main', { timeout:20000 });
  await page.waitForTimeout(900);
  const hydratedErrors = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}').errors?.length || 0, CORE);
  assert(hydratedErrors === 7, `Seeded learner state was not retained across hydration reload: ${hydratedErrors}`);

  await goto(page, 'improve');
  const families = await improveFamilyState(page);
  const expectedFamilies = {
    'reading-information-function':'R02 → QR05',
    'reading-contradiction':'R04 → QR01',
    'reading-not-given':'R04 → QR01',
    'reading-summary-logic':'R02 → QR06'
  };
  for (const [family, marker] of Object.entries(expectedFamilies)) {
    assert(families[family]?.match === '1 active match', `${family} active aggregation wrong: ${JSON.stringify(families[family])}`);
    assert(families[family]?.text.includes(marker), `${family} route wrong: ${JSON.stringify(families[family])}`);
  }
  assert(!families['reading-evidence'], `Deferred reading-evidence appeared on reuse surface: ${JSON.stringify(families['reading-evidence'])}`);
  const skillSurface = page.locator('[data-v16-skill-repair-improve]');
  await skillSurface.waitFor({ timeout:15000 });
  const rr02 = await skillSurface.evaluate(root => [...root.querySelectorAll('.repair-card')].find(item => item.textContent.includes('RR02'))?.textContent || '');
  assert(rr02.includes('1 active match'), `RR02 inference ownership regressed: ${rr02}`);
  pass('V1.6-B4-A deployed Improve routes four clear families and defers heterogeneous evidence', { families });
  await shot(page, 'v16-b4-a-improve-routing');

  const expectedCards = {
    'Batch 4 information function deployed QA':['Review R02','Practise QR05'],
    'Batch 4 contradiction deployed QA':['Review R04','Practise QR01'],
    'Batch 4 Not Given deployed QA':['Review R04','Practise QR01'],
    'Batch 4 summary logic deployed QA':['Review R02','Practise QR06']
  };
  for (const [question, labels] of Object.entries(expectedCards)) {
    const card = await errorCardState(page, question);
    assert(card?.hasExistingRoute, `${question}: existing-practice route missing: ${JSON.stringify(card)}`);
    assert(!card?.hasRetry, `${question}: Mini Test exposed fake single-question Retry: ${JSON.stringify(card)}`);
    for (const label of labels) assert(card.routeText.includes(label), `${question}: missing ${label}: ${JSON.stringify(card)}`);
  }
  const deferred = await errorCardState(page, 'Batch 4 evidence deferred control');
  const inference = await errorCardState(page, 'Batch 4 RR02 inference control');
  assert(deferred && !deferred.hasExistingRoute, `reading-evidence was over-routed: ${JSON.stringify(deferred)}`);
  assert(inference && !inference.hasExistingRoute, `RR02 inference was duplicated into reuse routing: ${JSON.stringify(inference)}`);
  pass('V1.6-B4-B deployed Error Notebook adds only semantically justified Core→Lab CTAs');
  await shot(page, 'v16-b4-b-error-notebook');

  await goto(page, 'learn');
  await goto(page, 'improve');
  for (const question of Object.keys(expectedCards)) {
    const card = await errorCardState(page, question);
    assert(card && !card.hasRetry, `${question}: Mini Test became falsely retriable after Learn → Improve rerender: ${JSON.stringify(card)}`);
    assert(card.hasExistingRoute, `${question}: route disappeared after production registry rerender: ${JSON.stringify(card)}`);
  }
  const coreAfter = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), CORE);
  for (const qid of ['MR01-Q9','MR01-Q3','MR01-Q2','MR03-Q11','MR03-Q5']) {
    assert(coreAfter.lessonAnswers?.[qid]?.checked === true, `${qid}: Test Mode saved answer was altered by routing`);
  }
  pass('V1.6-B4-C Mini Test Test Mode boundary survives production registry registration and rerender');
  await shot(page, 'v16-b4-c-test-mode-boundary');

  const standardRetry = await errorCardState(page, 'Why is heading “Replacing books completely” a trap for Paragraph C?');
  assert(standardRetry?.hasRetry, `Standard R05 lesson error lost direct Retry: ${JSON.stringify(standardRetry)}`);
  assert(!standardRetry?.hasExistingRoute, `Reuse CTA competed with direct R05 Retry: ${JSON.stringify(standardRetry)}`);
  pass('V1.6-B4-D direct lesson Retry remains higher priority than reuse routing');
  await shot(page, 'v16-b4-d-direct-retry');

  let card = errorCardLocator(page, 'Batch 4 information function deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="QR05"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QR05');
  await page.waitForTimeout(700);
  assert((await page.locator('#main').textContent()).includes('Question Type Lab: Matching Information'), 'QR05 routed Lab did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'Batch 4 contradiction deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="R04"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/R04');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes('True, False or Not Given?'), 'R04 routed Core lesson did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'Batch 4 summary logic deployed QA');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="QR06"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QR06');
  await page.waitForTimeout(700);
  assert((await page.locator('#main').textContent()).includes('Question Type Lab: Summary Completion'), 'QR06 routed Lab did not render');
  pass('V1.6-B4-E deployed QR05, R04 and QR06 route destinations all render successfully');
  await shot(page, 'v16-b4-e-route-navigation');

  assert(pageErrors.length === 0, `Deployed V1.6 Batch 4 page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-batch4.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 Batch 4 deployed routing QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-batch4.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-b4-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
