import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildResultPriorities, authorizedPriorityFor, resultPriorityPanelHTML } from '../result-priorities-v18.js';

const priorities=buildResultPriorities([
  {questionId:'MA02-R01',skill:'reading',errorTag:'inference'},
  {questionId:'MA02-R02',skill:'reading',errorTag:'inference'},
  {questionId:'MR03-Q6',skill:'reading',errorTag:'reading-inference'},
  {questionId:'MA02-L02',skill:'listening',errorTag:'number'},
  {questionId:'ML03-Q2',skill:'listening',errorTag:'listening-number'},
  {questionId:'MA02-L03',skill:'listening',errorTag:'distractor'}
]);

assert.equal(priorities[0].primary.id,'RR02');
assert.equal(priorities[0].count,3);
assert.equal(priorities[1].primary.id,'LR01');
assert.equal(priorities[1].count,2);
assert.equal(priorities[2].primary.id,'L04');
assert.equal(priorities[2].transfer.id,'QL01');

const evidenceMcq=authorizedPriorityFor({questionId:'MR02-Q5',skill:'reading',errorTag:'reading-evidence'});
assert.equal(evidenceMcq.primary.id,'R02');
assert.equal(evidenceMcq.transfer.id,'QR03');

const conditional=authorizedPriorityFor({questionId:'MA02-L09',skill:'listening',errorTag:'conditional-outcome'});
assert.equal(conditional.primary.id,'L04');

const spatial=authorizedPriorityFor({questionId:'MA02-L11',skill:'listening',errorTag:'spatial-sequence'});
assert.equal(spatial.primary.id,'QL03');
assert.equal(spatial.transfer,null);

const paraphrase=authorizedPriorityFor({questionId:'MR03-Q3',skill:'reading',errorTag:'reading-paraphrase'});
assert.equal(paraphrase.primary.id,'VG04');

// Skill-aware guardrail: a Listening main-idea item must not silently inherit RR01.
assert.equal(authorizedPriorityFor({questionId:'MA02-L01',skill:'listening',errorTag:'main-idea'}),null);

// Two-form academic-vocabulary evidence remains below the action threshold and must not gain a route here.
assert.equal(authorizedPriorityFor({questionId:'MA02-L40',skill:'listening',errorTag:'academic-vocabulary'}),null);
assert.equal(authorizedPriorityFor({questionId:'MA02-R40',skill:'reading',errorTag:'academic-vocabulary'}),null);

const noRouteHtml=resultPriorityPanelHTML([
  {questionId:'MA02-L40',skill:'listening',errorTag:'academic-vocabulary'},
  {questionId:'MA02-R40',skill:'reading',errorTag:'academic-vocabulary'}
],{sourceLabel:'MA02'});
assert.match(noRouteHtml,/none maps to an already-authorized Repair or existing-practice route/);
assert.doesNotMatch(noRouteHtml,/data-lesson=/);

const routedHtml=resultPriorityPanelHTML([
  {questionId:'MR03-Q6',skill:'reading',errorTag:'reading-inference'},
  {questionId:'MR03-Q8',skill:'reading',errorTag:'reading-reference'}
],{sourceLabel:'Reading Mini Test 03'});
assert.match(routedHtml,/Your priorities/);
assert.match(routedHtml,/Recommended next step: RR02/);
assert.match(routedHtml,/data-lesson="RR02"/);
assert.match(routedHtml,/data-lesson="RR03"/);

const runtime=fs.readFileSync(new URL('../result-priorities-runtime-v18.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(runtime,/registerRenderEnhancement\(renderResultPriorities\)/);
assert.doesNotMatch(runtime,/new MutationObserver/);
assert.match(runtime,/ielts-mini-test-submitted/);
assert.match(index,/result-priorities-runtime-v18\.js/);

console.log('✓ V1.8 result priorities group only already-authorized Repair / existing-practice destinations');
console.log('✓ Priority grouping remains skill-aware and preserves sparse academic-vocabulary / Listening main-idea guardrails');
console.log('✓ Mini Test / Full Mock enhancement uses the shared V1.5 render lifecycle without a new document-wide observer');
