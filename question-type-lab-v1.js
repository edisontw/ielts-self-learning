import { LESSONS } from './data.js';
import { CORE_LESSON_META } from './adaptive-data.js';
import { VOCABULARY_ITEMS } from './learning-extension-data.js';

const mcq = (id, prompt, options, answer, rationale, errorTag) => ({ type: 'quiz', id, prompt, options, answer, rationale, errorTag });

export const QUESTION_TYPE_LABS = [
  {
    id: 'QR01', slug: 'tfng-evidence-speed-lab',
    title: 'Question Type Lab: True / False / Not Given',
    description: 'Make fast evidence-based decisions without importing outside knowledge or treating missing information as false.',
    skill: 'reading', subskill: 'true-false-not-given', lessonType: 'question-type', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 16,
    objective: 'Classify statements as True, False, or Not Given by comparing the exact claim with passage evidence.',
    prerequisites: ['R04'], tags: ['question-type-lab','true-false-not-given','evidence','scope'], ieltsSkill: 'reading', questionType: 'true-false-not-given', examRelevance: 'very-high', timed: true,
    errorTags: ['reading-not-given','reading-contradiction','reading-scope','reading-outside-knowledge'], repairLessons: ['R04'], relatedLessons: ['R04','I03'], nextLessons: ['QR02'],
    chinese: 'TFNG 的核心是比對「題目完整主張」與「文章證據」。文章支持＝True；明確相反＝False；證據不足＝Not Given。不要把自己知道的常識帶進判斷。',
    sections: [
      { title: 'Goal', html: `<p>Use a strict evidence rule under mild time pressure.</p><div class="structure-box">Supported → TRUE · Contradicted → FALSE · Insufficient evidence → NOT GIVEN</div>` },
      { title: '1. Decision rule', html: `<ol><li>Underline the statement's subject, action, quantity, time, and comparison.</li><li>Find the relevant passage sentence.</li><li>Compare the <strong>whole claim</strong>, not one matching word.</li><li>Do not infer a missing detail merely because it seems likely.</li></ol>` },
      { title: '2. Warm-up', html: `<div class="reading-passage"><p>The university library extended weekday opening hours from 9 p.m. to midnight during the examination period. Weekend hours did not change.</p></div>`, blocks: [
        mcq('QR01-Q1','The library remained open later every day during the examination period.',['TRUE','FALSE','NOT GIVEN'],'FALSE','The passage says weekday hours changed but weekend hours did not. “Every day” is contradicted.','reading-scope'),
        mcq('QR01-Q2','More students used the library after the opening hours were extended.',['TRUE','FALSE','NOT GIVEN'],'NOT GIVEN','The passage gives the schedule change but no information about student usage.','reading-not-given')
      ] },
      { title: '3. Evidence comparison', html: `<div class="reading-passage"><p>A city trial replaced several parking spaces with bicycle racks. Local shop owners initially worried that fewer parking spaces would reduce customer numbers. After six months, pedestrian counts had increased, but the trial report did not measure retail sales.</p></div>`, blocks: [
        mcq('QR01-Q3','Shop owners were concerned that the trial might reduce business.',['TRUE','FALSE','NOT GIVEN'],'TRUE','Their concern about fewer customers directly supports the statement.','reading-paraphrase'),
        mcq('QR01-Q4','The trial increased sales in nearby shops.',['TRUE','FALSE','NOT GIVEN'],'NOT GIVEN','Pedestrian counts increased, but retail sales were not measured. More pedestrians cannot be converted into a sales claim.','reading-not-given'),
        mcq('QR01-Q5','The trial report found that pedestrian numbers fell.',['TRUE','FALSE','NOT GIVEN'],'FALSE','The report says pedestrian counts increased, which directly contradicts “fell”.','reading-contradiction')
      ] },
      { title: '4. 60-second mini set', html: `<p>Try these without reopening the rule above.</p><div class="reading-passage"><p>Researchers tested a new reminder system in two hospital clinics. Appointment attendance improved in one clinic but remained unchanged in the other. The study lasted eight weeks and did not examine whether the effect continued afterwards.</p></div>`, blocks: [
        mcq('QR01-Q6','The reminder system improved attendance in both clinics.',['TRUE','FALSE','NOT GIVEN'],'FALSE','Only one clinic improved; the other was unchanged.','reading-scope'),
        mcq('QR01-Q7','The researchers proved that the improvement continued for at least six months.',['TRUE','FALSE','NOT GIVEN'],'FALSE','The study lasted eight weeks and explicitly did not examine persistence afterwards, so the six-month proof claim is contradicted by the study scope.','reading-scope')
      ] },
      { title: '5. Error → Repair', html: `<ul><li>If you chose FALSE for missing information, repair with <strong>R04 evidence sufficiency</strong>.</li><li>If you missed a quantity/time word, mark the controlling phrase before deciding.</li><li>If outside knowledge influenced you, rewrite the decision using passage evidence only.</li></ul>` },
      { title: '6. Retry cue', blocks: [{ type:'note', id:'QR01-retry', label:'My TFNG decision sentence', placeholder:'The passage supports / contradicts / does not state ___ because ___.' }] },
      { title: '7. Review', html: `<div class="callout success"><strong>Not Given is not “probably false”. It means the passage does not give enough evidence to decide.</strong></div>` }
    ]
  },
  {
    id: 'QR02', slug: 'matching-headings-purpose-lab',
    title: 'Question Type Lab: Matching Headings',
    description: 'Choose headings by paragraph purpose and scope, not by repeated vocabulary.',
    skill: 'reading', subskill: 'matching-headings', lessonType: 'question-type', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 16,
    objective: 'Match headings to paragraph purpose by compressing each paragraph into a short function summary.',
    prerequisites: ['R05'], tags: ['question-type-lab','matching-headings','main-idea','paragraph-purpose'], ieltsSkill: 'reading', questionType: 'matching-headings', examRelevance: 'very-high', timed: true,
    errorTags: ['reading-heading-detail','reading-heading-keyword','reading-paragraph-purpose','reading-heading-scope'], repairLessons: ['R01','R02','R05'], relatedLessons: ['R05','QR01'], nextLessons: [],
    chinese: 'Matching Headings 不是找重複字，而是先把段落壓縮成「這段在做什麼」，再選 scope 與功能最吻合的 heading。',
    sections: [
      { title:'Goal', html:`<p>Compress a paragraph into a 5–10 word purpose statement before looking at the headings.</p>` },
      { title:'1. Three common traps', html:`<ul><li><strong>Keyword trap:</strong> heading repeats a noun but misses the purpose.</li><li><strong>Detail trap:</strong> heading describes one example only.</li><li><strong>Scope trap:</strong> heading is broader or narrower than the paragraph.</li></ul>` },
      { title:'2. Warm-up', html:`<div class="reading-passage"><p>Early electric buses were limited by short battery range and long charging times. Newer battery systems can travel farther, but large fleets still need carefully planned charging infrastructure. As a result, many cities are redesigning depots as well as purchasing vehicles.</p></div><div class="structure-box">i. Why electric buses are always cheaper<br>ii. Infrastructure changes required by electric bus fleets<br>iii. The history of urban transport</div>`, blocks:[
        mcq('QR02-Q1','Best heading?',['i','ii','iii'],'ii','The paragraph moves from battery limitations to the infrastructure planning required for large fleets.','reading-paragraph-purpose')
      ]},
      { title:'3. Purpose map', html:`<div class="reading-passage"><p><strong>A</strong> Small urban wetlands can store storm water during heavy rain, reducing pressure on drainage systems. They can also provide habitat for insects and birds. Their value therefore extends beyond visual improvement.</p><p><strong>B</strong> Creating such wetlands is not simply a matter of digging a pond. Water depth, surrounding soil, plant choice, and links to drainage channels all affect performance. Poorly designed sites can dry out too quickly or remain permanently flooded.</p><p><strong>C</strong> Community acceptance may also determine whether a project survives. Residents sometimes interpret dense wetland planting as neglect. Signs, paths, and public explanations can help people understand why the area looks different from a conventional park.</p></div><div class="structure-box">i. Design factors that influence function<br>ii. Multiple benefits of small urban wetlands<br>iii. Helping the public understand an unfamiliar landscape<br>iv. Why conventional parks should disappear</div>`, blocks:[
        mcq('QR02-Q2','Paragraph A',['i','ii','iii','iv'],'ii','It presents several benefits: storm-water storage, habitat, and value beyond appearance.','reading-heading-detail'),
        mcq('QR02-Q3','Paragraph B',['i','ii','iii','iv'],'i','The paragraph lists design variables that determine whether a wetland works.','reading-paragraph-purpose'),
        mcq('QR02-Q4','Paragraph C',['i','ii','iii','iv'],'iii','The main issue is public interpretation and communication, not wetland engineering itself.','reading-heading-keyword')
      ]},
      { title:'4. Timed habit', html:`<p>Target sequence:</p><div class="structure-box">Read paragraph → 5–10 word purpose note → compare headings → eliminate detail/scope traps</div><p>If two headings seem possible, ask which one explains <strong>why the paragraph exists</strong>.</p>` },
      { title:'5. Error → Repair', html:`<p>For every wrong heading, record whether the trap was keyword, detail, or scope. Re-read only the paragraph's controlling sentences, then retry.</p>` },
      { title:'6. Retry cue', blocks:[{type:'note',id:'QR02-purpose',label:'Write a 5–10 word purpose summary for Paragraph C',placeholder:'Explaining why / how...'}]},
      { title:'7. Review', html:`<div class="callout success"><strong>Heading choice begins with paragraph purpose, not with the heading list.</strong></div>` }
    ]
  },
  {
    id: 'QL01', slug: 'listening-mcq-distractor-lab',
    title: 'Question Type Lab: Listening Multiple Choice',
    description: 'Track options through correction, rejection, comparison, and final decision instead of selecting the first match you hear.',
    skill: 'listening', subskill: 'multiple-choice-distractors', lessonType: 'question-type', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 17,
    objective: 'Follow the speaker’s decision path and distinguish considered options from the final answer.',
    prerequisites: ['L04'], tags: ['question-type-lab','multiple-choice','distractor','final-decision'], ieltsSkill: 'listening', questionType: 'multiple-choice', examRelevance: 'very-high', timed: true,
    errorTags: ['listening-distractor','listening-first-mention','listening-change-of-mind','listening-option-tracking'], repairLessons: ['L04'], relatedLessons: ['L04','I03'], nextLessons: ['QL02'],
    chinese: 'Listening MCQ 常先提到一個可行選項，再修正或排除。不要聽到同字就作答；要追蹤每個 option 最後是保留、拒絕還是被取代。',
    sections: [
      { title:'Goal', html:`<p>Keep an option mentally open until the speaker completes the decision.</p>` },
      { title:'1. Decision language', html:`<div class="grid two"><div class="card subtle"><strong>Possible / considered</strong><p>I was thinking of...<br>We could...<br>Maybe...</p></div><div class="card subtle"><strong>Final / changed</strong><p>Actually...<br>On second thought...<br>Let's go with...<br>That would be better.</p></div></div>` },
      { title:'2. Micro drill', html:`<div class="callout">“I first planned to take the early train, but it leaves before the bus reaches the station, so I’ll use the 9:15 service instead.”</div>`, blocks:[
        mcq('QL01-Q1','Which train will the speaker take?',['the early train','the 9:15 train','no train'],'the 9:15 train','The early train is the initial plan; “but” introduces the problem and “instead” gives the final choice.','listening-first-mention')
      ]},
      { title:'3. Option tracking', html:`<div class="callout">“The basic course is cheaper, and I nearly booked it. However, it doesn’t include the field visit, which is the part I need most. The intensive course costs more, but I’ll choose that one.”</div>`, blocks:[
        mcq('QL01-Q2','Why does the speaker choose the intensive course?',['It is cheaper.','It includes the needed field visit.','It has fewer classes.'],'It includes the needed field visit.','The basic course is considered because of price, then rejected because it lacks the needed field visit.','listening-distractor'),
        mcq('QL01-Q3','Which detail is a distractor?',['the basic course is cheaper','the field visit is needed','the intensive course is chosen'],'the basic course is cheaper','It makes the basic course attractive initially but does not determine the final answer.','listening-option-tracking')
      ]},
      { title:'4. Three-option strategy', html:`<ol><li>Before listening, identify what makes A/B/C different.</li><li>During listening, mark options mentally as <strong>possible / rejected / final</strong>.</li><li>Keep listening after a keyword match.</li><li>Choose only after the relevant idea is complete.</li></ol>` },
      { title:'5. IELTS Transfer', html:`<p>In Test Mode the recording plays once. Your goal is not to remember every sentence; it is to keep the <strong>decision state</strong> of each option accurate.</p>` },
      { title:'6. Error → Repair', html:`<p>If you choose a first-mentioned option, replay the sentence in Practice Mode and identify the exact word that changed or rejected it.</p>`, blocks:[{type:'note',id:'QL01-cue',label:'My distractor cue',placeholder:'When I hear but / actually / instead, I will...'}]},
      { title:'7. Review', html:`<div class="callout success"><strong>Mentioned does not mean chosen. Follow the option to its final status.</strong></div>` }
    ]
  },
  {
    id: 'QL02', slug: 'form-notes-completion-prediction-lab',
    title: 'Question Type Lab: Form & Notes Completion',
    description: 'Predict answer type, listen for paraphrased cues, and protect spelling, number, and word-limit accuracy.',
    skill: 'listening', subskill: 'form-notes-completion', lessonType: 'question-type', cefr: 'B2', ieltsRange: '5.5–7.0', difficulty: 3, estimatedMinutes: 16,
    objective: 'Predict the grammatical and semantic answer type before listening and enter an answer that fits the stated word limit.',
    prerequisites: ['L05'], tags: ['question-type-lab','form-completion','notes-completion','prediction','spelling'], ieltsSkill: 'listening', questionType: 'form-notes-completion', examRelevance: 'very-high', timed: true,
    errorTags: ['listening-answer-type','listening-spelling','listening-number','listening-word-limit','listening-paraphrase'], repairLessons: ['L05','L03'], relatedLessons: ['L05','L03'], nextLessons: [],
    chinese: 'Form/Notes completion 先看空格左右，預測答案類型（數字、地點、名詞、形容詞等），再聽改寫訊號。最後要檢查拼字與 word limit，因為意思對但格式錯仍可能失分。',
    sections: [
      { title:'Goal', html:`<p>Predict before listening, then verify grammar, meaning, spelling, and word limit.</p>` },
      { title:'1. Prediction grid', html:`<div class="grid two"><div class="card subtle"><strong>Before the gap</strong><p>£ ___ → number/price<br>meet at ___ → place<br>bring a ___ → singular noun</p></div><div class="card subtle"><strong>Grammar clues</strong><p>an ___ → singular noun beginning with vowel sound<br>very ___ → adjective<br>to ___ → base-form verb</p></div></div>` },
      { title:'2. Warm-up', blocks:[
        mcq('QL02-Q1','Notes show: “Workshop fee: £ ____”. What answer type should you expect?',['a price/number','a person','an adjective','a reason'],'a price/number','The pound sign strongly predicts a numerical price.','listening-answer-type'),
        mcq('QL02-Q2','Form shows: “Meeting place: main ____”. What is the most likely answer type?',['noun/place word','past-tense verb','percentage','adverb'],'noun/place word','The gap completes a location phrase after “main”.','listening-answer-type')
      ]},
      { title:'3. Word-limit discipline', html:`<div class="callout">Instruction: <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong></div>`, blocks:[
        mcq('QL02-Q3','The speaker says “Please meet at the main library entrance.” Which answer fits “Meeting place: main ____”?',['library entrance','the library entrance','main library entrance'],'library entrance','The form already supplies “main”; “library entrance” completes it in two words without duplication.','listening-word-limit'),
        mcq('QL02-Q4','If the correct answer is “18”, which entry is safest for “Fee: £ ____”?',['18','eighteen pounds','£18 pounds'],'18','The currency symbol is already printed. Entering only the number avoids duplication.','listening-number')
      ]},
      { title:'4. Paraphrase cue', html:`<p>Question: <strong>What must participants wear?</strong><br>Recording: “You don’t need special clothing, but closed-toe shoes are compulsory for the practical activity.”</p>`, blocks:[
        mcq('QL02-Q5','Best completion?',['special clothing','closed-toe shoes','a practical activity'],'closed-toe shoes','“Compulsory” paraphrases “must”, while “don’t need” rejects special clothing.','listening-paraphrase')
      ]},
      { title:'5. Final check', html:`<ol><li>Does the answer fit the grammar?</li><li>Does it answer the exact category?</li><li>Is spelling plausible?</li><li>Did you obey the word limit?</li><li>Did the question already provide a unit or repeated word?</li></ol>` },
      { title:'6. Error → Repair', html:`<p>Classify the miss before retrying: answer-type prediction, paraphrase, spelling, number, or word-limit error.</p>`, blocks:[{type:'note',id:'QL02-predict',label:'Prediction before listening',placeholder:'The gap probably needs a ___ because...'}]},
      { title:'7. Review', html:`<div class="callout success"><strong>Predict the shape of the answer first; then listen for meaning that fits that shape.</strong></div>` }
    ]
  }
];

