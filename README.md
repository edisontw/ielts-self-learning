# IELTS Self-Learning

A local-first IELTS Academic self-learning prototype for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

Core loop:

`DIAGNOSE → LEARN → PRACTICE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW`

## Current prototype

Implemented in the first build:

- responsive Today / Learn / IELTS / Improve / Progress shell
- Quick Placement V1: 24 questions across Vocabulary, Grammar, Reading and Listening
- placement scoring, confidence, uneven-profile guardrail and recommended difficulty
- five V1.2 lessons: LB01, R01, L01, W01, S01
- interactive checks with answer explanations
- Error Notebook stored in `localStorage`
- lesson completion, notes and study history
- Writing workspace with word count and portable AI prompt builder
- Speaking recorder where `MediaRecorder` is available, with transcript fallback
- Prompt Library preview/copy flow
- light/dark theme
- English-first interface with optional Traditional Chinese support notes
- runtime synthetic browser voice fallback for prototype Listening audio

## Run locally

This build is intentionally dependency-free. Serve the repository with any static server, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Do not rely on `file://` if you want JSON loading, microphone access and browser storage behavior to work consistently.

## Source-of-truth hierarchy

The implementation follows:

1. V1.0 — product principles
2. V1.1 — UX / architecture / curriculum specification
3. V1.2 — prototype content pack
4. implementation

Key constraints preserved in the current build:

- English proficiency 60% / IELTS preparation 40%
- English-first, Traditional Chinese only as optional scaffolding
- ability and skill-specific profile before fixed labels
- Quick Placement recommends a starting point; it does not claim an exact IELTS band
- AI is a coach, not an examiner
- no paid LLM API is required
- error → explanation → repair → retry is part of the learning loop
- user data is local-first in V1

## Prototype content

### Five complete lessons

- `LB01` Practice Is Not the Same as Testing
- `R01` Find the Main Idea Without Translating Everything
- `L01` Listen for Meaning, Not Individual Words
- `W01` Answer the Question Before You Try to Sound Advanced
- `S01` Give More Than a One-Sentence Answer

### Quick Placement

`content/placement/quick-placement-v1.json`

Structure:

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

## Data policy

V1 stores profile, placement result, progress, errors, notes, writing drafts, Speaking transcripts and study history in the browser only. There is no account or backend in this prototype.

## AI workflow

The website does not call a paid LLM API.

`MY ANSWER → BUILD PROMPT → COPY → EXTERNAL LLM → FEEDBACK → RETURN → REWRITE / RETRY`

Prompt templates cover Writing Task 1, Writing Task 2, Speaking transcript feedback, Grammar, Vocabulary and Error Analysis.

## Listening prototype note

The V1.2 content pack defines prototype synthetic audio. The current repository uses a browser `speechSynthesis` fallback so the first implementation remains fully static and has no binary-audio deployment dependency. Before public production release, replace this with higher-quality recorded or licensed English speech while preserving transcripts, question timing, answer logic and accessibility text.

## Next implementation priorities

1. improve Placement Reading/Listening section UX
2. mirror V1.0–V1.2 authoring/specification files into the repository
3. add Review Queue and due-date scheduling
4. add vocabulary review objects and repair lessons
5. make Today recommendation scoring fully follow the V1.1 weighted rules
6. QA desktop/mobile accessibility and persistence
7. only then expand from 5 complete lessons toward the first 30-unit curriculum map
