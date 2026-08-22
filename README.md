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
- first Question Type Lab batch: Reading TFNG, Reading Matching Headings, Listening Multiple Choice, Listening Form/Notes Completion
- interactive checks with answer explanations and lesson-level error tags
- Error Notebook stored locally
- Review Queue with spaced-review scheduling
- adaptive Today recommendation using V1.1 weighted factors
- three data-triggered repair lessons: VG01, VG02, VG03
- VG01–VG03 use standard `#/lesson/<id>` routes and also appear in Learn
- lesson-based Vocabulary Review cards with due scheduling
- observed skill-performance profile from checked lesson/repair answers
- Writing / Speaking productive-skill evidence with first-attempt vs revision/retry tracking
- productive evidence remains separate from objective-question accuracy and never claims an IELTS band
- productive retry priority can surface on Today and productive evidence appears in Progress
- placement-to-performance weighting: real answers gain influence as evidence grows
- lesson completion, notes and study history
- Writing workspace with word count and portable AI prompt builder
- Speaking recorder where `MediaRecorder` is available, with transcript fallback
- Prompt Library preview/copy flow
- IELTS Strategy lessons integrated into the IELTS page
- Question Type Lab has a dedicated IELTS-page index and remains separate from the 30-unit core completion count
- 30-unit curriculum completion count integrated into Progress
- light/dark theme
- English-first interface with optional Traditional Chinese support notes
- runtime synthetic browser voice fallback for prototype Listening audio
- dependency-free content/runtime/curriculum validation through `npm test`
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
- adaptive metadata and lesson graph registration
- full first-curriculum distribution = 30 unique units
- each new curriculum lesson has identity, classification, level, objective, Chinese scaffolding and at least seven lesson stages
- checked lesson questions have unique IDs, valid answers, rationales and error tags
- VG01–VG03 repair objects and standard lesson-route integration
- Review Queue ratings
- lesson-derived Vocabulary Review objects and scheduling ratings
- positive Today recommendation weights total 100%
- observed skill-performance runtime is mounted
- Writing / Speaking productive evidence stores attempt type and retry process signals
- productive evidence is explicitly labelled as process evidence rather than an IELTS score
- Question Type Lab V1 = QR01 / QR02 / QL01 / QL02
- Question Type Lab checked items have answers, rationales, error tags and repair links
- IELTS Strategy / Question Type Lab page integration and 30-unit Progress UI
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

## First 30-unit curriculum

### Learning Better — 4

- `LB01` Practice Is Not the Same as Testing
- `LB02` Stop Trying to Understand Every Word
- `LB03` Mistakes Are Data
- `LB04` How to Use AI Without Letting AI Do the Learning

### Reading — 5

- `R01` Find the Main Idea Without Translating Everything
- `R02` Read for Structure, Not Just Words
- `R03` Paraphrases: The Language IELTS Uses to Hide Answers
- `R04` True, False or Not Given?
- `R05` Matching Headings Without Reading Every Line

### Listening — 5

- `L01` Listen for Meaning, Not Individual Words
- `L02` Why You Hear the Word but Still Miss the Answer
- `L03` Recognize Paraphrases While Listening
- `L04` Don't Fall for the Distractor
- `L05` Predict Before You Listen

### Writing — 5

- `W01` Answer the Question Before You Try to Sound Advanced
- `W02` One Main Idea Is Not Enough — Develop It
- `W03` Build a Strong Academic Paragraph
- `W04` Task 2: Build a Clear Position in Five Minutes
- `W05` Task 2 Writing Workspace: Opinion Essay

### Speaking — 5

- `S01` Give More Than a One-Sentence Answer
- `S02` Fluency Does Not Mean Speaking Fast
- `S03` Stop Restarting Your Sentences
- `S04` Speaking Part 2: Build a Two-Minute Answer
- `S05` Speaking Part 3: Explain, Compare and Speculate

### Vocabulary / Grammar Repair — 3

- `VG01` Learn Collocations, Not Isolated Words
- `VG02` Articles in Academic Writing
- `VG03` Complex Sentences Without Losing Control

### IELTS Strategy — 3