export const QUESTION_TYPE_LAB_META = QUESTION_TYPE_LABS.map(l => ({
  id: l.id, title: l.title, skill: l.skill, difficulty: l.difficulty, estimatedMinutes: l.estimatedMinutes, targetRelevance: 1
}));

export const QUESTION_TYPE_LAB_VOCABULARY = [
  { id:'v-insufficient-evidence-lab', term:'insufficient evidence', meaning:'not enough evidence to decide whether a claim is supported or contradicted', sourceLesson:'QR01', sourceSkill:'reading', collocations:['insufficient evidence','evidence is insufficient','lack sufficient evidence'], prompt:'Choose NOT GIVEN when there is ______ to decide the claim.', answer:'insufficient evidence', distractors:['a repeated keyword','outside knowledge'] },
  { id:'v-paragraph-purpose', term:'paragraph purpose', meaning:'the main job a paragraph performs in the text', sourceLesson:'QR02', sourceSkill:'reading', collocations:['identify paragraph purpose','paragraph function','central purpose'], prompt:'Matching Headings becomes easier when you identify the ______ before comparing options.', answer:'paragraph purpose', distractors:['longest sentence','repeated noun'] },
  { id:'v-final-status', term:'final status', meaning:'whether an option is ultimately chosen, rejected, or replaced', sourceLesson:'QL01', sourceSkill:'listening', collocations:['track the final status','final decision','option status'], prompt:'In Listening MCQ, track each option until its ______ is clear.', answer:'final status', distractors:['first keyword','spelling pattern'] },
  { id:'v-word-limit', term:'word limit', meaning:'the maximum number of words and/or numbers allowed in a completion answer', sourceLesson:'QL02', sourceSkill:'listening', collocations:['obey the word limit','within the word limit','exceed the word limit'], prompt:'A correct idea can still be marked wrong if it exceeds the ______.', answer:'word limit', distractors:['audio speed','paragraph purpose'] }
];

for (const lesson of QUESTION_TYPE_LABS) if (!LESSONS.some(x => x.id === lesson.id)) LESSONS.push(lesson);
for (const meta of QUESTION_TYPE_LAB_META) if (!CORE_LESSON_META.some(x => x.id === meta.id)) CORE_LESSON_META.push(meta);
for (const item of QUESTION_TYPE_LAB_VOCABULARY) if (!VOCABULARY_ITEMS.some(x => x.id === item.id)) VOCABULARY_ITEMS.push(item);
