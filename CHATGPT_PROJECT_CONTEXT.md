# IELTS English Self-Learning — ChatGPT Project Context

**Purpose:** Durable cross-chat checkpoint. Read this file first in every new ChatGPT window before changing the repository.

**Repository:** `edisontw/ielts-self-learning`  
**Production:** `https://edisontw.github.io/ielts-self-learning/`

## 1. Product purpose — do not drift

Build an IELTS Academic self-learning system for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

Core loop:

`DIAGNOSE → LEARN → PRACTISE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW → ADJUST → REPEAT`

Main product value: **the learner should know the highest-value next action without having to navigate or choose randomly.**

Preserve:

- English development roughly 60%; explicit IELTS preparation up to roughly 40%.
- English-first UI; Traditional Chinese optional scaffolding.
- AI is a coach, not an examiner; no false precise IELTS scores.
- Local-first learner data.
- Wrong answer → explanation → repair/review → retry → later review.
- Reuse an existing teaching owner before creating another Repair lesson.
- No route/Repair from one or two sparse signals.
- Mini Test / Full Mock Test Mode must not become fake single-question Practice Mode retry.
- Preserve the 30-unit core curriculum denominator.

## 2. Current maturity

The site already includes:

- 30-unit core curriculum;
- evidence-driven V/G and Reading/Listening Repair extensions;
- 12 Question Type Labs with Set A / B / C depth;
- 8 Mini Tests (MR01–MR04 / ML01–ML04);
- Full Mock MA01 + independent MA02;
- Academic Writing Task 1 course + 12 reusable prompts;
- W01–W05 Task 2 teaching + V1.10 Task 2 Practice Bank with 10 full-length prompts;
- Speaking Practice Bank: 108 original Part 1–3 prompts/questions;
- V1.11 standardized Speaking Parts 1–3 sampler;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, Review Queue, productive evidence, AI feedback return, backup/import/reset and Diagnostics;
- V1.9 Diagnostic Evidence Center;
- production audio across Placement, Core Listening, Question Type Labs, Mini Tests and MA01;
- MA02 Listening still explicitly uses browser-voice beta because its four production audio slots are empty.

Do **not** add generic lessons, Mini Tests, Full Mocks, Repairs, Task 2 prompts or Speaking questions merely to increase content count.

## 3. V1.8 Learner Journey Optimization — CLOSED

Do not repeat V1.8 work:

- PR #61 result priorities;
- PR #62 return/context continuity;
- PR #63 Today primary action;
- PR #64 productive feedback → retry;
- PR #65 mobile/accessibility QA;
- PR #66 performance baseline;
- PR #67 Adaptive Today lifecycle optimization.

Performance reference after PR #67:

- ~278 ms local startup / ~25 ms representative routes at baseline;
- zero media prefetch before playback;
- Adaptive Today idle polling removed.

Do not continue low-value performance micro-optimization without new evidence.

## 4. V1.9 Better Diagnosis — CLOSED

Read:

- `V1.9-DIAGNOSTIC-AUDIT-01.md`;
- `V1.9-DIAGNOSTIC-SUFFICIENCY-CLOSURE.md`.

Evidence rules:

- Quick Placement required as starting profile;
- Reading: ≥1 distinct timed Mini Test / Full Mock form; ≥2 = broader evidence;
- Listening: ≥1 distinct timed Mini Test / Full Mock form; ≥2 = broader evidence;
- Writing: ≥1 substantial first productive attempt; multiple substantial independent attempts or complete Mock Writing = broader evidence;
- Speaking: ≥1 substantial first productive attempt; multiple distinct substantial prompt/sample blocks = broader evidence;
- Speaking Mock beta completion alone does not count because it stores no transcript/quality evidence.

A new separate four-skill Full Diagnostic test bank is **not justified now**. Reading/Listening already have enough independent timed evidence and diagnosis is progressive across sessions.

## 5. V1.10 Task 2 Practice Bank — CLOSED

Read `V1.10-TASK2-PRACTICE-BANK-01.md`.

Implemented and production-verified:

- 10 original full-length prompts;
- 5 task families × 2;
- 250+ word evidence gate;
- Practice Mode + 40-minute Test Mode;
- existing productive evidence / AI feedback / retry comparison reused;
- core `writingDrafts` / `notes` reused;
- no parallel Task 2 learner-data schema;
- first Task 2 evidence strengthens V1.9 Writing evidence naturally.

Production closure:

- PR #71 main `293e5357cdb080989ab1a2349425f16898360c9c`, Validate #403 PASS, Pages #238 PASS;
- PR #72 main `8b716c99042f6f2383cf3138dbee014b37a5dc2f`, Validate #405 PASS, Pages #239 PASS;
- **V1.10 Production Task 2 — deployed GitHub Pages PASS**.

