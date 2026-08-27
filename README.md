# IELTS Self-Learning

A local-first IELTS Academic self-learning workspace for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

Current version: **v0.14.0**

Core loop:

`DIAGNOSE → LEARN → PRACTISE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW`

## Start here

The website now explains a four-step learner path directly on Today:

1. take Quick Placement;
2. create a 4 / 8 / 12 / 16-week Study Plan;
3. work from Today rather than choosing random material;
4. save errors, repair the skill, retry and review later.

A persistent **How to use** button explains Today, Learn, IELTS, Improve and Progress, plus the difference between Practice Mode and Test Mode.

## Current implementation

- responsive Today / Learn / IELTS / Improve / Progress workspace;
- Quick Placement: 24 questions across Vocabulary, Grammar, Reading and Listening;
- complete 30-unit curriculum:
  - Learning Better 4
  - Reading 5
  - Listening 5
  - Writing 5
  - Speaking 5
  - Vocabulary / Grammar Repair 3
  - IELTS Strategy 3
- V1.4 error-driven Vocabulary / Grammar Repair extensions outside the core 30-unit denominator:
  - `VG04` Paraphrase: Same Meaning, Different Form
  - `VG05` Use Grammar to Predict the Answer Type
- V1.5 consolidated event-driven render lifecycle:
  - no full-document Repair / Adaptive `MutationObserver`;
  - no one-second Learn / learning-runtime polling;
  - one data-driven Repair route renderer;
  - explicit app-startup barrier, Repair liveness guard and render-stable note input;
  - deployed production regression closed with the complete V1.3 journey **6/6 PASS** plus V1.5 lifecycle checks **5/5 PASS**;
- V1.6 evidence-driven Reading / Listening Skill Repair extensions outside the core 30-unit denominator:
  - `RR01` Main Idea vs Supporting Detail — selected from **23 Reading main-idea** audit signals;
  - `LR01` Track the Final Number — selected from **27 Listening number** audit signals;
  - Batch 1 production closure passed **5/5 deployed E2E scenarios** covering skill-aware Improve routing, RR01/LR01 mastery, production MP3 delivery, and completed-state refresh;
  - Batch 2 coverage-overlap audit found five larger error families already adequately taught by Core/Labs and identified **Reading inference (9 signals)** as the only current untreated instructional gap;
  - `RR02` Infer Only What the Evidence Supports — adds a focused evidence → limited conclusion → overclaim rejection Repair loop without adding a new runtime layer;
  - Batch 2 production closure passed **5/5 deployed E2E scenarios** covering skill-aware `inference` routing, RR02 direct-route integrity, RR02 mastery, LR01 production-MP3 regression, and Learn completion refresh;
  - Batch 3 routes already-covered transfer failures back to existing Core / Lab practice rather than creating duplicate Repair content;
  - generic Reading `detail` → R02 → QR03, heading-specific detail → R05 → QR02, Listening `detail` → L05 → QL05, distractor → L04 → QL01, correction → L04 → QL06, Reading scope → R04 → QR01;
  - Error Notebook adds Core/Lab review CTAs only when the original saved item cannot be directly retried; normal lesson `Retry question` keeps priority;
  - Mini Test / Test Mode errors are explicitly excluded from fake single-question Retry even after their definitions enter the shared lesson registry;
  - Batch 3 production closure passed **5/5 deployed E2E scenarios** covering Improve family separation, Error Notebook Core→Lab CTAs, Mini Test retry boundaries across rerender, standard-lesson Retry priority, and real R04→QR01 navigation;
  - the canonical post-Batch-3 coverage matrix now scans all **388 tagged questions** on every `npm test` and classifies recurring Reading/Listening families as V/G Repair, RR/LR Skill Repair, routed reuse, taught-but-unrouted, or gap-review;
  - Batch 4 adds four semantically clear reuse routes without changing the runtime: Reading information function → R02 → QR05, contradiction → R04 → QR01, Not Given → R04 → QR01, and summary logic → R02 → QR06;
  - Batch 4 moves exactly **31 tagged questions** from taught-but-unrouted to routed reuse: routed reuse **105 → 136**, taught-but-unrouted **82 → 51**;
  - heterogeneous `reading-evidence` (9 signals) remains intentionally unrouted because its questions span TFNG, MCQ/supporting-evidence, and general claim/evidence decisions;
  - Batch 4 production closure passed **5/5 deployed E2E scenarios** covering the four new routes, the deferred-evidence negative guard, Mini Test rerender/Test Mode preservation, direct lesson Retry priority, and real QR05/R04/QR06 navigation;
  - generic Full Mock tags are matched with the question skill so compact tags cannot silently cross-route between Reading and Listening;
  - LR01 reuses two existing QA-approved production Question Type Lab MP3s in Practice Mode rather than substituting text-only pseudo-listening;
