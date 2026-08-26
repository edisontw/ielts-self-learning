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
- Error Notebook, Repair lessons, spaced Review Queue and lesson-derived Vocabulary Review;
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

## Learning layers

### Core curriculum — 30 units

- `LB01–LB04` Learning Better
- `R01–R05` Reading
- `L01–L05` Listening
- `W01–W05` Writing
- `S01–S05` Speaking
- `VG01–VG03` Vocabulary / Grammar Repair
- `I01–I03` IELTS Strategy

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

- Mini Tests: ML01–ML04
- Question Type Labs: all 12 QL01–QL06 Set B/C recordings
- Quick Placement and Core Lessons: Placement + L01–L05
- Full Mock Listening production media

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

Validation covers curriculum registration, learner-state flow, prerequisite guardrails, 12 Labs and their A/B/C depth sets, Mini Tests, production audio, Full Mock integration, Study Plan, local-data backup, Diagnostics, modal interactions, mobile guardrails and Site Guide behaviour.

## Source of truth

See [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md).

Implementation hierarchy:

1. V1.0 — product principles
2. V1.1 — UX / architecture / curriculum specification
3. V1.2 — prototype content pack
4. V1.3 — content depth expansion and current implementation
5. regression tests

## Next implementation priorities

1. expand Vocabulary / Grammar Repair from real recurring Error Notebook tags rather than adding generic grammar lessons blindly;
2. perform direct deployed desktop and mobile QA for Placement → Study Plan → lesson → Lab A/B/C → Mini Test → Repair → retry → Full Mock → backup / restore;
3. reduce progressive DOM-patching technical debt by consolidating mature UI enhancements into the base renderer;
4. evaluate account sync or PWA only after the content, media and learner-data model is stable.
