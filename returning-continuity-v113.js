import { syncReviewPlanEvidence } from './study-plan-v1.js';

function syncOnRefresh() {
  syncReviewPlanEvidence();
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', syncOnRefresh);
  window.addEventListener('pageshow', syncOnRefresh);
}

export { syncOnRefresh };
