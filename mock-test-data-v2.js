const LQ=(n,type,prompt,answer,options=[],errorTag='detail',rationale='',accepted=[])=>({id:`MA02-L${String(n).padStart(2,'0')}`,number:n,type,prompt,answer,options,errorTag,rationale,accepted});
const RQ=(n,type,prompt,answer,options=[],errorTag='detail',rationale='',accepted=[])=>({id:`MA02-R${String(n).padStart(2,'0')}`,number:n,type,prompt,answer,options,errorTag,rationale,accepted});

const L1=`Receptionist: Greenford Arts Centre. How can I help?
Caller: Hi, I'd like to reserve a place on the Saturday printmaking workshop next month.
Receptionist: Certainly. Can I take your name?
Caller: Erin Dwyer. The surname is D-W-Y-E-R.
Receptionist: Thanks. We have two Saturday sessions in September, the 12th and the 26th.
Caller: I can't do the 12th, so the 26th, please.
Receptionist: That's the introductory workshop from ten in the morning until one. It will be in Studio B, not the upstairs drawing room shown on the old leaflet.
Caller: Fine. Do I need to bring anything?
Receptionist: Aprons and tools are provided. Please bring an old shirt if you want extra protection, and wear closed shoes.
Caller: How much is it?
Receptionist: Forty-two pounds. Members pay thirty-eight, but I can't apply the member rate unless your membership is active on the day of the workshop.
Caller: Mine expired last month, so forty-two is fine.
Receptionist: You can pay now by card or at reception by Thursday the 24th. If payment hasn't arrived by then, the place is released to the waiting list.
Caller: I'll pay by card now.
Receptionist: Great. One final question: do you have any access requirements?
Caller: No, but I'm allergic to latex.
Receptionist: I'll note that. We use nitrile gloves, so that shouldn't be a problem.`;

const L2=`Guide: Welcome to Northfield Observatory. Before the evening programme begins, I need to explain how the visitor areas are organised and what to do before entering the telescope dome.
From the main entrance, walk past the ticket desk and turn right into the orientation room. Please do not go directly upstairs. First, collect a red safety vest from the rack beside the screen. After that, join the short equipment check at the desk near the rear door. Staff will make sure that loose bags, bright torches and tripods are stored safely. Only when the check is complete should you follow the marked stairs to the dome.
The public telescope is in the west dome. The east dome is used for research tonight and is closed to visitors. If cloud makes viewing impossible, the dome session will be replaced by a live demonstration in the lecture theatre. The decision is usually made about fifteen minutes before the advertised start time.
Photography is allowed in the exhibition gallery, but flash must be switched off. In the dome, phones should be on silent and screens kept dim. Children under twelve must stay with an adult.
The cafe closes at eight-thirty, which is earlier than the rest of the building. Hot drinks cannot be taken upstairs, although sealed water bottles are permitted. The gift shop remains open until ten.
At the end of your visit, return your safety vest to the basket beside the exit rather than to the rack where you collected it. This helps staff separate used and clean vests.`;

const L3=`Tutor: How is your local-history digitisation project going?
Nina: We have chosen the collection: letters written by factory workers between 1930 and 1950.
Omar: We originally planned to scan everything, but there are nearly nine hundred letters, so we are sampling two hundred.
Tutor: How will you select them?
Nina: Every fourth letter after a random starting point. That should be more defensible than choosing the most interesting ones.
Tutor: Good. What information will you record?
Omar: Date, sender, recipient, place names and the main topic. We also want to record whether the letter includes a photograph.
Tutor: Be careful with copyright. Have you received clearance to reproduce the photographs online?
Nina: Not yet. The archive manager expects an answer on Friday.
Tutor: Then build the project so it can work either way.
Omar: Right. If clearance arrives by Friday, we'll include thumbnail images in the pilot website. If it doesn't, we'll launch the pilot with text transcripts only and add images later if permission comes through.
Tutor: Sensible. What about transcription accuracy?
Nina: We'll each transcribe a small shared sample, compare disagreements, and agree on conventions before splitting the rest.
Tutor: That's important. Handwriting varies a lot. Are you using automatic handwriting recognition?
Omar: Only as a first draft. It struggles with names, so every transcript will still be checked by a person.
Tutor: And your user test?
Nina: Twelve volunteers from the history society. We considered asking first-year students, but the society members are more likely to use the archive.
Tutor: Keep the test tasks realistic. Ask them to find a person, compare two dates and trace one topic across several letters.`;

