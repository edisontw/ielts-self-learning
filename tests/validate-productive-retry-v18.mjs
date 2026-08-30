import assert from 'node:assert/strict';
import fs from 'node:fs';

const feedback=fs.readFileSync(new URL('../ai-feedback-return-v1.js',import.meta.url),'utf8');
const evidence=fs.readFileSync(new URL('../productive-evidence-v1.js',import.meta.url),'utf8');

for (const token of [
  'data-ai-feedback-pending',
  'data-af-action="revise-now"',
  'data-af-action="retry-evidence"',
  'Revision / retry',
  'data-ai-feedback-cycle-complete',
  'focusRevision',
  'primeRetryEvidence'
]) assert.ok(feedback.includes(token),`Feedback runtime missing ${token}`);

for (const token of [
  'pendingFeedbackForLesson',
  'data-pe-feedback-retry',
  "${pendingFeedback?'selected':''}",
  "Save revision / retry evidence",
  'ielts-ai-feedback-return-change'
]) assert.ok(evidence.includes(token),`Productive evidence runtime missing ${token}`);

assert.match(feedback,/retryEvent\.attemptKind !== 'retry'/,'Only retry evidence may close feedback.');
assert.match(feedback,/input\.scrollIntoView/,'Revision CTA must navigate to the editable draft/transcript.');
assert.match(feedback,/input\.focus/,'Revision CTA must focus the editable draft/transcript.');
assert.match(feedback,/kind\.value='retry'/,'Revision intent must prime Productive Evidence as retry.');
assert.doesNotMatch(feedback,/aiScore:|bandScore:|examinerScore:/,'External AI scores must not enter structured learner evidence.');
assert.doesNotMatch(evidence,/aiScore:|bandScore:|examinerScore:/,'Productive evidence must remain process-only.');

console.log('✓ Pending AI feedback exposes a dominant revise/retry CTA');
console.log('✓ Revision navigation focuses the existing draft/transcript and primes retry evidence');
console.log('✓ Pending feedback makes Productive Evidence default to Revision / retry');
console.log('✓ Only a saved retry closes the feedback cycle; no AI score is imported');
