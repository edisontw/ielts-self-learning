import fs from 'node:fs';
import {MOCK_TESTS,approximateBand} from '../mock-test-registry-v17.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};

assert(MOCK_TESTS.length===2,'V1.7+ must ship two complete Full Academic mocks.');
assert(JSON.stringify(MOCK_TESTS.map(t=>t.id))===JSON.stringify(['MA01','MA02']),'Mock registry must preserve MA01 then MA02.');
const globalIds=new Set();
const listeningScripts=new Set();
const readingPassages=new Set();

for(const t of MOCK_TESTS){
  assert(t.disclaimer.includes('Not an official IELTS test'),`${t.id} must carry a non-official disclaimer.`);
  assert(t.sourcePolicy.type==='original',`${t.id} must be original content.`);
  assert(/^2026-08-/.test(t.formatVerifiedDate),`${t.id} format verification date must be explicit.`);
  assert(t.listening.parts.length===4,`${t.id} Listening must have four parts.`);
  assert(JSON.stringify(t.listening.parts.map(p=>p.questions.length))===JSON.stringify([10,10,10,10]),`${t.id} Listening must be 10 questions per part.`);
  const listening=t.listening.parts.flatMap(p=>p.questions);
  assert(listening.length===40,`${t.id} Listening must contain 40 questions.`);
  assert(t.reading.passages.length===3,`${t.id} Academic Reading must have three passages.`);
  assert(JSON.stringify(t.reading.passages.map(p=>p.questions.length))===JSON.stringify([13,13,14]),`${t.id} Reading passages must contain 13/13/14 questions.`);
  const reading=t.reading.passages.flatMap(p=>p.questions);
  assert(reading.length===40,`${t.id} Reading must contain 40 questions.`);
  assert(t.writing.tasks.length===2,`${t.id} Academic Writing must contain two tasks.`);
  assert(t.writing.tasks[0].minimumWords===150&&t.writing.tasks[1].minimumWords===250,`${t.id} Writing minimum word counts must be 150/250.`);
  assert(t.writing.tasks[0].source.type==='synthetic',`${t.id} Task 1 data must declare synthetic source.`);
  assert(t.speaking.parts.length===3,`${t.id} Speaking must contain three parts.`);
  assert(t.speaking.parts[1].prepSeconds===60&&t.speaking.parts[1].speakSeconds===120,`${t.id} Speaking Part 2 must provide 60-second prep and 120-second long-turn timing.`);
  for(const [label,items] of [['Listening',listening],['Reading',reading]]){
    const ids=new Set(items.map(q=>q.id));
    assert(ids.size===40,`${t.id} ${label} ids must be unique.`);
    assert(items.every(q=>q.answer&&q.rationale&&q.errorTag),`${t.id} ${label} questions need answer, rationale and errorTag.`);
    assert(JSON.stringify(items.map(q=>q.number))===JSON.stringify(Array.from({length:40},(_,i)=>i+1)),`${t.id} ${label} numbering must run 1–40.`);
    for(const q of items){
      assert(q.id.startsWith(`${t.id}-`),`${q.id} must be namespaced to ${t.id}.`);
      assert(!globalIds.has(q.id),`Duplicate cross-mock question id ${q.id}.`);
      globalIds.add(q.id);
    }
  }
  assert(reading.some(q=>q.type==='tfng'),`${t.id} Reading must include TRUE/FALSE/NOT GIVEN.`);
  assert(reading.some(q=>q.type==='text'),`${t.id} Reading must include completion items.`);
  assert(listening.some(q=>q.type==='text'),`${t.id} Listening must include completion items.`);
  for(const p of t.listening.parts){assert(!listeningScripts.has(p.script),`${t.id} Listening script duplicates another mock.`);listeningScripts.add(p.script);}
  for(const p of t.reading.passages){assert(!readingPassages.has(p.passage),`${t.id} Reading passage duplicates another mock.`);readingPassages.add(p.passage);}
}

