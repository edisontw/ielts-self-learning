import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUESTION_TYPE_LABS } from '../question-type-lab-v1.js';
import { QUESTION_TYPE_LABS_V2 } from '../question-type-lab-v2.js';
import {
  EXPANDED_LABS,
  LAB_DEPTH_EXPANSION,
  LAB_DEPTH_LISTENING_SCRIPTS
} from '../question-type-lab-depth-v1.js';
import { LAB_DEPTH_AUDIO } from '../question-type-lab-depth-runtime-v1.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'question-type-lab-depth-runtime-v1.js'), 'utf8');
const productionPlan = fs.readFileSync(path.join(root, 'docs/question-type-lab-production-audio-v1.md'), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const labs = [...QUESTION_TYPE_LABS, ...QUESTION_TYPE_LABS_V2];
const expectedIds = ['QR01','QR02','QR03','QR04','QR05','QR06','QL01','QL02','QL03','QL04','QL05','QL06'];

assert(EXPANDED_LABS.length === 12, 'Depth expansion must cover all 12 labs.');
assert(expectedIds.every(id => LAB_DEPTH_EXPANSION[id]?.length === 2), 'Every lab needs Set B and Set C definitions.');
assert(expectedIds.every(id => labs.some(lab => lab.id === id)), 'All expected labs must still exist after expansion.');

const allQuestionIds = [];
const newQuestionIds = [];
for (const lab of labs) {
  assert(lab.contentDepthVersion === 'v1.3', `${lab.id} must expose v1.3 content depth.`);
  assert(JSON.stringify(lab.contentSets) === JSON.stringify(['A','B','C']), `${lab.id} must expose Set A/B/C.`);
  assert(lab.estimatedMinutes >= 24, `${lab.id} should reflect deeper practice time.`);
  const titles = lab.sections.map(section => section.title || '');
  assert(titles.some(title => title.includes('Set B — Independent')), `${lab.id} is missing Set B.`);
  assert(titles.some(title => title.includes('Set C — Retry Challenge')), `${lab.id} is missing Set C.`);

  const quizzes = lab.sections.flatMap(section => section.blocks || []).filter(block => block.type === 'quiz');
  assert(quizzes.length >= 9, `${lab.id} should have at least 9 checked items after expansion.`);
  assert(lab.practiceQuestionCount === quizzes.length, `${lab.id} practiceQuestionCount must match rendered quizzes.`);
  for (const quiz of quizzes) {
    assert(Array.isArray(quiz.options) && quiz.options.includes(quiz.answer), `${quiz.id} answer must appear in options.`);
    assert((quiz.rationale || '').length >= 20, `${quiz.id} needs an explanatory rationale.`);
    assert(Boolean(quiz.errorTag), `${quiz.id} needs an error tag.`);
    allQuestionIds.push(quiz.id);
    if (/^Q[RL]\d{2}-[BC]\d$/.test(quiz.id)) newQuestionIds.push(quiz.id);
  }
}

assert(newQuestionIds.length === 72, `Expected 72 new B/C questions, found ${newQuestionIds.length}.`);
assert(new Set(allQuestionIds).size === allQuestionIds.length, 'All Lab question IDs must remain unique.');
assert(allQuestionIds.length >= 110, `Expanded Lab bank should contain at least 110 questions, found ${allQuestionIds.length}.`);

const expectedAudioKeys = ['QL01-B','QL01-C','QL02-B','QL02-C','QL03-B','QL03-C','QL04-B','QL04-C','QL05-B','QL05-C','QL06-B','QL06-C'];
assert(expectedAudioKeys.every(key => typeof LAB_DEPTH_LISTENING_SCRIPTS[key] === 'string'), 'Every Listening B/C set needs a practice script.');
assert(expectedAudioKeys.every(key => typeof LAB_DEPTH_AUDIO[key] === 'string'), 'Every Listening B/C set needs a production MP3 path.');
assert(new Set(Object.values(LAB_DEPTH_AUDIO)).size === expectedAudioKeys.length, 'Production MP3 paths must be unique.');
for (const key of expectedAudioKeys) {
  const words = LAB_DEPTH_LISTENING_SCRIPTS[key].trim().split(/\s+/).length;
  assert(words >= 35, `${key} script is too short for meaningful listening practice.`);
  assert(LAB_DEPTH_AUDIO[key].startsWith('./media/audio/question-type-labs/'), `${key} must use the reserved Question Type Lab audio directory.`);
  assert(LAB_DEPTH_AUDIO[key].endsWith('.mp3'), `${key} production path must be an MP3.`);
  assert(productionPlan.includes(`### ${key}`), `${key} needs a production-generation specification.`);
}

const expansionPos = index.indexOf('./question-type-lab-depth-v1.js');
const appPos = index.indexOf('./app.js');
const runtimePos = index.indexOf('./question-type-lab-depth-runtime-v1.js');
assert(expansionPos >= 0 && expansionPos < appPos, 'Depth content module must load before app.js.');
assert(runtimePos > appPos, 'Depth audio runtime should load after app.js.');
assert(runtime.includes('playListeningMedia({ src, script') && runtime.includes('data-lab-depth-audio'), 'Depth runtime must try production MP3 and preserve the shared fallback media layer.');

console.log('✓ V1.3 Lab depth expansion covers QR01–QR06 and QL01–QL06');
console.log(`✓ Added ${newQuestionIds.length} unseen Set B/C questions; total Lab bank ${allQuestionIds.length} questions`);
console.log('✓ Every Lab exposes Set A / Independent Set B / Retry Challenge Set C');
console.log('✓ 12 Listening scripts now have reserved production MP3 paths with browser-voice fallback');
console.log('✓ Production-generation plan covers all QL01-B/C through QL06-B/C assets');
