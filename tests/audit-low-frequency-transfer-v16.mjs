import { MINI_TESTS } from '../mini-test-data-v1.js';
import '../mini-test-data-v2.js';
import '../mini-test-data-v3.js';
import { MOCK_TESTS } from '../mock-test-data-v1.js';
import { QUESTION_TYPE_LABS } from '../question-type-lab-v1.js';
import { EXISTING_PRACTICE_RULES } from '../existing-practice-routing-v16.js';
import { V14_REPAIR_LESSONS } from '../repair-registry-v15.js';
import { V16_SKILL_REPAIR_LESSONS } from '../skill-repair-registry-v16.js';
import { normalizedMiniTestErrorTag } from '../listening-sequence-semantics-v16.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const mini=[];
for(const test of MINI_TESTS){
  for(const q of test.questions){
    mini.push({
      id:q.id,
      testId:test.id,
      skill:test.skill,
      rawTag:q.errorTag,
      tag:normalizedMiniTestErrorTag({id:q.id,testId:test.id,errorTag:q.errorTag})
    });
  }
}

const mock=[];
for(const test of MOCK_TESTS){
  for(const part of test.listening?.parts||[]) for(const q of part.questions||[]) mock.push({id:q.id,testId:test.id,skill:'listening',tag:q.errorTag});
  for(const passage of test.reading?.passages||[]) for(const q of passage.questions||[]) mock.push({id:q.id,testId:test.id,skill:'reading',tag:q.errorTag});
}

const routeTags=new Set(EXISTING_PRACTICE_RULES.flatMap(rule=>rule.tags||[]));
const vgTags=new Set(V14_REPAIR_LESSONS.flatMap(lesson=>lesson.triggerTags||[]));
const skillRepairTags=new Set(V16_SKILL_REPAIR_LESSONS.flatMap(lesson=>lesson.triggerTags||[]));
const noOwnership=tag=>!routeTags.has(tag)&&!vgTags.has(tag)&&!skillRepairTags.has(tag);

const rawDefinition=mini.filter(x=>x.rawTag==='reading-definition').sort((a,b)=>a.id.localeCompare(b.id));
assert(JSON.stringify(rawDefinition.map(x=>x.id))===JSON.stringify(['MR02-Q4','MR04-Q4']),'Raw Reading definition review set changed.');
assert(rawDefinition[0].tag==='reading-explicit-definition','MR02-Q4 must normalize to reading-explicit-definition.');
assert(rawDefinition[1].tag==='reading-distinction','MR04-Q4 must normalize to reading-distinction.');
assert(new Set(rawDefinition.map(x=>x.tag)).size===2,'The two heterogeneous Reading definition questions must not collapse into one recurring tag.');
assert(noOwnership('reading-explicit-definition')&&noOwnership('reading-distinction'),'Definition subtypes must stay discovery-only without route/Repair ownership.');

const finalMeaning=mini.filter(x=>x.tag==='listening-final-meaning').sort((a,b)=>a.id.localeCompare(b.id));
assert(JSON.stringify(finalMeaning.map(x=>x.id))===JSON.stringify(['ML02-Q9','ML04-Q10']),'Listening final-meaning watchlist changed.');
assert(new Set(finalMeaning.map(x=>x.testId)).size===2,'Listening final-meaning must remain a two-form Mini Test signal.');
assert(noOwnership('listening-final-meaning'),'Two-form final-meaning evidence remains below the route/Repair action threshold.');

const academicVocabulary=mock.filter(x=>x.tag==='academic-vocabulary').sort((a,b)=>a.id.localeCompare(b.id));
assert(JSON.stringify(academicVocabulary.map(x=>x.id))===JSON.stringify(['MA01-L33','MA01-R24']),'Full Mock academic-vocabulary discovery set changed.');
assert(new Set(academicVocabulary.map(x=>x.skill)).size===2,'Academic-vocabulary signals must remain split across Listening and Reading rather than treated as same-skill recurrence.');
assert(noOwnership('academic-vocabulary'),'Cross-skill academic-vocabulary signals must not gain route/Repair ownership from aggregate count alone.');

const mockDefinition=mock.filter(x=>x.skill==='listening'&&x.tag==='definition');
assert(mockDefinition.length===1&&mockDefinition[0].id==='MA01-L31','Full Mock Listening definition signal changed.');
assert(noOwnership('definition'),'Single Full Mock definition signal must remain discovery-only.');

const mockSpelling=mock.filter(x=>x.skill==='listening'&&x.tag==='spelling');
assert(mockSpelling.length===1&&mockSpelling[0].id==='MA01-L01','Full Mock spelling signal changed.');
const ql02=QUESTION_TYPE_LABS.find(x=>x.id==='QL02');
assert(ql02?.errorTags?.includes('listening-spelling'),'QL02 must remain the exact instructional owner for Listening spelling/form accuracy.');
assert(noOwnership('spelling'),'Single Full Mock spelling signal must not create a runtime route before recurrence is established.');

console.log('V1.6 lower-frequency Test/Mock discovery audit');
console.log('✓ SPLIT-NOW: MR02-Q4 explicit definition and MR04-Q4 concept distinction no longer create false two-form reading-definition recurrence.');
console.log('✓ WATCH-HIGH: listening-final-meaning = ML02-Q9 + ML04-Q10 across two Mini Test forms; coherent conditional-outcome signal, but no new route/Repair yet.');
console.log('✓ WATCH-OWNER: MA01-L01 spelling has exact QL02 teaching coverage, but remains a one-off Full Mock transfer signal.');
console.log('✓ OBSERVE: academic-vocabulary = one Listening + one Reading Full Mock item, so aggregate count 2 is not same-skill recurrence.');
console.log('✓ OBSERVE: MA01-L31 definition remains a single Listening Full Mock retrieval item.');
console.log('✓ Discovery gate: no one-off/two-off signal created a new Repair lesson or existing-practice route.');