- 12 Question Type Labs: Reading 6 + Listening 6;
  - every Lab now contains Set A guided practice + Set B independent practice + Set C retry challenge;
  - V1.3 adds 72 unseen B/C questions across QR01–QR06 and QL01–QL06;
  - all 12 Listening Set B/C production MP3 assets are live; browser voice remains only as a labelled playback fallback.
- eight timed Mini Tests:
  - MR01–MR04 Reading — 12 questions / 12 minutes each
  - ML01–ML04 Listening — 10 questions / 9 minutes each;
- production MP3 audio live for ML01–ML04;
- Full Mock Test Center with 40 Listening + 40 Academic Reading + 2 Writing tasks + 3 Speaking parts;
- prerequisite-safe Adaptive Today recommendations;
- configurable Study Plan using Placement, observed performance, due review, productive retry evidence and available time;
- Error Notebook, Vocabulary / Grammar Repair, Reading / Listening Skill Repair, spaced Review Queue and lesson-derived Vocabulary Review;
- Writing / Speaking productive evidence and revision comparison;
- portable external-AI prompt workflow without importing AI band scores;
- local learner-data export, import and reset, including Full Mock history;
- privacy-safe Diagnostics / Troubleshooting;
- English-first interface with optional Traditional Chinese scaffolding;
- dependency-free validation through `npm test` and GitHub Actions.

## Product rules

- English proficiency development remains roughly 60% of the product; explicit IELTS preparation remains up to 40%.
- Quick Placement recommends a starting point. It does not estimate an exact IELTS band.
- Mini Test and Full Mock results are learning evidence, not automatic official IELTS band scores.
- AI is a coach, not an examiner.
- Learner data is local-first and no account is required.
- A wrong answer should lead to explanation, repair, retry and later review.
- Reading / Listening process errors stay separate from Vocabulary / Grammar language-system repair unless the evidence genuinely overlaps.
- High error frequency alone does not justify another lesson: existing Core/Lab coverage must be audited first.

## Learning layers

### Core curriculum — 30 units

- `LB01–LB04` Learning Better
- `R01–R05` Reading
- `L01–L05` Listening
- `W01–W05` Writing
- `S01–S05` Speaking
- `VG01–VG03` Vocabulary / Grammar Repair
- `I01–I03` IELTS Strategy

### Evidence-driven Repair extensions — outside `/30`

Vocabulary / Grammar:

- `VG04` Paraphrase: Same Meaning, Different Form
- `VG05` Use Grammar to Predict the Answer Type

Reading / Listening Skill Repair:

- `RR01` Main Idea vs Supporting Detail
- `RR02` Infer Only What the Evidence Supports
- `LR01` Track the Final Number

All Repair extensions reuse the same mastery rule:

`WRONG → RETRY → CORRECT ALL GUIDED CHECKS → FINISH`

### Question Type Lab — 12 units × 3 sets

Each Lab uses:

`SET A GUIDED → SET B INDEPENDENT → REPAIR IF NEEDED → SET C RETRY CHALLENGE`

Reading:

- `QR01` True / False / Not Given
- `QR02` Matching Headings
- `QR03` Multiple Choice
- `QR04` Sentence Completion
- `QR05` Matching Information
- `QR06` Summary Completion

Listening:

- `QL01` Multiple Choice / distractors
- `QL02` Form & Notes Completion
- `QL03` Map & Plan Labelling
- `QL04` Matching
- `QL05` Short Answer
- `QL06` Sentence Completion

Set B and Set C use new passages / situations / distractors rather than repeating Set A answers. This lets Error → Repair → Retry use unseen items instead of memorised answers.

### Mini Tests — Test Mode

Test Mode rule:

`TIMED → ONE SUBMISSION → NO HINTS → SUBMIT → ITEM REVIEW → ERROR NOTEBOOK → REPAIR`

