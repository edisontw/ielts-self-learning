import { REPAIR_LESSONS } from './adaptive-data.js';

const ADAPTIVE_KEY = 'ielts-adaptive-v1';
const V14_IDS = new Set(['VG04','VG05']);

export const ERROR_TAG_FAMILIES = {
  paraphrase: [
    'paraphrase',
    'reading-paraphrase',
    'listening-paraphrase',
    'listening-matching-paraphrase',
    'reading-keyword-match',
    'reading-heading-keyword',
    'reading-mcq-keyword'
  ],
  'answer-type': [
    'reading-answer-type',
    'listening-answer-type',
    'listening-short-answer-type',
    'listening-sentence-grammar'
  ]
};

export const V14_REPAIR_LESSONS = [
  {
    id: 'VG04',
    title: 'Paraphrase: Same Meaning, Different Form',
    skill: 'vocabulary',
    lessonType: 'repair',
    cefr: 'B2+',
    difficulty: 4,
    estimatedMinutes: 16,
    objective: 'Recognise the same idea when IELTS changes vocabulary, grammar, or perspective, and reject keyword matches that change the meaning.',
    triggerTags: ERROR_TAG_FAMILIES.paraphrase,
    placementSkills: ['vocabulary'],
    evidence: { family: 'paraphrase', auditedQuestions: 32, auditDate: '2026-08-26' },
    learn: [
      'Paraphrase is a meaning relationship, not a fixed synonym list. First identify the claim, relationship, and scope that must stay the same.',
      'IELTS can change vocabulary (reduce → lower), grammar (access expanded → became more widely available), or perspective (saves commuters time → commuters spend less time travelling).',
      'Repeated keywords are only clues. Reject an option if it changes cause, quantity, certainty, comparison, or the writer’s actual conclusion.'
    ],
    examples: [
      'reduced reliance on cars ↔ depended less on cars',
      'access expanded ↔ became available to more people',
      'waiting times fell ↔ commuters spent less time waiting'
    ],
    questions: [
      {
        prompt: 'Which best paraphrases “The scheme widened access to training”?',
        options: ['The scheme made training available to more people.', 'The scheme made each course longer.', 'The scheme reduced the number of trainers.'],
        answer: 'The scheme made training available to more people.',
        rationale: '“Widened access” changes form but keeps the meaning that more people can reach or use the training.'
      },
      {
        prompt: 'Which best paraphrases “Bus use increased after fares were reduced”?',
        options: ['Lower fares were followed by more bus travel.', 'Bus fares increased because more people travelled.', 'People used buses less even though fares fell.'],
        answer: 'Lower fares were followed by more bus travel.',
        rationale: 'The direction of both changes stays the same: fares go down and bus use goes up.'
      },
      {
        prompt: 'Original: “The museum extended its hours, but visitor numbers remained almost unchanged.” Which option is a keyword trap rather than a paraphrase?',
        options: ['Longer opening hours caused a large rise in visitors.', 'Visitor numbers changed very little despite longer hours.', 'Extending the hours did not substantially change attendance.'],
        answer: 'Longer opening hours caused a large rise in visitors.',
        rationale: 'It repeats the topic words but reverses the meaning by inventing a large increase that the original explicitly denies.'
      }
    ]
  },
  {
    id: 'VG05',
    title: 'Use Grammar to Predict the Answer Type',
    skill: 'grammar',
    lessonType: 'repair',
    cefr: 'B2',
    difficulty: 3,
    estimatedMinutes: 15,
    objective: 'Use the grammar around a blank to predict the required word class or information type before searching or listening for the answer.',
    triggerTags: ERROR_TAG_FAMILIES['answer-type'],
    placementSkills: ['grammar'],
    evidence: { family: 'answer-type', auditedQuestions: 14, auditDate: '2026-08-26' },
    learn: [
      'The words around a blank narrow the answer before you read or listen: a determiner or possessive usually points to a noun or noun phrase; a blank before a noun may require an adjective or modifier.',
      'Prepositions, singular/plural grammar, articles, and time expressions can eliminate answers that have the right topic but the wrong form.',
      'Prediction is a filter, not a guess. After predicting the grammar, still verify the exact meaning, spoken correction, passage wording, and word limit.'
    ],
    examples: [
      'its ______ → noun / noun phrase',
      'a ______ coating → adjective / modifier',
      'arrive by ______ → time expression'
    ],
    questions: [
      {
        prompt: 'Complete naturally: The service’s main advantage is its ______.',
        options: ['flexibility', 'flexible', 'flexibly'],
        answer: 'flexibility',
        rationale: 'The possessive determiner “its” requires a noun or noun phrase here, so “flexibility” fits the grammar.'
      },
      {
        prompt: 'Complete naturally: The roof uses a ______ coating to reduce heat absorption.',
        options: ['reflective', 'reflection', 'reflect'],
        answer: 'reflective',
        rationale: 'The blank modifies the noun “coating”, so an adjective is required.'
      },
      {
        prompt: 'The question reads “Participants should arrive by ______.” What answer type should you predict first?',
        options: ['a time expression', 'a full explanation', 'an adjective describing participants'],
        answer: 'a time expression',
        rationale: '“Arrive by” most naturally predicts a deadline or time; the recording must then supply the exact value.'
      }
    ]
  }
];

