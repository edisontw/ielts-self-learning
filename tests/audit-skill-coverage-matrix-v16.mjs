import { LESSONS } from '../data.js';
import { V14_REPAIR_LESSONS } from '../repair-registry-v15.js';
import { V16_SKILL_REPAIR_FAMILIES, V16_SKILL_REPAIR_LESSONS } from '../skill-repair-registry-v16.js';
import { EXISTING_PRACTICE_RULES } from '../existing-practice-routing-v16.js';

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
    questions.set(value.id, {
      id: value.id,
      tag: value.errorTag,
      family: familyOf(value.errorTag),
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
  'listening:main-idea': ['L01']
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

// Registry integrity: every declared Skill Repair family must still resolve to a real lesson.
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
assert(buckets['GAP-REVIEW'].some(item => item.row.key === 'listening:sequence'), 'Listening sequence must remain GAP-REVIEW because its three signals mix route-following and procedural sequence semantics.');
assert(buckets['SKILL-REPAIR'].length === 4 && buckets['SKILL-REPAIR'].reduce((sum, item) => sum + item.row.count, 0) === 62, 'Post-gap review Skill Repair summary must be 4 families / 62 questions.');
assert(buckets['ROUTED-REUSE'].length === 20 && buckets['ROUTED-REUSE'].reduce((sum, item) => sum + item.row.count, 0) === 155, 'Post-gap review routed reuse summary must be 20 families / 155 questions.');
assert(buckets['TAUGHT-UNROUTED'].length === 11 && buckets['TAUGHT-UNROUTED'].reduce((sum, item) => sum + item.row.count, 0) === 41, 'Post-gap review taught-unrouted summary must be 11 families / 41 questions.');
assert(buckets['GAP-REVIEW'].length === 1 && buckets['GAP-REVIEW'][0].row.key === 'listening:sequence', 'Only heterogeneous Listening sequence should remain in GAP-REVIEW after this semantics pass.');

console.log('✓ Post-Batch 5 gap review routes final-decision/scope, recognises L01 Listening gist ownership, adds RR03 reference repair, and leaves heterogeneous sequence unresolved.');
