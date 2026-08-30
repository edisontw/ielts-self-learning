import { CORE_LESSON_META, REPAIR_LESSONS, RECOMMENDATION_WEIGHTS } from './adaptive-data.js';
import { VOCABULARY_ITEMS } from './learning-extension-data.js';
import { adaptiveCandidates, recentSkillCounts, skillLabel } from './adaptive-guardrails-v1.js';
import { registerRenderEnhancement, scheduleEnhancementPass } from './render-lifecycle-v15.js';

const CORE_KEY='ielts-self-learning-v1';
const ADAPTIVE_KEY='ielts-adaptive-v1';
const esc=(value='')=>String(value).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};

function baseWeakness(core,skill){
  const p=core.profile?.placementSections||{};
  if(['reading','listening','vocabulary','grammar'].includes(skill)) return p[skill]==null?0.45:(6-p[skill])/6;
  if(skill==='writing'){
    const grammar=p.grammar==null?0.45:(6-p.grammar)/6;
    const vocab=p.vocabulary==null?0.45:(6-p.vocabulary)/6;
    return Math.max(grammar,vocab)*0.85+0.15;
  }
  if(skill==='speaking') return 0.55;
  return 0.35;
}

function combinedWeakness(core,adaptive,skill){
  const base=baseWeakness(core,skill);
  const perf=adaptive.skillPerformance?.[skill];
  if(!perf?.answered) return base;
  const actual=1-perf.accuracy;
  const weight=perf.answered>=8?0.65:perf.answered>=4?0.45:0.25;
  return base*(1-weight)+actual*weight;
}

function dueErrors(core,adaptive){
  const now=Date.now();
  return (core.errors||[]).filter(error=>(adaptive.reviewSchedule?.[error.id]?.dueAt??error.ts??now)<=now);
}

function eligibleVocabulary(core,adaptive){
  const done=new Set(core.completedLessons||[]);
  const repaired=new Set(Object.entries(adaptive.repairProgress||{}).filter(([,v])=>v?.completed).map(([id])=>id));
  return VOCABULARY_ITEMS.filter(item=>done.has(item.sourceLesson)||repaired.has(item.sourceLesson));
}

function dueVocabulary(core,adaptive){
  const now=Date.now();
  return eligibleVocabulary(core,adaptive).filter(item=>(adaptive.vocabularySchedule?.[item.id]?.dueAt||0)<=now);
}

export function scoreEligibleCandidate(core,adaptive,lesson,now=Date.now()){
  const counts=recentSkillCounts(core,adaptive,CORE_LESSON_META,REPAIR_LESSONS,now);
  const weakness=combinedWeakness(core,adaptive,lesson.skill);
  const dueForSkill=dueErrors(core,adaptive).filter(x=>x.skill===lesson.skill).length;
  const dueReview=Math.min(1,dueForSkill/2);
  const exposure=counts[lesson.skill]||0;
  const skillBalance=exposure>=2?0:(exposure===1?0.55:1);
  const recDifficulty=Number(core.profile?.recommendedDifficulty||3);
  const difficultyMatch=Math.max(0,1-Math.abs(recDifficulty-lesson.difficulty)/3);
  const available=Number(core.study?.preferredMinutes||20);
  const timeMatch=lesson.estimatedMinutes<=available?1:Math.max(0.15,available/lesson.estimatedMinutes);
  const recent=[...(core.studyHistory||[]),...(adaptive.learningHistory||[])].slice(-6).some(x=>x.lessonId===lesson.id);
  const b={
    weakness:weakness*RECOMMENDATION_WEIGHTS.weakness,
    dueReview:dueReview*RECOMMENDATION_WEIGHTS.dueReview,
    targetRelevance:(lesson.targetRelevance||0)*RECOMMENDATION_WEIGHTS.targetRelevance,
    skillBalance:skillBalance*RECOMMENDATION_WEIGHTS.skillBalance,
    difficultyMatch:difficultyMatch*RECOMMENDATION_WEIGHTS.difficultyMatch,
    timeMatch:timeMatch*RECOMMENDATION_WEIGHTS.timeMatch,
    recentPenalty:recent?RECOMMENDATION_WEIGHTS.recentRepetitionPenalty:0
  };
  return {lesson,b,score:b.weakness+b.dueReview+b.targetRelevance+b.skillBalance+b.difficultyMatch+b.timeMatch-b.recentPenalty};
}

