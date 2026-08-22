import { LESSONS } from './data.js';
import { CORE_LESSON_META } from './adaptive-data.js';
import { VOCABULARY_ITEMS } from './learning-extension-data.js';

const mcq = (id, prompt, options, answer, rationale, errorTag) => ({
  type: 'quiz', id, prompt, options, answer, rationale, errorTag
});

export const CURRICULUM_BATCH_01 = [
  {
    id: 'R02',
    slug: 'read-for-structure-not-just-words',
    title: 'Read for Structure, Not Just Words',
    description: 'Track what each sentence and paragraph is doing: claim, evidence, contrast, example, or conclusion.',
    skill: 'reading', subskill: 'text-structure', lessonType: 'skill', cefr: 'B2', ieltsRange: '5.5–6.5', difficulty: 3, estimatedMinutes: 20,
    objective: 'Identify the structural role of ideas so that you can follow an argument without translating every sentence.',
    prerequisites: ['R01'],
    tags: ['structure', 'claim', 'evidence', 'contrast', 'paragraph-purpose'],
    ieltsSkill: 'reading', questionType: 'matching-information', examRelevance: 'high', timed: false,
    errorTags: ['reading-structure', 'reading-evidence', 'reading-contrast', 'reading-paragraph-purpose'],
    repairLessons: ['R01'], relatedLessons: ['R01', 'R05'], nextLessons: ['R03'],
    chinese: '不要只追字義，要追蹤文章在「做什麼」：提出主張、提供證據、轉折、舉例、下結論。看懂結構後，即使有少數生字也能跟上論述。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to map a short academic text as <strong>claim → support → contrast → conclusion</strong>.</p><div class="callout"><strong>Reading structure means asking what a sentence is doing, not only what it says.</strong></div>` },
      { title: '1. Learn — Five common jobs', html: `<div class="grid two"><div class="card subtle"><h3>Claim</h3><p>The writer's main point or position.</p><h3>Evidence</h3><p>Data, research, examples, or reasons that support a claim.</p><h3>Example</h3><p>A specific case that makes an idea concrete.</p></div><div class="card subtle"><h3>Contrast</h3><p>A limit, exception, alternative, or opposing point.</p><h3>Conclusion</h3><p>The implication or judgement the writer wants you to carry forward.</p></div></div><p>Useful markers include <strong>for example, however, by contrast, because, therefore, as a result, nevertheless</strong>.</p>` },
      { title: '2. Notice — Follow the jobs', html: `<div class="reading-passage"><p><strong>1</strong> Community gardens are often promoted as a way to increase access to fresh food in cities. <strong>2</strong> A survey of three neighbourhood projects found that regular participants reported eating a wider range of vegetables. <strong>3</strong> For example, one project distributed unfamiliar herbs together with simple recipes. <strong>4</strong> However, gardens alone cannot solve food insecurity because they usually produce limited quantities. <strong>5</strong> Their strongest contribution may therefore be educational and social rather than purely nutritional.</p></div>`, blocks: [
        mcq('R02-Q1', 'What is sentence 2 doing?', ['Making the main claim', 'Providing evidence', 'Introducing a contrast', 'Giving the conclusion'], 'Providing evidence', 'It reports survey findings that support the opening claim.', 'reading-evidence'),
        mcq('R02-Q2', 'What structural change begins with “However” in sentence 4?', ['Example → definition', 'Claim → limitation', 'Evidence → repetition', 'Conclusion → new topic'], 'Claim → limitation', '“However” introduces a limit: gardens may help, but they cannot solve the whole problem.', 'reading-contrast'),
        mcq('R02-Q3', 'What is sentence 5 mainly doing?', ['Adding another unrelated example', 'Drawing a conclusion from the limitation', 'Repeating the survey result', 'Defining food insecurity'], 'Drawing a conclusion from the limitation', '“Therefore” signals the writer’s revised conclusion about the gardens’ strongest contribution.', 'reading-structure')
      ] },
      { title: '3. Guided Practice — Build a structure map', html: `<div class="reading-passage"><p>Digital textbooks can reduce the physical weight students carry and can be updated more quickly than printed editions. Yet schools that replace printed books completely may create new access problems. Some students do not have reliable devices at home, while others find long periods of screen reading tiring. A mixed system can therefore offer digital flexibility without making every learner depend on the same technology.</p></div><div class="structure-box">Benefit → limitation → evidence/examples of limitation → balanced conclusion</div>`, blocks: [
        mcq('R02-Q4', 'Which sentence controls the direction of the paragraph?', ['Digital textbooks can reduce the physical weight students carry...', 'Yet schools that replace printed books completely may create new access problems.', 'Some students do not have reliable devices at home...', 'A mixed system can therefore offer digital flexibility...'], 'Yet schools that replace printed books completely may create new access problems.', 'The contrast marker “Yet” changes the paragraph from advantages to limitations and controls the rest of the discussion.', 'reading-contrast'),
        mcq('R02-Q5', 'Why are unreliable devices and screen fatigue mentioned?', ['To introduce two separate topics', 'To support the claim that complete replacement can create access problems', 'To prove printed books are always superior', 'To define digital textbooks'], 'To support the claim that complete replacement can create access problems', 'They are supporting reasons/examples for the limitation introduced after “Yet”.', 'reading-evidence')
      ] },
      { title: '4. Independent Practice — Public space after dark', html: `<div class="reading-passage"><p><strong>Paragraph A</strong><br>City parks are often evaluated by how many people use them during the day. This can overlook their role after sunset, when commuters, teenagers, shift workers, and families may still need safe public space. Extending useful hours can make existing infrastructure serve more people without requiring new land.</p><p><strong>Paragraph B</strong><br>Lighting is an obvious part of this process, but brighter is not always better. Poorly directed light can disturb nearby residents and wildlife, while excessive brightness may create glare that actually reduces visibility. Designers increasingly use lower, shielded lights that illuminate paths rather than the entire surrounding area.</p><p><strong>Paragraph C</strong><br>Programming also matters. A well-lit park may remain empty if there is no reason to visit it. Evening exercise classes, small performances, food kiosks, or late-opening sports facilities can create legitimate activity. The presence of other users can itself make a place feel safer.</p><p><strong>Paragraph D</strong><br>There is no single formula for every neighbourhood. In some areas, later opening hours may be valuable; in others, residents may prefer quiet after a certain time. The broader lesson is that night-time use should be designed around local needs rather than treated as an automatic extension of daytime policy.</p></div>`, blocks: [
        mcq('R02-Q6', 'Paragraph A mainly does what?', ['Introduces why night-time use deserves attention', 'Explains technical lighting design', 'Lists entertainment options', 'Rejects all daytime park planning'], 'Introduces why night-time use deserves attention', 'It reframes how parks are evaluated and explains why after-dark use matters.', 'reading-paragraph-purpose'),
        mcq('R02-Q7', 'Paragraph B has which structure?', ['Problem only', 'Simple chronological sequence', 'Obvious solution → limitation → refined solution', 'Two unrelated examples'], 'Obvious solution → limitation → refined solution', 'It starts with lighting, limits the “brighter is better” assumption, then describes more targeted lighting.', 'reading-structure'),
        mcq('R02-Q8', 'Paragraph D mainly functions as...', ['new evidence for lighting', 'a local example', 'a qualified conclusion', 'a definition'], 'a qualified conclusion', 'It avoids a universal rule and concludes that local needs should guide policy.', 'reading-paragraph-purpose')
      ] },
      { title: '5. IELTS Transfer', html: `<p>Structure helps with several IELTS tasks:</p><ul><li><strong>Matching Headings:</strong> choose the paragraph’s purpose.</li><li><strong>Matching Information:</strong> know whether you are looking for evidence, an example, a criticism, or a conclusion.</li><li><strong>Multiple Choice:</strong> distinguish the writer’s claim from a detail that merely supports it.</li></ul><div class="callout success"><strong>Do not ask only “Where is the same word?” Ask “What role should the answer play here?”</strong></div>` },
      { title: '6. Repair & Retry', html: `<p>If you missed a structure question, do not reread every word. Write a one-letter map beside each sentence:</p><div class="structure-box">C = claim · E = evidence/example · X = contrast/limit · K = conclusion</div><p>Then retry the question with the map visible. On the next review, hide the map and recreate it from memory.</p>`, blocks: [
        { type: 'note', id: 'R02-map', label: 'Map Paragraph B in 4–8 words', placeholder: 'lighting → limit → refined solution' }
      ] },
      { title: '7. Review', html: `<div class="callout success">Strong readers track <strong>relationships and roles</strong>, not isolated sentences.</div>` }
    ]
  },
  {
    id: 'R03',
    slug: 'paraphrases-the-language-ielts-uses-to-hide-answers',
    title: 'Paraphrases: The Language IELTS Uses to Hide Answers',
    description: 'Recognise the same meaning when vocabulary, grammar, or perspective changes.',
    skill: 'reading', subskill: 'paraphrase', lessonType: 'skill', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 20,
    objective: 'Match ideas by meaning rather than searching for repeated keywords.',
    prerequisites: ['R01', 'R02'], tags: ['paraphrase', 'synonym', 'grammar-shift', 'keyword-trap'],
    ieltsSkill: 'reading', questionType: 'multiple-choice', examRelevance: 'high', timed: false,
    errorTags: ['reading-paraphrase', 'reading-keyword-match', 'reading-meaning-shift'], repairLessons: ['VG01'], relatedLessons: ['R02', 'L03'], nextLessons: ['R04'],
    chinese: 'IELTS 常把題目中的意思換一種說法，不會原字重複。要辨認同義改寫、詞性變化、主被動與因果重組，而不是只找相同關鍵字。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to recognise a paraphrase even when <strong>almost none of the key words are repeated</strong>.</p>` },
      { title: '1. Learn — Meaning can move in three ways', html: `<ol><li><strong>Lexical:</strong> reduce → cut / lower / decrease</li><li><strong>Grammatical:</strong> “people use buses more” → “bus use has increased”</li><li><strong>Perspective:</strong> “the policy saves commuters time” → “commuters spend less time travelling”</li></ol><div class="callout"><strong>Keyword matching is only a locator. Meaning decides the answer.</strong></div>` },
      { title: '2. Notice — Same meaning, different surface', blocks: [
        mcq('R03-Q1', 'Which sentence best paraphrases “The new timetable reduced the amount of time commuters spent waiting”?', ['Commuters travelled for fewer days each week.', 'Waiting times became shorter after the timetable changed.', 'The timetable gave commuters more free tickets.', 'People stopped using public transport.'], 'Waiting times became shorter after the timetable changed.', '“Reduced the amount of time ... waiting” and “waiting times became shorter” express the same change.', 'reading-paraphrase'),
        mcq('R03-Q2', 'Which is the closest paraphrase of “The scheme widened access to training”?', ['The scheme made training available to more people.', 'The scheme made training more difficult.', 'The scheme increased the length of training.', 'The scheme changed who provided the training.'], 'The scheme made training available to more people.', '“Widened access” means more people were able to use or reach the service.', 'reading-paraphrase')
      ] },
      { title: '3. Beware the keyword trap', html: `<div class="reading-passage"><p>Original: The museum extended its opening hours, but visitor numbers remained almost unchanged.</p></div><p><strong>Trap statement:</strong> Longer opening hours caused a large increase in visitors.</p><p>The words “opening hours” and “visitors” match, but the meaning is the opposite.</p>`, blocks: [
        mcq('R03-Q3', 'What should decide whether the trap statement is correct?', ['The number of repeated words', 'The overall relationship between the ideas', 'Whether the statement is shorter', 'Whether both sentences mention a museum'], 'The overall relationship between the ideas', 'Repeated vocabulary can appear in a contradiction. Compare the relationship and claim, not just the nouns.', 'reading-keyword-match')
      ] },
      { title: '4. Independent Practice — Repair cafés', html: `<div class="reading-passage"><p>Repair cafés are community events where people bring broken household objects and work with volunteers to fix them. The events were initially promoted as a way to reduce waste, but organisers soon noticed another benefit: participants learned practical skills by watching and helping with repairs. Some later attempted similar repairs at home rather than immediately replacing damaged items.</p><p>The model does have limits. Volunteers may be unable to repair products that require specialist parts, proprietary software, or dangerous electrical work. Even so, a failed repair can still teach participants why a product is difficult to maintain. For some campaigners, this information strengthens the argument that manufacturers should design products that are easier to open, diagnose, and repair.</p></div>`, blocks: [
        mcq('R03-Q4', 'Which statement paraphrases an unexpected benefit of repair cafés?', ['They sell cheaper replacement products.', 'People can gain skills while taking part in repairs.', 'They guarantee that broken items will be fixed.', 'Manufacturers provide free software.'], 'People can gain skills while taking part in repairs.', 'The passage says participants learned practical skills by watching and helping.', 'reading-paraphrase'),
        mcq('R03-Q5', '“Some later attempted similar repairs at home” is closest in meaning to...', ['Some participants reused the skills independently.', 'Some volunteers stopped attending events.', 'Some people bought specialist tools immediately.', 'Some cafés moved into private homes.'], 'Some participants reused the skills independently.', 'The sentence describes transferring learned skills to a new setting without direct help.', 'reading-meaning-shift'),
        mcq('R03-Q6', 'Which paraphrase best captures the limitation?', ['Every object can be repaired if enough volunteers attend.', 'Certain products need resources or expertise that community volunteers may not have.', 'Repair cafés only accept electrical equipment.', 'The main problem is that participants refuse to help.'], 'Certain products need resources or expertise that community volunteers may not have.', 'Specialist parts, software, and dangerous work are examples of resources/expertise beyond the event.', 'reading-paraphrase')
      ] },
      { title: '5. IELTS Transfer — Build paraphrase pairs', html: `<div class="grid two"><div class="card subtle"><strong>Question language</strong><p>became more widely available</p><p>was not successful</p><p>people were less dependent on</p><p>an unexpected result</p></div><div class="card subtle"><strong>Possible passage language</strong><p>access expanded</p><p>failed to achieve its aim</p><p>reduced reliance on</p><p>a benefit that had not been anticipated</p></div></div><p>Do not memorise these as fixed synonym pairs. Their meaning depends on context.</p>` },
      { title: '6. Repair Drill', html: `<p>When you miss a paraphrase question:</p><ol><li>Underline the <strong>relationship</strong> in the question: cause, change, comparison, limitation, purpose.</li><li>Find the passage sentence.</li><li>Rewrite both in very plain English.</li><li>Compare the plain-English meanings.</li></ol>`, blocks: [
        { type: 'note', id: 'R03-rewrite', label: 'Plain-English rewrite: “reduced reliance on private cars”', placeholder: 'People needed/used private cars less...' }
      ] },
      { title: '7. Review', html: `<div class="callout success">A paraphrase keeps the <strong>core meaning</strong> while changing the surface language.</div>` }
    ]
  },
  {
    id: 'R04',
    slug: 'true-false-or-not-given',
    title: 'True, False or Not Given?',
    description: 'Make evidence-based decisions and stop turning missing information into False.',
    skill: 'reading', subskill: 'true-false-not-given', lessonType: 'question-type', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 22,
    objective: 'Classify statements as True, False, or Not Given by comparing the exact claim with the evidence in the passage.',
    prerequisites: ['R02', 'R03'], tags: ['true-false-not-given', 'evidence', 'scope', 'assumption'],
    ieltsSkill: 'reading', questionType: 'true-false-not-given', examRelevance: 'very-high', timed: false,
    errorTags: ['reading-not-given', 'reading-evidence', 'reading-overgeneralisation', 'reading-scope'], repairLessons: ['R02', 'R03'], relatedLessons: ['R03', 'R05'], nextLessons: ['R05'],
    chinese: 'True 是文章支持同一主張；False 是文章明確矛盾；Not Given 是文章沒有足夠資訊判定。最常見錯誤是把「沒寫」當成 False，或把範圍更大的敘述當成 True。',
    sections: [
      { title: 'Goal', html: `<div class="structure-box">TRUE = same claim supported\nFALSE = claim contradicted\nNOT GIVEN = insufficient evidence</div><p>Your own knowledge does not count.</p>` },
      { title: '1. Learn — Use the evidence ladder', html: `<ol><li>Underline the statement’s <strong>subject</strong>.</li><li>Underline the <strong>claim</strong>: what exactly is said about it?</li><li>Find the relevant passage evidence.</li><li>Ask: same, opposite, or insufficient?</li></ol><div class="callout warning"><strong>Missing information is not the same as opposite information.</strong></div>` },
      { title: '2. Notice — Small words change scope', html: `<p>Words such as <strong>all, only, always, never, mainly, some, may, often</strong> can change the truth value.</p><div class="reading-passage"><p>Several schools in the study introduced later start times, and most reported improved punctuality.</p></div>`, blocks: [
        mcq('R04-Q1', 'Statement: Every school in the study reported improved punctuality.', ['TRUE', 'FALSE', 'NOT GIVEN'], 'FALSE', 'The passage says “most”, not every school. “Every” makes a stronger claim that is contradicted.', 'reading-scope'),
        mcq('R04-Q2', 'Statement: Later start times improved students’ examination scores.', ['TRUE', 'FALSE', 'NOT GIVEN'], 'NOT GIVEN', 'The passage mentions punctuality, not examination scores. There is no evidence either way.', 'reading-not-given')
      ] },
      { title: '3. Independent Practice — Urban wetlands', html: `<div class="reading-passage"><p>For much of the twentieth century, wetlands near expanding cities were frequently drained or filled because they were considered unusable land. More recently, planners have begun restoring some urban wetlands. One reason is flood management: wetland soils and vegetation can temporarily store water after heavy rain, reducing pressure on drainage systems.</p><p>Restoration projects can also create habitat for birds, insects, and aquatic species, although the ecological value varies greatly between sites. A small wetland surrounded by roads may support fewer species than a larger site connected to other green areas. Researchers therefore warn against assuming that every restored wetland will provide the same biodiversity benefits.</p><p>Public access is another design question. Boardwalks and observation areas can help residents experience wetlands without entering sensitive zones. However, some sites restrict access during breeding seasons. These restrictions are usually temporary rather than permanent.</p></div>`, blocks: [
        mcq('R04-Q3', 'Restoring urban wetlands can reduce the load on city drainage infrastructure after heavy rain.', ['TRUE', 'FALSE', 'NOT GIVEN'], 'TRUE', 'The passage says wetlands can store water temporarily, reducing pressure on drainage systems.', 'reading-evidence'),
        mcq('R04-Q4', 'All restored urban wetlands provide equally strong biodiversity benefits.', ['TRUE', 'FALSE', 'NOT GIVEN'], 'FALSE', 'The passage explicitly says ecological value varies and warns against assuming every site gives the same benefit.', 'reading-overgeneralisation'),
        mcq('R04-Q5', 'Road traffic is the main cause of low biodiversity in small urban wetlands.', ['TRUE', 'FALSE', 'NOT GIVEN'], 'NOT GIVEN', 'Roads are mentioned as part of one example, but the passage does not identify traffic as the main cause.', 'reading-not-given'),
        mcq('R04-Q6', 'Some urban wetlands may close public access for part of the year.', ['TRUE', 'FALSE', 'NOT GIVEN'], 'TRUE', 'Some sites restrict access during breeding seasons, and the restrictions are temporary.', 'reading-evidence'),
        mcq('R04-Q7', 'Most urban wetland restoration projects include boardwalks.', ['TRUE', 'FALSE', 'NOT GIVEN'], 'NOT GIVEN', 'Boardwalks are described as a possible design feature; no proportion of projects is given.', 'reading-scope')
      ] },
      { title: '4. Why tempting answers fail', html: `<div class="grid three"><div class="card subtle"><h3>Assumption</h3><p>“That sounds logical, so it must be true.”</p></div><div class="card subtle"><h3>Scope shift</h3><p>some → all<br>can → will<br>one reason → main reason</p></div><div class="card subtle"><h3>Topic match</h3><p>The same topic appears, but the exact claim is absent.</p></div></div>` },
      { title: '5. IELTS Transfer — A 20-second decision rule', html: `<div class="structure-box">Can I point to evidence for the same claim? → TRUE\nCan I point to evidence for the opposite claim? → FALSE\nCan I do neither? → NOT GIVEN</div><p>Do not keep rereading indefinitely because you feel that every question “must” have evidence somewhere.</p>` },
      { title: '6. Repair & Retry', html: `<p>For every mistake, write only two short lines:</p><div class="structure-box">Statement claim: ______\nPassage evidence: ______</div><p>If you cannot fill the second line, that is evidence for considering <strong>Not Given</strong>, not for inventing a contradiction.</p>`, blocks: [
        { type: 'note', id: 'R04-evidence', label: 'Rewrite one difficult item as claim + evidence', placeholder: 'Claim: ... / Evidence: ...' }
      ] },
      { title: '7. Review', html: `<div class="callout success"><strong>Evidence beats intuition.</strong> Same = True, opposite = False, insufficient = Not Given.</div>` }
    ]
  },
  {
    id: 'R05',
    slug: 'matching-headings-without-reading-every-line',
    title: 'Matching Headings Without Reading Every Line',
    description: 'Choose headings by paragraph purpose and central direction instead of repeated keywords.',
    skill: 'reading', subskill: 'matching-headings', lessonType: 'question-type', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 22,
    objective: 'Match headings to paragraph purpose by separating the controlling idea from examples and details.',
    prerequisites: ['R01', 'R02', 'R03'], tags: ['matching-headings', 'main-idea', 'paragraph-purpose', 'keyword-trap'],
    ieltsSkill: 'reading', questionType: 'matching-headings', examRelevance: 'very-high', timed: false,
    errorTags: ['reading-heading-purpose', 'reading-detail-confusion', 'reading-keyword-match'], repairLessons: ['R01', 'R02', 'R03'], relatedLessons: ['R01', 'R02'], nextLessons: [],
    chinese: 'Matching Headings 要配的是整段的功能與主旨，不是某個細節出現的相同字。先用 5–10 個字概括段落，再看選項。',
    sections: [
      { title: 'Goal', html: `<p>By the end of this lesson, you will be able to choose a heading by answering one question:</p><div class="callout"><strong>Why did the writer include this paragraph?</strong></div>` },
      { title: '1. Learn — Summary before options', html: `<ol><li>Read the paragraph.</li><li>Write a 5–10 word summary of its purpose.</li><li>Only then compare headings.</li><li>Reject headings that match only an example or one sentence.</li></ol><p>This prevents the options from controlling how you read.</p>` },
      { title: '2. Notice — Topic is not purpose', html: `<div class="reading-passage"><p>Electric bicycles are often discussed as an alternative to cars, but their most immediate effect may be on ordinary cycling. Studies in hilly cities show that some people who previously considered a bicycle impractical are willing to cycle when electric assistance reduces the physical effort. E-bikes may therefore expand cycling to people who would not otherwise choose it.</p></div>`, blocks: [
        mcq('R05-Q1', 'Best heading', ['Why cars remain popular', 'Extending cycling to new users', 'The history of electric motors', 'Health problems caused by hills'], 'Extending cycling to new users', 'Cars and hills appear, but the paragraph’s purpose is to show how e-bikes make cycling practical for additional people.', 'reading-heading-purpose')
      ] },
      { title: '3. Independent Practice — The changing public library', html: `<div class="reading-passage"><p><strong>Paragraph A</strong><br>For generations, the public library was defined mainly by its collection. Digital publishing has weakened the need for every visitor to borrow a physical book, yet library use has not disappeared. In many cities, the institution has shifted from being primarily a store of materials to being a place where people can study, work, meet, and access services.</p><p><strong>Paragraph B</strong><br>This broader role is especially visible in digital support. Library staff may help visitors complete online forms, use government websites, create a résumé, or learn basic software. Such assistance is important for people who own a phone but do not have a computer, printer, stable connection, or confidence using unfamiliar systems.</p><p><strong>Paragraph C</strong><br>Some libraries have also changed how space is allocated. Shelving has been reduced in selected areas to create group rooms, quiet study zones, workshops, or small recording studios. Critics sometimes see this as moving away from the traditional mission of a library, while supporters argue that access to knowledge has always required more than shelves.</p><p><strong>Paragraph D</strong><br>None of these changes removes the need for books. Popular collections, children’s materials, local archives, and specialist resources remain important. The challenge is to preserve these strengths while responding to forms of learning and access that did not exist when many library buildings were designed.</p></div><div class="structure-box">i. Helping people cross the digital access gap\nii. Replacing books completely\niii. Redefining what a library is for\niv. A debate over how physical space should be used\nv. Balancing established strengths with newer needs\nvi. Why library buildings should close</div>`, blocks: [
        mcq('R05-Q2', 'Paragraph A', ['i', 'ii', 'iii', 'iv', 'v', 'vi'], 'iii', 'The paragraph describes a shift from collection-centred identity to a broader role.', 'reading-heading-purpose'),
        mcq('R05-Q3', 'Paragraph B', ['i', 'ii', 'iii', 'iv', 'v', 'vi'], 'i', 'All examples concern practical help with digital access and skills.', 'reading-heading-purpose'),
        mcq('R05-Q4', 'Paragraph C', ['i', 'ii', 'iii', 'iv', 'v', 'vi'], 'iv', 'The paragraph discusses reallocating space and the disagreement this creates.', 'reading-heading-purpose'),
        mcq('R05-Q5', 'Paragraph D', ['i', 'ii', 'iii', 'iv', 'v', 'vi'], 'v', 'It explicitly argues for preserving books while adapting to newer forms of access and learning.', 'reading-heading-purpose')
      ] },
      { title: '4. Distractor Lab', blocks: [
        mcq('R05-Q6', 'Why is heading “Replacing books completely” a trap for Paragraph C?', ['It uses no words from the paragraph.', 'The paragraph mentions reduced shelving, but not complete replacement of books.', 'It is too short.', 'Libraries never contain books.'], 'The paragraph mentions reduced shelving, but not complete replacement of books.', 'The heading exaggerates one detail into the paragraph’s whole purpose.', 'reading-detail-confusion'),
        mcq('R05-Q7', 'What is the best first move when two headings both seem possible?', ['Choose the one with more repeated words.', 'Summarise the paragraph without looking at either heading.', 'Choose the longer heading.', 'Read only the final sentence.'], 'Summarise the paragraph without looking at either heading.', 'An independent summary makes it easier to compare meaning rather than react to keywords.', 'reading-keyword-match')
      ] },
      { title: '5. Timed IELTS Transfer', html: `<p>For practice, give yourself about <strong>45–60 seconds per paragraph</strong> to form a provisional summary. This is a training target, not an official per-question rule.</p><p>Mark uncertain matches and return after the easier headings have been used. The remaining choices often become clearer.</p>` },
      { title: '6. Repair & Retry', html: `<p>When a heading is wrong, label why:</p><div class="structure-box">DETAIL TRAP · KEYWORD TRAP · TOO BROAD · TOO NARROW · WRONG PURPOSE</div><p>Then write a new 5–10 word heading yourself before reopening the options.</p>`, blocks: [
        { type: 'note', id: 'R05-own-heading', label: 'Write your own heading for Paragraph C', placeholder: 'Debate over...' }
      ] },
      { title: '7. Review', html: `<div class="callout success"><strong>Match purpose to purpose.</strong> A heading that repeats vocabulary but misses the paragraph’s job is still wrong.</div>` }
    ]
  },
  {
    id: 'L02',
    slug: 'why-you-hear-the-word-but-still-miss-the-answer',
    title: 'Why You Hear the Word but Still Miss the Answer',
    description: 'Process speech in meaningful chunks so reduced and connected words do not break your attention.',
    skill: 'listening', subskill: 'connected-speech', lessonType: 'skill', cefr: 'B2', ieltsRange: '5.5–6.5', difficulty: 3, estimatedMinutes: 20,
    objective: 'Follow short chunks of natural speech and recover the answer even when small function words are reduced.',
    prerequisites: ['L01'], tags: ['connected-speech', 'chunks', 'reduced-forms', 'processing'],
    ieltsSkill: 'listening', questionType: 'form-completion', examRelevance: 'high', timed: false,
    errorTags: ['listening-connected-speech', 'listening-word-fixation', 'listening-missed-detail'], repairLessons: ['L01'], relatedLessons: ['L01', 'L03'], nextLessons: ['L03'],
    chinese: '你可能每個字都「學過」，但自然語流會把小字弱化並連在一起。重點不是逐字聽清，而是把語音切成有意義的短語塊。',
    sections: [
      { title: 'Goal', html: `<p>Today you will practise hearing <strong>chunks</strong> rather than waiting for every word to arrive separately.</p><div class="callout warning">The current site uses prototype browser speech as a fallback. It is useful for the learning flow, but production audio should later use recorded natural speech.</div>` },
      { title: '1. Prepare', html: `<p>Before listening, predict the situation: a student is checking a study-room booking.</p><p>Listen for four anchors: <strong>old time → new time → purpose → key collection</strong>.</p>` },
      { title: '2. First Listen — Follow the change', blocks: [
        { type: 'audio', src: './media/audio/l02-connected-speech.mp3', testLike: true, label: 'First listen' },
        mcq('L02-Q1', 'What changes during the conversation?', ['The day of the booking', 'The start time', 'The room number', 'The presentation topic'], 'The start time', 'The booking moves from 2:00 to 1:30; the day and purpose do not change.', 'listening-missed-detail')
      ] },
      { title: '3. Second Listen — Catch the chunks', blocks: [
        { type: 'audio', src: './media/audio/l02-connected-speech.mp3', label: 'Second listen' },
        mcq('L02-Q2', 'What was the original start time?', ['1:00', '1:30', '2:00', '3:30'], '2:00', 'The staff member says the booking was from two until three-thirty.', 'listening-connected-speech'),
        mcq('L02-Q3', 'Why does the student need the room?', ['to record an interview', 'to practise a presentation', 'to meet a tutor', 'to complete an exam'], 'to practise a presentation', 'The student says they need the projector because they are practising a presentation.', 'listening-missed-detail'),
        mcq('L02-Q4', 'Where should the student collect the key?', ['from the library desk', 'from reception', 'from room 2B', 'from the earlier group'], 'from reception', 'The staff member says to collect the key from reception ten minutes before.', 'listening-connected-speech')
      ] },
      { title: '4. Transcript & chunking', html: `<details><summary class="btn soft">Open transcript after listening</summary><div class="transcript card subtle" style="margin-top:12px"><strong>Student:</strong> Hi, I booked room 2B for Thursday afternoon, but I think I may have written the time down wrongly. Could you check?<br><strong>Staff:</strong> Sure. You were going to have it from two until three-thirty, but the earlier group cancelled, so it’s available from one-thirty. Do you want to move it?<br><strong>Student:</strong> One-thirty would be better. We need the projector because we’re practising a presentation.<br><strong>Staff:</strong> That’s fine. The room has one built in. Just collect the key from reception ten minutes before.</div></details><p>Read it again in chunks:</p><div class="structure-box">Could you check? / You were going to have it / from two until three-thirty / but the earlier group cancelled / so it’s available / from one-thirty.</div>` },
      { title: '5. Notice — Function words carry structure', html: `<p>Small words may be acoustically weak but structurally important:</p><ul><li><strong>were going to</strong> → earlier plan</li><li><strong>but</strong> → change</li><li><strong>so</strong> → result</li><li><strong>because</strong> → reason</li></ul><p>You do not need perfect phonetic detail to use these relationships.</p>` },
      { title: '6. Micro Drill', blocks: [
        mcq('L02-Q5', 'You hear: “We were going to meet outside, but it’s starting to rain, so let’s use the café.” Where will they meet?', ['outside', 'in the café'], 'in the café', 'Track the chunk after “but” and the result after “so”.', 'listening-word-fixation'),
        mcq('L02-Q6', 'What should you do if one reduced word is unclear?', ['Stop mentally until you identify it', 'Keep following the next meaningful chunk', 'Translate the previous sentence', 'Guess the spelling immediately'], 'Keep following the next meaningful chunk', 'Losing one small word should not make you lose the next ten seconds of meaning.', 'listening-word-fixation')
      ] },
      { title: '7. Repair & Replay', html: `<p>Replay one sentence and mark only the <strong>content words</strong> first. Then add the relationship words.</p><div class="structure-box">two → three-thirty / BUT cancelled / SO available / one-thirty</div><p>This reduces the processing load.</p>`, blocks: [
        { type: 'note', id: 'L02-chunks', label: 'Write the four meaning chunks you heard', placeholder: 'old time / change / new time / next action' }
      ] },
      { title: '8. Review', html: `<div class="callout success">Listen in <strong>meaning chunks</strong>. Do not let one weakly pronounced word stop the stream.</div>` }
    ]
  },
  {
    id: 'L03',
    slug: 'recognize-paraphrases-while-listening',
    title: 'Recognize Paraphrases While Listening',
    description: 'Connect question language to a different spoken expression before the audio moves on.',
    skill: 'listening', subskill: 'paraphrase', lessonType: 'skill', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 20,
    objective: 'Recognise common lexical and grammatical paraphrases in real time while continuing to follow the speaker.',
    prerequisites: ['L01', 'L02'], tags: ['paraphrase', 'real-time-processing', 'synonym', 'question-preview'],
    ieltsSkill: 'listening', questionType: 'multiple-choice', examRelevance: 'very-high', timed: false,
    errorTags: ['listening-paraphrase', 'listening-keyword-waiting', 'listening-missed-detail'], repairLessons: ['VG01', 'L01'], relatedLessons: ['R03', 'L02'], nextLessons: ['L04'],
    chinese: '聽力題目常用 A 說法，錄音用 B 說法。不能等題目原字出現；要先預測同義概念，再即時辨認改寫。',
    sections: [
      { title: 'Goal', html: `<p>Question: <strong>What is included in the fee?</strong><br>Audio may say: <strong>The price covers...</strong></p><p>Your job is to connect meaning immediately.</p>` },
      { title: '1. Prepare — Predict paraphrase families', html: `<div class="grid two"><div class="card subtle"><strong>Question</strong><p>included in the fee</p><p>no experience required</p><p>bring your own</p><p>the course was moved</p></div><div class="card subtle"><strong>Possible audio</strong><p>the price covers</p><p>beginners are welcome</p><p>you’ll need to provide</p><p>has been rescheduled</p></div></div>` },
      { title: '2. First Listen', blocks: [
        { type: 'audio', src: './media/audio/l03-listening-paraphrase.mp3', testLike: true, label: 'First listen' },
        mcq('L03-Q1', 'What is included in the course fee?', ['the evening meal', 'the Saturday site visit', 'transport to the city', 'specialist clothing'], 'the Saturday site visit', 'The speaker says the price covers course materials and the Saturday site visit.', 'listening-paraphrase')
      ] },
      { title: '3. Second Listen', blocks: [
        { type: 'audio', src: './media/audio/l03-listening-paraphrase.mp3', label: 'Second listen' },
        mcq('L03-Q2', 'Who is the course suitable for?', ['only experienced researchers', 'people with no previous fieldwork experience', 'children under twelve', 'professional photographers'], 'people with no previous fieldwork experience', '“You don’t need previous fieldwork experience” paraphrases suitability for beginners.', 'listening-paraphrase'),
        mcq('L03-Q3', 'What must participants provide themselves?', ['a notebook', 'waterproof footwear', 'lunch', 'course materials'], 'waterproof footwear', 'The centre provides notebooks; participants are asked to bring waterproof footwear.', 'listening-missed-detail'),
        mcq('L03-Q4', 'Why has the Sunday session changed?', ['The tutor is unavailable.', 'The research centre will be closed.', 'Bad weather is expected.', 'Too few people registered.'], 'The research centre will be closed.', 'The speaker says Sunday’s lab session has been rescheduled because the research centre will be closed for maintenance.', 'listening-paraphrase')
      ] },
      { title: '4. Transcript', html: `<details><summary class="btn soft">Open transcript</summary><div class="transcript card subtle" style="margin-top:12px"><strong>Coordinator:</strong> The weekend field course costs sixty-five pounds. That price covers all course materials and the Saturday site visit, but not the evening meal. You don’t need previous fieldwork experience; beginners are welcome, although basic map-reading skills are useful. We provide notebooks and safety vests, but you’ll need to bring waterproof footwear. One final change: Sunday’s lab session has been rescheduled to next Saturday because the research centre will be closed for maintenance.</div></details>` },
      { title: '5. Paraphrase map', html: `<div class="structure-box">included in fee ↔ price covers\nno experience required ↔ beginners are welcome\nprovide yourself ↔ you’ll need to bring\nmoved to another time ↔ rescheduled\nnot open ↔ closed for maintenance</div>` },
      { title: '6. Real-time rule', html: `<p>If you keep waiting for the exact word <em>included</em>, you may miss <em>the price covers</em> and then miss the next question too.</p><div class="callout"><strong>Preview the meaning category, not one magic word.</strong></div>` },
      { title: '7. Repair Drill', blocks: [
        mcq('L03-Q5', 'Question phrase: “participants are not required to have specialist knowledge.” Which audio phrase matches?', ['experts will lead the course', 'no specialist knowledge is necessary', 'the course covers a specialist topic', 'specialist equipment is expensive'], 'no specialist knowledge is necessary', 'The grammatical form changes, but the requirement remains absent.', 'listening-paraphrase'),
        mcq('L03-Q6', 'Question phrase: “the venue has changed.” Which audio phrase matches?', ['the event will take longer', 'we’ve moved the session to the library', 'the room is larger than expected', 'the date remains the same'], 'we’ve moved the session to the library', 'Moving the session to a different place paraphrases a venue change.', 'listening-paraphrase')
      ] },
      { title: '8. Review', html: `<div class="callout success">Before the recording, predict <strong>meaning alternatives</strong>. During the recording, accept a different surface form quickly and keep moving.</div>` }
    ]
  },
  {
    id: 'L04',
    slug: 'dont-fall-for-the-distractor',
    title: "Don't Fall for the Distractor",
    description: 'Track corrections, abandoned plans, preferences, and final decisions instead of selecting the first plausible option.',
    skill: 'listening', subskill: 'distractors', lessonType: 'question-type', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 20,
    objective: 'Recognise common IELTS listening distractor patterns and wait for the speaker’s completed meaning before answering.',
    prerequisites: ['L01', 'L03'], tags: ['distractor', 'correction', 'change-of-mind', 'final-answer'],
    ieltsSkill: 'listening', questionType: 'multiple-choice', examRelevance: 'very-high', timed: false,
    errorTags: ['listening-distractor', 'listening-first-mention', 'listening-correction'], repairLessons: ['L01', 'L03'], relatedLessons: ['L01', 'L03'], nextLessons: ['L05'],
    chinese: '干擾項常不是「假的」，而是曾經考慮過但後來被修正、拒絕或替換的資訊。聽到選項關鍵字時不要立刻作答，要追到完整決定。',
    sections: [
      { title: 'Goal', html: `<div class="structure-box">possible option → correction / contrast → FINAL meaning</div><p>IELTS often tests the completed meaning, not the first plausible phrase you hear.</p>` },
      { title: '1. Common distractor patterns', html: `<ul><li><strong>old plan → new plan:</strong> “We were going to…, but…”</li><li><strong>preference change:</strong> “I thought…, actually…”</li><li><strong>rejected option:</strong> “We considered…, but decided against it.”</li><li><strong>conditional option:</strong> “If X happens, we’ll…, otherwise…”</li></ul>` },
      { title: '2. First Listen — Final decisions', blocks: [
        { type: 'audio', src: './media/audio/l04-distractors.mp3', testLike: true, label: 'First listen' },
        mcq('L04-Q1', 'When will the traveller leave?', ['Friday evening', 'Saturday morning', 'Saturday evening', 'Sunday morning'], 'Saturday morning', 'Friday evening is the first idea, but the traveller says Saturday morning is actually better.', 'listening-first-mention')
      ] },
      { title: '3. Second Listen — Track each correction', blocks: [
        { type: 'audio', src: './media/audio/l04-distractors.mp3', label: 'Second listen' },
        mcq('L04-Q2', 'Which seat does the traveller finally request?', ['window', 'aisle', 'table seat', 'no preference'], 'aisle', 'The traveller first asks about a window seat, then changes to an aisle seat to leave quickly.', 'listening-distractor'),
        mcq('L04-Q3', 'Which ticket does the traveller buy?', ['the cheapest non-refundable ticket', 'a flexible ticket', 'a first-class ticket', 'a student ticket'], 'a flexible ticket', 'The cheaper ticket is discussed but rejected because plans may change.', 'listening-distractor'),
        mcq('L04-Q4', 'Where will the traveller collect the ticket?', ['from the station machine', 'at the booking office', 'on the train', 'by post'], 'from the station machine', 'The clerk offers two options; the traveller chooses the machine because the booking office may be busy.', 'listening-correction')
      ] },
      { title: '4. Transcript', html: `<details><summary class="btn soft">Open transcript</summary><div class="transcript card subtle" style="margin-top:12px"><strong>Clerk:</strong> Which service were you looking at?<br><strong>Traveller:</strong> I was thinking of Friday evening, but Saturday morning is actually better because I can avoid travelling after work.<br><strong>Clerk:</strong> There’s an 8:40 and a 9:15.<br><strong>Traveller:</strong> Let’s take the 9:15. And could I have a window seat? Actually, make that an aisle seat—I need to get off quickly at the other end.<br><strong>Clerk:</strong> The cheapest ticket is non-refundable. The flexible one is twelve pounds more.<br><strong>Traveller:</strong> I might have to change my return time, so I’ll take the flexible one.<br><strong>Clerk:</strong> You can collect it at the booking office or from a machine.<br><strong>Traveller:</strong> The office may be busy, so I’ll use the machine.</div></details>` },
      { title: '5. Distractor markers', html: `<p>Train your attention to stay open after:</p><div class="structure-box">but · actually · instead · rather · changed my mind · decided against · in the end · so I’ll...</div><p>These words do not guarantee an answer, but they often signal that earlier information is being revised.</p>` },
      { title: '6. Repair Drill — Delay commitment', blocks: [
        mcq('L04-Q5', 'Audio meaning: “We planned to meet at the café, but it closes early, so the library is safer.” What is the answer?', ['café', 'library'], 'library', 'The café is an abandoned plan; “so” introduces the final decision.', 'listening-distractor'),
        mcq('L04-Q6', 'What is the best mental habit when you hear an option word?', ['Select it immediately', 'Hold it provisionally and keep listening', 'Stop listening to confirm spelling', 'Ignore all later information'], 'Hold it provisionally and keep listening', 'Treat the first match as a candidate until the speaker completes the thought.', 'listening-first-mention')
      ] },
      { title: '7. IELTS Transfer', html: `<p>For multiple choice, lightly mark a possible answer, but do not emotionally commit to it. A later phrase may narrow, reject, or replace it.</p><div class="callout success"><strong>Hear → hold → confirm.</strong> Not hear → click.</div>` },
      { title: '8. Review', html: `<div class="callout success">A distractor is often <strong>real information that is no longer the final answer</strong>.</div>` }
    ]
  },
  {
    id: 'L05',
    slug: 'predict-before-you-listen',
    title: 'Predict Before You Listen',
    description: 'Use the question to predict answer type, grammar, and likely meaning before the recording begins.',
    skill: 'listening', subskill: 'prediction', lessonType: 'question-type', cefr: 'B2', ieltsRange: '5.5–7.0', difficulty: 3, estimatedMinutes: 18,
    objective: 'Predict the form and meaning of likely answers so your attention is ready before the relevant audio arrives.',
    prerequisites: ['L01'], tags: ['prediction', 'form-completion', 'answer-type', 'question-preview'],
    ieltsSkill: 'listening', questionType: 'form-completion', examRelevance: 'very-high', timed: false,
    errorTags: ['listening-prediction', 'listening-answer-type', 'listening-missed-detail'], repairLessons: ['L01'], relatedLessons: ['L02', 'L03', 'L04'], nextLessons: [],
    chinese: '播放前先看題目，預測空格需要姓名、數字、地點、物品、形容詞或其他語意類型。這不是猜答案，而是預先設定注意力。',
    sections: [
      { title: 'Goal', html: `<p>Prediction does not mean guessing the exact word. It means preparing your attention.</p><div class="structure-box">What grammar fits? → What answer type fits? → What meanings are plausible?</div>` },
      { title: '1. Predict from the form', html: `<div class="reading-passage"><p>Community Science Workshop<br>Name: ______<br>Fee: £______<br>Meeting room: ______<br>Bring: ______<br>Start time: ______</p></div>`, blocks: [
        mcq('L05-Q1', 'What answer type is most likely after “Fee: £”?', ['a person', 'a number', 'an adjective', 'a verb'], 'a number', 'The pound symbol strongly predicts a numerical amount.', 'listening-answer-type'),
        mcq('L05-Q2', 'What answer type is most likely after “Bring:”?', ['an item or items', 'a date only', 'a surname only', 'a reason clause only'], 'an item or items', 'The label “Bring” prepares you to listen for an object or required equipment.', 'listening-prediction')
      ] },
      { title: '2. First Listen — Fill the frame mentally', blocks: [
        { type: 'audio', src: './media/audio/l05-predict.mp3', testLike: true, label: 'First listen' },
        mcq('L05-Q3', 'What is the participant’s surname?', ['Patel', 'Peters', 'Payton', 'Parker'], 'Patel', 'The registration is under the surname Patel.', 'listening-missed-detail'),
        mcq('L05-Q4', 'What is the workshop fee?', ['£8', '£18', '£28', '£80'], '£18', 'The speaker confirms the fee is eighteen pounds.', 'listening-missed-detail')
      ] },
      { title: '3. Second Listen — Confirm remaining details', blocks: [
        { type: 'audio', src: './media/audio/l05-predict.mp3', label: 'Second listen' },
        mcq('L05-Q5', 'Where should participants meet?', ['main hall', 'education room', 'library entrance', 'science lab'], 'education room', 'The education room is on the second floor and is the meeting point.', 'listening-missed-detail'),
        mcq('L05-Q6', 'What should participants bring?', ['a notebook', 'closed-toe shoes', 'lunch', 'a camera'], 'closed-toe shoes', 'Notebooks are provided. Closed-toe shoes are required for the practical activity.', 'listening-distractor'),
        mcq('L05-Q7', 'What time does the workshop start?', ['9:15', '9:30', '9:45', '10:15'], '9:45', 'Registration opens at 9:30, but the workshop itself starts at 9:45.', 'listening-distractor')
      ] },
      { title: '4. Transcript', html: `<details><summary class="btn soft">Open transcript</summary><div class="transcript card subtle" style="margin-top:12px"><strong>Staff:</strong> I’ve found your registration—it’s under the surname Patel. The workshop fee is eighteen pounds, and that includes all materials. Please meet in the education room on the second floor, not in the main hall. We provide notebooks, so you don’t need to bring one, but you must wear closed-toe shoes for the practical activity. Registration opens at nine-thirty and the workshop itself starts at nine-forty-five.</div></details>` },
      { title: '5. Prediction protects attention', html: `<p>If you know you need a <strong>number</strong>, you can reject nearby names and places more quickly. If you know you need an <strong>item</strong>, you are ready for noun phrases.</p><p>Prediction also helps with grammar: “an ______ course” suggests a word that can function before a noun.</p>` },
      { title: '6. Prediction is not commitment', html: `<div class="callout warning">Do not decide the exact answer before listening.</div><p>If a form says <em>Transport:</em>, possible meanings include bus, train, coach, bicycle, or walking. Keep the category open until the evidence arrives.</p>` },
      { title: '7. Repair Drill', blocks: [
        mcq('L05-Q8', 'Form: “Reason for visit: ______”. What should you listen for?', ['a purpose or reason', 'only a number', 'only a person’s name', 'a spelling of a postcode'], 'a purpose or reason', 'The field label prepares you for a phrase explaining why the person is visiting.', 'listening-prediction'),
        mcq('L05-Q9', 'Form: “Preferred day: ______”. Which prediction is most useful?', ['Listen for a day/date expression', 'The answer must be Monday', 'Ignore the question until the audio starts', 'Listen only for prices'], 'Listen for a day/date expression', 'Predict the answer category without guessing the exact day.', 'listening-answer-type')
      ] },
      { title: '8. Review', html: `<div class="callout success"><strong>Predict the shape of the answer, not the answer itself.</strong></div>` }
    ]
  },
  {
    id: 'W02',
    slug: 'one-main-idea-is-not-enough-develop-it',
    title: 'One Main Idea Is Not Enough — Develop It',
    description: 'Turn a valid idea into a developed argument using reason, explanation, consequence, and example.',
    skill: 'writing', subskill: 'idea-development', lessonType: 'skill', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 22,
    objective: 'Develop a Task 2 main idea instead of repeating it in different words.',
    prerequisites: ['W01'], tags: ['idea-development', 'task-response', 'explanation', 'example'],
    ieltsSkill: 'writing', questionType: 'task-2', examRelevance: 'very-high', timed: false,
    errorTags: ['writing-idea-development', 'writing-repetition', 'writing-example'], repairLessons: ['W01'], relatedLessons: ['W01', 'W03'], nextLessons: ['W03'],
    chinese: '有主旨不等於有發展。每個主要觀點至少要回答：為什麼？怎麼發生？結果是什麼？有什麼具體例子？避免只是換句話重複同一觀點。',
    sections: [
      { title: 'Goal', html: `<div class="structure-box">IDEA → REASON → EXPLANATION / CONSEQUENCE → EXAMPLE</div><p>You do not need every element every time, but the reader needs a clear chain.</p>` },
      { title: '1. Learn — Repetition is not development', html: `<div class="grid two"><div class="card subtle"><strong>Repeated</strong><p>Public transport is beneficial because it is good for cities. This is an important benefit and cities can benefit greatly from it.</p></div><div class="card subtle"><strong>Developed</strong><p>Reliable public transport can reduce pressure on city roads because one bus or train can carry many passengers at once. If commuters can reach work without driving, fewer private cars compete for limited road space during peak hours.</p></div></div>` },
      { title: '2. Ask one useful question at a time', html: `<ul><li><strong>Why?</strong> What causes or justifies this?</li><li><strong>How?</strong> What mechanism connects the idea to the outcome?</li><li><strong>So what?</strong> What consequence follows?</li><li><strong>For example?</strong> What specific case makes it concrete?</li></ul>` },
      { title: '3. Choose the stronger development', blocks: [
        mcq('W02-Q1', 'Main idea: Flexible work can improve employee retention. Which continuation develops it best?', ['Retention is very important and companies should consider it carefully.', 'Employees who can adjust working hours may find it easier to manage family or commuting responsibilities, so they have less reason to leave solely because the schedule is difficult.', 'Flexible work is a modern trend and many people know about it.'], 'Employees who can adjust working hours may find it easier to manage family or commuting responsibilities, so they have less reason to leave solely because the schedule is difficult.', 'It explains a mechanism linking flexibility to lower motivation to leave.', 'writing-idea-development'),
        mcq('W02-Q2', 'Which sentence is mainly repetition rather than development?', ['This can lower household energy use because residents receive immediate feedback about waste.', 'In other words, the policy is beneficial because it has many benefits.', 'For example, a display may show when electricity use rises sharply.', 'As a result, users can identify which habits consume the most energy.'], 'In other words, the policy is beneficial because it has many benefits.', 'It repeats “beneficial/benefits” without explaining why or how.', 'writing-repetition')
      ] },
      { title: '4. Guided Development', html: `<div class="reading-passage"><p><strong>Prompt:</strong> Some cities charge drivers to enter busy central areas. Do the advantages outweigh the disadvantages?</p><p><strong>Main idea:</strong> A congestion charge can improve bus reliability.</p></div><div class="structure-box">Reason: fewer private cars enter the busiest streets.\nHow: buses spend less time trapped in traffic.\nConsequence: travel times become more predictable.\nExample: commuters may trust a 20-minute bus journey instead of allowing extra time for delays.</div>` },
      { title: '5. Build Your Own Chain', blocks: [
        { type: 'note', id: 'W02-idea', label: 'Idea', placeholder: 'One advantage/disadvantage is...' },
        { type: 'note', id: 'W02-why', label: 'Why / how?', placeholder: 'This happens because...' },
        { type: 'note', id: 'W02-so-what', label: 'Consequence', placeholder: 'As a result...' },
        { type: 'note', id: 'W02-example', label: 'Example', placeholder: 'For example...' }
      ] },
      { title: '6. Mini Writing Task', html: `<div class="reading-passage"><p>Some employers are considering a four-day working week with longer working days. Do you think this is a positive or negative development?</p></div><p>Write <strong>100–140 words</strong> developing one main idea. Make the causal chain clear.</p>`, blocks: [
        { type: 'writing', id: 'W02-draft', promptType: 'writing-task2-feedback', task: 'Some employers are considering a four-day working week with longer working days. Do you think this is a positive or negative development?', minWords: 100, maxWords: 140 }
      ] },
      { title: '7. Self-check', html: `<div class="checklist"><label class="check-item"><input type="checkbox"> Can I underline one clear main idea?</label><label class="check-item"><input type="checkbox"> Did I explain why or how it happens?</label><label class="check-item"><input type="checkbox"> Did the example support the idea rather than introduce a new topic?</label><label class="check-item"><input type="checkbox"> Did I avoid repeating the same claim with synonyms?</label></div>` },
      { title: '8. Review', html: `<div class="callout success">Development means the reader can follow the <strong>logic after the idea</strong>.</div>` }
    ]
  },
  {
    id: 'W03',
    slug: 'build-a-strong-academic-paragraph',
    title: 'Build a Strong Academic Paragraph',
    description: 'Give each paragraph one clear purpose, a controlled progression, and enough support to earn its place.',
    skill: 'writing', subskill: 'paragraph-coherence', lessonType: 'skill', cefr: 'B2+', ieltsRange: '6.0–7.5', difficulty: 4, estimatedMinutes: 22,
    objective: 'Write a paragraph with a clear controlling idea and logical development instead of a list of loosely connected sentences.',
    prerequisites: ['W01', 'W02'], tags: ['paragraph', 'coherence', 'topic-sentence', 'progression'],
    ieltsSkill: 'writing', questionType: 'task-2', examRelevance: 'very-high', timed: false,
    errorTags: ['writing-coherence', 'writing-paragraph-focus', 'writing-linking'], repairLessons: ['VG03', 'W02'], relatedLessons: ['W01', 'W02'], nextLessons: [],
    chinese: '好的段落不是「很多連接詞」，而是一個明確主旨加上自然推進。每一句都要幫助同一個段落任務，不要突然換主題。',
    sections: [
      { title: 'Goal', html: `<div class="structure-box">CONTROLLING IDEA → EXPLANATION → SUPPORT → CONSEQUENCE / EXAMPLE</div><p>Coherence comes from progression, not from inserting a linker at the start of every sentence.</p>` },
      { title: '1. Learn — One paragraph, one main job', html: `<p>A paragraph can acknowledge a drawback, explain a cause, develop an advantage, or propose a solution. It becomes difficult to follow when it tries to perform several unrelated jobs.</p><div class="callout"><strong>Before writing, name the paragraph’s job in five words.</strong></div>` },
      { title: '2. Notice — Logical progression', html: `<div class="reading-passage"><p><strong>Job: explain one benefit of mixed-age housing.</strong><br>Neighbourhoods with a mix of age groups can make informal support easier to access. Older residents may need occasional help with shopping or digital services, while younger families may value advice or short periods of practical help. When people with different needs live close to one another and use the same shared spaces, these small exchanges are more likely to occur naturally. This does not replace professional care, but it can strengthen everyday social support.</p></div><p>Each sentence develops or qualifies the same central idea.</p>` },
      { title: '3. Spot the broken paragraph', blocks: [
        mcq('W03-Q1', 'Which sentence most clearly breaks the paragraph focus about the health benefits of urban walking?', ['Walking short journeys adds regular physical activity to daily routines.', 'People may be more willing to walk when shops and services are close to home.', 'Some cities also have historic railway stations that attract tourists.', 'As a result, walkable neighbourhoods can support activity without requiring a separate exercise session.'], 'Some cities also have historic railway stations that attract tourists.', 'It introduces a new topic that does not develop the health/walking argument.', 'writing-paragraph-focus'),
        mcq('W03-Q2', 'Which transition shows the clearest logical relationship?', ['Moreover, therefore, however, people walk.', 'Because nearby services reduce the distance of everyday trips, residents can complete more journeys on foot.', 'On the other hand, furthermore, walking is good.', 'Firstly, secondly, in conclusion, shops are close.'], 'Because nearby services reduce the distance of everyday trips, residents can complete more journeys on foot.', 'The relationship is expressed through meaning and grammar rather than stacked linking words.', 'writing-linking')
      ] },
      { title: '4. Paragraph blueprint', html: `<div class="reading-passage"><p><strong>Prompt:</strong> Governments should invest more in preventive health measures than in treating illness. To what extent do you agree?</p></div><div class="structure-box">Job: explain one reason prevention deserves investment.\nTopic sentence: Prevention can reduce demand for expensive treatment.\nExplain: Early screening or lifestyle programmes can address risk before illness becomes severe.\nSupport: Treating advanced disease often requires longer and more specialised care.\nConsequence: Preventive spending may therefore protect both patients and health-system capacity.</div>` },
      { title: '5. Build a Paragraph Plan', blocks: [
        { type: 'note', id: 'W03-job', label: 'Paragraph job — five words or fewer', placeholder: 'Explain why...' },
        { type: 'note', id: 'W03-topic', label: 'Controlling idea', placeholder: 'One important reason is...' },
        { type: 'note', id: 'W03-support', label: 'Two support steps', placeholder: 'This is because... / This means...' },
        { type: 'note', id: 'W03-limit', label: 'Optional qualification', placeholder: 'This does not mean...' }
      ] },
      { title: '6. Mini Writing Task', html: `<div class="reading-passage"><p>Some people believe cities should create more public spaces even if this reduces space available for private cars. To what extent do you agree or disagree?</p></div><p>Write <strong>130–170 words</strong>: one body paragraph with one clear job and controlled progression.</p>`, blocks: [
        { type: 'writing', id: 'W03-draft', promptType: 'writing-task2-feedback', task: 'Some people believe cities should create more public spaces even if this reduces space available for private cars. To what extent do you agree or disagree?', minWords: 130, maxWords: 170 }
      ] },
      { title: '7. Coherence Check', html: `<div class="checklist"><label class="check-item"><input type="checkbox"> Can I describe the paragraph’s job in one short phrase?</label><label class="check-item"><input type="checkbox"> Does every sentence support that job?</label><label class="check-item"><input type="checkbox"> Does each sentence create a reason to read the next one?</label><label class="check-item"><input type="checkbox"> Are linkers expressing real relationships rather than decorating the paragraph?</label></div>` },
      { title: '8. Review', html: `<div class="callout success">A coherent paragraph is a <strong>controlled line of thought</strong>, not a collection of sentences joined by transition words.</div>` }
    ]
  }
];