- `I01` Understand IELTS Academic Before You Start Practising
- `I02` How to Move from Band 6 Toward Band 7
- `I03` How to Review an IELTS Practice Test

Repair ranking uses saved error tags and Vocabulary/Grammar placement results. Repair lessons use normal lesson URLs and page structure. All non-repair curriculum units register adaptive metadata so the recommendation layer can use them as candidates.

## Question Type Lab V1

Question Type Lab is intentionally separate from the 30-unit core curriculum. It trains one exam-specific decision at a time while reusing the normal lesson renderer, Error Notebook, Repair, Review Queue and skill-performance evidence.

Initial labs:

- `QR01` True / False / Not Given — evidence and scope
- `QR02` Matching Headings — paragraph purpose and trap control
- `QL01` Listening Multiple Choice — distractor / final-decision tracking
- `QL02` Form & Notes Completion — answer-type prediction, paraphrase, spelling/number/word-limit control

Lab mistakes use the same error tags and can point back to R04/R05/L03/L04/L05 repair content. Labs are hidden from the core Learn index and surfaced under IELTS → Question Type Lab.

## Quick Placement

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

### Writing / Speaking productive evidence

Writing and Speaking cannot be represented honestly by multiple-choice accuracy alone.

The productive evidence layer therefore stores a separate local signal:

`FIRST ATTEMPT → SELF-CHECK → FEEDBACK → REVISION / RETRY → SELF-CHECK`

Writing process criteria include task fulfilment, position/purpose, idea development, organization and recurring language checks.

Speaking process criteria include direct response, answer development, continuity after small mistakes, unnecessary repetition and natural spoken language.

The system stores attempt type, criteria completed, word count and retry change. This can create a Today priority such as “complete a feedback → retry cycle”, but it is never presented as an official or estimated IELTS band.

## Review Queue

Saved errors automatically receive a schedule.

- Again → 1 day
- Hard → ≥2 days
- Good → ≥3 days
- Easy → ≥7 days

Successful recall increases the next interval. Review metadata uses `ielts-adaptive-v1`, separate from the original app state, so the original app does not overwrite scheduling data.

## Vocabulary Review

Vocabulary cards are lesson-derived rather than a generic “IELTS 5000 words” list.

The growing seed includes language from core lessons and Question Type Lab, including:

- `play a crucial role in`
- `pose a challenge`
- `central claim`
- `insufficient evidence`
- `paragraph purpose`
- `final decision`
- `final status`
- `word limit`
- `lead to`
- `maintain a clear position`
- `recurring error`
- `qualified claim`
- `under time pressure`

Cards unlock after their source lesson or repair lesson is completed.

Flow:

`CONTEXT → CHOOSE/RECALL → FEEDBACK → COLLOCATION → RATE RECALL → NEXT REVIEW`

Vocabulary uses the same Again / Hard / Good / Easy scheduling concept as Error Review.

## Data policy

Core V1 data remains in browser storage only: profile, placement result, progress, errors, notes, writing drafts, Speaking transcripts and study history.

Adaptive review, repair, Vocabulary Review, observed skill performance, productive evidence and adaptive learning history are also local-only.

There is no account or backend in this prototype.

## AI workflow

The website does not call a paid LLM API.

`MY ANSWER → BUILD PROMPT → COPY → EXTERNAL LLM → FEEDBACK → RETURN → REWRITE / RETRY`

Prompt templates cover Writing Task 1, Writing Task 2, Speaking transcript feedback, Grammar, Vocabulary and Error Analysis.

`LB04`, `W05`, `S04` and `S05` explicitly teach and use the attempt → feedback → rewrite/retry loop so AI remains a coach rather than a replacement for the learner's work.

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

1. perform live-device / deployed-site interaction QA, especially productive-evidence persistence and Question Type Lab separation
2. expand Question Type Lab toward the V1.1 12–16-unit target and add the first Reading / Listening Mini Tests
3. build 4 / 8 / 12 / 16-week Study Plan logic using placement, real performance, productive retry evidence, review due dates and available study time
4. improve return-from-AI workflow so learners can record revision priorities without copying an AI score into the profile
5. replace prototype Listening speech with production-quality audio before public release
6. only after the content and learner-data model stabilise, evaluate account/cloud sync or PWA work
