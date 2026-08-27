export const CORE_LESSON_META = [
  { id: 'LB01', title: 'Practice Is Not the Same as Testing', skill: 'learning-better', difficulty: 2, estimatedMinutes: 15, targetRelevance: 0.55 },
  { id: 'R01', title: 'Find the Main Idea Without Translating Everything', skill: 'reading', difficulty: 3, estimatedMinutes: 18, targetRelevance: 0.85 },
  { id: 'L01', title: 'Listen for Meaning, Not Individual Words', skill: 'listening', difficulty: 3, estimatedMinutes: 18, targetRelevance: 0.85 },
  { id: 'W01', title: 'Answer the Question Before You Try to Sound Advanced', skill: 'writing', difficulty: 3, estimatedMinutes: 20, targetRelevance: 1 },
  { id: 'S01', title: 'Give More Than a One-Sentence Answer', skill: 'speaking', difficulty: 3, estimatedMinutes: 18, targetRelevance: 1 }
];

export const REPAIR_LESSONS = [
  {
    id: 'VG01',
    title: 'Learn Collocations, Not Isolated Words',
    skill: 'vocabulary',
    lessonType: 'repair',
    cefr: 'B2',
    difficulty: 3,
    estimatedMinutes: 15,
    objective: 'Recognise and produce useful word partnerships instead of memorising isolated “advanced” words.',
    triggerTags: ['collocation', 'word-choice', 'vocabulary', 'paraphrase'],
    placementSkills: ['vocabulary'],
    learn: [
      'A word is more useful when you know the words that naturally occur around it.',
      'For IELTS, natural combinations such as “pose a challenge” or “play a crucial role” are usually more useful than rare synonyms.',
      'Review collocations as chunks, then reuse them in your own sentence.'
    ],
    examples: ['play a crucial role in', 'pose a significant challenge', 'a substantial increase in', 'raise public awareness'],
    questions: [
      { prompt: 'Which phrase is the most natural?', options: ['make a crucial role', 'play a crucial role', 'do a crucial role'], answer: 'play a crucial role', rationale: '“Play a crucial role” is the conventional collocation.' },
      { prompt: 'Which phrase is the most natural?', options: ['pose a challenge', 'put a challenge', 'create challenge to'], answer: 'pose a challenge', rationale: '“Pose a challenge” is a common academic collocation.' }
    ]
  },
  {
    id: 'VG02',
    title: 'Articles in Academic Writing',
    skill: 'grammar',
    lessonType: 'repair',
    cefr: 'B2',
    difficulty: 3,
    estimatedMinutes: 15,
    objective: 'Choose a, an, the, or zero article by checking whether a noun is countable, singular, and identifiable to the reader.',
    triggerTags: ['articles', 'grammar', 'sentence-structure'],
    placementSkills: ['grammar'],
    learn: [
      'Before choosing an article, first ask whether the noun is countable and singular.',
      'Use “a/an” when introducing one non-specific singular countable noun.',
      'Use “the” when the reader can identify the specific noun. General plural or uncountable nouns often take no article.'
    ],
    examples: ['a major factor', 'the main reason discussed above', 'public transport can reduce congestion'],
    questions: [
      { prompt: 'Choose the most natural sentence.', options: ['Government should provide an access to education.', 'The government should provide access to education.', 'The government should provide an access to the education.'], answer: 'The government should provide access to education.', rationale: '“Access” is uncountable here, so it does not take “an”.' },
      { prompt: 'Choose the best completion: This is ___ important factor in the decision.', options: ['a', 'an', 'the'], answer: 'an', rationale: '“Important” begins with a vowel sound, and “factor” is a singular countable noun introduced non-specifically.' }
    ]
  },
  {
    id: 'VG03',
    title: 'Complex Sentences Without Losing Control',
    skill: 'grammar',
    lessonType: 'repair',
    cefr: 'B2+',
    difficulty: 4,
    estimatedMinutes: 20,
    objective: 'Use controlled subordinate clauses to express cause, contrast, condition, and qualification without creating unstable long sentences.',
    triggerTags: ['sentence-structure', 'grammar', 'coherence', 'agreement'],
    placementSkills: ['grammar'],
    learn: [
      'Complex grammar is useful only when the relationship between ideas is clear.',
      'Build one main clause and add one controlled relationship: because, although, while, if, or which.',
      'Do not combine multiple ideas merely to make a sentence look advanced.'
    ],
    examples: ['Although online learning is flexible, it requires strong self-discipline.', 'People may use public transport more often if services are reliable.', 'The policy, which was introduced last year, has reduced waiting times.'],
    questions: [
      { prompt: 'Which sentence controls contrast most clearly?', options: ['Although public transport is cheaper, but many people still drive.', 'Although public transport is cheaper, many people still drive.', 'Public transport although cheaper many people still drive.'], answer: 'Although public transport is cheaper, many people still drive.', rationale: 'Use either “although” or “but” for this structure, not both.' },
      { prompt: 'Which sentence is most controlled?', options: ['If governments invest in buses, commuters may change their habits.', 'If governments invest in buses and commuters changing habits which improve traffic.', 'Governments invest buses if commuters habits change because traffic.'], answer: 'If governments invest in buses, commuters may change their habits.', rationale: 'The condition and result are both complete and clearly related.' }
    ]
  }
];

export function repairMatchesError(lesson, error) {
  if (!lesson || !error || !lesson.triggerTags?.includes(error.errorTag)) return false;
  return !lesson.errorSkills?.length || lesson.errorSkills.includes(error.skill);
}

export const RECOMMENDATION_WEIGHTS = {
  weakness: 30,
  dueReview: 20,
  targetRelevance: 15,
  skillBalance: 15,
  difficultyMatch: 10,
  timeMatch: 10,
  recentRepetitionPenalty: 18
};

export const REVIEW_RATINGS = {
  again: { label: 'Again', nextDays: () => 1, mastery: false },
  hard: { label: 'Hard', nextDays: prev => Math.max(2, Math.round((prev || 1) * 1.5)), mastery: false },
  good: { label: 'Good', nextDays: prev => Math.max(3, Math.round((prev || 1) * 2.2)), mastery: true },
  easy: { label: 'Easy', nextDays: prev => Math.max(7, Math.round((prev || 1) * 3.2)), mastery: true }
};
