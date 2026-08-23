import fs from 'node:fs';
import {MOCK_TESTS,approximateBand} from '../mock-test-data-v1.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
assert(MOCK_TESTS.length===1,'V1.3 should ship one complete full mock first.');
const t=MOCK_TESTS[0];
assert(t.id==='MA01','Mock 01 id must be MA01.');
assert(t.disclaimer.includes('Not an official IELTS test'),'Mock must carry a non-official disclaimer.');
assert(t.sourcePolicy.type==='original','Mock 01 should be original content.');
assert(t.formatVerifiedDate==='2026-08-23','Format verification date must be explicit.');
assert(t.listening.parts.length===4,'Listening must have four parts.');
assert(JSON.stringify(t.listening.parts.map(p=>p.questions.length))===JSON.stringify([10,10,10,10]),'Listening must be 10 questions per part.');
const listening=t.listening.parts.flatMap(p=>p.questions);
assert(listening.length===40,'Listening must contain 40 questions.');
assert(t.reading.passages.length===3,'Academic Reading must have three passages.');
assert(JSON.stringify(t.reading.passages.map(p=>p.questions.length))===JSON.stringify([13,13,14]),'Reading passages must contain 13/13/14 questions.');
const reading=t.reading.passages.flatMap(p=>p.questions);
assert(reading.length===40,'Reading must contain 40 questions.');
assert(t.writing.tasks.length===2,'Academic Writing must contain two tasks.');
assert(t.writing.tasks[0].minimumWords===150&&t.writing.tasks[1].minimumWords===250,'Writing minimum word counts must be 150/250.');
assert(t.writing.tasks[0].source.type==='synthetic','Task 1 chart/table data must declare synthetic source.');
assert(t.speaking.parts.length===3,'Speaking must contain three parts.');
assert(t.speaking.parts[1].prepSeconds===60&&t.speaking.parts[1].speakSeconds===120,'Speaking Part 2 must provide 60-second prep and 120-second long turn timing.');
for(const [label,items] of [['Listening',listening],['Reading',reading]]){
 const ids=new Set(items.map(q=>q.id));assert(ids.size===40,`${label} ids must be unique.`);
 assert(items.every(q=>q.answer&&q.rationale&&q.errorTag),`${label} questions need answer, rationale and errorTag.`);
 assert(JSON.stringify(items.map(q=>q.number))===JSON.stringify(Array.from({length:40},(_,i)=>i+1)),`${label} numbering must run 1–40.`);
}
assert(reading.some(q=>q.type==='tfng'),'Reading must include TRUE/FALSE/NOT GIVEN.');
assert(reading.some(q=>q.type==='text'),'Reading must include completion items.');
assert(listening.some(q=>q.type==='text'),'Listening must include completion items.');
assert(approximateBand('listening',30)===7,'Listening raw 30 reference should map to approx Band 7.');
assert(approximateBand('reading',30)===7,'Reading raw 30 reference should map to approx Band 7.');
const runtime=fs.readFileSync(new URL('../mock-test-runtime-v1.js',import.meta.url),'utf8');
for(const token of ['IELTS Mock Test Center','Strict Test Mode','Audio plays once per part','Copy Writing Review Prompt',"document.body.classList.toggle('mock-exam-active'",'Save missed L/R items','Speaking Mock · Beta'])assert(runtime.includes(token),`Runtime missing ${token}`);
const audioUpgrade=fs.readFileSync(new URL('../mock-test-audio-upgrade-v1.js',import.meta.url),'utf8');
const audioFiles=[
 'ma01-listening-part1-study-room-booking.mp3',
 'ma01-listening-part2-museum-visitor-information.mp3',
 'ma01-listening-part3-campus-garden-research-project.mp3',
 'ma01-listening-part4-urban-trees-heat-adaptation.mp3'
];
for(const file of audioFiles){
 assert(audioUpgrade.includes(`./media/audio/mock-tests/${file}`),`Mock audio adapter missing ${file}.`);
 assert(fs.existsSync(new URL(`../media/audio/mock-tests/${file}`,import.meta.url)),`Production Mock audio asset missing ${file}.`);
}
for(const token of ['playListeningMedia','stopListeningMedia','Production multi-voice MP3',"addEventListener('click', handleCapture, true)"])assert(audioUpgrade.includes(token),`Mock audio adapter missing ${token}`);
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert(index.includes('./mock-test-audio-upgrade-v1.js'),'index.html must load the Mock production audio adapter.');
const css=fs.readFileSync(new URL('../mock-test-v1.css',import.meta.url),'utf8');
for(const token of ['body.mock-exam-active .sidebar','.mock-reading-grid','.mock-writing-grid','.mock-qnav'])assert(css.includes(token),`CSS missing ${token}`);
console.log('Mock Test Center V1.3 validation passed: 40 Listening + 40 Reading + 2 Writing tasks + 3 Speaking parts + production MP3 wiring.');
