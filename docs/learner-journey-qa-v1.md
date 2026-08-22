# Full Learner Journey QA V1

## Purpose

This QA pass validates the main local-first learner journey as one connected system rather than treating each feature as an isolated component.

Target journey:

`NEW USER → PLACEMENT → ADAPTIVE TODAY / STUDY PLAN → CORE LESSON → QUESTION TYPE LAB → MINI TEST → ERROR / REPAIR → PRODUCTIVE EVIDENCE → AI FEEDBACK RETURN → RETRY → BACKUP / RESTORE → DIAGNOSTICS`

## Deployment observation boundary

Repository metadata confirms that GitHub Pages is enabled and the configured homepage is:

`https://edisontw.github.io/ielts-self-learning/`

The current execution environment could not directly open that Pages URL: the web safety layer rejected the direct URL and web search had not indexed the newly created repository/site yet. Therefore this milestone does **not** claim screenshot-level or pointer-level observation of the deployed page.

Instead, the pass combines:

1. current GitHub `main` source inspection;
2. state-based end-to-end regression in Node 20-compatible CI;
3. existing responsive/source guardrails;
4. GitHub Pages repository metadata verification.

A later browser-accessible pass should still perform real desktop/mobile clicks, scroll, microphone permission, speech playback and file download/upload interactions.

## Issue found and fixed

### Adaptive Today could recommend locked content

Before this QA pass, `learning-runtime-v3.js` ranked every item in `CORE_LESSON_META` without checking the lesson's actual `prerequisites`.

Because the 30-unit curriculum and 12 Question Type Labs register adaptive metadata, a learner who had only completed Placement could theoretically receive an advanced lesson or Lab before completing the required foundation work.

### Fix

Two modules were added:

- `adaptive-guardrails-v1.js`
- `adaptive-today-guardrails-v1.js`

The guardrail layer:

- resolves prerequisites against the actual `LESSONS` registry;
- accepts completed core lessons and completed Repair work as prerequisite evidence;
- excludes completed content from new-material recommendations;
- prevents the Repair copy of VG01–VG03 from bypassing the prerequisite rules of their fixed-core copies;
- counts `ielts-strategy` in the seven-day skill-balance signal;
- displays the human-readable label `IELTS Strategy`;
- preserves the existing retrieval-first Error/Vocabulary Review path;
- provides a safe no-candidate fallback after the available path is exhausted instead of assuming a candidate always exists.

## End-to-end regression

`tests/qa-learner-journey.mjs` now verifies the following connected states.

### 1. Placement → Adaptive Today

With Placement complete but no lessons complete:

- beginner/foundation work remains available;
- no QR/QL Question Type Lab is eligible;
- every returned candidate satisfies its actual lesson prerequisites.

### 2. Core Reading → Lab unlock

After completing R01, R02 and R03:

- QR03 becomes eligible because R02 + R03 are satisfied;
- QR06 remains locked because later prerequisites are not yet complete.

### 3. IELTS Strategy balance

A recent I01 study-history event increments the `ielts-strategy` seven-day exposure count and renders with the label `IELTS Strategy`.

### 4. Mini Test evidence → Study Plan

The journey simulates MR01 evidence with 4/12 correct Reading answers plus a saved Reading error.

The generated 8-week Study Plan must then rank Reading as the highest planning priority.

This is a planning signal only. It is not converted into an IELTS band estimate.

### 5. Planned prerequisite chain

Any planned Lab must have its prerequisite content represented by already completed or planned lesson/Lab work.

### 6. Productive evidence + AI feedback return

The journey adds:

- one Writing productive evidence event;
- one external-AI feedback return linked to that attempt.

The feedback remains coaching data and does not add an AI band/score to the learner profile.

### 7. Backup → Restore

The learner state is exported through the production backup envelope, validated, restored into a fresh storage object and checked for preservation of:

- Study Plan;
- Mini Test history;
- productive evidence;
- AI feedback returns;
- theme.

### 8. Restore → Diagnostics

The restored state must not produce a Diagnostics data error. Diagnostics must still see the Mini Test attempt, productive evidence and feedback-return counts.

## CI integration

`npm test` now includes syntax validation for:

- `adaptive-guardrails-v1.js`
- `adaptive-today-guardrails-v1.js`

and executes:

- `tests/qa-learner-journey.mjs`

The app/backup release metadata is aligned at `0.12.0`.

## Remaining browser-only QA

The following still require a browser-accessible deployed pass:

- actual desktop navigation and scroll position;
- actual mobile bottom navigation and tap targets;
- Placement radio/button interaction;
- real Mini Test countdown/auto-submit timing;
- browser `speechSynthesis` playback and one-play behaviour;
- microphone permission and `MediaRecorder` capture;
- clipboard permissions/fallback;
- JSON backup download;
- file-picker import and confirmation dialogs;
- real localStorage persistence across reloads;
- light/dark visual contrast;
- long Writing text and mobile textarea ergonomics.

These are intentionally not reported as passed by the state-based CI regression.
