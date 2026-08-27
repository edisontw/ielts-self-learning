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

const questions = new Map();
const seen = new WeakSet();

function sourceLayer(id = '') {
  if (/^(MR|ML)/.test(id)) return 'mini-test';
  if (/^M[A-Z0-9]*[-_]/.test(id) || /^MA\d/.test(id)) return 'full-mock';
  if (/^(QR|QL)/.test(id)) return 'lab';
  return 'core';
}

function questionSkill(id = '') {
  if (/^MA\d+-L/i.test(id) || /^ML/i.test(id) || /^QL/i.test(id) || /^L\d/i.test(id)) return 'listening';
  if (/^MA\d+-R/i.test(id) || /^MR/i.test(id) || /^QR/i.test(id) || /^R\d/i.test(id)) return 'reading';
  if (/^W/i.test(id)) return 'writing';
  if (/^S/i.test(id)) return 'speaking';
  if (/^LB/i.test(id)) return 'learning-better';
  if (/^I\d/i.test(id)) return 'ielts-strategy';
  return 'other';
}

function visit(value, source) {
  if (!value || typeof value !== 'object') return;
  if (seen.has(value)) return;
  seen.add(value);
  if (typeof value.id === 'string' && typeof value.errorTag === 'string') {
    const row = {
      id: value.id,
      errorTag: value.errorTag,
      source,
      layer: sourceLayer(value.id),
      skill: questionSkill(value.id)
    };
    const existing = questions.get(value.id);
    if (existing && existing.errorTag !== row.errorTag) {
      throw new Error(`Question ${value.id} has conflicting error tags: ${existing.errorTag} vs ${row.errorTag}`);
    }
    if (!existing) questions.set(value.id, row);
  }
  if (Array.isArray(value)) {
    for (const item of value) visit(item, source);
  } else {
    for (const child of Object.values(value)) visit(child, source);
  }
}

for (const { path, ns } of modules) visit(ns, path);

if (!questions.size) throw new Error('Error-tag audit found no tagged questions.');

const exact = new Map();
const semantic = new Map();
const skillSemantic = new Map();
const prefixPattern = /^(reading|listening|writing|speaking|study)-/;
for (const row of questions.values()) {
  const exactRow = exact.get(row.errorTag) || { count: 0, layers: new Set(), skills: new Set(), ids: [] };
  exactRow.count += 1;
  exactRow.layers.add(row.layer);
  exactRow.skills.add(row.skill);
  exactRow.ids.push(row.id);
  exact.set(row.errorTag, exactRow);

  const family = row.errorTag.replace(prefixPattern, '');
  const semanticRow = semantic.get(family) || { count: 0, exactTags: new Set(), layers: new Set(), skills: new Set(), ids: [] };
  semanticRow.count += 1;
  semanticRow.exactTags.add(row.errorTag);
  semanticRow.layers.add(row.layer);
  semanticRow.skills.add(row.skill);
  semanticRow.ids.push(row.id);
  semantic.set(family, semanticRow);

  const skillKey = `${row.skill}:${family}`;
  const skillRow = skillSemantic.get(skillKey) || { count: 0, skill: row.skill, family, exactTags: new Set(), layers: new Set(), ids: [] };
  skillRow.count += 1;
  skillRow.exactTags.add(row.errorTag);
  skillRow.layers.add(row.layer);
  skillRow.ids.push(row.id);
  skillSemantic.set(skillKey, skillRow);
}

const sortRows = entries => entries.sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]));

console.log(`✓ Error-tag inventory: ${questions.size} unique tagged questions / ${exact.size} exact tags / ${semantic.size} semantic families`);
console.log('\nExact tags (count | layers | skills | tag):');
for (const [tag, row] of sortRows([...exact.entries()])) {
  console.log(`${String(row.count).padStart(3)} | ${[...row.layers].sort().join(',')} | ${[...row.skills].sort().join(',')} | ${tag}`);
}

console.log('\nRecurring semantic families, frequency >= 3 (count | layers | skills | exact tags):');
for (const [family, row] of sortRows([...semantic.entries()]).filter(([, row]) => row.count >= 3)) {
  console.log(`${String(row.count).padStart(3)} | ${[...row.layers].sort().join(',')} | ${[...row.skills].sort().join(',')} | ${family} <- ${[...row.exactTags].sort().join(', ')}`);
}

console.log('\nReading / Listening recurring skill families, frequency >= 3 (count | skill | layers | exact tags):');
for (const [, row] of sortRows([...skillSemantic.entries()]).filter(([, row]) => ['reading', 'listening'].includes(row.skill) && row.count >= 3)) {
  console.log(`${String(row.count).padStart(3)} | ${row.skill} | ${[...row.layers].sort().join(',')} | ${row.family} <- ${[...row.exactTags].sort().join(', ')}`);
}
