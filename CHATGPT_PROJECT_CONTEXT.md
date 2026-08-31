# IELTS English Self-Learning — ChatGPT Project Context

**Purpose:** Durable cross-chat checkpoint. Read this first in every new ChatGPT window before changing the repository.

**Repository:** `edisontw/ielts-self-learning`  
**Production:** `https://edisontw.github.io/ielts-self-learning/`

## 1. Product purpose — do not drift

Build an IELTS Academic self-learning system for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

Core loop:

`DIAGNOSE → LEARN → PRACTISE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW → ADJUST → REPEAT`

Primary value: **the learner should know the highest-value next action without random navigation.**

Preserve:

- English development roughly 60%; explicit IELTS preparation up to roughly 40%;
- English-first UI with optional Traditional Chinese scaffolding;
- AI as coach, not examiner; no fake precise IELTS score;
- local-first learner data;
- wrong answer → explanation → repair/review → retry → later review;
- reuse existing teaching owners before adding Repairs;
- no route/Repair from one or two sparse signals;
- Test Mode does not become single-question Practice Mode retry;
- Core curriculum denominator remains 30.

## 2. Current maturity

The product now includes enough learning/test content to focus on quality rather than quantity:

- 30-unit core curriculum;
- V/G and Reading/Listening Repair extensions;
- 12 Question Type Labs with A/B/C depth;
- 8 Mini Tests: MR01–MR04 / ML01–ML04;
- Full Mock MA01 + independent MA02;
- Task 1 course + 12 reusable prompts;
- W01–W05 Task 2 teaching + V1.10 full-length Task 2 Practice Bank (10 prompts / 5 families);
- Speaking Practice Bank with 108 prompts/questions + V1.11 standardized Parts 1–3 sampler;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, reviews, productive evidence, AI feedback return, backup/import/reset, Diagnostics;
- V1.9 Diagnostic Evidence Center;
- production Listening audio across Placement, Core Listening, Question Type Labs, Mini Tests, MA01 and MA02;
- V1.13 production-verified learner journeys across activation, error/review, test transfer, productive AI handoff and returning continuity.

Do not add generic lessons, new Mini Tests/Full Mocks, Task 2 prompts, Speaking questions or Repairs merely to increase count.

## 3. Closed product/UX milestones — do not repeat

### V1.8 Learner Journey Optimization — CLOSED

PR #61 result priorities; #62 return/context continuity; #63 Today primary action; #64 productive feedback→retry; #65 mobile/a11y; #66 performance baseline; #67 Adaptive Today lifecycle optimization.

### V1.9 Better Diagnosis — CLOSED

Read:

- `V1.9-DIAGNOSTIC-AUDIT-01.md`
- `V1.9-DIAGNOSTIC-SUFFICIENCY-CLOSURE.md`

Decision: no separate giant four-skill Full Diagnostic is justified. Reading/Listening already have independent timed evidence; Writing/Speaking accumulate substantial productive evidence across sessions.

### V1.10 Task 2 Practice Bank — CLOSED

Read `V1.10-TASK2-PRACTICE-BANK-01.md`.

Production closure: PR #71/#72, V1.10 deployed Task 2 E2E PASS. Do not expand Task 2 quantity without new evidence.

### V1.11 Standardized Speaking Sampler — CLOSED

Read:

- `V1.11-SPEAKING-SAMPLER-01.md`
- `V1.11-SPEAKING-SAMPLER-CLOSURE.md`

The sampler reuses existing linked sets: Part 1 ×2 questions + Part 2 ×1 cue card + Part 3 ×2 questions. Evidence gate is Part1 ≥50, Part2 ≥100, Part3 ≥100, total ≥300 transcript words. It reuses existing `speakingTranscripts`, `productiveEvidence.speaking` and `aiFeedbackReturns.speaking`. Transcript-only AI cannot judge pronunciation/stress/intonation/pauses/hesitation/actual speech rate.

Production closure: PR #75 main `a6cfdfaa44ad7ca46a58c2e8a6c69f843058cdaa`; Pages #242 PASS; Validate #411 PASS; deployed Speaking sampler E2E PASS.

### V1.12 MA02 Production Listening Audio — CLOSED

Read:

- `V1.12-MA02-AUDIO-PREP-CHECKPOINT.md`
- `media/audio/mock-tests/MA02-PRODUCTION-AUDIO-PLAN.md`
- `media/audio/mock-tests/ma02-production-audio-spec-v1.json`
- `media/audio/mock-tests/ma02-production-assets-v1.json`
- `V1.12-MA02-PRODUCTION-AUDIO-CLOSURE.md`

Production release:

