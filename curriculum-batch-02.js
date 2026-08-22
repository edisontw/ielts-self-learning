import { LESSONS, SKILL_META } from './data.js';
import { CORE_LESSON_META } from './adaptive-data.js';
import { VOCABULARY_ITEMS } from './learning-extension-data.js';

const mcq = (id, prompt, options, answer, rationale, errorTag) => ({ type: 'quiz', id, prompt, options, answer, rationale, errorTag });

SKILL_META['ielts-strategy'] ||= { label: 'IELTS Strategy', icon: 'I', group: 'IELTS' };

export const CURRICULUM_BATCH_02 = [
  {
    id: 'LB02', slug: 'stop-trying-to-understand-every-word',
    title: 'Stop Trying to Understand Every Word',
    description: 'Learn to keep reading and listening when some language is unknown, and decide when a word is actually worth stopping for.',
    skill: 'learning-better', subskill: 'ambiguity-tolerance', lessonType: 'concept', cefr: 'B2', ieltsRange: '5.5–7.5', difficulty: 3, estimatedMinutes: 15,
    objective: 'Continue processing meaning when some words are unknown and use context to decide which gaps matter.',
    prerequisites: ['LB01'], tags: ['ambiguity', 'context', 'fluency', 'unknown-words'], ieltsSkill: 'all', questionType: 'learning-strategy', examRelevance: 'medium', timed: false,
    errorTags: ['study-word-fixation', 'study-overtranslation', 'study-context-neglect'], repairLessons: ['R01', 'L01'], relatedLessons: ['R01', 'L01'], nextLessons: ['LB03'],
    chinese: '遇到生字不等於理解中斷。先判斷它是否影響句子的核心關係；若不影響，就繼續追主旨、轉折、因果與最後決定。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to decide whether an unknown word is <strong>critical, guessable, or safely ignorable for now</strong>.</p>` },
      { title: '1. Learn — Three kinds of unknown words', html: `<ol><li><strong>Critical:</strong> without it, the answer or relationship is unclear.</li><li><strong>Guessable:</strong> surrounding language gives enough clues.</li><li><strong>Non-critical:</strong> it adds detail but does not control the main meaning.</li></ol><div class="callout">Fluent comprehension is not complete word-by-word decoding. It is successful meaning construction.</div>` },
      { title: '2. Notice — Keep the sentence moving', html: `<div class="reading-passage"><p>The device was initially praised for its low cost. <strong>Nevertheless</strong>, repeated malfunctions made it unsuitable for use in remote clinics.</p></div><p>Even if <em>malfunctions</em> is unfamiliar, “nevertheless”, “repeated”, and “unsuitable” tell you that a problem changed the evaluation.</p>`, blocks: [mcq('LB02-Q1','If “malfunctions” is unfamiliar, what is the best first response?',['Stop and translate it before continuing','Use the contrast and surrounding meaning, then continue','Assume the whole sentence is impossible','Ignore the entire paragraph'],'Use the contrast and surrounding meaning, then continue','The sentence still gives a clear contrast: low cost was positive, but repeated problems made the device unsuitable.','study-word-fixation')] },
      { title: '3. Guided Practice', html: `<div class="reading-passage"><p>Some urban birds have adapted to <em>nocturnal illumination</em> by changing when they feed. Researchers are still unsure whether this behavioural shift has long-term costs.</p></div>`, blocks: [mcq('LB02-Q2','You do not know “nocturnal illumination”. What can you infer safely?',['It is related to something that affects feeding time','It definitely means food shortage','It proves birds are healthier at night','Nothing can be understood'],'It is related to something that affects feeding time','The exact phrase is not required to understand that an environmental condition is linked to a change in feeding time.','study-context-neglect')] },
      { title: '4. When you should stop', html: `<p>Stop and inspect a word when it is:</p><ul><li>repeated across the passage and seems central;</li><li>part of the question or answer distinction;</li><li>controlling polarity, quantity, comparison, cause, or limitation;</li><li>blocking the entire sentence relationship.</li></ul>` },
      { title: '5. IELTS Transfer', html: `<p>In Reading, unknown vocabulary is normal. In Listening, a missed word is irreversible in Test Mode. In both cases, recovery matters more than perfect decoding.</p><div class="structure-box">Miss a word → keep direction → use evidence → recover at the next meaningful chunk</div>` },
      { title: '6. Repair & Retry', html: `<p>Choose one difficult paragraph from another lesson. Mark only the words that truly block the central meaning. Then reread without looking them up.</p>`, blocks: [{ type:'note', id:'LB02-note', label:'One word I can safely leave unresolved for now', placeholder:'Word + why it is not critical...' }] },
      { title: '7. Review', html: `<div class="callout success"><strong>I do not need every word. I need enough evidence to keep building the meaning.</strong></div>` }
    ]
  },
  {
    id: 'LB03', slug: 'mistakes-are-data', title: 'Mistakes Are Data',
    description: 'Turn wrong answers into a diagnosis, a repair action, and a scheduled retry instead of collecting scores.',
    skill: 'learning-better', subskill: 'error-analysis', lessonType: 'concept', cefr: 'B2', ieltsRange: '5.5–7.5', difficulty: 2, estimatedMinutes: 12,
    objective: 'Classify an error by cause and choose a repair action that targets the failed skill rather than merely rereading the answer.',
    prerequisites: ['LB01'], tags: ['errors', 'repair', 'review', 'metacognition'], ieltsSkill: 'all', questionType: 'learning-strategy', examRelevance: 'high', timed: false,
    errorTags: ['study-error-misclassification','study-answer-only-review','study-no-retry'], repairLessons: ['VG01','VG02','VG03'], relatedLessons: ['LB01','I03'], nextLessons: ['LB04'],
    chinese: '錯題的價值不在「知道正解」，而在找出失敗原因：看錯證據、被干擾項吸引、改寫沒認出、文法控制不足，然後安排針對性的 repair 與 retry。',
    sections: [
      { title:'Goal', html:`<p>By the end of this lesson, you will be able to turn a wrong answer into <strong>Error → Cause → Repair → Retry → Review</strong>.</p>` },
      { title:'1. Learn — Score is not diagnosis', html:`<div class="grid two"><div class="card subtle"><strong>Weak review</strong><p>Q17 wrong. Correct answer = C.</p></div><div class="card subtle"><strong>Useful review</strong><p>I chose B because it repeated the passage keyword. I did not compare the meaning. Error: paraphrase / keyword trap. Repair: R03. Retry in two days.</p></div></div>` },
      { title:'2. Common causes', html:`<ul><li>knowledge gap</li><li>paraphrase not recognised</li><li>main idea vs detail</li><li>distractor / change of mind</li><li>grammar or collocation control</li><li>time pressure</li><li>careless execution</li><li>strategy problem</li></ul>` },
      { title:'3. Guided Practice', blocks:[
        mcq('LB03-Q1','You chose a Listening option because the speaker mentioned it first, but later changed the decision. Best error label?',['Vocabulary gap','Distractor / correction pattern','Spelling only','Reading main idea'],'Distractor / correction pattern','The key failure was not following the speaker after the first plausible answer.','study-error-misclassification'),
        mcq('LB03-Q2','You know why an answer is wrong. What should happen next?',['Immediately do a completely different mock test','Retry a similar item after a targeted repair','Memorise the answer letter','Delete the error'],'Retry a similar item after a targeted repair','A diagnosis becomes learning only when it changes the next attempt.','study-no-retry')
      ] },
      { title:'4. Error quality check', html:`<p>A useful Error Notebook entry answers:</p><ol><li>What evidence decided the answer?</li><li>Why was my answer tempting?</li><li>What exact step failed?</li><li>What cue should I notice next time?</li><li>What should I retry?</li></ol>` },
      { title:'5. IELTS Transfer', html:`<p>After a mini-test, sort errors by <strong>question type + error type + cause</strong>. Three wrong questions can come from one underlying weakness; that is more useful than treating them as three unrelated mistakes.</p>` },
      { title:'6. Repair & Retry', blocks:[{ type:'note', id:'LB03-error', label:'Rewrite one recent error as a diagnosis', placeholder:'I chose... because... The failed step was... Next time I will...' }] },
      { title:'7. Review', html:`<div class="callout success">The goal is not to have fewer red marks in the notebook. The goal is to make <strong>old errors stop recurring</strong>.</div>` }
    ]
  },
  {
    id:'LB04', slug:'how-to-use-ai-without-letting-ai-do-the-learning', title:'How to Use AI Without Letting AI Do the Learning',
    description:'Use external AI as a coach for diagnosis, explanation, and retry while keeping the difficult thinking and rewriting work yours.',
    skill:'learning-better', subskill:'ai-learning', lessonType:'concept', cefr:'B2+', ieltsRange:'5.5–7.5', difficulty:3, estimatedMinutes:15,
    objective:'Use AI feedback in a sequence that preserves retrieval, self-correction, rewriting, and speaking retry.', prerequisites:['LB03'], tags:['ai','feedback','rewrite','retry'], ieltsSkill:'writing-speaking', questionType:'learning-strategy', examRelevance:'high', timed:false,
    errorTags:['study-ai-model-answer','study-ai-passive-feedback','study-ai-false-score'], repairLessons:['LB03'], relatedLessons:['W05','S04','S05'], nextLessons:['W05','S04'],
    chinese:'AI 最適合做教練，不是代寫者。先自己作答、自我檢查，再請 AI 找出優先問題；最後一定由自己重寫或重錄。',
    sections:[
      { title:'Goal', html:`<p>By the end of this lesson, you will be able to use AI in a <strong>attempt → feedback → revision → retry</strong> loop.</p>` },
      { title:'1. Learn — Keep the hard work', html:`<div class="structure-box">My attempt → self-check → targeted AI feedback → choose 2–3 priorities → revise myself → compare → retry</div><p>Asking for a perfect model answer first removes the retrieval and decision-making that create learning.</p>` },
      { title:'2. Better prompts', html:`<p>Ask AI to:</p><ul><li>identify the three highest-priority problems;</li><li>show short examples from your response;</li><li>explain why they are weak;</li><li>separate errors from optional style changes;</li><li>give a short repair exercise;</li><li>wait for your rewrite before showing a full model.</li></ul>` },
      { title:'3. Guided Practice', blocks:[
        mcq('LB04-Q1','Which request best supports learning?',['Write a Band 9 essay for me immediately.','Find my three biggest Task Response problems, explain them, then ask me to rewrite.','Replace every sentence with advanced vocabulary.','Give me an exact official band score.'],'Find my three biggest Task Response problems, explain them, then ask me to rewrite.','It preserves diagnosis and requires the learner to perform the revision.','study-ai-model-answer'),
        mcq('LB04-Q2','Why should text-only Speaking feedback avoid judging pronunciation?',['Pronunciation does not matter in IELTS','Text does not contain reliable audio evidence about stress, sounds, or intonation','Grammar is always more important','AI cannot discuss speaking at all'],'Text does not contain reliable audio evidence about stress, sounds, or intonation','Pronunciation requires audio evidence; a transcript can support language and answer-development feedback only.','study-ai-false-score')
      ] },
      { title:'4. Feedback triage', html:`<p>Do not try to apply 25 comments at once. Choose:</p><ol><li>one task/idea problem;</li><li>one organisation or fluency problem;</li><li>one recurring language problem.</li></ol>` },
      { title:'5. IELTS Transfer', html:`<p>The site intentionally copies prompts to an external LLM instead of pretending AI feedback is an official IELTS score. Treat any estimated range as uncertain learning feedback.</p>` },
      { title:'6. Repair & Retry', blocks:[{ type:'note', id:'LB04-rule', label:'My rule for using AI', placeholder:'I will ask AI to..., but I will still...' }] },
      { title:'7. Review', html:`<div class="callout success"><strong>AI should increase the quality of my next attempt, not eliminate the need for a next attempt.</strong></div>` }
    ]
  },
  {
    id:'W04', slug:'task-2-build-a-clear-position-in-five-minutes', title:'Task 2: Build a Clear Position in Five Minutes',
    description:'Plan a defensible Task 2 position quickly enough to protect writing time and keep the essay consistent.',
    skill:'writing', subskill:'planning-position', lessonType:'strategy', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:20,
    objective:'Extract the instruction, choose a precise position, and select two developable reasons within five minutes.', prerequisites:['W01','W02','W03'], tags:['task-2','planning','position','time-management'], ieltsSkill:'writing', questionType:'task-2', examRelevance:'high', timed:true,
    errorTags:['writing-position','writing-planning','writing-idea-selection','writing-task-response'], repairLessons:['W01','W02'], relatedLessons:['W01','W02','W03'], nextLessons:['W05'],
    chinese:'五分鐘規劃的目的不是寫完整大綱，而是鎖定題目要求、立場與兩個可發展理由，避免寫到一半改方向。',
    sections:[
      { title:'Goal', html:`<p>Build a usable Task 2 plan in <strong>five minutes</strong>: instruction → position → two reasons → one example/consequence for each.</p>` },
      { title:'1. Learn — A position must answer the instruction', html:`<p>For “To what extent do you agree?”, “this topic is complicated” is not a position. A position tells the reader <strong>how far</strong> you agree and where the limits are.</p>` },
      { title:'2. Notice — Precise beats extreme', html:`<div class="reading-passage"><p>Governments should make all city public transport free. To what extent do you agree or disagree?</p></div><div class="grid two"><div class="card subtle"><strong>Weak</strong><p>I completely agree because public transport is good.</p></div><div class="card subtle"><strong>Stronger</strong><p>I support lower fares and targeted free travel, but making every journey free is less important than improving frequency and reliability.</p></div></div>` },
      { title:'3. Guided Practice', blocks:[
        mcq('W04-Q1','Which is the clearest position for an “advantages outweigh disadvantages” task?',['There are many advantages and disadvantages.','The advantages are significant, particularly for access and cost, and they outweigh the main drawback of reduced face-to-face contact.','This issue is controversial nowadays.','Both sides are equally interesting.'],'The advantages are significant, particularly for access and cost, and they outweigh the main drawback of reduced face-to-face contact.','It makes the required comparison and gives the essay a clear direction.','writing-position'),
        mcq('W04-Q2','What makes a planning idea useful?',['It contains difficult vocabulary','It can be explained and linked directly to the position','It is the first idea you remember','It would fit any IELTS essay'],'It can be explained and linked directly to the position','A strong plan selects ideas for relevance and development, not sophistication or memorisability.','writing-idea-selection')
      ] },
      { title:'4. Five-minute planning drill', html:`<div class="reading-passage"><p>Some people think employers should allow staff to work a four-day week without reducing pay. To what extent do you agree or disagree?</p></div>`, blocks:[
        {type:'note',id:'W04-position',label:'0:00–1:00 — Position',placeholder:'I largely agree because...; however...'},
        {type:'note',id:'W04-reason1',label:'1:00–2:30 — Reason 1 + development',placeholder:'Reason → why → example/consequence'},
        {type:'note',id:'W04-reason2',label:'2:30–4:00 — Reason 2 / limitation',placeholder:'Reason or limitation → why'},
        {type:'note',id:'W04-check',label:'4:00–5:00 — Check',placeholder:'Does every paragraph support the position?'}
      ] },
      { title:'5. IELTS Transfer', html:`<div class="callout">Planning time is useful only if it reduces decision-making during writing. Do not spend ten minutes decorating a plan you will not follow.</div>` },
      { title:'6. Repair & Retry', html:`<p>If your position changes halfway through an essay, return to the instruction and rewrite the thesis in one plain sentence. Then test each body idea against that sentence.</p>` },
      { title:'7. Review', html:`<div class="callout success">A five-minute plan should make the next 35 minutes easier.</div>` }
    ]
  },
  {
    id:'W05', slug:'task-2-writing-workspace-opinion-essay', title:'Task 2 Writing Workspace: Opinion Essay',
    description:'Complete the full practice loop: plan, write, self-check, build an AI feedback prompt, revise, and record a retry priority.',
    skill:'writing', subskill:'task-2-opinion', lessonType:'guided-practice', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:55,
    objective:'Produce and revise a complete opinion essay using a controlled plan and the site’s portable feedback workflow.', prerequisites:['W01','W02','W03','W04'], tags:['task-2','opinion','workspace','revision','ai-feedback'], ieltsSkill:'writing', questionType:'task-2-opinion', examRelevance:'very-high', timed:true,
    errorTags:['writing-task-response','writing-position','writing-idea-development','writing-coherence','writing-collocation','writing-grammar'], repairLessons:['W01','W02','W03','VG01','VG02','VG03'], relatedLessons:['LB04','W04'], nextLessons:['I03'],
    chinese:'這是一堂完整 Task 2 工作區：先規劃，再完成全文，自我檢查後複製 AI feedback prompt，最後自己修訂，不直接用 model answer 取代學習。',
    sections:[
      { title:'Goal', html:`<p>Complete a full opinion-essay practice cycle and leave with <strong>a revised version plus one clear next priority</strong>.</p>` },
      { title:'1. Task', html:`<div class="reading-passage"><p><strong>Some people believe that universities should require all students to study at least one subject outside their main field. To what extent do you agree or disagree?</strong></p></div>` },
      { title:'2. Plan — Five minutes', blocks:[
        {type:'note',id:'W05-position',label:'Position',placeholder:'I largely/completely/partly agree because...'},
        {type:'note',id:'W05-body1',label:'Body 1 — main idea → reason → example/consequence',placeholder:'Main idea 1...'},
        {type:'note',id:'W05-body2',label:'Body 2 — main idea / limitation → development',placeholder:'Main idea 2...'}
      ] },
      { title:'3. Before you write', blocks:[
        mcq('W05-Q1','Which plan best answers the task?',['Discuss the history of universities and list many subjects.','Take a clear position on the requirement, then develop benefits and/or limits of studying outside the main field.','Explain why university is expensive.','Describe your own timetable only.'],'Take a clear position on the requirement, then develop benefits and/or limits of studying outside the main field.','The essay must evaluate whether the cross-field requirement should apply and maintain a clear extent of agreement.','writing-task-response'),
        mcq('W05-Q2','What should you do if one body idea does not support your thesis?',['Keep it because it is advanced','Replace or reframe it before writing the paragraph','Add more linking words','Move it to the introduction unchanged'],'Replace or reframe it before writing the paragraph','Relevance to the position matters more than keeping an interesting but disconnected idea.','writing-coherence')
      ] },
      { title:'4. Write — Practice Workspace', html:`<p>A full IELTS Task 2 response is normally at least 250 words. In this learning workspace, aim for a complete essay and protect time for review.</p>`, blocks:[{type:'writing',id:'W05-draft',promptType:'writing-task2-feedback',task:'Some people believe that universities should require all students to study at least one subject outside their main field. To what extent do you agree or disagree?',minWords:250,maxWords:380}] },
      { title:'5. Self-check before AI', html:`<div class="checklist"><label class="check-item"><input type="checkbox"> I answered the exact instruction and maintained one position.</label><label class="check-item"><input type="checkbox"> Each body paragraph has one clear purpose.</label><label class="check-item"><input type="checkbox"> I explained why each idea matters.</label><label class="check-item"><input type="checkbox"> Examples support rather than replace explanation.</label><label class="check-item"><input type="checkbox"> I checked recurring article, agreement, and sentence-boundary errors.</label></div>` },
      { title:'6. AI Feedback → Revision', html:`<p>Use <strong>Copy AI Feedback Prompt</strong> only after self-check. Ask for three priorities first. Then revise your own essay before requesting a complete model.</p>`, blocks:[{type:'note',id:'W05-revision',label:'After feedback: my three revision priorities',placeholder:'1... 2... 3...'}] },
      { title:'7. Review', html:`<div class="callout success">Your useful output is not the first draft or the AI response. It is the <strong>better second draft</strong> and the error pattern you can recognise next time.</div>` }
    ]
  },
  {
    id:'S02', slug:'fluency-does-not-mean-speaking-fast', title:'Fluency Does Not Mean Speaking Fast',
    description:'Build understandable flow with thought groups, useful pauses, and controlled self-correction rather than rushing.',
    skill:'speaking', subskill:'fluency-control', lessonType:'skill', cefr:'B2', ieltsRange:'5.5–7.0', difficulty:3, estimatedMinutes:18,
    objective:'Speak in meaningful chunks with controlled pauses and continue after minor errors instead of accelerating or freezing.', prerequisites:['S01'], tags:['fluency','pausing','chunking','self-correction'], ieltsSkill:'speaking', questionType:'part-1', examRelevance:'high', timed:false,
    errorTags:['speaking-speed','speaking-hesitation','speaking-overcorrection'], repairLessons:['S01'], relatedLessons:['S03'], nextLessons:['S03'],
    chinese:'流暢不是越快越好。重點是以有意義的語塊往前說，允許自然停頓，小錯誤可簡短修正後繼續，不要反覆從頭開始。',
    sections:[
      {title:'Goal',html:`<p>Speak with a pace that lets the listener follow your ideas. Use pauses <strong>between chunks</strong>, not inside every phrase.</p>`},
      {title:'1. Learn — Three fluency controls',html:`<ul><li><strong>Chunk:</strong> group words that belong together.</li><li><strong>Pause:</strong> pause before a new idea, reason, or example.</li><li><strong>Repair lightly:</strong> correct a mistake once and keep going.</li></ul>`},
      {title:'2. Notice',html:`<div class="structure-box">I prefer studying in the morning / because I can concentrate more easily. / If I leave it until late evening, / I usually feel too tired.</div><p>The slashes show thought groups, not mandatory pauses.</p>`},
      {title:'3. Guided Practice',blocks:[mcq('S02-Q1','Which behaviour best supports fluency?',['Speaking as fast as possible','Pausing briefly before a new idea and continuing after a small error','Restarting every sentence after a grammar mistake','Avoiding all pauses'],'Pausing briefly before a new idea and continuing after a small error','Fluency includes continuity and comprehensible organisation, not maximum speed.','speaking-speed'),mcq('S02-Q2','You say “I go—went there last year.” Best next move?',['Restart the answer from the beginning','Continue with the next idea','Apologise for the error','Stop speaking'],'Continue with the next idea','A short self-correction is enough; repeated restarting damages flow more than the original minor error.','speaking-overcorrection')]},
      {title:'4. 45-second drill',blocks:[{type:'recorder',id:'S02-record1',question:'Do you prefer working alone or with other people?',promptType:'speaking-transcript-feedback'}]},
      {title:'5. Playback check',html:`<ol><li>Did I rush the beginning?</li><li>Were pauses mostly between ideas?</li><li>Did I restart unnecessarily?</li><li>Could a listener identify my reason and example?</li></ol>`},
      {title:'6. Repair & Retry',html:`<p>Retry the same answer about 10% slower. Do not add more content; improve chunking and continuity.</p>`,blocks:[{type:'recorder',id:'S02-record2',question:'Do you prefer working alone or with other people? Retry with clearer chunks.',promptType:'speaking-transcript-feedback'}]},
      {title:'7. Review',html:`<div class="callout success"><strong>Fluent speech moves forward clearly. It does not need to move forward quickly.</strong></div>`}
    ]
  },
  {
    id:'S03', slug:'stop-restarting-your-sentences', title:'Stop Restarting Your Sentences',
    description:'Keep an answer moving when wording is imperfect by repairing locally instead of abandoning the whole sentence.',
    skill:'speaking', subskill:'continuity', lessonType:'drill', cefr:'B2+', ieltsRange:'6.0–7.0', difficulty:3, estimatedMinutes:15,
    objective:'Recover from lexical or grammatical difficulty using local repair, simpler wording, or a brief rephrase without restarting the answer.', prerequisites:['S01','S02'], tags:['fluency','repair','rephrasing','continuity'], ieltsSkill:'speaking', questionType:'fluency-drill', examRelevance:'high', timed:false,
    errorTags:['speaking-restart','speaking-word-search','speaking-overcorrection'], repairLessons:['S02','VG03'], relatedLessons:['S02','S04'], nextLessons:['S04'],
    chinese:'卡住時不要整句重來。可以局部修正、換簡單字、用「what I mean is...」重新表達，然後繼續下一個意思。',
    sections:[
      {title:'Goal',html:`<p>Recover inside the sentence and continue the answer without repeatedly going back to the beginning.</p>`},
      {title:'1. Learn — Local repair',html:`<div class="grid two"><div class="card subtle"><strong>Restart loop</strong><p>I think the main... I think the main reason... I think... sorry...</p></div><div class="card subtle"><strong>Local repair</strong><p>I think the main reason is cost—or more specifically, the cost of travelling every day.</p></div></div>`},
      {title:'2. Useful recovery language',html:`<p>Natural options include: <strong>or rather...</strong> · <strong>what I mean is...</strong> · <strong>to put it another way...</strong> · or simply replace the difficult word with an easier one.</p>`},
      {title:'3. Guided Practice',blocks:[mcq('S03-Q1','You cannot remember the word “congestion”. Best response?',['Stop until you remember it','Say “too many cars and very slow traffic” and continue','Restart the answer','Use an unrelated advanced word'],'Say “too many cars and very slow traffic” and continue','Paraphrasing preserves meaning and flow; exact lexical retrieval is not always necessary.','speaking-word-search'),mcq('S03-Q2','Which repair sounds most natural?',['It was expensive. I restart. It was expensive.','It was expensive—or rather, more expensive than I expected.','Sorry sorry sorry, expensive.','In contemporary society expense is expense.'],'It was expensive—or rather, more expensive than I expected.','It corrects or refines locally without breaking the answer.','speaking-restart')]},
      {title:'4. No-restart drill',html:`<p>Rule: you may correct yourself, but you may not restart from sentence one.</p>`,blocks:[{type:'recorder',id:'S03-record1',question:'Describe a time when a plan did not work as expected.',promptType:'speaking-transcript-feedback'}]},
      {title:'5. Playback check',html:`<p>Count only major restarts. If you made one, identify what triggered it: grammar, vocabulary, idea search, or anxiety about sounding perfect.</p>`},
      {title:'6. Repair & Retry',blocks:[{type:'note',id:'S03-trigger',label:'My most common restart trigger',placeholder:'I restart when... Next time I will...'}, {type:'recorder',id:'S03-record2',question:'Describe a time when a plan did not work as expected. Retry without restarting.',promptType:'speaking-transcript-feedback'}]},
      {title:'7. Review',html:`<div class="callout success">A simpler sentence that continues is usually better than an “advanced” sentence you keep abandoning.</div>`}
    ]
  },
  {
    id:'S04', slug:'speaking-part-2-build-a-two-minute-answer', title:'Speaking Part 2: Build a Two-Minute Answer',
    description:'Use the preparation minute to build a simple route through the cue card, then speak by ideas rather than memorised sentences.',
    skill:'speaking', subskill:'part-2-development', lessonType:'question-type', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:25,
    objective:'Plan and deliver an extended Part 2 response using a flexible idea route, specific detail, and recovery strategies.', prerequisites:['S01','S02','S03'], tags:['part-2','cue-card','planning','two-minutes'], ieltsSkill:'speaking', questionType:'part-2', examRelevance:'very-high', timed:true,
    errorTags:['speaking-part2-short','speaking-answer-development','speaking-memorised','speaking-restart'], repairLessons:['S01','S02','S03'], relatedLessons:['LB04','S05'], nextLessons:['S05'],
    chinese:'Part 2 準備時間不要寫完整句。只寫幾個內容節點：人物／情境、發生什麼、細節、為什麼重要，再沿著節點自然延伸。',
    sections:[
      {title:'Goal',html:`<p>Use a small cue-card map to sustain an answer without memorising a speech.</p>`},
      {title:'1. Cue card',html:`<div class="reading-passage"><p><strong>Describe a useful skill you learned from another person.</strong></p><p>You should say: what the skill was · who taught you · how you learned it · and explain why it has been useful.</p></div>`},
      {title:'2. Prepare — Notes, not sentences',html:`<div class="structure-box">skill: cooking 3 basic meals → person: older sister → method: weekend practice / mistakes → useful: independence / save money / healthier</div><p>These are navigation points. You do not need to cover them in a fixed order.</p>`},
      {title:'3. Guided Practice',blocks:[mcq('S04-Q1','Which preparation note is most useful?',['Write a complete memorised introduction','3–5 idea keywords plus one or two concrete details','List ten advanced adjectives','Write every grammar structure you want to use'],'3–5 idea keywords plus one or two concrete details','Part 2 notes should reduce idea-search pressure without turning the answer into reading or memorisation.','speaking-memorised'),mcq('S04-Q2','Your answer reaches 70 seconds and you are running out of ideas. What is a useful extension?',['Repeat the introduction','Add a specific example, consequence, comparison, or reflection','Speak faster','Invent unrelated vocabulary'],'Add a specific example, consequence, comparison, or reflection','A concrete extension develops the same topic instead of padding or repeating.','speaking-part2-short')]},
      {title:'4. Attempt 1',blocks:[{type:'note',id:'S04-plan',label:'One-minute plan — keywords only',placeholder:'skill → person → process → detail → value'}, {type:'recorder',id:'S04-record1',question:'Describe a useful skill you learned from another person.',promptType:'speaking-transcript-feedback'}]},
      {title:'5. Playback + AI',html:`<ol><li>Where did the answer become thin?</li><li>Did I give specific details?</li><li>Did I repeat wording?</li><li>Did I recover after hesitation?</li></ol><p>Use transcript feedback for development, vocabulary, grammar, and coherence. Do not ask text-only feedback to judge pronunciation.</p>`},
      {title:'6. Retry challenge',html:`<p>Retry with one change only: add a concrete moment, explain one consequence, or compare before/after.</p>`,blocks:[{type:'recorder',id:'S04-record2',question:'Describe a useful skill you learned from another person. Retry with one stronger development move.',promptType:'speaking-transcript-feedback'}]},
      {title:'7. Review',html:`<div class="callout success">Part 2 length comes from <strong>developing connected details</strong>, not from filling time with memorised phrases.</div>`}
    ]
  },
  {
    id:'S05', slug:'speaking-part-3-explain-compare-and-speculate', title:'Speaking Part 3: Explain, Compare and Speculate',
    description:'Move from personal answers to broader discussion by giving reasons, comparing groups or periods, and making qualified predictions.',
    skill:'speaking', subskill:'part-3-abstract', lessonType:'question-type', cefr:'B2+/C1-', ieltsRange:'6.5–7.5', difficulty:4, estimatedMinutes:25,
    objective:'Develop Part 3 answers using a position, explanation, comparison/example, and appropriate qualification.', prerequisites:['S01','S02','S04'], tags:['part-3','abstract','comparison','speculation'], ieltsSkill:'speaking', questionType:'part-3', examRelevance:'very-high', timed:false,
    errorTags:['speaking-part3-personal-only','speaking-speculation','speaking-overgeneralisation','speaking-answer-development'], repairLessons:['S01','VG03'], relatedLessons:['S04','W02'], nextLessons:['I02'],
    chinese:'Part 3 要從個人經驗上升到較廣泛的分析。先回答，再解釋原因，可加入群體／時代比較、例子或推測，並用 may、tend to、in many cases 等避免過度絕對。',
    sections:[
      {title:'Goal',html:`<p>Build a Part 3 answer as <strong>position → reason → explanation → comparison/example → qualification</strong>.</p>`},
      {title:'1. Learn — Move beyond “for me”',html:`<p><strong>Question:</strong> Why do some adults stop learning new skills?</p><p><strong>Too personal:</strong> I am busy, so I do not learn much.</p><p><strong>Broader:</strong> One reason is time pressure. Adults often combine work and family responsibilities, so optional learning is easy to postpone even when they are interested.</p>`},
      {title:'2. Three development moves',html:`<ul><li><strong>Compare:</strong> younger vs older people, past vs present, cities vs rural areas.</li><li><strong>Speculate:</strong> may, might, could, is likely to.</li><li><strong>Qualify:</strong> generally, in many cases, for some people, this depends on.</li></ul>`},
      {title:'3. Guided Practice',blocks:[mcq('S05-Q1','Which answer best avoids overgeneralisation?',['Technology always makes everyone isolated.','Technology can reduce face-to-face contact in some situations, although it also helps people maintain long-distance relationships.','Technology is bad.','All young people prefer online communication.'],'Technology can reduce face-to-face contact in some situations, although it also helps people maintain long-distance relationships.','It makes a defensible claim and qualifies it with conditions and contrast.','speaking-overgeneralisation'),mcq('S05-Q2','Which phrase is most useful for speculation?',['It is a fact that every person will...','One possible reason may be...','I absolutely know the future will...','There is no doubt in all cases...'],'One possible reason may be...','The phrase signals a reasoned possibility rather than an unsupported certainty.','speaking-speculation')]},
      {title:'4. Part 3 drill',blocks:[{type:'recorder',id:'S05-record1',question:'Do you think people will need to change careers more often in the future? Why or why not?',promptType:'speaking-transcript-feedback'}]},
      {title:'5. Development check',html:`<p>Mark where your answer contains: position · reason · explanation · example/comparison · qualification. You do not need all five every time, but a one-line opinion is rarely enough.</p>`},
      {title:'6. Repair & Retry',blocks:[{type:'note',id:'S05-expand',label:'One place where I can broaden the answer',placeholder:'Instead of only saying “I...”, I can discuss...'}, {type:'recorder',id:'S05-record2',question:'Should governments encourage adults to continue formal education throughout their careers?',promptType:'speaking-transcript-feedback'}]},
      {title:'7. Review',html:`<div class="callout success">Part 3 rewards the ability to <strong>develop and qualify ideas</strong>, not merely to state opinions quickly.</div>`}
    ]
  },
  {
    id:'I01', slug:'understand-ielts-academic-before-you-start-practising', title:'Understand IELTS Academic Before You Start Practising',
    description:'Build a practical map of the four skills, practice modes, and what each part of preparation is meant to train.',
    skill:'ielts-strategy', subskill:'test-overview', lessonType:'strategy', cefr:'B2', ieltsRange:'5.5–7.5', difficulty:2, estimatedMinutes:15,
    objective:'Distinguish English-skill development, IELTS question-type training, timed practice, and full mock testing so that each study activity has a clear purpose.', prerequisites:['LB01'], tags:['ielts-overview','test-structure','preparation'], ieltsSkill:'all', questionType:'test-guide', examRelevance:'very-high', timed:false,
    errorTags:['ielts-mode-confusion','ielts-mock-overuse','ielts-skill-confusion'], repairLessons:['LB01'], relatedLessons:['LB01','I03'], nextLessons:['I02'],
    chinese:'先知道自己在練什麼：英文能力、題型、計時或完整模考不是同一件事。IELTS Academic 包含 Listening、Reading、Writing、Speaking；本站把能力訓練與考試模擬分開。',
    sections:[
      {title:'Goal',html:`<p>Choose the right preparation mode instead of treating every activity as a mock test.</p>`},
      {title:'1. The four skills',html:`<div class="grid two"><div class="card subtle"><strong>Listening + Reading</strong><p>Objective answers can diagnose question types, evidence use, distractors, paraphrases, and timing.</p></div><div class="card subtle"><strong>Writing + Speaking</strong><p>Performance also depends on development, organisation, language control, and—when audio is available—spoken delivery.</p></div></div>`},
      {title:'2. Four preparation layers',html:`<ol><li>English skill development</li><li>IELTS question-type practice</li><li>timed mini practice</li><li>full mock measurement</li></ol><p>Move between them based on evidence rather than following a rigid Lesson 1 → Lesson 100 sequence.</p>`},
      {title:'3. Guided Practice',blocks:[mcq('I01-Q1','You keep missing True/False/Not Given because you use outside knowledge. Best next step?',['Do another full mock immediately','Repair evidence-based T/F/NG decisions in R04','Memorise more unrelated facts','Only practise Speaking'],'Repair evidence-based T/F/NG decisions in R04','The error already identifies a specific Reading decision rule, so targeted repair is more efficient than another full test.','ielts-mode-confusion'),mcq('I01-Q2','What is the main purpose of a full mock?',['Teach every new language skill','Measure integrated performance under exam-like conditions','Replace error review','Generate an exact future official score'],'Measure integrated performance under exam-like conditions','A mock is primarily a measurement tool; learning happens when the result drives targeted review and repair.','ielts-mock-overuse')]},
      {title:'4. Build your preparation map',html:`<div class="structure-box">Diagnose → skill lesson → question type → timed practice → review → repair → retry → later mock</div>`},
      {title:'5. IELTS Transfer',html:`<p>Use official-format timing and restrictions in Test Mode, but allow replay, transcript, evidence, and hints in Practice Mode. Mixing the two modes makes both less useful.</p>`},
      {title:'6. Personal decision',blocks:[{type:'note',id:'I01-next',label:'Which preparation layer do I currently overuse?',placeholder:'I overuse... I should add more...'}]},
      {title:'7. Review',html:`<div class="callout success">IELTS is the destination. Your preparation still needs deliberate English learning between tests.</div>`}
    ]
  },
  {
    id:'I02', slug:'how-to-move-from-band-6-toward-band-7', title:'How to Move from Band 6 Toward Band 7',
    description:'Replace “do more questions” with a deliberate improvement plan built around accuracy, development, flexibility, and recurring errors.',
    skill:'ielts-strategy', subskill:'band-progression', lessonType:'strategy', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:18,
    objective:'Identify plateau patterns and choose a specific improvement target instead of relying on volume of practice alone.', prerequisites:['I01','LB03'], tags:['plateau','band-6','band-7','deliberate-practice'], ieltsSkill:'all', questionType:'strategy', examRelevance:'very-high', timed:false,
    errorTags:['ielts-plateau-volume','ielts-vague-goal','ielts-score-chasing'], repairLessons:['LB03'], relatedLessons:['LB03','I03'], nextLessons:['I03'],
    chinese:'從 6 往 7 常不是「再多刷幾回」。需要把模糊目標拆成可觀察的能力：閱讀證據更準、聽力不追第一個答案、寫作想法發展更完整、口說回答更能延伸與修正。',
    sections:[
      {title:'Goal',html:`<p>Turn “I need Band 7” into a small set of trainable behaviours.</p>`},
      {title:'1. Plateau pattern',html:`<div class="structure-box">mock → score → frustration → more mock → same errors → same score</div><p>Volume can improve familiarity, but repeated unanalysed performance does not guarantee skill change.</p>`},
      {title:'2. Four upgrade dimensions',html:`<ul><li><strong>Accuracy:</strong> fewer evidence, distractor, grammar, and collocation errors.</li><li><strong>Development:</strong> explain ideas instead of naming them.</li><li><strong>Flexibility:</strong> handle paraphrases, unfamiliar topics, and varied language.</li><li><strong>Consistency:</strong> reduce recurring mistakes under time pressure.</li></ul>`},
      {title:'3. Guided Practice',blocks:[mcq('I02-Q1','A learner repeatedly scores similarly and keeps missing Listening corrections after “but”. Best priority?',['Complete three more full tests this week','Train distractor/change-of-mind patterns and review the same error type','Learn rare idioms','Change target band every day'],'Train distractor/change-of-mind patterns and review the same error type','The recurring pattern provides a specific repair target; more full tests would mostly remeasure it.','ielts-plateau-volume'),mcq('I02-Q2','Which goal is most trainable?',['Improve English a lot','Get Band 7 somehow','In Task 2, develop each main idea with a reason and explanation before adding an example','Use harder words everywhere'],'In Task 2, develop each main idea with a reason and explanation before adding an example','It describes an observable behaviour that can be practised, checked, and retried.','ielts-vague-goal')]},
      {title:'4. Build one-week priorities',blocks:[{type:'note',id:'I02-priority1',label:'Priority 1 — recurring error pattern',placeholder:'Skill → error → repair lesson'}, {type:'note',id:'I02-priority2',label:'Priority 2 — output behaviour',placeholder:'Writing/Speaking behaviour I will practise...'}]},
      {title:'5. IELTS Transfer',html:`<p>Do not interpret every practice score as a precise band prediction. Look for repeated evidence across tasks and use score changes together with error quality and successful retries.</p>`},
      {title:'6. Repair & Retry',html:`<p>Choose one old error pattern and complete: <strong>recognise → explain → retry → review later</strong>. Count the pattern as improved only when the old mistake stops recurring.</p>`},
      {title:'7. Review',html:`<div class="callout success">Moving upward means changing performance patterns, not only increasing practice volume.</div>`}
    ]
  },
  {
    id:'I03', slug:'how-to-review-an-ielts-practice-test', title:'How to Review an IELTS Practice Test',
    description:'Convert a score report into question-type, error-type, cause, repair, and retry decisions that feed the adaptive learning system.',
    skill:'ielts-strategy', subskill:'test-review', lessonType:'strategy', cefr:'B2+', ieltsRange:'5.5–7.5', difficulty:3, estimatedMinutes:18,
    objective:'Review a practice test systematically so that every important error creates a next action instead of ending at the answer key.', prerequisites:['LB03','I01'], tags:['test-review','error-analysis','repair','retry'], ieltsSkill:'all', questionType:'review-strategy', examRelevance:'very-high', timed:false,
    errorTags:['ielts-answer-key-only','ielts-error-cause','ielts-no-retry'], repairLessons:['LB03'], relatedLessons:['LB03','I02'], nextLessons:[],
    chinese:'做完練習後不要只看總分。逐步記錄：題型 → 錯誤類型 → 原因 → repair → retry → 延後複習，讓測驗結果真的改變後續學習。',
    sections:[
      {title:'Goal',html:`<p>Turn a practice result into a concrete learning queue.</p>`},
      {title:'1. Review pipeline',html:`<div class="structure-box">Score → Question type → Error type → Cause → Repair → Retry → Review</div>`},
      {title:'2. What to record',html:`<ul><li>question and your answer;</li><li>correct answer and decisive evidence;</li><li>why your answer was tempting;</li><li>error tag;</li><li>next repair lesson;</li><li>retry date / review rating.</li></ul>`},
      {title:'3. Guided Practice',blocks:[mcq('I03-Q1','You got 30/40 in Reading. What is the most useful next question?',['Is 30 a good number?','Which question types and error causes produced the 10 misses?','Can I memorise the answer key?','Should I ignore correct answers forever?'],'Which question types and error causes produced the 10 misses?','The total score shows performance level, but error clusters identify trainable causes.','ielts-answer-key-only'),mcq('I03-Q2','Three wrong items come from the same “main idea vs detail” mistake. Best action?',['Treat them as three unrelated accidents','Prioritise one main-idea repair lesson and retry similar items','Only review spelling','Delete two errors'],'Prioritise one main-idea repair lesson and retry similar items','Repeated errors usually provide stronger evidence of one underlying weakness than isolated mistakes.','ielts-error-cause')]},
      {title:'4. Review correct guesses too',html:`<p>A correct answer with weak reasoning can still be unstable. Flag items you guessed, were unsure about, or solved with the wrong evidence, even if the answer happened to be correct.</p>`},
      {title:'5. IELTS Transfer',html:`<p>After a timed test, separate <strong>performance review</strong> from <strong>repair practice</strong>. First diagnose the result; then remove time pressure while rebuilding the weak skill; later retest under time.</p>`},
      {title:'6. Build one review entry',blocks:[{type:'note',id:'I03-entry',label:'Practice-test review entry',placeholder:'Question type → my answer → evidence → cause → repair → retry date'}]},
      {title:'7. Review',html:`<div class="callout success">A practice test is complete only when its important errors have produced a learning decision.</div>`}
    ]
  }
];

