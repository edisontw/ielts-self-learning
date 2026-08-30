import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime=fs.readFileSync(new URL('../return-context-v18.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(runtime,/RETURN_CONTEXT_KEY='ielts-return-context-v18'/);
assert.match(runtime,/RETURN_CONTEXT_MAX_AGE_MS=2\*60\*60\*1000/);
assert.match(runtime,/sessionStorage\.setItem\(RETURN_CONTEXT_KEY/);
assert.doesNotMatch(runtime,/localStorage\.setItem\(RETURN_CONTEXT_KEY/);
assert.match(runtime,/kind:isMini\?'mini-result':'mock-result'/);
assert.match(runtime,/kind:fromNotebook\?'error-notebook':'improve'/);
assert.match(runtime,/targetHash:'#\/ielts'/);
assert.match(runtime,/targetHash:'#\/improve'/);
assert.match(runtime,/Return to Error Notebook/);
assert.match(runtime,/Returned review · read-only/);
assert.match(runtime,/submitted Test Mode attempt stays read-only/);
assert.match(runtime,/clone\.querySelectorAll\('\[data-mini-action\],\[data-mock-action\]/);
assert.match(runtime,/removeAttribute\('data-mini-action'\)/);
assert.match(runtime,/removeAttribute\('data-mock-action'\)/);
assert.match(runtime,/clone\.querySelectorAll\('input,textarea,select'\)/);
assert.match(runtime,/node\.disabled=true/);
assert.match(runtime,/root\.querySelector\('\[data-result-priorities-v18\]'\)/);
assert.match(runtime,/document\.addEventListener\('click',handleClick,true\)/);
assert.match(runtime,/registerRenderEnhancement\(renderReturnContext\)/);
assert.doesNotMatch(runtime,/history\.back/);
assert.doesNotMatch(runtime,/new MutationObserver/);
assert.match(index,/result-priorities-runtime-v18\.js[\s\S]*return-context-v18\.js/);

console.log('✓ V1.8 return context is session-only, bounded, and does not alter permanent learner storage');
console.log('✓ Test/Mock return uses a read-only submitted-review snapshot rather than reopening Test Mode');
console.log('✓ Error Notebook and result-priority routes carry explicit return intent without browser-history assumptions');
console.log('✓ Return continuity reuses the shared render lifecycle and adds no document-wide observer');
