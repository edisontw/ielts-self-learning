import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../data.js';
import { CORE_LESSON_META } from '../adaptive-data.js';
import { VOCABULARY_ITEMS } from '../learning-extension-data.js';
import { QUESTION_TYPE_LABS } from '../question-type-lab-v1.js';
import { QUESTION_TYPE_LABS_V2, QUESTION_TYPE_LABS_V2_META, QUESTION_TYPE_LABS_V2_VOCAB } from '../question-type-lab-v2.js';
import { MINI_TESTS } from '../mini-test-data-v1.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const labUI=fs.readFileSync(path.join(root,'question-type-lab-ui.js'),'utf8');
const miniRuntime=fs.readFileSync(path.join(root,'mini-test-runtime-v1.js'),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const allLabs=[...QUESTION_TYPE_LABS,...QUESTION_TYPE_LABS_V2];
const expectedLabs=['QR01','QR02','QR03','QR04','QR05','QR06','QL01','QL02','QL03','QL04','QL05','QL06'];
assert(allLabs.length===12,'Question Type Lab must contain 12 units.');
assert(expectedLabs.every(id=>allLabs.some(l=>l.id===id)),'Question Type Lab IDs must cover QR01–QR06 and QL01–QL06.');
assert(allLabs.filter(l=>l.skill==='reading').length===6,'Question Type Lab must contain 6 Reading labs.');
assert(allLabs.filter(l=>l.skill==='listening').length===6,'Question Type Lab must contain 6 Listening labs.');
assert(expectedLabs.every(id=>LESSONS.some(l=>l.id===id)),'All labs must register in LESSONS.');
assert(expectedLabs.every(id=>CORE_LESSON_META.some(l=>l.id===id)),'All labs must register adaptive metadata.');
assert(QUESTION_TYPE_LABS_V2_META.length===8,'Second lab batch metadata count must be 8.');

const labQuestionIds=[];
for(const lab of allLabs){
  assert(lab.lessonType==='question-type',`${lab.id} must remain a question-type lesson.`);
  assert(Array.isArray(lab.sections)&&lab.sections.length>=7,`${lab.id} must contain at least 7 stages.`);
  assert(Array.isArray(lab.repairLessons)&&lab.repairLessons.length>=1,`${lab.id} must point to repair content.`);
  const quizzes=lab.sections.flatMap(s=>s.blocks||[]).filter(b=>b.type==='quiz');
  assert(quizzes.length>=3,`${lab.id} must contain at least 3 checked items.`);
  for(const item of quizzes){
    assert(item.options.includes(item.answer),`${item.id} answer must appear in options.`);
    assert(item.rationale?.length>=20,`${item.id} must explain the answer.`);
    assert(item.errorTag,`${item.id} needs an error tag.`);
    labQuestionIds.push(item.id);
  }
}
assert(new Set(labQuestionIds).size===labQuestionIds.length,'Lab question IDs must be unique.');

assert(QUESTION_TYPE_LABS_V2_VOCAB.length===8,'Second lab batch must seed 8 vocabulary items.');
for(const item of QUESTION_TYPE_LABS_V2_VOCAB){
  assert(QUESTION_TYPE_LABS_V2.some(l=>l.id===item.sourceLesson),`${item.id} source lesson must exist in lab batch 2.`);
  assert(VOCABULARY_ITEMS.some(v=>v.id===item.id),`${item.id} must register in Vocabulary Review.`);
}

assert(MINI_TESTS.length===2,'Mini Test V1 must contain Reading and Listening tests.');
const mr=MINI_TESTS.find(t=>t.id==='MR01');
const ml=MINI_TESTS.find(t=>t.id==='ML01');
assert(mr?.skill==='reading'&&mr.questions.length===12,'MR01 must contain 12 Reading questions.');
assert(ml?.skill==='listening'&&ml.questions.length===10,'ML01 must contain 10 Listening questions.');
assert(mr.timeLimitSeconds===720,'MR01 must use a 12-minute test timer.');
assert(ml.timeLimitSeconds===540,'ML01 must use a 9-minute test timer.');
assert(Boolean(mr.passage)&&Boolean(ml.script),'Mini Tests need Reading passage and Listening script.');

const miniQuestionIds=[];
for(const test of MINI_TESTS){
  assert(LESSONS.some(l=>l.id===test.id&&l.lessonType==='mini-test'),`${test.id} must register as a hidden mini-test lesson for skill evidence.`);
  for(const item of test.questions){
    assert(item.options.includes(item.answer),`${item.id} answer must appear in options.`);
    assert(item.rationale?.length>=20,`${item.id} needs an explanatory rationale.`);
    assert(item.errorTag,`${item.id} needs an error tag.`);
    miniQuestionIds.push(item.id);
  }
}
assert(new Set(miniQuestionIds).size===miniQuestionIds.length,'Mini Test question IDs must be unique.');
assert(!miniQuestionIds.some(id=>labQuestionIds.includes(id)),'Mini Test and Lab question IDs must not collide.');

for(const script of ['./question-type-lab-v2.js','./mini-test-data-v1.js']){
  const p=index.indexOf(script); const app=index.indexOf('./app.js');
  assert(p>=0&&p<app,`${script} must load before app.js so learning-runtime can observe registered items.`);
}
assert(index.includes('./mini-test-runtime-v1.js'),'Mini Test runtime must load.');
assert(labUI.includes('ALL_LABS')&&labUI.includes('12 units'),'Question Type Lab UI must aggregate both batches and show 12 units.');
for(const token of ['Test Mode','timeLimitSeconds','miniTestHistory','data-mini-timer','save-errors','not an IELTS band estimate']){
  assert(miniRuntime.toLowerCase().includes(token.toLowerCase()),`Mini Test runtime is missing ${token}.`);
}
assert(!miniRuntime.includes('data-check-quiz'),'Mini Test UI must not expose normal practice-mode answer checking.');
assert(miniRuntime.includes("core.lessonAnswers[item.id]={selected:session.answers[item.id]||'',checked:true}"),'Submitted Mini Test items must feed existing checked-answer skill evidence.');
assert(miniRuntime.includes("if(mine===item.answer||core.errors.some"),'Only missed Mini Test items should be saved to Error Notebook.');
assert(miniRuntime.includes("t.skill==='listening'?")&&miniRuntime.includes('transcript stays hidden until submission'),'Listening transcript must stay hidden in Test Mode.');

console.log('✓ Question Type Lab expanded to 12 units: Reading 6 / Listening 6');
console.log(`✓ ${labQuestionIds.length} lab questions have valid answers, rationales, and error tags`);
console.log('✓ Mini Test V1: MR01 12 questions / 12 min; ML01 10 questions / 9 min');
console.log('✓ Mini Test Test Mode hides feedback until submission and can save missed items to Error Notebook');
console.log('✓ Submitted Mini Test answers reuse the existing observed skill-performance evidence path');
