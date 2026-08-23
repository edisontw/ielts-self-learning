const CORE_KEY = 'ielts-self-learning-v1';
const PLAN_KEY = 'ielts-study-plan-v1';
const DISMISSED_KEY = 'ielts-site-guide-dismissed-v1';

const readJSON = key => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); }
  catch { return null; }
};

function learnerState() {
  const core = readJSON(CORE_KEY) || {};
  const plan = readJSON(PLAN_KEY);
  return {
    placement: Boolean(core.placement),
    plan: Boolean(plan?.weeks?.length),
    started: Boolean(core.completedLessons?.length || Object.keys(core.lessonAnswers || {}).length),
    review: Boolean(core.errors?.length || core.fixedErrors?.length)
  };
}

function statusLabel(done, current = false) {
  if (done) return '<span class="site-guide-status done">Done</span>';
  if (current) return '<span class="site-guide-status current">Next</span>';
  return '<span class="site-guide-status">Later</span>';
}

function welcomeHTML() {
  const s = learnerState();
  const nextPlacement = !s.placement;
  const nextPlan = s.placement && !s.plan;
  const nextStudy = s.placement && s.plan && !s.started;
  const nextReview = s.started && !s.review;
  return `<section class="card site-guide-welcome" data-site-guide-welcome>
    <div class="site-guide-welcome-head">
      <div><div class="eyebrow">Getting started</div><h2>Use the site in four steps.</h2><p class="muted">You do not need to choose everything yourself. Diagnose first, follow Today, save mistakes, then retry.</p></div>
      <button class="btn ghost small-btn" data-site-guide-dismiss aria-label="Hide getting-started guide">Hide</button>
    </div>
    <div class="site-guide-steps">
      <article class="site-guide-step ${nextPlacement ? 'active' : ''}"><span class="site-guide-number">1</span><div><strong>Quick Placement</strong><p>Get a starting profile across Vocabulary, Grammar, Reading and Listening. It is not an official IELTS band.</p></div>${statusLabel(s.placement, nextPlacement)}</article>
      <article class="site-guide-step ${nextPlan ? 'active' : ''}"><span class="site-guide-number">2</span><div><strong>Create a Study Plan</strong><p>Choose 4–16 weeks, study days and session length. The plan balances skill building with IELTS transfer.</p></div>${statusLabel(s.plan, nextPlan)}</article>
      <article class="site-guide-step ${nextStudy ? 'active' : ''}"><span class="site-guide-number">3</span><div><strong>Work from Today</strong><p>Today prioritises due review, weaknesses, prerequisites and the time you have available.</p></div>${statusLabel(s.started, nextStudy)}</article>
      <article class="site-guide-step ${nextReview ? 'active' : ''}"><span class="site-guide-number">4</span><div><strong>Repair and retry</strong><p>Save missed questions to Improve, review the explanation, repair the skill and try again later.</p></div>${statusLabel(s.review, nextReview)}</article>
    </div>
    <div class="cluster site-guide-actions">
      ${!s.placement ? '<button class="btn primary" data-site-guide-nav="placement">Start Quick Placement</button>' : !s.plan ? '<button class="btn primary" data-site-guide-nav="progress">Create Study Plan</button>' : '<button class="btn primary" data-site-guide-nav="today">Continue from Today</button>'}
      <button class="btn soft" data-site-guide-open>How the whole site works</button>
    </div>
  </section>`;
}

function learnMapHTML() {
  return `<section class="card site-guide-map" data-site-guide-learn-map>
    <div class="eyebrow">Learning map</div><h2>English first, IELTS transfer second.</h2>
    <div class="site-guide-map-grid">
      <div><span>1</span><strong>Learning Better</strong><p>Build effective practice habits and use AI as a coach rather than an answer generator.</p></div>
      <div><span>2</span><strong>Core skills</strong><p>Develop Reading, Listening, Writing and Speaking through complete lessons.</p></div>
      <div><span>3</span><strong>Repair</strong><p>Use Vocabulary and Grammar units when errors reveal a recurring language problem.</p></div>
      <div><span>4</span><strong>IELTS transfer</strong><p>Move to Strategy, Question Type Labs and Mini Tests after the underlying skill is ready.</p></div>
    </div>
  </section>`;
}

function ieltsGuideHTML() {
  return `<section class="card site-guide-map" data-site-guide-ielts-map>
    <div class="eyebrow">Three IELTS layers</div><h2>Choose the right level of exam practice.</h2>
    <div class="site-guide-map-grid three">
      <div><span>1</span><strong>Strategy</strong><p>Understand test structure, band plateaus and how to review a practice test.</p></div>
      <div><span>2</span><strong>Question Type Lab</strong><p>Practise one decision at a time with hints, explanations, repair links and retry.</p></div>
      <div><span>3</span><strong>Mini Test</strong><p>Use timed Test Mode with no hints before submission. ML01 and ML02 now use production MP3 audio.</p></div>
    </div>
    <div class="callout success" style="margin-top:16px"><strong>Listening audio live:</strong> ML01 and ML02 use the uploaded recordings. The transcript stays hidden until submission and each attempt allows one successful playback.</div>
  </section>`;
}

