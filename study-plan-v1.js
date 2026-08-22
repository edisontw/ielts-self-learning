import { LESSONS } from './data.js';
import './question-type-lab-v2.js';
import { QUESTION_TYPE_LABS } from './question-type-lab-v1.js';
import { MINI_TESTS } from './mini-test-data-v1.js';

const CORE_KEY = 'ielts-self-learning-v1';
const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const PLAN_KEY = 'ielts-study-plan-v1';
const DAY = 86400000;

const CORE_30_IDS = [
  'LB01','LB02','LB03','LB04',
  'R01','R02','R03','R04','R05',
  'L01','L02','L03','L04','L05',
  'W01','W02','W03','W04','W05',
  'S01','S02','S03','S04','S05',
  'VG01','VG02','VG03','I01','I02','I03'
];
const SKILL_ORDER = ['reading','listening','writing','speaking','vocabulary','grammar'];
const CORE_BY_SKILL = {
  'learning-better':['LB01','LB02','LB03','LB04'],
  reading:['R01','R02','R03','R04','R05'],
  listening:['L01','L02','L03','L04','L05'],
  writing:['W01','W02','W03','W04','W05'],
  speaking:['S01','S02','S03','S04','S05'],
  vocabulary:['VG01'],
  grammar:['VG02','VG03'],
  'ielts-strategy':['I01','I02','I03']
};

const esc = (v='') => String(v).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const clamp = (v,min=0,max=1) => Math.min(max, Math.max(min, v));
const lessonById = id => LESSONS.find(l => l.id === id);
const label = skill => ({reading:'Reading',listening:'Listening',writing:'Writing',speaking:'Speaking',vocabulary:'Vocabulary',grammar:'Grammar','learning-better':'Learning Better','ielts-strategy':'IELTS Strategy'})[skill] || skill;
const retryCount = (adaptive, skill) => (adaptive.productiveEvidence?.[skill] || []).filter(x => x.attemptKind === 'retry').length;

function localDateString(ts=Date.now()) {
  const d = new Date(ts - new Date(ts).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0,10);
}

function placementWeakness(core, skill) {
  const p = core.profile?.placementSections || {};
  if (skill === 'reading' || skill === 'listening' || skill === 'vocabulary' || skill === 'grammar') {
    return p[skill] == null ? 0.5 : (6 - p[skill]) / 6;
  }
  if (skill === 'writing') {
    const g = p.grammar == null ? 0.5 : (6 - p.grammar) / 6;
    const v = p.vocabulary == null ? 0.5 : (6 - p.vocabulary) / 6;
    return clamp(Math.max(g,v) * 0.8 + 0.15);
  }
  if (skill === 'speaking') return 0.55;
  return 0.4;
}

function skillPriority(core, adaptive, skill) {
  let weakness = placementWeakness(core, skill);
  const perf = adaptive.skillPerformance?.[skill];
  if (perf?.answered) {
    const observed = 1 - perf.accuracy;
    const weight = perf.answered >= 12 ? 0.7 : perf.answered >= 8 ? 0.6 : perf.answered >= 4 ? 0.45 : 0.25;
    weakness = weakness * (1-weight) + observed * weight;
  }
  if ((skill === 'writing' || skill === 'speaking') && adaptive.productivePriority?.[skill]) {
    weakness = weakness * 0.65 + adaptive.productivePriority[skill].score * 0.35;
  }
  const skillErrors = (core.errors || []).filter(e => e.skill === skill).length;
  weakness += Math.min(0.12, skillErrors * 0.025);
  return clamp(weakness);
}

function prioritySnapshot(core, adaptive) {
  return SKILL_ORDER.map(skill => ({ skill, score: skillPriority(core, adaptive, skill) })).sort((a,b) => b.score-a.score);
}

function dueCounts(core, adaptive) {
  const now = Date.now();
  const errors = (core.errors || []).filter(e => (adaptive.reviewSchedule?.[e.id]?.dueAt ?? e.ts ?? now) <= now).length;
  const vocab = Object.values(adaptive.vocabularySchedule || {}).filter(v => (v?.dueAt || Infinity) <= now).length;
  return { errors, vocab };
}

