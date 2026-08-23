import { QUESTION_TYPE_LABS } from './question-type-lab-v1.js';
import { QUESTION_TYPE_LABS_V2 } from './question-type-lab-v2.js';

const mcq = (id, prompt, options, answer, rationale, errorTag) => ({
  type: 'quiz', id, prompt, options, answer, rationale, errorTag
});

export const LAB_DEPTH_LISTENING_SCRIPTS = {
  'QL01-B': `Advisor: We could hold the careers session in the lecture theatre; it has plenty of seats. Student: I thought so too, but the theatre is being used for exams that afternoon. Advisor: Right. The seminar room is available, though it only holds forty people. Student: That should be enough. Last year only thirty-two attended, so let's book the seminar room.`,
  'QL01-C': `Mina: I nearly chose the river walk because it starts close to the hotel. Ravi: The forecast says heavy rain, though. The museum tour is indoors, but we've already been there. Mina: True. What about the market visit? Ravi: It doesn't start until eleven, which gives us time for breakfast. Mina: Good point. Let's do the market visit.`,
  'QL02-B': `Receptionist: I have your booking here. The family name is Mercer, M-E-R-C-E-R. You're joining the pottery workshop on the eighteenth of September. It starts at ten fifteen, but please arrive by ten o'clock to collect an apron. The materials fee is twenty-two pounds, payable at reception.`,
  'QL02-C': `Guide: For tomorrow's coastal survey, meet beside the west gate at seven forty-five. Bring a pencil and a reusable water bottle. We provide the measuring equipment. The coach leaves at eight sharp, and lunch will be available at the visitor centre.`,
  'QL03-B': `Guide: Start at the main entrance. Walk straight ahead until you reach the fountain. Turn left there and pass the café on your right. The information desk is the next room on the left, directly opposite the small gallery. The accessible lift is just beyond the information desk.`,
  'QL03-C': `Host: From reception, take the corridor on your right. Go past Room A and continue to the glass doors. Immediately after the doors, turn left. The workshop room is at the end of that short corridor, beside the emergency exit. Do not use the room opposite the kitchen; that is the staff room.`,
  'QL04-B': `Speaker 1: I liked the course content, but what really helped me was having a weekly deadline. Without that structure, I would have postponed the exercises. Speaker 2: The deadlines were fine for me. My main difficulty was that I couldn't ask questions in real time. I wanted more live contact with the tutor. Speaker 3: I didn't need more tutor contact, but the examples were mostly from large companies. I wanted cases closer to small community organisations.`,
  'QL04-C': `Aisha: The new office is quieter than the old one, which is useful, but the biggest improvement is the natural light. Ben: I notice the light too, but for me the important change is the shorter journey. Cara: My journey is actually longer now. What I value is having several small meeting rooms instead of one large shared space.`,
  'QL05-B': `Interviewer: What should volunteers bring on the first day? Coordinator: Just photo identification. We provide gloves, tools and drinking water. Interviewer: And where do they meet? Coordinator: At the north entrance to Riverside Park, next to the bicycle racks. Please arrive by eight twenty.`,
  'QL05-C': `Tutor: The field notebook is due on Monday the twenty-third. Submit it online as a single PDF. The maximum length is twelve pages, not including the reference list. If you have technical problems, email the course office before four p.m. on Friday.`,
  'QL06-B': `Lecturer: The earliest prototypes failed mainly because the material became brittle in cold conditions. Engineers first tried increasing its thickness, but that added too much weight. The successful redesign used a flexible outer layer instead.`,
  'QL06-C': `Manager: We initially expected the renovation to finish in April. A delay in electrical work moved the date to May, and then the supplier confirmed that the new desks would arrive on the twelfth. So staff will return to the office on Monday the fifteenth of May.`
};