- PR #79 released the four approved MA02 production MP3 assets and runtime wiring;
- release merge: `f1e5490e664e27786f92fe17575069546fb71fb3`;
- Pages #246 PASS;
- main Validate #419 PASS, including deployed MP3 byte-size and Chrome metadata decoding checks;
- PR #80 closed the release and marked the manifest/assets `production-live`;
- closure main: `2b4cc9103fcfe0d82e26470323c1bb2db7847c6e`;
- Pages #247 PASS;
- final Validate #421 PASS, including deployed production E2E.

MA02 runtime policy is:

`PRODUCTION MP3 → labelled browser-voice fallback only if MP3 playback fails`

Canonical scripts, questions, answers and scoring were not changed during audio production.

### V1.13 Real Learner Trial / Product Hardening — CLOSED

Read:

- `V1.13-REAL-LEARNER-TRIAL-PLAN.md`
- `V1.13-REAL-LEARNER-TRIAL-CLOSURE.md`

Five seeded learner journeys are now production-verified:

1. fresh learner activation: Placement → result → Study Plan → Today → first action;
2. Error → Retry → Corrected → spaced review, while Test Mode preserves no-fake-single-question-retry boundaries;
3. Mini Test / Full Mock review → evidence-backed targeted practice → submitted-review return continuity;
4. Writing / Speaking external-AI coaching handoff → returned priorities → revision/retry evidence;
5. returning learner → due retrieval first → review completion → next Study Plan action with Progress/Today agreement.

Learner-friction fixes during V1.13 include clearer skill identity and visible Chinese scaffolding, one-time corrected-error review seeding, and automatic bounded synchronization from real review evidence into the current Study Plan review session.

Final pre-closure production baseline:

- main `c5d68d403964bfb7388fb8701f5bd9aba1eec55b`;
- Pages #257 / run `33408391120` PASS;
- Validate #470 / run `33408393657` PASS;
- A1–A5 local and deployed production gates all PASS;
- unresolved P0/P1 learner-journey findings: 0.

Do not repeat A1–A5 seeded journeys unless a new regression or product change makes them relevant.

## 4. Current product decision

V1.13 confirms that the current product can execute the intended learning loop without the previously observed seeded-journey blockers.

The next implementation milestone should **not** be chosen by adding content volume or reopening closed semantic audits.

New work should start from one of these evidence sources:

- representative learner observation;
- a reproducible production defect or regression;
- a separately approved product goal with a clear learner-value hypothesis.

The optional V1.13 Phase D representative-human trial was not performed in-repository. When representative IELTS learners are available, it remains the highest-value next evidence source because automated UAT cannot measure trust, hesitation or terminology comprehension.

## 5. NEXT DECISION POINT — POST-V1.13

Do not assign a V1.14 implementation scope merely to continue version numbering.

Preferred next sequence:

1. synchronize low-risk repository documentation hygiene, especially the README's stale V1.6-era `Next implementation priorities` section;
2. if representative IELTS learners are available, run the five V1.13 observation tasks without storing private learner content;
3. classify new findings using the V1.13 P0/P1/P2/P3 rules;
4. implement only evidence-backed friction or a separately approved product milestone;
5. keep content expansion deferred unless new evidence shows a real coverage need.

## 6. Guardrails

Do not:

- resume closed V1.6 semantic mining;
- restart V1.8/V1.9/V1.10/V1.11/V1.12/V1.13 work without new evidence;
- create MA03, MR05 or ML05 without new evidence;
- expand Core 30 merely to increase content count;
- manufacture Repairs from sparse evidence;
- auto-score Writing/Speaking as official IELTS bands;
- add more Task 2/Speaking questions merely for volume;
- rewrite production Listening scripts/questions;
- replace production audio with browser voice as the default;
- use copyrighted commercial IELTS recordings;
- add account sync / PWA unless a concrete product need justifies departing from the current local-first model.

## 7. Post-V1.13 implementation rule

For each proposed change:

1. identify a reproducible learner-journey problem or an explicitly approved product objective;
2. record the exact state/route/action where it occurs;
3. verify existing teaching/navigation cannot already solve it;
4. make the smallest change;
5. add regression coverage;
6. verify deployed production behavior;
7. only then consider the issue closed.

No feature should be added merely because it is common in other learning apps.

## 8. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.13-REAL-LEARNER-TRIAL-CLOSURE.md`.
3. Inspect current GitHub main/open PRs/Actions.
4. Do not redo prior closed UX/diagnostic/content/audio/seeded-UAT work.
5. Start from new learner evidence, a reproducible regression, or explicitly approved scope.
6. Prefer documentation hygiene / maintainability over content expansion when no learner evidence exists.

## 9. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → closed implementation docs → this checkpoint → current GitHub runtime/tests`
