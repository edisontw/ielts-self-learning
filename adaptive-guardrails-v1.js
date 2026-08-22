import { LESSONS } from './data.js';

const DAY = 86400000;

export const SKILL_LABELS = {
  reading:'Reading',
  listening:'Listening',
  writing:'Writing',
  speaking:'Speaking',
  vocabulary:'Vocabulary',
  grammar:'Grammar',
  'learning-better':'Learning Better',
  'ielts-strategy':'IELTS Strategy'
};

export function skillLabel(skill) {
  return SKILL_LABELS[skill] || skill;
}

export function prerequisitesMet(core={}, adaptive={}, lessonId, lessons=LESSONS) {
  const lesson = lessons.find(x => x.id === lessonId);
  if (!lesson) return true;
  const done = new Set(core.completedLessons || []);
  const repaired = new Set(
    Object.entries(adaptive.repairProgress || {})
      .filter(([,value]) => value?.completed)
      .map(([id]) => id)
  );
  return (lesson.prerequisites || []).every(id => done.has(id) || repaired.has(id));
}

export function recentSkillCounts(core={}, adaptive={}, coreMeta=[], repairLessons=[], now=Date.now()) {
  const since = now - 7 * DAY;
  const out = {
    reading:0,
    listening:0,
    writing:0,
    speaking:0,
    vocabulary:0,
    grammar:0,
    'learning-better':0,
    'ielts-strategy':0
  };
  const byId = new Map([...coreMeta, ...repairLessons].map(x => [x.id, x.skill]));
  for (const row of core.studyHistory || []) {
    if ((row.ts || 0) < since) continue;
    const skill = byId.get(row.lessonId);
    if (skill) out[skill] = (out[skill] || 0) + 1;
  }
  for (const row of adaptive.learningHistory || []) {
    if ((row.ts || 0) < since || !row.skill) continue;
    out[row.skill] = (out[row.skill] || 0) + 1;
  }
  return out;
}

export function adaptiveCandidates(core={}, adaptive={}, coreMeta=[], repairLessons=[], lessons=LESSONS) {
  const completed = new Set(core.completedLessons || []);
  const coreIds = new Set(coreMeta.map(x => x.id));
  const rows = [];
  const seen = new Set();

  for (const meta of coreMeta) {
    if (seen.has(meta.id) || completed.has(meta.id)) continue;
    if (!prerequisitesMet(core, adaptive, meta.id, lessons)) continue;
    rows.push(meta);
    seen.add(meta.id);
  }

  for (const repair of repairLessons) {
    // VG01–VG03 are also part of the fixed 30-unit curriculum. Do not let
    // the repair copy bypass the prerequisite rules of the core lesson.
    if (coreIds.has(repair.id) || seen.has(repair.id)) continue;
    if (adaptive.repairProgress?.[repair.id]?.completed) continue;
    rows.push({ ...repair, targetRelevance: repair.skill === 'grammar' ? 0.8 : 0.75 });
    seen.add(repair.id);
  }

  return rows;
}
