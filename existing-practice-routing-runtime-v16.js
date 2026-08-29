import { LESSONS } from './data.js';
import { retriableLessonError } from './repair-retry-v1.js';
import { registerRenderEnhancement } from './render-lifecycle-v15.js';
import { existingPracticeRecommendationFor } from './existing-practice-routing-v17.js';

const CORE_KEY = 'ielts-self-learning-v1';

function readCore() {
  try { return JSON.parse(localStorage.getItem(CORE_KEY) || '{}'); }
  catch { return {}; }
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[c]));
}

function activeErrors(core) {
  const fixed = new Set(core.fixedErrors || []);
  return (core.errors || []).filter(error => error?.id && !fixed.has(error.id));
}

function transferErrors(core) {
  return activeErrors(core).filter(error => !retriableLessonError(error, LESSONS));
}

function routeKey(rec) {
  return `${rec.primary.id}|${rec.transfer?.id || ''}`;
}

function aggregateExistingPractice(errors) {
  const families = new Map();
  for (const error of errors) {
    const rec = existingPracticeRecommendationFor(error);
    if (!rec) continue;
    const row = families.get(rec.family) || { family:rec.family, familyData:rec.familyData, matches:0, routes:new Map() };
    row.matches += 1;
    const key = routeKey(rec);
    const route = row.routes.get(key) || { rule:rec, count:0 };
    route.count += 1;
    row.routes.set(key, route);
    families.set(rec.family, row);
  }
  return [...families.values()].map(row => {
    const preferred = [...row.routes.values()].sort((a,b)=>b.count-a.count||a.rule.id.localeCompare(b.rule.id))[0]?.rule;
    return { ...row, preferred };
  }).sort((a,b)=>b.matches-a.matches||b.familyData.auditedQuestions-a.familyData.auditedQuestions||a.family.localeCompare(b.family));
}

function routeTitle(rec) {
  return rec.transfer ? `${rec.primary.id} → ${rec.transfer.id}` : rec.primary.id;
}

function routeButtons(rec) {
  return `<button class="btn primary" data-lesson="${esc(rec.primary.id)}">Review ${esc(rec.primary.id)}</button>${rec.transfer?`<button class="btn soft" data-lesson="${esc(rec.transfer.id)}">Then practise ${esc(rec.transfer.id)}</button>`:''}`;
}

function improveHTML(rows, fingerprint) {
  return `<section class="card adaptive-card" data-v16-existing-practice-improve data-runtime-fingerprint="${esc(fingerprint)}">
    <div class="adaptive-top"><div><div class="eyebrow">Return to existing practice</div><h2>These errors are already taught</h2></div><span class="chip success">Reuse existing teaching</span></div>
    <p class="muted">These test-transfer patterns recur across independent evidence, but the coverage audit found that the teaching already exists. Return to the most exact existing destination instead of creating a duplicate Repair unit.</p>
    <div class="repair-grid">${rows.map(row => {
      const rec = row.preferred;
      return `<article class="repair-card" data-existing-practice-family="${esc(row.family)}"><div class="cluster"><span class="chip">${esc(row.familyData.label)}</span><span class="chip warning">${row.matches} active match${row.matches===1?'':'es'}</span></div><h3>${esc(routeTitle(rec))}</h3><p class="muted">${esc(row.familyData.reason)}</p><div class="meta"><span>${row.familyData.auditedQuestions} audit signals</span><span>Coverage: ${esc(row.familyData.coverage.join(' · '))}</span></div><div class="cluster">${routeButtons(rec)}</div></article>`;
    }).join('')}</div>
  </section>`;
}

function renderImproveRouting(core) {
  if (!location.hash.includes('/improve')) return;
  const rows = aggregateExistingPractice(transferErrors(core));
  const fingerprint = rows.map(row=>`${row.family}:${row.matches}:${row.preferred?.id||''}`).join('|');
  const existing = document.querySelector('[data-v16-existing-practice-improve]');
  if (!rows.length) { existing?.remove(); return; }
  if (existing?.dataset.runtimeFingerprint===fingerprint) return;
  const html = improveHTML(rows, fingerprint);
  if (existing) { existing.outerHTML=html; return; }
  const skillRepair = document.querySelector('[data-v16-skill-repair-improve]');
  if (skillRepair) { skillRepair.insertAdjacentHTML('afterend', html); return; }
  const vgRepair = document.querySelector('[data-adaptive-root="repair"]');
  if (vgRepair) { vgRepair.insertAdjacentHTML('afterend', html); return; }
  document.querySelector('#main')?.insertAdjacentHTML('beforeend', html);
}

function renderErrorNotebookRouting(core) {
  if (!location.hash.includes('/improve')) return;
  const errors = new Map((core.errors||[]).map(error=>[error.id,error]));
  const fixed = new Set(core.fixedErrors||[]);
  document.querySelectorAll('#main .error-item').forEach(item => {
    const id = item.querySelector('[data-error-id]')?.dataset.errorId;
    const old = item.querySelector('[data-v16-existing-practice-error-route]');
    const error = id ? errors.get(id) : null;
    const rec = error ? existingPracticeRecommendationFor(error) : null;
    const hasOriginalRetry = Boolean(item.querySelector('[data-action="retry-error"]'));
    if (!id || !error || fixed.has(id) || !rec || hasOriginalRetry) { old?.remove(); return; }
    const marker = routeKey(rec);
    if (old?.dataset.routeFingerprint===marker) return;
    old?.remove();
    const actionRow=[...item.querySelectorAll('.cluster')].at(-1);
    if (!actionRow) return;
    const route=document.createElement('span');
    route.dataset.v16ExistingPracticeErrorRoute='true';
    route.dataset.routeFingerprint=marker;
    route.className='cluster';
    route.innerHTML=`<span class="small muted">Already taught · review before the next test retry</span><button class="btn soft small-btn" data-lesson="${esc(rec.primary.id)}">Review ${esc(rec.primary.id)}</button>${rec.transfer?`<button class="btn ghost small-btn" data-lesson="${esc(rec.transfer.id)}">Practise ${esc(rec.transfer.id)}</button>`:''}`;
    actionRow.insertAdjacentElement('afterend',route);
  });
}

export function renderExistingPracticeRouting() {
  if (typeof document==='undefined') return;
  const core=readCore();
  renderImproveRouting(core);
  renderErrorNotebookRouting(core);
}

if (typeof document!=='undefined') {
  renderExistingPracticeRouting();
  registerRenderEnhancement(renderExistingPracticeRouting);
}
