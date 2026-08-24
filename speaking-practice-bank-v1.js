import { LESSONS } from './data.js';
import { CORE_LESSON_META } from './adaptive-data.js';

export const SPEAKING_BANK_SOURCE = {
  type: 'original',
  label: 'Original IELTS-style speaking practice',
  disclaimer: 'Not an official IELTS test and not affiliated with or endorsed by IELTS.',
  formatReference: 'IELTS Academic public Speaking test-format guidance',
  formatCheckedDate: '2026-08-25'
};

const topic = (id, title, questions) => ({ id, title, questions: questions.map((text, i) => ({ id:`SPB-${id}-Q${i+1}`, text })), source:SPEAKING_BANK_SOURCE });

export const SPEAKING_PART1_TOPICS = [
  topic('P1-HOME','Home and neighbourhood',[
    'What do you like most about the area where you live?',
    'Is there anything you would like to change about your neighbourhood?',
    'Do you know many people who live near you?',
    'Do you think you will live in the same area in the future?'
  ]),
  topic('P1-STUDY','Work or study',[
    'What part of your work or studies do you find most interesting?',
    'Is there a skill you would like to improve for your work or studies?',
    'Do you prefer working or studying alone or with other people?',
    'Has the way you work or study changed in recent years?'
  ]),
  topic('P1-ROUTINE','Daily routines',[
    'Which part of your daily routine is most important to you?',
    'Are your weekdays usually similar to each other?',
    'Is there a time of day when you are especially productive?',
    'What would you like to change about your daily routine?'
  ]),
  topic('P1-TRANSPORT','Transport',[
    'How do you usually travel around your town or city?',
    'What do you like or dislike about that form of transport?',
    'Do you often walk for short journeys?',
    'Has transport in your area improved in recent years?'
  ]),
  topic('P1-FOOD','Food and cooking',[
    'How often do you cook for yourself or other people?',
    'Is there a dish you particularly enjoy making or eating?',
    'Did you help with cooking when you were younger?',
    'Do you think your eating habits will change in the future?'
  ]),
  topic('P1-TECH','Technology',[
    'Which piece of technology do you use most often?',
    'Is there an app or device that saves you a lot of time?',
    'Do you enjoy learning how to use new technology?',
    'Are there times when you prefer not to use digital devices?'
  ]),
  topic('P1-READING','Reading',[
    'What kinds of things do you usually read?',
    'Do you prefer reading on paper or on a screen?',
    'Was reading important to you when you were younger?',
    'Is there something you would like to read more often?'
  ]),
  topic('P1-OUTDOORS','Outdoor time',[
    'How often do you spend time outdoors?',
    'Is there an outdoor place near your home that you enjoy visiting?',
    'What outdoor activities are popular where you live?',
    'Do you think you spend more or less time outdoors than in the past?'
  ]),
  topic('P1-FRIENDS','Friends and social time',[
    'How often do you meet your friends in person?',
    'What do you usually do when you spend time together?',
    'Do you prefer having a few close friends or a large group of friends?',
    'Has technology changed the way you keep in contact with friends?'
  ]),
  topic('P1-SHOPPING','Shopping',[
    'What kinds of things do you usually buy online?',
    'Are there things you prefer to buy in a physical shop?',
    'Do you usually compare prices before buying something?',
    'Has the way you shop changed in the last few years?'
  ]),
  topic('P1-WEEKENDS','Weekends',[
    'What do you usually do at weekends?',
    'Do you prefer to plan your weekends or decide at the last minute?',
    'Is your weekend routine different now from a few years ago?',
    'What would your ideal weekend be like?'
  ]),
  topic('P1-LEARNING','Learning new skills',[
    'What is a skill you have learned recently?',
    'Do you enjoy learning practical skills?',
    'Who do you usually ask for help when learning something new?',
    'Is there a skill you would like to learn in the future?'
  ])
];