ML01–ML04 use one successful playback per attempt. The transcript remains hidden until submission. Production MP3 is preferred; browser speech is only a labelled fallback if the MP3 cannot be played.

A Mini Test error never becomes a fake single-question Practice Mode retry merely because Mini Test definitions are registered in the shared lesson catalog. Its next step remains review / targeted existing practice / full Test Mode retake.

## Adaptive Today and Improve routing

Positive recommendation factors:

| Factor | Weight |
|---|---:|
| Weakness | 30% |
| Review due | 20% |
| IELTS target relevance | 15% |
| Skill balance | 15% |
| Difficulty match | 10% |
| Available-time match | 10% |

Recent repetition applies a negative penalty. Due Error Notebook or Vocabulary Review retrieval takes priority over new material. Locked lessons are not recommended before their prerequisites, and completed lessons are not treated as new work.

V1.6 Skill Repair does not silently enter the older Vocabulary / Grammar ranking. It has a separate Improve surface and requires matching active error evidence.

V1.6 distinguishes an **instruction gap** from a **transfer failure**. High-frequency errors that are already taught are routed back to focused Core/Lab practice rather than producing duplicate Repair lessons.

Routing priority:

`DIRECT LESSON RETRY → EXISTING CORE REVIEW → QUESTION TYPE LAB TRANSFER`

Current evidence-backed reuse examples include:

- Reading detail → R02 → QR03;
- Reading heading-specific detail → R05 → QR02;
- Reading information function → R02 → QR05;
- Reading contradiction / Not Given → R04 → QR01;
- Reading summary logic → R02 → QR06;
- Listening detail → L05 → QL05;
- Listening distractor → L04 → QL01;
- Listening correction → L04 → QL06.

Dedicated RR/LR Skill Repair remains separate for the currently demonstrated instructional gaps: Reading main idea, Reading inference, and Listening number tracking.

`reading-evidence` is deliberately not assigned one fixed transfer Lab yet because the current evidence family mixes TFNG, MCQ, and general claim/evidence decisions. The next routing step should become question-type-aware rather than mechanically map every tag to one destination.

## Writing and Speaking

Productive skills use a separate process signal rather than multiple-choice accuracy:

`FIRST ATTEMPT → SELF-CHECK → FEEDBACK → REVISION / RETRY → SELF-CHECK`

The website stores attempt type, self-check criteria, word count and retry change. External AI feedback is stored only as 2–3 coaching priorities connected to the next revision or speaking retry.

## Study Plan

Progress can generate plans using:

- 4 / 8 / 12 / 16 weeks;
- 3 / 4 / 5 / 6 study days each week;
- 20 / 30 / 45 / 60 minutes per session.

Phases:

`FOUNDATION → BUILD → TRANSFER → TEST & REVIEW`

A test result does not silently rewrite the calendar. The learner explicitly chooses when to rebalance the remaining plan.

## Listening media

See [`docs/listening-media-v1.md`](docs/listening-media-v1.md), [`media/audio/README.md`](media/audio/README.md) and [`media/audio/manifest-v1.json`](media/audio/manifest-v1.json).

Runtime policy:

`PRODUCTION MP3 → if unavailable, LABELLED BROWSER-VOICE FALLBACK`

Current production-live assets:

- Mini Tests: ML01–ML04
- Question Type Labs: all 12 QL01–QL06 Set B/C recordings
- Quick Placement and Core Lessons: Placement + L01–L05
- Full Mock Listening production media

LR01 reuses the production-live QL02-B and QL06-C recordings as Repair practice. No duplicate audio asset is created.

Quick Placement and L01–L05 production MP3 assets are live; browser speech is retained only as a labelled fallback if production playback fails.

## Local data and privacy

The browser stores Placement, profile, progress, errors, notes, drafts, transcripts, review schedules, productive evidence, Mini Test history, Full Mock history and Study Plan data.

Progress provides:

`EXPORT BACKUP → IMPORT BACKUP → RESET LEARNER DATA`

No learner backup is uploaded to a server. The diagnostics report excludes essay text, transcript text, selected-answer text and AI-feedback content.

## Run locally

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Use an HTTP server rather than `file://` so JSON loading, microphone access and browser storage behave consistently.

## Validate

Node 20+ is sufficient; no package installation is required.

```bash
npm test
```

