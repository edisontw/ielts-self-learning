import fs from 'node:fs';

const source=fs.readFileSync(new URL('../speaking-sampler-v111.js',import.meta.url),'utf8');
const bank=fs.readFileSync(new URL('../speaking-practice-bank-v1.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

if(!source.includes('SPEAKING_LINKED_SETS')||!source.includes('SPEAKING_PART1_TOPICS')||!source.includes('SPEAKING_PART2_CARDS')||!source.includes('SPEAKING_PART3_SETS'))throw new Error('Sampler must reuse the existing linked Speaking bank sources.');
if(!bank.includes('export const SPEAKING_LINKED_SETS'))throw new Error('Existing Speaking bank no longer exposes linked sets.');
if(!source.includes("const MIN={part1:50,part2:100,part3:100,total:300}"))throw new Error('Standardized sampler part/total transcript thresholds changed unexpectedly.');
if(!source.includes("sampleParts:['part1','part2','part3']"))throw new Error('Sampler evidence must explicitly record Parts 1–3 coverage.');
if(!source.includes("lessonId:OWNER")||!source.includes('productiveEvidence.speaking.push')||!source.includes('aiFeedbackReturns.speaking.push'))throw new Error('Sampler must reuse existing productive evidence / feedback-return schemas.');
if(source.includes('ielts-speaking-sampler-'))throw new Error('Sampler introduced a parallel learner-data storage key.');
if(source.includes('new MutationObserver')||source.includes('setInterval(apply')||source.includes('setTimeout(apply'))throw new Error('Sampler must use shared render lifecycle, not permanent polling/observer.');
if(!source.includes('registerRenderEnhancement(mount)'))throw new Error('Sampler is not registered with shared render lifecycle.');
if(!source.includes('do not score or judge pronunciation')||!source.includes('do not give a fake precise official band score'))throw new Error('Transcript-only pronunciation / fake-band guardrails are missing from AI coaching.');
if(!index.includes('./speaking-sampler-v111.js'))throw new Error('index.html does not load the V1.11 Speaking sampler.');

const newPromptLiterals=[...source.matchAll(/SPB-P[123]-[A-Z-]+-Q\d/g)];
if(newPromptLiterals.length)throw new Error('Sampler should derive existing prompt IDs dynamically rather than duplicate bank question literals.');

console.log('V1.11 Speaking sampler static guardrails passed: existing linked bank reused, Parts 1–3 thresholds preserved, shared evidence schemas, transcript-only AI limits.');
