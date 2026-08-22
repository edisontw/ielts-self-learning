# IELTS Self-Learning

A local-first IELTS Academic self-learning prototype for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

Core loop:

`DIAGNOSE → LEARN → PRACTICE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW`

## Current prototype

Implemented:

- responsive Today / Learn / IELTS / Improve / Progress shell
- Quick Placement V1: 24 questions across Vocabulary, Grammar, Reading and Listening
- placement scoring, confidence, uneven-profile guardrail and recommended difficulty
- complete first 30-unit curriculum: Learning Better 4 / Reading 5 / Listening 5 / Writing 5 / Speaking 5 / Vocabulary & Grammar Repair 3 / IELTS Strategy 3
- Question Type Lab expanded to **12 units**: Reading 6 + Listening 6
- first Test Mode Mini Tests: **MR01 Reading 12 questions / 12 min** and **ML01 Listening 10 questions / 9 min**
- adaptive **4 / 8 / 12 / 16-week Study Plan** with configurable study days and minutes per session
- Study Plan uses Placement, observed performance, productive retry evidence, due review, Lab / Mini Test history and available time
- Error Notebook + data-triggered Repair lessons + spaced Review Queue
- lesson-derived Vocabulary Review with due scheduling
- adaptive Today recommendation using weakness, review due, IELTS relevance, skill balance, difficulty and time fit
- observed skill-performance evidence from checked lesson, repair, Lab and submitted Mini Test questions
- Writing / Speaking productive-skill evidence with first-attempt vs revision/retry tracking
- productive evidence remains separate from objective-question accuracy and never claims an IELTS band
- Writing workspace with word count and portable AI prompt builder
- Speaking recorder where `MediaRecorder` is available, with transcript fallback
- IELTS Strategy, Question Type Lab and Mini Test sections on the IELTS page
- 30-unit core completion remains separate from Lab / Mini Test completion
- English-first interface with optional Traditional Chinese scaffolding
- browser `speechSynthesis` fallback for prototype Listening media
- dependency-free validation through `npm test` and GitHub Actions

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

Validation covers Placement, curriculum registration, adaptive metadata, repair/review flow, Vocabulary Review, productive evidence, the 12 Question Type Labs, MR01 / ML01 Test Mode rules, Study Plan inputs / phase logic / integration, script load order and mobile guardrails.

## Source of truth

See [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md).

Implementation hierarchy:

1. V1.0 — product principles
2. V1.1 — UX / architecture / curriculum specification
3. V1.2 — prototype content pack
4. implementation

Key constraints:

- English proficiency 60% / IELTS preparation 40%
- English-first, Traditional Chinese only as optional scaffolding
- ability and skill-specific profile before fixed labels
- Quick Placement recommends a starting point; it does not claim an exact IELTS band
- AI is a coach, not an examiner
- no paid LLM API is required
- error → explanation → repair → retry → review is part of the learning loop
- user data is local-first in V1

## First 30-unit curriculum

### Learning Better — 4

`LB01–LB04`

### Reading — 5

`R01–R05`

### Listening — 5

`L01–L05`

### Writing — 5

`W01–W05`

### Speaking — 5

`S01–S05`

### Vocabulary / Grammar Repair — 3

`VG01–VG03`

### IELTS Strategy — 3

`I01–I03`

The fixed core remains **30 units**. Question Type Lab and Mini Test are intentionally separate practice layers.

## Question Type Lab — 12 units

Question Type Lab trains one exam decision at a time in Practice Mode while reusing the normal lesson renderer, Error Notebook, Repair, Review Queue, Vocabulary Review and observed skill-performance evidence.

### Reading — 6

- `QR01` True / False / Not Given
- `QR02` Matching Headings
- `QR03` Reading Multiple Choice
- `QR04` Sentence Completion
- `QR05` Matching Information
- `QR06` Summary Completion

### Listening — 6

- `QL01` Multiple Choice / distractors
- `QL02` Form & Notes Completion
- `QL03` Map & Plan Labelling
- `QL04` Matching
- `QL05` Short Answer
- `QL06` Sentence Completion

Labs are hidden from the core Learn index and surfaced under **IELTS → Question Type Lab**.

## Mini Test V1 — Test Mode

