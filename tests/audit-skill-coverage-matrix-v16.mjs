import { LESSONS } from '../data.js';
import { V14_REPAIR_LESSONS } from '../repair-registry-v15.js';
import { V16_SKILL_REPAIR_FAMILIES, V16_SKILL_REPAIR_LESSONS } from '../skill-repair-registry-v16.js';
import { EXISTING_PRACTICE_RULES } from '../existing-practice-routing-v16.js';
import { normalizedMiniTestErrorTag } from '../listening-sequence-semantics-v16.js';

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

function familyOf(tag = '') {
  return String(tag).replace(prefixPattern, '');
}

function visit(value, source) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (typeof value.id === 'string' && typeof value.errorTag === 'string' && !questions.has(value.id)) {
    const tag = normalizedMiniTestErrorTag({ id:value.id, errorTag:value.errorTag });
    questions.set(value.id, {
      id: value.id,
      tag,
      family: familyOf(tag),
      skill: questionSkill(value.id),
      layer: sourceLayer(value.id),
      source
    });
  }
  if (Array.isArray(value)) for (const item of value) visit(item, source);
  else for (const child of Object.values(value)) visit(child, source);
}

for (const { path, ns } of modules) visit(ns, path);
assert(questions.size >= 388, `Coverage matrix scanned only ${questions.size} tagged questions; canonical post-Batch 3 inventory is at least 388.`);

const skillFamilyRows = new Map();
for (const row of questions.values()) {
  if (!['reading', 'listening'].includes(row.skill)) continue;
  const key = `${row.skill}:${row.family}`;
  const current = skillFamilyRows.get(key) || {
    key,
    skill: row.skill,
    family: row.family,
    count: 0,
    layers: new Set(),
    tags: new Set(),
    ids: []
  };
  current.count += 1;
  current.layers.add(row.layer);
  current.tags.add(row.tag);
  current.ids.push(row.id);
  skillFamilyRows.set(key, current);
}

const instructional = LESSONS.filter(lesson => !['mini-test', 'full-mock'].includes(lesson.lessonType));

// Semantics-first aliases are used only when the audited family is clearly taught by an
// existing lesson but its historical errorTag vocabulary does not encode that ownership.
// They do not create runtime routes or learner state.
const SEMANTIC_TEACHING_OVERRIDES = {
  'listening:main-idea': ['L01'],
  'listening:spatial-sequence': ['QL03']
};

function exactTeachingOwners(row) {
  const direct = instructional
    .filter(lesson => lesson.skill === row.skill && (lesson.errorTags || []).some(tag => row.tags.has(tag)))
    .map(lesson => lesson.id);
  return [...new Set([...direct, ...(SEMANTIC_TEACHING_OVERRIDES[row.key] || [])])].sort();
}

function vgRepairOwners(row) {
  return V14_REPAIR_LESSONS
    .filter(lesson => (lesson.triggerTags || []).some(tag => row.tags.has(tag)))
    .map(lesson => lesson.id)
    .sort();
}

function skillRepairOwners(row) {
  const owners = [];
  for (const lesson of V16_SKILL_REPAIR_LESSONS) {
    if (lesson.skill !== row.skill) continue;
    if ((lesson.triggerTags || []).some(tag => row.tags.has(tag))) owners.push(lesson.id);
  }
  return owners.sort();
}

function existingRouteOwners(row) {
  return EXISTING_PRACTICE_RULES
    .filter(rule => rule.skills.includes(row.skill) && rule.tags.some(tag => row.tags.has(tag)))
    .map(rule => `${rule.primary.id}→${rule.transfer.id}`)
    .filter((value, index, all) => all.indexOf(value) === index)
    .sort();
}