const L4=`Lecturer: Seed banks are often described as biological libraries, but not all seeds can be stored in the same way. Many crop and wild-plant species produce what botanists call orthodox seeds. Orthodox seeds are seeds that can tolerate substantial drying and then remain viable at low temperatures. Because their metabolism slows after drying and cooling, they can often be stored for years or even decades.
Other species produce recalcitrant seeds. These are damaged if they lose too much water, so conventional dry, cold storage is unsuitable. Many tropical trees fall into this category. Their seeds may need to be grown continuously in living collections or preserved using more specialised techniques.
A key concept here is desiccation, the removal or loss of water from biological material. For orthodox seeds, controlled desiccation is part of normal storage preparation. For recalcitrant seeds, the same process can destroy the tissues needed for germination.
Storage conditions are only one part of seed-bank management. Collections must also represent genetic diversity. If staff collect seeds from just one or two parent plants, the bank may preserve the species name while capturing only a narrow fraction of its variation. Sampling plans therefore aim to include multiple plants and, where possible, multiple populations.
Stored seeds are periodically tested for viability. A small sample is removed and germinated under controlled conditions. If germination rates fall below an acceptable level, staff may grow plants and collect a fresh generation of seed. This regeneration step must be managed carefully because some individuals may reproduce more successfully than others, unintentionally changing the genetic composition of the collection.
Seed banks are valuable insurance against loss in the wild, but they do not replace habitat conservation. A frozen collection cannot preserve interactions with pollinators, soil organisms or changing local climates. The strongest conservation strategies therefore combine stored material with protection of functioning ecosystems.`;

