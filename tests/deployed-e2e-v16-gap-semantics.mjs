import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-gap-semantics');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = '496eb0805c33a12cd8a562ae5510619afb817be8';
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

async function existingFamilyState(page) {
  const surface = page.locator('[data-v16-existing-practice-improve]');
  await surface.waitFor({ timeout:15000 });
  return surface.evaluate(root => Object.fromEntries([...root.querySelectorAll('[data-existing-practice-family]')].map(card => {
    const family = card.dataset.existingPracticeFamily;
    const chips = [...card.querySelectorAll('.chip')].map(x => x.textContent.trim());
    return [family, { text:card.textContent || '', match:chips.find(x => x.includes('active match')) || '' }];
  })));
}

async function skillRepairState(page, title) {
  const surface = page.locator('[data-v16-skill-repair-improve]');
  await surface.waitFor({ timeout:15000 });
  return surface.evaluate((root, expectedTitle) => {
    const card = [...root.querySelectorAll('.repair-card')].find(item => (item.querySelector('h3')?.textContent || '').trim() === expectedTitle);
    if (!card) return null;
    return {
      text:card.textContent || '',
      chips:[...card.querySelectorAll('.chip')].map(x => x.textContent.trim()),
      lesson:card.querySelector('[data-lesson]')?.getAttribute('data-lesson') || ''
    };
  }, title);
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
        { id:'qa-gap-reference', ts:now, questionId:'MR02-Q9', lessonId:'MR02', skill:'reading', errorTag:'reading-reference', question:'GAP review Reading reference RR03 control', myAnswer:'street trees', correctAnswer:'shade', rationale:'QA' },
        { id:'qa-gap-final-decision', ts:now, questionId:'ML02-Q10', lessonId:'ML02', skill:'listening', errorTag:'listening-final-decision', question:'GAP review Listening final-decision reuse control', myAnswer:'pay at the desk', correctAnswer:'book online that evening', rationale:'QA' },
        { id:'qa-gap-scope', ts:now, questionId:'ML03-Q9', lessonId:'ML03', skill:'listening', errorTag:'listening-scope', question:'GAP review Listening scope reuse control', myAnswer:'lunch', correctAnswer:'tea, coffee and a light snack', rationale:'QA' },
        { id:'qa-gap-main-idea', ts:now, questionId:'MA01-L21', lessonId:'MA01', skill:'listening', errorTag:'main-idea', question:'GAP review Listening main-idea taught-only control', myAnswer:'original broad topic', correctAnswer:'revised research focus', rationale:'QA' },
        { id:'qa-gap-sequence', ts:now, questionId:'ML02-Q4', lessonId:'ML02', skill:'listening', errorTag:'listening-sequence', question:'GAP review heterogeneous Listening sequence control', myAnswer:'turn before the pharmacy', correctAnswer:'turn immediately after the pharmacy', rationale:'QA' },
        { id:'qa-gap-direct-retry', ts:now, questionId:'L04-Q2', lessonId:'L04', skill:'listening', errorTag:'listening-distractor', question:'GAP review direct Retry priority control', myAnswer:'window', correctAnswer:'aisle', rationale:'QA' }
      ],
      fixedErrors:[],
      lessonAnswers:{ 'L04-Q2':{ selected:'window', checked:true } },
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
  const rr03 = await skillRepairState(page, 'Resolve What Reference Words Point To');
  assert(rr03, 'RR03 card missing from deployed Improve Skill Repair surface');
  assert(rr03.lesson === 'RR03', `RR03 card points to wrong lesson: ${JSON.stringify(rr03)}`);
  assert(rr03.chips.includes('1 active match'), `RR03 active match count wrong: ${JSON.stringify(rr03)}`);
  assert(rr03.text.includes('3 audit signals'), `RR03 evidence count missing/wrong: ${JSON.stringify(rr03)}`);
  pass('V1.6-GAP-A deployed Improve exposes RR03 only when a Reading reference error is active', { rr03 });
  await shot(page, 'v16-gap-a-rr03-improve');

  const families = await existingFamilyState(page);
  assert(families['listening-final-decision']?.match === '1 active match', `Listening final-decision aggregation wrong: ${JSON.stringify(families['listening-final-decision'])}`);
  assert(families['listening-final-decision']?.text.includes('L04 → QL01'), `Listening final-decision route wrong: ${JSON.stringify(families['listening-final-decision'])}`);
  assert(families['listening-scope']?.match === '1 active match', `Listening scope aggregation wrong: ${JSON.stringify(families['listening-scope'])}`);
  assert(families['listening-scope']?.text.includes('L05 → QL05'), `Listening scope route wrong: ${JSON.stringify(families['listening-scope'])}`);
  pass('V1.6-GAP-B deployed Improve routes final-decision to L04/QL01 and scope to L05/QL05', { finalDecision:families['listening-final-decision'], scope:families['listening-scope'] });
  await shot(page, 'v16-gap-b-listening-reuse');

  const reference = await errorCardState(page, 'GAP review Reading reference RR03 control');
  const finalDecision = await errorCardState(page, 'GAP review Listening final-decision reuse control');
  const scope = await errorCardState(page, 'GAP review Listening scope reuse control');
  const mainIdea = await errorCardState(page, 'GAP review Listening main-idea taught-only control');
  const sequence = await errorCardState(page, 'GAP review heterogeneous Listening sequence control');
  const directRetry = await errorCardState(page, 'GAP review direct Retry priority control');

  assert(reference && !reference.hasRetry && !reference.hasExistingRoute, `Reading reference should be Skill Repair-owned without fake Mini Test Retry/reuse: ${JSON.stringify(reference)}`);
  assert(finalDecision?.hasExistingRoute && finalDecision.routeText.includes('Review L04') && finalDecision.routeText.includes('Practise QL01'), `Final-decision Error Notebook route wrong: ${JSON.stringify(finalDecision)}`);
  assert(scope?.hasExistingRoute && scope.routeText.includes('Review L05') && scope.routeText.includes('Practise QL05'), `Scope Error Notebook route wrong: ${JSON.stringify(scope)}`);
  assert(!finalDecision.hasRetry && !scope.hasRetry, 'Mini Test final-decision/scope exposed fake single-question Retry');
  assert(mainIdea && !mainIdea.hasRetry && !mainIdea.hasExistingRoute, `Listening main-idea gained a synthetic runtime route: ${JSON.stringify(mainIdea)}`);
  assert(sequence && !sequence.hasRetry && !sequence.hasExistingRoute, `Heterogeneous Listening sequence gained a synthetic runtime route: ${JSON.stringify(sequence)}`);
  assert(directRetry?.hasRetry && !directRetry.hasExistingRoute, `Direct L04 Retry lost priority over reuse routing: ${JSON.stringify(directRetry)}`);
  pass('V1.6-GAP-C Error Notebook preserves Skill Repair ownership, Test boundaries, intentional deferrals, and direct Retry priority');
  await shot(page, 'v16-gap-c-error-notebook-boundaries');

  // Exercise RR03 mastery: first answer wrong, Retry, correct it, then complete the remaining checks correctly.
  await page.locator('[data-v16-skill-repair-improve] [data-lesson="RR03"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/RR03');
  await page.waitForTimeout(700);
  let mainText = await page.locator('#main').textContent();
  assert(mainText.includes('Resolve What Reference Words Point To'), 'RR03 route did not render');
  assert(mainText.includes('3 tagged reading questions'), 'RR03 evidence callout did not render the 3-signal audit basis');

  const cards = page.locator('[data-v15-repair-route="RR03"] .quiz-card');
  assert(await cards.count() === 3, 'RR03 must render three guided-practice cards');

  const q0 = cards.nth(0);
  await q0.locator('.option').nth(1).click();
  await q0.locator('[data-lrv="repair-check"]').click();
  await page.waitForTimeout(250);
  assert((await q0.textContent()).includes('Not yet'), 'RR03 wrong answer did not show Not yet feedback');
  assert(await q0.locator('[data-lrv="repair-retry"]').count() === 1, 'RR03 wrong answer did not expose Retry');
  await q0.locator('[data-lrv="repair-retry"]').click();
  await page.waitForTimeout(250);
  const q0retry = page.locator('[data-v15-repair-route="RR03"] .quiz-card').nth(0);
  await q0retry.locator('.option').filter({ hasText:'The lights switching off while a student was still using the room.' }).click();
  await q0retry.locator('[data-lrv="repair-check"]').click();
  await page.waitForTimeout(250);
  assert((await page.locator('[data-v15-repair-route="RR03"] .quiz-card').nth(0).textContent()).includes('Correct'), 'RR03 retried first answer did not become correct');

  const correctOptions = [
    'Reduced fees and neighbourhood pick-up points.',
    'The proposal for a complete winter closure.'
  ];
  for (let i = 1; i < 3; i += 1) {
    const card = page.locator('[data-v15-repair-route="RR03"] .quiz-card').nth(i);
    await card.locator('.option').filter({ hasText:correctOptions[i - 1] }).click();
    await card.locator('[data-lrv="repair-check"]').click();
    await page.waitForTimeout(250);
    assert((await page.locator('[data-v15-repair-route="RR03"] .quiz-card').nth(i).textContent()).includes('Correct'), `RR03 Q${i + 1} did not become correct`);
  }

  const finish = page.locator('[data-lrv="repair-complete"][data-rid="RR03"]');
  assert(!(await finish.isDisabled()), 'RR03 Finish stayed disabled after all three checks were correct');
  await finish.click();
  await page.waitForTimeout(400);
  assert((await page.locator('#main').textContent()).includes('Completed ✓'), 'RR03 did not save completion after mastery');
  pass('V1.6-GAP-D RR03 wrong → Retry → all correct → Finish works on deployed production');
  await shot(page, 'v16-gap-d-rr03-mastery');

  // Confirm the two new reuse destinations and their Core reviews render from real Error Notebook CTAs.
  await goto(page, 'improve');
  let card = errorCardLocator(page, 'GAP review Listening final-decision reuse control');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="QL01"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QL01');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes('Question Type Lab: Listening Multiple Choice'), 'QL01 final-decision transfer did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'GAP review Listening final-decision reuse control');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="L04"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/L04');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes("Don't Fall for the Distractor"), 'L04 final-decision review did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'GAP review Listening scope reuse control');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="QL05"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/QL05');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes('Question Type Lab: Listening Short Answer'), 'QL05 scope transfer did not render');

  await goto(page, 'improve');
  card = errorCardLocator(page, 'GAP review Listening scope reuse control');
  await card.locator('[data-v16-existing-practice-error-route] [data-lesson="L05"]').click();
  await page.waitForFunction(() => location.hash === '#/lesson/L05');
  await page.waitForTimeout(500);
  assert((await page.locator('#main').textContent()).includes('Predict Before You Listen'), 'L05 scope review did not render');
  pass('V1.6-GAP-E deployed L04/QL01 and L05/QL05 reuse destinations render from Error Notebook CTAs');
  await shot(page, 'v16-gap-e-listening-route-navigation');

  // Rerender boundary: unresolved Test/Mock controls must keep the same ownership after leaving and returning.
  await goto(page, 'learn');
  await goto(page, 'improve');
  const referenceAfter = await errorCardState(page, 'GAP review Reading reference RR03 control');
  const mainIdeaAfter = await errorCardState(page, 'GAP review Listening main-idea taught-only control');
  const sequenceAfter = await errorCardState(page, 'GAP review heterogeneous Listening sequence control');
  assert(referenceAfter && !referenceAfter.hasRetry && !referenceAfter.hasExistingRoute, 'Reading reference ownership changed after rerender');
  assert(mainIdeaAfter && !mainIdeaAfter.hasRetry && !mainIdeaAfter.hasExistingRoute, 'Listening main-idea deferral changed after rerender');
  assert(sequenceAfter && !sequenceAfter.hasRetry && !sequenceAfter.hasExistingRoute, 'Listening sequence deferral changed after rerender');
  const rr03After = await skillRepairState(page, 'Resolve What Reference Words Point To');
  assert(rr03After?.chips.includes('1 active match'), `RR03 active evidence disappeared after rerender: ${JSON.stringify(rr03After)}`);
  pass('V1.6-GAP-F Skill Repair/reuse/deferral ownership survives production rerender');
  await shot(page, 'v16-gap-f-rerender-ownership');

  assert(pageErrors.length === 0, `Deployed V1.6 gap semantics page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-gap-semantics.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 gap semantics deployed QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-gap-semantics.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-gap-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
