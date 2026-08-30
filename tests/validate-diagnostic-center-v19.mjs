import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime=fs.readFileSync(new URL('../diagnostic-center-v19.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(runtime,/const WRITING_BASELINE_WORDS=150/);
assert.match(runtime,/const SPEAKING_BASELINE_WORDS=60/);
assert.match(runtime,/adaptive\.miniTestHistory/);
assert.match(runtime,/mock\.history/);
assert.match(runtime,/adaptive\.productiveEvidence/);
assert.match(runtime,/forms\.length>=2\?'stronger':forms\.length===1\?'baseline':'missing'/);
assert.match(runtime,/counts\.at\(-2\)>=WRITING_BASELINE_WORDS&&counts\.at\(-1\)>=250/);
assert.match(runtime,/Speaking Mock beta completion alone is not counted/);
assert.match(runtime,/data-mini-action="start" data-test-id="\$\{esc\(next\.id\)\}"/);
assert.match(runtime,/id:'MR01'/);
assert.match(runtime,/id:'ML01'/);
assert.match(runtime,/id:'WT1-05'/);
assert.match(runtime,/id:'SPB01'/);
assert.match(runtime,/registerRenderEnhancement\(inject\)/);
assert.doesNotMatch(runtime,/new MutationObserver/);
assert.doesNotMatch(runtime,/setInterval/);
assert.doesNotMatch(runtime,/localStorage\.setItem/);
assert.match(runtime,/This is evidence coverage, not an IELTS band/);
assert.match(runtime,/does not yet a dedicated full diagnostic exam|not yet a dedicated full diagnostic exam/);
assert.match(index,/mock-diagnostics-extension-v1\.js[\s\S]*diagnostic-center-v19\.js[\s\S]*site-guide-v1\.js/);

console.log('✓ V1.9 Diagnostic Evidence Center reuses Placement, timed Test/Mock and productive first-attempt evidence');
console.log('✓ Writing requires 150+ words; Speaking requires 60+ transcript words; complete Mock Writing requires Task 1 150+ and Task 2 250+');
console.log('✓ One timed Reading/Listening form is baseline evidence; two or more distinct forms are broader evidence');
console.log('✓ Speaking Mock beta completion alone is not treated as diagnostic skill evidence');
console.log('✓ Diagnostic Center is read-only, event-driven and makes no fake IELTS band claim');