export const BATCH_01_META = [
  { id: 'R02', title: 'Read for Structure, Not Just Words', skill: 'reading', difficulty: 3, estimatedMinutes: 20, targetRelevance: 0.9 },
  { id: 'R03', title: 'Paraphrases: The Language IELTS Uses to Hide Answers', skill: 'reading', difficulty: 4, estimatedMinutes: 20, targetRelevance: 0.95 },
  { id: 'R04', title: 'True, False or Not Given?', skill: 'reading', difficulty: 4, estimatedMinutes: 22, targetRelevance: 1 },
  { id: 'R05', title: 'Matching Headings Without Reading Every Line', skill: 'reading', difficulty: 4, estimatedMinutes: 22, targetRelevance: 1 },
  { id: 'L02', title: 'Why You Hear the Word but Still Miss the Answer', skill: 'listening', difficulty: 3, estimatedMinutes: 20, targetRelevance: 0.9 },
  { id: 'L03', title: 'Recognize Paraphrases While Listening', skill: 'listening', difficulty: 4, estimatedMinutes: 20, targetRelevance: 0.95 },
  { id: 'L04', title: "Don't Fall for the Distractor", skill: 'listening', difficulty: 4, estimatedMinutes: 20, targetRelevance: 1 },
  { id: 'L05', title: 'Predict Before You Listen', skill: 'listening', difficulty: 3, estimatedMinutes: 18, targetRelevance: 1 },
  { id: 'W02', title: 'One Main Idea Is Not Enough — Develop It', skill: 'writing', difficulty: 4, estimatedMinutes: 22, targetRelevance: 1 },
  { id: 'W03', title: 'Build a Strong Academic Paragraph', skill: 'writing', difficulty: 4, estimatedMinutes: 22, targetRelevance: 1 }
];