export const BATCH_02_META = CURRICULUM_BATCH_02.map(lesson => ({
  id: lesson.id,
  title: lesson.title,
  skill: lesson.skill,
  difficulty: lesson.difficulty,
  estimatedMinutes: lesson.estimatedMinutes,
  targetRelevance: lesson.skill === 'ielts-strategy' ? 0.95 : lesson.skill === 'writing' || lesson.skill === 'speaking' ? 1 : 0.65
}));

export const BATCH_02_VOCABULARY = [
  { id:'v-tolerate-ambiguity', term:'tolerate ambiguity', meaning:'to continue working effectively when some information is uncertain or unknown', sourceLesson:'LB02', sourceSkill:'learning-better', collocations:['tolerate ambiguity','deal with ambiguity','ambiguous information'], prompt:'Strong readers learn to ______ instead of stopping at every unknown word.', answer:'tolerate ambiguity', distractors:['translate ambiguity','avoid every ambiguity'] },
  { id:'v-underlying-cause', term:'underlying cause', meaning:'the deeper reason that produces a visible problem or error', sourceLesson:'LB03', sourceSkill:'learning-better', collocations:['identify the underlying cause','underlying problem','root cause'], prompt:'Error analysis should identify the ______ rather than only record the wrong answer.', answer:'underlying cause', distractors:['final score','answer letter'] },
  { id:'v-clear-position', term:'maintain a clear position', meaning:'to keep a consistent and understandable viewpoint throughout a response', sourceLesson:'W04', sourceSkill:'writing', collocations:['maintain a clear position','state a position','support a position'], prompt:'In Task 2, the essay should ______ from introduction to conclusion.', answer:'maintain a clear position', distractors:['memorise a clear position','decorate a clear position'] },
  { id:'v-outweigh-drawback', term:'outweigh the drawback', meaning:'to be more important or beneficial than a disadvantage', sourceLesson:'W04', sourceSkill:'writing', collocations:['outweigh the drawbacks','benefits outweigh costs','advantages outweigh disadvantages'], prompt:'If the benefits are substantially greater, they may ______.', answer:'outweigh the drawback', distractors:['overweight the drawback','outweigh than the drawback'] },
  { id:'v-recurring-error', term:'recurring error', meaning:'a mistake that appears repeatedly across attempts', sourceLesson:'I02', sourceSkill:'ielts-strategy', collocations:['recurring error','recurring pattern','reduce recurring mistakes'], prompt:'A plateau often becomes visible when the same ______ appears across several tests.', answer:'recurring error', distractors:['official score','rare synonym'] },
  { id:'v-qualified-claim', term:'qualified claim', meaning:'a statement limited by conditions rather than presented as universally true', sourceLesson:'S05', sourceSkill:'speaking', collocations:['make a qualified claim','qualify a claim','carefully qualified'], prompt:'Using “in many cases” can turn an absolute statement into a more ______.', answer:'qualified claim', distractors:['memorised claim','rapid claim'] },
  { id:'v-speculate-about', term:'speculate about', meaning:'to discuss a possible explanation or future outcome without claiming certainty', sourceLesson:'S05', sourceSkill:'speaking', collocations:['speculate about the future','reasonable speculation','speculate that'], prompt:'Part 3 may ask you to ______ future social changes.', answer:'speculate about', distractors:['guarantee about','memorise about'] },
  { id:'v-practice-under-time-pressure', term:'under time pressure', meaning:'while having limited time to complete a task', sourceLesson:'I03', sourceSkill:'ielts-strategy', collocations:['work under time pressure','perform under pressure','time-pressure error'], prompt:'Timed practice tests whether a repaired skill still works ______.', answer:'under time pressure', distractors:['under a timetable word','inside time pressure'] }
];

for (const lesson of CURRICULUM_BATCH_02) if (!LESSONS.some(existing => existing.id === lesson.id)) LESSONS.push(lesson);
for (const meta of BATCH_02_META) if (!CORE_LESSON_META.some(existing => existing.id === meta.id)) CORE_LESSON_META.push(meta);
for (const item of BATCH_02_VOCABULARY) if (!VOCABULARY_ITEMS.some(existing => existing.id === item.id)) VOCABULARY_ITEMS.push(item);