// V1.4 separates paraphrase repair from VG01 collocation repair. The old generic
// “paraphrase” trigger otherwise sends Full Mock paraphrase misses to the wrong lesson.
const vg01 = REPAIR_LESSONS.find(lesson => lesson.id === 'VG01');
if (vg01) vg01.triggerTags = (vg01.triggerTags || []).filter(tag => tag !== 'paraphrase');
for (const lesson of V14_REPAIR_LESSONS) {
  if (!REPAIR_LESSONS.some(existing => existing.id === lesson.id)) REPAIR_LESSONS.push(lesson);
}

function readAdaptive() {
  try { return JSON.parse(localStorage.getItem(ADAPTIVE_KEY) || '{}'); }
  catch { return {}; }
}
function esc(value = '') {
  return String(value).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
}
function label(skill) { return skill === 'vocabulary' ? 'Vocabulary' : 'Grammar'; }
function readyToComplete(lesson, progress = {}) {
  return lesson.questions.every((question, index) => {
    const saved = progress.answers?.[index];
    return saved?.checked && saved.selected === question.answer;
  });
}
function questionHTML(lesson, question, index, saved = {}) {
  const correct = saved.checked && saved.selected === question.answer;
  return `<div class="quiz-card"><div class="q-title">${esc(question.prompt)}</div><div class="options">${question.options.map((option,i)=>`<button class="option ${saved.checked ? (option===question.answer?'correct':(option===saved.selected?'wrong':'')) : (option===saved.selected?'selected':'')}" data-lrv="repair-option" data-rid="${lesson.id}" data-q="${index}" data-value="${esc(option)}" ${saved.checked?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(option)}</span></button>`).join('')}</div><div class="cluster"><button class="btn small-btn ${saved.checked?'soft':'primary'}" data-lrv="repair-check" data-rid="${lesson.id}" data-q="${index}" ${!saved.selected||saved.checked?'disabled':''}>${saved.checked?'Checked':'Check'}</button>${saved.checked&&!correct?`<button class="btn primary small-btn" data-lrv="repair-retry" data-rid="${lesson.id}" data-q="${index}">Retry</button>`:''}</div>${saved.checked?`<div class="feedback ${correct?'correct':'wrong'}"><strong>${correct?'Correct':'Not yet'}</strong><br>${esc(question.rationale)}</div>`:''}</div>`;
}
function renderExtensionRoute() {
  const match = location.hash.match(/^#\/lesson\/(VG04|VG05)$/);
  if (!match) return;
  const main = document.querySelector('#main');
  if (!main) return;
  const lesson = REPAIR_LESSONS.find(item => item.id === match[1]);
  if (!lesson) return;
  const adaptive = readAdaptive();
  const progress = adaptive.repairProgress?.[lesson.id] || { answers:{} };
  const ready = readyToComplete(lesson, progress);
  const fingerprint = `${lesson.id}|${JSON.stringify(progress)}`;
  if (main.dataset.v14RepairFingerprint === fingerprint) return;
  main.dataset.runtimeLesson = lesson.id;
  main.dataset.v14RepairFingerprint = fingerprint;
  main.innerHTML = `<article class="lesson-shell extension-lesson"><div class="lesson-top"><button class="btn ghost small-btn" data-nav="improve">← Improve</button><div class="eyebrow" style="margin-top:20px">${label(lesson.skill)} · Error-driven Repair</div><h1 class="lesson-title">${esc(lesson.title)}</h1><div class="meta"><span>${lesson.cefr}</span><span>${lesson.estimatedMinutes} min</span><span>Difficulty ${lesson.difficulty}/5</span>${progress.completed?'<span class="chip success">Completed</span>':''}</div><p class="lede">${esc(lesson.objective)}</p><div class="callout"><strong>Why this repair exists</strong><br>${lesson.evidence.auditedQuestions} tagged questions in the 2026-08-26 bank audit belong to the ${esc(lesson.evidence.family)} family.</div></div><section class="lesson-section"><h2>1. Learn</h2>${lesson.learn.map(item=>`<p>${esc(item)}</p>`).join('')}<div class="callout"><strong>Notice these patterns</strong><br>${lesson.examples.map(esc).join(' · ')}</div></section><section class="lesson-section"><h2>2. Guided Practice</h2>${lesson.questions.map((q,i)=>questionHTML(lesson,q,i,progress.answers?.[i])).join('')}</section><section class="lesson-section"><h2>3. Review and reuse</h2><p>Explain the rule in your own words, then make one new example.</p><textarea class="text-area" data-runtime-note="${lesson.id}" placeholder="My own example...">${esc(progress.note||'')}</textarea></section><section class="lesson-section"><div class="cluster" style="justify-content:space-between"><div><div class="eyebrow">Finish</div><h2 style="margin-top:6px">Repair → retry → review</h2><p class="small muted">${progress.completed?'Repair evidence saved.':ready?'All guided-practice checks are correct.':'Complete every guided-practice item correctly before finishing.'}</p></div><button class="btn primary" data-lrv="repair-complete" data-rid="${lesson.id}" ${!ready||progress.completed?'disabled':''}>${progress.completed?'Completed ✓':'Mark repair complete'}</button></div></section></article>`;
}

function applySoon() { setTimeout(renderExtensionRoute, 0); }
if (typeof document !== 'undefined') {
  window.addEventListener('hashchange', applySoon);
  document.addEventListener('click', event => { if (event.target.closest('[data-lrv],[data-nav]')) applySoon(); });
  document.addEventListener('input', event => { if (event.target.closest('[data-runtime-note]')) applySoon(); });
  new MutationObserver(renderExtensionRoute).observe(document.documentElement, { childList:true, subtree:true });
  applySoon();
}
