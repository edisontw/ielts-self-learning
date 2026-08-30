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
- W01–W05 Task 2 teaching, including one full W05 Opinion Essay workspace;
- Speaking Practice Bank: 108 original Part 1–3 prompts/questions;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, Review Queue, productive evidence, AI feedback return, backup/import/reset and Diagnostics;
- V1.9 Diagnostic Evidence Center;
- production audio across earlier Listening surfaces; MA02 Listening remains an explicit browser-voice production gate until separately upgraded.

Do **not** add generic lessons, Mini Tests, Full Mocks or Repairs merely to increase content count.

## 3. V1.8 learner-journey optimization — CLOSED

Do not repeat V1.8 work:

- PR #61 Test/Mock result priorities;
- PR #62 return/context continuity;
- PR #63 Today primary action;
- PR #64 productive feedback → retry closure;
- PR #65 mobile/accessibility QA;
- PR #66 performance baseline;
- PR #67 Adaptive Today lifecycle optimization.

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

Production closure:

- main `83292950f4393b3003594179d85cb14c5c8f0694`;
- Validate #397 PASS;
- Pages #235 PASS;
- general deployed E2E PASS;
- local/static V1.9 diagnostic gates PASS.

Evidence rules:

- Quick Placement required as the starting profile;
- Reading: ≥1 distinct timed Mini Test / Full Mock form; ≥2 = broader evidence;
- Listening: ≥1 distinct timed Mini Test / Full Mock form; ≥2 = broader evidence;
- Writing: ≥1 `first` productive attempt with 150+ words; multiple substantial first attempts or complete Mock Writing (Task 1 150+ + Task 2 250+) = broader evidence;
- Speaking: ≥1 `first` productive attempt with 60+ transcript words; multiple distinct substantial prompt samples = broader evidence;
- Speaking Mock beta completion alone does not count because it stores no transcript/quality evidence.

### Deployed V1.9 diagnostic gate — PR #69

Production closure:

- main `a400f3b26d258b188c7e1f81c17f6e7f4bf82ff1`;
- Validate #399 PASS;
- existing deployed E2E PASS;
- **V1.9 Production Diagnostic — deployed GitHub Pages PASS**;
- Pages #236 build / deploy / report PASS.

The production gate verifies the full progression, including the Writing 149/180-word and Speaking 59/70-word thresholds, 4/4 return to Today, and broader-evidence upgrades.

### V1.9 sufficiency decision

A separate new four-skill Full Diagnostic test bank is **not justified now**.

- Reading already has MR01–MR04 + MA01/MA02 timed evidence.
- Listening already has ML01–ML04 + MA01/MA02 timed evidence.
- Do not create MR05/ML05 or new R/L forms merely for diagnosis.
- The site now implements diagnosis progressively across sessions rather than forcing one long exam.

## 5. Current phase — V1.10 Targeted Content Expansion

### NEXT UNFINISHED MILESTONE

> **Task 2 Practice Bank — broaden full-length transfer practice without adding new core lessons.**

Current Writing reality:

- W01–W05 already teach Task 2 skills;
- W01 has an 80–120 word mini task;
- W05 already has one full 250–380 word Opinion Essay workspace;
- Task 1 has much broader reusable practice depth with 12 prompts.

Therefore the gap is **Task 2 full-length prompt breadth**, not missing Task 2 instruction.

Recommended V1.10 Batch 1:

- 5 Task 2 families × 2 original full-length prompts = 10 prompts:
  1. Opinion / agree-disagree;
  2. Discussion + own opinion;
  3. Advantages / disadvantages or outweigh;
  4. Problems / solutions;
  5. Two-part / direct questions.
- Reuse the existing productive loop:
  `Understand → Plan → Write → Self-check → AI feedback → Revise → Retry evidence`.
- Do not create ten new lessons or alter the Core 30 denominator.
- Make first attempts feed existing productive evidence and naturally strengthen Diagnostic Center Writing evidence.

### Speaking after Task 2

Speaking already has enough prompt quantity. A standardized Parts 1–3 diagnostic sampler may improve comparability later, but should reuse the existing 108-prompt bank rather than adding more questions.

### Separate quality upgrade

MA02 production audio remains worthwhile but is a media-quality gate, not a diagnostic-content requirement.

## 6. Guardrails

Do not:

- resume closed V1.6 semantic mining;
- create MA03, MR05 or ML05 without new evidence;
- expand Core 30 merely to increase content count;
- manufacture new RR/LR/VG Repairs from sparse signals;
- output one fake overall IELTS band from mixed evidence;
- auto-score Writing/Speaking as official IELTS bands;
- replace productive revision with model-answer consumption;
- create duplicate Task 2 teaching when W01–W05 already own the instruction.

## 7. Working method

- Inspect current main/open PRs/Actions before each batch.
- Read latest closure/checkpoint docs; do not redo closed work.
- Prefer the smallest safe learner-flow change.
- Preserve storage schemas unless migration is justified and tested.
- Add real-browser regression coverage for learner-facing changes.
- Validate production-sensitive changes against deployed GitHub Pages.
- Update this file after meaningful merged milestones.

## 8. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.9-DIAGNOSTIC-SUFFICIENCY-CLOSURE.md`.
3. Inspect current GitHub main/open PRs/Actions.
4. Do not restart V1.6, V1.8 or V1.9 diagnosis work.
5. Continue **V1.10 Task 2 Practice Bank** unless a newer checkpoint supersedes it.
6. Preserve W01–W05 teaching ownership and the existing productive retry workflow.

## 9. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → implemented/closed version docs → this checkpoint → current GitHub runtime/tests`
