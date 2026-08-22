# IELTS Self-Learning

A local-first IELTS Academic self-learning prototype for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

Core loop:

`DIAGNOSE → LEARN → PRACTICE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW`

## Current prototype

Implemented:

- responsive Today / Learn / IELTS / Improve / Progress shell
- Quick Placement V1: 24 questions across Vocabulary, Grammar, Reading and Listening
- placement scoring, confidence, uneven-profile guardrail and recommended difficulty
- five complete V1.2 lessons: LB01, R01, L01, W01, S01
- interactive checks with answer explanations
- Error Notebook stored locally
- Review Queue with spaced-review scheduling
- adaptive Today recommendation using V1.1 weighted factors
- three data-triggered repair lessons: VG01, VG02, VG03
- VG01–VG03 now use standard `#/lesson/<id>` routes and also appear in Learn
- lesson-based Vocabulary Review cards with due scheduling
- observed skill-performance profile from checked lesson/repair answers
- placement-to-performance weighting: real answers gain influence as evidence grows
- lesson completion, notes and study history
- Writing workspace with word count and portable AI prompt builder
- Speaking recorder where `MediaRecorder` is available, with transcript fallback
- Prompt Library preview/copy flow
- light/dark theme
- English-first interface with optional Traditional Chinese support notes
- runtime synthetic browser voice fallback for prototype Listening audio
- dependency-free content/runtime validation through `npm test`
- GitHub Actions validation workflow
- mobile QA guardrails for safe-area spacing, tap targets, narrow layouts and workspace stacking

## Run locally

Serve the repository with any static server, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Do not rely on `file://` if you want JSON loading, microphone access and browser storage behavior to work consistently.

## Validate

Node 20+ is sufficient; no package installation is required.

```bash
npm test
```

Validation checks include:

- Placement = 4 sections / 24 unique questions
- every answer appears in its options
- five core adaptive lesson metadata objects
- VG01–VG03 repair objects and standard lesson-route integration
- Review Queue ratings
- lesson-based Vocabulary Review seed objects and scheduling ratings
- positive Today recommendation weights total 100%
- observed skill-performance runtime is mounted
- runtime avoids redundant localStorage writes when performance has not changed
- adaptive/runtime JS/CSS are loaded by `index.html`
- mobile tap-target and safe-area guardrails

GitHub Actions runs the same validation on pushes to `main` and pull requests.

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

## Prototype content

### Five complete lessons

- `LB01` Practice Is Not the Same as Testing
- `R01` Find the Main Idea Without Translating Everything
- `L01` Listen for Meaning, Not Individual Words
- `W01` Answer the Question Before You Try to Sound Advanced
- `S01` Give More Than a One-Sentence Answer

### Repair lessons

- `VG01` Learn Collocations, Not Isolated Words
- `VG02` Articles in Academic Writing
- `VG03` Complex Sentences Without Losing Control

Repair ranking uses saved error tags and Vocabulary/Grammar placement results. Repair lessons no longer depend on a separate modal-only learning experience; they use normal lesson URLs and page structure.

### Quick Placement

`content/placement/quick-placement-v1.json`

- Vocabulary × 6
- Grammar × 6
- Reading × 6
- Listening × 6
- Total × 24

Overall starting-stage rules:

| Score | Stage | Reference |
|---:|---|---|
| 0–8 | Build | B1+/B2- |
| 9–14 | Develop | B2- |
| 15–19 | Develop | B2 |
| 20–22 | Advance | B2+ |
| 23–24 | Advance | B2+/C1- signal |

A strong total cannot hide a very weak section; skill-specific recommendations remain visible.

## Adaptive Today

V1.1 positive factors are implemented as:

| Factor | Weight |
|---|---:|
| Weakness | 30% |
| Review due | 20% |
| IELTS target relevance | 15% |
| Skill balance | 15% |
| Difficulty match | 10% |
| Available-time match | 10% |

Recent repetition applies a negative penalty.

If an Error Notebook or Vocabulary Review item is due, retrieval review takes priority over new material.

### Placement → real performance

Placement remains the first signal. Checked lesson answers are then aggregated by skill.

Observed performance starts with a low evidence weight and receives more influence as the learner accumulates answers. Current prototype thresholds are:

- fewer than 4 checked answers → low evidence weight
- 4–7 checked answers → emerging evidence
- 8+ checked answers → moderate evidence

This prevents one early mistake from radically changing the learner profile while still allowing the system to move beyond the initial Placement result.

## Review Queue

Saved errors automatically receive a schedule.

- Again → 1 day
- Hard → ≥2 days
- Good → ≥3 days
- Easy → ≥7 days

Successful recall increases the next interval. Review metadata uses `ielts-adaptive-v1`, separate from the original app state, so the original app does not overwrite scheduling data.

## Vocabulary Review

Vocabulary cards are lesson-derived rather than a generic “IELTS 5000 words” list.

The initial seed includes chunks such as:

- `play a crucial role in`
- `pose a challenge`
- `a substantial increase in`
- `raise public awareness`
- `central claim`
- `supporting detail`
- `distractor`

Cards unlock after their source lesson or repair lesson is completed.

Flow:

`CONTEXT → CHOOSE/RECALL → FEEDBACK → COLLOCATION → RATE RECALL → NEXT REVIEW`

Vocabulary uses the same Again / Hard / Good / Easy scheduling concept as Error Review.

## Data policy

Core V1 data remains in browser storage only: profile, placement result, progress, errors, notes, writing drafts, Speaking transcripts and study history.

Adaptive review, repair, Vocabulary Review, observed skill performance and adaptive learning history are also local-only.

There is no account or backend in this prototype.

## AI workflow

The website does not call a paid LLM API.

`MY ANSWER → BUILD PROMPT → COPY → EXTERNAL LLM → FEEDBACK → RETURN → REWRITE / RETRY`

Prompt templates cover Writing Task 1, Writing Task 2, Speaking transcript feedback, Grammar, Vocabulary and Error Analysis.

## Listening prototype note

The V1.2 content pack defines prototype synthetic audio. The current repository uses a browser `speechSynthesis` fallback so the first implementation remains fully static and has no binary-audio deployment dependency.

Before public production release, replace this with higher-quality recorded or licensed English speech while preserving transcripts, question timing, answer logic and accessibility text.

## Mobile / responsive guardrails

The current extension layer adds explicit narrow-screen safeguards:

- primary controls keep at least 44 px tap height
- bottom navigation respects `safe-area-inset-bottom`
- writing/workspace layouts collapse to one column
- error answers and observed-profile rows stack on narrow phones
- lesson cards and reading passages reduce padding rather than shrinking text excessively
- sticky lesson progress accounts for the mobile top bar

These are implementation guardrails, not a substitute for final device visual QA.

## Next implementation priorities

1. perform live-device / deployed-site visual QA when a public preview is available
2. expand the full lesson registry beyond the current 5 core + 3 repair lessons
3. build the first 30-unit curriculum in controlled batches, starting with R02–R05 and L02–L05
4. add richer productive-skill evidence from Writing/Speaking retries instead of relying only on objective checked questions
5. replace prototype Listening speech with production-quality audio before public release
6. only after the content model stabilises, evaluate account/cloud sync or PWA work
