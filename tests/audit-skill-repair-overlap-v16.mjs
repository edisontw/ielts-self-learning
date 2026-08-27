import { LESSONS } from '../data.js';

const modulePaths = [
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

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const questions = new Map();
const seen = new WeakSet();
const prefixPattern = /^(reading|listening|writing|speaking|study)-/;

function questionSkill(id = '') {
  if (/^MA\d+-L/i.test(id) || /^ML/i.test(id) || /^QL/i.test(id) || /^L\d/i.test(id)) return 'listening';
  if (/^MA\d+-R/i.test(id) || /^MR/i.test(id) || /^QR/i.test(id) || /^R\d/i.test(id)) return 'reading';
  return 'other';
}

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
    if (!questions.has(value.id)) {
      questions.set(value.id, {
        id: value.id,
        tag: value.errorTag,
        family: value.errorTag.replace(prefixPattern, ''),
        skill: questionSkill(value.id),
        layer: sourceLayer(value.id),
        source
      });
    }
  }
  if (Array.isArray(value)) for (const item of value) visit(item, source);
  else for (const child of Object.values(value)) visit(child, source);
}

for (const { path, ns } of modules) visit(ns, path);

const skillFamilyRows = new Map();
for (const row of questions.values()) {
  if (!['reading', 'listening'].includes(row.skill)) continue;
  const key = `${row.skill}:${row.family}`;
  const current = skillFamilyRows.get(key) || { count:0, layers:new Set(), tags:new Set(), ids:[] };
  current.count += 1;
  current.layers.add(row.layer);
  current.tags.add(row.tag);
  current.ids.push(row.id);
  skillFamilyRows.set(key, current);
}

const instructional = LESSONS.filter(lesson => !['mini-test', 'full-mock'].includes(lesson.lessonType));
const lessonById = new Map(instructional.map(lesson => [lesson.id, lesson]));
const teachingTagOwners = tag => instructional.filter(lesson => (lesson.errorTags || []).includes(tag)).map(lesson => lesson.id);

const candidates = [
  {
    key:'reading:detail', expected:21,
    coverage:['R02','R05','QR02','QR03'],
    directTags:['reading-detail-confusion','reading-heading-detail','reading-mcq-detail'],
    decision:'REUSE',
    reason:'Core and Labs already teach claim/detail separation, heading detail traps, and MCQ true-detail traps.'
  },
  {
    key:'listening:detail', expected:16,
    coverage:['L02','L03','L05','QL05'],
    directTags:['listening-missed-detail','listening-short-answer-type'],
    decision:'REUSE',
    reason:'Existing lessons already teach chunked detail retrieval, paraphrased detail, answer prediction, and exact requested detail.'
  },
  {
    key:'listening:distractor', expected:14,
    coverage:['L04','QL01'],
    directTags:['listening-distractor','listening-first-mention'],
    decision:'REUSE',
    reason:'L04 and QL01 explicitly teach first mention → correction/rejection → final option tracking.'
  },
  {
    key:'listening:correction', expected:11,
    coverage:['L04','QL06'],
    directTags:['listening-correction'],
    decision:'REUSE',
    reason:'Correction language and delayed commitment are already explicit teaching targets in L04 and reinforced in QL06.'
  },
  {
    key:'reading:scope', expected:10,
    coverage:['R04','QR01','QR03'],
    directTags:['reading-scope','reading-mcq-scope'],
    decision:'REUSE',
    reason:'R04/QR01 explicitly teach exact-claim scope; QR03 reinforces broad/narrow option traps.'
  },
  {
    key:'reading:inference', expected:9,
    coverage:[],
    directTags:['reading-inference'],
    decision:'NEW-REPAIR',
    reason:'Inference recurs in Mini Test and Full Mock evidence, but no instructional Core/Lab lesson owns reading-inference as a teaching/error target.'
  }
];

console.log('V1.6 Batch 2 coverage-overlap audit');
console.log('count | family | decision | existing instructional coverage');
for (const candidate of candidates) {
  const row = skillFamilyRows.get(candidate.key);
  assert(row, `Missing audited family ${candidate.key}`);
  assert(row.count === candidate.expected, `${candidate.key} count changed: expected ${candidate.expected}, got ${row.count}`);
  for (const id of candidate.coverage) assert(lessonById.has(id), `${candidate.key} coverage lesson ${id} is missing`);
  const directOwners = [...new Set(candidate.directTags.flatMap(teachingTagOwners))].sort();
  if (candidate.decision === 'NEW-REPAIR') {
    assert(directOwners.length === 0, `${candidate.key} now has instructional owners (${directOwners.join(', ')}); re-audit before keeping NEW-REPAIR decision`);
  } else {
    assert(directOwners.length > 0, `${candidate.key} lost all direct instructional tag coverage`);
  }
  const coverage = candidate.coverage.length ? candidate.coverage.join(',') : 'none';
  console.log(`${String(row.count).padStart(2)} | ${candidate.key.padEnd(21)} | ${candidate.decision.padEnd(10)} | ${coverage}`);
  console.log(`   layers=${[...row.layers].sort().join(',')} tags=${[...row.tags].sort().join(',')} directOwners=${directOwners.join(',') || 'none'}`);
  console.log(`   ${candidate.reason}`);
}

const inference = skillFamilyRows.get('reading:inference');
assert(inference.layers.has('mini-test') && inference.layers.has('full-mock'), 'Reading inference should be recurrent across Mini Test and Full Mock evidence.');
assert(candidates.filter(x => x.decision === 'NEW-REPAIR').map(x => x.key).join(',') === 'reading:inference', 'Batch 2 should identify exactly one untreated Repair gap.');

console.log('✓ Five high-frequency families have adequate existing Core/Lab teaching coverage and should route/reuse instead of duplicating Repair content');
console.log('✓ Reading inference is the only current Batch 2 evidence family with repeated test evidence but no direct Core/Lab instructional owner');