See [`docs/question-type-lab-mini-test-v1.md`](docs/question-type-lab-mini-test-v1.md).

### `MR01` Reading Mini Test 01

- 12 questions
- 12-minute timer
- mixed Reading question types
- no hints / answer checking before submission
- submitted items feed existing Reading performance evidence

### `ML01` Listening Mini Test 01

- 10 questions
- 9-minute timer
- one prototype browser-speech playback
- transcript hidden until submission
- submitted items feed existing Listening performance evidence

Test Mode rules:

`TIMED → ONE ATTEMPT → NO HINTS → SUBMIT → ITEM REVIEW → ERROR NOTEBOOK → REPAIR`

Mini Test scores are diagnostic raw scores only and are **not IELTS band estimates**.

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

Recent repetition applies a negative penalty. Due Error Notebook or Vocabulary Review retrieval takes priority over new material.

Checked lesson, repair, Lab and submitted Mini Test answers update observed skill performance as evidence accumulates.

## Writing / Speaking productive evidence

Writing and Speaking are not represented by multiple-choice accuracy alone.

The productive evidence layer stores a separate process signal:

`FIRST ATTEMPT → SELF-CHECK → FEEDBACK → REVISION / RETRY → SELF-CHECK`

It records attempt type, self-check criteria, word count and retry change. It may create a Today priority such as “complete a feedback → retry cycle”, but it never becomes an official or estimated IELTS band.

## Review Queue

Saved errors receive spaced review scheduling:

- Again → 1 day
- Hard → ≥2 days
- Good → ≥3 days
- Easy → ≥7 days

Missed Mini Test items can be copied directly into the same Error Notebook and then enter this flow.

## Vocabulary Review

Vocabulary cards are lesson-derived rather than a generic word list.

Flow:

`CONTEXT → CHOOSE / RECALL → FEEDBACK → COLLOCATION → RATE RECALL → NEXT REVIEW`

Cards now unlock from core lessons, Repair lessons and Question Type Lab units.

## Adaptive Study Plan V1

See [`docs/study-plan-v1.md`](docs/study-plan-v1.md).

The Progress page can generate a plan using:

- **4 / 8 / 12 / 16 weeks**
- **3 / 4 / 5 / 6 study days per week**
- **20 / 30 / 45 / 60 minutes per session**

Planning inputs include Placement, observed objective performance, Writing / Speaking productive retry evidence, saved skill-specific errors, due Error / Vocabulary review, completed core lessons, Question Type Labs and Mini Test history.

The plan is divided into:

`FOUNDATION → BUILD → TRANSFER → TEST & REVIEW`

It preserves the product balance of roughly **60% English skill building / up to 40% explicit IELTS transfer**. Foundation weeks deliberately use less Test/Lab work. Short plans do not claim that every learner can complete all 30 core units.

Today surfaces the next incomplete session from the current week. Progress shows the whole plan and allows explicit regeneration when available time or learner priorities change.

Internal priority values are planning signals only and are **not IELTS scores or band estimates**.

## AI workflow

The website does not call a paid LLM API.

`MY ANSWER → BUILD PROMPT → COPY → EXTERNAL LLM → FEEDBACK → RETURN → REWRITE / RETRY`

AI feedback is coaching input, not examiner scoring.

## Listening prototype note

Current Listening media can use browser `speechSynthesis` so the prototype remains static and dependency-free. Before public production release, replace this with high-quality recorded or licensed English audio while preserving transcripts, question timing, answer logic and accessibility.

## Data policy

Core profile, progress, errors, notes, drafts, transcripts, test answers and study history remain in browser storage. Adaptive review, Vocabulary Review, productive evidence, observed performance, Mini Test history and the generated Study Plan are also local-only.

There is no account or backend in this prototype.

## Next implementation priorities

1. perform deployed desktop/mobile interaction QA for Study Plan, Lab, Mini Test timers, persistence and Error Notebook transfer
2. improve return-from-AI revision logging without importing an AI-generated score into the learner profile
3. add a second Reading and Listening Mini Test after MR01 / ML01 timing and difficulty are reviewed
4. refine Study Plan rebalancing from real usage patterns after deployed interaction QA
5. replace prototype Listening speech with production-quality audio before public release
6. only after the content and learner-data model stabilise, evaluate account/cloud sync or PWA work