function classify(row) {
  const vgRepairs = vgRepairOwners(row);
  const skillRepairs = skillRepairOwners(row);
  const routes = existingRouteOwners(row);
  const teaching = exactTeachingOwners(row);
  if (vgRepairs.length) return { status: 'V/G-REPAIR', owners: vgRepairs, teaching, routes };
  if (skillRepairs.length) return { status: 'SKILL-REPAIR', owners: skillRepairs, teaching, routes };
  if (routes.length) return { status: 'ROUTED-REUSE', owners: routes, teaching, routes };
  if (teaching.length) return { status: 'TAUGHT-UNROUTED', owners: teaching, teaching, routes };
  return { status: 'GAP-REVIEW', owners: [], teaching, routes };
}

for (const [familyKey, family] of Object.entries(V16_SKILL_REPAIR_FAMILIES)) {
  const skill = family.skills?.[0];
  const normalized = `${skill}:${familyOf(familyKey)}`;
  const row = skillFamilyRows.get(normalized);
  assert(row, `Skill Repair registry family ${familyKey} no longer exists in the audited question bank.`);
  const lessons = V16_SKILL_REPAIR_LESSONS.filter(lesson => lesson.skill === skill && (lesson.triggerTags || []).some(tag => family.tags.includes(tag)));
  assert(lessons.length > 0, `Skill Repair registry family ${familyKey} has no Repair lesson owner.`);
}

const recurring = [...skillFamilyRows.values()]
  .filter(row => row.count >= 3)
  .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

const buckets = {
  'V/G-REPAIR': [],
  'SKILL-REPAIR': [],
  'ROUTED-REUSE': [],
  'TAUGHT-UNROUTED': [],
  'GAP-REVIEW': []
};

console.log(`V1.6 post-Batch 3 Reading / Listening coverage matrix — ${questions.size} tagged questions scanned`);
console.log('count | family | status | owners / destinations | layers | exact tags');
for (const row of recurring) {
  const result = classify(row);
  buckets[result.status].push({ row, result });
  const owners = result.owners.join(',') || 'none';
  const layers = [...row.layers].sort().join(',');
  const tags = [...row.tags].sort().join(',');
  console.log(`${String(row.count).padStart(2)} | ${row.key.padEnd(28)} | ${result.status.padEnd(16)} | ${owners.padEnd(18)} | ${layers} | ${tags}`);
}

console.log('\nCoverage summary');
for (const status of ['V/G-REPAIR', 'SKILL-REPAIR', 'ROUTED-REUSE', 'TAUGHT-UNROUTED', 'GAP-REVIEW']) {
  const rows = buckets[status];
  console.log(`${status}: ${rows.length} recurring families / ${rows.reduce((sum, item) => sum + item.row.count, 0)} tagged questions`);
}

console.log('\nHighest-priority follow-up candidates');
const followUp = [...buckets['GAP-REVIEW'], ...buckets['TAUGHT-UNROUTED']]
  .sort((a, b) => b.row.count - a.row.count || a.row.key.localeCompare(b.row.key));
for (const { row, result } of followUp.slice(0, 12)) {
  console.log(`${String(row.count).padStart(2)} | ${row.key} | ${result.status} | tags=${[...row.tags].sort().join(',')} | owners=${result.owners.join(',') || 'none'}`);
}
if (!followUp.length) console.log('none');

const spatialSequence = skillFamilyRows.get('listening:spatial-sequence');
const proceduralSequence = skillFamilyRows.get('listening:procedural-sequence');
assert(spatialSequence?.count === 2, 'Listening spatial-sequence must contain exactly ML02-Q4 and ML03-Q4.');
assert(JSON.stringify([...spatialSequence.ids].sort()) === JSON.stringify(['ML02-Q4','ML03-Q4']), 'Listening spatial-sequence IDs changed unexpectedly.');
assert(classify(spatialSequence).status === 'TAUGHT-UNROUTED' && classify(spatialSequence).owners.includes('QL03'), 'Spatial route sequence must be recognised as taught by QL03 without a synthetic Core → Lab route.');
assert(proceduralSequence?.count === 1 && proceduralSequence.ids[0] === 'ML04-Q3', 'Listening procedural-sequence must contain only ML04-Q3.');
assert(classify(proceduralSequence).status === 'GAP-REVIEW', 'The single procedural/event sequence signal remains untreated but subthreshold.');
assert(!skillFamilyRows.has('listening:sequence'), 'Umbrella Listening sequence family must disappear after semantic normalization.');

