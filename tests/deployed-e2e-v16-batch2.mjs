import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://edisontw.github.io/ielts-self-learning/';
const OUT = path.resolve('qa-artifacts-v16-batch2');
const CORE = 'ielts-self-learning-v1';
const ADAPTIVE = 'ielts-adaptive-v1';
const GUIDE = 'ielts-site-guide-dismissed-v1';
const PRODUCTION_MAIN = '50b1f600d4db1f6c5035cf6937700685dd2d2a97';
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

async function skillRepairData(page, id) {
  return page.evaluate(async ({ base, id }) => {
    const { V16_SKILL_REPAIR_LESSONS } = await import(`${base}skill-repair-registry-v16.js?qa=${Date.now()}`);
    const lesson = V16_SKILL_REPAIR_LESSONS.find(item => item.id === id);
    return lesson ? {
      id:lesson.id,
      title:lesson.title,
      triggerTags:lesson.triggerTags,
      errorSkills:lesson.errorSkills,
      evidence:lesson.evidence,
      questions:lesson.questions.map(q => ({ context:q.context || '', answer:q.answer, options:q.options, prompt:q.prompt })),
      media:(lesson.media || []).map(item => ({ id:item.id, src:item.src, label:item.label }))
    } : null;
  }, { base:BASE, id });
}

async function clickValue(page, id, index, wanted) {
  const options = page.locator(`[data-lrv="repair-option"][data-rid="${id}"][data-q="${index}"]`);
  for (let i = 0; i < await options.count(); i++) {
    const item = options.nth(i);
    if (await item.getAttribute('data-value') === wanted) { await item.click(); return; }
  }
  throw new Error(`${id} Q${index + 1}: no option with data-value=${wanted}`);
}

