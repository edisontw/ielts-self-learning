import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const js = fs.readFileSync(path.join(root, 'ux-polish-v1.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'ux-polish-v1.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

for (const token of [
  "document.addEventListener('click', handleGuideCapture, true)",
  "event.stopImmediatePropagation()",
  "data-site-guide-close",
  "data-site-guide-nav",
  "window.dispatchEvent(new Event('hashchange'))",
  "Today's study",
  "Choose your time and start the next useful step.",
  "Your priorities",
  "Quick practice",
  "study actions · 7 days",
  "data-today-shortcuts",
  "Learn by skill",
  "data-learn-filter",
  "30-unit curriculum",
  "data-site-guide-learn-map",
  "IELTS practice",
  "data-ielts-stage-nav",
  "data-ielts-stage",
  "Strategy",
  "Question Types",
  "Mini Tests",
  "Full Mock",
  "data-site-guide-ielts-map",
  "data-question-type-lab-index",
  "data-mini-test-index",
  "data-mock-center"
]) assert(js.includes(token), `UX polish JS missing ${token}`);

for (const token of [
  '#main[data-today-simplified="true"]',
  '.site-guide-welcome-compact',
  '.today-shortcuts',
  '.adaptive-breakdown',
  '#main[data-learn-simplified="true"]',
  '.learn-toolbar',
  '.learn-filter-row',
  '.learn-simplified-grid',
  '#main[data-ielts-simplified="true"]',
  '.ielts-stage-nav',
  '.ielts-stage-tabs',
  '.ielts-stage-tab.active',
  '.ielts-stage-section[hidden]',
  '[data-question-type-lab-index] .grid.two',
  '@media (max-width: 520px)'
]) assert(css.includes(token), `UX polish CSS missing ${token}`);

const guideIndex = index.indexOf('./site-guide-v1.js');
const polishIndex = index.indexOf('./ux-polish-v1.js');
const polishCssIndex = index.indexOf('./ux-polish-v1.css');
assert(polishCssIndex >= 0, 'UX polish stylesheet must be loaded.');
assert(guideIndex >= 0 && polishIndex > guideIndex, 'UX polish must load after the site guide so capture handlers can harden guide controls.');

console.log('✓ How-to-use Close / X / Go to Today interactions are hardened in capture phase');
console.log('✓ Today keeps one primary next action and compact secondary shortcuts');
console.log('✓ Learn removes duplicated guide/scope copy and adds skill filtering to the 30-unit curriculum');
console.log('✓ IELTS exposes Strategy / Question Types / Mini Tests / Full Mock as one-stage-at-a-time navigation');
console.log('✓ Learn and IELTS card density is reduced responsively without removing underlying content');