function phaseFor(week, totalWeeks) {
  if (totalWeeks === 4) return ['Foundation','Build','Transfer','Test & Review'][week-1];
  const r = week / totalWeeks;
  if (r <= 0.25) return 'Foundation';
  if (r <= 0.62) return 'Build';
  if (r <= 0.84) return 'Transfer';
  return 'Test & Review';
}

function task(kind, sourceId, title, skill, minutes, reason, extra={}) {
  return { kind, sourceId, title, skill, minutes, reason, examSpecific:false, ...extra };
}

function generatePlan(config={}) {
  const core = read(CORE_KEY);
  const adaptive = read(ADAPTIVE_KEY);
  const weeks = [4,8,12,16].includes(Number(config.weeks)) ? Number(config.weeks) : 8;
  const daysPerWeek = clamp(Number(config.daysPerWeek) || 5, 3, 6);
  const minutesPerSession = [20,30,45,60].includes(Number(config.minutesPerSession)) ? Number(config.minutesPerSession) : (Number(core.study?.preferredMinutes) >= 30 ? Number(core.study.preferredMinutes) : 30);
  const completed = new Set(core.completedLessons || []);
  const planned = new Set(completed);
  const priorities = prioritySnapshot(core, adaptive);
  const due = dueCounts(core, adaptive);
  const usedLabs = new Set(completed);
  const testHistory = adaptive.miniTestHistory || [];
  const usedTests = new Set(testHistory.map(x => x.testId));
  const planWeeks = [];
  const skillCursor = Object.fromEntries(Object.keys(CORE_BY_SKILL).map(k => [k,0]));
  const productiveBaseline = {
    writing: retryCount(adaptive,'writing'),
    speaking: retryCount(adaptive,'speaking')
  };
  const productivePlanned = { writing:0, speaking:0 };

  const nextCore = preferredSkill => {
    const rankedSkills = [preferredSkill, ...priorities.map(x=>x.skill), 'learning-better', 'ielts-strategy', 'grammar', 'vocabulary'].filter((v,i,a)=>a.indexOf(v)===i);
    for (const skill of rankedSkills) {
      const ids = CORE_BY_SKILL[skill] || [];
      while ((skillCursor[skill] || 0) < ids.length) {
        const id = ids[skillCursor[skill]++];
        if (planned.has(id)) continue;
        const lesson = lessonById(id);
        if (!lesson) continue;
        const prereqs = lesson.prerequisites || [];
        if (prereqs.some(p => CORE_30_IDS.includes(p) && !planned.has(p))) {
          skillCursor[skill]--;
          break;
        }
        planned.add(id);
        return task('lesson', id, lesson.title, lesson.skill, Math.min(minutesPerSession, lesson.estimatedMinutes || minutesPerSession), `Build ${label(lesson.skill)} before adding more test pressure.`, { examSpecific: lesson.skill === 'ielts-strategy' });
      }
    }
    return null;
  };

  const nextLab = preferredSkill => {
    const choices = QUESTION_TYPE_LABS
      .filter(l => !usedLabs.has(l.id))
      .filter(l => (l.prerequisites || []).every(p => planned.has(p) || completed.has(p)))
      .sort((a,b) => {
        const ap = a.skill === preferredSkill ? 2 : (1 - (priorities.findIndex(x=>x.skill===a.skill)+1)/20);
        const bp = b.skill === preferredSkill ? 2 : (1 - (priorities.findIndex(x=>x.skill===b.skill)+1)/20);
        return bp-ap;
      });
    const lesson = choices[0];
    if (!lesson) return null;
    usedLabs.add(lesson.id);
    planned.add(lesson.id);
    return task('lab', lesson.id, lesson.title.replace('Question Type Lab: ',''), lesson.skill, Math.min(minutesPerSession, lesson.estimatedMinutes || minutesPerSession), `Practise one high-value ${label(lesson.skill)} exam decision with feedback.`, { examSpecific:true });
  };

  const nextMiniTest = preferredSkill => {
    const choices = MINI_TESTS.filter(t => !usedTests.has(t.id)).sort((a,b) => Number(b.skill===preferredSkill)-Number(a.skill===preferredSkill));
    const test = choices[0];
    if (!test) return null;
    usedTests.add(test.id);
    return task('mini-test', test.id, test.title, test.skill, Math.min(minutesPerSession, Math.round(test.timeLimitSeconds/60)+8), `Check whether repaired ${label(test.skill)} skills transfer under Test Mode.`, { examSpecific:true });
  };

  const productiveTask = () => {
    const ranked = ['writing','speaking']
      .map(skill => ({ skill, p:adaptive.productivePriority?.[skill] }))
      .filter(x => x.p)
      .sort((a,b)=>(b.p?.score||0)-(a.p?.score||0));
    if (!ranked.length) return null;
    const skill = ranked[0].skill;
    const id = skill === 'writing' ? 'W05' : 'S04';
    productivePlanned[skill] += 1;
    return task('productive-retry', id, `${label(skill)} feedback → retry`, skill, minutesPerSession, 'Turn feedback into a second attempt instead of collecting comments.', {
      examSpecific:false,
      requiredRetryCount: productiveBaseline[skill] + productivePlanned[skill]
    });
  };

  if (!core.placement) planned.add('PLACEMENT');

  for (let w=1; w<=weeks; w++) {
    const phase = phaseFor(w,weeks);
    const sessions = [];
    const desiredExam = phase === 'Foundation' ? Math.max(1, Math.floor(daysPerWeek*0.25)) : Math.max(1, Math.round(daysPerWeek*0.4));
    let examUsed = 0;

    if (w === 1 && !core.placement) {
      sessions.push(task('placement','PLACEMENT','Quick Placement','profile',15,'Establish a starting signal before relying on adaptive priorities.'));
    }

    if (sessions.length < daysPerWeek && (due.errors || due.vocab || w > 1)) {
      sessions.push(task('review',`REVIEW-W${w}`,'Adaptive Review Queue','review',Math.min(20,minutesPerSession),due.errors||due.vocab ? `${due.errors} error review and ${due.vocab} vocabulary item(s) are currently due.` : 'Protect retention before adding more new material.'));
    }

    if (sessions.length < daysPerWeek && (phase === 'Build' || phase === 'Transfer') && w % 2 === 0) {
      const prod = productiveTask();
      if (prod) sessions.push(prod);
    }

    let safety=0;
    while (sessions.length < daysPerWeek && safety++ < 50) {
      const preferred = priorities[(sessions.length + w - 1) % Math.min(4, priorities.length)]?.skill || 'reading';
      let next = null;
      const remaining = daysPerWeek - sessions.length;
      const needExam = examUsed < desiredExam && remaining <= (desiredExam - examUsed + 1);

      if ((phase === 'Transfer' || phase === 'Test & Review') && needExam) {
        next = phase === 'Test & Review' ? nextMiniTest(preferred) : nextLab(preferred);
        next ||= nextLab(preferred);
      }
      if (!next && phase === 'Build' && needExam) next = nextLab(preferred);
      if (!next) next = nextCore(preferred);
      if (!next && examUsed < desiredExam) next = nextLab(preferred) || nextMiniTest(preferred);
      if (!next) break;
      if (next.examSpecific) examUsed++;
      sessions.push(next);
    }

    while (sessions.length < daysPerWeek) {
      sessions.push(task('review',`REVIEW-W${w}-${sessions.length+1}`,'Review / retry buffer','review',minutesPerSession,'Use this session for due retrieval, an unfinished lesson, or a retry from feedback.'));
    }

    sessions.forEach((s,i) => { s.key = `W${w}-S${i+1}-${s.kind}-${s.sourceId}`; s.session = i+1; });
    planWeeks.push({ week:w, phase, sessions });
  }

  const allSessions = planWeeks.flatMap(x=>x.sessions);
  const examCount = allSessions.filter(x=>x.examSpecific).length;
  const plan = {
    version:1,
    generatedAt:Date.now(),
    startDate:localDateString(),
    config:{ weeks, daysPerWeek, minutesPerSession },
    targetBand:Number(core.profile?.targetBand || 7),
    profileReady:Boolean(core.placement),
    priorities,
    dueAtGeneration:due,
    weeks:planWeeks,
    manualDone:[],
    summary:{ totalSessions:allSessions.length, examSessions:examCount, examRatio:allSessions.length ? examCount/allSessions.length : 0 }
  };
  write(PLAN_KEY,plan);
  window.dispatchEvent(new CustomEvent('ielts-study-plan-change',{detail:plan}));
  return plan;
}