export function bestEligibleRecommendation(core,adaptive,now=Date.now()){
  return adaptiveCandidates(core,adaptive,CORE_LESSON_META,REPAIR_LESSONS)
    .map(lesson=>scoreEligibleCandidate(core,adaptive,lesson,now))
    .sort((a,b)=>b.score-a.score)[0]||null;
}

function renderNewMaterial(root,core,adaptive){
  const rec=bestEligibleRecommendation(core,adaptive);
  if(!rec){
    const fingerprint='journey-complete';
    if(root.dataset.journeyGuardFingerprint===fingerprint)return;
    root.dataset.journeyGuardFingerprint=fingerprint;
    root.innerHTML=`<div class="adaptive-top"><div><div class="eyebrow">Adaptive Today · path complete</div><h2>No locked lesson is being forced into Today.</h2></div><span class="chip success">Core path complete</span></div><p class="muted">Use due review, Question Type Lab, Mini Tests, productive retries, or rebalance your Study Plan for the next cycle.</p><div class="cluster"><button class="btn primary" data-nav="progress">Open Progress</button><button class="btn soft" data-nav="ielts">Open IELTS practice</button></div>`;
    return;
  }
  const {lesson,b,score}=rec;
  const fingerprint=`journey-${lesson.id}-${Math.round(score)}-${Object.values(adaptive.skillPerformance||{}).map(x=>`${x.answered}:${x.correct}`).join('|')}`;
  if(root.dataset.journeyGuardFingerprint===fingerprint)return;
  root.dataset.journeyGuardFingerprint=fingerprint;
  root.innerHTML=`<div class="adaptive-top"><div><div class="eyebrow">Adaptive Today · prerequisite-safe</div><h2>${esc(lesson.title)}</h2></div><span class="score-badge">${Math.round(score)}</span></div><p class="muted">Placement and observed performance guide the choice, but locked lessons and Labs are excluded until their prerequisites are actually completed.</p><div class="adaptive-breakdown"><span>Weakness ${Math.round(b.weakness)}</span><span>Review ${Math.round(b.dueReview)}</span><span>Target ${Math.round(b.targetRelevance)}</span><span>Balance ${Math.round(b.skillBalance)}</span><span>Difficulty ${Math.round(b.difficultyMatch)}</span><span>Time ${Math.round(b.timeMatch)}</span>${b.recentPenalty?`<span class="penalty">Recent −${Math.round(b.recentPenalty)}</span>`:''}</div><div class="cluster"><button class="btn primary" data-lesson="${esc(lesson.id)}">Start recommended lesson</button><span class="small muted">${lesson.estimatedMinutes} min · ${esc(skillLabel(lesson.skill))} · Difficulty ${lesson.difficulty}/5</span></div>`;
}

function apply(){
  if(!location.hash.includes('/today'))return;
  const root=document.querySelector('[data-adaptive-root="today"]');
  if(!root)return;
  const core=read(CORE_KEY);
  if(!core.placement)return;
  const adaptive=read(ADAPTIVE_KEY);
  // The existing runtime owns retrieval-first mode. This guard only replaces
  // the new-material recommendation path.
  if(dueErrors(core,adaptive).length||dueVocabulary(core,adaptive).length)return;
  renderNewMaterial(root,core,adaptive);
}

if(typeof window!=='undefined'&&typeof document!=='undefined'){
  registerRenderEnhancement(apply);
  window.addEventListener('ielts-study-plan-change',scheduleEnhancementPass);
  window.addEventListener('ielts-mini-test-submitted',scheduleEnhancementPass);
}
