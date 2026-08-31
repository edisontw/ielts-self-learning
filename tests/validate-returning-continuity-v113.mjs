import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../study-plan-v1.js',import.meta.url),'utf8');
const bridge=fs.readFileSync(new URL('../returning-continuity-v113.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/const reviewEvidenceCount = adaptive => \(adaptive\.reviewHistory \|\| \[\]\)\.length \+ \(adaptive\.vocabularyHistory \|\| \[\]\)\.length/);
assert.match(source,/reviewEvidenceDone:\[\]/);
assert.match(source,/reviewEvidenceBaseline:evidenceBaseline/);
assert.match(source,/reviewEvidenceConsumed:evidenceBaseline/);
assert.match(source,/if \(due\.errors \|\| due\.vocab\) return false/);
assert.match(source,/latest < Number\(plan\.generatedAt \|\| 0\) \|\| Date\.now\(\) - latest > 5000/);
assert.match(source,/const weekNo = currentWeek\(plan\)/);
assert.match(source,/find\(t=>t\.kind==='review' && !evidenceDone\.has\(t\.key\) && !manualDone\.has\(t\.key\)\)/);
assert.match(source,/plan\.reviewEvidenceDone = \[\.\.\.evidenceDone,target\.key\]/);
assert.match(source,/plan\.reviewEvidenceConsumed = evidenceCount/);
assert.match(source,/Auto tracked from review evidence/);
assert.match(source,/if\(!taskItem \|\| taskItem\.kind!=='review' \|\| \(plan\.reviewEvidenceDone \|\| \[\]\)\.includes\(key\)\) return/);
assert.match(source,/export \{ generatePlan, prioritySnapshot, phaseFor, actualDone, syncReviewPlanEvidence, reviewEvidenceCount \}/);

assert.match(bridge,/import \{ syncReviewPlanEvidence \} from '\.\/study-plan-v1\.js'/);
assert.match(bridge,/window\.addEventListener\('hashchange', syncOnRefresh\)/);
assert.match(bridge,/window\.addEventListener\('pageshow', syncOnRefresh\)/);
assert.doesNotMatch(bridge,/MutationObserver|setInterval/);
assert.ok(index.indexOf('./returning-continuity-v113.js')>index.indexOf('./study-plan-v1.js'),'A5 continuity bridge must load after Study Plan runtime.');

console.log('✓ A5 review completion is driven by fresh Review Queue/Vocabulary evidence, not a synthetic Today state');
console.log('✓ A5 waits until all currently due retrieval is cleared before completing one active-week review session');
console.log('✓ A5 consumes the current evidence batch once, preventing one multi-item review session from completing later review sessions');
console.log('✓ Evidence-tracked review completion is distinct from the legacy manual review fallback');
console.log('✓ A5 uses the existing hashchange/pageshow refresh contract without adding polling or a new observer');
