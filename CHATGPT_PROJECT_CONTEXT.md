# IELTS English Self-Learning — ChatGPT Project Context

**Purpose:** Durable cross-chat checkpoint. Read this file first in every new ChatGPT window before changing the repository.

**Repository:** `edisontw/ielts-self-learning`  
**Production:** `https://edisontw.github.io/ielts-self-learning/`

## 1. Product purpose — do not drift

Build an IELTS Academic self-learning system for learners around IELTS 5.5–6.5 aiming toward 6.5–7.5.

The product is not primarily a question bank. Its core learner loop is:

`DIAGNOSE → LEARN → PRACTISE → FEEDBACK → ERROR → REPAIR → RETRY → REVIEW → ADJUST → REPEAT`

The main product value is: **the learner should know the highest-value next action without having to navigate or choose randomly.**

Preserve these product rules:

- English development remains roughly 60%; explicit IELTS preparation up to roughly 40%.
- English-first UI; Traditional Chinese is optional scaffolding.
- AI is a coach, not an examiner; do not import or manufacture false precise IELTS scores.
- Learner data remains local-first unless a later version explicitly changes the architecture.
- A wrong answer should lead to explanation, appropriate repair/review, retry, and later review.
- Reuse an existing teaching owner before creating another Repair lesson.
- Do not add a route/Repair because of one or two sparse signals.
- Mini Test / Full Mock Test Mode must not become fake single-question Practice Mode retry.
- Preserve the 30-unit core curriculum denominator.

## 2. Current maturity

The site already has enough content to validate the learning system. It is no longer in a content-scarcity phase.

Current major learning assets include:

- 30-unit core curriculum;
- evidence-driven V/G and Reading/Listening Repair extensions;
- 12 Question Type Labs with Set A / Set B / Set C depth;
- 8 Mini Tests (MR01–MR04 / ML01–ML04);
- Full Mock MA01 + independent MA02;
- Academic Writing Task 1 course + practice prompts;
- Speaking Practice Bank;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, Review Queue, productive evidence, AI feedback return, backup/import/reset and Diagnostics;
- production audio across the earlier Listening learning/test surfaces; MA02 Listening may still be on its explicit browser-voice production gate until separately upgraded.

Therefore **do not start the next phase by adding more generic lessons, Mini Tests, Full Mocks or Repairs.**

## 3. Current V1.8 checkpoint — 2026-08-30

Always inspect the current GitHub `main`, open PRs and Actions before starting a new batch; do not assume the SHA below is still current.

### V1.7 production gate — CLOSED

- PR #60 merged.
- V1.7 local MA02 browser interaction and deployed GitHub Pages E2E passed.
- Closure is recorded in `V1.7-PRODUCTION-E2E-CLOSURE.md`.
- Do not reopen V1.7 unless a new production regression is observed.

### V1.8 Milestone 1 journey audit — COMPLETE

Baseline findings are in `V1.8-JOURNEY-AUDIT-01.md`.

Highest-value friction identified:

1. Test/Mock results needed a small number of evidence-backed priorities before the full item list.
2. Repair/review navigation still needs explicit **Return / Continue to original context** continuity.
3. Today consolidation and productive-skill retry CTA remain later V1.8 work.

### V1.8 result prioritization — PRODUCTION-CLOSED

PR #61 `V1.8: prioritize next actions on Test and Mock results` merged to main:

- merge main at closure: `eac7019d280b8eeeb2ae597ab89d5243feb5dbb0`;
- PR validation PASS;
- Pages #222 PASS;
- final-main Validate #376 PASS;
- final-main browser smoke PASS;
- MA02 browser interaction PASS;
- deployed GitHub Pages production E2E PASS.

Learner-facing result behavior now:

`attempt summary → up to 3 authorized priorities → one recommended next step → full item review`

The summarizer only reuses already-authorized V1.6/V1.7 existing-practice routes, audited RR/LR Skill Repair, or existing V/G Repair. It does not manufacture a new route from a test result or sparse evidence.

### NEXT UNFINISHED MILESTONE

> **Navigation / context continuity:** preserve where the learner came from when a Test/Mock/Error Notebook result sends them to targeted practice or Repair, then provide an explicit `Return to ...` / `Continue ... review` action after the targeted work.