const listeningParts=[
  {id:'ma02-part-1',title:'Printmaking workshop booking',context:'Everyday social conversation',script:L1,questions:[
    LQ(1,'text','Surname:','Dwyer',[],'spelling','The caller explicitly spells D-W-Y-E-R.',['dwyer']),
    LQ(2,'text','Workshop date in September:','26',[],'number','The caller rejects the 12th and chooses the 26th.',['26','26th']),
    LQ(3,'text','Workshop begins at:','10:00',[],'number','The introductory workshop starts at ten in the morning.',['10','10:00','10.00','ten']),
    LQ(4,'mcq','Where will the workshop take place?','Studio B',['Studio A','Studio B','Upstairs drawing room'],'distractor','The old leaflet mentions the drawing room, but the receptionist corrects this to Studio B.'),
    LQ(5,'mcq','What clothing advice is given?','Wear closed shoes',['Bring your own apron','Wear closed shoes','Wear gloves from home'],'detail','Tools and aprons are supplied; participants are asked to wear closed shoes.'),
    LQ(6,'text','Standard workshop fee (£):','42',[],'number','The standard fee is forty-two pounds.',['42','£42','42 pounds']),
    LQ(7,'mcq','Why will Erin not receive the member rate?','Her membership is not currently active',['She booked too late','Her membership is not currently active','The member places are full'],'detail','Her membership expired last month.'),
    LQ(8,'text','Latest payment date: Thursday the:','24',[],'number','Payment must arrive by Thursday the 24th.',['24','24th']),
    LQ(9,'mcq','What happens if payment is late?','The place is offered to the waiting list',['A late fee is added','The place is offered to the waiting list','The workshop is moved online'],'conditional-outcome','The receptionist states the place is released if payment has not arrived by the deadline.'),
    LQ(10,'text','Material Erin is allergic to:','latex',[],'detail','Erin states that she is allergic to latex.',['latex'])
  ]},
  {id:'ma02-part-2',title:'Observatory visitor orientation',context:'Everyday social monologue',script:L2,questions:[
    LQ(11,'mcq','Where should visitors go first after the ticket desk?','Orientation room',['West dome','Orientation room','Lecture theatre'],'spatial-sequence','Visitors turn right into the orientation room before going upstairs.'),
    LQ(12,'text','Colour of the safety vest:','red',[],'detail','Visitors collect a red safety vest.',['red']),
    LQ(13,'mcq','What should visitors do immediately after collecting a vest?','Join the equipment check',['Go upstairs to the dome','Join the equipment check','Put bags in the cafe'],'listening-procedural-sequence','The procedure is vest first, then the equipment check, then the stairs.'),
    LQ(14,'mcq','Which dome is open to the public?','West dome',['East dome','West dome','Both domes'],'detail','The west dome holds the public telescope; the east dome is closed for research.'),
    LQ(15,'mcq','What replaces telescope viewing if there is too much cloud?','A live demonstration',['A recorded film','A live demonstration','A refund at the cafe'],'conditional-outcome','Cloud can trigger a replacement live demonstration in the lecture theatre.'),
    LQ(16,'text','The viewing decision is usually made about ______ minutes before the start.','15',[],'number','The guide says the decision is normally made fifteen minutes before the start.',['15','fifteen']),
    LQ(17,'mcq','What rule applies to photography in the exhibition gallery?','Flash must be off',['Photography is forbidden','Flash must be off','Only staff may take photos'],'detail','Photography is allowed there, but not flash.'),
    LQ(18,'text','Cafe closing time:','8:30',[],'number','The cafe closes at eight-thirty.',['8:30','8.30','20:30','20.30','eight thirty']),
    LQ(19,'mcq','What drink may be taken upstairs?','A sealed water bottle',['Hot coffee','A sealed water bottle','Any drink in a cup'],'detail','Hot drinks are prohibited upstairs; sealed water is allowed.'),
    LQ(20,'mcq','Where should used safety vests be returned?','Basket beside the exit',['Original rack','Ticket desk','Basket beside the exit'],'detail','Used vests go to the basket by the exit, not the clean-vest rack.')
  ]},
  {id:'ma02-part-3',title:'Local-history digitisation project',context:'Educational discussion',script:L3,questions:[
    LQ(21,'mcq','What material is the group digitising?','Factory workers’ letters',['Newspaper photographs','Factory workers’ letters','Recorded interviews'],'main-idea','The project uses letters written by factory workers from 1930 to 1950.'),
    LQ(22,'text','Number of letters in the sample:','200',[],'number','They reduce the collection to a sample of two hundred letters.',['200','two hundred']),
    LQ(23,'mcq','How will the letters be sampled?','Every fourth letter after a random start',['The most interesting letters','Every fourth letter after a random start','Only letters with photographs'],'detail','They use a systematic sample after a random starting point.'),
    LQ(24,'mcq','Which information will be recorded for each letter?','Main topic',['Paper colour','Main topic','Estimated monetary value'],'detail','The group lists date, people, place names, main topic and photograph presence.'),
    LQ(25,'mcq','What is still awaiting permission?','Reproducing photographs online',['Reading the letters','Recording dates','Transcribing handwriting'],'detail','Copyright clearance for online photograph reproduction has not yet arrived.'),
    LQ(26,'mcq','What will the group do if permission has not arrived by Friday?','Launch with text transcripts only',['Cancel the pilot','Launch with text transcripts only','Replace the letters with interviews'],'listening-conditional-outcome','The final plan explicitly depends on whether copyright clearance arrives by Friday.'),
    LQ(27,'mcq','Why will both students transcribe a shared sample first?','To agree on transcription conventions',['To shorten the collection','To select volunteers','To calculate printing costs'],'procedural-planning','The shared sample is used to compare disagreements and standardise conventions before dividing the work.'),
    LQ(28,'mcq','How will automatic handwriting recognition be used?','As a first draft only',['As the final transcript','As a first draft only','Only for dates'],'detail','Every machine-generated transcript will still be checked by a person.'),
    LQ(29,'text','Number of user-test volunteers:','12',[],'number','The group plans to recruit twelve volunteers.',['12','twelve']),
    LQ(30,'mcq','Why were history-society members preferred?','They are more likely to use the archive',['They are easier to grade','They have better handwriting','They are more likely to use the archive'],'inference','The chosen testers better match likely archive users.')
  ]},
  {id:'ma02-part-4',title:'Seed banks and seed storage',context:'Academic monologue',script:L4,questions:[
    LQ(31,'mcq','What are orthodox seeds?','Seeds that tolerate drying and low-temperature storage',['Seeds that must remain wet','Seeds that tolerate drying and low-temperature storage','Seeds collected only from crops'],'definition','The lecturer directly defines orthodox seeds in the opening section.'),
    LQ(32,'mcq','Why can orthodox seeds often be stored for long periods?','Their metabolism slows after drying and cooling',['They continue growing in storage','Their metabolism slows after drying and cooling','They require constant irrigation'],'cause-effect','Reduced metabolic activity supports long-term storage.'),
    LQ(33,'mcq','Why is conventional dry storage unsuitable for recalcitrant seeds?','Excessive water loss damages them',['They are always too large','Cold makes them germinate immediately','Excessive water loss damages them'],'detail','Recalcitrant seeds are damaged when they lose too much water.'),
    LQ(34,'text','The removal or loss of water from biological material is called:','desiccation',[],'academic-vocabulary','The lecture explicitly names this process desiccation.',['desiccation']),
    LQ(35,'mcq','What is the purpose of collecting from multiple parent plants?','To preserve more genetic diversity',['To make seeds dry faster','To reduce storage temperature','To preserve more genetic diversity'],'main-idea','Broader sampling captures more of a species’ genetic variation.'),
    LQ(36,'text','Stored seeds are periodically tested for:','viability',[],'academic-vocabulary','The lecture states that collections are periodically tested for viability.',['viability']),
    LQ(37,'mcq','What may happen when germination rates become too low?','A new generation of seed may be produced',['The collection is immediately discarded','The storage room is warmed','A new generation of seed may be produced'],'detail','Staff may grow plants and collect fresh seed.'),
    LQ(38,'mcq','What risk is associated with regeneration?','The genetic composition may shift',['All seeds become recalcitrant','Pollinators enter the freezer','The genetic composition may shift'],'inference','Unequal reproductive success can alter the collection genetically.'),
    LQ(39,'mcq','What can a seed bank not preserve by itself?','Ecological interactions in a habitat',['Plant names','Dry seeds','Storage records'],'detail','A stored collection cannot preserve interactions with pollinators, soil organisms or local climate.'),
    LQ(40,'mcq','What is the lecturer’s final conclusion?','Seed storage should complement habitat conservation',['Seed banks should replace habitat protection','Only tropical species require conservation','Seed storage should complement habitat conservation'],'main-idea','The lecture concludes that stored material and functioning ecosystems should be protected together.')
  ]}
];

