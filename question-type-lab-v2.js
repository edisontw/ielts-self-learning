import { LESSONS } from './data.js';
import { CORE_LESSON_META } from './adaptive-data.js';
import { VOCABULARY_ITEMS } from './learning-extension-data.js';

const mcq = (id, prompt, options, answer, rationale, errorTag) => ({ type:'quiz', id, prompt, options, answer, rationale, errorTag });

export const QUESTION_TYPE_LABS_V2 = [
  {
    id:'QR03', slug:'reading-multiple-choice-claim-evidence-lab', title:'Question Type Lab: Reading Multiple Choice',
    description:'Separate the writer’s main claim from supporting details and attractive keyword distractors.',
    skill:'reading', subskill:'multiple-choice', lessonType:'question-type', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:17,
    objective:'Choose Reading multiple-choice answers by matching the complete idea and evidence rather than isolated vocabulary.',
    prerequisites:['R02','R03'], tags:['question-type-lab','multiple-choice','claim','evidence'], ieltsSkill:'reading', questionType:'multiple-choice', examRelevance:'very-high', timed:true,
    errorTags:['reading-mcq-detail','reading-mcq-keyword','reading-mcq-scope'], repairLessons:['R02','R03'], relatedLessons:['R02','R03','I03'], nextLessons:['QR04'],
    chinese:'Reading MCQ 要比較完整意思。干擾選項常重複原文詞彙，卻把範圍、因果或作者立場改掉。',
    sections:[
      {title:'Goal',html:`<p>Use <strong>question focus → evidence → option comparison</strong> instead of scanning for matching words.</p>`},
      {title:'1. Three distractor patterns',html:`<ul><li><strong>True detail, wrong answer:</strong> the detail is in the text but does not answer the question.</li><li><strong>Keyword copy:</strong> vocabulary matches but the relationship changes.</li><li><strong>Scope shift:</strong> some becomes all, may becomes will, one context becomes every context.</li></ul>`},
      {title:'2. Warm-up',html:`<div class="reading-passage"><p>Remote work reduced commuting for many employees, but surveys suggest that the largest gains in job satisfaction occurred when workers could choose when to work from home rather than being required to do so every day.</p></div>`,blocks:[
        mcq('QR03-Q1','What produced the largest gains in job satisfaction?',['Working from home every day','Having choice over remote-work frequency','Longer commuting time','Mandatory office attendance'],'Having choice over remote-work frequency','The passage contrasts remote work in general with the stronger effect of having choice over frequency.','reading-mcq-detail'),
        mcq('QR03-Q2','Which option is a scope trap?',['Having choice over remote-work frequency','All employees prefer permanent remote work','Some employees reduced commuting','Choice affected satisfaction'],'All employees prefer permanent remote work','The passage does not make a universal claim about all employees or permanent remote work.','reading-mcq-scope')
      ]},
      {title:'3. Evidence-first practice',html:`<div class="reading-passage"><p>Public libraries increasingly lend tools, musical instruments, and other non-book items. Supporters argue that the service broadens access to expensive equipment. Critics note that storage and maintenance require staff time. Early evaluations therefore suggest that these programmes work best when collections are selected around clear local demand.</p></div>`,blocks:[
        mcq('QR03-Q3','What is the writer’s main conclusion?',['Libraries should stop lending books.','Non-book lending always saves staff time.','Non-book collections are most effective when they reflect local demand.','All expensive equipment should be publicly owned.'],'Non-book collections are most effective when they reflect local demand.','The final sentence synthesises the benefit and operational limitation into a qualified conclusion.','reading-mcq-detail'),
        mcq('QR03-Q4','Why is “storage and maintenance” mentioned?',['As evidence of an operational cost','To prove local demand is low','To define a musical instrument','As the writer’s final conclusion'],'As evidence of an operational cost','It supports the critics’ limitation rather than serving as the overall conclusion.','reading-mcq-detail')
      ]},
      {title:'4. Timed decision rule',html:`<div class="structure-box">Question focus → locate evidence → predict answer in plain English → compare options → reject scope/relationship shifts</div>`},
      {title:'5. Error → Repair',html:`<p>If a wrong option was “true but irrelevant”, return to R02 and label the role of that sentence. If a repeated keyword trapped you, return to R03 and paraphrase the question before comparing options.</p>`},
      {title:'6. Retry cue',blocks:[{type:'note',id:'QR03-note',label:'My plain-English prediction before options',placeholder:'The answer should say that...'}]},
      {title:'7. Review',html:`<div class="callout success">The best option answers the exact question with the same meaning and scope as the evidence.</div>`}
    ]
  },
  {
    id:'QR04', slug:'reading-sentence-completion-grammar-lab', title:'Question Type Lab: Sentence Completion',
    description:'Use grammar, meaning, and word limits together when completing a sentence from the passage.',
    skill:'reading', subskill:'sentence-completion', lessonType:'question-type', cefr:'B2', ieltsRange:'5.5–7.0', difficulty:3, estimatedMinutes:16,
    objective:'Predict the grammatical answer type and copy only the passage words that satisfy meaning and the word limit.',
    prerequisites:['R03'], tags:['question-type-lab','sentence-completion','word-limit','grammar'], ieltsSkill:'reading', questionType:'sentence-completion', examRelevance:'high', timed:true,
    errorTags:['reading-answer-type','reading-word-limit','reading-copy-error'], repairLessons:['R03','VG02'], relatedLessons:['R03','QL02'], nextLessons:['QR05'],
    chinese:'Sentence Completion 不只找意思相近句子，還要先看空格前後判斷詞性，再遵守 NO MORE THAN… 的字數限制。',
    sections:[
      {title:'Goal',html:`<p>Predict <strong>noun / adjective / number / phrase</strong> before locating the answer.</p>`},
      {title:'1. Four checks',html:`<ol><li>What grammar fits the blank?</li><li>What meaning is required?</li><li>Which passage words express it?</li><li>Does the final answer obey the word limit?</li></ol>`},
      {title:'2. Warm-up',html:`<div class="reading-passage"><p>The new roof uses a reflective coating that reduces heat absorption during summer.</p></div><p><strong>NO MORE THAN TWO WORDS</strong><br>The roof stays cooler because of a ______.</p>`,blocks:[
        mcq('QR04-Q1','Best completion',['reflective coating','coating that reduces','new reflective coating','heat absorption during'],'reflective coating','It fits grammatically, preserves the passage meaning, and uses exactly two words.','reading-word-limit')
      ]},
      {title:'3. Meaning + grammar',html:`<div class="reading-passage"><p>Researchers found that brief exposure to natural environments improved participants’ reported concentration, although the effect was smaller among people who were already highly attentive.</p></div>`,blocks:[
        mcq('QR04-Q2','Complete: Natural environments were associated with improved ______.',['concentration','reported concentration although','highly attentive people','smaller'],'concentration','A noun is required after “improved”; the passage directly supplies “concentration”.','reading-answer-type'),
        mcq('QR04-Q3','Which answer would violate a TWO-WORD limit?',['concentration','reported concentration','participants reported concentration','attention'],'participants reported concentration','It uses three words even though its meaning is related to the passage.','reading-word-limit')
      ]},
      {title:'4. Copy accurately',html:`<p>Do not silently change singular/plural or word form unless the task permits it. IELTS completion items normally require words from the passage.</p>`},
      {title:'5. Error → Repair',html:`<p>Classify misses as <strong>locator / answer type / copying / word limit</strong>. The repair depends on the cause.</p>`},
      {title:'6. Retry cue',blocks:[{type:'note',id:'QR04-note',label:'Before searching, predict the answer type',placeholder:'A noun meaning... / a number for...'}]},
      {title:'7. Review',html:`<div class="callout success">A correct idea can still be a wrong IELTS answer if grammar or word limit fails.</div>`}
    ]
  },
  {
    id:'QR05', slug:'matching-information-location-lab', title:'Question Type Lab: Matching Information',
    description:'Locate examples, reasons, findings, and criticisms across paragraphs without confusing topic with function.',
    skill:'reading', subskill:'matching-information', lessonType:'question-type', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:18,
    objective:'Match a requested information function to the paragraph that actually contains it, even when several paragraphs share the same topic.',
    prerequisites:['R02','R05'], tags:['question-type-lab','matching-information','location','function'], ieltsSkill:'reading', questionType:'matching-information', examRelevance:'high', timed:true,
    errorTags:['reading-information-function','reading-topic-trap','reading-paraphrase'], repairLessons:['R02','R03'], relatedLessons:['R02','QR02'], nextLessons:['QR06'],
    chinese:'Matching Information 常不是找「哪段談同一主題」，而是找哪段包含特定功能：例子、批評、研究結果、原因、解決方案。',
    sections:[
      {title:'Goal',html:`<p>Translate the question into an information function before scanning paragraphs.</p>`},
      {title:'1. Function labels',html:`<div class="structure-box">example · cause · criticism · research finding · solution · comparison · historical change</div>`},
      {title:'2. Passage',html:`<div class="reading-passage"><p><strong>A</strong> Urban trees can lower local surface temperatures by providing shade and releasing water vapour.</p><p><strong>B</strong> A study using satellite data found that neighbourhoods with more continuous tree cover were cooler during heatwaves than equally dense neighbourhoods with fragmented cover.</p><p><strong>C</strong> Planting campaigns can fail when species are selected for fast growth alone. Trees that are poorly suited to local soil may require excessive irrigation or die early.</p><p><strong>D</strong> Some cities now combine planting targets with long-term maintenance budgets so that survival, not just planting numbers, becomes the measure of success.</p></div>`,blocks:[
        mcq('QR05-Q1','Which paragraph contains a research finding?',['A','B','C','D'],'B','Paragraph B reports a study and its observed comparison.','reading-information-function'),
        mcq('QR05-Q2','Which paragraph gives a criticism of a common planting approach?',['A','B','C','D'],'C','It explains why choosing species mainly for fast growth can fail.','reading-topic-trap'),
        mcq('QR05-Q3','Which paragraph describes a policy response to the problem?',['A','B','C','D'],'D','It describes combining planting targets with maintenance budgets as a response.','reading-information-function')
      ]},
      {title:'3. Topic trap',html:`<p>All four paragraphs discuss urban trees. Topic similarity therefore cannot solve the task; the requested <strong>function</strong> must guide the match.</p>`},
      {title:'4. Timed habit',html:`<div class="structure-box">Question → function label → scan structural clues → verify full sentence</div>`},
      {title:'5. Error → Repair',html:`<p>If you matched by topic only, return to R02 and label sentence roles. If the same meaning was expressed differently, repair with R03.</p>`},
      {title:'6. Retry cue',blocks:[{type:'note',id:'QR05-note',label:'Convert one question into a function label',placeholder:'This question wants a criticism / finding / example...'}]},
      {title:'7. Review',html:`<div class="callout success">Matching Information asks “where is this kind of information?”, not merely “where is this topic mentioned?”</div>`}
    ]
  },
  {
    id:'QR06', slug:'summary-completion-logic-lab', title:'Question Type Lab: Summary Completion',
    description:'Follow the logic of a compressed summary and choose words that fit both the passage and the summary grammar.',
    skill:'reading', subskill:'summary-completion', lessonType:'question-type', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:18,
    objective:'Complete a summary by tracking paraphrase, logical sequence, and grammatical fit across several linked blanks.',
    prerequisites:['R02','R03','QR04'], tags:['question-type-lab','summary-completion','paraphrase','logic'], ieltsSkill:'reading', questionType:'summary-completion', examRelevance:'very-high', timed:true,
    errorTags:['reading-summary-logic','reading-paraphrase','reading-answer-type'], repairLessons:['R02','R03'], relatedLessons:['QR04','R03'], nextLessons:[],
    chinese:'Summary Completion 是壓縮版文章。要追蹤段落邏輯與 paraphrase，不能每個空格獨立猜；前後文會限制答案的詞性與意思。',
    sections:[
      {title:'Goal',html:`<p>Read the summary as a connected argument before solving individual blanks.</p>`},
      {title:'1. Passage',html:`<div class="reading-passage"><p>Many cities introduced shared bicycles to provide a low-cost alternative for short trips. Early systems relied on fixed docking stations, which made redistribution predictable but limited where users could end a journey. Dockless systems increased flexibility, yet badly parked bicycles sometimes blocked pavements. Newer schemes therefore combine digital parking zones with financial incentives for correct return.</p></div>`},
      {title:'2. Summary map',html:`<p>Shared bicycles were intended as an affordable option for <strong>(1)</strong>. Fixed docks made management easier but reduced <strong>(2)</strong>. Dockless models solved part of that problem but created issues with obstructed pavements. Some newer systems use designated digital areas plus <strong>(3)</strong> to improve parking behaviour.</p>`,blocks:[
        mcq('QR06-Q1','Blank 1',['short trips','docking stations','pavements','management'],'short trips','The passage states that shared bicycles were a low-cost alternative for short trips.','reading-paraphrase'),
        mcq('QR06-Q2','Blank 2',['predictability','flexibility','cost','safety'],'flexibility','Fixed docks limited where users could finish, so flexibility was reduced.','reading-summary-logic'),
        mcq('QR06-Q3','Blank 3',['financial incentives','fixed docks','more bicycles','long journeys'],'financial incentives','The final sentence explicitly combines digital parking zones with financial incentives.','reading-answer-type')
      ]},
      {title:'3. Solve as a sequence',html:`<p>Notice the compressed logic: purpose → first design → limitation → second design → new problem → combined solution.</p>`},
      {title:'4. Distractor control',html:`<p>A word may appear in the passage and still fail the summary grammar or logical role. Read the sentence containing the blank aloud after choosing.</p>`},
      {title:'5. Error → Repair',html:`<p>If you lose the sequence, map the passage structure with R02. If the summary uses different wording, repair with R03.</p>`},
      {title:'6. Retry cue',blocks:[{type:'note',id:'QR06-note',label:'Write the summary logic in six arrows',placeholder:'purpose → design → limitation → ...'}]},
      {title:'7. Review',html:`<div class="callout success">Treat summary blanks as linked decisions inside one compressed text.</div>`}
    ]
  },
  {
    id:'QL03', slug:'listening-map-plan-lab', title:'Question Type Lab: Map & Plan Labelling',
    description:'Anchor your position, follow directional language, and update location continuously instead of remembering isolated place names.',
    skill:'listening', subskill:'map-plan-labelling', lessonType:'question-type', cefr:'B2', ieltsRange:'5.5–7.0', difficulty:3, estimatedMinutes:17,
    objective:'Track movement from a fixed starting point and translate directional phrases into map position changes.',
    prerequisites:['L01','L05'], tags:['question-type-lab','map','plan','direction'], ieltsSkill:'listening', questionType:'map-plan-labelling', examRelevance:'high', timed:true,
    errorTags:['listening-map-anchor','listening-direction','listening-location-update'], repairLessons:['L01','L05'], relatedLessons:['L05','QL02'], nextLessons:['QL04'],
    chinese:'Map/Plan 題要先固定起點與方向，再隨語音持續更新位置。不要只記 place name；要聽 next to、opposite、past、at the end of 等空間關係。',
    sections:[
      {title:'Goal',html:`<p>Maintain a moving mental pointer from the stated entrance or “You are here” point.</p>`},
      {title:'1. Direction language',html:`<div class="structure-box">go past · turn left/right · opposite · next to · at the end · immediately before · beyond</div>`},
      {title:'2. Micro route',html:`<div class="callout">“From the entrance, walk straight past reception. Turn left at the café. The seminar room is the second door on your right.”</div>`,blocks:[
        mcq('QL03-Q1','What landmark triggers the left turn?',['the entrance','reception','the café','the seminar room'],'the café','The speaker says “Turn left at the café”; reception is passed before the turn.','listening-direction'),
        mcq('QL03-Q2','Where is the seminar room after the turn?',['first door on the left','second door on the right','opposite reception','inside the café'],'second door on the right','The route ends with “the second door on your right”.','listening-location-update')
      ]},
      {title:'3. Anchor discipline',html:`<p>If you lose your location, do not guess from the next place name. Re-anchor at the most recent landmark you are certain about and follow from there.</p>`},
      {title:'4. Relative-position drill',blocks:[
        mcq('QL03-Q3','“The lockers are opposite the lift.” What relationship matters?',['same side','across from','inside','behind only'],'across from','“Opposite” means on the other side facing the lift.','listening-direction')
      ]},
      {title:'5. IELTS Transfer',html:`<p>Before audio starts, identify entrance, compass cues if shown, numbered options, and likely route branches.</p>`},
      {title:'6. Error → Repair',blocks:[{type:'note',id:'QL03-note',label:'My re-anchor rule',placeholder:'If I lose the route, I will return mentally to...'}]},
      {title:'7. Review',html:`<div class="callout success">Map listening is continuous position tracking, not a vocabulary memory test.</div>`}
    ]
  },
  {
    id:'QL04', slug:'listening-matching-speaker-option-lab', title:'Question Type Lab: Listening Matching',
    description:'Match speakers or items to options by paraphrase and final attitude rather than repeated words.',
    skill:'listening', subskill:'matching', lessonType:'question-type', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:18,
    objective:'Keep the option set active and assign each speaker or item only after identifying the decisive paraphrased meaning.',
    prerequisites:['L03','L04'], tags:['question-type-lab','matching','paraphrase','attitude'], ieltsSkill:'listening', questionType:'matching', examRelevance:'high', timed:true,
    errorTags:['listening-matching-paraphrase','listening-attitude','listening-option-reuse'], repairLessons:['L03','L04'], relatedLessons:['L03','QL01'], nextLessons:['QL05'],
    chinese:'Listening Matching 要同時管理 option set 與 speaker 意思。答案常用 paraphrase，且 speaker 可能先提一個看法再修正。',
    sections:[
      {title:'Goal',html:`<p>Translate options into short meanings before listening, then match by decisive meaning.</p>`},
      {title:'1. Option compression',html:`<p>A. convenient but expensive → <strong>easy / costly</strong><br>B. difficult at first but worthwhile → <strong>initial challenge / later value</strong><br>C. enjoyable mainly because of the people → <strong>social benefit</strong></p>`},
      {title:'2. Speaker 1',html:`<div class="callout">“The software took me a week to understand and I nearly gave up, but once I learned the shortcuts it saved me hours every month.”</div>`,blocks:[
        mcq('QL04-Q1','Best match',['A','B','C'],'B','The speaker describes an initial difficulty followed by clear later value.','listening-matching-paraphrase')
      ]},
      {title:'3. Speaker 2',html:`<div class="callout">“The class content was useful, but what kept me coming back was working with the same small group each week.”</div>`,blocks:[
        mcq('QL04-Q2','Best match',['A','B','C'],'C','The decisive reason for continued attendance is the social group.','listening-attitude'),
        mcq('QL04-Q3','Why is “content was useful” not the final answer?',['It is false','It is background information before the stronger reason','It means the class was expensive','It refers to software'],'It is background information before the stronger reason','The contrast “but” introduces what mattered most.','listening-attitude')
      ]},
      {title:'4. Option management',html:`<p>Check whether options can be used once, more than once, or not at all. Do not assume the rule.</p>`},
      {title:'5. Error → Repair',html:`<p>For paraphrase misses, return to L03. For first-mention or attitude shifts, return to L04.</p>`},
      {title:'6. Retry cue',blocks:[{type:'note',id:'QL04-note',label:'Compress one long option into 2–4 words',placeholder:'Option meaning...'}]},
      {title:'7. Review',html:`<div class="callout success">Matching becomes easier when options are stored as meanings, not full sentences.</div>`}
    ]
  },
  {
    id:'QL05', slug:'listening-short-answer-lab', title:'Question Type Lab: Listening Short Answer',
    description:'Listen for the exact requested detail while controlling word limits, numbers, and answer form.',
    skill:'listening', subskill:'short-answer', lessonType:'question-type', cefr:'B2', ieltsRange:'5.5–7.0', difficulty:3, estimatedMinutes:16,
    objective:'Predict the requested information type and produce a concise answer that satisfies the stated word limit.',
    prerequisites:['L05'], tags:['question-type-lab','short-answer','prediction','word-limit'], ieltsSkill:'listening', questionType:'short-answer', examRelevance:'high', timed:true,
    errorTags:['listening-short-answer-type','listening-word-limit','listening-number'], repairLessons:['L05'], relatedLessons:['QL02'], nextLessons:['QL06'],
    chinese:'Short Answer 先判斷題目要人、地點、原因、數字還是物品，再聽該資訊。回答要短，並嚴格遵守字數限制。',
    sections:[
      {title:'Goal',html:`<p>Predict the answer category before listening.</p>`},
      {title:'1. Question words',html:`<div class="structure-box">Who → person · Where → place · When → time/date · How many → number · Why → reason</div>`},
      {title:'2. Micro listening',html:`<div class="callout">“Please bring a photo ID. You won’t need the printed booking email because we can find your reservation by surname.”</div>`,blocks:[
        mcq('QL05-Q1','What must visitors bring?',['photo ID','booking email','surname','reservation number'],'photo ID','The speaker explicitly says to bring a photo ID and says the printed email is unnecessary.','listening-short-answer-type'),
        mcq('QL05-Q2','Which mentioned item is a distractor?',['photo ID','printed booking email','visitor','reservation'],'printed booking email','It is mentioned but explicitly described as unnecessary.','listening-word-limit')
      ]},
      {title:'3. Number control',html:`<div class="callout">“The tour used to cost eighteen pounds, but from September the adult price will be twenty-one.”</div>`,blocks:[
        mcq('QL05-Q3','What will the adult price be from September?',['£18','£20','£21','September'],'£21','The old price is corrected by the new future price.','listening-number')
      ]},
      {title:'4. Word-limit check',html:`<p>After answering, count words mechanically. Do not add explanation the question did not request.</p>`},
      {title:'5. IELTS Transfer',html:`<p>Underline the question word and any time reference before the recording begins.</p>`},
      {title:'6. Error → Repair',blocks:[{type:'note',id:'QL05-note',label:'Prediction before listening',placeholder:'The question asks for a place / number / reason...'}]},
      {title:'7. Review',html:`<div class="callout success">Short Answer rewards precise retrieval, not long explanations.</div>`}
    ]
  },
  {
    id:'QL06', slug:'listening-sentence-completion-lab', title:'Question Type Lab: Listening Sentence Completion',
    description:'Use sentence grammar to predict the answer while tracking paraphrase and corrections in the recording.',
    skill:'listening', subskill:'sentence-completion', lessonType:'question-type', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:17,
    objective:'Predict grammar and meaning from the incomplete sentence, then capture the final spoken detail accurately.',
    prerequisites:['L03','L05'], tags:['question-type-lab','sentence-completion','grammar','paraphrase'], ieltsSkill:'listening', questionType:'sentence-completion', examRelevance:'high', timed:true,
    errorTags:['listening-sentence-grammar','listening-paraphrase','listening-correction'], repairLessons:['L03','L05'], relatedLessons:['QL02','QL05'], nextLessons:[],
    chinese:'Listening Sentence Completion 可用題目本身的文法先預測答案類型，再聽 paraphrase 與最後修正。空格前後是重要提示。',
    sections:[
      {title:'Goal',html:`<p>Let the incomplete sentence predict both grammar and meaning.</p>`},
      {title:'1. Grammar prediction',html:`<p>“The main advantage is ______.” → noun phrase<br>“Participants should arrive ______.” → time/adverbial<br>“The room is located beside the ______.” → noun/place</p>`},
      {title:'2. Micro listening',html:`<div class="callout">“The workshop starts at ten, but registration is slow, so please be there by nine forty-five.”</div>`,blocks:[
        mcq('QL06-Q1','Complete: Participants should arrive by ______.',['10:00','9:45','registration','the workshop'],'9:45','The start time is background; the requested arrival time is 9:45.','listening-correction')
      ]},
      {title:'3. Paraphrase cue',html:`<div class="callout">“What people value most is that the service can be used whenever it suits them.”</div>`,blocks:[
        mcq('QL06-Q2','Complete: The service’s main benefit is its ______.',['flexibility','cost','location','staff'],'flexibility','“Whenever it suits them” paraphrases flexibility.','listening-paraphrase'),
        mcq('QL06-Q3','What answer type does “its ______” predict here?',['a noun','a full sentence','a date only','a verb phrase only'],'a noun','The possessive determiner “its” is followed naturally by a noun or noun phrase.','listening-sentence-grammar')
      ]},
      {title:'4. Final-answer discipline',html:`<p>Keep listening through corrections and contrasts. A grammatically possible answer is not enough if the speaker later changes the detail.</p>`},
      {title:'5. Error → Repair',html:`<p>Grammar prediction problems → L05. Paraphrase recognition problems → L03. First-mention errors → L04.</p>`},
      {title:'6. Retry cue',blocks:[{type:'note',id:'QL06-note',label:'Predict grammar from one incomplete sentence',placeholder:'The blank needs a noun / time / adjective...'}]},
      {title:'7. Review',html:`<div class="callout success">The sentence gives you a prediction before the speaker gives you the answer.</div>`}
    ]
  }
];