assert(recurring.length > 0, 'No recurring Reading / Listening error families were audited.');
assert(buckets['V/G-REPAIR'].some(item => item.result.owners.includes('VG04') && item.row.family === 'paraphrase'), 'VG04 paraphrase ownership is missing from the coverage matrix.');
assert(buckets['V/G-REPAIR'].some(item => item.result.owners.includes('VG05') && item.row.family === 'answer-type'), 'VG05 answer-type ownership is missing from the coverage matrix.');
assert(buckets['SKILL-REPAIR'].some(item => item.result.owners.includes('RR01')), 'RR01 is missing from the post-Batch 3 coverage matrix.');
assert(buckets['SKILL-REPAIR'].some(item => item.result.owners.includes('RR02')), 'RR02 is missing from the post-Batch 3 coverage matrix.');
assert(buckets['SKILL-REPAIR'].some(item => item.result.owners.includes('RR03') && item.row.key === 'reading:reference'), 'RR03 must own the three audited Reading reference signals.');
assert(buckets['SKILL-REPAIR'].some(item => item.result.owners.includes('LR01')), 'LR01 is missing from the post-Batch 3 coverage matrix.');
assert(buckets['ROUTED-REUSE'].some(item => item.row.key === 'reading:detail'), 'Batch 3 Reading detail routing is missing from the coverage matrix.');
assert(buckets['ROUTED-REUSE'].some(item => item.row.key === 'listening:detail'), 'Batch 3 Listening detail routing is missing from the coverage matrix.');
assert(buckets['ROUTED-REUSE'].some(item => item.row.key === 'listening:final-decision' && item.result.owners.includes('L04→QL01')), 'Listening final-decision must reuse L04 → QL01.');
assert(buckets['ROUTED-REUSE'].some(item => item.row.key === 'listening:scope' && item.result.owners.includes('L05→QL05')), 'Listening scope must reuse L05 → QL05.');
assert(buckets['TAUGHT-UNROUTED'].some(item => item.row.key === 'listening:main-idea' && item.result.owners.includes('L01')), 'Listening main-idea must be recognised as taught by L01 without inventing a Repair or transfer Lab.');
assert(buckets['SKILL-REPAIR'].length === 4 && buckets['SKILL-REPAIR'].reduce((sum, item) => sum + item.row.count, 0) === 62, 'Post-split Skill Repair summary must remain 4 families / 62 questions.');
assert(buckets['ROUTED-REUSE'].length === 20 && buckets['ROUTED-REUSE'].reduce((sum, item) => sum + item.row.count, 0) === 155, 'Post-split routed reuse summary must remain 20 families / 155 questions.');
assert(buckets['TAUGHT-UNROUTED'].length === 11 && buckets['TAUGHT-UNROUTED'].reduce((sum, item) => sum + item.row.count, 0) === 41, 'Post-split recurring taught-unrouted summary must remain 11 families / 41 questions.');
assert(buckets['GAP-REVIEW'].length === 0, 'No recurring GAP-REVIEW family should remain after splitting the heterogeneous Listening sequence umbrella.');
assert(!V16_SKILL_REPAIR_LESSONS.some(lesson => lesson.id === 'LR02'), 'The semantic split must not create LR02 from subthreshold evidence.');

console.log('✓ Listening sequence is split into spatial-sequence ×2 (QL03-taught) and procedural-sequence ×1 (subthreshold), leaving zero recurring GAP-REVIEW families and no LR02.');