const depth = {
  QR01: [
    {
      set: 'B', label: 'Independent', topic: 'Community cooling centres',
      html: `<div class="reading-passage"><p>During a summer heatwave, the council opened four public cooling centres. Three were located in libraries and one in a sports hall. The centres were free to enter, but the evaluation report recorded visitor numbers only; it did not ask visitors whether the centres changed their health outcomes.</p></div>`,
      questions: [
        mcq('QR01-B1','All four cooling centres were located in libraries.',['TRUE','FALSE','NOT GIVEN'],'FALSE','Three centres were in libraries, while one was in a sports hall, so the statement is directly contradicted.','reading-scope'),
        mcq('QR01-B2','People had to pay to use the cooling centres.',['TRUE','FALSE','NOT GIVEN'],'FALSE','The passage explicitly states that the centres were free to enter.','reading-contradiction'),
        mcq('QR01-B3','The cooling centres reduced heat-related illness among visitors.',['TRUE','FALSE','NOT GIVEN'],'NOT GIVEN','The report counted visitors but did not measure health outcomes, so the claimed effect cannot be established from the passage.','reading-not-given')
      ]
    },
    {
      set: 'C', label: 'Retry Challenge', topic: 'School breakfast trial',
      html: `<div class="reading-passage"><p>A secondary school introduced a free breakfast programme for one term. Attendance during first-period classes improved slightly compared with the previous term. Teachers also reported fewer late arrivals. The school did not compare examination scores before and after the programme.</p></div>`,
      questions: [
        mcq('QR01-C1','First-period attendance was somewhat better during the breakfast programme.',['TRUE','FALSE','NOT GIVEN'],'TRUE','The passage states that first-period attendance improved slightly compared with the previous term.','reading-paraphrase'),
        mcq('QR01-C2','Teachers reported that late arrivals became more common.',['TRUE','FALSE','NOT GIVEN'],'FALSE','Teachers reported fewer late arrivals, which directly contradicts the statement.','reading-contradiction'),
        mcq('QR01-C3','The programme caused students to achieve higher examination scores.',['TRUE','FALSE','NOT GIVEN'],'NOT GIVEN','No before-and-after examination score comparison was made, so the passage does not provide evidence for this claim.','reading-not-given')
      ]
    }
  ],
  QR02: [
    {
      set:'B', label:'Independent', topic:'Repairing historic buildings',
      html:`<div class="reading-passage"><p><strong>A</strong> Old buildings often lose less energy when small air leaks are sealed, yet fully replacing original windows can remove historically important material.</p><p><strong>B</strong> Surveyors increasingly use thermal cameras to identify where heat escapes before recommending work. This allows repairs to target specific weaknesses rather than applying the same solution everywhere.</p><p><strong>C</strong> Owners may also need to balance energy savings against moisture control. A wall that is sealed too aggressively can trap water and damage timber.</p></div><div class="structure-box">i. A diagnostic approach before intervention<br>ii. Why all original windows should be replaced<br>iii. A risk created by excessive sealing<br>iv. Balancing improvement with conservation</div>`,
      questions:[
        mcq('QR02-B1','Paragraph A',['i','ii','iii','iv'],'iv','Paragraph A balances reducing air leakage with preserving historically important building material.','reading-paragraph-purpose'),
        mcq('QR02-B2','Paragraph B',['i','ii','iii','iv'],'i','The paragraph focuses on using thermal imaging to diagnose specific problems before deciding on repairs.','reading-heading-keyword'),
        mcq('QR02-B3','Paragraph C',['i','ii','iii','iv'],'iii','The paragraph explains the moisture risk that can result when a building is sealed too aggressively.','reading-heading-scope')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Citizen science',
      html:`<div class="reading-passage"><p><strong>A</strong> Large wildlife surveys can cover more ground when members of the public submit observations through mobile apps. The resulting volume of data would be difficult for a small research team to collect alone.</p><p><strong>B</strong> More observations do not automatically mean better evidence. Experienced volunteers may identify species accurately, while beginners can confuse similar-looking animals. Projects therefore use photographs, training materials and expert checking.</p><p><strong>C</strong> Participation can also change the volunteers themselves. Some report paying closer attention to seasonal changes and local habitats after joining a project.</p></div><div class="structure-box">i. Quality control for public observations<br>ii. A personal effect of taking part<br>iii. Extending the scale of data collection<br>iv. Why mobile phones harm wildlife</div>`,
      questions:[
        mcq('QR02-C1','Paragraph A',['i','ii','iii','iv'],'iii','Its main purpose is to explain how public participation expands the geographic scale and volume of observations.','reading-paragraph-purpose'),
        mcq('QR02-C2','Paragraph B',['i','ii','iii','iv'],'i','The paragraph identifies accuracy problems and explains the checks used to control data quality.','reading-heading-detail'),
        mcq('QR02-C3','Paragraph C',['i','ii','iii','iv'],'ii','The paragraph is about a change in volunteers’ awareness after participation, not about the research data itself.','reading-heading-keyword')
      ]
    }
  ],
  QR03: [
    {
      set:'B', label:'Independent', topic:'Quiet zones on trains',
      html:`<div class="reading-passage"><p>Rail operators introduced quiet carriages to give passengers a space with fewer phone calls and electronic sounds. Surveys show that the policy is valued most on longer journeys, but enforcement remains difficult because expectations about acceptable noise differ between passengers.</p></div>`,
      questions:[
        mcq('QR03-B1','Why were quiet carriages introduced?',['To reduce ticket prices','To provide a lower-noise travel space','To shorten long journeys','To ban all electronic devices'],'To provide a lower-noise travel space','The first sentence states that the aim was to provide a space with fewer calls and electronic sounds.','reading-mcq-detail'),
        mcq('QR03-B2','What makes the policy difficult to enforce?',['Passengers disagree about what level of noise is acceptable','Long journeys are becoming less common','Operators cannot identify electronic devices','Surveys show nobody values quiet carriages'],'Passengers disagree about what level of noise is acceptable','The passage explicitly links enforcement difficulty to differing expectations about acceptable noise.','reading-mcq-keyword'),
        mcq('QR03-B3','Which claim would be too broad?',['Some passengers value quiet carriages','The policy is valued especially on longer journeys','Every passenger wants complete silence','Noise expectations can differ'],'Every passenger wants complete silence','The passage never makes a universal claim about every passenger or complete silence.','reading-mcq-scope')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Urban delivery hubs',
      html:`<div class="reading-passage"><p>Some cities are testing neighbourhood delivery hubs where parcels are transferred from large vans to cargo bicycles for the final kilometre. The approach can reduce van traffic on narrow streets, although it requires secure local space for sorting goods. Its success therefore depends partly on whether suitable sites can be found close to customers.</p></div>`,
      questions:[
        mcq('QR03-C1','What is the main advantage described?',['Cargo bicycles can replace all freight transport','Large vans can make more deliveries in rural areas','Van traffic on narrow streets may be reduced','Sorting goods no longer requires space'],'Van traffic on narrow streets may be reduced','The passage presents reduced van traffic as the main benefit of transferring parcels to cargo bicycles.','reading-mcq-detail'),
        mcq('QR03-C2','What limitation does the writer identify?',['Cargo bicycles are always slower','The system needs secure sorting space in useful locations','Customers must collect every parcel themselves','Large vans cannot carry parcels'],'The system needs secure sorting space in useful locations','The final two sentences emphasize the need for secure sites close to customers.','reading-mcq-keyword'),
        mcq('QR03-C3','Which option best matches the writer’s conclusion?',['The approach works equally well in every city','Site availability can influence whether the approach succeeds','Delivery hubs remove the need for vans entirely','Only customers determine delivery efficiency'],'Site availability can influence whether the approach succeeds','The passage gives a qualified conclusion: success depends partly on finding suitable nearby sites.','reading-mcq-scope')
      ]
    }
  ],
  QR04: [
    {
      set:'B', label:'Independent', topic:'Green roofs',
      html:`<div class="reading-passage"><p>Green roofs can hold rainwater temporarily, which delays the amount entering urban drains after storms. Their performance depends on substrate depth, plant choice and how wet the roof was before the rain began.</p></div><p><strong>NO MORE THAN TWO WORDS</strong></p>`,
      questions:[
        mcq('QR04-B1','Complete: Green roofs can delay water entering urban ______.',['drains','urban drains','storms','plant choice'],'drains','The sentence requires a plural noun after “urban”; “drains” is copied directly and fits the limit.','reading-answer-type'),
        mcq('QR04-B2','Complete: Performance is affected by the depth of the ______.',['substrate','substrate depth','plant choice and','roof was before'],'substrate','The passage names substrate depth as one factor; “substrate” fits the grammar and word limit.','reading-copy-error'),
        mcq('QR04-B3','Which answer exceeds a TWO-WORD limit?',['plant choice','substrate depth','how wet the roof','urban drains'],'how wet the roof','This option contains four words and therefore fails the stated two-word limit.','reading-word-limit')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Library study rooms',
      html:`<div class="reading-passage"><p>The library’s new study rooms can be reserved online up to seven days in advance. Students may book one ninety-minute session per day. Rooms that remain empty for more than fifteen minutes after the start time can be released to other users.</p></div><p><strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong></p>`,
      questions:[
        mcq('QR04-C1','Complete: Reservations can be made up to ______ in advance.',['seven days','ninety-minute','fifteen minutes','one session per day'],'seven days','The passage states “up to seven days in advance”; the answer fits both meaning and word limit.','reading-copy-error'),
        mcq('QR04-C2','Complete: Each student may reserve one ______ session daily.',['ninety-minute','study rooms','seven days','online'],'ninety-minute','The adjective before “session” is required, and it is copied directly from the passage.','reading-answer-type'),
        mcq('QR04-C3','An unused room may be released after more than ______.',['15 minutes','seven days','one day','ninety minutes daily'],'15 minutes','The passage gives fifteen minutes as the threshold for an empty booked room.','reading-word-limit')
      ]
    }
  ],
  QR05: [
    {
      set:'B', label:'Independent', topic:'Community composting',
      html:`<div class="reading-passage"><p><strong>A</strong> Food waste makes up a substantial share of household rubbish in many cities.</p><p><strong>B</strong> One neighbourhood scheme gave residents small kitchen containers and collected scraps twice a week; participation doubled within six months.</p><p><strong>C</strong> Organisers found that unclear rules about meat and dairy caused contamination, so they redesigned the labels on collection bins.</p><p><strong>D</strong> A separate concern is cost: frequent collection can be expensive when participating homes are spread over a large area.</p></div>`,
      questions:[
        mcq('QR05-B1','Which paragraph reports a measured result from a local scheme?',['A','B','C','D'],'B','Paragraph B gives a specific programme and a measured change in participation over six months.','reading-information-function'),
        mcq('QR05-B2','Which paragraph describes a solution to a contamination problem?',['A','B','C','D'],'C','Paragraph C explains that labels were redesigned after organisers identified unclear rules as a cause of contamination.','reading-information-function'),
        mcq('QR05-B3','Which paragraph identifies an economic limitation?',['A','B','C','D'],'D','Paragraph D focuses on collection cost when homes are geographically dispersed.','reading-topic-trap')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'School outdoor learning',
      html:`<div class="reading-passage"><p><strong>A</strong> Outdoor lessons can make abstract topics concrete by linking them to direct observation.</p><p><strong>B</strong> In one trial, pupils who measured tree shade produced more accurate temperature graphs than pupils who used a textbook dataset.</p><p><strong>C</strong> Teachers report that moving a class outside also creates practical challenges, especially when equipment must be carried between locations.</p><p><strong>D</strong> Some schools respond by keeping simple field kits near outdoor teaching areas rather than transporting materials from classrooms each time.</p></div>`,
      questions:[
        mcq('QR05-C1','Which paragraph contains a research-style comparison?',['A','B','C','D'],'B','Paragraph B compares the graph accuracy of pupils using direct measurements with pupils using textbook data.','reading-information-function'),
        mcq('QR05-C2','Which paragraph gives a practical difficulty?',['A','B','C','D'],'C','Paragraph C identifies the challenge of moving equipment between locations.','reading-topic-trap'),
        mcq('QR05-C3','Which paragraph describes a response to that difficulty?',['A','B','C','D'],'D','Paragraph D gives the field-kit solution to repeated equipment transport.','reading-information-function')
      ]
    }
  ],
  QR06: [
    {
      set:'B', label:'Independent', topic:'Reusable food containers',
      html:`<div class="reading-passage"><p>A university cafeteria replaced disposable takeaway boxes with reusable containers. Students pay a small deposit and receive it back when a container is returned. At first, returns were slow because collection points were limited. The university then added return bins near residence halls, after which the average return time fell.</p></div><p>Complete the summary.</p>`,
      questions:[
        mcq('QR06-B1','The cafeteria introduced ______ containers instead of disposable boxes.',['reusable','limited','residence','takeaway deposit'],'reusable','The passage directly contrasts reusable containers with disposable takeaway boxes.','reading-answer-type'),
        mcq('QR06-B2','Students recover a ______ when they return a container.',['deposit','collection point','return time','box'],'deposit','The deposit is paid initially and returned when the container comes back.','reading-summary-logic'),
        mcq('QR06-B3','Adding bins near residence halls reduced the average ______.',['return time','deposit','cafeteria size','number of students'],'return time','The final sentence states that average return time fell after more return bins were added.','reading-paraphrase')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Rain gardens',
      html:`<div class="reading-passage"><p>Rain gardens are shallow planted areas designed to receive water from roofs and paved surfaces. Water temporarily collects in the garden and then soaks into specially prepared soil. This can reduce rapid runoff into street drains. However, sites with very slow-draining ground may need an additional underground outlet.</p></div><p>Complete the summary.</p>`,
      questions:[
        mcq('QR06-C1','Rain gardens collect water from roofs and ______.',['paved surfaces','street drains','prepared soil','underground outlets'],'paved surfaces','The first sentence identifies roofs and paved surfaces as the two source areas.','reading-paraphrase'),
        mcq('QR06-C2','Prepared soil allows collected water to ______.',['soak in','run rapidly','reach roofs','block drains'],'soak in','The passage explains that water soaks into specially prepared soil after collecting temporarily.','reading-summary-logic'),
        mcq('QR06-C3','Very slow-draining sites may require an extra ______.',['underground outlet','rain garden','paved surface','roof'],'underground outlet','The final sentence names an additional underground outlet as a possible requirement on slow-draining sites.','reading-answer-type')
      ]
    }
  ],
  QL01: [
    {
      set:'B', label:'Independent', topic:'Choosing a room', audio:'QL01-B',
      html:`<p>Listen once and track each option as <strong>possible → rejected → final</strong>.</p>`,
      questions:[
        mcq('QL01-B1','Which room do they finally choose?',['lecture theatre','seminar room','sports hall'],'seminar room','The lecture theatre is initially considered but unavailable because of exams; the seminar room becomes the final choice.','listening-change-of-mind'),
        mcq('QL01-B2','Why is the lecture theatre rejected?',['It is too small','It is being used for exams','It is too expensive'],'It is being used for exams','The exam booking changes the status of the initially preferred lecture theatre from possible to unavailable.','listening-distractor'),
        mcq('QL01-B3','What supports the final decision?',['Last year attendance was below the seminar room capacity','The seminar room has more seats than the theatre','No students attended last year'],'Last year attendance was below the seminar room capacity','The speaker notes that thirty-two attended last year and the seminar room holds forty, making it adequate.','listening-option-tracking')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Choosing an activity', audio:'QL01-C',
      html:`<p>Do not select the first attractive option. Keep listening until the decision is complete.</p>`,
      questions:[
        mcq('QL01-C1','Which activity do they choose?',['river walk','museum tour','market visit'],'market visit','The river walk is rejected because of rain and the museum has already been visited; the market becomes the final choice.','listening-first-mention'),
        mcq('QL01-C2','Why is the river walk rejected?',['It starts too late','Heavy rain is forecast','It is too far from the hotel'],'Heavy rain is forecast','The forecast introduces the problem that removes the initially attractive river walk.','listening-distractor'),
        mcq('QL01-C3','What advantage of the market is mentioned?',['It is indoors','It starts late enough for breakfast','It is next to the hotel'],'It starts late enough for breakfast','Ravi says the eleven o’clock start gives them time for breakfast, and Mina accepts this reasoning.','listening-option-tracking')
      ]
    }
  ],
  QL02: [
    {
      set:'B', label:'Independent', topic:'Pottery workshop booking', audio:'QL02-B',
      html:`<p>Predict the answer type before listening. Check spelling, dates, times and numbers carefully.</p>`,
      questions:[
        mcq('QL02-B1','Surname',['Mercer','Merker','Merson'],'Mercer','The receptionist spells the surname M-E-R-C-E-R, so the correct written form is Mercer.','listening-spelling'),
        mcq('QL02-B2','Workshop date',['18 September','8 September','18 November'],'18 September','The booking is for the eighteenth of September; the distractors alter either the day or month.','listening-number'),
        mcq('QL02-B3','Materials fee',['£22','£20','£12'],'£22','The receptionist states that the materials fee is twenty-two pounds.','listening-number')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Coastal survey notes', audio:'QL02-C',
      html:`<p>Complete the notes from one listen. Focus on answer type and concise form.</p>`,
      questions:[
        mcq('QL02-C1','Meeting place',['west gate','visitor centre','coach station'],'west gate','The guide instructs participants to meet beside the west gate.','listening-answer-type'),
        mcq('QL02-C2','Meeting time',['7:45','8:00','7:15'],'7:45','Seven forty-five is the meeting time; eight o’clock is when the coach leaves.','listening-number'),
        mcq('QL02-C3','Item learners must bring',['reusable water bottle','measuring equipment','lunch'],'reusable water bottle','Participants must bring a pencil and reusable water bottle, while measuring equipment and lunch are provided.','listening-paraphrase')
      ]
    }
  ],
  QL03: [
    {
      set:'B', label:'Independent', topic:'Museum route', audio:'QL03-B',
      html:`<p>Anchor at the entrance and update your position after every turn.</p>`,
      questions:[
        mcq('QL03-B1','After reaching the fountain, which way should you turn?',['left','right','back toward the entrance'],'left','The route says to walk to the fountain and turn left there.','listening-direction'),
        mcq('QL03-B2','What is directly opposite the information desk?',['small gallery','café','accessible lift'],'small gallery','The information desk is described as directly opposite the small gallery.','listening-location-update'),
        mcq('QL03-B3','Where is the accessible lift?',['before the fountain','just beyond the information desk','inside the café'],'just beyond the information desk','The final route instruction places the lift just beyond the information desk.','listening-map-anchor')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Training centre route', audio:'QL03-C',
      html:`<p>Keep the starting anchor active and ignore the explicitly rejected room.</p>`,
      questions:[
        mcq('QL03-C1','From reception, which corridor should you take?',['right','left','straight through the kitchen'],'right','The first movement is to take the corridor on the right from reception.','listening-map-anchor'),
        mcq('QL03-C2','When do you turn left?',['before Room A','immediately after the glass doors','at the kitchen'],'immediately after the glass doors','The speaker says to continue to the glass doors and turn left immediately after them.','listening-direction'),
        mcq('QL03-C3','What is beside the workshop room?',['emergency exit','staff room','reception'],'emergency exit','The workshop room is at the corridor end beside the emergency exit; the room opposite the kitchen is explicitly rejected.','listening-location-update')
      ]
    }
  ],
  QL04: [
    {
      set:'B', label:'Independent', topic:'Online course feedback', audio:'QL04-B',
      html:`<p>Match each speaker to the <strong>decisive meaning</strong>, not repeated vocabulary.</p><div class="structure-box">A. wanted more live tutor contact · B. valued deadline structure · C. wanted more locally relevant examples</div>`,
      questions:[
        mcq('QL04-B1','Speaker 1',['A','B','C'],'B','Speaker 1 says the weekly deadline provided the structure needed to avoid postponing exercises.','listening-matching-paraphrase'),
        mcq('QL04-B2','Speaker 2',['A','B','C'],'A','Speaker 2 wanted to ask questions in real time and specifically asks for more live tutor contact.','listening-attitude'),
        mcq('QL04-B3','Speaker 3',['A','B','C'],'C','Speaker 3 wanted examples relevant to small community organisations rather than large companies.','listening-matching-paraphrase')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'New office advantages', audio:'QL04-C',
      html:`<p>Options may share positive language. Match the feature each speaker identifies as most important.</p><div class="structure-box">A. shorter commute · B. natural light · C. more small meeting rooms</div>`,
      questions:[
        mcq('QL04-C1','Aisha',['A','B','C'],'B','Aisha mentions quietness but says the biggest improvement is the natural light.','listening-attitude'),
        mcq('QL04-C2','Ben',['A','B','C'],'A','Ben notices the light but identifies the shorter journey as the important change for him.','listening-option-reuse'),
        mcq('QL04-C3','Cara',['A','B','C'],'C','Cara’s journey is longer, and she values the availability of several small meeting rooms.','listening-matching-paraphrase')
      ]
    }
  ],
  QL05: [
    {
      set:'B', label:'Independent', topic:'Volunteer first day', audio:'QL05-B',
      html:`<p><strong>NO MORE THAN THREE WORDS AND/OR A NUMBER.</strong> Predict whether each answer is an item, place or time.</p>`,
      questions:[
        mcq('QL05-B1','What must volunteers bring?',['photo identification','gloves and tools','drinking water'],'photo identification','The coordinator says volunteers need to bring only photo identification; the other items are provided.','listening-short-answer-type'),
        mcq('QL05-B2','Where should volunteers meet?',['north entrance','visitor centre','south gate'],'north entrance','They meet at the north entrance to Riverside Park, next to the bicycle racks.','listening-short-answer-type'),
        mcq('QL05-B3','By what time should they arrive?',['8:20','8:40','9:20'],'8:20','The coordinator explicitly asks volunteers to arrive by eight twenty.','listening-number')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Field notebook submission', audio:'QL05-C',
      html:`<p><strong>NO MORE THAN THREE WORDS AND/OR A NUMBER.</strong> Keep answers short; do not write the whole sentence.</p>`,
      questions:[
        mcq('QL05-C1','When is the notebook due?',['Monday 23rd','Friday','Monday 12th'],'Monday 23rd','The tutor states that the field notebook is due on Monday the twenty-third.','listening-number'),
        mcq('QL05-C2','What file format should be submitted?',['single PDF','reference list','twelve pages'],'single PDF','The required submission format is one single PDF file.','listening-short-answer-type'),
        mcq('QL05-C3','What is the maximum length?',['12 pages','4 pages','23 pages'],'12 pages','The tutor gives a maximum of twelve pages, excluding the reference list.','listening-word-limit')
      ]
    }
  ],
  QL06: [
    {
      set:'B', label:'Independent', topic:'Prototype redesign', audio:'QL06-B',
      html:`<p>Use the unfinished sentence to predict grammar and meaning before the recording reaches the answer.</p>`,
      questions:[
        mcq('QL06-B1','The early material failed because it became ______ in cold conditions.',['brittle','thicker','flexible'],'brittle','The lecturer identifies brittleness in cold conditions as the main reason early prototypes failed.','listening-sentence-grammar'),
        mcq('QL06-B2','Increasing the material’s thickness made the product too ______.',['heavy','cold','flexible'],'heavy','The attempted fix added too much weight, so “heavy” correctly completes the sentence.','listening-paraphrase'),
        mcq('QL06-B3','The successful design used a flexible ______.',['outer layer','prototype','thickness'],'outer layer','After rejecting the thicker design, the speaker gives a flexible outer layer as the successful redesign.','listening-correction')
      ]
    },
    {
      set:'C', label:'Retry Challenge', topic:'Office reopening date', audio:'QL06-C',
      html:`<p>Track corrections carefully. The first date mentioned is not necessarily the final answer.</p>`,
      questions:[
        mcq('QL06-C1','The renovation was first expected to finish in ______.',['April','May','June'],'April','April is the initial expected completion month before later delays are introduced.','listening-correction'),
        mcq('QL06-C2','Electrical work moved the expected finish to ______.',['May','April','15 May'],'May','The speaker says a delay in electrical work moved the completion date from April to May.','listening-paraphrase'),
        mcq('QL06-C3','Staff will return on ______.',['Monday 15 May','12 May','Monday 15 April'],'Monday 15 May','The desks arrive on the twelfth, but the final return date is Monday the fifteenth of May.','listening-correction')
      ]
    }
  ]
};

const allLabs = [...QUESTION_TYPE_LABS, ...QUESTION_TYPE_LABS_V2];

function listeningControls(audioKey) {
  if (!audioKey) return '';
  return `<div class="cluster" style="margin:10px 0">
    <button class="btn soft small-btn" type="button" data-lab-depth-audio="${audioKey}">▶ Play practice audio</button>
    <span class="small muted" data-lab-depth-status="${audioKey}">Browser voice for practice · production MP3 can replace this later</span>
  </div>`;
}

function makeSection(labId, entry, index) {
  const skillLabel = labId.startsWith('QR') ? 'Reading' : 'Listening';
  return {
    title: `${index}. Set ${entry.set} — ${entry.label}`,
    html: `<div class="callout"><strong>${skillLabel} transfer set · ${entry.topic}</strong><br>Use this as an unseen ${entry.label.toLowerCase()} set. Do not look back at Set A answers.</div>${listeningControls(entry.audio)}${entry.html}`,
    blocks: entry.questions
  };
}

export function applyLabDepthExpansion() {
  for (const lab of allLabs) {
    const entries = depth[lab.id];
    if (!entries?.length) continue;
    if (lab.contentDepthVersion === 'v1.3') continue;

    const insertionPoint = Math.max(4, lab.sections.length - 3);
    const setSections = entries.map((entry, offset) => makeSection(lab.id, entry, insertionPoint + offset + 1));
    lab.sections.splice(insertionPoint, 0, ...setSections);
    lab.contentSets = ['A', 'B', 'C'];
    lab.contentDepthVersion = 'v1.3';
    lab.practiceQuestionCount = lab.sections.flatMap(section => section.blocks || []).filter(block => block.type === 'quiz').length;
    lab.estimatedMinutes = Math.max(lab.estimatedMinutes || 0, 24);
  }
  return allLabs;
}

export const LAB_DEPTH_EXPANSION = depth;
export const EXPANDED_LABS = applyLabDepthExpansion();
