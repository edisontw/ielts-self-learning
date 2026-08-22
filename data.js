export const NAV = [
  { id: 'today', label: 'Today', icon: '●' },
  { id: 'learn', label: 'Learn', icon: '◫' },
  { id: 'ielts', label: 'IELTS', icon: '◎' },
  { id: 'improve', label: 'Improve', icon: '↗' },
  { id: 'progress', label: 'Progress', icon: '▥' },
];

export const SKILL_META = {
  'learning-better': { label: 'Learning Better', icon: 'LB', group: 'Learning Better' },
  reading: { label: 'Reading', icon: 'R', group: 'English Skills' },
  listening: { label: 'Listening', icon: 'L', group: 'English Skills' },
  writing: { label: 'Writing', icon: 'W', group: 'English Skills' },
  speaking: { label: 'Speaking', icon: 'S', group: 'English Skills' },
  vocabulary: { label: 'Vocabulary', icon: 'V', group: 'Language System' },
  grammar: { label: 'Grammar', icon: 'G', group: 'Language System' },
};

const mcq = (id, prompt, options, answer, rationale, errorTag) => ({
  type: 'quiz', id, prompt, options, answer, rationale, errorTag
});

export const LESSONS = [
  {
    id: 'LB01',
    slug: 'practice-is-not-the-same-as-testing',
    title: 'Practice Is Not the Same as Testing',
    description: 'Learn when to measure your performance and when to slow down, inspect errors, and deliberately improve.',
    skill: 'learning-better', subskill: 'deliberate-practice', lessonType: 'concept',
    cefr: 'B1+/B2', ieltsRange: '5.5–7.5', difficulty: 2, estimatedMinutes: 15,
    objective: 'Distinguish learning practice from performance testing and choose the right mode for a study goal.',
    chinese: '測驗用來量測目前表現；練習則允許提示、回看、分析與重試。兩者都重要，但用途不同。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to decide whether a study activity should be <strong>practice mode</strong> or <strong>test mode</strong>.</p><div class="callout"><strong>Testing tells you what you can do now. Practice changes what you can do next.</strong></div>` },
      { title: '1. Learn — Two different jobs', html: `<div class="grid two"><div><h3>Test mode</h3><p><strong>What can I do under exam-like conditions?</strong></p><ul><li>timer</li><li>no transcript</li><li>no hints</li><li>one attempt</li><li>score at the end</li><li>limited pausing</li></ul><p class="muted">Useful for baselines, timing practice, progress checks and exam familiarity.</p></div><div><h3>Practice mode</h3><p><strong>What can I change in my performance?</strong></p><ul><li>pause and replay</li><li>examples and hints</li><li>answer explanations</li><li>transcript or evidence</li><li>retry after feedback</li></ul><p class="muted">Useful for new strategies, error repair, language development and deliberate repetition.</p></div></div>` },
      { title: '2. Notice — Same task, different mode', html: `<p>Imagine a Listening question.</p><div class="grid two"><div class="card subtle"><strong>Test mode</strong><ol><li>Listen once.</li><li>Choose an answer.</li><li>Move on.</li></ol></div><div class="card subtle"><strong>Practice mode</strong><ol><li>Listen once for meaning.</li><li>Answer.</li><li>Replay the difficult sentence.</li><li>Read the transcript.</li><li>Identify the distractor.</li><li>Listen again.</li><li>Retry.</li></ol></div></div><p>The first measures performance. The second builds the skill.</p>` },
      { title: '3. Guided Practice', blocks: [
        mcq('LB01-Q1', 'You want to know whether you can finish an Academic Reading passage within 20 minutes.', ['PRACTICE', 'TEST'], 'TEST', 'Your main question is about performance under time pressure.', 'study-testing-too-often'),
        mcq('LB01-Q2', 'You keep choosing the wrong option in Listening multiple-choice questions because you follow the first option mentioned.', ['PRACTICE', 'TEST'], 'PRACTICE', 'You need to study distractor patterns, inspect evidence, and retry.', 'study-no-feedback'),
        mcq('LB01-Q3', 'You have learned a paragraph structure and want to use it in a new Task 2 response with no hints. What is the best sequence?', ['TEST only', 'PRACTICE first, then TEST later', 'Memorise a model answer'], 'PRACTICE first, then TEST later', 'Removing hints is useful, but you can still review and rewrite before later testing under full exam conditions.', 'study-no-retry'),
      ] },
      { title: '4. Independent Practice', blocks: [
        mcq('LB01-Q4', 'Full 60-minute Writing session, no help, one submission. What is the main purpose?', ['Learn a new structure', 'Check current performance', 'Memorize vocabulary'], 'Check current performance', 'A full timed, unsupported attempt is mainly measurement.', 'study-testing-too-often'),
        mcq('LB01-Q5', 'Replay a 12-second audio segment until you can hear the reduced words. What is the main purpose?', ['Check current performance', 'Build listening perception', 'Predict an IELTS score'], 'Build listening perception', 'Repeated focused replay is deliberate skill-building.', 'study-no-feedback'),
        mcq('LB01-Q6', 'Complete a Reading mini-test today and repeat difficult items two days later after reviewing errors. What is this?', ['Only testing', 'Testing followed by practice', 'Only vocabulary study'], 'Testing followed by practice', 'The first attempt measures; review and retry turn the result into learning.', 'study-no-retry'),
      ] },
      { title: '5. IELTS Transfer', html: `<p>A common plateau pattern is:</p><div class="structure-box">Mock test → score → another mock test → score → another mock test</div><p>A stronger loop is:</p><div class="structure-box">Timed test → classify errors → repair weakest pattern → retry similar questions → test again later</div><p>A mock test is valuable when it produces a learning decision.</p>` },
      { title: '6. Make It Personal', html: `<p>Write two short notes. They are saved locally.</p>`, blocks: [
        { type: 'note', id: 'LB01-note1', label: 'One thing I currently test too often', placeholder: 'e.g. I test Reading speed too often.' },
        { type: 'note', id: 'LB01-note2', label: 'One thing I should practise more deliberately', placeholder: 'e.g. I should practise paraphrase recognition.' },
      ] },
      { title: '7. Review', html: `<ol><li><strong>Test mode = measure.</strong></li><li><strong>Practice mode = change.</strong></li><li>A useful study cycle usually contains both.</li><li>After a test, use the errors before jumping to the next test.</li></ol><div class="callout success">One-sentence recall: <strong>Testing tells me what I can do now; practice helps me improve what I can do next.</strong></div>` },
    ]
  },
  {
    id: 'R01', slug: 'find-the-main-idea-without-translating-everything',
    title: 'Find the Main Idea Without Translating Everything',
    description: 'Separate a paragraph’s central purpose from examples, mechanisms, and supporting details.',
    skill: 'reading', subskill: 'main-idea', lessonType: 'skill', cefr: 'B2', ieltsRange: '5.5–6.5', difficulty: 3, estimatedMinutes: 18,
    objective: "Identify a paragraph's main idea by separating its central claim from examples, reasons, and details.",
    chinese: '主旨不是「資訊最多的句子」。閱讀時先問這段為什麼存在，再判斷哪些內容只是例子、原因或細節。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to identify a paragraph's main idea <strong>without understanding every word</strong>.</p>` },
      { title: '1. Learn — Main idea is not “the sentence with the most information”', html: `<p>A paragraph usually has a <strong>central point</strong> plus support: examples, data, explanations, contrast, or consequences.</p><div class="callout"><strong>Ask: Why is this paragraph here?</strong><br>Not: What does every sentence mean in Chinese?</div><h3>A useful three-step method</h3><ol><li>Read the first sentence carefully.</li><li>Notice direction words: <strong>however, therefore, for example, in contrast, as a result</strong>.</li><li>After reading, complete: “This paragraph is mainly explaining / arguing / showing that ______.”</li></ol>` },
      { title: '2. Notice', html: `<div class="reading-passage"><p>Many cities promote urban trees because they improve the appearance of streets. Their value, however, is not limited to aesthetics. Trees can lower surface temperatures by providing shade and by releasing water vapour through their leaves. In densely built neighbourhoods, this cooling effect may reduce heat exposure for residents during summer.</p></div>`, blocks: [
        mcq('R01-Q1', 'Which is the main idea?', ['Trees make streets look attractive.', 'Urban trees can help reduce heat exposure.', 'Water vapour is released through leaves.'], 'Urban trees can help reduce heat exposure.', '“However” limits the first idea. Water vapour is a mechanism. The heat-reduction point captures the paragraph’s purpose.', 'reading-main-idea')
      ] },
      { title: '3. Guided Reading', html: `<div class="reading-passage"><p>Remote work was initially adopted by many organisations as an emergency measure. Since then, some employers have kept flexible arrangements because they can reduce commuting time and widen the pool of potential employees. Yet remote work is not equally effective for every task. Activities that depend on rapid informal discussion, access to specialised equipment, or close supervision may still be easier to perform in a shared workplace. As a result, many organisations are moving toward hybrid systems rather than choosing either complete remote work or complete office attendance.</p></div>`, blocks: [
        mcq('R01-Q2', 'What is the main idea?', ['Remote work was created during an emergency.', 'Hybrid work can balance advantages and limitations of remote work.', 'Commuting is the main reason employees prefer remote work.', 'Specialised equipment is expensive.'], 'Hybrid work can balance advantages and limitations of remote work.', 'The middle explains both advantages and limitations; the final sentence gives the paragraph’s conclusion.', 'reading-detail-confusion')
      ] },
      { title: '4. Independent Practice — Why sleep timing matters', html: `<div class="reading-passage"><p><strong>Paragraph A</strong><br>Researchers have long known that sleep duration affects health and concentration. More recent work suggests that timing also matters. A person who regularly sleeps seven hours at widely different times may experience more disruption than someone whose sleep schedule is relatively stable. This is because many physiological processes follow daily rhythms that respond to light, meals, activity, and sleep.</p><p><strong>Paragraph B</strong><br>The practical challenge is that modern schedules are often irregular. Students may wake early on weekdays and sleep much later at weekends, while shift workers can face even larger changes. Social events, late-night screen use, and long commutes can add further variation. For many people, therefore, the problem is not simply “too little sleep” but a pattern that changes repeatedly.</p><p><strong>Paragraph C</strong><br>Greater regularity does not require an identical bedtime every night. A more realistic goal is to keep sleep and wake times within a reasonably narrow range on most days. Small changes, such as getting morning light and avoiding very large weekend shifts, may make a routine easier to maintain. The aim is consistency rather than perfection.</p></div>`, blocks: [
        mcq('R01-Q3', 'Paragraph A — best main idea', ['Seven hours of sleep is enough for everyone.', 'Stable sleep timing may matter as well as total sleep duration.', 'Light is the only factor controlling daily rhythms.', 'Researchers no longer study sleep duration.'], 'Stable sleep timing may matter as well as total sleep duration.', 'The paragraph adds timing to the existing focus on duration.', 'reading-main-idea'),
        mcq('R01-Q4', 'Paragraph B — best main idea', ['Irregular schedules can make consistent sleep difficult.', 'Students need more sleep than shift workers.', 'Screen use is the main cause of poor sleep.', 'Weekend sleep is harmful.'], 'Irregular schedules can make consistent sleep difficult.', 'The examples all support the broader problem of changing schedules.', 'reading-detail-confusion'),
        mcq('R01-Q5', 'Paragraph C — best main idea', ['Everyone should sleep at exactly the same time.', 'Weekend sleep should be eliminated.', 'Practical consistency is more important than perfect timing.', 'Morning light guarantees good sleep.'], 'Practical consistency is more important than perfect timing.', 'The paragraph explicitly contrasts realistic consistency with perfect sameness.', 'reading-main-idea'),
      ] },
      { title: '5. IELTS Transfer — Matching Headings', html: `<p>Choose the heading that best captures each paragraph’s purpose, not the heading that repeats the most words.</p><div class="structure-box">i. A realistic approach to regular sleep\nii. Why total hours tell only part of the story\niii. The benefits of working night shifts\niv. Everyday causes of changing sleep schedules\nv. Why weekend sleep should be avoided</div>`, blocks: [
        mcq('R01-Q6', 'Paragraph A', ['i', 'ii', 'iii', 'iv', 'v'], 'ii', 'The paragraph says duration matters, but timing matters too.', 'reading-main-idea'),
        mcq('R01-Q7', 'Paragraph B', ['i', 'ii', 'iii', 'iv', 'v'], 'iv', 'The paragraph lists everyday causes of irregular schedules.', 'reading-main-idea'),
        mcq('R01-Q8', 'Paragraph C', ['i', 'ii', 'iii', 'iv', 'v'], 'i', 'The paragraph recommends a realistic, not perfect, approach to regularity.', 'reading-main-idea'),
      ] },
      { title: '6. Strategy Drill', html: `<p>Label each sentence mentally as a possible main idea, detail, or example:</p><ol><li>“Public libraries increasingly provide services beyond lending books.” → <strong>possible main idea</strong></li><li>“For example, many now offer digital-skills workshops.” → <strong>example</strong></li><li>“Some branches also lend tools or provide recording equipment.” → <strong>detail</strong></li><li>“This wider role reflects a shift toward libraries as community learning spaces.” → <strong>main/concluding restatement</strong></li></ol>` },
      { title: '7. Review', html: `<h3>Three questions to ask</h3><ol><li>What is the paragraph <strong>doing</strong>?</li><li>Which sentence changes or controls the direction?</li><li>Which information could disappear without changing the central point?</li></ol>`, blocks: [
        { type: 'note', id: 'R01-summary', label: 'Retry: summarise Paragraph B in 12 words or fewer', placeholder: 'Irregular modern schedules...' }
      ] },
    ]
  },
  {
    id: 'L01', slug: 'listen-for-meaning-not-individual-words',
    title: 'Listen for Meaning, Not Individual Words', description: 'Track the speaker’s overall direction even when one or two words are unfamiliar.',
    skill: 'listening', subskill: 'gist', lessonType: 'skill', cefr: 'B2', ieltsRange: '5.5–6.5', difficulty: 3, estimatedMinutes: 18,
    objective: 'Follow the overall meaning of a short conversation without stopping mentally at unfamiliar words.',
    chinese: '聽力中漏掉一個字時，不要停在那個字。繼續追蹤說話者的方向、轉折與最後決定。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to keep following a conversation even when you miss individual words.</p>` },
      { title: '1. Prepare', html: `<p>Before listening, read only this question:</p><div class="callout"><strong>Two students are discussing a presentation. What is their main problem?</strong></div><p>Do not predict exact vocabulary. Predict possible categories: timing, topic, technology, group work, research.</p>` },
      { title: '2. First Listen — Gist only', blocks: [
        { type: 'audio', src: './media/audio/l01-listen-for-meaning.mp3', testLike: true, label: 'First listen' },
        mcq('L01-Q1', 'What is their main problem?', ['They cannot agree on the presentation topic.', 'Their presentation is too long.', 'They have lost part of their research.', 'They do not know how to use the classroom computer.'], 'Their presentation is too long.', 'They are at nearly fourteen minutes and the limit is ten.', 'listening-lost-focus')
      ] },
      { title: '3. Second Listen — Details', blocks: [
        { type: 'audio', src: './media/audio/l01-listen-for-meaning.mp3', label: 'Second listen' },
        mcq('L01-Q2', 'What does Maya suggest removing first?', ['the opening example', 'the survey results', 'the historical background', 'the final recommendation'], 'the historical background', 'Maya says the historical background is taking too long.', 'listening-missed-detail'),
        mcq('L01-Q3', 'Why does Daniel want to keep the survey?', ['It took the longest to prepare.', 'It supports their main argument.', 'The tutor specifically requested it.', 'It contains surprising statistics.'], 'It supports their main argument.', 'Daniel says it “actually supports our argument about student travel habits.”', 'listening-missed-detail'),
        mcq('L01-Q4', 'What will they do next?', ['practise the shortened version', 'ask for a longer time slot', 'redesign all the slides', 'collect another survey'], 'practise the shortened version', 'They will make the changes and then run through the whole presentation again.', 'listening-missed-detail')
      ] },
      { title: '4. Transcript', html: `<details><summary class="btn soft">Open transcript after listening</summary><div class="transcript card subtle" style="margin-top:12px"><strong>Maya:</strong> We’re still at nearly fourteen minutes, and the limit is ten.<br><strong>Daniel:</strong> I know. I thought the slides would go faster once we practised them.<br><strong>Maya:</strong> The introduction is fine. I think the historical background is taking too long. We spend almost three minutes explaining how the policy developed.<br><strong>Daniel:</strong> We could shorten that, but I don’t want to lose the survey section. That’s the part that actually supports our argument about student travel habits.<br><strong>Maya:</strong> Agreed. The survey stays. What if we turn the background into one slide and give only the two dates people really need?<br><strong>Daniel:</strong> That would probably save a minute and a half. We could also cut the second example. It’s interesting, but it makes the same point as the first one.<br><strong>Maya:</strong> Good. Let’s make those changes now and then run through the whole thing again. If we’re still over ten minutes, we can shorten the conclusion.</div></details>` },
      { title: '5. Notice — Why single-word listening fails', html: `<p>If you stopped mentally at words like <strong>policy</strong>, <strong>survey</strong>, or <strong>background</strong>, you might miss the conversation structure:</p><div class="structure-box">Problem: 14 minutes → limit is 10\nOption 1: shorten historical background\nKeep: survey section\nOption 2: cut second example\nNext: practise again</div><p>Meaning is built across sentences.</p>` },
      { title: '6. Signal Words', html: `<ul><li><strong>but</strong> → contrast</li><li><strong>actually</strong> → emphasis/correction</li><li><strong>what if</strong> → suggestion</li><li><strong>also</strong> → additional idea</li><li><strong>if</strong> → conditional next step</li></ul>` },
      { title: '7. Micro Drill', html: `<div class="callout">“The west entrance is normally open, <strong>but</strong> because of the construction work, visitors should use the gate beside the library.”</div>`, blocks: [
        mcq('L01-Q5', 'You miss the word “construction”. Where should visitors enter?', ['west entrance', 'gate beside the library'], 'gate beside the library', 'The contrast marker “but” tells you the first option changes.', 'listening-word-fixation')
      ] },
      { title: '8. IELTS Transfer', html: `<p>In IELTS Listening, questions often test the final or corrected meaning rather than the first option mentioned.</p><div class="callout success"><strong>Practice rule: Keep listening after you hear a possible answer.</strong></div><p>This does not mean every answer contains a trick. It means you should follow the speaker's complete message.</p>` },
      { title: '9. Deep Review & Retry', html: `<p>If the gist question was wrong, replay once without looking at options and say the problem aloud in one sentence.</p><p>If a detail question was wrong, replay the relevant sentence, identify the signal word, and answer again before opening the transcript.</p>`, blocks: [
        { type: 'note', id: 'L01-summary', label: '15-second spoken summary — Maya and Daniel are trying to…', placeholder: 'Maya and Daniel are trying to...' }
      ] },
    ]
  },
  {
    id: 'W01', slug: 'answer-the-question-before-you-try-to-sound-advanced',
    title: 'Answer the Question Before You Try to Sound Advanced', description: 'Task Response first: extract requirements, state a direct position, and reject impressive but irrelevant ideas.',
    skill: 'writing', subskill: 'task-response', lessonType: 'skill', cefr: 'B2', ieltsRange: '5.5–6.5', difficulty: 3, estimatedMinutes: 20,
    objective: 'Identify every requirement in a Task 2 prompt and build a direct position before choosing advanced language.',
    chinese: '先回答題目，再升級語言。複雜文法或艱深字彙無法補救偏題、漏答或立場不清。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to identify what a Writing Task 2 question requires, state a direct position, and reject ideas that sound impressive but do not answer the task.</p>` },
      { title: '1. Learn — Task Response comes before “advanced English”', html: `<p>A grammatically complex essay can still be weak if it answers only part of the question, changes the topic, has no clear position, or gives ideas that are not developed.</p><div class="callout"><strong>Before writing, reduce the prompt to a simple job.</strong></div>` },
      { title: '2. Task Analysis', html: `<div class="reading-passage"><p>Some people think universities should focus mainly on preparing students for employment. Others believe the main purpose of university is to provide a broad education. Discuss both views and give your own opinion.</p></div><h3>What must you do?</h3><ul><li>explain why some people prioritise employment preparation</li><li>explain why others value broad education</li><li>give your own opinion</li></ul><p class="muted">You do not need to list every purpose of university, describe your own university, or prove one side is completely wrong.</p>` },
      { title: '3. Notice — Direct vs impressive-sounding', html: `<div class="grid two"><div class="card subtle"><strong>Version A</strong><p>In the contemporary epoch, tertiary educational establishments undoubtedly constitute multifaceted institutions whose pedagogical paradigms have engendered considerable controversy.</p><p class="muted">Delays the answer, uses unnatural wording, and gives no clear position.</p></div><div class="card subtle"><strong>Version B</strong><p>Universities should prepare students for work, but their role should not be limited to immediate job training. In my view, the strongest university education combines career-relevant skills with broader intellectual development.</p><p class="muted">Answers the issue immediately and states a precise position.</p></div></div>` },
      { title: '4. Guided Practice — What is the job?', html: `<p><strong>Prompt A:</strong> In many cities, housing is becoming increasingly expensive. What problems does this cause, and what measures could governments take?</p><p>Required: problems caused by expensive housing + government measures.</p><p><strong>Prompt B:</strong> Some people believe children should begin learning a foreign language at primary school rather than secondary school. Do the advantages outweigh the disadvantages?</p><p>Required: compare advantages/disadvantages + make a clear judgement about which side is stronger.</p>` },
      { title: '5. Independent Practice — Choose the best thesis', blocks: [
        mcq('W01-Q1', 'More employees are working from home. Do the advantages of this development outweigh the disadvantages?', [
          'Working from home has become extremely prevalent in the modern world and is a controversial issue with many aspects.',
          'Although home working can reduce informal collaboration, its advantages generally outweigh this drawback because it saves commuting time and gives many employees greater control over their working day.',
          'There are advantages and disadvantages to everything, so it depends on the person.'
        ], 'Although home working can reduce informal collaboration, its advantages generally outweigh this drawback because it saves commuting time and gives many employees greater control over their working day.', 'It answers the exact “outweigh” requirement, acknowledges a drawback, and gives a clear judgement and direction.', 'writing-task-response')
      ] },
      { title: '6. Idea Filter', html: `<div class="reading-passage"><p>Governments should spend more money on public transport than on building new roads. To what extent do you agree or disagree?</p></div><ol><li>Public transport can move more people through limited urban space. <strong>✓</strong></li><li>Cars are popular in many countries. <span class="muted">Too weak unless connected to the argument.</span></li><li>Better buses and rail can improve access for people who cannot drive. <strong>✓</strong></li><li>Road construction requires engineering. <span class="muted">Irrelevant unless connected to cost, feasibility or policy.</span></li><li>Some road investment remains necessary for freight and emergency access. <strong>✓</strong></li></ol>` },
      { title: '7. Write a 5-minute plan', blocks: [
        { type: 'note', id: 'W01-position', label: 'Position — one sentence', placeholder: 'I largely agree because...' },
        { type: 'note', id: 'W01-idea1', label: 'Main idea 1 + reason/example', placeholder: 'Main idea 1...' },
        { type: 'note', id: 'W01-idea2', label: 'Main idea 2 + reason/example', placeholder: 'Main idea 2...' },
      ] },
      { title: '8. Self-check', html: `<div class="checklist"><label class="check-item"><input type="checkbox"> Did I answer the exact instruction?</label><label class="check-item"><input type="checkbox"> Is my position obvious?</label><label class="check-item"><input type="checkbox"> Can each main idea support that position?</label><label class="check-item"><input type="checkbox"> Did I remove interesting but irrelevant ideas?</label><label class="check-item"><input type="checkbox"> Can I explain each idea, not just name it?</label></div>` },
      { title: '9. IELTS Transfer', html: `<div class="callout success"><strong>Answer first. Develop second. Upgrade language third.</strong></div><div class="structure-box">Task → position → two strong ideas → explanation/examples → precise language</div>` },
      { title: '10. Mini Writing Task', html: `<div class="reading-passage"><p>Some people think city centres should be made completely car-free. To what extent do you agree or disagree?</p></div><p>Write <strong>80–120 words</strong>: a clear position + one developed main idea + reason/explanation + one example or consequence.</p>`, blocks: [
        { type: 'writing', id: 'W01-draft', promptType: 'writing-task2-feedback', task: 'Some people think city centres should be made completely car-free. To what extent do you agree or disagree?', minWords: 80, maxWords: 120 }
      ] },
      { title: '11. Review', html: `<p>Finish this sentence:</p><div class="callout"><strong>Before I try to sound advanced, I need to make sure I have answered every part of the question clearly.</strong></div>` },
    ]
  },
  {
    id: 'S01', slug: 'give-more-than-a-one-sentence-answer',
    title: 'Give More Than a One-Sentence Answer', description: 'Extend spoken answers naturally with a reason and a useful detail—without sounding memorised.',
    skill: 'speaking', subskill: 'answer-development', lessonType: 'skill', cefr: 'B2', ieltsRange: '5.5–6.5', difficulty: 3, estimatedMinutes: 18,
    objective: 'Extend short spoken answers naturally using a reason, detail, or example without sounding memorised.',
    chinese: '口說不是把一句答案硬拉長，而是自然增加理由、細節或例子。不要把書面作文模板搬進口說。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to extend a short answer naturally.</p><div class="structure-box">Answer → Reason → Detail or Example</div><p>You do not need to force all three every time.</p>` },
      { title: '1. Learn — Short is not always concise', html: `<p><strong>Question:</strong> Do you enjoy cooking?</p><div class="grid two"><div class="card subtle"><strong>Too short</strong><p>Yes, I do.</p><p class="muted">Grammatically correct, but gives the listener almost nothing to follow.</p></div><div class="card subtle"><strong>Better</strong><p>Yes, especially at weekends, because I have more time to experiment. I usually make simple pasta or rice dishes rather than anything complicated.</p><p class="muted">Answer + reason + concrete detail.</p></div></div>` },
      { title: '2. Avoid memorised expansion', html: `<p>Do not turn every answer into “There are several reasons for this phenomenon. First and foremost…” That sounds like a written essay.</p><p>Natural spoken linking uses ordinary words: <strong>because, so, especially, usually, for example, actually, I think, one reason is…</strong></p>` },
      { title: '3. Guided Practice', html: `<p><strong>What kind of music do you listen to?</strong><br>I listen to pop music most often because it's easy to play in the background when I'm working. I also listen to film soundtracks when I need to concentrate.</p><p><strong>Do you prefer mornings or evenings?</strong><br>I prefer evenings because I don't need to rush. In the morning I'm usually thinking about work, but in the evening I can read, exercise, or just slow down.</p>` },
      { title: '4. Choose the strongest extension', blocks: [
        mcq('S01-Q1', 'Do you use public transport often?', [
          'Yes. Public transport is transportation for the public and it is very important in modern society.',
          'Yes, several times a week. I usually take the bus to the city centre because parking there is expensive, and the trip is fairly direct.',
          'Yes, because in this contemporary era public transportation has numerous advantages and disadvantages.'
        ], 'Yes, several times a week. I usually take the bus to the city centre because parking there is expensive, and the trip is fairly direct.', 'It is specific, personal, natural, and easy to continue discussing.', 'speaking-answer-development')
      ] },
      { title: '5. Build Your Own Answer', html: `<p><strong>Question:</strong> Is there a place near your home where you like to relax?</p>`, blocks: [
        { type: 'note', id: 'S01-answer', label: 'Step 1 — Answer', placeholder: 'Yes, there is...' },
        { type: 'note', id: 'S01-reason', label: 'Step 2 — Reason', placeholder: 'I like it because...' },
        { type: 'note', id: 'S01-detail', label: 'Step 3 — Detail / example', placeholder: 'I usually...' },
      ] },
      { title: '6. Fluency Rule', html: `<p>If you cannot think of a “perfect” example, use a small real detail.</p><div class="callout"><strong>Specific details are easier to extend.</strong><br>I usually go there after dinner.<br>It's only ten minutes from my home.<br>It is quieter on weekday evenings.</div>` },
      { title: '7. 60-second Drill', html: `<p><strong>What is one skill you would like to learn in the future?</strong></p><p>Target: 30–60 seconds. Do not restart from the beginning after a small grammar error.</p><div class="structure-box">Skill → why → how you might learn it → when you would use it</div>`, blocks: [
        { type: 'recorder', id: 'S01-record1', question: 'What is one skill you would like to learn in the future?', promptType: 'speaking-transcript-feedback' }
      ] },
      { title: '8. Playback Check', html: `<p>Do not ask “Did I sound like a native speaker?” Ask:</p><ol><li>Did I answer the question directly?</li><li>Did I give the listener something to follow?</li><li>Did I repeat the same idea?</li><li>Did I stop because I was searching for perfect vocabulary?</li></ol>` },
      { title: '9. IELTS Transfer', html: `<p><strong>Part 1:</strong> direct answer + one reason + one detail.</p><p><strong>Part 3:</strong> answer/position + reason + explanation + example, comparison, or consequence.</p><p>The same principle scales up.</p>` },
      { title: '10. Retry', html: `<p><strong>Question:</strong> Do you think people spend enough time outdoors?</p><p>Attempt 1 naturally. Then choose one retry target: add a reason, add an example, avoid repeating “I think”, or continue after a small mistake.</p>`, blocks: [
        { type: 'recorder', id: 'S01-record2', question: 'Do you think people spend enough time outdoors?', promptType: 'speaking-transcript-feedback' }
      ] },
      { title: '11. Review', html: `<div class="callout success">A stronger spoken answer usually gives the listener a direct answer plus <strong>a reason and a useful detail/example</strong>.</div>` },
    ]
  }
];