const P1=`For many years, city noise was treated mainly as an unwanted by-product of traffic, construction and dense living. More recently, researchers in acoustic ecology have argued that this view is too narrow. What matters to people is not simply the number of decibels reaching their ears, but the composition, timing and meaning of the sounds around them. This broader idea is often described as the urban soundscape.

Two streets can have similar average sound levels yet feel very different. A steady flow of distant traffic may fade into the background, whereas an irregular sequence of horns and braking vehicles repeatedly captures attention. Natural sounds can also alter perception. In several field studies, participants rated spaces more positively when birdsong or moving water was audible, even when the measured sound level changed little.

This does not mean that pleasant sounds cancel harmful noise. Prolonged exposure to high sound levels can still affect sleep, stress and cardiovascular health. Acoustic-ecology researchers therefore distinguish between reducing harmful exposure and improving the quality of what remains. A quiet square with no shade may be less attractive than a slightly louder square where trees, conversation and water create a sense of activity and comfort.

Designers have begun to experiment with this distinction. Some projects use walls, earth banks or building shapes to block direct traffic noise. Others add water features whose continuous sound can make intermittent traffic less noticeable. Planting can help psychologically and visually, although vegetation alone usually provides less physical sound insulation than people expect unless it is very dense and deep.

Timing is another important factor. A market square that is lively at midday may become a source of disturbance if amplified music continues late at night. This is why soundscape planning often involves observation across different hours rather than a single daytime measurement. Researchers may combine sound-level meters with short interviews, behavioural mapping and recordings that are later classified by sound source.

The approach also raises questions about whose preferences should shape public space. Some people enjoy buskers and busy cafes; others seek places for quiet recovery. Children, shift workers and people with sensory sensitivities may experience the same sound environment differently. A single target for “acceptable noise” therefore cannot answer every design question.

The strongest soundscape projects do not abandon conventional noise control. Instead, they add a second question. After harmful exposure has been reduced as far as practical, what kinds of sound should a place support? The answer may involve protecting quiet, encouraging social activity or making natural sounds easier to hear. In this sense, acoustic design is becoming less about removing sound altogether and more about deciding which sounds belong where and when.`;

