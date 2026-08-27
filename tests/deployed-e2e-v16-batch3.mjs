import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-batch3');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = '3b0df73893e39d2d2b2463e0a7f43c9c8bc04926';
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

async function errorCardState(page, id) {
  return page.evaluate(errorId => {
    const anchor = document.querySelector(`[data-error-id="${errorId}"]`);
    const card = anchor?.closest('.error-item');
    if (!card) return null;
    const route = card.querySelector('[data-v16-existing-practice-error-route]');
    return {
      text:card.textContent || '',
      hasRetry:Boolean(card.querySelector('[data-action="retry-error"]')),
      hasExistingRoute:Boolean(route),
      routeText:route?.textContent || '',
      routeFingerprint:route?.dataset.routeFingerprint || ''
    };
  }, id);
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
        { id:'qa-reading-detail', ts:now, questionId:'MA01-R02', lessonId:'MA01', skill:'reading', errorTag:'detail', question:'Reading detail deployed QA', myAnswer:'A', correctAnswer:'B', rationale:'QA' },
        { id:'qa-listening-detail', ts:now, questionId:'MA01-L04', lessonId:'MA01', skill:'listening', errorTag:'detail', question:'Listening detail deployed QA', myAnswer:'A', correctAnswer:'B', rationale:'QA' },
        { id:'qa-reading-scope-mini', ts:now, questionId:'MR02-Q7', lessonId:'MR02', skill:'reading', errorTag:'reading-scope', question:'Mini Test Reading scope deployed QA', myAnswer:'Street orientation', correctAnswer:'Average household income', rationale:'QA' },
        { id:'qa-reading-inference', ts:now, questionId:'MA01-R05', lessonId:'MA01', skill:'reading', errorTag:'inference', question:'Reading inference Skill Repair control', myAnswer:'A', correctAnswer:'B', rationale:'QA' },
        { id:'qa-retriable-heading', ts:now, questionId:'R05-Q6', lessonId:'R05', skill:'reading', errorTag:'reading-detail-confusion', question:'Why is heading “Replacing books completely” a trap for Paragraph C?', myAnswer:'A', correctAnswer:'B', rationale:'QA' }
      ],
      fixedErrors:[],
      lessonAnswers:{ 'MR02-Q7':{ selected:'Street orientation', checked:true }, 'R05-Q6':{ selected:'A', checked:true } },
      studyHistory:[], completedLessons:[],
      profile:{ targetBand:7, placementSections:{ vocabulary:3, grammar:3, reading:3, listening:3 }, recommendedDifficulty:3 },
      study:{ preferredMinutes:20 }, ui:{ chineseHelp:false }
    }));
    localStorage.setItem(adaptiveKey, JSON.stringify({ repairProgress:{}, learningHistory:[], reviewSchedule:{} }));
  }, { coreKey:CORE, adaptiveKey:ADAPTIVE, guideKey:GUIDE });

  // A same-origin hash navigation does not reload ES modules, so app.js would
  // otherwise keep the empty in-memory state it captured before the QA seed.
  // Reload once after seeding so the base Error Notebook and enhancement
  // runtimes all hydrate from the same persisted learner record.
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#main', { timeout:20000 });
  await page.waitForTimeout(900);
  const hydratedErrors = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}').errors?.length || 0, CORE);
  assert(hydratedErrors === 5, `Seeded learner state was not retained across hydration reload: ${hydratedErrors}`);

  await goto(page, 'improve');
  const families = await improveFamilyState(page);
  assert(families['reading-detail']?.match === '1 active match', `Reading detail aggregation should exclude direct R05 retry: ${JSON.stringify(families)}`);
  assert(families['reading-detail']?.text.includes('R02 → QR03'), `Reading detail route wrong: ${JSON.stringify(families['reading-detail'])}`);
  assert(families['listening-detail']?.text.includes('L05 → QL05'), `Listening detail route wrong: ${JSON.stringify(families['listening-detail'])}`);
  assert(families['reading-scope']?.match === '1 active match' && families['reading-scope']?.text.includes('R04 → QR01'), `Reading scope Mini Test route wrong: ${JSON.stringify(families['reading-scope'])}`);
  const skillSurface = page.locator('[data-v16-skill-repair-improve]');
  await skillSurface.waitFor({ timeout:15000 });
  const rr02 = await skillSurface.evaluate(root => {
    const card = [...root.querySelectorAll('.repair-card')].find(item => item.textContent.includes('RR02'));
    return card?.textContent || '';
  });
  assert(rr02.includes('1 active match'), `RR02 inference ownership regressed: ${rr02}`);
  pass('V1.6-B3-A deployed Improve separates existing-practice transfer routes from RR02 Skill Repair', { families });
  await shot(page, 'v16-b3-a-improve-routing');

  const readingDetail = await errorCardState(page, 'qa-reading-detail');
  const listeningDetail = await errorCardState(page, 'qa-listening-detail');
  const miniInitial = await errorCardState(page, 'qa-reading-scope-mini');
  const inference = await errorCardState(page, 'qa-reading-inference');
  assert(readingDetail?.hasExistingRoute && readingDetail.routeText.includes('Review R02') && readingDetail.routeText.includes('Practise QR03'), `Reading detail Error Notebook route wrong: ${JSON.stringify(readingDetail)}`);
  assert(listeningDetail?.hasExistingRoute && listeningDetail.routeText.includes('Review L05') && listeningDetail.routeText.includes('Practise QL05'), `Listening detail Error Notebook route wrong: ${JSON.stringify(listeningDetail)}`);
  assert(miniInitial?.hasExistingRoute && miniInitial.routeText.includes('Review R04') && miniInitial.routeText.includes('Practise QR01'), `Mini Test scope existing-practice route missing: ${JSON.stringify(miniInitial)}`);
  assert(!miniInitial?.hasRetry, `Mini Test scope exposed fake single-question Retry on initial deployed render: ${JSON.stringify(miniInitial)}`);
  assert(!inference?.hasExistingRoute, `RR02 inference was duplicated into existing-practice routing: ${JSON.stringify(inference)}`);
  pass('V1.6-B3-B deployed Error Notebook shows Core → Lab CTAs only for covered transfer failures');
  await shot(page, 'v16-b3-b-error-notebook-routes');

  await goto(page, 'learn');
  await goto(page, 'improve');
  const miniAfterRerender = await errorCardState(page, 'qa-reading-scope-mini');
  assert(miniAfterRerender && !miniAfterRerender.hasRetry, `Mini Test became falsely retriable after Learn → Improve rerender: ${JSON.stringify(miniAfterRerender)}`);
  assert(miniAfterRerender.hasExistingRoute && miniAfterRerender.routeText.includes('Review R04') && miniAfterRerender.routeText.includes('Practise QR01'), `Mini Test lost R04 → QR01 routing after rerender: ${JSON.stringify(miniAfterRerender)}`);
  const coreAfterRerender = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), CORE);
  assert(coreAfterRerender.lessonAnswers?.['MR02-Q7']?.checked === true, 'Mini Test routing incorrectly cleared the saved Test Mode answer');
  pass('V1.6-B3-C Mini Test stays Test Mode after production registry registration and rerender');
  await shot(page, 'v16-b3-c-mini-test-boundary');

  const standardRetry = await errorCardState(page, 'qa-retriable-heading');
  assert(standardRetry?.hasRetry, `Standard R05 lesson error lost direct Retry: ${JSON.stringify(standardRetry)}`);
  assert(!standardRetry?.hasExistingRoute, `Existing-practice CTA competed with direct R05 Retry: ${JSON.stringify(standardRetry)}`);
  const familiesAfter = await improveFamilyState(page);
  assert(familiesAfter['reading-detail']?.match === '1 active match', `Retriable R05 error was counted after rerender: ${JSON.stringify(familiesAfter)}`);
  pass('V1.6-B3-D direct lesson Retry remains higher priority and excluded from reuse aggregation');
  await shot(page, 'v16-b3-d-direct-retry-priority');

  const miniRoute = page.locator('[data-error-id="qa-reading-scope-mini"]').first().locator('xpath=ancestor::article[contains(@class,"error-item")]').locator('[data-v16-existing-practice-error-route]');
  await miniRoute.locator('[data-lesson="R04"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/R04');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes('True / False / Not Given: Evidence, Not Assumptions'), 'R04 routed lesson did not render');
  await goto(page, 'improve');
  const miniRouteAgain = page.locator('[data-error-id="qa-reading-scope-mini"]').first().locator('xpath=ancestor::article[contains(@class,"error-item")]').locator('[data-v16-existing-practice-error-route]');
  await miniRouteAgain.locator('[data-lesson="QR01"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QR01');
  await page.waitForTimeout(700);
  const labText = await page.locator('#main').textContent();
  assert(!labText?.includes('Lesson not found'), 'QR01 routed Lab showed Lesson not found');
  assert(labText?.includes('True / False / Not Given'), `QR01 routed Lab marker missing: ${labText?.slice(0,300)}`);
  pass('V1.6-B3-E deployed Core review and Question Type Lab transfer navigation both work');
  await shot(page, 'v16-b3-e-r04-qr01-navigation');

  assert(pageErrors.length === 0, `Deployed V1.6 Batch 3 page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-batch3.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 Batch 3 deployed existing-practice routing QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-batch3.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-b3-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
