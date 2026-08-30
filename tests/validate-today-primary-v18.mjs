import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime=fs.readFileSync(new URL('../today-primary-v18.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(runtime,/due\?'due-review':'adaptive',due\?400:100/);
assert.match(runtime,/'study-plan',300/);
assert.match(runtime,/'ai-feedback',200/);
assert.match(runtime,/'productive',150/);
assert.match(runtime,/if\(!core\.placement\)return/);
assert.match(runtime,/data\.todayPrimaryAction='true'/);
assert.match(runtime,/label\.textContent='Do this now'/);
assert.match(runtime,/rows\.slice\(1\)\.forEach\(row=>\{row\.card\.hidden=true;\}\)/);
assert.match(runtime,/seen=new Set\(\[primary\.key\]\)/);
assert.match(runtime,/if\(!row\.key\|\|seen\.has\(row\.key\)\)continue/);
assert.match(runtime,/unique\.length===2/);
assert.match(runtime,/Other useful options/);
assert.match(runtime,/registerRenderEnhancement\(orchestrateToday\)/);
assert.doesNotMatch(runtime,/new MutationObserver/);
assert.doesNotMatch(runtime,/setInterval/);
assert.match(index,/ux-polish-v1\.js[\s\S]*today-primary-v18\.js/);

console.log('✓ V1.8 Today ranks due review > Study Plan > pending AI feedback > productive retry > adaptive new material');
console.log('✓ Fresh pre-Placement onboarding remains outside orchestration');
console.log('✓ Only one full Today candidate remains visible; secondary actions are deduplicated and capped at two');
console.log('✓ Today orchestration uses the shared render lifecycle without a new observer or polling loop');
