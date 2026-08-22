# Source of Truth Contract

This repository implements the IELTS English Self-Learning product defined on 2026-08-22.

Implementation order:

`V1.0 product principles → V1.1 UX / architecture → V1.2 buildable content → website implementation`

If implementation exposes a real conflict, change the specification deliberately. Do not silently change the learning logic in code.

## V1.0 — Product principles

The product is an English-first IELTS Academic self-learning system for learners around IELTS 5.5–6.5 who want to move toward 6.5–7.5.

Non-negotiable principles:

- English proficiency ≈ 60% / IELTS preparation ≈ 40%.
- IELTS is the destination, not the entire curriculum.
- Track skills separately; do not lock a learner into one permanent level.
- CEFR is a learning reference, not an exact IELTS conversion.
- Quick Placement recommends a useful starting point; it does not claim a precise IELTS band.
- The core loop is `DIAGNOSE → LEARN → PRACTICE → TEST → ANALYZE ERRORS → REPAIR → REVIEW → ADJUST → REPEAT`.
- Errors are learning data, not only score deductions.
- Standard learning units should normally fit about 15–25 minutes.
- Writing and Speaking follow `practice → feedback → retry`.
- AI acts as a coach, not an examiner. V1 does not require a paid LLM API.
- English is the default interface/content language. Traditional Chinese is optional scaffolding.
- V1 is local-first and does not require an account/backend.

## V1.1 — UX and implementation contract

Primary navigation:

- Today
- Learn
- IELTS
- Improve
- Progress / Me

Today answers one question: **What should I work on today?**

V1.1 recommendation factors:

| Factor | Weight |
|---|---:|
| Weakness | 30% |
| Review due | 20% |
| IELTS target relevance | 15% |
| Skill balance | 15% |
| Difficulty match | 10% |
| Available-time match | 10% |

Recent repetition is a negative signal.

Weekly exposure should avoid completely neglecting Listening, Reading, Writing, or Speaking.

Quick Placement:

- Vocabulary × 6
- Grammar × 6
- Reading × 6
- Listening × 6
- Total = 24

The result should expose section scores, a starting stage/reference level, confidence, recommended difficulty, uneven-profile warning, and Best Next Opportunities.

The learning loop must connect wrong answers to:

`Error Notebook → Review Queue / Repair Lesson → Retry`

## V1.2 — Buildable content contract

The first runnable content package contains five complete lessons:

- `LB01` Practice Is Not the Same as Testing
- `R01` Find the Main Idea Without Translating Everything
- `L01` Listen for Meaning, Not Individual Words
- `W01` Answer the Question Before You Try to Sound Advanced
- `S01` Give More Than a One-Sentence Answer

It also defines:

- 24-question Quick Placement V1
- Prompt Library for Writing Task 1 / Task 2, Speaking, Grammar, Vocabulary, and Error Analysis
- prototype Listening media/transcripts
- developer-ready lesson/question/placement data

Placement overall reference rules:

| Score | Stage | Reference |
|---:|---|---|
| 0–8 | Build | B1+/B2- |
| 9–14 | Develop | B2- |
| 15–19 | Develop | B2 |
| 20–22 | Advance | B2+ |
| 23–24 | Advance | B2+/C1- signal |

A high total must not hide a weak section.

## Current adaptive implementation

The implementation now adds the next V1 learning-loop layer without changing the contracts above.

### Review Queue

Every saved error automatically receives review metadata.

Ratings:

- Again → next review in 1 day
- Hard → approximately 1.5× the previous interval, minimum 2 days
- Good → approximately 2.2×, minimum 3 days
- Easy → approximately 3.2×, minimum 7 days

Review metadata is stored separately under `ielts-adaptive-v1` so the original V1 core state cannot accidentally overwrite it.

### Adaptive Today

When review is due, due review takes priority over new material.

Otherwise core lessons are ranked with the V1.1 factors above plus a recent-repetition penalty. The UI shows the score breakdown so the recommendation is inspectable rather than opaque.

### Repair lessons

The first repair objects are:

- `VG01` Learn Collocations, Not Isolated Words
- `VG02` Articles in Academic Writing
- `VG03` Complex Sentences Without Losing Control

Repair recommendations use saved error tags plus Vocabulary/Grammar placement weakness.

## Content expansion rule

Do not expand to dozens of shallow lessons before the learning loop is stable.

New lessons must have at least:

- ID / title / skill / subskill
- lesson type
- CEFR reference
- IELTS relevance/range where applicable
- difficulty
- estimated time
- learning objective
- practice with answer rationale
- error tags where applicable
- repair/review relationship where applicable

The next content milestone is the first 30-unit curriculum map already defined in V1.1, with quality and interactivity taking priority over raw lesson count.