Start by auditing the smallest safe origin-context model. Do not use brittle browser-history assumptions and do not reopen a submitted Test Mode attempt as editable.

## 4. V1.8 mission — learner-journey-first optimization

V1.8 is **not** a content-expansion release.

Primary goal:

> Reduce cognitive/navigation friction so each meaningful action leads clearly to the next highest-value action.

Priority journeys:

1. **New learner:** Landing/Today → goal → Quick Placement → optional Study Plan → first recommended lesson.
2. **Returning learner:** open site → one obvious primary Today action, with due review taking priority when appropriate.
3. **Objective error loop:** wrong → explanation/save → Retry or existing owner/Repair → mastery → return to original context → next action.
4. **Mini Test / Full Mock review:** submit → summarize recurring error families/priorities → targeted next practice → return to test review/plan.
5. **Writing / Speaking:** attempt → self-check → external AI coaching priorities → return → rewrite/retry → compare improvement.

The desired end-state is:

`TODAY → PRACTICE → ERROR → REPAIR/REVIEW → RETRY → RETURN → NEXT BEST ACTION`

The learner should not have to remember where to go next.

## 5. Remaining V1.8 optimization order

1. **Navigation/context continuity — NEXT**: preserve origin and provide clear Return/Continue actions across result-priority routes, Error Notebook, Repair, Labs, Mini Tests and Full Mocks.
2. **Today simplification**: one ranked primary next action; secondary choices remain visually subordinate.
3. **Productive-skill loop clarity**: make revision/retry the visible next step after AI feedback, not the endpoint.
4. **Mobile/accessibility/performance QA**: 360/390/430/768 widths, keyboard/focus/modal/audio/editor/recorder behavior, zoom/overflow/tap targets and route responsiveness.
5. **Only after the UX loop is stable**: consider Full Diagnostic and targeted content gaps such as MA02 production audio or a Task 2 practice bank.

Completed and not to repeat:

- V1.7 production gate closure;
- V1.8 baseline journey audit;
- V1.8 Test/Mock result prioritization.

## 6. Explicit non-goals for V1.8

Do not use V1.8 to:

- create MA03;
- create MR05/ML05;
- expand Core 30 to 40/50 lessons;
- resume closed V1.6 high-/low-frequency semantic mining;
- manufacture routes from sparse signals;
- add new RR/LR/VG Repair without new independent evidence plus a demonstrated instructional gap;
- add accounts/backend, paid LLM API, automatic IELTS scoring, leaderboard or complex gamification.

## 7. Working method / guardrails

- Check current `main`, open PRs and latest Actions before every new work batch.
- Read the latest relevant closure/checkpoint docs; do not redo closed audits.
- Prefer the smallest safe change that improves an observed learner journey.
- Preserve existing storage schemas and learner data unless a migration is explicitly justified and tested.
- Add automated regression coverage for each important learner-facing flow change.
- For production-sensitive changes, validate locally and against deployed GitHub Pages.
- Update this file when the project mission, major version direction, or blocking gate changes.
- Keep detailed V1.8 implementation findings in `V1.8-LEARNER-JOURNEY-OPTIMIZATION.md` and focused closure/checkpoint notes so this context file stays compact.

## 8. New-window startup instruction

When continuing this project in a new ChatGPT window:

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.8-LEARNER-JOURNEY-OPTIMIZATION.md`.
3. Read `V1.8-JOURNEY-AUDIT-01.md` if the task concerns learner-flow priorities.
4. Inspect the latest GitHub `main`, open PRs and Actions.
5. Do **not** restart V1.6 semantic audits, V1.7 production closure, or V1.8 result prioritization.
6. Continue the first unfinished milestone: **navigation/context continuity**, unless a newer checkpoint supersedes it.
7. After a meaningful merged milestone, update this file so the following window starts from the new boundary.

## 9. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → implemented/closed version docs → this current project checkpoint → current GitHub runtime/tests`

When older plans conflict with a later explicitly closed implementation decision, preserve the later closed decision unless the new work intentionally revises it with evidence and tests.