function currentWeek(plan) {
  const start = new Date(`${plan.startDate}T00:00:00`);
  const elapsed = Math.max(0, Math.floor((Date.now()-start.getTime()) / DAY));
  return Math.min(plan.config.weeks, Math.floor(elapsed/7)+1);
}

function automaticallyDone(taskItem, core, adaptive) {
  if (taskItem.kind === 'placement') return Boolean(core.placement);
  if (taskItem.kind === 'lesson' || taskItem.kind === 'lab') return (core.completedLessons || []).includes(taskItem.sourceId);
  if (taskItem.kind === 'mini-test') return (adaptive.miniTestHistory || []).some(x => x.testId === taskItem.sourceId);
  if (taskItem.kind === 'productive-retry') return retryCount(adaptive,taskItem.skill) >= Number(taskItem.requiredRetryCount || 1);
  return false;
}

function actualDone(taskItem, core, adaptive, plan) {
  if (automaticallyDone(taskItem,core,adaptive)) return true;
  return taskItem.kind === 'review' && (plan.manualDone || []).includes(taskItem.key);
}

function taskButton(t) {
  if (t.kind === 'lesson' || t.kind === 'lab' || t.kind === 'productive-retry') return `<button class="btn soft small-btn" data-lesson="${esc(t.sourceId)}">Open</button>`;
  if (t.kind === 'placement') return `<button class="btn soft small-btn" data-nav="placement">Open</button>`;
  if (t.kind === 'review') return `<button class="btn soft small-btn" data-nav="improve">Review</button>`;
  if (t.kind === 'mini-test') return `<button class="btn soft small-btn" data-mini-action="start" data-test-id="${esc(t.sourceId)}">Start Mini Test</button>`;
  return '';
}

