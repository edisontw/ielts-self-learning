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
- lesson completion, notes and study history
- Writing workspace with word count and portable AI prompt builder
- Speaking recorder where `MediaRecorder` is available, with transcript fallback
- Prompt Library preview/copy flow
- light/dark theme
- English-first interface with optional Traditional Chinese support notes
- runtime synthetic browser voice fallback for prototype Listening audio
- dependency-free content validation through `npm test`
- GitHub Actions validation workflow

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

Validation currently checks:

- Placement = 4 sections / 24 unique questions
- every answer appears in its options
- five core adaptive lesson metadata objects
- VG01–VG03 repair objects
- Review Queue ratings
- positive Today recommendation weights total 100%
- adaptive JS/CSS are loaded by `index.html`

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

Repair ranking uses saved error tags and Vocabulary/Grammar placement results.

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

If an Error Notebook item is due for review, Review Queue takes priority over new material.

## Review Queue

Saved errors automatically receive a schedule.

- Again → 1 day
- Hard → ≥2 days
- Good → ≥3 days
- Easy → ≥7 days

Successful recall increases the next interval. Review metadata uses a separate browser key, `ielts-adaptive-v1`, to prevent the original app state from overwriting scheduling data.

## Data policy

Core V1 data remains in browser storage only: profile, placement result, progress, errors, notes, writing drafts, Speaking transcripts and study history.

Adaptive review/repair metadata is also local-only and stored separately.

There is no account or backend in this prototype.

## AI workflow

The website does not call a paid LLM API.

`MY ANSWER → BUILD PROMPT → COPY → EXTERNAL LLM → FEEDBACK → RETURN → REWRITE / RETRY`

Prompt templates cover Writing Task 1, Writing Task 2, Speaking transcript feedback, Grammar, Vocabulary and Error Analysis.

## Listening prototype note

The V1.2 content pack defines prototype synthetic audio. The current repository uses a browser `speechSynthesis` fallback so the first implementation remains fully static and has no binary-audio deployment dependency.

Before public production release, replace this with higher-quality recorded or licensed English speech while preserving transcripts, question timing, answer logic and accessibility text.

## Next implementation priorities

1. perform full desktop/mobile interaction QA, including persistence and microphone fallbacks
2. integrate repair lessons into the generic lesson renderer instead of the current adaptive modal layer
3. add real Vocabulary Review cards and due scheduling
4. add stronger skill-performance signals from completed lessons, not Placement alone
5. expand from 5 complete lessons toward the first 30-unit curriculum map
6. replace prototype Listening speech with production-quality audio before public release