const card = (id, title, cue, bullets, followUps, part1TopicId, theme) => ({ id, title, cue, bullets, followUps, part1TopicId, theme, source:SPEAKING_BANK_SOURCE });

export const SPEAKING_PART2_CARDS = [
  card('P2-SKILL','A useful skill','Describe a useful skill you learned from another person.',[
    'who taught you','when you learned it','how you learned it','and explain why the skill has been useful'
  ],['Do you still use this skill regularly?','Would you like to teach this skill to someone else?'],'P1-LEARNING','learning and skills'),
  card('P2-PLACE','A place you return to','Describe a place you enjoy returning to.',[
    'where it is','when you first went there','what you do there','and explain why you like returning to it'
  ],['Has the place changed since you first visited it?','Would you recommend it to visitors?'],'P1-OUTDOORS','places and public space'),
  card('P2-ADVICE','Helpful advice','Describe a piece of advice that was useful to you.',[
    'who gave you the advice','what the advice was','when you received it','and explain how it affected you'
  ],['Do you usually follow other people’s advice?','Are you comfortable giving advice to others?'],'P1-FRIENDS','advice and influence'),
  card('P2-OBJECT','A useful object','Describe an object you own that is especially useful.',[
    'what it is','how long you have had it','how you use it','and explain why it is useful to you'
  ],['Would you replace it if it stopped working?','Do you often buy new versions of things you own?'],'P1-SHOPPING','possessions and consumption'),
  card('P2-EVENT','A community event','Describe a local event or activity that you enjoyed.',[
    'what the event was','where and when it took place','who you went with or met there','and explain what made it enjoyable'
  ],['Would you attend a similar event again?','Do events like this happen often where you live?'],'P1-FRIENDS','community and events'),
  card('P2-CHALLENGE','A challenge you completed','Describe something difficult that you successfully completed.',[
    'what you had to do','why it was difficult','what helped you complete it','and explain how you felt afterwards'
  ],['Would you do the same thing again?','Did you learn anything from the experience?'],'P1-ROUTINE','challenge and motivation'),
  card('P2-JOURNEY','A memorable journey','Describe a journey that you remember well.',[
    'where you went','how you travelled','who you were with','and explain why you remember the journey'
  ],['Would you like to make that journey again?','Do you normally enjoy travelling?'],'P1-TRANSPORT','travel and mobility'),
  card('P2-DIGITAL','A useful website or app','Describe a website or app that you find useful.',[
    'what it is','how you discovered it','what you use it for','and explain why you find it useful'
  ],['How often do you use it?','Would it be difficult to manage without it?'],'P1-TECH','technology and information'),
  card('P2-STORY','A story or book','Describe a story or book that stayed in your mind.',[
    'what it was about','when you read or heard it','what part you remember most','and explain why it stayed in your mind'
  ],['Would you recommend it to other people?','Do you often discuss books or stories with friends?'],'P1-READING','reading and storytelling'),
  card('P2-PHOTO','A photograph','Describe a photograph that is important to you.',[
    'what the photograph shows','when it was taken','where you keep or see it','and explain why it is important to you'
  ],['Do you take many photographs yourself?','Do you prefer printed or digital photographs?'],'P1-TECH','photography and memory'),
  card('P2-PUBLIC','A useful public place','Describe a public place that is useful to people in your area.',[
    'what the place is','where it is','who uses it','and explain why it is useful'
  ],['How often do you use this place?','Could the place be improved in any way?'],'P1-HOME','public services and communities'),
  card('P2-CHANGE','A positive routine change','Describe a change you made to your routine that had a positive effect.',[
    'what you changed','why you decided to change it','how difficult the change was','and explain what effect it had'
  ],['Have you kept this change?','Would you recommend the same change to other people?'],'P1-ROUTINE','lifestyle and behaviour')
];

const discussion = (id, title, part2Id, questions) => ({ id, title, part2Id, questions:questions.map((text,i)=>({id:`SPB-${id}-Q${i+1}`,text})), source:SPEAKING_BANK_SOURCE });

