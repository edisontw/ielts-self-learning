import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16');
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
  const text = await page.locator('#main').textContent();
  assert(!text?.includes('The page could not start normally.'), `${route} showed boot recovery`);
  assert(!text?.includes('Lesson not found'), `${route} showed Lesson not found`);
};

async function skillRepairData(page, id) {
  return page.evaluate(async ({ base, id }) => {
    const { V16_SKILL_REPAIR_LESSONS } = await import(`${base}skill-repair-registry-v16.js`);
    const lesson = V16_SKILL_REPAIR_LESSONS.find(item => item.id === id);
    return lesson ? {
      id: lesson.id,
      title: lesson.title,
      questions: lesson.questions.map(q => ({ answer: q.answer, options: q.options, prompt: q.prompt })),
      media: (lesson.media || []).map(item => ({ id: item.id, src: item.src, label: item.label }))
    } : null;
  }, { base: BASE, id });
}

async function clickValue(page, id, index, wanted) {
  const options = page.locator(`[data-lrv="repair-option"][data-rid="${id}"][data-q="${index}"]`);
  const count = await options.count();
  for (let i = 0; i < count; i++) {
    const item = options.nth(i);
    if (await item.getAttribute('data-value') === wanted) {
      await item.click();
      return;
    }
  }
  throw new Error(`${id} Q${index + 1}: no option with data-value=${wanted}`);
}

async function completeWithRetry(page, lesson) {
  await goto(page, `lesson/${lesson.id}`);
  await page.locator(`[data-v15-repair-route="${lesson.id}"]`).waitFor({ timeout: 15000 });
  const first = lesson.questions[0];
  const wrong = first.options.find(option => option !== first.answer);
  assert(wrong, `${lesson.id} has no wrong option for retry QA`);

  await clickValue(page, lesson.id, 0, wrong);
  await page.locator(`[data-lrv="repair-check"][data-rid="${lesson.id}"][data-q="0"]`).click();
  await page.locator(`[data-lrv="repair-retry"][data-rid="${lesson.id}"][data-q="0"]`).waitFor({ timeout: 10000 });
  assert(await page.locator(`[data-lrv="repair-complete"][data-rid="${lesson.id}"]`).isDisabled(), `${lesson.id} Finish enabled after a wrong answer`);
  await page.locator(`[data-lrv="repair-retry"][data-rid="${lesson.id}"][data-q="0"]`).click();
  await page.waitForFunction(({ id }) => {
    const option = document.querySelector(`[data-lrv="repair-option"][data-rid="${id}"][data-q="0"]`);
    return option && !option.disabled;
  }, { id: lesson.id });

  for (let i = 0; i < lesson.questions.length; i++) {
    await clickValue(page, lesson.id, i, lesson.questions[i].answer);
    await page.locator(`[data-lrv="repair-check"][data-rid="${lesson.id}"][data-q="${i}"]`).click();
    await page.waitForFunction(({ id, i }) => {
      const card = document.querySelector(`[data-lrv="repair-check"][data-rid="${id}"][data-q="${i}"]`)?.closest('.quiz-card');
      return Boolean(card?.querySelector('.feedback.correct'));
    }, { id: lesson.id, i });
  }

  const finish = page.locator(`[data-lrv="repair-complete"][data-rid="${lesson.id}"]`);
  await page.waitForFunction(({ id }) => {
    const button = document.querySelector(`[data-lrv="repair-complete"][data-rid="${id}"]`);
    return button && !button.disabled;
  }, { id: lesson.id });
  await finish.click();
  await page.waitForFunction(({ id }) => document.querySelector(`[data-lrv="repair-complete"][data-rid="${id}"]`)?.textContent.includes('Completed'), { id: lesson.id });
  const saved = await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key) || '{}').repairProgress?.[id], { key: ADAPTIVE, id: lesson.id });
  assert(saved?.completed, `${lesson.id} completion not persisted`);
}

