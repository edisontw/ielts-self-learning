import fs from 'node:fs';

const source=fs.readFileSync(new URL('../writing-task2-bank-v110.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ids=[...source.matchAll(/'WT2-(OP|DISC|ADV|PS|TWO)-0[12]'/g)].map(m=>m[0].slice(1,-1));
const unique=[...new Set(ids)];
if(unique.length!==10)throw new Error(`Expected 10 unique Task 2 prompts, found ${unique.length}: ${unique.join(', ')}`);
for(const prefix of ['OP','DISC','ADV','PS','TWO']){
  const count=unique.filter(id=>id.startsWith(`WT2-${prefix}-`)).length;
  if(count!==2)throw new Error(`Expected 2 ${prefix} prompts, found ${count}`);
}
if(!source.includes("source:{type:'original',label:'Original IELTS-style Task 2 practice'}"))throw new Error('Task 2 prompts must keep explicit original-source provenance.');
if(!source.includes('250+ words required'))throw new Error('Task 2 productive evidence must keep the 250-word minimum guardrail.');
if(!source.includes("lessonId:OWNER")||!source.includes('productiveEvidence.writing.push')||!source.includes('aiFeedbackReturns.writing.push'))throw new Error('Task 2 bank must reuse productive evidence and AI feedback-return schemas.');
if(source.includes('ielts-writing-task2-'))throw new Error('Task 2 bank introduced a parallel learner-data storage key.');
if(source.includes('new MutationObserver')||source.includes('setTimeout(apply')||source.includes('setInterval(apply'))throw new Error('Task 2 bank must use the shared render lifecycle, not permanent polling/observers.');
if(!source.includes("registerRenderEnhancement(mount)"))throw new Error('Task 2 bank is not registered with the shared render lifecycle.');
if(!source.includes("Do not give a fake precise band score"))throw new Error('AI coaching prompt lost the no-fake-band guardrail.');
if(!index.includes('./writing-task2-bank-v110.js'))throw new Error('index.html does not load the V1.10 Task 2 bank runtime.');
console.log('V1.10 Task 2 static guardrails passed: 10 original prompts, 5 families × 2, 250-word evidence, shared learner schemas, event-driven lifecycle.');
