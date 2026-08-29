import { MINI_TESTS } from '../mini-test-data-v1.js';
import '../mini-test-data-v2.js';
import '../mini-test-data-v3.js';
import { MOCK_TESTS } from '../mock-test-registry-v17.js';
import { CURRICULUM_BATCH_01 } from '../curriculum-batch-01.js';
import { existingPracticeRecommendationFor } from '../existing-practice-routing-v17.js';
import { V14_REPAIR_LESSONS } from '../repair-registry-v15.js';
import { V16_SKILL_REPAIR_LESSONS } from '../skill-repair-registry-v16.js';
import { normalizedMiniTestErrorTag } from '../listening-sequence-semantics-v16.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const semanticFamily=tag=>String(tag||'').replace(/^(reading|listening|writing|speaking|study)-/,'');
const evidence=[];

for(const test of MINI_TESTS){
  for(const q of test.questions||[]){
    const tag=normalizedMiniTestErrorTag({id:q.id,testId:test.id,errorTag:q.errorTag});
    evidence.push({layer:'mini-test',form:test.id,id:q.id,skill:test.skill,tag,family:semanticFamily(tag)});
  }
}
for(const test of MOCK_TESTS){
  for(const part of test.listening?.parts||[])for(const q of part.questions||[])evidence.push({layer:'full-mock',form:test.id,id:q.id,skill:'listening',tag:q.errorTag,family:semanticFamily(q.errorTag)});
  for(const passage of test.reading?.passages||[])for(const q of passage.questions||[])evidence.push({layer:'full-mock',form:test.id,id:q.id,skill:'reading',tag:q.errorTag,family:semanticFamily(q.errorTag)});
}

function rows(skill,family){return evidence.filter(x=>x.skill===skill&&x.family===family)}
function forms(skill,family){return [...new Set(rows(skill,family).map(x=>x.form))].sort()}
function fullMockForms(skill,family){return [...new Set(rows(skill,family).filter(x=>x.layer==='full-mock').map(x=>x.form))].sort()}
function repairOwns(tag){return [...V14_REPAIR_LESSONS,...V16_SKILL_REPAIR_LESSONS].some(lesson=>(lesson.triggerTags||[]).includes(tag))}

const spelling=fullMockForms('listening','spelling');
assert(JSON.stringify(spelling)===JSON.stringify(['MA01','MA02']),'Listening spelling should now have two independent Full Mock forms.');
assert(!existingPracticeRecommendationFor({skill:'listening',errorTag:'spelling'}),'Two Full Mock spelling forms must remain below the route threshold.');
assert(!repairOwns('spelling')&&!repairOwns('listening-spelling'),'Listening spelling must not gain Repair ownership at two independent forms.');

const definition=fullMockForms('listening','definition');
assert(JSON.stringify(definition)===JSON.stringify(['MA01','MA02']),'Listening explicit-definition retrieval should now have two independent Full Mock forms.');
assert(!existingPracticeRecommendationFor({skill:'listening',errorTag:'definition'}),'Two Full Mock definition forms with no exact teaching destination must remain observation-only.');
assert(!repairOwns('definition'),'Listening definition must not gain Repair ownership from two forms.');

const conditional=forms('listening','conditional-outcome');
assert(JSON.stringify(conditional)===JSON.stringify(['MA02','ML02','ML04']),'Listening conditional-outcome should now have three independent forms: ML02, ML04 and MA02.');
const l04=CURRICULUM_BATCH_01.find(x=>x.id==='L04');
const l04Teaching=JSON.stringify(l04?.sections||[]);
assert(l04Teaching.includes('conditional option')&&l04Teaching.includes('FINAL meaning'),'L04 must remain the exact teaching owner for conditional option → FINAL meaning.');
const conditionalRoute=existingPracticeRecommendationFor({skill:'listening',errorTag:'listening-conditional-outcome'});
assert(conditionalRoute?.primary?.id==='L04','Three-form conditional-outcome evidence should now route to existing L04 teaching.');
assert(!conditionalRoute.transfer,'Conditional-outcome should use the exact L04 destination without inventing an inexact Lab transfer.');
assert(!repairOwns('listening-conditional-outcome'),'Recurring conditional-outcome is already taught by L04, so no new Repair is justified.');

const procedural=forms('listening','procedural-sequence');
assert(JSON.stringify(procedural)===JSON.stringify(['MA02','ML04']),'Listening procedural sequence should now have two independent forms.');
assert(!existingPracticeRecommendationFor({skill:'listening',errorTag:'listening-procedural-sequence'}),'Two-form procedural sequence must remain discovery-only.');
assert(!repairOwns('listening-procedural-sequence'),'Two-form procedural sequence must not gain Repair ownership.');

const listeningAcademic=fullMockForms('listening','academic-vocabulary');
const readingAcademic=fullMockForms('reading','academic-vocabulary');
assert(JSON.stringify(listeningAcademic)===JSON.stringify(['MA01','MA02']),'Listening academic vocabulary should now recur across two Full Mock forms.');
assert(JSON.stringify(readingAcademic)===JSON.stringify(['MA01','MA02']),'Reading academic vocabulary should now recur across two Full Mock forms.');
assert(!existingPracticeRecommendationFor({skill:'listening',errorTag:'academic-vocabulary'})&&!existingPracticeRecommendationFor({skill:'reading',errorTag:'academic-vocabulary'}),'Academic vocabulary must remain skill-separated and below route threshold at two forms per skill.');
assert(!repairOwns('academic-vocabulary'),'Academic vocabulary must not gain Repair ownership from cross-skill aggregate frequency.');

console.log('V1.7 MA02 skill-aware transfer audit');
console.log(`✓ Listening spelling: ${spelling.join(' + ')} = two independent Full Mock forms; QL02 remains known teaching context, but no route/Repair at two forms.`);
console.log(`✓ Listening explicit definition: ${definition.join(' + ')} = two independent Full Mock forms; observe, no route/Repair.`);
console.log(`✓ Listening conditional outcome: ${conditional.join(' + ')} = three independent forms; exact owner L04 now gets an existing-practice route, with no new Repair.`);
console.log(`✓ Listening procedural sequence: ${procedural.join(' + ')} = two independent forms; remains discovery-only.`);
console.log(`✓ Academic vocabulary: Listening ${listeningAcademic.join(' + ')}; Reading ${readingAcademic.join(' + ')}; two forms per skill remain below action threshold and are not aggregated across skills.`);
console.log('✓ MA02 creates independent transfer evidence without changing the 30-unit curriculum denominator or manufacturing new Repair lessons.');
