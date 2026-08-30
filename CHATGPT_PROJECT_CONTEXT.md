# IELTS English Self-Learning — ChatGPT Project Context

**Purpose:** Durable cross-chat checkpoint. Read this file first in every new ChatGPT window before changing the repository.

**Repository:** `edisontw/ielts-self-learning`  
**Production:** `https://edisontw.github.io/ielts-self-learning/`

## 1. Product purpose — do not drift

Build an IELTS Academic self-learning system for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

Core loop:

`DIAGNOSE → LEARN → PRACTISE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW → ADJUST → REPEAT`

Main product value: **the learner should know the highest-value next action without having to navigate or choose randomly.**

Preserve:

- English development roughly 60%; explicit IELTS preparation up to roughly 40%.
- English-first UI; Traditional Chinese optional scaffolding.
- AI is a coach, not an examiner; no false precise IELTS scores.
- Local-first learner data.
- Wrong answer → explanation → repair/review → retry → later review.
- Reuse an existing teaching owner before creating another Repair lesson.
- No route/Repair from one or two sparse signals.
- Mini Test / Full Mock Test Mode must not become fake single-question Practice Mode retry.
- Preserve the 30-unit core curriculum denominator.

## 2. Current maturity

The site is no longer content-scarce. It already includes:

- 30-unit core curriculum;
- evidence-driven V/G and Reading/Listening Repair extensions;
- 12 Question Type Labs with Set A / B / C depth;
- 8 Mini Tests (MR01–MR04 / ML01–ML04);
- Full Mock MA01 + independent MA02;
- Academic Writing Task 1 course + 12 practice prompts;
- Speaking Practice Bank;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, Review Queue, productive evidence, AI feedback return, backup/import/reset and Diagnostics;
- V1.9 Diagnostic Evidence Center on Progress;
- production audio across earlier Listening surfaces; MA02 Listening may remain on its explicit browser-voice production gate until separately upgraded.

Do **not** start a phase by adding generic lessons, Mini Tests, Full Mocks or Repairs merely to increase content count.

## 3. V1.8 learner-journey optimization — CLOSED 2026-08-30

Do not repeat these milestones:

1. V1.7 production gate — PR #60.
2. V1.8 learner-journey baseline audit — complete.
3. Test/Mock result prioritization — PR #61 production-closed.
4. Navigation/context continuity — PR #62 production-closed.
5. Today primary-action consolidation — PR #63 production-closed.
6. Productive feedback → retry clarity — PR #64 production-closed.
7. Mobile/accessibility QA batch 01 — PR #65 production-closed.
8. Performance measurement baseline — PR #66 production-closed.
   - merge main `583e48d2d622ae8601137a09e5055ffebe4dba49`;
   - final Validate #393 PASS; Pages #233 PASS; deployed E2E PASS;
   - measured 46 index module scripts / 62 eager JS modules / ~851 KB JS / ~49.6 KB CSS;
   - local Chrome baseline ~278 ms startup and ~25 ms route transitions;
   - zero media fetched before explicit playback;
   - 21 MutationObservers / 5 setInterval calls at baseline.
9. Adaptive Today lifecycle optimization — PR #67 production-closed.
   - merge main `203cda832d18a0387ecc84e027c346ed8cd3c23a`;
   - final Validate #395 PASS; Pages #234 PASS; deployed E2E PASS;
   - removed Adaptive Today document-wide observer + permanent 1.1-second polling;
   - moved it to the shared V1.5 event-driven lifecycle;
   - static baseline improved to 20 MutationObservers / 4 setInterval calls;
   - remaining intervals are active Writing / Mini Test / Full Mock timers.

V1.8 is closed. Do not continue low-value performance micro-optimization without new evidence.

## 4. Current phase — V1.9 Better Diagnosis

V1.9 improves diagnostic evidence quality and visibility before targeted content expansion.

The original V1.1 plan allowed a split-session Full Diagnostic:

- Reading 20–25 min;
- Listening 15–20 min;
- Writing 20–40 min;
- Speaking 10–15 min.

