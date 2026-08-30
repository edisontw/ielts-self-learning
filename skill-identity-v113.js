import { LESSONS, SKILL_META } from './data.js';

const CORE_KEY = 'ielts-self-learning-v1';
const SKILLS = ['learning-better', 'reading', 'listening', 'writing', 'speaking'];
const SKILL_LABELS = {
  'learning-better': 'Learning Better · Study Skills',
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  speaking: 'Speaking'
};
const SKILL_ICONS = {
  'learning-better': '◎',
  reading: 'R',
  listening: 'L',
  writing: 'W',
  speaking: 'S'
};

function readCore() {
  try { return JSON.parse(localStorage.getItem(CORE_KEY) || '{}'); }
  catch { return {}; }
}

function chineseHelpOn() {
  return Boolean(readCore()?.ui?.chineseHelp);
}

function lessonById(id = '') {
  return LESSONS.find(lesson => lesson.id === id) || null;
}

function skillLabel(skill = '') {
  return SKILL_LABELS[skill] || SKILL_META[skill]?.label || skill;
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function lessonForCard(card) {
  const id = card?.querySelector?.('[data-lesson]')?.dataset?.lesson || '';
  return lessonById(id);
}

function ensureSkillIdentity(card, lesson) {
  const skill = lesson?.skill || '';
  if (!SKILLS.includes(skill)) return;

  card.dataset.skill = skill;
  const cluster = card.querySelector('.cluster');
  const icon = cluster?.querySelector('.lesson-icon');
  if (icon) {
    setText(icon, SKILL_ICONS[skill] || SKILL_META[skill]?.icon || '•');
    icon.setAttribute('aria-label', skillLabel(skill));
    icon.title = skillLabel(skill);
  }

  let label = cluster?.querySelector('[data-v113-skill-name]');
  if (!label && cluster) {
    label = document.createElement('span');
    label.className = 'chip v113-skill-name';
    label.dataset.v113SkillName = 'true';
    if (icon) icon.insertAdjacentElement('afterend', label);
    else cluster.prepend(label);
  }
  setText(label, skillLabel(skill));
}

function ensureChineseAssist(container, lesson, anchor) {
  let helper = container.querySelector(':scope > [data-v113-chinese-assist]');
  const show = chineseHelpOn() && Boolean(lesson?.chinese);

  if (!show) {
    helper?.remove();
    return;
  }

  if (!helper) {
    helper = document.createElement('p');
    helper.className = 'v113-chinese-assist';
    helper.dataset.v113ChineseAssist = 'true';
    helper.lang = 'zh-Hant';
    if (anchor) anchor.insertAdjacentElement('afterend', helper);
    else container.appendChild(helper);
  }
  setText(helper, `中文輔助：${lesson.chinese}`);
}

function enhanceLearn() {
  if (!location.hash.includes('/learn')) return;
  const main = document.querySelector('#main');
  if (!main) return;

  for (const card of main.querySelectorAll('.lesson-card')) {
    const lesson = lessonForCard(card);
    if (!lesson || !SKILLS.includes(lesson.skill)) continue;
    ensureSkillIdentity(card, lesson);
    const body = card.querySelector('h3')?.parentElement || card;
    const description = body.querySelector('p.muted');
    ensureChineseAssist(body, lesson, description || body.querySelector('h3'));
  }
}

function enhanceToday() {
  if (!location.hash.includes('/today') && location.hash) return;
  const main = document.querySelector('#main');
  if (!main) return;

  const focus = [...main.querySelectorAll('.focus-card')].find(card => card.querySelector('[data-lesson]'));
  const id = focus?.querySelector('[data-lesson]')?.dataset?.lesson || '';
  const lesson = lessonById(id);
  if (!focus || !lesson || !SKILLS.includes(lesson.skill)) return;

  focus.dataset.skill = lesson.skill;
  const description = [...focus.children].find(node => node.tagName === 'P' && !node.classList.contains('v113-chinese-assist'));
  ensureChineseAssist(focus, lesson, description || focus.querySelector('.meta'));
}

function enhanceChineseToggles() {
  const active = chineseHelpOn();
  for (const button of document.querySelectorAll('[data-action="toggle-chinese"]')) {
    button.setAttribute('aria-pressed', String(active));
    button.title = active ? '關閉繁體中文學習提示' : '開啟繁體中文學習提示';
    setText(button, active ? '中文輔助：開' : '中文輔助：關');
  }
}

function enhance() {
  enhanceChineseToggles();
  enhanceLearn();
  enhanceToday();
}

if (typeof document !== 'undefined') {
  window.addEventListener('hashchange', () => setTimeout(enhance, 0));
  new MutationObserver(() => queueMicrotask(enhance)).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(enhance, 0);
}

export {
  readCore,
  chineseHelpOn,
  skillLabel,
  lessonForCard,
  ensureSkillIdentity,
  enhanceLearn,
  enhanceToday,
  enhanceChineseToggles,
  enhance
};
