import { LESSONS } from './data.js';
import { CORE_LESSON_META } from './adaptive-data.js';

const mcq = (id, prompt, options, answer, rationale, errorTag) => ({ type:'quiz', id, prompt, options, answer, rationale, errorTag });

export const WRITING_TASK1_PROMPTS = [
  {
    id:'WT1-LINE-01', type:'line', title:'Renewable electricity in four countries', difficulty:3,
    prompt:'The line graph shows the percentage of electricity generated from renewable sources in four countries between 2005 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'line', xLabel:'Year', yLabel:'Renewable electricity (%)', years:[2005,2010,2015,2020,2025], series:[
      {name:'Norland', values:[18,24,31,39,48]}, {name:'Estovia', values:[12,17,26,36,44]}, {name:'Belpa', values:[35,37,39,41,43]}, {name:'Calvia', values:[9,13,15,20,28]}
    ]},
    keyFeatures:['Norland records the largest overall rise and finishes highest.','Belpa starts far ahead but changes only gradually.','Estovia grows strongly and nearly catches Belpa by 2025.','Calvia remains lowest despite a clear increase.'],
    groupingHint:'Group the faster-growth countries together, then contrast them with Belpa’s stability and Calvia’s lower level.',
    source:{type:'synthetic',label:'Original synthetic IELTS-style practice data'}
  },
  {
    id:'WT1-LINE-02', type:'line', title:'Library visits by age group', difficulty:4,
    prompt:'The line graph shows the average number of visits per year to a public library by three age groups from 2010 to 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'line', xLabel:'Year', yLabel:'Visits per person', years:[2010,2014,2018,2022,2024], series:[
      {name:'16–24', values:[8,11,15,13,14]}, {name:'25–44', values:[12,12,11,10,10]}, {name:'45+', values:[14,15,16,18,20]}
    ]},
    keyFeatures:['The 45+ group rises steadily and ends clearly highest.','Visits among 25–44-year-olds decline slightly.','The 16–24 group climbs sharply to 2018, then falls before a small recovery.','The ranking changes substantially over the period.'],
    groupingHint:'Use one detail paragraph for rising/changeable groups and one for the gradual decline.',
    source:{type:'synthetic',label:'Original synthetic IELTS-style practice data'}
  },
  {
    id:'WT1-BAR-01', type:'bar', title:'Commuting time by transport mode', difficulty:3,
    prompt:'The bar chart compares the average commuting time, in minutes, for four transport modes in three cities in 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'bar', xLabel:'Transport mode', yLabel:'Minutes', categories:['Car','Bus','Rail','Bicycle'], series:[
      {name:'Riverton', values:[34,46,38,27]}, {name:'Lakeview', values:[29,41,33,24]}, {name:'Hillford', values:[42,51,36,31]}
    ]},
    keyFeatures:['Bus is the slowest mode in all three cities.','Bicycle is the fastest in every city.','Hillford generally has the longest journeys, except rail.','The bus–bicycle gap is sizeable across all cities.'],
    groupingHint:'Compare modes first because the same ranking pattern appears across the three cities.',
    source:{type:'synthetic',label:'Original synthetic IELTS-style practice data'}
  },
  {
    id:'WT1-BAR-02', type:'bar', title:'Participation in community courses', difficulty:4,
    prompt:'The bar chart shows the percentage of adults in four age groups who participated in three kinds of community course in one city in 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'bar', xLabel:'Age group', yLabel:'Participants (%)', categories:['18–29','30–44','45–59','60+'], series:[
      {name:'Digital skills', values:[42,38,31,22]}, {name:'Fitness', values:[35,39,33,21]}, {name:'Arts & crafts', values:[18,24,32,41]}
    ]},
    keyFeatures:['Digital-skills participation falls with age.','Arts and crafts show the opposite pattern and peak among the 60+ group.','Fitness is strongest among 30–44-year-olds and then declines.','The most popular course changes across age groups.'],
    groupingHint:'Contrast digital skills with arts and crafts, then use fitness as the middle pattern.',
    source:{type:'synthetic',label:'Original synthetic IELTS-style practice data'}
  },
  {
    id:'WT1-TABLE-01', type:'table', title:'Weekday transport in Northbridge', difficulty:3,
    prompt:'The table shows the percentage of weekday journeys made by four transport modes in Northbridge in 2005 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'table', headers:['Mode','2005','2025'], rows:[['Private car','52%','38%'],['Bus','24%','27%'],['Rail','14%','21%'],['Bicycle','10%','14%']] },
    keyFeatures:['Private-car use remains the largest category but falls substantially.','Every alternative mode increases.','Rail shows the largest proportional rise among the alternatives.','The transport mix becomes less car-dependent by 2025.'],
    groupingHint:'Lead with the decline in cars versus the combined rise of the other modes.',
    source:{type:'synthetic',label:'Original synthetic dataset also used in Academic Mock 01'}
  },
  {
    id:'WT1-TABLE-02', type:'table', title:'Satisfaction with university facilities', difficulty:4,
    prompt:'The table compares the percentage of first-year, final-year and postgraduate students who rated four university facilities as good or very good in 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'table', headers:['Facility','First-year','Final-year','Postgraduate'], rows:[['Library','88%','82%','91%'],['IT support','76%','64%','71%'],['Sports centre','81%','73%','58%'],['Career service','62%','79%','74%']] },
    keyFeatures:['The library receives the strongest ratings overall.','Postgraduates are least satisfied with the sports centre.','Final-year students rate the career service much more highly than first-years.','IT support is comparatively weaker across all groups.'],
    groupingHint:'Group high-consensus facilities first, then discuss facilities with strong differences between student groups.',
    source:{type:'synthetic',label:'Original synthetic IELTS-style practice data'}
  },
  {
    id:'WT1-PIE-01', type:'pie', title:'Household spending in 2000 and 2025', difficulty:3,
    prompt:'The two pie charts show how an average household in one country distributed its monthly spending across five categories in 2000 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'pie', panels:[
      {name:'2000', values:[['Housing',28],['Food',24],['Transport',16],['Leisure',14],['Other',18]]},
      {name:'2025', values:[['Housing',36],['Food',18],['Transport',19],['Leisure',17],['Other',10]]}
    ]},
    keyFeatures:['Housing grows to more than one third and remains the largest item.','Food and other spending fall.','Transport and leisure both increase moderately.','Spending becomes more concentrated in housing by 2025.'],
    groupingHint:'Contrast the categories that rise with those that fall rather than describing each pie separately.',
    source:{type:'synthetic',label:'Original synthetic IELTS-style practice data'}
  },
  {
    id:'WT1-MIXED-01', type:'mixed', title:'University energy use and source mix', difficulty:5,
    prompt:'The bar chart shows the amount of electricity used by four university facilities in 2015 and 2025, while the pie chart shows the university’s electricity sources in 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'mixed', bar:{categories:['Laboratories','Library','Residences','Sports centre'], series:[{name:'2015 (GWh)',values:[9,5,11,6]},{name:'2025 (GWh)',values:[12,4,9,5]}]}, pie:{name:'2025 sources', values:[['Solar',34],['Grid renewables',28],['Natural gas',22],['Other grid',16]]} },
    keyFeatures:['Laboratories become the largest electricity user by 2025.','Consumption falls in the library, residences and sports centre.','Renewable sources together account for well over half of 2025 electricity.','The mixed visual requires a separate overview point for consumption and for source mix.'],
    groupingHint:'Use one detail paragraph for changes in facility consumption and another for the 2025 source composition.',
    source:{type:'synthetic',label:'Original synthetic IELTS-style practice data'}
  },
  {
    id:'WT1-PROCESS-01', type:'process', title:'Producing roasted coffee beans', difficulty:4,
    prompt:'The diagram shows how harvested coffee cherries are processed into roasted coffee beans ready for packaging. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'process', cyclic:false, stages:[
      ['1','Ripe cherries are picked'],['2','Fruit is washed and sorted'],['3','Outer pulp is removed'],['4','Beans ferment in water'],['5','Beans are dried'],['6','Dry husks are removed'],['7','Green beans are roasted'],['8','Roasted beans cool and are packaged']
    ]},
    keyFeatures:['It is a linear eight-stage process from harvesting to packaging.','The early stages remove fruit material; the later stages dry, clean and heat the beans.','Roasting occurs only after the beans have been dried and hulled.'],
    groupingHint:'Group preparation/cleaning stages separately from drying, roasting and packaging.',
    source:{type:'original-diagram',label:'Original generated process diagram'}
  },
  {
    id:'WT1-PROCESS-02', type:'process', title:'Recycling glass bottles', difficulty:4,
    prompt:'The diagram illustrates the process used to recycle glass bottles and return them to shops. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'process', cyclic:true, stages:[
      ['1','Used bottles are collected'],['2','Glass is sorted by colour'],['3','Bottles are crushed'],['4','Fragments are washed'],['5','Clean glass is melted'],['6','New bottles are moulded'],['7','Bottles are filled and sealed'],['8','Products return to shops']
    ]},
    keyFeatures:['The process is cyclical because bottles sold in shops can later re-enter collection.','Sorting and cleaning occur before melting.','New containers are formed from melted recycled glass before filling.'],
    groupingHint:'Describe collection/preparation first, then remanufacture and return to retail.',
    source:{type:'original-diagram',label:'Original generated process diagram'}
  },
  {
    id:'WT1-MAP-01', type:'map', title:'Harbour town centre: 2000 and 2025', difficulty:4,
    prompt:'The maps show the centre of Harbourton in 2000 and in 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'map', beforeLabel:'2000', afterLabel:'2025', before:[
      {label:'Car park',x:1,y:1,w:4,h:2},{label:'Old market',x:6,y:1,w:5,h:2},{label:'Road',x:1,y:4,w:10,h:1},{label:'Warehouses',x:1,y:6,w:4,h:2},{label:'Small park',x:7,y:6,w:4,h:2}
    ], after:[
      {label:'Bus hub',x:1,y:1,w:4,h:2},{label:'Shopping hall',x:6,y:1,w:5,h:2},{label:'Pedestrian street',x:1,y:4,w:10,h:1},{label:'Apartments',x:1,y:6,w:4,h:2},{label:'Larger park',x:7,y:6,w:4,h:2}
    ]},
    keyFeatures:['The centre becomes more pedestrian-oriented.','The old market and warehouses are replaced by commercial and residential uses.','Public transport gains space through a new bus hub.','The park is retained and enlarged.'],
    groupingHint:'Organise by transport/public space changes and land-use redevelopment.',
    source:{type:'original-diagram',label:'Original generated map plan'}
  },
  {
    id:'WT1-MAP-02', type:'map', title:'Riverside Park before and after redevelopment', difficulty:4,
    prompt:'The plans show Riverside Park before and after a redevelopment project. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    visual:{ kind:'map', beforeLabel:'Before', afterLabel:'After', before:[
      {label:'Open grass',x:1,y:1,w:6,h:3},{label:'Playground',x:8,y:1,w:3,h:2},{label:'Path',x:1,y:5,w:10,h:1},{label:'Pond',x:1,y:7,w:3,h:1},{label:'Unused area',x:6,y:7,w:5,h:1}
    ], after:[
      {label:'Event lawn',x:1,y:1,w:5,h:3},{label:'Larger playground',x:7,y:1,w:4,h:2},{label:'Cycle + foot path',x:1,y:5,w:10,h:1},{label:'Wetland pond',x:1,y:7,w:4,h:1},{label:'Café + toilets',x:7,y:7,w:4,h:1}
    ]},
    keyFeatures:['The park gains more facilities and defined functions.','The path is upgraded for both cyclists and pedestrians.','The playground and pond/wetland areas expand.','An unused area becomes a café and toilets.'],
    groupingHint:'Group recreation/access upgrades separately from environmental and service-facility changes.',
    source:{type:'original-diagram',label:'Original generated map plan'}
  }
];