function taskRow(t, core, adaptive, plan) {
  const auto = automaticallyDone(t,core,adaptive);
  const done = actualDone(t,core,adaptive,plan);
  const completionControl = t.kind === 'review'
    ? `<button class="btn ghost small-btn" data-sp-action="toggle-done" data-task-key="${esc(t.key)}">${done?'Undo':'Mark done'}</button>`
    : `<span class="small muted">${auto?'Auto tracked':'Completion is auto tracked'}</span>`;
  return `<div class="card subtle" style="padding:14px;${done?'opacity:.72':''}">
    <div class="cluster" style="justify-content:space-between;align-items:flex-start"><div><div class="cluster"><span class="chip ${done?'success':(t.examSpecific?'warning':'')}">${done?'Done':esc(t.kind.replaceAll('-',' '))}</span><span class="small muted">${esc(label(t.skill))} · ${t.minutes} min</span></div><strong style="display:block;margin-top:8px">${esc(t.title)}</strong><div class="small muted" style="margin-top:5px">${esc(t.reason)}</div></div><div class="cluster">${taskButton(t)}${completionControl}</div></div>
  </div>`;
}

function builderHTML(plan) {
  const core = read(CORE_KEY);
  const adaptive = read(ADAPTIVE_KEY);
  const cfg = plan?.config || { weeks:8, daysPerWeek:5, minutesPerSession:Number(core.study?.preferredMinutes)>=30?Number(core.study.preferredMinutes):30 };
  const priority = plan?.priorities || prioritySnapshot(core,adaptive);
  const weekNow = plan ? currentWeek(plan) : 1;
  const profileChanged = Boolean(plan?.weeks?.length && !plan.profileReady && core.placement);
  const planBody = !plan ? `<div class="empty-state"><strong>No study plan yet.</strong><p>Create a plan from your current profile. If Placement is missing, it becomes the first session.</p></div>` : `
    ${profileChanged?`<div class="callout warning" style="margin:16px 0"><strong>Placement is now available.</strong><br><span class="small">The plan is being rebalanced from your new skill profile.</span></div>`:''}
    <div class="grid four" style="margin:16px 0"><div class="card stat"><div class="stat-value">${plan.config.weeks}</div><div class="stat-label">weeks</div></div><div class="card stat"><div class="stat-value">${plan.summary.totalSessions}</div><div class="stat-label">planned sessions</div></div><div class="card stat"><div class="stat-value">${Math.round(plan.summary.examRatio*100)}%</div><div class="stat-label">explicit IELTS transfer</div></div><div class="card stat"><div class="stat-value">${weekNow}</div><div class="stat-label">current week</div></div></div>
    <div class="callout"><strong>Top priorities:</strong> ${priority.slice(0,3).map(x=>`${label(x.skill)} ${Math.round(x.score*100)}`).join(' · ')}<br><span class="small muted">Priority is a planning signal from Placement, observed answers, productive retry evidence and saved errors—not an IELTS score.</span></div>
    <div class="stack" style="margin-top:16px">${plan.weeks.map(w=>`<details ${w.week===weekNow?'open':''}><summary><strong>Week ${w.week} · ${esc(w.phase)}</strong> <span class="small muted">${w.sessions.filter(s=>actualDone(s,core,adaptive,plan)).length}/${w.sessions.length} done</span></summary><div class="stack" style="margin-top:10px">${w.sessions.map(s=>taskRow(s,core,adaptive,plan)).join('')}</div></details>`).join('')}</div>`;
  return `<section class="card extension-card" data-study-plan-builder style="margin-top:18px">
    <div class="adaptive-top"><div><div class="eyebrow">Adaptive Study Plan · V1</div><h2>Build a 4 / 8 / 12 / 16-week learning path.</h2></div><span class="chip primary">60% skill building · up to 40% IELTS transfer</span></div>
    <p class="muted">The plan uses your current profile and keeps review/retry in the schedule. Regenerate it when your available time or priorities change.</p>
    <div class="grid three" style="margin-top:14px">
      <label><span class="small muted">Plan length</span><select class="text-input" data-sp-weeks>${[4,8,12,16].map(v=>`<option value="${v}" ${cfg.weeks===v?'selected':''}>${v} weeks</option>`).join('')}</select></label>
      <label><span class="small muted">Study days / week</span><select class="text-input" data-sp-days>${[3,4,5,6].map(v=>`<option value="${v}" ${cfg.daysPerWeek===v?'selected':''}>${v} days</option>`).join('')}</select></label>
      <label><span class="small muted">Minutes / session</span><select class="text-input" data-sp-minutes>${[20,30,45,60].map(v=>`<option value="${v}" ${cfg.minutesPerSession===v?'selected':''}>${v} min</option>`).join('')}</select></label>
    </div>
    <div class="cluster" style="margin-top:14px"><button class="btn primary" data-sp-action="generate">${plan?'Rebalance remaining plan':'Create study plan'}</button>${plan?`<span class="small muted">Generated ${new Date(plan.generatedAt).toLocaleDateString()} · target IELTS Academic ${Number(plan.targetBand).toFixed(1)}</span>`:''}</div>
    ${planBody}
  </section>`;
}

