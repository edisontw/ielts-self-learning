import { REPAIR_LESSONS } from './adaptive-data.js';

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

// Keep the completed first 30-unit curriculum separate while registering V1.4
// error-driven Repair extensions for adaptive/runtime consumers.
const vg01 = REPAIR_LESSONS.find(lesson => lesson.id === 'VG01');
if (vg01) vg01.triggerTags = (vg01.triggerTags || []).filter(tag => tag !== 'paraphrase');
for (const lesson of V14_REPAIR_LESSONS) {
  if (!REPAIR_LESSONS.some(existing => existing.id === lesson.id)) REPAIR_LESSONS.push(lesson);
}