const P2=`Citizen-science projects invite members of the public to collect or classify data for research. They have been used to map bird populations, monitor air quality, identify galaxies and track seasonal changes in plants. Their scale can be impressive, but large datasets are valuable only if researchers understand how the observations were produced.

One source of variation is equipment. In an air-quality project, one participant may use a low-cost sensor attached to a bicycle while another uses a device fixed outside a window. Even identical sensors can drift over time. Projects therefore sometimes use calibration, the process of comparing an instrument with a trusted reference so that systematic differences can be detected or corrected.

Human behaviour introduces another layer. Volunteers may be more likely to record unusual or attractive species than common ones. They may also visit parks at weekends rather than industrial areas on weekday mornings. The resulting dataset can contain many accurate observations while still giving a distorted picture of where and when events occur.

Researchers use several methods to address these problems. Training materials can standardise procedures. Apps can require photographs or location data. Statistical models can account for unequal observation effort. Some projects deliberately ask participants to follow fixed routes or submit a record even when they observe nothing, because absences can be as informative as sightings.

Quality control does not imply that only professionals produce trustworthy data. In some classification tasks, a large group of non-experts can perform extremely well when several independent judgements are combined. Disagreement can also be useful. If volunteers repeatedly disagree about the same image or sound, the item may genuinely be ambiguous rather than poorly observed.

The relationship between volunteers and researchers matters too. Participants who never hear what happened to their observations may lose interest. Projects that share maps, preliminary findings or explanations of how data were checked are more likely to retain contributors. This feedback can also improve data quality because volunteers learn which mistakes are common.

There is a further ethical issue. A wildlife record may reveal the location of a rare species and unintentionally attract collectors or disturbance. Human-sensing projects can raise privacy concerns if location traces identify daily routines. Data-sharing policies therefore need to consider not only scientific openness but also possible harm.

Citizen science is most powerful when its limitations are treated as features of the research design rather than inconvenient details. Public participation can extend observation across places and times that professional teams could never cover alone. But scale does not remove the need to ask who collected the data, with what tools, under what instructions and with what pattern of missing observations.`;

const P3=`Libraries and archives are digitising millions of documents, photographs and recordings. Digitisation can protect fragile originals from repeated handling and make collections searchable from anywhere. Yet the transformation from physical object to digital record is not neutral. Decisions about what to scan, how to describe it and which technologies to use can influence what future users are able to find.

The first constraint is selection. Few institutions can digitise everything at once, so projects prioritise material according to demand, condition, funding or historical significance. Popular collections may therefore become visible online earlier than less familiar ones. Once available, the digital material attracts more use, which can reinforce the impression that it is inherently more important.

Description creates a second layer of influence. A photograph may receive a title, date, place and list of people. If names are missing or terminology has changed over time, cataloguers must decide how to represent uncertainty. Older descriptions can contain language that is now inaccurate or offensive. Replacing every historical term may hide evidence about past classification systems, while preserving it without explanation may harm or confuse users. Many institutions now keep the original wording but add contextual notes and updated search terms.

Automated tools add both speed and new errors. Optical character recognition can convert printed pages into searchable text, but accuracy falls with unusual fonts, damaged paper or complex layouts. Handwriting recognition has improved, yet personal names remain difficult because the software cannot rely on ordinary language patterns. Image-recognition systems can generate keywords for large photograph collections, but models trained on unrepresentative data may label people or places unevenly.

Because of these limitations, some archives use confidence scores. A machine-generated word with low confidence can be flagged for human review rather than silently accepted. Crowdsourcing offers another approach: volunteers correct transcripts or identify people in photographs. This can improve access while creating its own need for verification and contributor guidance.

Digitisation also changes the experience of evidence. A researcher viewing a scanned letter sees the words and perhaps the paper colour, but may miss thickness, folds, annotations on the reverse or the way several documents were physically grouped in a box. High-resolution images reduce some losses but cannot capture every material relationship.

For this reason, archivists increasingly describe digital access as a representation of the collection rather than a replacement for it. The digital version is extremely useful, but it is shaped by technical choices and institutional priorities. Good interfaces can make some of those choices visible by showing uncertainty, linking records to collection context and explaining when text or labels were machine-generated.

The central challenge is therefore not simply to digitise more. It is to create digital systems that help users understand both what has been made accessible and what remains uncertain, unscanned or difficult for machines to interpret. Transparency about these limits can make a digital archive more trustworthy, not less.`;