Validation covers curriculum registration, learner-state flow, prerequisite guardrails, 12 Labs and their A/B/C depth sets, Mini Tests, production audio, Full Mock integration, Study Plan, local-data backup, Diagnostics, modal interactions, mobile guardrails, Site Guide behaviour, the V1.5 event-driven render lifecycle, V1.6 skill-aware Repair routing, the canonical 388-question Reading/Listening coverage matrix, existing-practice route ownership, and the production Mini Test retry boundary.

Browser smoke performs real RR01 and RR02 interaction loops — wrong → Retry → correct all → Finish — verifies both LR01 production MP3s, and runs a seeded Error Notebook / Improve harness that checks evidence-backed Core/Lab routes, the deferred `reading-evidence` guard, standard lesson Retry priority, Mini Test Test Mode preservation across rerender, and real Core/Lab navigation.

V1.5 production closure is documented in [`V1.5-DOM-CONSOLIDATION.md`](V1.5-DOM-CONSOLIDATION.md).

V1.6 Batch 1 design, evidence and production closure are documented in [`V1.6-EVIDENCE-DRIVEN-SKILL-REPAIR.md`](V1.6-EVIDENCE-DRIVEN-SKILL-REPAIR.md). Production commit `1ef32e7ed779f701228e4458af6c126ec02e9bb1` passed main Validate #275, Pages #187, and deployed Skill Repair E2E **5/5** in Run `33068400626` with artifact `9644712452`.

V1.6 Batch 2 coverage rationale is documented in [`V1.6-BATCH2-COVERAGE-AUDIT.md`](V1.6-BATCH2-COVERAGE-AUDIT.md). Production closure is documented in [`V1.6-BATCH2-PRODUCTION-CLOSURE.md`](V1.6-BATCH2-PRODUCTION-CLOSURE.md): production commit `50b1f600d4db1f6c5035cf6937700685dd2d2a97` passed main Validate #285, Pages #189, and deployed Batch 2 Skill Repair E2E **5/5** in Run `33070911893` with artifact `9645757604`.

V1.6 Batch 3 existing-practice routing and production closure are documented in [`V1.6-BATCH3-EXISTING-PRACTICE-ROUTING.md`](V1.6-BATCH3-EXISTING-PRACTICE-ROUTING.md). Final production main `3b0df73893e39d2d2b2463e0a7f43c9c8bc04926` passed main Validate #295, Pages #192, and deployed Batch 3 E2E **5/5** in Run `33079169130` with artifact `9649245009`.

The canonical post-Batch-3 full coverage decision gate is documented in [`V1.6-POST-BATCH3-COVERAGE-MATRIX.md`](V1.6-POST-BATCH3-COVERAGE-MATRIX.md).

V1.6 Batch 4 routing expansion and production closure are documented in [`V1.6-BATCH4-ROUTING-EXPANSION.md`](V1.6-BATCH4-ROUTING-EXPANSION.md). Production main `52b92cc20b81f5feb2d60c2909cbbb35c1652975` passed main Validate #304, Pages #195, and deployed Batch 4 E2E **5/5** in Run `33090281510` with artifact `9654050907`.

## Source of truth

See [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md).

Implementation hierarchy:

1. V1.0 — product principles
2. V1.1 — UX / architecture / curriculum specification
3. V1.2 — prototype content pack
4. V1.3 — content depth expansion and production E2E baseline
5. V1.4 — error-driven Vocabulary / Grammar Repair extensions
6. V1.5 — progressive DOM-patching consolidation
7. V1.6 — evidence-driven Reading / Listening Skill Repair and evidence-aware existing-practice routing
8. regression tests

## Next implementation priorities

1. design a **question-type-aware transfer rule** for heterogeneous `reading-evidence` (9 signals) rather than forcing one fixed Lab destination;
2. inspect actual questions before adding any lower-frequency route; likely candidates are Reading paragraph-purpose (6), heading-purpose (5), Listening attitude (4) and direction (4), but frequency alone is not sufficient;
3. keep the five frequency-3 `GAP-REVIEW` families under observation until more multi-layer evidence accumulates rather than creating new RR/LR Repair now;
4. keep Mini Test / Full Mock Test Mode boundaries explicit when adding future Error Notebook actions;
5. keep the 30-unit core denominator, learner-state keys, and backup schema stable;
6. defer account sync / PWA unless a concrete product need outweighs the current local-first model.
