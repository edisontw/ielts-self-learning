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
- four Test Mode Mini Tests: **MR01 + MR02 Reading, 12 questions / 12 min each; ML01 + ML02 Listening, 10 questions / 9 min each**
- cross-form Mini Test trend analysis that looks for recurring missed error tags across two different forms
- adaptive **4 / 8 / 12 / 16-week Study Plan** with configurable study days and minutes per session
- Study Plan uses Placement, observed performance, productive retry evidence, due review, Lab / Mini Test history and available time
- prerequisite-safe Adaptive Today recommendations across the learner journey
- Error Notebook + data-triggered Repair lessons + spaced Review Queue
- lesson-derived Vocabulary Review with due scheduling
- observed skill-performance evidence from checked lesson, repair, Lab and submitted Mini Test questions
- Writing / Speaking productive-skill evidence with first-attempt vs revision/retry tracking
- AI feedback return logging: save 2–3 external-LLM revision priorities and connect them to the next retry without importing AI band scores
- local learner-data **Export / Import / Reset** using a versioned, allow-listed JSON backup format
- read-only in-app Diagnostics / Troubleshooting with privacy-safe copyable reports
- production-first Listening media layer: real audio assets are preferred; browser `speechSynthesis` is fallback only
- full learner-journey state regression from Placement through Study Plan, Mini Test, productive evidence, backup/restore and Diagnostics
- productive evidence remains separate from objective-question accuracy and never claims an IELTS band
- Writing workspace with word count and portable AI prompt builder
- Speaking recorder where `MediaRecorder` is available, with transcript fallback
- IELTS Strategy, Question Type Lab and Mini Test sections on the IELTS page
- 30-unit core completion remains separate from Lab / Mini Test completion
- English-first interface with optional Traditional Chinese scaffolding
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

Validation covers Placement, curriculum registration, adaptive metadata, prerequisite guardrails, repair/review flow, Vocabulary Review, productive evidence, AI feedback return logging, the 12 Question Type Labs, all four Mini Test forms, cross-form recurring error patterns, Study Plan integration, local-data backup/import/reset, Diagnostics, the full learner-journey state path, production-first Listening media, script load order and mobile guardrails.

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

## Mini Tests — Test Mode

See [`docs/question-type-lab-mini-test-v1.md`](docs/question-type-lab-mini-test-v1.md) and [`docs/mini-test-v2.md`](docs/mini-test-v2.md).

### Reading

- `MR01` Reading Mini Test 01 — 12 questions / 12 minutes
- `MR02` Reading Mini Test 02 — 12 questions / 12 minutes

Both use new, self-contained passages and mixed Reading decisions. Submitted items feed existing Reading performance evidence.

### Listening

- `ML01` Listening Mini Test 01 — 10 questions / 9 minutes
- `ML02` Listening Mini Test 02 — 10 questions / 9 minutes

Both use one successful playback per attempt. The runtime prefers the production MP3 path and falls back to browser speech only when the production file is unavailable. The transcript remains hidden until submission. Submitted items feed existing Listening performance evidence.

Test Mode rules:

`TIMED → ONE SUBMISSION → NO HINTS → SUBMIT → ITEM REVIEW → ERROR NOTEBOOK → REPAIR`

Mini Test scores are diagnostic raw scores only and are **not IELTS band estimates**.

### Cross-form transfer evidence

The two Reading forms and two Listening forms intentionally share several error-tag dimensions. New submissions are annotated with missed error-tag counts, and the IELTS page compares the two most recent **different** forms for that skill.

A repeated tag across MR01 + MR02 or ML01 + ML02 is stronger transfer evidence than one isolated miss or two attempts on the same form.

This trend can prompt the learner to review and explicitly rebalance the Study Plan. A test result does not silently rewrite the calendar.

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

Adaptive Today now filters new-material recommendations through actual lesson prerequisites. Locked Question Type Labs and later core lessons are not offered early, and already completed lessons are not treated as new work.

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

MR02 / ML02 answers enter the same observed-performance path as MR01 / ML01, so a second test form can change Reading / Listening priority the next time the learner explicitly rebalances the plan.

Internal priority values are planning signals only and are **not IELTS scores or band estimates**.

## AI workflow

See [`docs/ai-feedback-return-v1.md`](docs/ai-feedback-return-v1.md).

The website does not call a paid LLM API.

`MY ANSWER → SAVE EVIDENCE → BUILD PROMPT → COPY → EXTERNAL LLM → RETURN 2–3 PRIORITIES → REWRITE / RETRY → SAVE EVIDENCE → COMPARE`

Returned AI feedback is stored as coaching priorities linked to a specific Writing / Speaking attempt. The next retry can be compared using the website's own process self-check and word count.

External AI band scores are not imported into the learner profile. AI feedback remains coaching input, not examiner scoring.

## Production-first Listening media

See [`docs/listening-media-v1.md`](docs/listening-media-v1.md) and [`media/audio/README.md`](media/audio/README.md).

Listening now follows:

`PRODUCTION MP3 → if unavailable, BROWSER VOICE FALLBACK`

Normal lesson and Placement `<audio>` controls use their existing production paths. A browser-voice button appears only after a production file fails to load; it is no longer shown alongside working production audio.

For ML01 / ML02 Test Mode, the production-first layer preserves one successful playback per attempt. If the MP3 fails, browser voice may be used. If both sources fail, the learner is not charged a playback attempt.

The repository currently defines the production asset contract but does **not** claim that all production-quality recordings are already present. Audio provenance and licence information must be recorded before public release.

## Local Data Portability V1

See [`docs/local-data-portability-v1.md`](docs/local-data-portability-v1.md).

The Progress page provides:

`EXPORT BACKUP → IMPORT BACKUP → RESET LEARNER DATA`

Export creates a local JSON file containing the known IELTS learner-data keys plus the Light/Dark preference. Import validates the format, schema, allow-listed keys and broad data shapes before asking the learner to replace current browser data.

Reset removes only IELTS learner-data keys and intentionally preserves the Light/Dark preference. The implementation does not call `localStorage.clear()` and does not upload backup files to a server.

## Diagnostics / troubleshooting

See [`docs/diagnostics-v1.md`](docs/diagnostics-v1.md).

Progress contains a read-only diagnostic panel for app/schema versions, browser capabilities, local-data counts and stale/malformed references. The copyable report deliberately excludes essay text, transcripts, selected-answer text and AI feedback content.

## Data policy

Core profile, progress, errors, notes, drafts, transcripts, test answers and study history remain in browser storage. Adaptive review, Vocabulary Review, productive evidence, AI feedback returns, observed performance, Mini Test history / error-tag trends and the generated Study Plan are also local-only.

These learner-data stores can be exported and restored through a versioned JSON backup. There is still no account or backend in this prototype.

## Next implementation priorities

1. create and QA the actual production audio for `ML01` and `ML02`, including transcript alignment, natural pacing, distractor timing and mobile playback
2. create and QA production audio for Placement and L01–L05
3. perform direct deployed desktop/mobile interaction QA for the full learner journey, including real audio, microphone and file import/export
4. review MR02 / ML02 timing, distractor difficulty and recurring-error usefulness with real learner attempts
5. refine Study Plan rebalancing from actual multi-test usage patterns without silently rewriting the learner's calendar
6. only after the content, media and learner-data model stabilise, evaluate account/cloud sync or PWA work
