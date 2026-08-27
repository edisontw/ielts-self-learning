import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v15');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const results = [];
const pageErrors = [];

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const pass = (name, detail = {}) => { results.push({ name, status: 'PASS', ...detail }); console.log(`✓ ${name}`); };
const shot = async (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
const goto = async (page, route) => {
  await page.goto(`${BASE}#/${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#main', { timeout: 20000 });
  await page.waitForTimeout(900);
};

async function repairData(page, id) {
  return page.evaluate(async ({ base, id }) => {
    await import(`${base}repair-registry-v15.js`);
    const { REPAIR_LESSONS } = await import(`${base}adaptive-data.js`);
    const lesson = REPAIR_LESSONS.find(item => item.id === id);
    return lesson ? {
      id: lesson.id,
      title: lesson.title,
      questions: lesson.questions.map(q => ({ answer: q.answer, prompt: q.prompt }))
    } : null;
  }, { base: BASE, id });
}

async function clickValue(locator, wanted) {
  const count = await locator.count();
  for (let i = 0; i < count; i++) {
    const item = locator.nth(i);
    if (await item.getAttribute('data-value') === wanted) {
      await item.click();
      return;
    }
  }
  throw new Error(`No option with data-value=${wanted}`);
}

await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on('pageerror', error => pageErrors.push(String(error)));
page.on('console', message => {
  if (message.type() === 'error') console.log(`console.error: ${message.text()}`);
});

try {
  await goto(page, 'today');
  await page.evaluate(({ guide }) => {
    localStorage.clear();
    localStorage.setItem(guide, 'true');
  }, { guide: GUIDE });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);

  await goto(page, 'learn');
  await page.getByText('Paraphrase: Same Meaning, Different Form', { exact: true }).first().waitFor({ timeout: 15000 });
  await page.getByText('Use Grammar to Predict the Answer Type', { exact: true }).first().waitFor({ timeout: 15000 });
  const repairTitles = {
    VG01: 'Learn Collocations, Not Isolated Words',
    VG02: 'Articles in Academic Writing',
    VG03: 'Complex Sentences Without Losing Control',
    VG04: 'Paraphrase: Same Meaning, Different Form',
    VG05: 'Use Grammar to Predict the Answer Type'
  };
  for (const [id, title] of Object.entries(repairTitles)) {
    await goto(page, `lesson/${id}`);
    await page.locator(`[data-v15-repair-route="${id}"]`).waitFor({ timeout: 15000 });
    assert((await page.locator('h1.lesson-title').textContent())?.includes(title), `${id} title mismatch on deployed route`);
    assert(!(await page.locator('#main').textContent()).includes('Lesson not found'), `${id} fell back to Lesson not found`);
  }
  pass('V1.5-A Learn Repair index and VG01–VG05 deployed deep links');
  await shot(page, 'v15-a-vg05-deep-link');

  await goto(page, 'lesson/VG04');
  const note = page.locator('[data-runtime-note="VG04"]');
  await note.waitFor();
  await note.evaluate(el => { el.dataset.qaStableNode = 'yes'; });
  await note.click();
  await note.type('Meaning first; keywords second.', { delay: 15 });
  await page.waitForTimeout(250);
  const noteState = await note.evaluate(el => ({
    sameNode: el.dataset.qaStableNode === 'yes',
    focused: document.activeElement === el,
    value: el.value
  }));
  assert(noteState.sameNode, 'Repair note textarea was remounted while typing');
  assert(noteState.focused, 'Repair note textarea lost focus while typing');
  assert(noteState.value === 'Meaning first; keywords second.', `Repair note value changed unexpectedly: ${noteState.value}`);
  const savedNote = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}').repairProgress?.VG04?.note, ADAPTIVE);
  assert(savedNote === noteState.value, 'Repair note was not persisted while keeping the textarea mounted');
  pass('V1.5-B Repair note typing preserves DOM node, focus and persisted value');
  await shot(page, 'v15-b-note-focus-stable');

  await goto(page, 'lesson/VG01');
  const vg01 = await repairData(page, 'VG01');
  assert(vg01?.questions?.length, 'VG01 data missing from deployed registry');
  const firstOptions = page.locator('[data-lrv="repair-option"][data-q="0"]');
  const values = await firstOptions.evaluateAll(els => els.map(el => el.dataset.value));
  const wrong = values.find(value => value !== vg01.questions[0].answer);
  assert(wrong, 'VG01 wrong option not found');
  await clickValue(firstOptions, wrong);
  await page.locator('[data-lrv="repair-check"][data-q="0"]').click();
  await page.locator('[data-lrv="repair-retry"][data-q="0"]').waitFor();
  assert(await page.locator('[data-lrv="repair-complete"]').isDisabled(), 'VG01 Finish enabled after a wrong guided answer');
  await page.locator('[data-lrv="repair-retry"][data-q="0"]').click();
  for (let i = 0; i < vg01.questions.length; i++) {
    await clickValue(page.locator(`[data-lrv="repair-option"][data-q="${i}"]`), vg01.questions[i].answer);
    await page.locator(`[data-lrv="repair-check"][data-q="${i}"]`).click();
    await page.waitForTimeout(80);
  }
  const finish = page.locator('[data-lrv="repair-complete"]');
  assert(!(await finish.isDisabled()), 'VG01 Finish did not enable after all guided answers were correct');
  await finish.click();
  await page.waitForTimeout(250);
  assert((await finish.textContent())?.includes('Completed'), 'VG01 completion did not persist through unified renderer');
  pass('V1.5-C Unified VG01 renderer preserves Retry / mastery gate');

  await goto(page, 'improve');
  await page.locator('[data-adaptive-root="review"]').waitFor({ timeout: 15000 });
  await page.locator('[data-adaptive-root="repair"]').waitFor({ timeout: 15000 });
  await page.locator('[data-runtime-root="vocab"]').waitFor({ timeout: 15000 });
  const improveState = await page.evaluate(() => {
    const main = document.querySelector('#main');
    const review = main?.querySelector('[data-adaptive-root="review"]');
    const notebook = [...(main?.querySelectorAll('.card') || [])].find(card => card.textContent.includes('Error Notebook'));
    const repair = main?.querySelector('[data-adaptive-root="repair"]');
    const vocab = main?.querySelector('[data-runtime-root="vocab"]');
    const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
    return {
      present: Boolean(review && notebook && repair && vocab),
      ordered: before(review, notebook) && before(notebook, repair) && before(repair, vocab),
      counts: {
        review: main?.querySelectorAll('[data-adaptive-root="review"]').length || 0,
        repair: main?.querySelectorAll('[data-adaptive-root="repair"]').length || 0,
        vocab: main?.querySelectorAll('[data-runtime-root="vocab"]').length || 0
      }
    };
  });
  assert(improveState.present, 'Improve is missing Review / Error Notebook / Repair / Vocabulary surfaces');
  assert(improveState.ordered, 'Improve surface order is not Review -> Error Notebook -> Repair -> Vocabulary');
  assert(Object.values(improveState.counts).every(count => count === 1), `Improve contains duplicate lifecycle surfaces: ${JSON.stringify(improveState.counts)}`);
  await page.evaluate(() => window.dispatchEvent(new Event('hashchange')));
  await page.waitForTimeout(250);
  const countsAfterRefresh = await page.evaluate(() => ({
    review: document.querySelectorAll('[data-adaptive-root="review"]').length,
    repair: document.querySelectorAll('[data-adaptive-root="repair"]').length,
    vocab: document.querySelectorAll('[data-runtime-root="vocab"]').length
  }));
  assert(Object.values(countsAfterRefresh).every(count => count === 1), `Lifecycle refresh duplicated Improve surfaces: ${JSON.stringify(countsAfterRefresh)}`);
  pass('V1.5-D Improve ordering is deterministic and lifecycle refresh does not duplicate surfaces', { countsAfterRefresh });
  await shot(page, 'v15-d-improve-ordering');

  await page.evaluate(({ coreKey }) => {
    const core = JSON.parse(localStorage.getItem(coreKey) || '{}');
    core.placement = core.placement || { total: 12, completedAt: Date.now() };
    core.profile = {
      ...(core.profile || {}),
      placementSections: { vocabulary: 3, grammar: 3, reading: 3, listening: 3 },
      recommendedDifficulty: 3
    };
    core.study = { ...(core.study || {}), preferredMinutes: 20 };
    core.errors ||= [];
    core.fixedErrors ||= [];
    core.studyHistory ||= [];
    localStorage.setItem(coreKey, JSON.stringify(core));
  }, { coreKey: CORE });
  await goto(page, 'today');
  const today = page.locator('[data-adaptive-root="today"]');
  await today.waitFor({ timeout: 15000 });
  await page.waitForFunction(() => Boolean(document.querySelector('[data-adaptive-root="today"]')?.dataset.runtimeFingerprint));
  const beforeFingerprint = await today.getAttribute('data-runtime-fingerprint');
  assert(beforeFingerprint?.startsWith('review-'), `Expected Today to start in review-first mode after VG01 completion, got ${beforeFingerprint}`);

  await page.evaluate(({ adaptiveKey }) => {
    const adaptive = JSON.parse(localStorage.getItem(adaptiveKey) || '{}');
    const future = Date.now() + 7 * 86400000;
    for (const item of Object.values(adaptive.vocabularySchedule || {})) item.dueAt = future;
    localStorage.setItem(adaptiveKey, JSON.stringify(adaptive));
    window.dispatchEvent(new CustomEvent('ielts-adaptive-state-change'));
  }, { adaptiveKey: ADAPTIVE });

  await page.waitForFunction(before => {
    const root = document.querySelector('[data-adaptive-root="today"]');
    return root?.dataset.runtimeFingerprint &&
      root.dataset.runtimeFingerprint !== before &&
      root.dataset.runtimeFingerprint.startsWith('lesson-');
  }, beforeFingerprint, { timeout: 10000 });
  const afterFingerprint = await today.getAttribute('data-runtime-fingerprint');
  assert(afterFingerprint?.startsWith('lesson-'), `Today did not return to a lesson recommendation after due vocabulary was rescheduled: ${afterFingerprint}`);
  assert(await page.locator('[data-adaptive-root="today"]').count() === 1, 'Today lifecycle refresh created duplicate adaptive roots');
  pass('V1.5-E Due-review state change refreshes Today through one shared lifecycle root', { beforeFingerprint, afterFingerprint });
  await shot(page, 'v15-e-today-refresh');

  assert(pageErrors.length === 0, `Deployed V1.5 page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v15.json'), JSON.stringify({ base: BASE, results, pageErrors }, null, 2));
  console.log(`V1.5 deployed lifecycle QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v15.json'), JSON.stringify({ base: BASE, results, pageErrors, failure: String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v15-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
