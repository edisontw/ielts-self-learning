import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const source = fs.readFileSync(path.join(root, 'site-guide-v1.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'site-guide-v1.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

class MemoryStorage {
  constructor(seed = {}) { this.map = new Map(Object.entries(seed)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  writable: true,
  value: new MemoryStorage()
});

const { DISMISSED_KEY, learnerState, welcomeHTML, learnMapHTML, ieltsGuideHTML } = await import('../site-guide-v1.js');

let state = learnerState();
assert(!state.placement && !state.plan && !state.started && !state.review, 'Fresh learner guide state must begin with Placement.');
let welcome = welcomeHTML();
for (const token of ['Quick Placement', 'Create a Study Plan', 'Work from Today', 'Repair and retry']) {
  assert(welcome.includes(token), `Getting Started guide missing ${token}.`);
}
assert(welcome.includes('data-site-guide-nav="placement"'), 'Fresh learner CTA must open Quick Placement.');
assert(welcome.includes('It is not an official IELTS band'), 'Placement explanation must preserve the non-band guardrail.');

localStorage.setItem('ielts-self-learning-v1', JSON.stringify({
  placement: { stage: 'B2' },
  completedLessons: ['LB01'],
  lessonAnswers: { 'LB01-Q1': { selected: 'x', checked: true } },
  errors: [{ id: 'e1' }],
  fixedErrors: []
}));
localStorage.setItem('ielts-study-plan-v1', JSON.stringify({ weeks: [{ week: 1, sessions: [] }] }));
state = learnerState();
assert(state.placement && state.plan && state.started && state.review, 'Guide state must recognize Placement, Study Plan, study and repair evidence.');
welcome = welcomeHTML();
assert(welcome.includes('data-site-guide-nav="today"'), 'Returning learner CTA must continue from Today.');
assert((welcome.match(/site-guide-status done/g) || []).length === 4, 'Completed four-step path must show four Done statuses.');

const learn = learnMapHTML();
for (const token of ['Learning Better', 'Core skills', 'Repair', 'IELTS transfer']) assert(learn.includes(token), `Learn map missing ${token}.`);

const ielts = ieltsGuideHTML();
for (const token of ['Strategy', 'Question Type Lab', 'Mini Test', 'ML01 and ML02 now use production MP3 audio']) assert(ielts.includes(token), `IELTS guide missing ${token}.`);

for (const token of [
  'data-site-guide-open',
  'data-site-guide-close',
  'data-site-guide-backdrop',
  "event.target === backdrop",
  "event.key === 'Escape'",
  'Local-first workspace',
  'Later V1',
  'Production audio live'
]) assert(source.includes(token), `Site guide source missing ${token}.`);

for (const route of ['today', 'learn', 'ielts', 'improve', 'progress']) {
  assert(source.includes(`data-site-guide-nav=\"${route}\"`), `Help modal must link to ${route}.`);
}
assert(source.includes(`const DISMISSED_KEY = 'ielts-site-guide-dismissed-v1'`), 'Guide dismissal must use a stable local key.');
assert(DISMISSED_KEY === 'ielts-site-guide-dismissed-v1', 'Exported dismissal key is incorrect.');

for (const token of ['.site-guide-steps', '.site-guide-modal-backdrop', '.site-guide-page-grid', '@media (max-width: 680px)']) {
  assert(css.includes(token), `Site guide CSS missing ${token}.`);
}

const cssIndex = index.indexOf('./site-guide-v1.css');
const appIndex = index.indexOf('./app.js');
const guideIndex = index.indexOf('./site-guide-v1.js');
const diagnosticsIndex = index.indexOf('./diagnostics-v1.js');
assert(cssIndex >= 0, 'index.html must load site-guide-v1.css.');
assert(appIndex >= 0 && guideIndex > appIndex, 'Site guide must load after the base app.');
assert(diagnosticsIndex >= 0 && guideIndex > diagnosticsIndex, 'Site guide must load after the existing progressive enhancements.');
assert(!index.includes('self-learning prototype:'), 'Public meta description must not retain outdated prototype wording.');

console.log('✓ Fresh and returning learners receive a four-step Getting Started path');
console.log('✓ Learn and IELTS pages explain curriculum layers and production audio status');
console.log('✓ Help modal links all five workspace areas and closes by button, backdrop or Escape');
console.log('✓ Site guide is responsive, dismissible and loaded after existing runtimes');
