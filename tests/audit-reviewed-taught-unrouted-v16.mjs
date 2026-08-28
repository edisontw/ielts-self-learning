import { EXISTING_PRACTICE_RULES } from '../existing-practice-routing-v16.js';
import { V14_REPAIR_LESSONS } from '../repair-registry-v15.js';
import { V16_SKILL_REPAIR_LESSONS } from '../skill-repair-registry-v16.js';

const modulePaths = [
  '../data.js',
  '../curriculum-batch-01.js',
  '../curriculum-batch-02.js',
  '../question-type-lab-v1.js',
  '../question-type-lab-v2.js',
  '../question-type-lab-depth-v1.js',
  '../mini-test-data-v1.js',
  '../mini-test-data-v2.js',
  '../mini-test-data-v3.js',
  '../mock-test-data-v1.js'
];

const modules = [];
for (const path of modulePaths) modules.push({ path, ns: await import(path) });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const seen = new WeakSet();
const tagged = [];

function sourceLayer(id = '') {
  if (/^(MR|ML)/.test(id)) return 'mini-test';
  if (/^M[A-Z0-9]*[-_]/.test(id) || /^MA\d/.test(id)) return 'full-mock';
  if (/^(QR|QL)/.test(id)) return 'lab';
  return 'core';
}

function visit(value, source) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (typeof value.id === 'string' && typeof value.errorTag === 'string') {
    tagged.push({
      id: value.id,
      errorTag: value.errorTag,
      layer: sourceLayer(value.id),
      source
    });
  }
  if (Array.isArray(value)) {
    for (const item of value) visit(item, source);
  } else {
    for (const child of Object.values(value)) visit(child, source);
  }
}

for (const { path, ns } of modules) visit(ns, path);

const reviewed = {
  'listening-location-update': {
    ids: ['QL03-B2', 'QL03-C3', 'QL03-Q2'],
    layer: 'lab',
    owner: 'QL03'
  },
  'listening-word-fixation': {
    ids: ['L01-Q5', 'L02-Q5', 'L02-Q6'],
    layer: 'core',
    owner: 'L01/L02'
  },
  'listening-word-limit': {
    ids: ['QL02-Q3', 'QL05-C3', 'QL05-Q2'],
    layer: 'lab',
    owner: 'QL02/QL05'
  },
  'reading-mcq-scope': {
    ids: ['QR03-B3', 'QR03-C3', 'QR03-Q2'],
    layer: 'lab',
    owner: 'QR03'
  },
  'reading-topic-trap': {
    ids: ['QR05-B3', 'QR05-C2', 'QR05-Q2'],
    layer: 'lab',
    owner: 'QR05'
  }
};

for (const [tag, decision] of Object.entries(reviewed)) {
  const rows = tagged.filter(item => item.errorTag === tag);
  const ids = rows.map(item => item.id).sort();
  assert(rows.length === 3, `${tag} must remain a three-signal reviewed family; found ${rows.length}.`);
  assert(JSON.stringify(ids) === JSON.stringify([...decision.ids].sort()), `${tag} question IDs changed: ${ids.join(', ')}.`);
  assert(rows.every(item => item.layer === decision.layer), `${tag} must remain ${decision.layer}-only until a new transfer signal is explicitly reviewed.`);
  assert(rows.every(item => !['mini-test', 'full-mock'].includes(item.layer)), `${tag} gained a non-retriable Test/Mock signal and requires a new semantics-first routing review.`);

  const routeOwners = EXISTING_PRACTICE_RULES.filter(rule => rule.tags.includes(tag));
  assert(routeOwners.length === 0, `${tag} must not gain an existing-practice route while all evidence remains local ${decision.layer} practice.`);

  const vgOwners = V14_REPAIR_LESSONS.filter(lesson => (lesson.triggerTags || []).includes(tag));
  assert(vgOwners.length === 0, `${tag} must not be absorbed into Vocabulary/Grammar Repair.`);

  const skillRepairOwners = V16_SKILL_REPAIR_LESSONS.filter(lesson => (lesson.triggerTags || []).includes(tag));
  assert(skillRepairOwners.length === 0, `${tag} must not gain RR/LR ownership without new untreated Test/Mock evidence.`);

  console.log(`✓ ${tag}: 3 ${decision.layer}-only signals remain intentionally TAUGHT-UNROUTED under ${decision.owner}; no circular reuse route or Repair ownership.`);
}

const wordLimitRows = tagged.filter(item => item.errorTag === 'listening-word-limit').map(item => item.id).sort();
assert(wordLimitRows.includes('QL02-Q3') && wordLimitRows.includes('QL05-Q2') && wordLimitRows.includes('QL05-C3'), 'Listening word-limit semantic review set changed unexpectedly.');

console.log('✓ V1.6 reviewed TAUGHT-UNROUTED gate: 5 families / 15 local Practice signals, 0 Mini Test or Full Mock transfer signals, 0 new routes, 0 new Repair lessons.');