function injectProgress() {
  if (!location.hash.includes('/progress') || document.querySelector('[data-study-plan-builder]')) return;
  const main = document.querySelector('#main');
  if (!main) return;
  const anchor = document.querySelector('[data-productive-progress]') || document.querySelector('[data-runtime-root="performance"]') || main.lastElementChild;
  const wrap = document.createElement('div');
  wrap.innerHTML = builderHTML(Object.keys(read(PLAN_KEY)).length ? read(PLAN_KEY) : null);
  const node = wrap.firstElementChild;
  if (anchor) anchor.insertAdjacentElement('afterend',node); else main.appendChild(node);
}

function injectToday() {
  if (!location.hash.includes('/today') || document.querySelector('[data-study-plan-today]')) return;
  const plan = read(PLAN_KEY);
  if (!plan?.weeks?.length) return;
  const core = read(CORE_KEY);
  const adaptive = read(ADAPTIVE_KEY);
  const weekNo = currentWeek(plan);
  const week = plan.weeks.find(w=>w.week===weekNo) || plan.weeks[0];
  const next = week.sessions.find(t=>!actualDone(t,core,adaptive,plan)) || week.sessions[0];
  if (!next) return;
  const anchor = document.querySelector('[data-productive-today]') || document.querySelector('[data-adaptive-root="today"]');
  if (!anchor) return;
  const section = document.createElement('section');
  section.className='card extension-card';
  section.dataset.studyPlanToday='true';
  section.style.marginTop='18px';
  section.innerHTML=`<div class="adaptive-top"><div><div class="eyebrow">Study Plan · Week ${week.week} · ${esc(week.phase)}</div><h2>${esc(next.title)}</h2></div><span class="chip ${next.examSpecific?'warning':'primary'}">Session ${next.session}/${week.sessions.length}</span></div><p class="muted">${esc(next.reason)}</p><div class="cluster">${taskButton(next)}<button class="btn ghost small-btn" data-nav="progress">View full plan</button><span class="small muted">≈ ${next.minutes} min</span></div>`;
  anchor.insertAdjacentElement('afterend',section);
}