export const IELTS_GUIDES = [
  { title: 'Test Guide', text: 'Understand the four Academic IELTS skills, task structure, timing and what practice mode should imitate.' },
  { title: 'Question Types', text: 'Train Reading and Listening question types separately before relying on full mock tests.' },
  { title: 'Strategies', text: 'Use strategies as decision rules: identify evidence, manage time, handle distractors and review errors.' },
  { title: 'Mini Tests', text: 'Short timed checks will be added after the core learning loop is stable.' },
  { title: 'Mock Tests', text: 'Full Academic mock mode is a later V1 milestone. It should measure performance, not replace practice.' },
];

export const PROMPT_TEMPLATES = {
  'writing-task1-feedback': `You are acting as an IELTS Academic Writing learning coach.\n\nTARGET:\nBand {targetBand}\n\nTASK:\n{task}\n\nMY RESPONSE:\n{response}\n\nEvaluate using the relevant IELTS Writing dimensions:\n- Task Achievement\n- Coherence and Cohesion\n- Lexical Resource\n- Grammatical Range and Accuracy\n\nRules:\n- This is learning feedback, not an official IELTS score.\n- Give an estimated performance range only when justified; do not give false precision.\n- For Task 1, check whether key features are selected and compared appropriately.\n- Do not invent data that is not in the task.\n- Do not rewrite the entire response first.\n- Quote only short extracts from my response when diagnosing issues.\n- Separate factual/data-description problems from language problems.\n- Do not reward unnecessarily difficult vocabulary.\n\nReturn:\nA. Estimated performance range with uncertainty\nB. What works\nC. Three highest-priority improvements\nD. Missing/weak key features or comparisons\nE. Organization feedback\nF. Sentence-level corrections\nG. Vocabulary/collocation improvements\nH. Revision checklist\n\nFinish by asking me to revise the response before you provide a full model answer.`,
  'writing-task2-feedback': `You are acting as an IELTS Academic Writing learning coach.\n\nTARGET:\nBand {targetBand}\n\nTASK:\n{task}\n\nMY RESPONSE:\n{response}\n\nEvaluate using:\n- Task Response\n- Coherence and Cohesion\n- Lexical Resource\n- Grammatical Range and Accuracy\n\nRules:\n- This is learning feedback, not an official IELTS score.\n- Use an estimated range rather than a falsely precise band.\n- First check whether I answered every part and whether my position is clear.\n- Identify only the 3 highest-priority improvements before minor corrections.\n- Quote short examples from my response when explaining a problem.\n- Distinguish grammar errors, awkward wording, and optional style improvements.\n- Do not recommend memorised templates or unnecessarily difficult vocabulary.\n- Do not replace my ideas with a different essay unless an idea is off-task.\n\nReturn:\nA. Estimated performance range + uncertainty\nB. What I did well\nC. Three priorities\nD. Task-response / idea-development feedback\nE. Organization feedback\nF. Sentence-level corrections\nG. Vocabulary/collocation improvements\nH. Revision checklist\n\nThen ask me to rewrite before showing a complete model answer.`,
  'speaking-transcript-feedback': `You are acting as an IELTS Speaking learning coach.\n\nPART:\n{part}\n\nQUESTION:\n{question}\n\nTARGET:\nBand {targetBand}\n\nMY TRANSCRIPT:\n{transcript}\n\nEvaluate:\n- Fluency and Coherence: only features inferable from the transcript\n- Lexical Resource\n- Grammatical Range and Accuracy\n- Pronunciation: DO NOT assess from text alone\n\nRules:\n- Do not claim to hear pauses, stress, intonation, or pronunciation when only text is provided.\n- Do not give a falsely precise IELTS score.\n- Keep the answer natural; do not turn it into a memorised speech.\n- Prioritise changes I can practise on the next attempt.\n- Distinguish spoken-language acceptability from formal-writing style.\n\nReturn:\nA. What worked\nB. Three biggest weaknesses\nC. Awkward or unnatural phrases\nD. Grammar corrections\nE. Better ways to develop the answer\nF. Useful vocabulary/collocations\nG. Suggested answer structure\nH. One retry challenge\n\nDo not give a full model answer until I retry.`,
  'grammar-correction': `Act as an English grammar coach for a B1+–C1 learner preparing for IELTS.\n\nTEXT:\n{text}\n\nMY CURRENT FOCUS (optional):\n{focus}\n\nDo not simply rewrite everything. Identify recurring grammar patterns, separate real errors from optional style changes, explain important errors plainly, give corrected versions and new practice sentences, rank the top 2–3 priorities, and end with a short repair exercise. Do not invent an IELTS band score.`,
  'vocabulary-coach': `Act as an English vocabulary coach.\n\nSOURCE / TOPIC:\n{source}\n\nWORDS OR PHRASES:\n{items}\n\nMY LEVEL:\n{level}\n\nFor each useful item: plain-English meaning, one natural example, 2–4 common collocations, useful word family when relevant, register note if needed, and one common mistake to avoid. Then choose only the highest-value items for active learning and create recognition → recall → completion → production → Writing/Speaking reuse practice.`,
  'error-analysis': `Act as a learning coach. Analyse why I got this item wrong and help me repair the underlying skill.\n\nSKILL:\n{skill}\n\nQUESTION:\n{question}\n\nMY ANSWER:\n{myAnswer}\n\nCORRECT ANSWER:\n{correctAnswer}\n\nSOURCE / PASSAGE / TRANSCRIPT:\n{source}\n\nDo not stop at “the correct answer is X.” Return evidence, why my answer was tempting, error type, the failed thinking/listening/reading step, one cue for next time, one short repair drill, and one retry question of the same type. If the source does not contain enough information, say so.`
};

export const FIRST_PATH = ['LB01', 'R01', 'L01', 'W01', 'S01'];