function helpModalHTML() {
  return `<div class="site-guide-modal-backdrop" data-site-guide-backdrop>
    <section class="site-guide-modal" role="dialog" aria-modal="true" aria-labelledby="site-guide-title">
      <div class="site-guide-modal-head"><div><div class="eyebrow">Site guide</div><h2 id="site-guide-title">How IELTS Self-Learning works</h2></div><button class="btn ghost icon-btn" data-site-guide-close aria-label="Close site guide">✕</button></div>
      <p class="lede">Use the workspace as a learning loop, not as a page of disconnected exercises.</p>
      <div class="site-guide-loop" aria-label="Learning loop"><span>Diagnose</span><b>→</b><span>Learn</span><b>→</b><span>Practise</span><b>→</b><span>Feedback</span><b>→</b><span>Repair</span><b>→</b><span>Retry</span><b>→</b><span>Review</span></div>
      <div class="site-guide-page-grid">
        <button data-site-guide-nav="today"><strong>Today</strong><span>One useful next action based on time, prerequisites, due review and observed weakness.</span></button>
        <button data-site-guide-nav="learn"><strong>Learn</strong><span>The 30-unit English curriculum: habits, four skills and targeted language repair.</span></button>
        <button data-site-guide-nav="ielts"><strong>IELTS</strong><span>Strategy, 12 Question Type Labs and four timed Mini Tests.</span></button>
        <button data-site-guide-nav="improve"><strong>Improve</strong><span>Error Notebook, spaced Review Queue, Vocabulary Review and retry decisions.</span></button>
        <button data-site-guide-nav="progress"><strong>Progress</strong><span>Study Plan, productive evidence, backup/restore and troubleshooting.</span></button>
      </div>
      <div class="grid two site-guide-principles">
        <div class="callout"><strong>Practice Mode</strong><br><span class="muted">Use hints, replay, transcript, explanations and retry while building a skill.</span></div>
        <div class="callout warning"><strong>Test Mode</strong><br><span class="muted">Use a timer, normal speed and no hints before submission. Raw scores are diagnostic, not IELTS bands.</span></div>
      </div>
      <div class="callout success site-guide-local"><strong>Local-first:</strong> learner data stays in this browser unless you export a backup. No account is required and external AI feedback is copied manually.</div>
      <div class="cluster site-guide-modal-actions"><button class="btn primary" data-site-guide-nav="today">Go to Today</button><button class="btn soft" data-site-guide-close>Close</button></div>
    </section>
  </div>`;
}

function openGuide() {
  if (document.querySelector('[data-site-guide-backdrop]')) return;
  document.body.insertAdjacentHTML('beforeend', helpModalHTML());
  document.body.dataset.siteGuideOpen = 'true';
  document.querySelector('[data-site-guide-close]')?.focus();
}

function closeGuide() {
  document.querySelector('[data-site-guide-backdrop]')?.remove();
  delete document.body.dataset.siteGuideOpen;
}

function injectTopbarButton() {
  const topbar = document.querySelector('.topbar');
  if (!topbar || topbar.querySelector('[data-site-guide-open]')) return;
  const ai = [...topbar.querySelectorAll('button')].find(button => button.textContent.includes('AI Prompts'));
  const button = document.createElement('button');
  button.className = 'btn ghost small-btn';
  button.dataset.siteGuideOpen = '';
  button.textContent = 'How to use';
  if (ai) ai.insertAdjacentElement('beforebegin', button); else topbar.prepend(button);
}

function updateOutdatedCopy(main) {
  const footer = document.querySelector('.sidebar-footer .small.muted');
  if (footer && footer.textContent.includes('Local-first prototype')) footer.innerHTML = 'Local-first workspace<br>No account required';

  if (location.hash.includes('/ielts')) {
    for (const chip of main.querySelectorAll('.chip')) {
      if (chip.textContent.trim() === 'Available direction' || chip.textContent.trim() === 'Later V1') chip.textContent = 'IELTS guide';
    }
  }
}

function injectRouteGuide() {
  const main = document.querySelector('#main');
  if (!main) return;
  updateOutdatedCopy(main);
  const hash = location.hash || '#/today';

  if (hash.includes('/today') && !localStorage.getItem(DISMISSED_KEY) && !main.querySelector('[data-site-guide-welcome]')) {
    const head = main.querySelector('.page-head');
    if (head) head.insertAdjacentHTML('afterend', welcomeHTML());
  }
  if (hash.includes('/learn') && !main.querySelector('[data-site-guide-learn-map]')) {
    const head = main.querySelector('.page-head');
    if (head) head.insertAdjacentHTML('afterend', learnMapHTML());
  }
  if (hash.includes('/ielts') && !main.querySelector('[data-site-guide-ielts-map]')) {
    const head = main.querySelector('.page-head');
    if (head) head.insertAdjacentHTML('afterend', ieltsGuideHTML());
  }
}

function apply() {
  injectTopbarButton();
  injectRouteGuide();
}

function handleClick(event) {
  const open = event.target.closest('[data-site-guide-open]');
  if (open) { event.preventDefault(); openGuide(); return; }

  const close = event.target.closest('[data-site-guide-close]');
  if (close) { event.preventDefault(); closeGuide(); return; }

  const dismiss = event.target.closest('[data-site-guide-dismiss]');
  if (dismiss) {
    localStorage.setItem(DISMISSED_KEY, 'true');
    document.querySelector('[data-site-guide-welcome]')?.remove();
    return;
  }

  const nav = event.target.closest('[data-site-guide-nav]');
  if (nav) {
    closeGuide();
    location.hash = `#/${nav.dataset.siteGuideNav}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handleBackdrop(event) {
  const backdrop = event.target.closest('[data-site-guide-backdrop]');
  if (backdrop && event.target === backdrop) closeGuide();
}

function handleKeydown(event) {
  if (event.key === 'Escape' && document.querySelector('[data-site-guide-backdrop]')) closeGuide();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClick);
  document.addEventListener('click', handleBackdrop);
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('hashchange', () => setTimeout(apply, 0));
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(apply, 0);
}

export { DISMISSED_KEY, learnerState, welcomeHTML, learnMapHTML, ieltsGuideHTML };