### V1.9 Batch 1 — Diagnostic Evidence Center — PRODUCTION-CLOSED

See `V1.9-DIAGNOSTIC-AUDIT-01.md`.

PR #68 production closure:

- merge main `83292950f4393b3003594179d85cb14c5c8f0694`;
- final-main Validate #397 PASS;
- Pages #235 PASS;
- deployed general production E2E PASS;
- local/static V1.9 diagnostic gates PASS.

Batch 1 reuses existing evidence rather than building another test bank:

- Quick Placement required as starting profile;
- Reading: ≥1 distinct timed Mini Test / Full Mock form; ≥2 = broader evidence;
- Listening: ≥1 distinct timed Mini Test / Full Mock form; ≥2 = broader evidence;
- Writing: ≥1 `first` productive attempt with 150+ words; multiple substantial first attempts or complete Mock Writing (Task 1 150+ + Task 2 250+) = broader evidence;
- Speaking: ≥1 `first` productive attempt with 60+ transcript words; multiple distinct substantial prompt samples = broader evidence;
- Speaking Mock beta completion alone is not counted because it stores no transcript/quality evidence.

Learner flow:

`Quick Placement → timed Reading baseline → timed Listening baseline → substantial Writing first attempt → substantial Speaking first attempt → Today`

The center is read-only and adds no learner-data schema or fake overall IELTS band.

### CURRENT UNFINISHED MILESTONE

> Add a **V1.9 deployed GitHub Pages Diagnostic Evidence gate** with a V1.9-specific deployment sentinel.

The current general production E2E proves the site and MA02 flow are live, but V1.9 should directly execute its own Diagnostic Center browser progression against deployed Pages.

After that gate closes, perform the diagnostic sufficiency audit below before adding content.

## 5. Next V1.9 sufficiency audit

Determine whether a 4/4 baseline is structurally broad enough. Do not assume new forms are needed.

Current likely gaps:

1. **Writing Task 2:** W01–W05 teach Task 2 skills, but reusable full-length independent practice is much richer for Task 1. A standardized 250+ word first-attempt diagnostic may be justified.
2. **Speaking Parts 1–3:** the Speaking Practice Bank already contains substantial original prompt depth, but baseline evidence is currently a transcript threshold rather than a fixed structured Parts 1–3 diagnostic sample.
3. **Reading/Listening:** existing Mini Tests + Full Mock sections already provide multiple independent timed forms. Do not add new R/L diagnostic forms unless evidence shows the short Mini Tests are insufficient.

Potential next implementation should therefore prefer **standardized productive diagnostic collection** over more Reading/Listening quantity.

## 6. V1.9 guardrails

Do not:

- call one short Mini Test a complete Full Diagnostic;
- output one fake overall IELTS band from mixed evidence;
- auto-score Writing/Speaking as official IELTS bands;
- treat Speaking Mock beta completion alone as proficiency evidence;
- create MA03, MR05 or ML05 as a substitute for diagnosis;
- resume V1.6 semantic mining;
- add RR/LR/VG Repair from sparse evidence;
- create dedicated diagnostic forms until the sufficiency audit identifies an actual gap.

## 7. Working method

- Check current main/open PRs/Actions before each batch.
- Read latest closure/checkpoint docs; do not redo closed audits.
- Prefer the smallest safe learner-flow change.
- Preserve storage schemas unless migration is justified and tested.
- Add regression coverage for learner-facing changes.
- Validate production-sensitive changes in real Chrome and against deployed GitHub Pages.
- Update this file after meaningful merged milestones.

## 8. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.9-DIAGNOSTIC-AUDIT-01.md`.
3. Inspect current GitHub main/open PRs/Actions.
4. Do not restart V1.6 audits or V1.8 learner-journey/performance work.
5. Finish the **V1.9 deployed Diagnostic Evidence gate** if not yet production-closed.
6. Then audit Writing Task 2 and structured Speaking diagnostic sufficiency before adding dedicated content.

## 9. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → implemented/closed version docs → this checkpoint → current GitHub runtime/tests`
