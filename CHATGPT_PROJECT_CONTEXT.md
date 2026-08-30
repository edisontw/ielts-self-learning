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
- production Listening audio across Placement, Core Listening, Question Type Labs, Mini Tests, MA01 and MA02.

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
- current closure main: `2b4cc9103fcfe0d82e26470323c1bb2db7847c6e`;
- Pages #247 PASS;
- final Validate #421 PASS, including deployed production E2E.

MA02 runtime policy is now:

`PRODUCTION MP3 → labelled browser-voice fallback only if MP3 playback fails`

Canonical scripts, questions, answers and scoring were not changed during audio production.

## 4. Current product decision

The repository now has enough content and automated regression coverage that the next milestone should **not** be another content-expansion release.

The next uncertainty is whether a real learner can move through the full product without confusion, dead ends or low-value navigation.

Therefore V1.13 is a **Real Learner Trial / Product Hardening** milestone.

Read `V1.13-REAL-LEARNER-TRIAL-PLAN.md` before changing implementation.

## 5. NEXT UNFINISHED MILESTONE — V1.13

> **Validate the full learning loop as a learner journey, then fix only evidence-backed friction.**

Priority journeys:

1. New learner: Quick Placement → Study Plan → Today → first lesson/practice.
2. Error loop: wrong answer → explanation → Error Notebook → Repair/review → Retry → corrected state.
3. Test transfer: Lab/Mini Test/Full Mock result → recommended next action → targeted practice → return to review.
4. Productive loop: Writing/Speaking attempt → self-check → AI prompt/feedback return → retry/revision → evidence update.
5. Returning learner: due review + Today recommendation + progress continuity after several days.

V1.13 should begin with seeded/manual UAT and production-browser evidence. Do not pre-design new features before a journey produces a concrete failure or friction signal.

## 6. Guardrails

Do not:

- resume closed V1.6 semantic mining;
- restart V1.8/V1.9/V1.10/V1.11/V1.12 work;
- create MA03, MR05 or ML05 without new evidence;
- expand Core 30 merely to increase content count;
- manufacture Repairs from sparse evidence;
- auto-score Writing/Speaking as official IELTS bands;
- add more Task 2/Speaking questions merely for volume;
- rewrite production Listening scripts/questions;
- replace production audio with browser voice as the default;
- use copyrighted commercial IELTS recordings;
- add account sync / PWA unless a concrete product need justifies departing from the current local-first model.

## 7. V1.13 implementation rule

For each proposed change:

1. identify a reproducible learner-journey problem;
2. record the exact state/route/action where it occurs;
3. verify existing teaching/navigation cannot already solve it;
4. make the smallest product fix;
5. add regression coverage;
6. verify deployed production behavior;
7. only then consider the issue closed.

No feature should be added merely because it is common in other learning apps.

## 8. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.12-MA02-PRODUCTION-AUDIO-CLOSURE.md` only if audio history is relevant.
3. Read `V1.13-REAL-LEARNER-TRIAL-PLAN.md`.
4. Inspect current GitHub main/open PRs/Actions.
5. Do not redo prior closed UX/diagnostic/content/audio work.
6. Continue from V1.13 learner-journey validation.
7. Fix only evidence-backed friction; do not expand content by default.

## 9. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → closed implementation docs → this checkpoint → current GitHub runtime/tests`
