import { LESSONS } from './data.js';
import { MINI_TESTS } from './mini-test-data-v1.js';
import { APP_VERSION, BACKUP_SCHEMA_VERSION } from './data-portability-v1.js';

const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const PLAN_KEY = 'ielts-study-plan-v1';
const THEME_KEY = 'ielts-theme';
const STUDY_PLAN_SCHEMA_VERSION = 1;
const CORE_30_IDS = [
  'LB01','LB02','LB03','LB04',
  'R01','R02','R03','R04','R05',
  'L01','L02','L03','L04','L05',
  'W01','W02','W03','W04','W05',
  'S01','S02','S03','S04','S05',
  'VG01','VG02','VG03','I01','I02','I03'
];
const LAB_IDS = [
  'QR01','QR02','QR03','QR04','QR05','QR06',
  'QL01','QL02','QL03','QL04','QL05','QL06'
];

const esc = (value='') => String(value).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const countArray = value => Array.isArray(value) ? value.length : 0;
const bytesLabel = chars => chars < 1024 ? `${chars} B` : chars < 1024 * 1024 ? `${(chars/1024).toFixed(1)} KB` : `${(chars/1024/1024).toFixed(2)} MB`;

function readRaw(key, storage=localStorage) {
  try { return storage.getItem(key); }
  catch (error) { return { __storageError:error.message }; }
}

function parseKey(key, storage=localStorage) {
  const raw = readRaw(key, storage);
  if (isObject(raw) && raw.__storageError) return { key, present:false, valid:false, error:raw.__storageError, raw:null, data:null };
  if (raw == null || raw === '') return { key, present:false, valid:true, error:null, raw:null, data:null };
  if (key === THEME_KEY) return { key, present:true, valid:['light','dark'].includes(raw), error:['light','dark'].includes(raw)?null:'Unexpected theme value.', raw, data:raw };
  try { return { key, present:true, valid:true, error:null, raw, data:JSON.parse(raw) }; }
  catch { return { key, present:true, valid:false, error:'Stored value is not valid JSON.', raw, data:null }; }
}

function shapeIssues(core, adaptive, plan) {
  const issues=[];
  if (core.present && core.valid) {
    if (!isObject(core.data)) issues.push('Core learner data is not an object.');
    else {
      for (const field of ['completedLessons','errors','fixedErrors','studyHistory']) {
        if (field in core.data && !Array.isArray(core.data[field])) issues.push(`core.${field} should be an array.`);
      }
      for (const field of ['profile','study','lessonAnswers','notes','writingDrafts','speakingTranscripts','ui']) {
        if (field in core.data && !isObject(core.data[field])) issues.push(`core.${field} should be an object.`);
      }
    }
  }
  if (adaptive.present && adaptive.valid) {
    if (!isObject(adaptive.data)) issues.push('Adaptive learner data is not an object.');
    else {
      for (const field of ['reviewHistory','vocabularyHistory','learningHistory','miniTestHistory']) {
        if (field in adaptive.data && !Array.isArray(adaptive.data[field])) issues.push(`adaptive.${field} should be an array.`);
      }
      for (const field of ['reviewSchedule','repairProgress','vocabularySchedule','skillPerformance','productiveEvidence','productivePriority','aiFeedbackReturns']) {
        if (field in adaptive.data && !isObject(adaptive.data[field])) issues.push(`adaptive.${field} should be an object.`);
      }
    }
  }
  if (plan.present && plan.valid) {
    if (!isObject(plan.data)) issues.push('Study Plan data is not an object.');
    else {
      if (plan.data.version !== STUDY_PLAN_SCHEMA_VERSION) issues.push(`Study Plan version ${plan.data.version ?? 'missing'} is unsupported.`);
      if (!isObject(plan.data.config)) issues.push('Study Plan config is missing or invalid.');
      if (!Array.isArray(plan.data.weeks)) issues.push('Study Plan weeks should be an array.');
    }
  }
  return issues;
}