export const QUESTION_TYPE_LABS_V2_META = QUESTION_TYPE_LABS_V2.map(l => ({
  id:l.id, title:l.title, skill:l.skill, difficulty:l.difficulty, estimatedMinutes:l.estimatedMinutes, targetRelevance:0.96
}));

export const QUESTION_TYPE_LABS_V2_VOCAB = [
  {id:'v-scope-shift',term:'scope shift',meaning:'a change in how broad, narrow, certain, or universal a claim is',sourceLesson:'QR03',sourceSkill:'reading',collocations:['scope shift','change the scope','scope of a claim'],prompt:'Changing “some” to “all” creates a ______.',answer:'scope shift',distractors:['word match','topic label']},
  {id:'v-grammatical-fit',term:'grammatical fit',meaning:'how well an answer matches the grammar around a blank',sourceLesson:'QR04',sourceSkill:'reading',collocations:['grammatical fit','fit grammatically','check the grammar'],prompt:'A completion answer needs correct meaning and ______.',answer:'grammatical fit',distractors:['visual fit','topic repetition']},
  {id:'v-research-finding',term:'research finding',meaning:'a result or conclusion reported by a study',sourceLesson:'QR05',sourceSkill:'reading',collocations:['research finding','report a finding','study found that'],prompt:'Matching Information may ask you to locate a ______ rather than a general topic.',answer:'research finding',distractors:['page number','heading word']},
  {id:'v-logical-sequence',term:'logical sequence',meaning:'the ordered relationship among ideas in an explanation or summary',sourceLesson:'QR06',sourceSkill:'reading',collocations:['logical sequence','follow the sequence','sequence of ideas'],prompt:'Summary Completion is easier when you follow the ______ across blanks.',answer:'logical sequence',distractors:['alphabetical list','same keyword']},
  {id:'v-re-anchor',term:'re-anchor',meaning:'to return attention to the last location or reference point you know with confidence',sourceLesson:'QL03',sourceSkill:'listening',collocations:['re-anchor at a landmark','anchor point','re-establish position'],prompt:'If you lose your place on a map, ______ at the last certain landmark.',answer:'re-anchor',distractors:['translate','guess randomly']},
  {id:'v-decisive-meaning',term:'decisive meaning',meaning:'the part of a message that determines the final choice or match',sourceLesson:'QL04',sourceSkill:'listening',collocations:['decisive meaning','decisive detail','final attitude'],prompt:'In Listening Matching, wait for the ______ rather than the first related word.',answer:'decisive meaning',distractors:['first noun','longest option']},
  {id:'v-requested-detail',term:'requested detail',meaning:'the specific type of information a question asks for',sourceLesson:'QL05',sourceSkill:'listening',collocations:['requested detail','specific detail','retrieve a detail'],prompt:'Short Answer requires the exact ______, not a long explanation.',answer:'requested detail',distractors:['general topic','speaker accent']},
  {id:'v-incomplete-sentence',term:'incomplete sentence',meaning:'a sentence with a blank whose grammar helps predict the answer',sourceLesson:'QL06',sourceSkill:'listening',collocations:['incomplete sentence','complete the sentence','sentence grammar'],prompt:'Before listening, use the grammar of the ______ to predict the answer type.',answer:'incomplete sentence',distractors:['audio title','answer key']}
];

for (const lesson of QUESTION_TYPE_LABS_V2) if (!LESSONS.some(x=>x.id===lesson.id)) LESSONS.push(lesson);
for (const meta of QUESTION_TYPE_LABS_V2_META) if (!CORE_LESSON_META.some(x=>x.id===meta.id)) CORE_LESSON_META.push(meta);
for (const item of QUESTION_TYPE_LABS_V2_VOCAB) if (!VOCABULARY_ITEMS.some(x=>x.id===item.id)) VOCABULARY_ITEMS.push(item);