Do not add more Task 2 prompts without new use/coverage evidence.

## 6. V1.11 Standardized Speaking Sampler — CLOSED

Read:

- `V1.11-SPEAKING-SAMPLER-01.md`;
- `V1.11-SPEAKING-SAMPLER-CLOSURE.md`.

The sampler reuses the existing 12 linked sets / 108-prompt bank. Each sample contains:

- Part 1: 2 linked questions;
- Part 2: 1 linked cue card;
- Part 3: 2 linked discussion questions.

Evidence gate:

- Part 1 combined transcript ≥50 words;
- Part 2 ≥100;
- Part 3 combined ≥100;
- total ≥300.

Data/guardrails:

- responses reuse existing `speakingTranscripts` prompt IDs;
- first/retry reuse `productiveEvidence.speaking`;
- priorities reuse `aiFeedbackReturns.speaking`;
- owner remains `SPB01` with distinct linked-set block IDs;
- no sampler-specific learner-data key;
- transcript-only AI must not judge pronunciation, stress, intonation, pauses, hesitation or actual speech rate;
- no fake precise Speaking band;
- two distinct linked-set first samples naturally produce V1.9 `Broader evidence`.

Production closure:

- PR #74 learner-facing sampler: full PR regression PASS;
- PR #75 merged main `a6cfdfaa44ad7ca46a58c2e8a6c69f843058cdaa`;
- Pages #242 build/deploy/report PASS;
- Validate #411 PASS;
- **V1.11 Production Speaking sampler — deployed GitHub Pages PASS**;
- existing V1.7, V1.9 and V1.10 deployed gates remain PASS.

Do not add more Speaking questions merely to increase quantity.

## 7. Current next milestone — MA02 Production Listening Audio

This is now the clearest remaining quality gap.

Current audited state:

- `mock-test-audio-upgrade-v1.js` maps MA01 to four production MP3 files;
- the MA02 production array is currently four empty strings;
- MA02 player copy explicitly says `Browser voice beta` and production MP3 is pending;
- `media/audio/mock-tests/` currently contains only four MA01 production files;
- MA02 already has finalized independent Listening scripts/40 questions, so no content rewrite is needed.

### NEXT UNFINISHED MILESTONE

> **Prepare and produce four MA02 Listening production recordings, then wire, validate and deploy them while retaining labelled browser voice strictly as fallback.**

Recommended order:

1. Audit MA02 Part 1–4 scripts for speaker/turn structure and answer-dependent corrections/distractors.
2. Create a canonical production plan with exact file names, voice direction, pace/duration targets, pause rules and content QA checks.
3. Generate/receive four MP3 recordings externally using the locked scripts.
4. Normalize/QA audio and record provenance, duration, file size and checksums in the audio manifest.
5. Wire the four paths into `MOCK_AUDIO.MA02`.
6. Update copy from browser-voice beta to production-first/fallback wording.
7. Add static/audio-manifest/browser regression and deployed checksum/playback gate.
8. Do not consume the one-play attempt if production fails before fallback can start.

This is a **media-quality upgrade**, not a new diagnostic/content expansion.

## 8. Guardrails

Do not:

- resume closed V1.6 semantic mining;
- create MA03, MR05 or ML05 without new evidence;
- expand Core 30 merely to increase content count;
- manufacture RR/LR/VG Repairs from sparse signals;
- output one fake overall IELTS band from mixed evidence;
- auto-score Writing/Speaking as official IELTS bands;
- replace productive revision with model-answer consumption;
- add more Task 2 or Speaking prompts merely to increase count;
- rewrite MA02 questions/scripts merely because audio production is beginning;
- add copyrighted commercial IELTS audio.

## 9. Working method

- Inspect current main/open PRs/Actions before each batch.
- Read latest closure/checkpoint docs; do not redo closed work.
- Prefer the smallest safe learner-flow change.
- Preserve storage schemas unless migration is justified and tested.
- Add real-browser regression coverage for learner-facing changes.
- Validate production-sensitive media against deployed GitHub Pages.
- Record audio provenance/checksums/status in `media/audio/manifest-v1.json`.
- Update this file after meaningful merged milestones.

## 10. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.11-SPEAKING-SAMPLER-CLOSURE.md` and `media/audio/README.md`.
3. Inspect current GitHub main/open PRs/Actions.
4. Do not restart V1.6, V1.8, V1.9, Task 2 breadth or Speaking sampler work.
5. Continue **MA02 production Listening audio** unless a newer checkpoint supersedes it.
6. Read `mock-test-data-v2.js` and `mock-test-audio-upgrade-v1.js` before preparing production files.
7. Preserve MA02 scripts/questions and one-play Test Mode semantics.

## 11. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → implemented/closed version docs → this checkpoint → current GitHub runtime/tests`