function referenceIssues(coreData, adaptiveData, planData) {
  const issues=[];
  const lessonIds=new Set(LESSONS.map(x=>x.id));
  const miniIds=new Set(MINI_TESTS.map(x=>x.id));
  const completed=Array.isArray(coreData?.completedLessons)?coreData.completedLessons:[];
  const unknownCompleted=completed.filter(id=>!lessonIds.has(id));
  if (unknownCompleted.length) issues.push(`Unknown completed lesson IDs: ${unknownCompleted.slice(0,5).join(', ')}${unknownCompleted.length>5?'…':''}`);

  const history=Array.isArray(adaptiveData?.miniTestHistory)?adaptiveData.miniTestHistory:[];
  const unknownTests=[...new Set(history.map(x=>x?.testId).filter(Boolean).filter(id=>!miniIds.has(id)))];
  if (unknownTests.length) issues.push(`Unknown Mini Test IDs in history: ${unknownTests.join(', ')}`);

  const sessions=Array.isArray(planData?.weeks) ? planData.weeks.flatMap(w=>Array.isArray(w?.sessions)?w.sessions:[]) : [];
  const missingTasks=[];
  for (const item of sessions) {
    if (['lesson','lab','productive-retry'].includes(item?.kind) && item.sourceId && !lessonIds.has(item.sourceId)) missingTasks.push(item.sourceId);
    if (item?.kind==='mini-test' && item.sourceId && !miniIds.has(item.sourceId)) missingTasks.push(item.sourceId);
  }
  const uniqueMissing=[...new Set(missingTasks)];
  if (uniqueMissing.length) issues.push(`Study Plan references missing content: ${uniqueMissing.slice(0,5).join(', ')}${uniqueMissing.length>5?'…':''}`);
  return issues;
}

function browserCapabilities() {
  const nav=typeof navigator==='undefined'?{}:navigator;
  const win=typeof window==='undefined'?{}:window;
  return {
    secureContext: typeof isSecureContext==='boolean' ? isSecureContext : false,
    localStorage: (()=>{ try { return Boolean(win.localStorage); } catch { return false; } })(),
    speechSynthesis: 'speechSynthesis' in win && 'SpeechSynthesisUtterance' in win,
    microphoneAPI: Boolean(nav.mediaDevices?.getUserMedia),
    mediaRecorder: 'MediaRecorder' in win,
    clipboard: Boolean(nav.clipboard?.writeText),
    fileExport: typeof Blob!=='undefined' && Boolean(win.URL?.createObjectURL),
    fileImport: typeof File!=='undefined' && typeof FileReader!=='undefined'
  };
}

function dataCounts(coreData={}, adaptiveData={}, planData=null, storage=localStorage) {
  const completed=Array.isArray(coreData.completedLessons)?coreData.completedLessons:[];
  const miniHistory=Array.isArray(adaptiveData.miniTestHistory)?adaptiveData.miniTestHistory:[];
  const productive=adaptiveData.productiveEvidence||{};
  const feedback=adaptiveData.aiFeedbackReturns||{};
  const feedbackRows=['writing','speaking'].flatMap(skill=>Array.isArray(feedback[skill])?feedback[skill]:[]);
  const reviewSchedule=isObject(adaptiveData.reviewSchedule)?Object.values(adaptiveData.reviewSchedule):[];
  const vocabSchedule=isObject(adaptiveData.vocabularySchedule)?Object.values(adaptiveData.vocabularySchedule):[];
  const now=Date.now();
  const sessions=Array.isArray(planData?.weeks)?planData.weeks.flatMap(w=>Array.isArray(w?.sessions)?w.sessions:[]):[];
  let storageChars=0;
  for (const key of [CORE_KEY,ADAPTIVE_KEY,PLAN_KEY,THEME_KEY]) {
    const raw=readRaw(key,storage);
    if (typeof raw==='string') storageChars+=raw.length;
  }
  return {
    coreCompleted: completed.filter(id=>CORE_30_IDS.includes(id)).length,
    labsCompleted: completed.filter(id=>LAB_IDS.includes(id)).length,
    checkedAnswers: isObject(coreData.lessonAnswers)?Object.values(coreData.lessonAnswers).filter(x=>x?.checked).length:0,
    errors: countArray(coreData.errors),
    fixedErrors: countArray(coreData.fixedErrors),
    reviewDue: reviewSchedule.filter(x=>(x?.dueAt||Infinity)<=now).length,
    vocabularyDue: vocabSchedule.filter(x=>(x?.dueAt||Infinity)<=now).length,
    miniAttempts: miniHistory.length,
    miniForms: new Set(miniHistory.map(x=>x?.testId).filter(Boolean)).size,
    productiveAttempts: countArray(productive.writing)+countArray(productive.speaking),
    feedbackReturns: feedbackRows.length,
    feedbackPending: feedbackRows.filter(x=>!x.retryEvidenceId).length,
    planWeeks: countArray(planData?.weeks),
    planSessions: sessions.length,
    storageChars
  };
}