export const SPEAKING_PART3_SETS = [
  discussion('P3-SKILL','Learning and skills','P2-SKILL',[
    'What practical skills should schools teach more often?',
    'How is learning from another person different from learning online?',
    'Why do some adults stop trying to learn new skills?',
    'How might artificial intelligence change practical learning in the future?'
  ]),
  discussion('P3-PLACE','Places and public space','P2-PLACE',[
    'Why do some public places become important to a community?',
    'How should cities balance quiet spaces with commercial development?',
    'Do people use public space differently now than in the past?',
    'What makes people feel that a place belongs to them?'
  ]),
  discussion('P3-ADVICE','Advice and influence','P2-ADVICE',[
    'Why are people more willing to accept advice from some people than others?',
    'Is professional advice becoming more important in modern life?',
    'Can too much advice make decision-making more difficult?',
    'How has social media changed the way people give and receive advice?'
  ]),
  discussion('P3-OBJECT','Possessions and consumption','P2-OBJECT',[
    'Why do people replace products that still work?',
    'Should manufacturers be responsible for making products easier to repair?',
    'How does advertising influence what people consider necessary?',
    'Do you think people will own fewer physical objects in the future?'
  ]),
  discussion('P3-EVENT','Community and events','P2-EVENT',[
    'What benefits can local events bring to a neighbourhood?',
    'Why are some community events difficult to sustain over time?',
    'Should local governments spend money on festivals and public events?',
    'How can events help people from different age groups interact?'
  ]),
  discussion('P3-CHALLENGE','Challenge and motivation','P2-CHALLENGE',[
    'Why do some people deliberately choose difficult goals?',
    'Is competition always useful for motivating people?',
    'How should schools help students respond to failure?',
    'Do modern lifestyles make people more or less resilient?'
  ]),
  discussion('P3-JOURNEY','Travel and mobility','P2-JOURNEY',[
    'Why do people remember some journeys more than others?',
    'How has cheaper travel affected people’s expectations?',
    'What changes could make urban travel more sustainable?',
    'Will people need to travel less for work in the future?'
  ]),
  discussion('P3-DIGITAL','Technology and information','P2-DIGITAL',[
    'Why do some digital services become part of people’s daily routines?',
    'What are the risks of depending heavily on a small number of apps?',
    'Should essential public services always have a non-digital alternative?',
    'How might personal technology change over the next twenty years?'
  ]),
  discussion('P3-STORY','Reading and storytelling','P2-STORY',[
    'Why do stories remain important even when people read fewer books?',
    'What can fiction teach that factual information cannot?',
    'How have short-form digital media changed storytelling?',
    'Should schools allow students more choice in what they read?'
  ]),
  discussion('P3-PHOTO','Photography and memory','P2-PHOTO',[
    'Why do people take so many photographs now?',
    'Can taking photographs sometimes reduce people’s attention to an experience?',
    'How has image editing changed people’s trust in photographs?',
    'Will photographs remain important records of family history?'
  ]),
  discussion('P3-PUBLIC','Public services and communities','P2-PUBLIC',[
    'Which public facilities are most important in growing cities?',
    'Why are some public services used more by certain groups than others?',
    'Should public facilities always be free to use?',
    'How should communities decide which facilities need investment first?'
  ]),
  discussion('P3-CHANGE','Lifestyle and behaviour','P2-CHANGE',[
    'Why is changing a habit often difficult even when people know it is beneficial?',
    'Are individual lifestyle changes enough to solve large social problems?',
    'How can workplaces encourage healthier routines without becoming intrusive?',
    'Do you think people will have more flexible daily routines in the future?'
  ])
];

export const SPEAKING_LINKED_SETS = SPEAKING_PART2_CARDS.map(card => ({
  id:`SET-${card.id.slice(3)}`,
  part1TopicId:card.part1TopicId,
  part2Id:card.id,
  part3Id:SPEAKING_PART3_SETS.find(set=>set.part2Id===card.id)?.id,
  theme:card.theme
}));