export const WRITING_TASK1_LESSONS = [
  {
    id:'WT1-01', slug:'task-1-select-the-main-features', title:'Task 1: Select the Main Features',
    description:'Decide what deserves space in a 150+ word report: dominant trends, highest and lowest values, major changes, contrasts, and meaningful exceptions.',
    skill:'writing', subskill:'task-1-feature-selection', lessonType:'skill', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:22,
    objective:'Select a small set of high-value features instead of trying to report every number.', prerequisites:[], tags:['task-1','main-features','data-selection','overview'], ieltsSkill:'writing', questionType:'academic-task-1', examRelevance:'very-high', timed:false,
    errorTags:['writing-task1-detail-overload','writing-task1-feature-selection','writing-task1-inaccuracy'], repairLessons:['R01','R02'], relatedLessons:['WT1-02','WT1-04'], nextLessons:['WT1-02'],
    chinese:'Task 1 不是把所有數字寫成句子。先找最大趨勢、最高最低、明顯變化、重要對比與例外，再決定哪些細節值得報告。',
    sections:[
      { title:'Goal', html:`<p>By the end of this lesson, you will be able to reduce a dense visual to <strong>3–5 reportable features</strong>.</p><div class="callout"><strong>Your first job is selection, not sentence writing.</strong></div>` },
      { title:'1. Learn — Feature hierarchy', html:`<div class="grid two"><div class="card subtle"><h3>Usually high-value</h3><ul><li>overall rise/fall/stability</li><li>largest and smallest categories</li><li>major reversals or crossovers</li><li>clear similarities or gaps</li><li>one meaningful exception</li></ul></div><div class="card subtle"><h3>Usually low-value alone</h3><ul><li>every intermediate number</li><li>tiny changes with no pattern</li><li>repeating the same ranking</li><li>describing labels without comparison</li></ul></div></div>` },
      { title:'2. Notice — Read the shape before the numbers', html:`<div class="structure-box">1. What changes? → 2. What stays similar? → 3. Who is highest/lowest? → 4. Is there a crossover or exception?</div><p>Exact figures support your report later. They should not control your first reading of the visual.</p>` },
      { title:'3. Guided Practice', blocks:[
        mcq('WT1-01-Q1','A line graph has four countries. Three rise steadily; one remains almost flat. Which feature most deserves the overview?',['The value for every country in 2010','The broad rise in three countries contrasted with one stable country','The colour used for the flat line','The exact midpoint of each series'],'The broad rise in three countries contrasted with one stable country','An overview should capture the dominant pattern and the major exception.','writing-task1-feature-selection'),
        mcq('WT1-01-Q2','A bar chart shows 12 categories. Which approach is strongest?',['Write one sentence for every bar','Identify the highest/lowest and group categories with similar levels','Mention only the first four bars','Avoid all figures'],'Identify the highest/lowest and group categories with similar levels','Grouping turns many values into a smaller set of meaningful comparisons.','writing-task1-detail-overload'),
        mcq('WT1-01-Q3','Which detail is most likely worth reporting?',['A category changes from 31% to 32% while all others are stable','One series overtakes the previous leader halfway through the period','The chart title contains the word percentage','Two labels have similar spelling'],'One series overtakes the previous leader halfway through the period','A crossover changes the ranking and is therefore a high-value feature.','writing-task1-feature-selection'),
        mcq('WT1-01-Q4','What is the best reason to omit a number?',['It is difficult to spell','It does not add useful evidence to a selected feature','Task 1 never uses numbers','The number is below 50'],'It does not add useful evidence to a selected feature','Selection means using figures as evidence, not copying the dataset.','writing-task1-detail-overload')
      ]},
      { title:'4. Independent Drill', html:`<p>Open any statistical Task 1 prompt in the full workspace later. Before writing, list only:</p><ol><li>two overview features;</li><li>two useful comparison groups;</li><li>four to six figures that prove those features.</li></ol>`, blocks:[{type:'note',id:'WT1-01-feature-note',label:'My feature-selection rule',placeholder:'I will prioritise... and omit...'}] },
      { title:'5. Review', html:`<div class="callout success"><strong>A strong Task 1 report is selective but accurate.</strong> The reader should see the shape of the visual, not a transcription of it.</div>` }
    ]
  },
  {
    id:'WT1-02', slug:'task-1-write-a-useful-overview', title:'Task 1: Write a Useful Overview',
    description:'Write a compact overview that states the big picture without drowning it in figures or repeating the introduction.',
    skill:'writing', subskill:'task-1-overview', lessonType:'skill', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:22,
    objective:'Write one or two overview sentences that identify the dominant trends, contrasts, stages, or changes.', prerequisites:['WT1-01'], tags:['task-1','overview','summary','task-achievement'], ieltsSkill:'writing', questionType:'academic-task-1', examRelevance:'very-high', timed:false,
    errorTags:['writing-task1-missing-overview','writing-task1-detail-overview','writing-task1-feature-selection'], repairLessons:['WT1-01'], relatedLessons:['WT1-01','WT1-03'], nextLessons:['WT1-03'],
    chinese:'Overview 要回答「整張圖最重要的是什麼」。通常一到兩句即可，先寫大方向與主要對比，不要塞滿精確數字。',
    sections:[
      { title:'Goal', html:`<p>Write an overview that a reader could understand <strong>without seeing every figure</strong>.</p>` },
      { title:'1. Learn — Overview ≠ introduction', html:`<div class="grid two"><div class="card subtle"><strong>Introduction</strong><p>Paraphrases what the visual shows.</p></div><div class="card subtle"><strong>Overview</strong><p>States the most important patterns or stages.</p></div></div><div class="callout">If your overview could fit almost any chart, it is too vague.</div>` },
      { title:'2. Statistical visuals', html:`<p>A useful overview often contains two ideas:</p><ol><li>the dominant direction or ranking;</li><li>the strongest contrast, exception, or change in ranking.</li></ol><div class="structure-box">Overall, A and B rose markedly, whereas C changed little. By the end of the period, A had become the largest category.</div>` },
      { title:'3. Process and maps', html:`<p>For a process, overview the <strong>number/type of stages, starting point, end point, and whether it is linear or cyclical</strong>. For maps, overview the <strong>overall direction of redevelopment</strong>: more residential, more pedestrian, more facilities, less industrial, and so on.</p>` },
      { title:'4. Guided Practice', blocks:[
        mcq('WT1-02-Q1','Which overview is strongest for a chart where car use falls while bus, rail and bicycle use rise?',['The table has four transport modes and two years.','Overall, car travel became less dominant, while all three alternative modes gained share.','Car use was 52% in 2005 and 38% in 2025, bus was 24% and 27%, and rail was 14% and 21%.','Transport is important in cities.'],'Overall, car travel became less dominant, while all three alternative modes gained share.','It captures the main direction and contrast without turning the overview into a detail paragraph.','writing-task1-missing-overview'),
        mcq('WT1-02-Q2','Which statement belongs in a process overview?',['Stage 4 lasts exactly two hours.','Overall, it is a linear process beginning with collection and ending with packaged products.','The diagram is interesting.','First, the material is washed at 30°C.'],'Overall, it is a linear process beginning with collection and ending with packaged products.','The overview should describe the shape and endpoints of the process.','writing-task1-detail-overview'),
        mcq('WT1-02-Q3','What is usually wrong with an overview containing six exact figures?',['Figures are forbidden','It is likely doing the job of a detail paragraph rather than summarising the big picture','It is too short','It must use bullet points'],'It is likely doing the job of a detail paragraph rather than summarising the big picture','Exact data can appear in details; the overview should remain selective.','writing-task1-detail-overview')
      ]},
      { title:'5. Mini Writing', blocks:[{type:'writing',id:'WT1-02-overview',task:'Write a 40–70 word introduction + overview for this situation: private-car use falls substantially over 20 years, while bus, rail and bicycle shares all rise; rail records the strongest rise among the alternatives.',minWords:40,maxWords:70,promptType:'writing-task1-feedback'}] },
      { title:'6. Review', html:`<div class="checklist"><label class="check-item"><input type="checkbox"> My overview states the big picture.</label><label class="check-item"><input type="checkbox"> It includes a major contrast/change.</label><label class="check-item"><input type="checkbox"> It does not become a list of figures.</label><label class="check-item"><input type="checkbox"> It is separate from simple task paraphrase.</label></div>` }
    ]
  },
  {
    id:'WT1-03', slug:'task-1-compare-dont-list', title:'Task 1: Compare, Don’t List',
    description:'Turn isolated figures into relationships using controlled comparison language instead of writing a sentence for every category.',
    skill:'writing', subskill:'task-1-comparison', lessonType:'skill', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:24,
    objective:'Build comparative sentences that show meaningful relationships across categories, times, and groups.', prerequisites:['WT1-01','WT1-02'], tags:['task-1','comparison','cohesion','data-language'], ieltsSkill:'writing', questionType:'academic-task-1', examRelevance:'very-high', timed:false,
    errorTags:['writing-task1-listing','writing-task1-comparison','writing-task1-language'], repairLessons:['VG03'], relatedLessons:['WT1-02','WT1-04'], nextLessons:['WT1-04'],
    chinese:'不要每個數字各寫一句。把資料變成關係：誰比誰高、差距是否擴大、兩組是否相似、哪一組走勢相反。',
    sections:[
      { title:'Goal', html:`<p>Make the reader see <strong>relationships</strong>, not a catalogue of values.</p>` },
      { title:'1. Learn — Convert data into relationships', html:`<div class="grid two"><div class="card subtle"><strong>Listing</strong><p>A was 40%. B was 35%. C was 20%.</p></div><div class="card subtle"><strong>Comparison</strong><p>A led B by only five percentage points, while both were roughly twice as high as C.</p></div></div>` },
      { title:'2. Useful comparison grammar', html:`<ul><li><strong>higher/lower than</strong></li><li><strong>roughly twice/three times as high as</strong></li><li><strong>similar to / almost identical to</strong></li><li><strong>the gap widened/narrowed</strong></li><li><strong>whereas / while / by contrast</strong></li><li><strong>overtook / remained ahead of</strong></li></ul><p>Use approximate language only when the data justify it.</p>` },
      { title:'3. Guided Practice', blocks:[
        mcq('WT1-03-Q1','A = 42%, B = 39%, C = 18%. Which sentence is most useful?',['A was 42%. B was 39%. C was 18%.','A and B were at similar levels, both more than twice the figure for C.','A was very enormous compared with B.','All values were the same.'],'A and B were at similar levels, both more than twice the figure for C.','It groups similar values and makes a meaningful comparison with the lower category.','writing-task1-comparison'),
        mcq('WT1-03-Q2','A rises from 20 to 50 while B falls from 48 to 30. What is the strongest relationship?',['Both changed.','A overtook B as the two series moved in opposite directions.','A had many numbers.','B was 48 at the start.'],'A overtook B as the two series moved in opposite directions.','The crossover and opposing trends are more informative than isolated endpoints.','writing-task1-listing'),
        mcq('WT1-03-Q3','Which phrase is safest when values are 51% and 49%?',['exactly the same','at broadly similar levels','double','dramatically different'],'at broadly similar levels','The values are close but not identical.','writing-task1-language')
      ]},
      { title:'4. Mini Writing', blocks:[{type:'writing',id:'WT1-03-comparison',task:'Write 60–90 words comparing these figures: City A — car 42 min, bus 51, rail 36, bicycle 31; City B — car 29, bus 41, rail 33, bicycle 24. Group the data instead of describing each value separately.',minWords:60,maxWords:90,promptType:'writing-task1-feedback'}] },
      { title:'5. Review', html:`<div class="callout success">After every detail sentence, ask: <strong>What relationship did this sentence show?</strong> If the answer is “none”, it may just be listing.</div>` }
    ]
  },
  {
    id:'WT1-04', slug:'task-1-organise-data-into-groups', title:'Task 1: Organise Data into Groups',
    description:'Choose a paragraph plan that reflects the visual’s structure instead of following labels mechanically from left to right.',
    skill:'writing', subskill:'task-1-organisation', lessonType:'strategy', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:24,
    objective:'Create two coherent detail groups for statistical, process, and map tasks before drafting.', prerequisites:['WT1-01','WT1-02','WT1-03'], tags:['task-1','organisation','grouping','planning'], ieltsSkill:'writing', questionType:'academic-task-1', examRelevance:'very-high', timed:false,
    errorTags:['writing-task1-organisation','writing-task1-listing','writing-task1-feature-selection'], repairLessons:['W03','WT1-01'], relatedLessons:['WT1-03','WT1-05'], nextLessons:['WT1-05'],
    chinese:'段落不是照圖表從左到右抄。先找可以一起描述的資料：相似走勢、相近數值、相反趨勢、流程前後階段，或地圖中同一類改建。',
    sections:[
      { title:'Goal', html:`<p>Produce a <strong>four-part plan</strong>: introduction → overview → detail group 1 → detail group 2.</p>` },
      { title:'1. Group statistical data', html:`<div class="grid two"><div class="card subtle"><h3>Good grouping signals</h3><ul><li>same trend</li><li>similar level</li><li>same category family</li><li>opposing movement</li><li>before vs after</li></ul></div><div class="card subtle"><h3>Avoid</h3><ul><li>one paragraph per line</li><li>one sentence per bar</li><li>chronological order when comparison is clearer</li><li>mixing overview and details randomly</li></ul></div></div>` },
      { title:'2. Group process and map tasks', html:`<p><strong>Process:</strong> divide stages by function, such as preparation → transformation → finishing.</p><p><strong>Map:</strong> group changes by area or type, such as transport/public space → buildings/land use.</p>` },
      { title:'3. Guided Practice', blocks:[
        mcq('WT1-04-Q1','Four lines show: A rises sharply, B rises sharply, C is stable, D rises slowly. Best grouping?',['A alone / B alone / C alone / D alone','A+B as strong growth; C+D as stable/slower change','2005 / 2010 / 2015 / 2020','Highest numbers only'],'A+B as strong growth; C+D as stable/slower change','The groups reflect meaningful similarities in trend.','writing-task1-organisation'),
        mcq('WT1-04-Q2','A process has eight stages: collection, sorting, crushing, washing, melting, moulding, filling, retail. Best two detail groups?',['Odd stages / even stages','Collection–washing / melting–retail','First word alphabetically / the rest','One paragraph for every stage'],'Collection–washing / melting–retail','The split follows the functional shift from preparation to remanufacture/distribution.','writing-task1-organisation'),
        mcq('WT1-04-Q3','A redevelopment map shows a new bus hub, pedestrian street, apartments and larger park. Which plan is strongest?',['Describe every rectangle in visual order','Group transport/public space changes, then building/land-use changes','Only describe new buildings','Use one paragraph for “before” and never compare with “after”'],'Group transport/public space changes, then building/land-use changes','The grouping lets each paragraph explain a coherent type of change.','writing-task1-organisation')
      ]},
      { title:'4. Planning Drill', blocks:[{type:'note',id:'WT1-04-plan',label:'Four-part Task 1 plan',placeholder:'Introduction: ...\nOverview: ...\nDetail group 1: ...\nDetail group 2: ...'}] },
      { title:'5. Review', html:`<div class="callout success"><strong>Organisation begins before writing.</strong> If you cannot explain why two figures belong in the same paragraph, reconsider the group.</div>` }
    ]
  },
  {
    id:'WT1-05', slug:'task-1-full-workspace', title:'Task 1 Full Workspace',
    description:'Choose from 12 original Academic Task 1 prompts, analyse the visual, plan the report, write 150+ words, self-check, and create a portable AI feedback prompt.',
    skill:'writing', subskill:'task-1-full-practice', lessonType:'guided-practice', cefr:'B2+', ieltsRange:'6.0–7.5', difficulty:4, estimatedMinutes:45,
    objective:'Complete the full Task 1 learning loop across statistical charts, tables, processes and maps.', prerequisites:['WT1-01','WT1-02','WT1-03','WT1-04'], tags:['task-1','workspace','charts','process','maps','revision'], ieltsSkill:'writing', questionType:'academic-task-1', examRelevance:'very-high', timed:true,
    errorTags:['writing-task1-feature-selection','writing-task1-missing-overview','writing-task1-listing','writing-task1-organisation','writing-task1-inaccuracy','writing-task1-language'], repairLessons:['WT1-01','WT1-02','WT1-03','WT1-04','VG02','VG03'], relatedLessons:['LB04','W05'], nextLessons:['I03'],
    chinese:'完整 Task 1 工作區：12 題涵蓋 line、bar、table、pie/mixed、process、map。先分析與規劃，再計時寫作、自我檢查、取得 AI coaching，最後自己重寫。',
    sections:[
      { title:'Goal', html:`<p>Use the full loop: <strong>analyse → select → overview → group → write → self-check → feedback → revise</strong>.</p><div class="callout">Practice prompts are original and use synthetic data or generated diagrams. They are IELTS-style practice, not official IELTS questions.</div>` },
      { title:'1. Exam contract', html:`<ul><li>Target at least <strong>150 words</strong>.</li><li>Use about <strong>20 minutes</strong> in Test Mode.</li><li>Write connected prose, not bullet points.</li><li>Select and report main features; compare where relevant.</li><li>For Practice Mode, use the planning notes only after making your own selection first.</li></ul>` },
      { title:'2. Prompt bank + writing workspace', html:`<div data-wt1-bank-mount><div class="card subtle"><p>Loading the 12-prompt Task 1 workspace…</p></div></div>` },
      { title:'3. Self-check before AI', html:`<div class="checklist"><label class="check-item"><input type="checkbox"> I wrote a clear overview.</label><label class="check-item"><input type="checkbox"> I selected rather than copied details.</label><label class="check-item"><input type="checkbox"> My detail paragraphs are grouped logically.</label><label class="check-item"><input type="checkbox"> My comparisons are accurate.</label><label class="check-item"><input type="checkbox"> I checked units, dates and category names.</label></div>` },
      { title:'4. Repair & Retry', html:`<p>After feedback, choose <strong>two priorities only</strong>: one Task Achievement/organisation issue and one recurring language issue. Rewrite the same report or retry a prompt of the same visual type.</p>` },
      { title:'5. Review', html:`<div class="callout success">A Task 1 report succeeds when the reader can quickly see <strong>what matters, how the information is organised, and which comparisons are important</strong>.</div>` }
    ]
  }
];

export const WRITING_TASK1_META = WRITING_TASK1_LESSONS.map(lesson => ({
  id:lesson.id, title:lesson.title, skill:'writing', difficulty:lesson.difficulty, estimatedMinutes:lesson.estimatedMinutes, targetRelevance:1
}));

for (const lesson of WRITING_TASK1_LESSONS) if (!LESSONS.some(existing => existing.id === lesson.id)) LESSONS.push(lesson);
for (const meta of WRITING_TASK1_META) if (!CORE_LESSON_META.some(existing => existing.id === meta.id)) CORE_LESSON_META.push(meta);
