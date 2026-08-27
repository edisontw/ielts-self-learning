export const V16_SKILL_REPAIR_FAMILIES = {
  'reading-main-idea': {
    tags: ['reading-main-idea', 'main-idea'],
    skills: ['reading'],
    auditedQuestions: 23
  },
  'listening-number': {
    tags: ['listening-number', 'number'],
    skills: ['listening'],
    auditedQuestions: 27
  }
};

export const V16_SKILL_REPAIR_LESSONS = [
  {
    id: 'RR01',
    title: 'Main Idea vs Supporting Detail',
    skill: 'reading',
    lessonType: 'skill-repair',
    cefr: 'B2',
    difficulty: 3,
    estimatedMinutes: 16,
    objective: 'Identify what a paragraph is mainly doing and reject true-but-too-narrow details that do not capture its central point.',
    triggerTags: V16_SKILL_REPAIR_FAMILIES['reading-main-idea'].tags,
    errorSkills: V16_SKILL_REPAIR_FAMILIES['reading-main-idea'].skills,
    requiresErrorEvidence: true,
    placementSkills: [],
    evidence: { family: 'reading main-idea', auditedQuestions: 23, auditDate: '2026-08-27' },
    learn: [
      'A main idea is the paragraph-level claim or purpose. A supporting detail can be completely true and still be the wrong answer because it covers only one example, cause, mechanism, or consequence.',
      'First identify the topic, then ask what the writer is doing with that topic: explaining a problem, comparing alternatives, qualifying a claim, or reaching a conclusion.',
      'Direction words and concluding sentences often control the answer. Reject options that copy memorable words but ignore the paragraph’s overall direction or scope.'
    ],
    examples: [
      'topic: shared offices → main idea: flexibility brings benefits but also coordination costs',
      'detail: one survey result → main idea: the broader pattern the result supports',
      'true statement ≠ best main idea if it is too narrow'
    ],
    questions: [
      {
        context: 'Several universities have extended library opening hours during examination periods. Students value the extra access, especially those who work part-time. However, staffing and security costs rise sharply late at night, so some libraries now keep only selected floors open after midnight. The aim is to preserve useful access without operating the entire building overnight.',
        prompt: 'Which option best states the paragraph’s main idea?',
        options: [
          'Part-time students often use libraries during examination periods.',
          'Libraries are balancing longer student access with the cost of late-night operation.',
          'Security staff are most expensive after midnight.'
        ],
        answer: 'Libraries are balancing longer student access with the cost of late-night operation.',
        rationale: 'The other options are true or plausible details. The best answer captures both the benefit and the operational limitation that shape the paragraph’s conclusion.'
      },
      {
        context: 'Reusable-cup schemes can reduce the number of disposable cups used by cafés, but participation depends heavily on convenience. Customers are less likely to return a cup if collection points are difficult to find. Programmes that place return stations near transport hubs and workplaces therefore tend to achieve higher return rates than schemes with only a few central locations.',
        prompt: 'What is the central point?',
        options: [
          'Transport hubs are busy places.',
          'Reusable cups are always cheaper than disposable cups.',
          'The success of reusable-cup schemes depends partly on making returns convenient.'
        ],
        answer: 'The success of reusable-cup schemes depends partly on making returns convenient.',
        rationale: 'The paragraph uses return locations as evidence for a broader claim about convenience and participation.'
      },
      {
        context: 'Roadside wildflower areas are sometimes promoted mainly for their appearance. Their ecological value, however, depends on how they are managed. Cutting too frequently can prevent plants from flowering, while never cutting can allow a few vigorous species to dominate. Many councils are therefore experimenting with timed cutting schedules that balance flowering, seed production, and long-term diversity.',
        prompt: 'Which answer is a true-but-too-narrow detail rather than the main idea?',
        options: [
          'Cutting too frequently can stop some plants from flowering.',
          'Management timing affects whether roadside wildflower areas support long-term diversity.',
          'Councils are testing cutting schedules to balance several ecological goals.'
        ],
        answer: 'Cutting too frequently can stop some plants from flowering.',
        rationale: 'That statement is explicitly true, but it is only one supporting detail. The paragraph as a whole is about how management timing affects ecological value.'
      }
    ]
  },
  {
    id: 'LR01',
    title: 'Track the Final Number',
    skill: 'listening',
    lessonType: 'skill-repair',
    cefr: 'B2',
    difficulty: 3,
    estimatedMinutes: 15,
    objective: 'Hold the question’s required number type in mind, ignore nearby competing numbers, and record the final confirmed time, date, price, or quantity.',
    triggerTags: V16_SKILL_REPAIR_FAMILIES['listening-number'].tags,
    errorSkills: V16_SKILL_REPAIR_FAMILIES['listening-number'].skills,
    requiresErrorEvidence: true,
    placementSkills: [],
    evidence: { family: 'listening number', auditedQuestions: 27, auditDate: '2026-08-27' },
    learn: [
      'Before listening, predict the number type the question needs: time, date, price, quantity, age, or duration. This prevents a nearby but irrelevant number from stealing your attention.',
      'Do not write the first number automatically. Keep it provisional when you hear correction or update language such as “but”, “actually”, “instead”, “moved to”, or “so the final date is…”.',
      'After the speaker moves on, verify both value and unit. Ten fifteen may be a start time while ten o’clock is the required arrival time; twelve may be a delivery date while fifteen is the return-to-office date.'
    ],
    examples: [
      'starts at 10:15, arrive by 10:00 → question asks arrival time → 10:00',
      'expected April → delayed to May → return Monday 15 May → keep the final confirmed date',
      '£22 materials fee is not a time simply because it appears near other numbers'
    ],
    media: [
      {
        id: 'A',
        label: 'Audio A — Pottery workshop booking',
        src: 'media/audio/question-type-labs/ql02-b-pottery-workshop-booking.mp3',
        instruction: 'Listen once for the requested information type. Replay in Practice Mode if needed.',
        transcript: 'Receptionist: I have your booking here. The family name is Mercer, M-E-R-C-E-R. You’re joining the pottery workshop on the eighteenth of September. It starts at ten fifteen, but please arrive by ten o’clock to collect an apron. The materials fee is twenty-two pounds, payable at reception.'
      },
      {
        id: 'B',
        label: 'Audio B — Office renovation update',
        src: 'media/audio/question-type-labs/ql06-c-office-renovation-date.mp3',
        instruction: 'Track each update, but answer only with the final value requested.',
        transcript: 'Manager: We initially expected the renovation to finish in April. A delay in electrical work moved the date to May, and then the supplier confirmed that the new desks would arrive on the twelfth. So staff will return to the office on Monday the fifteenth of May.'
      }
    ],
    questions: [
      {
        prompt: 'Audio A: What time should participants arrive?',
        options: ['10:15', '10:00', '22'],
        answer: '10:00',
        rationale: '10:15 is the workshop start time and 22 is the fee. The question asks arrival time, which is ten o’clock.'
      },
      {
        prompt: 'Audio A: What is the materials fee?',
        options: ['18', '10', '22'],
        answer: '22',
        rationale: 'The eighteenth is the date and ten is part of the time information. The materials fee is twenty-two pounds.'
      },
      {
        prompt: 'Audio B: When will staff return to the office?',
        options: ['April', '12 May', '15 May'],
        answer: '15 May',
        rationale: 'April is the original expectation and the twelfth is the desk-delivery date. The speaker’s final return date is Monday the fifteenth of May.'
      }
    ]
  }
];
