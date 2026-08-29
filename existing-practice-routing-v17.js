import { EXISTING_PRACTICE_FAMILIES as V16_FAMILIES, EXISTING_PRACTICE_RULES as V16_RULES, existingPracticeRecommendationFor as v16Recommendation } from './existing-practice-routing-v16.js';

const lesson=(id,title)=>({id,title});

export const V17_EXISTING_PRACTICE_FAMILIES={
  'listening-conditional-outcome':{
    label:'Listening conditional outcome',
    skill:'listening',
    auditedQuestions:3,
    auditedForms:3,
    coverage:['L04'],
    reason:'ML02, ML04 and the independent MA02 now provide three-form transfer evidence for following a stated condition to its final outcome. L04 already teaches conditional option → FINAL meaning, so an existing-practice route is useful and a new Repair lesson would duplicate instruction.'
  }
};

export const V17_EXISTING_PRACTICE_RULES=[{
  id:'listening-conditional-outcome-v17',
  family:'listening-conditional-outcome',
  skills:['listening'],
  tags:['listening-conditional-outcome','conditional-outcome'],
  primary:lesson('L04',"Don't Fall for the Distractor")
}];

export const EXISTING_PRACTICE_FAMILIES={...V16_FAMILIES,...V17_EXISTING_PRACTICE_FAMILIES};
export const EXISTING_PRACTICE_RULES=[...V17_EXISTING_PRACTICE_RULES,...V16_RULES];

export function existingPracticeRecommendationFor(error={}){
  const skill=String(error.skill||'').toLowerCase();
  const tag=String(error.errorTag||'');
  const rule=V17_EXISTING_PRACTICE_RULES.find(item=>item.skills.includes(skill)&&item.tags.includes(tag));
  if(rule)return{...rule,familyData:EXISTING_PRACTICE_FAMILIES[rule.family]};
  return v16Recommendation(error);
}
