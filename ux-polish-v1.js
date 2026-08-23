const TODAY_ROUTE = '#/today';
let learnFilter = 'all';
let ieltsStage = 'strategy';

function routeIncludes(name) {
  return (location.hash || TODAY_ROUTE).includes(`/${name}`);
}

function isToday() {
  return routeIncludes('today');
}

function setTextIfChanged(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function closeSiteGuide() {
  document.querySelector('[data-site-guide-backdrop]')?.remove();
  delete document.body.dataset.siteGuideOpen;
}

function navigateFromGuide(route) {
  closeSiteGuide();
  const next = `#/${route}`;
  if (location.hash === next) {
    window.dispatchEvent(new Event('hashchange'));
  } else {
    location.hash = next;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleGuideCapture(event) {
  const close = event.target?.closest?.('[data-site-guide-close]');
  if (close) {
    event.preventDefault();
    event.stopImmediatePropagation();
    closeSiteGuide();
    return;
  }

  const nav = event.target?.closest?.('[data-site-guide-nav]');
  if (nav?.closest?.('[data-site-guide-backdrop]')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    navigateFromGuide(nav.dataset.siteGuideNav);
    return;
  }

  const backdrop = event.target?.closest?.('[data-site-guide-backdrop]');
  if (backdrop && event.target === backdrop) {
    event.preventDefault();
    event.stopImmediatePropagation();
    closeSiteGuide();
  }
}

function cardEyebrow(card) {
  return card?.querySelector?.('.eyebrow')?.textContent?.trim() || '';
}

function compactGettingStarted(main) {
  const guide = main.querySelector('[data-site-guide-welcome]');
  if (!guide) return;
  guide.classList.add('site-guide-welcome-compact');
  setTextIfChanged(guide.querySelector('h2'), 'Start in four steps');
}

function injectTodayShortcuts(main, anchor) {
  if (main.querySelector('[data-today-shortcuts]')) return;
  const section = document.createElement('section');
  section.className = 'today-shortcuts';
  section.dataset.todayShortcuts = 'true';
  section.innerHTML = `
    <span class="small muted">More</span>
    <div class="cluster">
      <button class="btn soft small-btn" data-nav="improve">Review errors</button>
      <button class="btn soft small-btn" data-nav="ielts">IELTS practice</button>
      <button class="btn ghost small-btn" data-nav="progress">Progress & plan</button>
    </div>`;
  (anchor || main.lastElementChild)?.insertAdjacentElement('afterend', section);
}

function simplifyToday() {
  if (!isToday()) return;
  const main = document.querySelector('#main');
  if (!main) return;
  main.dataset.todaySimplified = 'true';

  const head = main.querySelector('.page-head');
  setTextIfChanged(head?.querySelector('h1'), "Today's study");
  setTextIfChanged(head?.querySelector('.lede'), 'Choose your time and start the next useful step.');

  compactGettingStarted(main);

  const timeCard = [...main.children].find(el => el.classList?.contains('card') && el.querySelector?.('.time-picker'));
  timeCard?.classList.add('today-time-card');

  const adaptive = main.querySelector('[data-adaptive-root="today"]');
  const focusCards = [...main.querySelectorAll(':scope > .focus-card')];
  for (const card of focusCards) {
    const label = cardEyebrow(card);
    if (adaptive && label === "Today's focus") card.hidden = true;
    if (!adaptive && label === "Today's focus" && main.querySelector('.focus-card .eyebrow')?.textContent?.includes('Recommended first step')) card.hidden = true;
  }

  for (const grid of [...main.querySelectorAll(':scope > .grid')]) {
    const text = grid.textContent || '';
    if (text.includes('Your priorities') && text.includes('Quick practice')) grid.hidden = true;
    if (text.includes('study actions · 7 days') && text.includes('lessons completed')) grid.hidden = true;
  }

  const primary = adaptive || focusCards.find(card => !card.hidden) || timeCard || head;
  injectTodayShortcuts(main, primary);
}

function lessonGroup(id = '') {
  if (/^LB/.test(id)) return 'learning-better';
  if (/^R\d/.test(id)) return 'reading';
  if (/^L\d/.test(id)) return 'listening';
  if (/^W\d/.test(id)) return 'writing';
  if (/^S\d/.test(id)) return 'speaking';
  return 'other';
}

function learnLessonGrid(main) {
  return [...main.querySelectorAll(':scope > .grid')].find(grid => grid.querySelector('.lesson-card [data-lesson]')) || null;
}

function applyLearnFilter(main, filter = learnFilter) {
  const grid = learnLessonGrid(main);
  if (!grid) return;
  learnFilter = filter;
  main.dataset.learnFilter = filter;
  grid.classList.add('learn-simplified-grid');

  for (const card of grid.querySelectorAll('.lesson-card')) {
    const id = card.querySelector('[data-lesson]')?.dataset.lesson || '';
    card.classList.add('ux-lesson-card');
    card.hidden = filter !== 'all' && lessonGroup(id) !== filter;
  }
  for (const button of main.querySelectorAll('[data-learn-filter]')) {
    const active = button.dataset.learnFilter === filter;
    button.classList.toggle('active', active);
    if (button.getAttribute('aria-pressed') !== String(active)) button.setAttribute('aria-pressed', String(active));
  }
}

function injectLearnToolbar(main, grid) {
  if (main.querySelector('[data-learn-toolbar]')) return;
  const toolbar = document.createElement('section');
  toolbar.className = 'learn-toolbar';
  toolbar.dataset.learnToolbar = 'true';
  toolbar.innerHTML = `<div><strong>30-unit curriculum</strong><span class="small muted">Choose a skill to reduce the list.</span></div>
    <div class="learn-filter-row" role="group" aria-label="Filter lessons by skill">
      ${[
        ['all','All'],['learning-better','Learning Better'],['reading','Reading'],['listening','Listening'],['writing','Writing'],['speaking','Speaking']
      ].map(([key,label]) => `<button class="btn ghost small-btn" data-learn-filter="${key}" aria-pressed="false">${label}</button>`).join('')}
    </div>`;
  grid.insertAdjacentElement('beforebegin', toolbar);
}

function simplifyLearn() {
  if (!routeIncludes('learn')) return;
  const main = document.querySelector('#main');
  if (!main) return;
  main.dataset.learnSimplified = 'true';

  const head = main.querySelector('.page-head');
  setTextIfChanged(head?.querySelector('h1'), 'Learn by skill');
  setTextIfChanged(head?.querySelector('.lede'), 'Choose one skill, complete a lesson, then use Today to decide what comes next.');

  const map = main.querySelector('[data-site-guide-learn-map]');
  if (map) map.hidden = true;
  for (const note of main.querySelectorAll('.card.subtle')) {
    if ((note.textContent || '').includes('curriculum')) note.hidden = true;
  }

  const grid = learnLessonGrid(main);
  if (!grid) return;
  injectLearnToolbar(main, grid);
  applyLearnFilter(main, learnFilter);
}

function legacyIELTSGrid(main) {
  return [...main.querySelectorAll(':scope > .grid')].find(grid =>
    [...grid.querySelectorAll('.chip')].some(chip => ['IELTS guide','Available direction','Later V1'].includes(chip.textContent.trim()))
  ) || null;
}

function injectIELTSStageNav(main, head) {
  if (main.querySelector('[data-ielts-stage-nav]')) return;
  const nav = document.createElement('section');
  nav.className = 'ielts-stage-nav';
  nav.dataset.ieltsStageNav = 'true';
  nav.innerHTML = `<div class="ielts-stage-intro"><strong>Practice path</strong><span class="small muted">Learn the test → isolate question types → test under time → run a full mock.</span></div>
    <div class="ielts-stage-tabs" role="tablist" aria-label="IELTS practice level">
      ${[
        ['strategy','1','Strategy','3 lessons'],
        ['lab','2','Question Types','12 labs'],
        ['mini','3','Mini Tests','4 tests'],
        ['mock','4','Full Mock','L / R / W / S']
      ].map(([key,n,label,meta]) => `<button class="ielts-stage-tab" role="tab" data-ielts-stage="${key}" aria-selected="false"><span>${n}</span><strong>${label}</strong><small>${meta}</small></button>`).join('')}
    </div>`;
  head?.insertAdjacentElement('afterend', nav);
}

function ieltsSections(main) {
  return {
    strategy: main.querySelector('[data-ielts-strategy-index]'),
    lab: main.querySelector('[data-question-type-lab-index]'),
    mini: main.querySelector('[data-mini-test-index]'),
    mock: main.querySelector('[data-mock-center]')
  };
}

function selectIELTSStage(main, stage = ieltsStage) {
  const sections = ieltsSections(main);
  const available = Object.entries(sections).filter(([,section]) => section);
  if (!available.length) return;
  if (!sections[stage]) stage = sections.strategy ? 'strategy' : available[0][0];
  ieltsStage = stage;
  main.dataset.ieltsStage = stage;

  for (const [key, section] of Object.entries(sections)) {
    if (!section) continue;
    section.classList.add('ielts-stage-section');
    section.dataset.ieltsStageSection = key;
    section.hidden = key !== stage;
  }
  for (const button of main.querySelectorAll('[data-ielts-stage]')) {
    const active = button.dataset.ieltsStage === stage;
    button.classList.toggle('active', active);
    if (button.getAttribute('aria-selected') !== String(active)) button.setAttribute('aria-selected', String(active));
  }
}

function simplifyIELTS() {
  if (!routeIncludes('ielts')) return;
  const main = document.querySelector('#main');
  if (!main) return;
  main.dataset.ieltsSimplified = 'true';

  if (main.querySelector('[data-mini-test-player],[data-mock-player]')) return;

  const head = main.querySelector(':scope > .page-head');
  setTextIfChanged(head?.querySelector('h1'), 'IELTS practice');
  setTextIfChanged(head?.querySelector('.lede'), 'Choose the level of exam practice that matches what you need now.');

  const map = main.querySelector('[data-site-guide-ielts-map]');
  if (map) map.hidden = true;
  const legacy = legacyIELTSGrid(main);
  if (legacy) legacy.hidden = true;
  for (const card of main.querySelectorAll(':scope > section.card')) {
    if ((card.textContent || '').includes('Mode rule')) card.hidden = true;
  }

  injectIELTSStageNav(main, head);
  selectIELTSStage(main, ieltsStage);
}

function handleUxClick(event) {
  const filter = event.target?.closest?.('[data-learn-filter]');
  if (filter) {
    event.preventDefault();
    const main = document.querySelector('#main');
    if (main) applyLearnFilter(main, filter.dataset.learnFilter);
    return;
  }

  const stage = event.target?.closest?.('[data-ielts-stage]');
  if (stage) {
    event.preventDefault();
    const main = document.querySelector('#main');
    if (main) selectIELTSStage(main, stage.dataset.ieltsStage);
  }
}

function apply() {
  simplifyToday();
  simplifyLearn();
  simplifyIELTS();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleGuideCapture, true);
  document.addEventListener('click', handleUxClick);
  window.addEventListener('hashchange', () => setTimeout(apply, 0));
  new MutationObserver(() => queueMicrotask(apply)).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(apply, 0);
}

export {
  closeSiteGuide,
  navigateFromGuide,
  simplifyToday,
  simplifyLearn,
  simplifyIELTS,
  applyLearnFilter,
  selectIELTSStage,
  handleGuideCapture
};