const readingPassages=[
  {id:'ma02-r1',title:'Designing the Urban Soundscape',passage:P1,questions:[
    RQ(1,'mcq','What is the main idea introduced in paragraph 1?','Urban sound quality depends on more than loudness',['Cities should eliminate all sound','Urban sound quality depends on more than loudness','Traffic noise is becoming quieter'],'main-idea','The passage broadens analysis from decibels alone to composition, timing and meaning.'),
    RQ(2,'tfng','Two places with the same average sound level are always perceived in the same way.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','The passage gives the opposite example: similar levels can feel very different.'),
    RQ(3,'mcq','Why can irregular horns be more disruptive than steady distant traffic?','They repeatedly attract attention',['They are always louder in decibels','They repeatedly attract attention','They occur only at night'],'inference','Irregular events repeatedly capture attention even at comparable average levels.'),
    RQ(4,'text','A natural sound mentioned as improving perception is moving:','water',[],'detail','Birdsong and moving water are given as examples.',['water']),
    RQ(5,'tfng','Pleasant sounds remove the health effects of prolonged high noise exposure.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','The author explicitly says pleasant sounds do not cancel harmful noise.'),
    RQ(6,'mcq','What distinction do acoustic-ecology researchers make?','Reducing harmful exposure versus improving remaining sound quality',['Indoor versus outdoor music','Reducing harmful exposure versus improving remaining sound quality','Traffic versus construction permits'],'structure','The passage separates exposure reduction from quality improvement.'),
    RQ(7,'mcq','What can water features do?','Make intermittent traffic less noticeable',['Eliminate all low-frequency noise','Make intermittent traffic less noticeable','Replace physical barriers entirely'],'detail','Continuous water sound can mask or reduce the salience of intermittent traffic.'),
    RQ(8,'tfng','Vegetation usually blocks more sound than solid barriers.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','Vegetation alone generally provides less physical insulation unless very dense and deep.'),
    RQ(9,'mcq','Why are observations made at different times of day?','The same place can function differently over time',['Meters work only in daylight','The same place can function differently over time','Natural sounds occur only in the morning'],'inference','A lively daytime sound can become disturbing late at night.'),
    RQ(10,'text','Researchers may combine meters, interviews, behavioural mapping and:','recordings',[],'detail','Recordings are later classified by sound source.',['recordings','audio recordings']),
    RQ(11,'mcq','Why is one acceptable-noise target insufficient?','Different groups experience the same environment differently',['Noise law changes every hour','Different groups experience the same environment differently','Sound levels cannot be measured'],'main-idea','Preferences and sensitivities differ across users.'),
    RQ(12,'tfng','The author argues that conventional noise control should be abandoned.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','The strongest projects retain conventional noise control and add soundscape design.'),
    RQ(13,'mcq','What is the passage’s final conclusion?','Planning should consider which sounds belong in a place and time',['All public spaces should be quiet','Only natural sounds should be encouraged','Planning should consider which sounds belong in a place and time'],'main-idea','The conclusion reframes acoustic design as selecting appropriate sound, not removing all sound.')
  ]},
  {id:'ma02-r2',title:'Citizen Science and the Quality of Large Datasets',passage:P2,questions:[
    RQ(14,'mcq','What concern is raised in the opening paragraph?','Large datasets are useful only when their production is understood',['Citizen science is too small to matter','Large datasets are useful only when their production is understood','Only professional data can be analysed'],'main-idea','Scale alone is not enough; researchers need to understand how observations were produced.'),
    RQ(15,'text','Comparing an instrument with a trusted reference is called:','calibration',[],'academic-vocabulary','The passage explicitly defines calibration.',['calibration']),
    RQ(16,'tfng','Identical low-cost sensors can change their measurements over time.','TRUE',['TRUE','FALSE','NOT GIVEN'],'detail','The passage states that even identical sensors can drift over time.'),
    RQ(17,'mcq','How can volunteer behaviour distort a dataset?','People may record some places or species more often than others',['Volunteers always invent observations','People may record some places or species more often than others','Apps remove location information'],'inference','Unequal observation patterns can bias the apparent distribution of events.'),
    RQ(18,'tfng','An observation can be accurate while the overall dataset is still biased.','TRUE',['TRUE','FALSE','NOT GIVEN'],'inference','The passage explicitly notes that many accurate observations can still create a distorted picture.'),
    RQ(19,'mcq','Why might a project require a record when nothing is observed?','Absence data can also be informative',['To increase photo quality','Absence data can also be informative','To reduce volunteer numbers'],'detail','The passage states that absences can be as informative as sightings.'),
    RQ(20,'mcq','When can non-experts perform particularly well?','When multiple independent classifications are combined',['When they work without instructions','When multiple independent classifications are combined','Only when studying air quality'],'detail','Aggregating several independent judgements can produce strong performance.'),
    RQ(21,'tfng','Repeated disagreement always proves that volunteers were poorly trained.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','Disagreement can indicate genuinely ambiguous material.'),
    RQ(22,'mcq','Why can sharing preliminary findings improve data quality?','Volunteers learn which errors are common',['It replaces calibration','Volunteers learn which errors are common','It removes missing observations'],'cause-effect','Feedback helps participants recognise and avoid common mistakes.'),
    RQ(23,'text','Location traces in human-sensing projects may create ______ concerns.','privacy',[],'detail','The passage explicitly mentions privacy concerns.',['privacy']),
    RQ(24,'mcq','Why might rare-species locations be withheld?','Public disclosure could cause disturbance or collection',['Coordinates are scientifically useless','Public disclosure could cause disturbance or collection','Volunteers cannot record maps'],'inference','Open location data can expose sensitive wildlife to harm.'),
    RQ(25,'tfng','The author believes scientific openness should always override possible harm.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','Data-sharing policy must balance openness against possible harm.'),
    RQ(26,'mcq','What is the passage’s overall argument?','Citizen-science scale is valuable when data-generation limits are designed for and understood',['Citizen science should replace professional research','Only fixed-route projects are reliable','Citizen-science scale is valuable when data-generation limits are designed for and understood'],'main-idea','The conclusion combines the value of scale with the need to understand tools, instructions and missingness.')
  ]},
  {id:'ma02-r3',title:'What Digitisation Changes in Archives',passage:P3,questions:[
    RQ(27,'mcq','What central issue is introduced in paragraph 1?','Digitisation choices shape what users can find',['Digital records perfectly copy physical objects','Digitisation choices shape what users can find','Archives no longer need catalogues'],'main-idea','Selection, description and technology influence future discoverability.'),
    RQ(28,'tfng','Most institutions can digitise their entire collections immediately.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','The passage says few institutions can digitise everything at once.'),
    RQ(29,'mcq','How can early digitisation of popular material reinforce its status?','Online visibility can attract still more use',['It makes originals disappear','Online visibility can attract still more use','Funding rules prohibit other collections'],'inference','Visibility leads to use, which can reinforce perceived importance.'),
    RQ(30,'mcq','What problem can older catalogue descriptions create?','They may contain inaccurate or offensive language',['They always omit dates','They may contain inaccurate or offensive language','They cannot be searched digitally'],'detail','The passage discusses outdated or harmful historical terminology.'),
    RQ(31,'tfng','The passage recommends deleting every historical description that uses outdated language.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','Many institutions retain original wording with contextual notes and updated terms.'),
    RQ(32,'text','Printed pages can be converted into searchable text using optical character:','recognition',[],'academic-vocabulary','The passage names optical character recognition.',['recognition','OCR']),
    RQ(33,'mcq','Why are personal names difficult for handwriting-recognition systems?','They provide fewer predictable language patterns',['Names are never written by hand','They provide fewer predictable language patterns','Names are always in different colours'],'inference','The software cannot rely on ordinary language patterns as strongly for names.'),
    RQ(34,'mcq','What risk can affect image-recognition labels?','Training data may be unrepresentative',['Images cannot contain metadata','Training data may be unrepresentative','Archives prohibit keywords'],'detail','Unrepresentative training data can produce uneven labels.'),
    RQ(35,'mcq','What is one purpose of a low confidence score?','To flag a machine output for human review',['To delete the original object','To flag a machine output for human review','To prove the machine is correct'],'detail','Low-confidence outputs can be routed to human checking.'),
    RQ(36,'tfng','Crowdsourcing removes the need for verification.','FALSE',['TRUE','FALSE','NOT GIVEN'],'detail','Crowdsourcing itself creates a need for verification and guidance.'),
    RQ(37,'mcq','What may a scan fail to represent?','Physical relationships among documents',['The written words on a page','Physical relationships among documents','Any page colour'],'detail','Thickness, folds, reverse annotations and physical grouping can be lost.'),
    RQ(38,'mcq','Why do archivists call digital access a representation rather than a replacement?','The digital version is shaped by technical and institutional choices',['Digital files cannot be copied','The digital version is shaped by technical and institutional choices','Users prefer paper in every case'],'main-idea','The digital record is useful but selective and technologically mediated.'),
    RQ(39,'tfng','Showing uncertainty can increase trust in a digital archive.','TRUE',['TRUE','FALSE','NOT GIVEN'],'inference','The conclusion explicitly says transparency about limits can make the archive more trustworthy.'),
    RQ(40,'mcq','What is the final challenge identified by the author?','Making access while also exposing limits and uncertainty',['Scanning the greatest possible number of pages regardless of context','Making access while also exposing limits and uncertainty','Replacing all cataloguers with automated systems'],'main-idea','The final paragraph prioritises access combined with transparency about what is uncertain or missing.')
  ]}
];

