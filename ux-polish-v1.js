const TODAY_ROUTE = '#/today';

function isToday() {
  return (location.hash || TODAY_ROUTE).includes('/today');
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
  const title = guide.querySelector('h2');
  if (title) title.textContent = 'Start in four steps';
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
  const h1 = head?.querySelector('h1');
  const lede = head?.querySelector('.lede');
  if (h1) h1.textContent = "Today's study";
  if (lede) lede.textContent = 'Choose your time and start the next useful step.';

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

function apply() {
  simplifyToday();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleGuideCapture, true);
  window.addEventListener('hashchange', () => setTimeout(apply, 0));
  new MutationObserver(() => queueMicrotask(apply)).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(apply, 0);
}

export { closeSiteGuide, navigateFromGuide, simplifyToday, handleGuideCapture };
