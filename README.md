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
- 12 Question Type Labs: Reading 6 + Listening 6;
- four timed Mini Tests:
  - MR01 / MR02 Reading — 12 questions / 12 minutes
  - ML01 / ML02 Listening — 10 questions / 9 minutes;
- production MP3 audio live for ML01 and ML02;
- prerequisite-safe Adaptive Today recommendations;
- configurable Study Plan using Placement, observed performance, due review, productive retry evidence and available time;
- Error Notebook, Repair lessons, spaced Review Queue and lesson-derived Vocabulary Review;
- Writing / Speaking productive evidence and revision comparison;
- portable external-AI prompt workflow without importing AI band scores;
- local learner-data export, import and reset;
- privacy-safe Diagnostics / Troubleshooting;
- English-first interface with optional Traditional Chinese scaffolding;
- dependency-free validation through `npm test` and GitHub Actions.

## Product rules

- English proficiency development remains roughly 60% of the product; explicit IELTS preparation remains up to 40%.
- Quick Placement recommends a starting point. It does not estimate an exact IELTS band.
- Mini Test results are diagnostic raw scores, not IELTS bands.
- AI is a coach, not an examiner.
- Learner data is local-first and no account is required.
- A wrong answer should lead to explanation, repair, retry and later review.

## Learning layers

### Core curriculum — 30 units

- `LB01–LB04` Learning Better
- `R01–R05` Reading
- `L01–L05` Listening
- `W01–W05` Writing
- `S01–S05` Speaking
- `VG01–VG03` Vocabulary / Grammar Repair
- `I01–I03` IELTS Strategy

### Question Type Lab — 12 units

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

### Mini Tests — Test Mode

Test Mode rule:

`TIMED → ONE SUBMISSION → NO HINTS → SUBMIT → ITEM REVIEW → ERROR NOTEBOOK → REPAIR`

ML01 and ML02 use one successful playback per attempt. The transcript remains hidden until submission. Production MP3 is preferred; browser speech is only a labelled fallback if the MP3 cannot be played.

## Adaptive Today

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

- `media/audio/mini-tests/ml01-research-skills-workshops.mp3`
- `media/audio/mini-tests/ml02-community-photography-walk.mp3`

Both assets have owner-confirmed deployed playback, recorded provenance, technical metadata and checksums.

## Local data and privacy

The browser stores Placement, profile, progress, errors, notes, drafts, transcripts, review schedules, productive evidence, Mini Test history and Study Plan data.

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

Validation covers curriculum registration, learner-state flow, prerequisite guardrails, Labs, Mini Tests, production audio, Study Plan, local-data backup, Diagnostics, modal interactions, mobile guardrails and the v0.14.0 Site Guide.

## Source of truth

See [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md).

Implementation hierarchy:

1. V1.0 — product principles
2. V1.1 — UX / architecture / curriculum specification
3. V1.2 — prototype content pack
4. current implementation and regression tests

## Next implementation priorities

1. create and QA production audio for Quick Placement and L01–L05;
2. add structured Writing and Speaking transfer tasks that use productive evidence rather than fake automatic band scoring;
3. perform direct deployed desktop and mobile QA for Placement → Study Plan → lesson → Lab → Mini Test → Repair → retry → backup / restore;
4. review MR02 / ML02 timing, distractor difficulty and recurring-error usefulness with real learner attempts;
5. improve Study Plan rebalancing from actual multi-test usage without silently changing the learner's calendar;
6. reduce progressive DOM-patching technical debt by consolidating mature UI enhancements into the base renderer;
7. evaluate account sync or PWA only after the content, media and learner-data model is stable.
