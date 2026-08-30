# IELTS English Self-Learning — ChatGPT Project Context

**Purpose:** Durable cross-chat checkpoint. Read this first in every new ChatGPT window before changing the repository.

**Repository:** `edisontw/ielts-self-learning`  
**Production:** `https://edisontw.github.io/ielts-self-learning/`

## 1. Product purpose — do not drift

Build an IELTS Academic self-learning system for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

Core loop:

`DIAGNOSE → LEARN → PRACTISE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW → ADJUST → REPEAT`

Primary value: **the learner should know the highest-value next action without random navigation.**

Preserve:

- English development roughly 60%; explicit IELTS preparation up to roughly 40%;
- English-first UI with optional Traditional Chinese scaffolding;
- AI as coach, not examiner; no fake precise IELTS score;
- local-first learner data;
- wrong answer → explanation → repair/review → retry → later review;
- reuse existing teaching owners before adding Repairs;
- no route/Repair from one or two sparse signals;
- Test Mode does not become single-question Practice Mode retry;
- Core curriculum denominator remains 30.

## 2. Current maturity

The product now includes enough learning/test content to focus on quality rather than quantity:

- 30-unit core curriculum;
- V/G and Reading/Listening Repair extensions;
- 12 Question Type Labs with A/B/C depth;
- 8 Mini Tests: MR01–MR04 / ML01–ML04;
- Full Mock MA01 + independent MA02;
- Task 1 course + 12 reusable prompts;
- W01–W05 Task 2 teaching + V1.10 full-length Task 2 Practice Bank (10 prompts / 5 families);
- Speaking Practice Bank with 108 prompts/questions + V1.11 standardized Parts 1–3 sampler;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, reviews, productive evidence, AI feedback return, backup/import/reset, Diagnostics;
- V1.9 Diagnostic Evidence Center;
- production Listening audio across Placement, Core Listening, Question Type Labs, Mini Tests and MA01.

Do not add generic lessons, new Mini Tests/Full Mocks, Task 2 prompts, Speaking questions or Repairs merely to increase count.

## 3. Closed product/UX milestones — do not repeat

### V1.8 Learner Journey Optimization — CLOSED

PR #61 result priorities; #62 return/context continuity; #63 Today primary action; #64 productive feedback→retry; #65 mobile/a11y; #66 performance baseline; #67 Adaptive Today lifecycle optimization.

### V1.9 Better Diagnosis — CLOSED

Read:

- `V1.9-DIAGNOSTIC-AUDIT-01.md`
- `V1.9-DIAGNOSTIC-SUFFICIENCY-CLOSURE.md`

Decision: no separate giant four-skill Full Diagnostic is justified. Reading/Listening already have independent timed evidence; Writing/Speaking accumulate substantial productive evidence across sessions.

### V1.10 Task 2 Practice Bank — CLOSED

Read `V1.10-TASK2-PRACTICE-BANK-01.md`.

Production closure: PR #71/#72, V1.10 deployed Task 2 E2E PASS. Do not expand Task 2 quantity without new evidence.

### V1.11 Standardized Speaking Sampler — CLOSED

Read:

- `V1.11-SPEAKING-SAMPLER-01.md`
- `V1.11-SPEAKING-SAMPLER-CLOSURE.md`

The sampler reuses existing linked sets: Part 1 ×2 questions + Part 2 ×1 cue card + Part 3 ×2 questions. Evidence gate is Part1 ≥50, Part2 ≥100, Part3 ≥100, total ≥300 transcript words. It reuses existing `speakingTranscripts`, `productiveEvidence.speaking` and `aiFeedbackReturns.speaking`. Transcript-only AI cannot judge pronunciation/stress/intonation/pauses/hesitation/actual speech rate.

Production closure: PR #75 main `a6cfdfaa44ad7ca46a58c2e8a6c69f843058cdaa`; Pages #242 PASS; Validate #411 PASS; deployed Speaking sampler E2E PASS.

## 4. V1.12 MA02 Production Listening Audio — PREPARATION CLOSED / ASSETS PENDING

Read:

- `V1.12-MA02-AUDIO-PREP-CHECKPOINT.md`
- `media/audio/mock-tests/MA02-PRODUCTION-AUDIO-PLAN.md`
- `media/audio/mock-tests/ma02-production-audio-spec-v1.json`

PR #77 production-prep closure:

- merged main: `8a52fddebcffbebe16eed4dfe89172ada75cabfe`;
- PR Validate #414: PASS;
- main Validate #415: PASS;
- Pages #244: PASS;
- V1.12 exact-script production-prep guard: PASS;
- MA02 browser interaction: PASS;
- existing deployed V1.7 / V1.9 / V1.10 / V1.11 E2E gates: PASS.

### What is already locked

Do **not** redo script/voice/QA planning.

The machine-readable production spec reconstructs all four MA02 scripts exactly from the source and CI enforces equality with `mock-test-data-v2.js`.

Canonical required files:

1. `media/audio/mock-tests/ma02-listening-part1-printmaking-workshop-booking.mp3`
2. `media/audio/mock-tests/ma02-listening-part2-observatory-visitor-orientation.mp3`
3. `media/audio/mock-tests/ma02-listening-part3-local-history-digitisation-project.mp3`
4. `media/audio/mock-tests/ma02-listening-part4-seed-banks-seed-storage.mp3`

Locked production targets:

- Part 1: Receptionist + Caller, 204 words, ~90–105 s;
- Part 2: Guide monologue, 257 words, ~110–125 s;
- Part 3: Tutor + Nina + Omar, 256 words, ~110–125 s;
- Part 4: Lecturer monologue, 307 words, ~128–145 s.

Exact speaker direction, pace ranges, pause rules, generation prompts and answer-bearing QA are already in the production plan/spec.

### CURRENT LIVE STATE — intentionally not production

Until all four approved MP3s exist:

- `MA02.audioStatus` remains `browser-voice-gate`;
- `MOCK_AUDIO.MA02` remains four empty source strings;
- UI remains labelled `Browser voice beta`;
- browser speech is the active MA02 Listening source;
- one-play Test Mode semantics remain unchanged.

Do not wire nonexistent/unapproved audio paths.

## 5. NEXT UNFINISHED MILESTONE

> **Obtain the four locked MA02 production MP3 files, then perform audio QA → manifest/provenance → runtime integration → deployed production verification.**

After the four audio files arrive:

1. compare spoken content with exact locked scripts / `criticalQa`;
2. inspect duration, channels, sample rate, bitrate/loudness and clipping;
3. normalize only if needed without changing wording/timing meaning;
4. compute SHA-256 and exact file size;
5. update `media/audio/manifest-v1.json` with provenance/status;
6. wire all four paths into `MOCK_AUDIO.MA02`;
7. change MA02 copy/status to production-first + labelled browser fallback;
8. extend audio-manifest/mock-audio regression coverage;
9. add a deployed exact-file/checksum/playback production gate;
10. retain browser speech synthesis strictly as fallback.

This is a media-quality upgrade, not a content rewrite.

## 6. Guardrails

Do not:

- resume closed V1.6 semantic mining;
- restart V1.8/V1.9/V1.10/V1.11 work;
- create MA03, MR05 or ML05 without new evidence;
- expand Core 30 merely to increase content count;
- manufacture Repairs from sparse evidence;
- auto-score Writing/Speaking as official IELTS bands;
- add more Task 2/Speaking questions merely for volume;
- rewrite MA02 scripts/questions during audio production;
- mark MA02 production-live before all four files pass QA;
- use copyrighted commercial IELTS recordings.

## 7. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.12-MA02-AUDIO-PREP-CHECKPOINT.md` and `media/audio/mock-tests/MA02-PRODUCTION-AUDIO-PLAN.md`.
3. Inspect current GitHub main/open PRs/Actions.
4. Do not redo prior closed UX/diagnostic/content work or MA02 audio planning.
5. Continue from the **four MA02 MP3 asset handoff**.
6. If files are available, immediately QA/integrate them using the locked spec.
7. If files are not yet available, use the locked production plan to generate/obtain them; do not change runtime status meanwhile.

## 8. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → closed implementation docs → this checkpoint → current GitHub runtime/tests`
