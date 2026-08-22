export const VOCABULARY_ITEMS = [
  {
    id: 'v-crucial-role',
    term: 'play a crucial role in',
    meaning: 'to be very important in causing or supporting something',
    sourceLesson: 'VG01',
    sourceSkill: 'vocabulary',
    collocations: ['play a crucial role in', 'a crucial factor', 'be crucial to'],
    prompt: 'Affordable transport can ______ reducing traffic congestion.',
    answer: 'play a crucial role in',
    distractors: ['make a crucial role in', 'do a crucial role in']
  },
  {
    id: 'v-pose-challenge',
    term: 'pose a challenge',
    meaning: 'to create a difficult problem that needs to be dealt with',
    sourceLesson: 'VG01',
    sourceSkill: 'vocabulary',
    collocations: ['pose a challenge', 'pose a risk', 'pose a threat'],
    prompt: 'Rapid population growth can ______ for city planners.',
    answer: 'pose a challenge',
    distractors: ['put a challenge', 'make challenge']
  },
  {
    id: 'v-substantial-increase',
    term: 'a substantial increase in',
    meaning: 'a large or important rise in an amount or level',
    sourceLesson: 'VG01',
    sourceSkill: 'vocabulary',
    collocations: ['a substantial increase in', 'a substantial reduction in', 'substantial evidence'],
    prompt: 'The policy led to ______ public transport use.',
    answer: 'a substantial increase in',
    distractors: ['a substantial increase of', 'substantially increase in']
  },
  {
    id: 'v-raise-awareness',
    term: 'raise public awareness',
    meaning: 'to make more people understand or know about an issue',
    sourceLesson: 'VG01',
    sourceSkill: 'vocabulary',
    collocations: ['raise public awareness', 'increase awareness of', 'public awareness campaign'],
    prompt: 'Schools can help ______ of environmental issues.',
    answer: 'raise public awareness',
    distractors: ['rise public awareness', 'grow public awareness']
  },
  {
    id: 'v-main-idea',
    term: 'central claim',
    meaning: 'the main point or argument a paragraph is trying to communicate',
    sourceLesson: 'R01',
    sourceSkill: 'reading',
    collocations: ['identify the central claim', 'support a claim', 'main point'],
    prompt: 'In Reading review, first identify the paragraph’s ______ before focusing on examples.',
    answer: 'central claim',
    distractors: ['individual detail', 'unknown word']
  },
  {
    id: 'v-supporting-detail',
    term: 'supporting detail',
    meaning: 'an example, reason, fact, or explanation that supports the main idea',
    sourceLesson: 'R01',
    sourceSkill: 'reading',
    collocations: ['supporting detail', 'supporting evidence', 'supporting example'],
    prompt: 'A statistic may be useful evidence, but it can still be only a ______ rather than the main idea.',
    answer: 'supporting detail',
    distractors: ['central claim', 'heading']
  },
  {
    id: 'v-distractor',
    term: 'distractor',
    meaning: 'information designed to lead you toward a plausible but incorrect answer',
    sourceLesson: 'L01',
    sourceSkill: 'listening',
    collocations: ['recognise a distractor', 'distractor pattern', 'avoid a distractor'],
    prompt: 'In IELTS Listening, an option mentioned before “but” may function as a ______.',
    answer: 'distractor',
    distractors: ['final answer', 'transcript']
  },
  {
    id: 'v-task-response',
    term: 'task response',
    meaning: 'how fully and clearly a response addresses the question that was asked',
    sourceLesson: 'W01',
    sourceSkill: 'writing',
    collocations: ['address the task', 'clear position', 'develop the response'],
    prompt: 'Before adding advanced vocabulary, check whether your essay fully addresses the question and maintains a clear ______.',
    answer: 'position',
    distractors: ['idiom', 'memorised phrase']
  }
];

export const VOCAB_REVIEW_RATINGS = {
  again: { label: 'Again', minDays: 1, multiplier: 1 },
  hard: { label: 'Hard', minDays: 2, multiplier: 1.5 },
  good: { label: 'Good', minDays: 3, multiplier: 2.2 },
  easy: { label: 'Easy', minDays: 7, multiplier: 3.2 }
};