function runDiagnostics(storage=localStorage) {
  const core=parseKey(CORE_KEY,storage);
  const adaptive=parseKey(ADAPTIVE_KEY,storage);
  const plan=parseKey(PLAN_KEY,storage);
  const theme=parseKey(THEME_KEY,storage);
  const parseIssues=[core,adaptive,plan,theme].filter(x=>!x.valid).map(x=>`${x.key}: ${x.error}`);
  const shapes=shapeIssues(core,adaptive,plan);
  const refs=referenceIssues(core.data,adaptive.data,plan.data);
  const caps=browserCapabilities();
  const warnings=[];
  if (!caps.localStorage) warnings.push('localStorage is unavailable. Progress cannot persist.');
  if (!caps.secureContext) warnings.push('Page is not in a secure context; microphone access may be blocked.');
  if (!caps.speechSynthesis) warnings.push('Browser speech synthesis is unavailable; prototype Listening playback may not work.');
  if (!caps.microphoneAPI || !caps.mediaRecorder) warnings.push('Browser recording support is incomplete; Speaking recorder may fall back to transcript-only practice.');
  if (!caps.clipboard) warnings.push('Modern Clipboard API is unavailable; diagnostic copy may use a fallback.');
  const errors=[...parseIssues,...shapes,...refs];
  const counts=dataCounts(core.data||{},adaptive.data||{},plan.data,storage);
  return {
    appVersion:APP_VERSION,
    backupSchemaVersion:BACKUP_SCHEMA_VERSION,
    studyPlanSchemaVersion:STUDY_PLAN_SCHEMA_VERSION,
    status: errors.length?'error':warnings.length?'warning':'healthy',
    errors,
    warnings,
    capabilities:caps,
    counts,
    data:{ corePresent:core.present, adaptivePresent:adaptive.present, planPresent:plan.present, themePresent:theme.present },
    environment:{
      language: typeof navigator!=='undefined' ? navigator.language || 'unknown' : 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      viewport: typeof window!=='undefined' ? `${window.innerWidth||0}×${window.innerHeight||0}` : 'unknown'
    },
    checkedAt:new Date().toISOString()
  };
}

function statusChip(status) {
  const cls=status==='healthy'?'success':status==='warning'?'warning':'danger';
  const text=status==='healthy'?'Healthy':status==='warning'?'Needs attention':'Data issue';
  return `<span class="chip ${cls}">${text}</span>`;
}

function capabilityRow(label,value,note='') {
  return `<div class="profile-row"><strong>${esc(label)}</strong><span class="chip ${value?'success':'warning'}">${value?'Available':'Unavailable'}</span><span class="small muted">${esc(note)}</span></div>`;
}

function issueList(report) {
  if (!report.errors.length && !report.warnings.length) return `<div class="callout success"><strong>No diagnostic problems found.</strong><br><span class="small">Stored learner data and browser capabilities look compatible with the current prototype.</span></div>`;
  const errors=report.errors.map(x=>`<div class="callout danger" style="margin-top:8px"><strong>Data issue</strong><br><span class="small">${esc(x)}</span></div>`).join('');
  const warnings=report.warnings.map(x=>`<div class="callout warning" style="margin-top:8px"><strong>Capability warning</strong><br><span class="small">${esc(x)}</span></div>`).join('');
  return `${errors}${warnings}`;
}