export const BATCH_01_VOCABULARY = [
  {
    id: 'v-supporting-evidence', term: 'supporting evidence', meaning: 'facts, examples, or research used to strengthen a claim', sourceLesson: 'R02', sourceSkill: 'reading',
    collocations: ['supporting evidence', 'provide evidence for', 'evidence suggests that'],
    prompt: 'A survey result can serve as ______ for a writer’s claim.', answer: 'supporting evidence', distractors: ['final conclusion', 'unrelated detail']
  },
  {
    id: 'v-by-contrast', term: 'by contrast', meaning: 'used to introduce a clear difference from the previous idea', sourceLesson: 'R02', sourceSkill: 'reading',
    collocations: ['by contrast', 'in contrast to', 'a sharp contrast'],
    prompt: 'Private cars use road space inefficiently. ______, a full bus can move many passengers at once.', answer: 'By contrast', distractors: ['For example', 'As a result']
  },
  {
    id: 'v-widen-access', term: 'widen access to', meaning: 'to make something available or reachable to more people', sourceLesson: 'R03', sourceSkill: 'reading',
    collocations: ['widen access to', 'improve access to', 'access to education'],
    prompt: 'Online delivery can ______ specialist courses for learners outside major cities.', answer: 'widen access to', distractors: ['widen access of', 'wide access to']
  },
  {
    id: 'v-reduce-reliance', term: 'reduce reliance on', meaning: 'to make people or systems less dependent on something', sourceLesson: 'R03', sourceSkill: 'reading',
    collocations: ['reduce reliance on', 'reliance on imported energy', 'be heavily reliant on'],
    prompt: 'Better rail services could ______ private cars for commuting.', answer: 'reduce reliance on', distractors: ['reduce reliance of', 'lower rely on']
  },
  {
    id: 'v-insufficient-evidence', term: 'insufficient evidence', meaning: 'not enough information or proof to support a conclusion', sourceLesson: 'R04', sourceSkill: 'reading',
    collocations: ['insufficient evidence', 'evidence is insufficient', 'lack sufficient evidence'],
    prompt: 'If the passage neither supports nor contradicts a claim, there may be ______ to decide.', answer: 'insufficient evidence', distractors: ['a false statement', 'complete proof']
  },
  {
    id: 'v-reschedule', term: 'reschedule a session', meaning: 'to arrange an event for a different time or date', sourceLesson: 'L03', sourceSkill: 'listening',
    collocations: ['reschedule a session', 'reschedule an appointment', 'be rescheduled for'],
    prompt: 'Because the centre will be closed, the organisers need to ______.', answer: 'reschedule a session', distractors: ['repeat a schedule', 'schedule out a session']
  },
  {
    id: 'v-final-decision', term: 'final decision', meaning: 'the choice that remains after alternatives have been considered', sourceLesson: 'L04', sourceSkill: 'listening',
    collocations: ['make a final decision', 'reach a decision', 'final choice'],
    prompt: 'In a distractor question, keep listening until the speaker reaches the ______.', answer: 'final decision', distractors: ['first mention', 'keyword list']
  },
  {
    id: 'v-lead-to', term: 'lead to', meaning: 'to cause or contribute to a result', sourceLesson: 'W02', sourceSkill: 'writing',
    collocations: ['lead to an increase in', 'lead to better outcomes', 'can lead to'],
    prompt: 'Long commuting times can ______ higher stress and lower job satisfaction.', answer: 'lead to', distractors: ['lead for', 'result to']
  },
  {
    id: 'v-address-concern', term: 'address a concern', meaning: 'to deal with or respond to an issue that causes worry or difficulty', sourceLesson: 'W03', sourceSkill: 'writing',
    collocations: ['address a concern', 'address a problem', 'address the issue of'],
    prompt: 'A strong counterargument paragraph should acknowledge and ______ rather than ignore it.', answer: 'address a concern', distractors: ['answer a concern to', 'address about a concern']
  }
];

for (const lesson of CURRICULUM_BATCH_01) {
  if (!LESSONS.some(existing => existing.id === lesson.id)) LESSONS.push(lesson);
}
for (const meta of BATCH_01_META) {
  if (!CORE_LESSON_META.some(existing => existing.id === meta.id)) CORE_LESSON_META.push(meta);
}
for (const item of BATCH_01_VOCABULARY) {
  if (!VOCABULARY_ITEMS.some(existing => existing.id === item.id)) VOCABULARY_ITEMS.push(item);
}