function replaceBuilder() {
  const old = document.querySelector('[data-study-plan-builder]');
  if (!old) return;
  const wrap=document.createElement('div');
  const plan=read(PLAN_KEY);
  wrap.innerHTML=builderHTML(plan?.weeks?.length?plan:null);
  old.replaceWith(wrap.firstElementChild);
}

function refreshAfterPlacement() {
  const plan = read(PLAN_KEY);
  if (!plan?.weeks?.length || plan.profileReady) return false;
  const core = read(CORE_KEY);
  if (!core.placement) return false;
  generatePlan(plan.config);
  return true;
}

function handleAction(button) {
  const action=button.dataset.spAction;
  if (action==='generate') {
    const weeks=Number(document.querySelector('[data-sp-weeks]')?.value||8);
    const daysPerWeek=Number(document.querySelector('[data-sp-days]')?.value||5);
    const minutesPerSession=Number(document.querySelector('[data-sp-minutes]')?.value||30);
    generatePlan({weeks,daysPerWeek,minutesPerSession});
    replaceBuilder();
  }
  if (action==='toggle-done') {
    const plan=read(PLAN_KEY); if(!plan?.weeks)return;
    plan.manualDone ||= [];
    const key=button.dataset.taskKey;
    const taskItem=plan.weeks.flatMap(w=>w.sessions).find(t=>t.key===key);
    if(!taskItem || taskItem.kind!=='review') return;
    const i=plan.manualDone.indexOf(key);
    if(i>=0)plan.manualDone.splice(i,1); else plan.manualDone.push(key);
    write(PLAN_KEY,plan);
    window.dispatchEvent(new CustomEvent('ielts-study-plan-change',{detail:plan}));
    replaceBuilder();
  }
}

function apply(){
  refreshAfterPlacement();
  injectProgress();
  injectToday();
}

document.addEventListener('click',e=>{
  const button=e.target.closest('[data-sp-action]');
  if(button)handleAction(button);
});
window.addEventListener('hashchange',()=>setTimeout(apply,0));
window.addEventListener('ielts-study-plan-change',()=>setTimeout(apply,0));
window.addEventListener('ielts-mini-test-submitted',()=>setTimeout(apply,0));
window.addEventListener('ielts-productive-evidence-change',()=>setTimeout(apply,0));
new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(apply,0);

export { generatePlan, prioritySnapshot, phaseFor, actualDone };