async function completeWithRetry(page, lesson) {
  await goto(page, `lesson/${lesson.id}`);
  await page.locator(`[data-v15-repair-route="${lesson.id}"]`).waitFor({ timeout:15000 });
  const first = lesson.questions[0];
  const wrong = first.options.find(option => option !== first.answer);
  assert(wrong, `${lesson.id} has no wrong option for retry QA`);

  await clickValue(page, lesson.id, 0, wrong);
  await page.locator(`[data-lrv="repair-check"][data-rid="${lesson.id}"][data-q="0"]`).click();
  await page.locator(`[data-lrv="repair-retry"][data-rid="${lesson.id}"][data-q="0"]`).waitFor({ timeout:10000 });
  assert(await page.locator(`[data-lrv="repair-complete"][data-rid="${lesson.id}"]`).isDisabled(), `${lesson.id} Finish enabled after wrong answer`);
  await page.locator(`[data-lrv="repair-retry"][data-rid="${lesson.id}"][data-q="0"]`).click();
  await page.waitForFunction(({ id }) => {
    const option = document.querySelector(`[data-lrv="repair-option"][data-rid="${id}"][data-q="0"]`);
    return option && !option.disabled;
  }, { id:lesson.id });

  for (let i = 0; i < lesson.questions.length; i++) {
    await clickValue(page, lesson.id, i, lesson.questions[i].answer);
    await page.locator(`[data-lrv="repair-check"][data-rid="${lesson.id}"][data-q="${i}"]`).click();
    await page.waitForFunction(({ id, i }) => {
      const card = document.querySelector(`[data-lrv="repair-check"][data-rid="${id}"][data-q="${i}"]`)?.closest('.quiz-card');
      return Boolean(card?.querySelector('.feedback.correct'));
    }, { id:lesson.id, i });
  }

  await page.waitForFunction(({ id }) => {
    const button = document.querySelector(`[data-lrv="repair-complete"][data-rid="${id}"]`);
    return button && !button.disabled;
  }, { id:lesson.id });
  await page.locator(`[data-lrv="repair-complete"][data-rid="${lesson.id}"]`).click();
  await page.waitForFunction(({ id }) => document.querySelector(`[data-lrv="repair-complete"][data-rid="${id}"]`)?.textContent.includes('Completed'), { id:lesson.id });
  const saved = await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key) || '{}').repairProgress?.[id], { key:ADAPTIVE, id:lesson.id });
  assert(saved?.completed, `${lesson.id} completion not persisted`);
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
        { id:'qa-reading-main', skill:'reading', errorTag:'main-idea', question:'Reading main idea', myAnswer:'A', correctAnswer:'B', rationale:'QA', ts:now },
        { id:'qa-listening-main-control', skill:'listening', errorTag:'main-idea', question:'Listening main idea control', myAnswer:'A', correctAnswer:'B', rationale:'QA', ts:now },
        { id:'qa-listening-number', skill:'listening', errorTag:'number', question:'Listening number', myAnswer:'10', correctAnswer:'12', rationale:'QA', ts:now },
        { id:'qa-reading-number-control', skill:'reading', errorTag:'number', question:'Reading number control', myAnswer:'10', correctAnswer:'12', rationale:'QA', ts:now },
        { id:'qa-reading-inference', skill:'reading', errorTag:'inference', question:'Reading inference', myAnswer:'A', correctAnswer:'B', rationale:'QA', ts:now },
        { id:'qa-listening-inference-control', skill:'listening', errorTag:'inference', question:'Listening inference control', myAnswer:'A', correctAnswer:'B', rationale:'QA', ts:now }
      ],
      fixedErrors:[], lessonAnswers:{}, studyHistory:[],
      profile:{ placementSections:{ vocabulary:3, grammar:3, reading:3, listening:3 }, recommendedDifficulty:3 },
      study:{ preferredMinutes:20 }
    }));
    localStorage.setItem(adaptiveKey, JSON.stringify({ repairProgress:{}, learningHistory:[], reviewSchedule:{} }));
  }, { coreKey:CORE, adaptiveKey:ADAPTIVE, guideKey:GUIDE });

  await goto(page, 'improve');
  const skillSurface = page.locator('[data-v16-skill-repair-improve]');
  await skillSurface.waitFor({ timeout:15000 });
  const matchState = await skillSurface.evaluate(root => {
    const cards = [...root.querySelectorAll('.repair-card')];
    const stateFor = id => {
      const card = cards.find(item => item.querySelector(`[data-lesson="${id}"]`) || item.textContent.includes(id));
      const match = [...(card?.querySelectorAll('.chip') || [])].map(x => x.textContent.trim()).find(x => x.includes('active match')) || '';
      return { match, text:card?.textContent || '' };
    };
    return { RR01:stateFor('RR01'), LR01:stateFor('LR01'), RR02:stateFor('RR02') };
  });
  assert(matchState.RR01.match === '1 active match', `RR01 skill-aware match count wrong: ${JSON.stringify(matchState)}`);
  assert(matchState.LR01.match === '1 active match', `LR01 skill-aware match count wrong: ${JSON.stringify(matchState)}`);
  assert(matchState.RR02.match === '1 active match', `RR02 inference match count wrong or Listening control cross-routed: ${JSON.stringify(matchState)}`);
  pass('V1.6-B2-A generic Full Mock tags remain skill-aware, including Reading inference', matchState);
  await shot(page, 'v16-b2-a-skill-aware-improve');

  const rr01 = await skillRepairData(page, 'RR01');
  const lr01 = await skillRepairData(page, 'LR01');
  const rr02 = await skillRepairData(page, 'RR02');
  assert(rr01?.questions?.length === 3 && lr01?.questions?.length === 3, 'Batch 1 Skill Repair registry regressed');
  assert(rr02?.questions?.length === 3, 'RR02 deployed registry missing or incomplete');
  assert(rr02.triggerTags.includes('reading-inference') && rr02.triggerTags.includes('inference'), `RR02 trigger tags wrong: ${JSON.stringify(rr02.triggerTags)}`);
  assert(JSON.stringify(rr02.errorSkills) === JSON.stringify(['reading']), `RR02 skill constraint wrong: ${JSON.stringify(rr02.errorSkills)}`);
  assert(rr02.evidence?.auditedQuestions === 9, `RR02 deployed evidence count wrong: ${JSON.stringify(rr02.evidence)}`);
  assert(rr02.questions.every(q => q.context.length > 100), 'RR02 deployed guided questions must use substantive Reading contexts');
  await goto(page, 'lesson/RR02');
  await page.locator('[data-v15-repair-route="RR02"]').waitFor({ timeout:15000 });
  assert((await page.locator('#main').textContent()).includes('Infer Only What the Evidence Supports'), 'RR02 title missing on deployed direct route');
  pass('V1.6-B2-B RR02 deployed registry and direct route match audited design');
  await shot(page, 'v16-b2-b-rr02-route');

  await completeWithRetry(page, rr02);
  pass('V1.6-B2-C RR02 deployed wrong → Retry → all correct → Finish');
  await shot(page, 'v16-b2-c-rr02-completed');

  await goto(page, 'lesson/LR01');
  const audioFetch = await page.locator('audio').evaluateAll(async items => Promise.all(items.map(async item => {
    const response = await fetch(item.src, { cache:'no-store' });
    const bytes = (await response.arrayBuffer()).byteLength;
    return { src:item.src, status:response.status, bytes, canPlay:item.canPlayType('audio/mpeg'), type:response.headers.get('content-type') || '' };
  })));
  assert(audioFetch.length === 2, `LR01 expected 2 audio elements, found ${audioFetch.length}`);
  for (const item of audioFetch) {
    assert(item.status === 200, `LR01 production audio GET failed: ${JSON.stringify(item)}`);
    assert(item.bytes > 1000, `LR01 production audio unexpectedly small: ${JSON.stringify(item)}`);
    assert(item.canPlay !== '', `Chromium reports MP3 unsupported: ${JSON.stringify(item)}`);
  }
  assert(lr01.media.every(media => audioFetch.some(item => item.src.endsWith(media.src))), `LR01 rendered audio paths do not match deployed registry: ${JSON.stringify(audioFetch)}`);
  pass('V1.6-B2-D Batch 1 LR01 production MP3 regression remains healthy', { audioFetch });
  await shot(page, 'v16-b2-d-lr01-audio-regression');

  await goto(page, 'learn');
  const learnSurface = page.locator('[data-v16-skill-repair-learn]');
  await learnSurface.waitFor({ timeout:15000 });
  const learnState = await learnSurface.evaluate(root => {
    const cards = [...root.querySelectorAll('.lesson-card')];
    const stateFor = id => {
      const card = cards.find(item => item.querySelector(`[data-lesson="${id}"]`));
      return { text:card?.textContent || '', button:card?.querySelector(`[data-lesson="${id}"]`)?.textContent || '' };
    };
    return { RR01:stateFor('RR01'), LR01:stateFor('LR01'), RR02:stateFor('RR02') };
  });
  assert(learnState.RR02.text.includes('Completed') && learnState.RR02.button.includes('Review'), `RR02 completed state missing on Learn: ${JSON.stringify(learnState)}`);
  assert(learnState.RR01.text.includes('Main Idea vs Supporting Detail'), `RR01 missing from deployed Learn after Batch 2: ${JSON.stringify(learnState)}`);
  assert(learnState.LR01.text.includes('Track the Final Number'), `LR01 missing from deployed Learn after Batch 2: ${JSON.stringify(learnState)}`);
  pass('V1.6-B2-E RR02 completion refreshes and Batch 1 units remain on deployed Learn');
  await shot(page, 'v16-b2-e-learn-completed');

  assert(pageErrors.length === 0, `Deployed V1.6 Batch 2 page errors detected: ${pageErrors.join(' | ')}`);
  await fs.writeFile(path.join(OUT, 'results-v16-batch2.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors }, null, 2));
  console.log(`V1.6 Batch 2 deployed Skill Repair QA: ${results.length}/${results.length} PASS`);
} catch (error) {
  await fs.writeFile(path.join(OUT, 'results-v16-batch2.json'), JSON.stringify({ base:BASE, main:PRODUCTION_MAIN, results, pageErrors, failure:String(error?.stack || error) }, null, 2));
  try { await shot(page, 'v16-b2-failure'); } catch {}
  throw error;
} finally {
  await browser.close();
}