function panelHTML(report=runDiagnostics()) {
  const c=report.counts;
  const cap=report.capabilities;
  return `<section class="card extension-card" data-diagnostics-panel style="margin-top:18px">
    <div class="adaptive-top"><div><div class="eyebrow">Diagnostics · Troubleshooting</div><h2>Check app, browser and local learner data.</h2></div>${statusChip(report.status)}</div>
    <p class="muted">Read-only diagnostics. The report contains versions, capability flags, counts and data-health messages—never essay text, transcripts, selected answers or AI feedback content.</p>
    <div class="grid four" style="margin-top:14px">
      <div class="card stat"><div class="stat-value">v${esc(report.appVersion)}</div><div class="stat-label">app version</div></div>
      <div class="card stat"><div class="stat-value">${report.backupSchemaVersion}</div><div class="stat-label">backup schema</div></div>
      <div class="card stat"><div class="stat-value">${report.studyPlanSchemaVersion}</div><div class="stat-label">Study Plan schema</div></div>
      <div class="card stat"><div class="stat-value">${bytesLabel(c.storageChars)}</div><div class="stat-label">IELTS local data</div></div>
    </div>
    <details style="margin-top:16px" open><summary><strong>Data health</strong></summary><div style="margin-top:10px">${issueList(report)}</div></details>
    <details style="margin-top:14px"><summary><strong>Browser capabilities</strong></summary><div style="margin-top:10px">
      ${capabilityRow('Local storage',cap.localStorage,'Progress persistence')}
      ${capabilityRow('Secure context',cap.secureContext,'Microphone permission normally requires HTTPS or localhost')}
      ${capabilityRow('Speech synthesis',cap.speechSynthesis,'Prototype Listening playback')}
      ${capabilityRow('Microphone API',cap.microphoneAPI,'Speaking recorder permission path')}
      ${capabilityRow('MediaRecorder',cap.mediaRecorder,'Speaking audio capture')}
      ${capabilityRow('Clipboard API',cap.clipboard,'Copy diagnostic report')}
      ${capabilityRow('File export',cap.fileExport,'JSON backup download')}
      ${capabilityRow('File import',cap.fileImport,'JSON backup restore')}
    </div></details>
    <details style="margin-top:14px"><summary><strong>Local data counts</strong></summary><div class="grid four" style="margin-top:10px">
      <div class="card stat"><div class="stat-value">${c.coreCompleted}/30</div><div class="stat-label">core complete</div></div>
      <div class="card stat"><div class="stat-value">${c.labsCompleted}/12</div><div class="stat-label">Labs complete</div></div>
      <div class="card stat"><div class="stat-value">${c.miniForms}/4</div><div class="stat-label">Mini Test forms seen</div></div>
      <div class="card stat"><div class="stat-value">${c.planWeeks}</div><div class="stat-label">Study Plan weeks</div></div>
    </div><div class="small muted" style="margin-top:10px">Checked answers ${c.checkedAnswers} · Errors ${c.errors} · Fixed ${c.fixedErrors} · Review due ${c.reviewDue} · Vocabulary due ${c.vocabularyDue} · Mini Test attempts ${c.miniAttempts} · Productive attempts ${c.productiveAttempts} · AI feedback ${c.feedbackReturns} (${c.feedbackPending} pending retry) · Planned sessions ${c.planSessions}</div></details>
    <div class="cluster" style="margin-top:16px"><button class="btn soft" data-diag-action="refresh">Refresh diagnostics</button><button class="btn ghost" data-diag-action="copy">Copy diagnostic report</button><span class="small muted">Checked ${esc(new Date(report.checkedAt).toLocaleTimeString())} · ${esc(report.environment.timezone)} · viewport ${esc(report.environment.viewport)}</span></div>
  </section>`;
}

