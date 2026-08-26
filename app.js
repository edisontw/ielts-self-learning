import { NAV, SKILL_META, LESSONS, IELTS_GUIDES, PROMPT_TEMPLATES, FIRST_PATH } from './data.js';
import { retriableLessonError, resetLessonErrorForRetry, resolveSavedErrorsForCorrectAnswer } from './repair-retry-v1.js';

const STORAGE_KEY = 'ielts-self-learning-v1';
const THEME_KEY = 'ielts-theme';
const app = document.querySelector('#app');

const defaults = {
  profile: { targetBand: 7.0, stage: null, referenceLevel: null, recommendedDifficulty: 3, confidence: null, placementSections: null },
  study: { preferredMinutes: 20 },
  placement: null,
  completedLessons: [],
  lessonAnswers: {},
  notes: {},
  errors: [],
  fixedErrors: [],
  studyHistory: [],
  writingDrafts: {},
  speakingTranscripts: {},
  ui: { chineseHelp: false }
};

let state = loadState();
let placementData = null;
let placementSession = null;
let modal = null;
let toastTimer = null;
let recorders = new Map();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return deepMerge(structuredClone(defaults), saved);
  } catch {
    return structuredClone(defaults);
  }
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      deepMerge(target[key], value);
    } else target[key] = value;
  }
  return target;
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function currentRoute() {
  const raw = location.hash.replace(/^#\/?/, '') || 'today';
  const [page, id] = raw.split('/');
  return { page, id };
}

function go(path) {
  location.hash = `#/${path}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[ch]));
}

function formatSkill(skill) { return SKILL_META[skill]?.label || skill; }
function lessonById(id) { return LESSONS.find(l => l.id === id); }
function isCompleted(id) { return state.completedLessons.includes(id); }

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) document.documentElement.dataset.theme = saved;
}
function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const inferredDark = !current && matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme((current === 'dark' || inferredDark) ? 'light' : 'dark');
  render();
}

async function loadPlacement() {
  try {
    const res = await fetch('./content/placement/quick-placement-v1.json');
    placementData = await res.json();
  } catch (err) {
    console.error(err);
  }
}

function showToast(message) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2200);
}

function shell(content) {
  const route = currentRoute();
  const navActive = ['lesson', 'placement', 'prompts'].includes(route.page) ? (route.page === 'lesson' ? 'learn' : route.page === 'placement' ? 'progress' : 'improve') : route.page;
  const navButtons = NAV.map(n => `<button class="nav-btn ${navActive === n.id ? 'active' : ''}" data-nav="${n.id}"><span class="nav-icon">${n.icon}</span>${n.label}</button>`).join('');
  const mobileButtons = NAV.map(n => `<button class="${navActive === n.id ? 'active' : ''}" data-nav="${n.id}"><span class="m-icon">${n.icon}</span>${n.label}</button>`).join('');
  const theme = document.documentElement.dataset.theme || 'system';
  return `<div class="app-shell">
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="brand"><div class="brand-mark">IL</div><div>IELTS Learn<span class="brand-sub">SELF-LEARNING WORKSPACE</span></div></div>
      <div class="nav-group"><div class="nav-label">Workspace</div>${navButtons}</div>
      <div class="nav-group"><div class="nav-label">Learning Better</div><button class="nav-btn" data-lesson="LB01"><span class="nav-icon">◈</span>Learning Better</button></div>
      <div class="sidebar-footer">
        <div class="small muted">Local-first prototype<br>No account required</div>
        <div class="sidebar-footer-row"><button class="btn ghost small-btn" data-action="toggle-chinese">${state.ui.chineseHelp ? '中文輔助 On' : '中文輔助'}</button><button class="btn ghost small-btn" data-action="toggle-theme">${theme === 'dark' ? 'Light' : 'Dark'}</button></div>
      </div>
    </aside>
    <div class="main-wrap">
      <header class="topbar">
        <span class="target-pill">IELTS Academic · Target ${state.profile.targetBand.toFixed(1)}</span>
        <button class="btn ghost small-btn" data-action="open-prompt-library">AI Prompts</button>
        <button class="btn icon-btn ghost" aria-label="Toggle theme" data-action="toggle-theme">◐</button>
      </header>
      <main class="content" id="main">${content}</main>
    </div>
    <nav class="mobile-nav" aria-label="Mobile navigation">${mobileButtons}</nav>
    ${renderModal()}
  </div>`;
}

function render() {
  const { page, id } = currentRoute();
  let content;
  if (page === 'today') content = renderToday();
  else if (page === 'learn') content = renderLearn();
  else if (page === 'ielts') content = renderIELTS();
  else if (page === 'improve') content = renderImprove();
  else if (page === 'progress') content = renderProgress();
  else if (page === 'lesson') content = renderLesson(id);
  else if (page === 'placement') content = renderPlacement();
  else content = renderToday();
  app.innerHTML = shell(content);
  bindDynamicInputs();
}

function recommendedLesson() {
  const incomplete = FIRST_PATH.map(lessonById).filter(Boolean).filter(l => !isCompleted(l.id));
  if (!state.placement) return lessonById('LB01');
  const weak = Object.entries(state.profile.placementSections || {}).sort((a,b) => a[1] - b[1])[0]?.[0];
  const map = { reading: 'R01', listening: 'L01', vocabulary: 'W01', grammar: 'W01' };
  const weakLesson = lessonById(map[weak]);
  if (weakLesson && !isCompleted(weakLesson.id)) return weakLesson;
  return incomplete[0] || lessonById('R01');
}

function renderToday() {
  const rec = recommendedLesson();
  const history7 = state.studyHistory.filter(x => Date.now() - x.ts < 7 * 86400000);
  const questions = Object.keys(state.lessonAnswers).length;
  const fixed = state.fixedErrors.length;
  const priorities = bestNextOpportunities();
  return `<section class="page-head"><div><div class="eyebrow">Today</div><h1>What should I work on today?</h1><p class="lede">Choose the time you have. The system will prioritise useful work over simply giving you more material.</p></div></section>
    <section class="card" style="margin-bottom:18px"><div class="muted small">I have...</div><div class="time-picker">${[5,10,20,30,45,60].map(m => `<button class="time-chip ${state.study.preferredMinutes===m?'active':''}" data-minutes="${m}">${m} min</button>`).join('')}</div></section>
    ${!state.placement ? `<section class="focus-card" style="margin-bottom:18px"><div class="eyebrow">Recommended first step</div><h2>Quick Placement</h2><p class="lede">24 short items across Vocabulary, Grammar, Reading and Listening. It recommends a starting level—not an official IELTS band.</p><div class="cluster"><button class="btn primary" data-nav="placement">Start placement</button><button class="btn soft" data-lesson="LB01">Learn first: Practice vs Testing</button></div></section>` : ''}
    <section class="focus-card"><div class="eyebrow">Today's focus</div><h2>${esc(rec.title)}</h2><div class="meta"><span>${formatSkill(rec.skill)}</span><span>·</span><span>${rec.estimatedMinutes} min</span><span>·</span><span>${rec.cefr}</span><span>·</span><span>Difficulty ${rec.difficulty}/5</span></div><p>${esc(rec.description)}</p><div class="cluster"><button class="btn primary" data-lesson="${rec.id}">${isCompleted(rec.id) ? 'Review lesson' : 'Start lesson'}</button><span class="chip primary">${state.study.preferredMinutes >= rec.estimatedMinutes ? 'Fits your time' : 'Continue later if needed'}</span></div></section>
    <div class="grid two" style="margin-top:18px">
      <section class="card"><div class="eyebrow">Your priorities</div><div class="stack" style="margin-top:12px">${priorities.map((p,i)=>`<div><strong>${i+1}. ${esc(p.title)}</strong><div class="small muted">${esc(p.detail)}</div></div>`).join('')}</div></section>
      <section class="card"><div class="eyebrow">Quick practice</div><div class="stack" style="margin-top:12px"><button class="btn" data-nav="improve">Error review · ${state.errors.length} saved</button><button class="btn" data-lesson="L01">Listening gist · 8–18 min</button><button class="btn" data-action="open-prompt-library">Prompt Library · feedback tools</button></div></section>
    </div>
    <section class="grid four" style="margin-top:18px">
      <div class="card stat"><div class="stat-value">${history7.length}</div><div class="stat-label">study actions · 7 days</div></div>
      <div class="card stat"><div class="stat-value">${state.completedLessons.length}</div><div class="stat-label">lessons completed</div></div>
      <div class="card stat"><div class="stat-value">${questions}</div><div class="stat-label">lesson questions answered</div></div>
      <div class="card stat"><div class="stat-value">${fixed}</div><div class="stat-label">old errors corrected</div></div>
    </section>`;
}

function bestNextOpportunities() {
  if (!state.placement) return [
    { title: 'Find your starting level', detail: 'Take Quick Placement before relying on difficulty recommendations.' },
    { title: 'Learn the practice loop', detail: 'LB01 explains why testing alone can produce a plateau.' },
    { title: 'Build all four skills', detail: 'The first path includes Reading, Listening, Writing and Speaking.' },
  ];
  const sec = state.profile.placementSections || {};
  const labels = { vocabulary: 'Vocabulary in context', grammar: 'Grammar control', reading: 'Reading main idea & evidence', listening: 'Listening detail & distractors' };
  return Object.entries(sec).sort((a,b)=>a[1]-b[1]).slice(0,3).map(([k,v]) => ({ title: labels[k], detail: `${v}/6 on Quick Placement · confirm through real lesson performance.` }));
}

function renderLearn() {
  const groups = ['learning-better','reading','listening','writing','speaking'];
  return `<section class="page-head"><div><div class="eyebrow">Learn</div><h1>Build English skills, then transfer them to IELTS.</h1><p class="lede">The first five lessons form an onboarding path. After that, the site should recommend by weakness, review need, difficulty and available time.</p></div></section>
    <div class="grid two">${groups.map(skill => {
      const list = LESSONS.filter(l => l.skill === skill);
      return list.map(l => `<article class="card lesson-card clickable"><div class="cluster"><div class="lesson-icon">${SKILL_META[skill].icon}</div><span class="chip ${isCompleted(l.id)?'success':'primary'}">${isCompleted(l.id)?'Completed':'Core lesson'}</span></div><div><h3>${esc(l.title)}</h3><p class="muted" style="margin-top:8px">${esc(l.description)}</p></div><div class="meta"><span>${l.cefr}</span><span>IELTS ${l.ieltsRange}</span><span>${l.estimatedMinutes} min</span></div><footer><div class="small muted">${esc(l.objective)}</div><button class="btn soft" data-lesson="${l.id}">${isCompleted(l.id)?'Review':'Open'}</button></footer></article>`).join('');
    }).join('')}</div>
    <section class="card subtle" style="margin-top:20px"><strong>V1.2 scope:</strong> the five complete lessons are implemented first. The broader 30-unit map remains in the specification and will be expanded only after the learning loop is stable.</section>`;
}

function renderIELTS() {
  return `<section class="page-head"><div><div class="eyebrow">IELTS</div><h1>Train for the exam without turning the whole site into a test bank.</h1><p class="lede">IELTS is the destination, not the entire curriculum. Skill learning and exam-specific transfer remain separate modes.</p></div></section>
    <div class="grid two">${IELTS_GUIDES.map((g,i)=>`<article class="card"><span class="chip ${i<3?'primary':''}">${i<3?'Available direction':'Later V1'}</span><h3 style="margin-top:14px">${g.title}</h3><p class="muted" style="margin-top:9px">${g.text}</p>${i===0?'<button class="btn soft" data-nav="placement">Quick Placement</button>':''}${i===1?'<button class="btn soft" data-lesson="R01">Try Matching Headings transfer</button>':''}${i===2?'<button class="btn soft" data-lesson="W01">Task Response strategy</button>':''}</article>`).join('')}</div>
    <section class="card" style="margin-top:18px"><div class="eyebrow">Mode rule</div><div class="grid two" style="margin-top:12px"><div><h3>Practice Mode</h3><p class="muted">Hints, replay, transcript, evidence, feedback, retry.</p></div><div><h3>Test Mode</h3><p class="muted">Timer, normal speed, no transcript or hints, one attempt before review.</p></div></div></section>`;
}

function renderImprove() {
  const errors = [...state.errors].reverse();
  return `<section class="page-head"><div><div class="eyebrow">Improve</div><h1>Errors are learning data.</h1><p class="lede">A wrong answer should create a repair decision, not only a red mark.</p></div><div><button class="btn soft" data-action="open-error-prompt">Error Analysis Prompt</button></div></section>
    <div class="grid three" style="margin-bottom:18px"><div class="card stat"><div class="stat-value">${state.errors.length}</div><div class="stat-label">errors saved</div></div><div class="card stat"><div class="stat-value">${state.fixedErrors.length}</div><div class="stat-label">errors corrected</div></div><div class="card stat"><div class="stat-value">${Math.max(0,state.errors.length-state.fixedErrors.length)}</div><div class="stat-label">still to review</div></div></div>
    <section class="card"><div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">Error Notebook</div><h2 style="margin-top:6px">Review the cause, then retry.</h2></div>${state.errors.length?'<button class="btn ghost small-btn" data-action="clear-errors">Clear notebook</button>':''}</div>
      ${errors.length ? errors.map(e => { const fixed=state.fixedErrors.includes(e.id); const retriable=retriableLessonError(e,LESSONS); return `<article class="error-item"><div class="cluster"><span class="chip">${formatSkill(e.skill)}</span><span class="chip warning">${esc(e.errorTag || 'error')}</span><span class="small muted">${new Date(e.ts).toLocaleDateString()}</span></div><strong>${esc(e.question)}</strong><div class="error-answer"><div><span class="small muted">Your answer</span><br>${esc(e.myAnswer)}</div><div><span class="small muted">Correct answer</span><br>${esc(e.correctAnswer)}</div></div><p class="muted">${esc(e.rationale || '')}</p><div class="cluster">${retriable&&!fixed?`<button class="btn primary small-btn" data-action="retry-error" data-error-id="${e.id}">Retry question</button>`:''}<button class="btn soft small-btn" data-action="mark-fixed" data-error-id="${e.id}" ${fixed||retriable?'disabled':''}>${fixed?'Corrected':retriable?'Retry required':'Mark corrected after retry'}</button><button class="btn ghost small-btn" data-error-prompt="${e.id}">Build repair prompt</button></div>${retriable&&!fixed?'<p class="small muted" style="margin-top:8px">A saved lesson error is corrected automatically only after a successful retry.</p>':''}</article>`; }).join('') : '<div class="empty-state"><strong>No saved errors yet.</strong><p>When you miss a lesson question, the site can save the item, your answer, the correct answer and the error tag here.</p></div>'}
    </section>`;
}

function renderProgress() {
  const sections = state.profile.placementSections;
  const stage = state.profile.stage || 'Not placed';
  const reference = state.profile.referenceLevel || 'Take Quick Placement';
  const skillRows = sections ? Object.entries(sections).map(([k,v]) => `<div class="profile-row"><strong>${formatSkill(k)}</strong><div class="meter"><span style="width:${(v/6)*100}%"></span></div><span>${v}/6</span></div>`).join('') : '<div class="empty-state">No placement profile yet.</div>';
  return `<section class="page-head"><div><div class="eyebrow">Progress</div><h1>Your profile should guide the next step, not lock you into a label.</h1><p class="lede">Quick Placement is only a starting signal. Later lesson performance should adjust each skill independently.</p></div></section>
    <div class="grid two">
      <section class="card elevated"><div class="eyebrow">Starting profile</div><div class="cluster" style="margin:12px 0"><div class="score-circle">${state.placement?.total ?? '—'}</div><div><h2>${esc(stage)}</h2><p class="muted">${esc(reference)} · Confidence ${state.profile.confidence || '—'}</p><span class="chip primary">Difficulty ${state.profile.recommendedDifficulty}/5</span></div></div><p class="small muted">This is not an official or exact IELTS band.</p></section>
      <section class="card"><div class="eyebrow">Goal</div><h2 style="margin:10px 0">IELTS Academic ${state.profile.targetBand.toFixed(1)}</h2><label class="small muted" for="targetBand">Target band</label><input id="targetBand" class="text-input" type="number" step="0.5" min="5" max="9" value="${state.profile.targetBand}"><div class="cluster" style="margin-top:12px"><button class="btn primary" data-action="save-target">Save target</button><button class="btn soft" data-nav="placement">${state.placement?'Retake placement':'Take placement'}</button></div></section>
    </div>
    <section class="card" style="margin-top:18px"><div class="eyebrow">Section profile</div><div style="margin-top:12px">${skillRows}</div></section>
    <section class="grid three" style="margin-top:18px"><div class="card stat"><div class="stat-value">${state.completedLessons.length}/5</div><div class="stat-label">core lessons completed</div></div><div class="card stat"><div class="stat-value">${state.errors.length}</div><div class="stat-label">errors captured</div></div><div class="card stat"><div class="stat-value">${state.fixedErrors.length}</div><div class="stat-label">old errors corrected</div></div></section>
    <section class="card subtle" style="margin-top:18px"><strong>Data stays in this browser.</strong> V1 stores profile, progress, notes, errors and drafts locally. Cloud accounts and sync are intentionally out of scope for this prototype.</section>`;
}

function renderLesson(id) {
  const l = lessonById(id);
  if (!l) return `<div class="empty-state"><h2>Lesson not found</h2><button class="btn" data-nav="learn">Back to Learn</button></div>`;
  const complete = isCompleted(l.id);
  const answeredCount = Object.keys(state.lessonAnswers).filter(k => k.startsWith(`${l.id}-`)).length;
  const quizCount = l.sections.flatMap(s => s.blocks || []).filter(b => b.type === 'quiz').length;
  const progress = complete ? 100 : Math.min(92, Math.round((answeredCount / Math.max(quizCount,1))*70 + 8));
  return `<article class="lesson-shell">
    <div class="lesson-top"><button class="btn ghost small-btn" data-nav="learn">← Learn</button><div class="eyebrow" style="margin-top:20px">${formatSkill(l.skill)}</div><h1 class="lesson-title">${esc(l.title)}</h1><div class="meta"><span>${l.cefr}</span><span>IELTS ${l.ieltsRange}</span><span>${l.estimatedMinutes} min</span><span>Difficulty ${l.difficulty}/5</span>${complete?'<span class="chip success">Completed</span>':''}</div><p class="lede">${esc(l.objective)}</p>${state.ui.chineseHelp?`<div class="callout" style="margin-top:14px"><strong>中文說明</strong><br>${esc(l.chinese)}</div>`:''}</div>
    <div class="lesson-progress"><div class="progress-line"><span style="width:${progress}%"></span></div></div>
    ${l.sections.map((s,si)=>`<section class="lesson-section" id="section-${si}"><h2>${esc(s.title)}</h2>${s.html||''}${(s.blocks||[]).map(b=>renderBlock(b,l)).join('')}</section>`).join('')}
    <section class="lesson-section"><div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">Finish</div><h2 style="margin-top:6px">Turn this lesson into progress.</h2><p class="muted">Completion is saved locally. Review remains available at any time.</p></div><button class="btn primary" data-action="complete-lesson" data-lesson-id="${l.id}">${complete?'Completed ✓':'Mark lesson complete'}</button></div></section>
  </article>`;
}

function renderBlock(b, lesson) {
  if (b.type === 'quiz') return renderQuizBlock(b, lesson);
  if (b.type === 'audio') return `<div class="audio-box" style="margin-top:14px"><div class="small muted" style="margin-bottom:8px">${esc(b.label || 'Audio')} ${b.testLike?'· first listen: avoid transcript':''}</div><audio controls preload="metadata" src="${b.src}"></audio></div>`;
  if (b.type === 'note') return `<label class="stack" style="margin-top:14px"><strong>${esc(b.label)}</strong><textarea class="text-area note-input" data-note-id="${b.id}" placeholder="${esc(b.placeholder||'')}">${esc(state.notes[b.id]||'')}</textarea></label>`;
  if (b.type === 'writing') {
    const text = state.writingDrafts[b.id] || '';
    return `<div class="workspace" style="margin-top:16px"><div class="workspace-panel"><div class="eyebrow">Task</div><p style="margin-top:9px">${esc(b.task)}</p><div class="callout" style="margin-top:14px">Write ${b.minWords}–${b.maxWords} words for this mini task. Self-check first, then use AI feedback.</div></div><div><textarea class="text-area workspace-editor writing-input" data-writing-id="${b.id}" placeholder="Write your response here...">${esc(text)}</textarea><div class="editor-meta"><span data-word-count="${b.id}">${wordCount(text)} words</span><span>Saved locally</span></div><div class="cluster" style="margin-top:12px"><button class="btn primary" data-writing-prompt="${b.id}" data-prompt-type="${b.promptType}" data-task="${esc(b.task)}">Copy AI Feedback Prompt</button><button class="btn soft" data-action="preview-writing-prompt" data-writing-id="${b.id}" data-prompt-type="${b.promptType}" data-task="${esc(b.task)}">Preview prompt</button></div></div></div>`;
  }
  if (b.type === 'recorder') {
    const tx = state.speakingTranscripts[b.id] || '';
    return `<div class="card subtle" style="margin-top:16px"><div class="cluster" style="justify-content:space-between"><strong>${esc(b.question)}</strong><span class="chip">Practice recording</span></div><div class="cluster" style="margin:14px 0"><button class="btn primary record-btn" data-recorder-id="${b.id}">Start recording</button><button class="btn" data-stop-recorder="${b.id}" disabled>Stop</button><span class="small muted" data-record-status="${b.id}">Use microphone if available, then add or edit the transcript below.</span></div><div data-audio-preview="${b.id}"></div><label><span class="small muted">Transcript / notes</span><textarea class="text-area speaking-input" data-speaking-id="${b.id}" placeholder="Paste or type your transcript...">${esc(tx)}</textarea></label><div class="cluster" style="margin-top:12px"><button class="btn soft" data-speaking-prompt="${b.id}" data-prompt-type="${b.promptType}" data-question="${esc(b.question)}">Copy transcript feedback prompt</button></div></div>`;
  }
  return '';
}

function renderQuizBlock(q, lesson) {
  const saved = state.lessonAnswers[q.id];
  const selected = saved?.selected;
  const checked = saved?.checked;
  const correct = selected === q.answer;
  return `<div class="quiz-card" data-quiz="${q.id}"><div class="q-title">${esc(q.prompt)}</div><div class="options">${q.options.map((o,i)=>{
    const cls = checked ? (o===q.answer?'correct':(o===selected?'wrong':'')) : (o===selected?'selected':'');
    return `<button class="option ${cls}" data-quiz-option="${q.id}" data-value="${esc(o)}" ${checked?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`;
  }).join('')}</div><div class="cluster" style="margin-top:12px"><button class="btn small-btn ${checked?'soft':'primary'}" data-check-quiz="${q.id}" ${!selected||checked?'disabled':''}>${checked?'Checked':'Check'}</button>${checked&&!correct?`<button class="btn primary small-btn" data-retry-quiz="${q.id}">Retry</button><button class="btn ghost small-btn" data-save-error="${q.id}">${state.errors.some(e=>e.questionId===q.id)?'Saved to Error Notebook':'Save error'}</button>`:''}</div>${checked?`<div class="feedback ${correct?'correct':'wrong'}"><strong>${correct?'Correct':'Not yet'}</strong><br>${esc(q.rationale)}</div>`:''}</div>`;
}

function renderPlacement() {
  if (!placementData) return `<div class="placement-shell"><div class="card"><h2>Loading Quick Placement…</h2><p class="muted">Serve this site through a static web server so the placement JSON can load.</p></div></div>`;
  if (!placementSession) {
    return `<div class="placement-shell"><section class="page-head"><div><div class="eyebrow">Quick Placement</div><h1>Find a useful starting point in about 12–15 minutes.</h1><p class="lede">This is a short adaptive starting signal—not an official IELTS test and not a precise band prediction.</p></div></section><section class="card elevated"><div class="grid two"><div><h3>24 questions</h3><p class="muted">Vocabulary 6 · Grammar 6 · Reading 6 · Listening 6</p></div><div><h3>What you get</h3><p class="muted">Overall stage, section profile, confidence, recommended difficulty and Best Next Opportunities.</p></div></div><div class="callout warning" style="margin:18px 0">Listening audio is prototype synthetic speech. Use headphones if possible.</div><button class="btn primary" data-action="start-placement">Start Quick Placement</button>${state.placement?'<button class="btn ghost" data-action="show-last-placement">View last result</button>':''}</section></div>`;
  }
  if (placementSession.done) return renderPlacementResult(placementSession.result);
  const flat = flattenPlacement();
  const item = flat[placementSession.index];
  const section = placementData.sections.find(s => s.id === item.sectionId);
  const selected = placementSession.answers[item.id] || '';
  const sectionIndex = placementData.sections.findIndex(s => s.id === item.sectionId);
  const inSectionIndex = section.questions.findIndex(q => q.id === item.id);
  return `<div class="placement-shell"><div class="placement-step"><div><div class="eyebrow">${esc(section.name)}</div><div class="section-progress">Section ${sectionIndex+1}/4 · Question ${inSectionIndex+1}/6</div></div><div class="placement-progress"><div class="progress-line"><span style="width:${((placementSession.index+1)/flat.length)*100}%"></span></div></div><span class="small muted">${placementSession.index+1}/24</span></div>
    ${section.skill==='reading' && inSectionIndex===0 ? `<div class="placement-passage">${section.passage.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}</div>`:''}
    ${section.skill==='listening' && inSectionIndex===0 ? `<div class="audio-box" style="margin-bottom:16px"><div class="small muted">Placement listening · normal speed</div><audio controls src="./${section.audio}"></audio><p class="small muted" style="margin-top:8px">Listen for the complete message. The transcript remains hidden during placement.</p></div>`:''}
    <section class="card placement-question"><span class="chip">${esc(item.id)}</span><h2 style="font-size:24px;margin:14px 0 18px">${esc(item.prompt)}</h2><div class="options">${item.options.map((o,i)=>`<button class="option ${selected===o?'selected':''}" data-placement-option="${esc(o)}"><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div></section>
    <div class="placement-actions"><button class="btn ghost" data-action="placement-back" ${placementSession.index===0?'disabled':''}>← Back</button><button class="btn primary" data-action="placement-next" ${selected?'':'disabled'}>${placementSession.index===23?'Finish placement':'Next →'}</button></div></div>`;
}

function flattenPlacement() {
  return placementData.sections.flatMap(section => section.questions.map(q => ({ ...q, sectionId: section.id, skill: section.skill })));
}

function scorePlacement() {
  const sectionScores = {};
  let total = 0;
  for (const section of placementData.sections) {
    let score = 0;
    for (const q of section.questions) if (placementSession.answers[q.id] === q.answer) score++;
    sectionScores[section.skill] = score;
    total += score;
  }
  const rule = placementData.scoring.overallRules.find(r => total >= r.min && total <= r.max);
  const unanswered = 24 - Object.keys(placementSession.answers).length;
  const vals = Object.values(sectionScores);
  const uneven = Math.max(...vals) - Math.min(...vals) >= 3;
  let confidence = (unanswered===0 && !uneven) ? 'High' : (unanswered<=2 ? 'Moderate' : 'Low');
  const weak = Object.entries(sectionScores).sort((a,b)=>a[1]-b[1]);
  const opportunities = weak.slice(0,3).map(([skill,score]) => ({ skill, score }));
  return { total, sectionScores, stage: rule.stage, reference: rule.reference, difficulty: rule.recommendedDifficulty, confidence, uneven, opportunities };
}

function renderPlacementResult(result) {
  return `<div class="placement-shell"><section class="page-head"><div><div class="eyebrow">Your starting profile</div><h1>${esc(result.stage)} · ${esc(result.reference)}</h1><p class="lede">A short placement signal for choosing lessons. It is not an official or exact IELTS band.</p></div></section><div class="grid two"><section class="card elevated"><div class="cluster"><div class="score-circle">${result.total}<span class="small">/24</span></div><div><h2>${esc(result.stage)}</h2><p class="muted">Reference ${esc(result.reference)}</p><span class="chip primary">Recommended difficulty ${result.difficulty}/5</span></div></div></section><section class="card"><div class="eyebrow">Confidence</div><h2 style="margin:10px 0">${result.confidence}</h2><p class="muted">${result.uneven?'Your section scores are uneven. Use skill-specific recommendations rather than one overall label.':'All sections were completed without an extreme spread.'}</p></section></div>
    <section class="card" style="margin-top:18px"><div class="eyebrow">Section profile</div>${Object.entries(result.sectionScores).map(([k,v])=>`<div class="profile-row"><strong>${formatSkill(k)}</strong><div class="meter"><span style="width:${v/6*100}%"></span></div><span>${v}/6</span></div>`).join('')}</section>
    <section class="card" style="margin-top:18px"><div class="eyebrow">Best Next Opportunities</div><div class="stack" style="margin-top:12px">${result.opportunities.map((o,i)=>`<div><strong>${i+1}. ${formatSkill(o.skill)}</strong><div class="small muted">${o.score}/6 — confirm this pattern through real study data, then repair the most useful subskill.</div></div>`).join('')}</div></section>
    <div class="cluster" style="margin-top:18px"><button class="btn primary" data-action="save-placement-result">Save profile & start learning</button><button class="btn soft" data-action="restart-placement">Retake</button></div></div>`;
}

function renderModal() {
  if (!modal) return '';
  if (modal.type === 'prompt') return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">AI Prompt</div><h2>${esc(modal.title || 'Prompt preview')}</h2></div><button class="btn ghost" data-action="close-modal">✕</button></div><div class="prompt-preview" style="margin-top:18px">${esc(modal.text)}</div><div class="cluster" style="margin-top:16px"><button class="btn primary" data-copy-text="prompt-modal">Copy prompt</button><button class="btn soft" data-action="close-modal">Close</button></div></div></div>`;
  if (modal.type === 'library') return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" onclick="event.stopPropagation()"><div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">Prompt Library V1</div><h2>Portable AI coaching</h2></div><button class="btn ghost" data-action="close-modal">✕</button></div><p class="muted" style="margin-top:10px">The site builds prompts for external LLMs. Feedback is for learning and should lead to a rewrite or retry.</p><div class="stack" style="margin-top:18px">${[
    ['Writing Task 1','writing-task1-feedback'],['Writing Task 2','writing-task2-feedback'],['Speaking transcript','speaking-transcript-feedback'],['Grammar coach','grammar-correction'],['Vocabulary coach','vocabulary-coach'],['Error analysis','error-analysis']
  ].map(([label,key])=>`<button class="btn" data-template-preview="${key}">${label}</button>`).join('')}</div></div></div>`;
  return '';
}

function wordCount(text) { return (text.trim().match(/\S+/g) || []).length; }
function fillTemplate(template, context) { return template.replace(/\{(\w+)\}/g, (_,key) => context[key] ?? `[${key}]`); }

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); showToast('✓ Prompt copied'); }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); showToast('✓ Prompt copied');
  }
}

function buildWritingPrompt(type, task, id) {
  return fillTemplate(PROMPT_TEMPLATES[type], { targetBand: state.profile.targetBand, task, response: state.writingDrafts[id] || '' });
}
function buildSpeakingPrompt(type, question, id) {
  return fillTemplate(PROMPT_TEMPLATES[type], { targetBand: state.profile.targetBand, part: '1', question, transcript: state.speakingTranscripts[id] || '' });
}
function buildErrorPrompt(e) {
  return fillTemplate(PROMPT_TEMPLATES['error-analysis'], { skill: formatSkill(e.skill), question: e.question, myAnswer: e.myAnswer, correctAnswer: e.correctAnswer, source: e.rationale || 'Use the lesson evidence supplied above.' });
}

function bindDynamicInputs() {
  document.querySelectorAll('.note-input').forEach(el => el.addEventListener('input', () => { state.notes[el.dataset.noteId] = el.value; saveState(); }));
  document.querySelectorAll('.writing-input').forEach(el => el.addEventListener('input', () => {
    state.writingDrafts[el.dataset.writingId] = el.value; saveState();
    const counter = document.querySelector(`[data-word-count="${el.dataset.writingId}"]`); if (counter) counter.textContent = `${wordCount(el.value)} words`;
  }));
  document.querySelectorAll('.speaking-input').forEach(el => el.addEventListener('input', () => { state.speakingTranscripts[el.dataset.speakingId] = el.value; saveState(); }));
}

function saveErrorFromQuiz(questionId) {
  if (state.errors.some(e => e.questionId === questionId)) return showToast('Already in Error Notebook');
  const q = findLessonQuiz(questionId);
  const ans = state.lessonAnswers[questionId];
  if (!q || !ans || ans.selected === q.answer) return;
  const lesson = LESSONS.find(l => l.sections.some(s => (s.blocks||[]).some(b => b.id === questionId)));
  const e = { id: `err-${Date.now()}-${questionId}`, ts: Date.now(), questionId, lessonId: lesson?.id, skill: lesson?.skill || 'general', question: q.prompt, myAnswer: ans.selected, correctAnswer: q.answer, rationale: q.rationale, errorTag: q.errorTag };
  state.errors.push(e); saveState(); showToast('Saved to Error Notebook'); render();
}

function findLessonQuiz(id) {
  for (const l of LESSONS) for (const s of l.sections) for (const b of (s.blocks||[])) if (b.type==='quiz' && b.id===id) return b;
  return null;
}

function completeLesson(id) {
  if (!state.completedLessons.includes(id)) state.completedLessons.push(id);
  state.studyHistory.push({ ts: Date.now(), type: 'lesson-complete', lessonId: id });
  saveState(); showToast('Lesson saved as complete'); render();
}

async function startRecording(id) {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    showToast('Recording is not supported here. Use the transcript box instead.'); return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const preview = document.querySelector(`[data-audio-preview="${id}"]`);
      if (preview) preview.innerHTML = `<audio controls src="${url}"></audio><div class="small muted">Local preview only; audio is not uploaded.</div>`;
      stream.getTracks().forEach(t => t.stop());
      recorders.delete(id);
    };
    recorders.set(id, recorder); recorder.start();
    document.querySelector(`[data-record-status="${id}"]`).textContent = 'Recording… speak naturally; continue after small mistakes.';
    document.querySelector(`[data-recorder-id="${id}"]`).disabled = true;
    document.querySelector(`[data-stop-recorder="${id}"]`).disabled = false;
  } catch { showToast('Microphone permission was not available. Use the transcript box instead.'); }
}
function stopRecording(id) { const r = recorders.get(id); if (r && r.state !== 'inactive') r.stop(); render(); }

function handleClick(e) {
  const nav = e.target.closest('[data-nav]'); if (nav) return go(nav.dataset.nav);
  const lesson = e.target.closest('[data-lesson]'); if (lesson) return go(`lesson/${lesson.dataset.lesson}`);
  const minutes = e.target.closest('[data-minutes]'); if (minutes) { state.study.preferredMinutes = Number(minutes.dataset.minutes); saveState(); return render(); }
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action) return handleAction(action, e.target.closest('[data-action]'));

  const qopt = e.target.closest('[data-quiz-option]');
  if (qopt) { const id=qopt.dataset.quizOption; state.lessonAnswers[id] = { selected:qopt.dataset.value, checked:false }; saveState(); return render(); }
  const qcheck = e.target.closest('[data-check-quiz]');
  if (qcheck) {
    const id=qcheck.dataset.checkQuiz;
    const q=findLessonQuiz(id);
    const answer=state.lessonAnswers[id];
    answer.checked=true;
    if (q && answer.selected===q.answer) resolveSavedErrorsForCorrectAnswer(state,id);
    saveState();
    return render();
  }
  const retryQuiz=e.target.closest('[data-retry-quiz]');
  if (retryQuiz) { delete state.lessonAnswers[retryQuiz.dataset.retryQuiz]; saveState(); showToast('Retry unlocked'); return render(); }
  const saveErr = e.target.closest('[data-save-error]'); if (saveErr) return saveErrorFromQuiz(saveErr.dataset.saveError);

  const popt = e.target.closest('[data-placement-option]');
  if (popt) { const item=flattenPlacement()[placementSession.index]; placementSession.answers[item.id]=popt.dataset.placementOption; return render(); }

  const writingCopy = e.target.closest('[data-writing-prompt]');
  if (writingCopy) return copyText(buildWritingPrompt(writingCopy.dataset.promptType, writingCopy.dataset.task, writingCopy.dataset.writingPrompt));
  const speakingCopy = e.target.closest('[data-speaking-prompt]');
  if (speakingCopy) return copyText(buildSpeakingPrompt(speakingCopy.dataset.promptType, speakingCopy.dataset.question, speakingCopy.dataset.speakingPrompt));

  const errPrompt = e.target.closest('[data-error-prompt]');
  if (errPrompt) { const err=state.errors.find(x=>x.id===errPrompt.dataset.errorPrompt); if(err){modal={type:'prompt',title:'Error Analysis Coach',text:buildErrorPrompt(err)};render();} return; }
  const tpl = e.target.closest('[data-template-preview]');
  if (tpl) { modal={type:'prompt',title:'Prompt template',text:PROMPT_TEMPLATES[tpl.dataset.templatePreview]}; return render(); }
  const copy = e.target.closest('[data-copy-text]'); if (copy && modal?.text) return copyText(modal.text);

  const rec = e.target.closest('[data-recorder-id]'); if (rec) return startRecording(rec.dataset.recorderId);
  const stop = e.target.closest('[data-stop-recorder]'); if (stop) return stopRecording(stop.dataset.stopRecorder);
}

function handleAction(action, el) {
  if (action==='toggle-theme') return toggleTheme();
  if (action==='toggle-chinese') { state.ui.chineseHelp=!state.ui.chineseHelp; saveState(); return render(); }
  if (action==='open-prompt-library') { modal={type:'library'}; return render(); }
  if (action==='close-modal') { modal=null; return render(); }
  if (action==='complete-lesson') return completeLesson(el.dataset.lessonId);
  if (action==='save-target') { const input=document.querySelector('#targetBand'); const v=Number(input?.value); if(v>=5&&v<=9){state.profile.targetBand=v;saveState();showToast('Target saved');render();} return; }
  if (action==='start-placement' || action==='restart-placement') { placementSession={index:0,answers:{},done:false,result:null}; return render(); }
  if (action==='placement-back') { placementSession.index=Math.max(0,placementSession.index-1); return render(); }
  if (action==='placement-next') { const flat=flattenPlacement(); if(!placementSession.answers[flat[placementSession.index].id])return; if(placementSession.index===flat.length-1){placementSession.result=scorePlacement();placementSession.done=true;}else placementSession.index++; return render(); }
  if (action==='save-placement-result') {
    const r=placementSession.result; state.placement={...r,ts:Date.now()}; state.profile.stage=r.stage; state.profile.referenceLevel=r.reference; state.profile.recommendedDifficulty=r.difficulty; state.profile.confidence=r.confidence; state.profile.placementSections=r.sectionScores; state.studyHistory.push({ts:Date.now(),type:'placement'}); saveState(); showToast('Starting profile saved'); placementSession=null; return go('today');
  }
  if (action==='show-last-placement') { const r=state.placement; if(r){placementSession={done:true,result:r,answers:{},index:24};return render();} }
  if (action==='clear-errors') { if(confirm('Clear the Error Notebook in this browser?')){state.errors=[];state.fixedErrors=[];saveState();render();} return; }
  if (action==='retry-error') {
    const error=state.errors.find(item=>item.id===el.dataset.errorId);
    if (!error || !resetLessonErrorForRetry(state,error,LESSONS)) return showToast('This source requires a full practice/test retry');
    saveState(); showToast('Retry unlocked'); return go(`lesson/${error.lessonId}`);
  }
  if (action==='mark-fixed') { if(!state.fixedErrors.includes(el.dataset.errorId)) state.fixedErrors.push(el.dataset.errorId); saveState(); showToast('Marked corrected'); return render(); }
  if (action==='open-error-prompt') { modal={type:'prompt',title:'Error Analysis Coach',text:PROMPT_TEMPLATES['error-analysis']}; return render(); }
  if (action==='preview-writing-prompt') { modal={type:'prompt',title:'Writing feedback prompt',text:buildWritingPrompt(el.dataset.promptType, el.dataset.task, el.dataset.writingId)}; return render(); }
}

document.addEventListener('click', handleClick);
window.addEventListener('hashchange', render);

initTheme();
await loadPlacement();
render();
