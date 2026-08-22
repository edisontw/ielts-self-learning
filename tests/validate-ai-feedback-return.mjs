import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const source=fs.readFileSync(path.join(root,'ai-feedback-return-v1.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const assert=(condition,message)=>{ if(!condition) throw new Error(message); };

for(const token of [
  'aiFeedbackReturns',
  'sourceEvidenceId',
  'appliedByEvidenceId',
  'function comparison',
  'function linkRetryToFeedback',
  'data-ai-feedback-return',
  'data-ai-feedback-progress',
  'data-ai-feedback-today',
  'Bring back 2–3 changes, not an AI score.',
  'No AI band, rating, or examiner score is imported.'
]) assert(source.includes(token),`AI feedback return runtime missing ${token}`);

assert(source.includes('priorities.length < 2'),'AI feedback return must require at least two actionable priorities.');
assert(source.includes('.slice(0,3)'),'AI feedback return must store no more than three priorities.');
assert(source.includes("retryEvent.attemptKind !== 'retry'"),'Only revision/retry evidence may close a pending feedback cycle.');
assert(source.includes('processDelta'),'Comparison must use existing process self-check evidence.');
assert(source.includes('wordCountDelta'),'Comparison should retain a simple before/after word-count signal.');
assert(!source.includes('aiScore:'),'AI-generated scores must not be stored as structured learner evidence.');
assert(!source.includes('bandScore:'),'AI-generated band scores must not be stored as structured learner evidence.');
assert(!source.includes('examinerScore:'),'AI-generated examiner scores must not be stored as structured learner evidence.');

const productiveIndex=index.indexOf('./productive-evidence-v1.js');
const feedbackIndex=index.indexOf('./ai-feedback-return-v1.js');
assert(productiveIndex>=0 && feedbackIndex>productiveIndex,'AI feedback return must load after productive evidence.');

const store=new Map();
globalThis.localStorage={
  getItem:key=>store.has(key)?store.get(key):null,
  setItem:(key,value)=>store.set(key,String(value)),
  removeItem:key=>store.delete(key),
  clear:()=>store.clear()
};
globalThis.location={hash:'#/qa'};
globalThis.window={addEventListener(){},dispatchEvent(){return true;}};
globalThis.document={documentElement:{},addEventListener(){},querySelector(){return null;}};
globalThis.MutationObserver=class{observe(){}};
globalThis.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail;}};

const { comparison, linkRetryToFeedback }=await import(`../ai-feedback-return-v1.js?test=${Date.now()}`);
const first={id:'pe-first',ts:100,skill:'writing',lessonId:'W05',attemptKind:'first',criteria:['task','position'],score:.4,wordCount:180};
const retry={id:'pe-retry',ts:300,skill:'writing',lessonId:'W05',attemptKind:'retry',criteria:['task','position','development','organization'],score:.8,wordCount:225};
const adaptive={
  productiveEvidence:{writing:[first,retry],speaking:[]},
  productivePriority:{},
  aiFeedbackReturns:{writing:[{id:'afr-1',ts:200,skill:'writing',lessonId:'W05',sourceEvidenceId:'pe-first',sourceAttemptKind:'first',priorities:['Develop the main idea','Clarify paragraph roles'],appliedByEvidenceId:null,appliedAt:null,comparison:null}],speaking:[]}
};

const diff=comparison(first,retry);
assert(Math.abs(diff.processDelta-.4)<1e-9,'Process comparison delta is incorrect.');
assert(diff.wordCountDelta===45,'Word-count comparison delta is incorrect.');
assert(diff.criteriaAdded.includes('development')&&diff.criteriaAdded.includes('organization'),'Comparison must identify newly satisfied process criteria.');

const linked=linkRetryToFeedback(retry,adaptive);
assert(linked?.appliedByEvidenceId==='pe-retry','Retry must link to the pending feedback set.');
assert(linked?.comparison?.criteriaAdded?.includes('development'),'Linked feedback must retain before/after comparison.');
assert(linkRetryToFeedback(retry,adaptive)===null,'The same retry must not close another already-applied feedback cycle.');

console.log('✓ AI feedback return stores 2–3 actionable priorities without structured AI scoring');
console.log('✓ Returned feedback anchors to a saved productive attempt');
console.log('✓ A later retry closes one pending feedback cycle');
console.log('✓ Before/after comparison uses process criteria and word count only');