function reportText(report=runDiagnostics()) {
  const c=report.counts;
  const cap=report.capabilities;
  const lines=[
    'IELTS Self-Learning diagnostic report',
    `Checked: ${report.checkedAt}`,
    `Status: ${report.status}`,
    `App version: ${report.appVersion}`,
    `Backup schema: ${report.backupSchemaVersion}`,
    `Study Plan schema: ${report.studyPlanSchemaVersion}`,
    `Environment: ${report.environment.language}; ${report.environment.timezone}; viewport ${report.environment.viewport}`,
    `Capabilities: localStorage=${cap.localStorage}; secureContext=${cap.secureContext}; speechSynthesis=${cap.speechSynthesis}; microphoneAPI=${cap.microphoneAPI}; MediaRecorder=${cap.mediaRecorder}; clipboard=${cap.clipboard}; fileExport=${cap.fileExport}; fileImport=${cap.fileImport}`,
    `Data: core=${c.coreCompleted}/30; labs=${c.labsCompleted}/12; checkedAnswers=${c.checkedAnswers}; errors=${c.errors}; fixedErrors=${c.fixedErrors}; reviewDue=${c.reviewDue}; vocabularyDue=${c.vocabularyDue}; miniAttempts=${c.miniAttempts}; miniForms=${c.miniForms}/4; productiveAttempts=${c.productiveAttempts}; feedbackReturns=${c.feedbackReturns}; feedbackPending=${c.feedbackPending}; planWeeks=${c.planWeeks}; planSessions=${c.planSessions}; localData=${bytesLabel(c.storageChars)}`,
    `Errors: ${report.errors.length ? report.errors.join(' | ') : 'none'}`,
    `Warnings: ${report.warnings.length ? report.warnings.join(' | ') : 'none'}`,
    'Privacy: no essay text, transcript text, selected-answer text or AI feedback content included.'
  ];
  return lines.join('\n');
}

function injectPanel() {
  if (!location.hash.includes('/progress') || document.querySelector('[data-diagnostics-panel]')) return;
  const main=document.querySelector('#main');
  if (!main) return;
  const anchor=document.querySelector('[data-local-data-tools]') || document.querySelector('[data-study-plan-builder]') || main.lastElementChild;
  if (anchor) anchor.insertAdjacentHTML('afterend',panelHTML()); else main.insertAdjacentHTML('beforeend',panelHTML());
}

function refreshPanel() {
  const old=document.querySelector('[data-diagnostics-panel]');
  if (!old) return;
  const wrap=document.createElement('div');
  wrap.innerHTML=panelHTML();
  old.replaceWith(wrap.firstElementChild);
}

async function copyReport() {
  const text=reportText();
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const area=document.createElement('textarea');
  area.value=text;
  area.setAttribute('readonly','');
  area.style.position='fixed';
  area.style.opacity='0';
  document.body.appendChild(area);
  area.select();
  const ok=document.execCommand?.('copy') || false;
  area.remove();
  return ok;
}

function apply(){ injectPanel(); }

if (typeof document!=='undefined') {
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-diag-action]');
    if (!button) return;
    if (button.dataset.diagAction==='refresh') refreshPanel();
    if (button.dataset.diagAction==='copy') {
      try {
        const ok=await copyReport();
        if (!ok) alert('Could not copy the diagnostic report automatically.');
        else { const old=button.textContent; button.textContent='Copied'; setTimeout(()=>{button.textContent=old;},1400); }
      } catch (error) { alert(`Could not copy diagnostics: ${error.message}`); }
    }
  });
  window.addEventListener('hashchange',()=>setTimeout(apply,0));
  window.addEventListener('ielts-study-plan-change',()=>setTimeout(refreshPanel,0));
  window.addEventListener('ielts-mini-test-submitted',()=>setTimeout(refreshPanel,0));
  window.addEventListener('ielts-productive-evidence-change',()=>setTimeout(refreshPanel,0));
  window.addEventListener('ielts-ai-feedback-change',()=>setTimeout(refreshPanel,0));
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(apply,0);
}

export { STUDY_PLAN_SCHEMA_VERSION, parseKey, browserCapabilities, dataCounts, runDiagnostics, reportText };
