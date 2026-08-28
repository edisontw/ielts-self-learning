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
  },
  'reading-inference': {
    tags: ['reading-inference', 'inference'],
    skills: ['reading'],
    auditedQuestions: 9
  },
  'reading-reference': {
    tags: ['reading-reference'],
    skills: ['reading'],
    auditedQuestions: 3
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
    id: 'RR02',
    title: 'Infer Only What the Evidence Supports',
    skill: 'reading',
    lessonType: 'skill-repair',
    cefr: 'B2+',
    difficulty: 4,
    estimatedMinutes: 16,
    objective: 'Make the smallest evidence-supported inference and reject attractive options that add an unstated cause, certainty, quantity, or universal claim.',
    triggerTags: V16_SKILL_REPAIR_FAMILIES['reading-inference'].tags,
    errorSkills: V16_SKILL_REPAIR_FAMILIES['reading-inference'].skills,
    requiresErrorEvidence: true,
    placementSkills: [],
    evidence: { family: 'reading inference', auditedQuestions: 9, auditDate: '2026-08-27' },
    learn: [
      'An inference is not outside knowledge and it is not a creative guess. It is a limited conclusion supported by information the text actually gives, even if the exact conclusion is not written in one sentence.',
      'Build a short evidence chain: identify the explicit facts, then ask what is the smallest conclusion that reasonably follows. Prefer an answer that stays close to those facts over one that explains more than the passage proves.',
      'Reject inference options that introduce a new cause, stronger certainty, larger quantity, wider population, or universal rule. Words such as “must”, “always”, “all”, and “because” often make an otherwise plausible option too strong.'
    ],
    examples: [
      'evidence: visits rose in new evening access hours + no extra staff shifts → supported: access increased without extending staffed hours',
      'evidence: total visitors stayed similar + queues became shorter → supported: arrivals were probably spread more evenly',
      'evidence: one site improved → not supported: the method will work everywhere'
    ],
    questions: [
      {
        context: 'A community library introduced self-service entry for registered users after staff left at 6 p.m. During the first month, weekday evening visits increased, while daytime visits remained close to their previous level. The library did not add any evening staff shifts.',
        prompt: 'Which inference is best supported?',
        options: [
          'Self-service access allowed more evening use without extending staffed opening hours.',
          'Most daytime users switched their visits to the evening.',
          'The library’s staffing costs fell sharply during the first month.'
        ],
        answer: 'Self-service access allowed more evening use without extending staffed opening hours.',
        rationale: 'Evening visits increased and no extra evening staff shifts were added. The passage does not show that daytime users switched periods or that staffing costs fell sharply.'
      },
      {
        context: 'Three apartment buildings installed secure indoor bicycle storage. In the following year, reported bicycle thefts at those buildings were lower than in the previous year. The report did not compare the buildings with similar properties elsewhere and did not investigate other changes in local security.',
        prompt: 'What is the safest inference from the evidence?',
        options: [
          'Secure storage was associated with fewer reported bicycle thefts at these buildings.',
          'Secure storage was proven to be the only cause of the reduction.',
          'Indoor bicycle storage will reduce theft in every neighbourhood.'
        ],
        answer: 'Secure storage was associated with fewer reported bicycle thefts at these buildings.',
        rationale: 'The before-and-after pattern supports a limited association at the observed buildings. Without comparison sites or evidence about other changes, causation and universal effectiveness are too strong.'
      },
      {
        context: 'A museum replaced open entry with timed arrival slots on busy weekends. Average queue length fell, but total daily visitor numbers stayed approximately the same. Some visitors reported that booking a time in advance was less convenient.',
        prompt: 'Which conclusion can reasonably be inferred?',
        options: [
          'Timed entry probably spread arrivals more evenly rather than simply reducing attendance.',
          'Every visitor preferred the new booking system.',
          'The shorter queues were caused entirely by fewer people visiting the museum.'
        ],
        answer: 'Timed entry probably spread arrivals more evenly rather than simply reducing attendance.',
        rationale: 'Queues shortened while total attendance stayed similar, which supports a redistribution explanation. The passage explicitly notes some inconvenience and does not show that fewer visitors caused the change.'
      }
    ]
  },
  {
    id: 'RR03',
    title: 'Resolve What Reference Words Point To',
    skill: 'reading',
    lessonType: 'skill-repair',
    cefr: 'B2+',
    difficulty: 3,
    estimatedMinutes: 15,
    objective: 'Resolve pronouns and demonstrative reference words by linking them to the nearest grammatically and semantically compatible earlier idea.',
    triggerTags: V16_SKILL_REPAIR_FAMILIES['reading-reference'].tags,
    errorSkills: V16_SKILL_REPAIR_FAMILIES['reading-reference'].skills,
    requiresErrorEvidence: true,
    placementSkills: [],
    evidence: { family: 'reading reference', auditedQuestions: 3, auditDate: '2026-08-28' },
    learn: [
      'Reference words such as it, they, this, these, those, and such usually point backward to a noun, noun phrase, event, or idea already introduced. Do not choose the nearest repeated word automatically.',
      'Use three checks: look back for plausible candidates, match number and meaning, then substitute the candidate into the sentence. The sentence should remain grammatically natural and preserve the writer’s intended logic.',
      'Demonstratives such as “this problem” or “these measures” often refer to a whole earlier idea or list, not one isolated noun. When several candidates are nearby, ask which one can logically perform the action in the new sentence.'
    ],
    examples: [
      '“The service introduced evening appointments. This change reduced queues.” → this change = introducing evening appointments',
      '“Reduced fees and local collection points were added. These measures improved access.” → these measures = both listed actions',
      '“The council considered a full closure but rejected it.” → it = the proposed full closure'
    ],
    questions: [
      {
        context: 'A university library tested automatic lighting in several quiet-study rooms. The lights switched off when no movement was detected for five minutes, but students complained that they sometimes went dark while someone was still reading. The delay was later increased to fifteen minutes, and this problem became much less common.',
        prompt: 'What does “this problem” refer to?',
        options: [
          'The lights switching off while a student was still using the room.',
          'The university having too many study rooms.',
          'The delay being increased to fifteen minutes.'
        ],
        answer: 'The lights switching off while a student was still using the room.',
        rationale: '“This problem” points back to the complaint immediately before it. Substituting that event into the final sentence preserves both the meaning and the cause-effect relationship.'
      },
      {
        context: 'A tool-lending service found that membership fees and a single central collection site prevented some residents from using the scheme. It introduced reduced fees for low-income households and opened two neighbourhood pick-up points. These measures increased participation in districts that had previously used the service least.',
        prompt: 'What does “These measures” refer to?',
        options: [
          'Reduced fees and neighbourhood pick-up points.',
          'Membership fees and the original central site.',
          'The districts with the lowest earlier participation.'
        ],
        answer: 'Reduced fees and neighbourhood pick-up points.',
        rationale: 'The plural demonstrative refers to the two actions just introduced. They are the measures that can logically increase access and participation.'
      },
      {
        context: 'Planners considered closing a riverside path throughout the winter because repeated flooding damaged its surface. Local groups argued that a complete closure would remove an important walking route even on dry days. The council therefore rejected it and instead installed gates that can close only the flooded sections temporarily.',
        prompt: 'What does “it” refer to?',
        options: [
          'The proposal for a complete winter closure.',
          'The riverside path itself.',
          'The temporary gates.'
        ],
        answer: 'The proposal for a complete winter closure.',
        rationale: 'The council can reject a proposal, not the physical path. Substituting “the proposal for a complete winter closure” makes the sentence coherent and matches the alternative introduced afterwards.'
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