export const MA02={
  id:'MA02',
  title:'Academic Mock 02',
  version:'1.0-beta',
  testType:'IELTS Academic style',
  contentStatus:'Original independent transfer-evidence mock · V1.7 beta',
  disclaimer:'Not an official IELTS test and not affiliated with or endorsed by IELTS.',
  formatVerifiedDate:'2026-08-29',
  sourcePolicy:{
    type:'original',
    label:'Original IELTS-style practice',
    formatReference:'IELTS Academic public test-format guidance',
    notes:'All MA02 passages, scripts, questions and productive-skill prompts are newly written and independent from MA01. Writing Task 1 uses synthetic data. Listening uses browser speech synthesis in V1.7 until separate production recordings pass the production-audio gate.'
  },
  audioStatus:'browser-voice-gate',
  strictRules:['No answer checking before submission','No transcript before Listening submission','One playback per Listening part','Reading: 60 minutes','Writing: 60 minutes','No hints or Chinese assistance inside exam mode'],
  listening:{timeLimitSeconds:1800,parts:listeningParts},
  reading:{timeLimitSeconds:3600,passages:readingPassages},
  writing:{timeLimitSeconds:3600,tasks:[
    {id:'MA02-W1',title:'Writing Task 1',recommendedMinutes:20,minimumWords:150,prompt:'The table shows the average number of weekly visits per 1,000 residents to four types of public facility in the town of Eastmere in 2010 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',data:{headers:['Public facility','2010','2025'],rows:[['Public library','310','265'],['Sports centre','185','240'],['Community garden','72','156'],['Local museum','128','119']]},source:{type:'synthetic',label:'Original synthetic dataset created for Mock 02'}},
    {id:'MA02-W2',title:'Writing Task 2',recommendedMinutes:40,minimumWords:250,prompt:'Some people think governments should spend more money making existing cities better places to live, while others believe more resources should be used to develop new towns and cities. Discuss both views and give your own opinion.',source:{type:'original',label:'Original IELTS-style task created for Mock 02'}}
  ]},
  speaking:{approxMinutes:'11–14',parts:[
    {part:1,title:'Introduction and interview',questions:['Do you live in a house or an apartment?','What is one thing you would like to change about the area where you live?','How often do you use libraries or other public study spaces?','Do you prefer studying alone or with other people?']},
    {part:2,title:'Long turn',prepSeconds:60,speakSeconds:120,cue:'Describe a place in your town or city that has changed in a positive way.',bullets:['where the place is','what it was like before','what changed','and explain why you think the change was positive']},
    {part:3,title:'Discussion',questions:['Why do some urban improvement projects attract strong public disagreement?','Who should have the greatest influence over changes to public spaces?','Is it better to preserve old buildings or replace them with more efficient ones?','How can cities improve quality of life without making housing less affordable?','What kinds of urban changes are likely to matter most over the next twenty years?']}
  ]}
};

export const MOCK_TESTS_V2=[MA02];