await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on('pageerror', error => pageErrors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') console.log(`console.error: ${message.text()}`); });

try {
  await page.goto(`${BASE}#/today`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#main', { timeout: 20000 });
  await page.evaluate(({ coreKey, adaptiveKey, guideKey }) => {
    localStorage.clear();
    localStorage.setItem(guideKey, 'true');
    const now = Date.now();
    localStorage.setItem(coreKey, JSON.stringify({
      errors: [
        { id:'qa-reading-main', skill:'reading', errorTag:'main-idea', question:'Reading main idea', myAnswer:'A', correctAnswer:'B', rationale:'QA', ts:now },
        { id:'qa-listening-main', skill:'listening', errorTag:'main-idea', question:'Listening main idea', myAnswer:'A', correctAnswer:'B', rationale:'QA', ts:now },
        { id:'qa-listening-number', skill:'listening', errorTag:'number', question:'Listening number', myAnswer:'10', correctAnswer:'12', rationale:'QA', ts:now },
        { id:'qa-reading-number', skill:'reading', errorTag:'number', question:'Reading number', myAnswer:'10', correctAnswer:'12', rationale:'QA', ts:now }
      ],
      fixedErrors: [],
      lessonAnswers: {},
      studyHistory: [],
      profile: { placementSections: { vocabulary:3, grammar:3, reading:3, listening:3 }, recommendedDifficulty:3 },
      study: { preferredMinutes:20 }
    }));
    localStorage.setItem(adaptiveKey, JSON.stringify({ repairProgress:{}, learningHistory:[], reviewSchedule:{} }));
  }, { coreKey: CORE, adaptiveKey: ADAPTIVE, guideKey: GUIDE });

  await goto(page, 'improve');
  const skillSurface = page.locator('[data-v16-skill-repair-improve]');
  await skillSurface.waitFor({ timeout: 15000 });
  const matchState = await skillSurface.evaluate(root => {
    const cards = [...root.querySelectorAll('.repair-card')];
    const cardFor = id => cards.find(card => card.textContent.includes(id));
    const rr = cardFor('RR01');
    const lr = cardFor('LR01');
    const matchText = card => [...card.querySelectorAll('.chip')].map(x => x.textContent.trim()).find(x => x.includes('active match')) || '';
    return { rr: matchText(rr), lr: matchText(lr), rrText: rr?.textContent || '', lrText: lr?.textContent || '' };
  });
  assert(matchState.rr === '1 active match', `RR01 skill-aware match count wrong: ${JSON.stringify(matchState)}`);
  assert(matchState.lr === '1 active match', `LR01 skill-aware match count wrong: ${JSON.stringify(matchState)}`);
  pass('V1.6-A generic Full Mock tags stay skill-aware on deployed Improve', matchState);
  await shot(page, 'v16-a-skill-aware-improve');

  const rr = await skillRepairData(page, 'RR01');
  const lr = await skillRepairData(page, 'LR01');
  assert(rr?.questions?.length === 3, 'RR01 deployed registry missing or incomplete');
  assert(lr?.questions?.length === 3, 'LR01 deployed registry missing or incomplete');

  await completeWithRetry(page, rr);
  pass('V1.6-B RR01 deployed wrong → Retry → all correct → Finish');
  await shot(page, 'v16-b-rr01-completed');

  await goto(page, 'lesson/LR01');
  const audio = await page.locator('audio').evaluateAll(items => items.map(item => ({ src:item.src, canPlay:item.canPlayType('audio/mpeg') })));
  assert(audio.length === 2, `LR01 expected 2 audio elements, found ${audio.length}`);
  assert(audio.every(item => item.canPlay !== ''), `Chromium reports MP3 unsupported: ${JSON.stringify(audio)}`);
  const audioFetch = await page.evaluate(async () => {
    const items = [...document.querySelectorAll('audio')];
    return Promise.all(items.map(async item => {
      const response = await fetch(item.src, { cache:'no-store' });
      const bytes = (await response.arrayBuffer()).byteLength;
      return { src:item.src, status:response.status, bytes, type:response.headers.get('content-type') || '' };
    }));
  });
  for (const item of audioFetch) {
    assert(item.status === 200, `LR01 production audio GET failed: ${JSON.stringify(item)}`);
    assert(item.bytes > 1000, `LR01 production audio unexpectedly small: ${JSON.stringify(item)}`);
  }
  assert(lr.media.every(media => audioFetch.some(item => item.src.endsWith(media.src))), `LR01 rendered audio paths do not match deployed registry: ${JSON.stringify(audioFetch)}`);
  pass('V1.6-C LR01 deployed production MP3 assets are readable', { audioFetch });
  await shot(page, 'v16-c-lr01-production-audio');

  await completeWithRetry(page, lr);
  pass('V1.6-D LR01 deployed wrong → Retry → all correct → Finish');
  await shot(page, 'v16-d-lr01-completed');

  await goto(page, 'learn');
  const learnSurface = page.locator('[data-v16-skill-repair-learn]');
  await learnSurface.waitFor({ timeout: 15000 });
  const completionState = await learnSurface.evaluate(root => {
    const cards = [...root.querySelectorAll('.lesson-card')];
    const statusFor = id => {
      const card = cards.find(item => item.textContent.includes(id) || item.querySelector(`[data-lesson="${id}"]`));
      return { text:card?.textContent || '', button:card?.querySelector(`[data-lesson="${id}"]`)?.textContent || '' };
    };
    return { RR01:statusFor('RR01'), LR01:statusFor('LR01') };
  });
  assert(completionState.RR01.text.includes('Completed') && completionState.RR01.button.includes('Review'), `RR01 completed state missing on Learn: ${JSON.stringify(completionState)}`);
  assert(completionState.LR01.text.includes('Completed') && completionState.LR01.button.includes('Review'), `LR01 completed state missing on Learn: ${JSON.stringify(completionState)}`);
  pass('V1.6-E completed RR01/LR01 refresh correctly on deployed Learn');
  await shot(page, 'v16-e-learn-completed');

  assert(pageErrors.length === 0, `Deployed V1.6 page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16.json'), JSON.stringify({ base:BASE, main:'1ef32e7ed779f701228e4458af6c126ec02e9bb1', results, pageErrors }, null, 2));
  console.log(`V1.6 deployed Skill Repair QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16.json'), JSON.stringify({ base:BASE, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