const ma01=MOCK_TESTS.find(t=>t.id==='MA01');
const ma02=MOCK_TESTS.find(t=>t.id==='MA02');
const ma02L=ma02.listening.parts.flatMap(p=>p.questions);
for(const tag of ['spelling','definition','listening-procedural-sequence','listening-conditional-outcome','academic-vocabulary']){
  const semantic=tag.replace(/^listening-/,'');
  assert(ma02L.some(q=>q.errorTag===tag||q.errorTag.replace(/^listening-/,'')===semantic),`MA02 should naturally include ${tag} transfer evidence.`);
}
assert(ma02.audioStatus==='production-mp3','MA02 must expose approved production MP3 status.');
assert(ma02.sourcePolicy.notes.includes('independent from MA01'),'MA02 source policy must state independence from MA01.');
assert(ma02.sourcePolicy.notes.includes('production MP3 recordings'),'MA02 source policy must describe the production Listening release.');
assert(ma01.listening.parts.every((p,i)=>p.script!==ma02.listening.parts[i]?.script),'MA02 Listening parts must be independent from MA01.');
assert(ma01.reading.passages.every((p,i)=>p.passage!==ma02.reading.passages[i]?.passage),'MA02 Reading passages must be independent from MA01.');
assert(ma01.writing.tasks[0].prompt!==ma02.writing.tasks[0].prompt&&ma01.writing.tasks[1].prompt!==ma02.writing.tasks[1].prompt,'MA02 Writing tasks must be independent from MA01.');
assert(ma01.speaking.parts[1].cue!==ma02.speaking.parts[1].cue,'MA02 Speaking Part 2 must be independent from MA01.');
assert(approximateBand('listening',30)===7,'Listening raw 30 reference should map to approx Band 7.');
assert(approximateBand('reading',30)===7,'Reading raw 30 reference should map to approx Band 7.');

const runtime=fs.readFileSync(new URL('../mock-test-runtime-v1.js',import.meta.url),'utf8');
for(const token of ['IELTS Mock Test Center · V1.7','Independent Full Academic transfer evidence','data-mock-test-id','data-mock-test','Audio plays once per part','Copy Writing Review Prompt',"document.body.classList.toggle('mock-exam-active'",'Save missed L/R items','Speaking Mock · Beta'])assert(runtime.includes(token),`Runtime missing ${token}`);
assert(!runtime.includes("w['MA01-W1']")&&!runtime.includes("wordCounts['MA01-W2']"),'Runtime must not hard-code MA01 Writing ids.');
const audioUpgrade=fs.readFileSync(new URL('../mock-test-audio-upgrade-v1.js',import.meta.url),'utf8');
const audioFiles=[
  'ma01-listening-part1-study-room-booking.mp3',
  'ma01-listening-part2-museum-visitor-information.mp3',
  'ma01-listening-part3-campus-garden-research-project.mp3',
  'ma01-listening-part4-urban-trees-heat-adaptation.mp3',
  'ma02-listening-part1-printmaking-workshop-booking.mp3',
  'ma02-listening-part2-observatory-visitor-orientation.mp3',
  'ma02-listening-part3-local-history-digitisation-project.mp3',
  'ma02-listening-part4-seed-banks-seed-storage.mp3'
];
for(const file of audioFiles){
  assert(audioUpgrade.includes(`./media/audio/mock-tests/${file}`),`Mock audio adapter missing ${file}.`);
  assert(fs.existsSync(new URL(`../media/audio/mock-tests/${file}`,import.meta.url)),`Production Mock audio asset missing ${file}.`);
}
for(const token of ['playListeningMedia','stopListeningMedia','MA02_AUDIO','CENTER_NOTE',"addEventListener('click', handleCapture, true)"])assert(audioUpgrade.includes(token),`Mock audio adapter missing ${token}`);
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert(index.includes('./mock-test-audio-upgrade-v1.js'),'index.html must load the Mock audio adapter.');
const css=fs.readFileSync(new URL('../mock-test-v1.css',import.meta.url),'utf8');
for(const token of ['body.mock-exam-active .sidebar','.mock-reading-grid','.mock-writing-grid','.mock-qnav'])assert(css.includes(token),`CSS missing ${token}`);
console.log('Mock Test Center validation passed: MA01 + independent MA02 each retain complete L/R/W/S content, and both mocks expose production MP3 Listening with labelled browser-voice fallback.');
