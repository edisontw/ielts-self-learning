// Compatibility re-export for code/tests that still import the V1.4 filename.
// Production registration now lives in repair-registry-v15.js and rendering is
// handled by the deterministic V1.5 render lifecycle.
export { ERROR_TAG_FAMILIES, V14_REPAIR_LESSONS } from './repair-registry-v15.js';