export const SPEAKING_BANK_LESSON = {
  id:'SPB01', slug:'speaking-practice-bank', title:'Speaking Practice Bank',
  description:'Use a large original Part 1–3 bank to record, transcribe, self-check, get targeted AI coaching, and retry the same speaking task.',
  skill:'speaking', subskill:'speaking-practice-bank', lessonType:'guided-practice', cefr:'B2–C1-', ieltsRange:'5.5–8.0', difficulty:4, estimatedMinutes:30,
  objective:'Turn repeated IELTS Speaking practice into a measurable attempt → feedback → repair → retry loop.',
  prerequisites:['S01','S02'], tags:['speaking-bank','part-1','part-2','part-3','recording','retry'], ieltsSkill:'speaking', questionType:'part-1-part-2-part-3', examRelevance:'very-high', timed:true,
  errorTags:['speaking-answer-development','speaking-hesitation','speaking-restart','speaking-part2-short','speaking-part3-personal-only','speaking-overgeneralisation'],
  repairLessons:['S01','S02','S03','S04','S05'], relatedLessons:['S01','S02','S03','S04','S05','LB04'], nextLessons:['I03'],
  chinese:'這不是另一套技巧課，而是完整 Speaking 練習庫。選題、錄音、留下 transcript、自我檢查、取得外部 AI coaching，再回到同一題 retry。',
  sections:[
    {title:'Goal',html:`<p>Use the Speaking bank as a deliberate-practice loop: <strong>choose → answer → listen → transcribe → diagnose → repair → retry</strong>.</p><div class="callout"><strong>The bank does not generate an official band score.</strong> It creates better evidence for your next attempt.</div>`},
    {title:'1. Part 1 — Familiar questions',html:`<p>Part 1 practice contains <strong>12 familiar-topic sets / 48 questions</strong>. Aim for a direct answer plus a useful reason or detail. The optional pacing timer is a practice aid, not an official per-question IELTS limit.</p>`},
    {title:'2. Part 2 — Long turn',html:`<p>Part 2 contains <strong>12 original cue cards</strong>. Use the official structure as the practice constraint: one minute to prepare, then speak for up to two minutes. Write keywords, not a memorised script.</p>`},
    {title:'3. Part 3 — Broader discussion',html:`<p>Each cue-card theme links to a <strong>four-question Part 3 discussion set</strong>. Move beyond personal experience: answer, explain, compare or exemplify, and qualify broad claims when needed.</p>`},
    {title:'4. Feedback rule',html:`<p>The transcript feedback prompt can inspect answer development, organisation, vocabulary and grammar. <strong>Text alone cannot reliably assess pronunciation, stress, intonation, actual pace or hesitation.</strong> Use your recording for those checks.</p>`},
    {title:'5. Retry rule',html:`<div class="structure-box">First attempt → save transcript → choose 1–2 repair targets → open S01–S05 if needed → retry the same prompt → compare</div><p>The Retry tab is built from your own recent bank attempts.</p>`},
    {title:'6. Speaking Practice Workspace',html:`<div data-speaking-bank-mount><div class="card subtle">Loading Speaking Practice Bank…</div></div>`},
    {title:'7. Review',html:`<div class="callout success">A useful Speaking session ends with a <strong>specific retry target</strong>, not only another recording.</div>`}
  ]
};

if(!LESSONS.some(l=>l.id===SPEAKING_BANK_LESSON.id)) LESSONS.push(SPEAKING_BANK_LESSON);
if(!CORE_LESSON_META.some(l=>l.id===SPEAKING_BANK_LESSON.id)) CORE_LESSON_META.push({id:'SPB01',title:'Speaking Practice Bank',skill:'speaking',difficulty:4,estimatedMinutes:30,targetRelevance:1});
