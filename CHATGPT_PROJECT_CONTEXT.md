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
- W01–W05 Task 2 teaching plus V1.10 Task 2 Practice Bank with 10 full-length prompts;
- Speaking Practice Bank: 108 original Part 1–3 prompts/questions;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, Review Queue, productive evidence, AI feedback return, backup/import/reset and Diagnostics;
- V1.9 Diagnostic Evidence Center;
- production audio across earlier Listening surfaces; MA02 Listening remains an explicit browser-voice production gate until separately upgraded.

Do **not** add generic lessons, Mini Tests, Full Mocks or Repairs merely to increase content count.

## 3. V1.8 learner-journey optimization — CLOSED

Do not repeat V1.8 work: PR #61 result priorities, #62 return/context, #63 Today primary action, #64 productive feedback→retry, #65 mobile/a11y, #66 performance baseline, #67 Adaptive Today lifecycle.

Performance reference after PR #67:

- main `203cda832d18a0387ecc84e027c346ed8cd3c23a`;
- Validate #395 PASS; Pages #234 PASS; deployed E2E PASS;
- ~278 ms local startup / ~25 ms representative routes at baseline;
- zero media prefetch before playback;
- 20 MutationObservers / 4 setInterval calls after removing Adaptive Today idle polling.

Do not continue low-value performance micro-optimization without new evidence.

## 4. V1.9 Better Diagnosis — CLOSED

Read:

- `V1.9-DIAGNOSTIC-AUDIT-01.md`;
- `V1.9-DIAGNOSTIC-SUFFICIENCY-CLOSURE.md`.

### Diagnostic Evidence Center — PR #68

- main `83292950f4393b3003594179d85cb14c5c8f0694`;
- Validate #397 PASS; Pages #235 PASS; deployed general E2E PASS.

Evidence rules:

- Quick Placement required as starting profile;
- Reading: ≥1 distinct timed Mini Test / Full Mock form; ≥2 = broader evidence;
- Listening: ≥1 distinct timed Mini Test / Full Mock form; ≥2 = broader evidence;
- Writing: ≥1 `first` productive attempt with 150+ words; multiple substantial first attempts or complete Mock Writing = broader evidence;
- Speaking: ≥1 `first` productive attempt with 60+ transcript words; multiple distinct substantial prompt samples = broader evidence;
- Speaking Mock beta completion alone does not count because it stores no transcript/quality evidence.

### Deployed V1.9 gate — PR #69

- main `a400f3b26d258b188c7e1f81c17f6e7f4bf82ff1`;
- Validate #399 PASS;
- V1.9 Production Diagnostic — deployed GitHub Pages PASS;
- Pages #236 PASS.

### Sufficiency decision — PR #70

A separate new four-skill Full Diagnostic test bank is **not justified now**.

- Reading already has MR01–MR04 + MA01/MA02 timed evidence.
- Listening already has ML01–ML04 + MA01/MA02 timed evidence.
- Do not create MR05/ML05 or new R/L forms merely for diagnosis.
- Diagnosis is progressive across sessions rather than one forced long exam.

## 5. V1.10 Targeted Content Expansion — Task 2 Batch 01 CLOSED

Read `V1.10-TASK2-PRACTICE-BANK-01.md`.

### Task 2 Practice Bank — PR #71

Implemented:

- 10 original full-length Task 2 prompts;
- 5 task families × 2 prompts: Opinion, Discussion + opinion, Advantages/Disadvantages, Problems/Solutions, Two-part;
- 250+ word evidence gate;
- Practice Mode + 40-minute Test Mode;
- existing productive evidence / AI feedback-return / retry comparison reused;
- drafts reuse core `writingDrafts`; plans reuse core `notes`;
- no parallel Task 2 learner-data storage schema;
- first Task 2 evidence naturally strengthens V1.9 Diagnostic Center Writing coverage;
- shared render lifecycle; no new idle observer/polling.

Production closure:

- PR #71 merged main `293e5357cdb080989ab1a2349425f16898360c9c`;
- Validate #403 PASS including V1.10 static/browser gates and existing deployed gates;
- Pages #238 build/deploy/report PASS.

### V1.10 deployed Task 2 gate — PR #72

Production closure:

- main `8b716c99042f6f2383cf3138dbee014b37a5dc2f`;
- Pages #239 build/deploy/report PASS;
- Validate #405 PASS;
- **V1.10 Production Task 2 — deployed GitHub Pages PASS**;
- deployed test verifies 5 families × 2, 249/260-word threshold, first evidence, AI priorities, 275-word retry linkage/comparison, Test Mode guardrails and V1.9 Diagnostic integration.

Do not add more Task 2 prompts merely to increase quantity. Reassess only after use/coverage evidence.

## 6. Current next milestone — standardized Speaking Parts 1–3 sampler

Speaking already has **108 original Part 1–3 prompts/questions**. The next gap is not question quantity; it is a comparable, repeatable evidence collection flow.

Next implementation should first audit and then, if supported, create a **standardized Speaking sampler** that reuses the existing bank:

- one linked Part 1 topic;
- one Part 2 cue card with normal preparation/speaking timing;
- one linked Part 3 discussion set;
- transcript/notes saved as productive evidence;
- no pronunciation claim from transcript-only evidence;
- no automatic/fake Speaking band;
- first/retry evidence and AI feedback return should reuse existing schemas;
- do not duplicate the 108 prompts or create another speaking question bank.

This is the highest-value learning-system gap after Task 2 closure.

### Separate media-quality upgrade

MA02 production audio remains worthwhile, but it is a separate media-quality gate rather than a diagnostic-content requirement.

## 7. Guardrails

Do not:

- resume closed V1.6 semantic mining;
- create MA03, MR05 or ML05 without new evidence;
- expand Core 30 merely to increase content count;
- manufacture RR/LR/VG Repairs from sparse signals;
- output one fake overall IELTS band from mixed evidence;
- auto-score Writing/Speaking as official IELTS bands;
- replace productive revision with model-answer consumption;
- add more Task 2 or Speaking prompts merely to increase count.

## 8. Working method

- Inspect current main/open PRs/Actions before each batch.
- Read latest closure/checkpoint docs; do not redo closed work.
- Prefer the smallest safe learner-flow change.
- Preserve storage schemas unless migration is justified and tested.
- Add real-browser regression coverage for learner-facing changes.
- Validate production-sensitive changes against deployed GitHub Pages.
- Update this file after meaningful merged milestones.

## 9. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.9-DIAGNOSTIC-SUFFICIENCY-CLOSURE.md` and `V1.10-TASK2-PRACTICE-BANK-01.md`.
3. Inspect current GitHub main/open PRs/Actions.
4. Do not restart V1.6, V1.8, V1.9 or Task 2 breadth work.
5. Continue the **standardized Speaking Parts 1–3 sampler audit/implementation** unless a newer checkpoint supersedes it.
6. Reuse the existing 108-prompt bank and productive feedback/retry schemas.

## 10. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → implemented/closed version docs → this checkpoint → current GitHub runtime/tests`
