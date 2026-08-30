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

The site is no longer content-scarce. It already includes:

- 30-unit core curriculum;
- evidence-driven V/G and Reading/Listening Repair extensions;
- 12 Question Type Labs with Set A / B / C depth;
- 8 Mini Tests (MR01–MR04 / ML01–ML04);
- Full Mock MA01 + independent MA02;
- Academic Writing Task 1 course + practice prompts;
- Speaking Practice Bank;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, Review Queue, productive evidence, AI feedback return, backup/import/reset and Diagnostics;
- production audio across earlier Listening surfaces; MA02 Listening may remain on its explicit browser-voice production gate until separately upgraded.

Do **not** start the next phase by adding generic lessons, Mini Tests, Full Mocks or Repairs.

## 3. Current V1.8 checkpoint — 2026-08-30

Always inspect current GitHub `main`, open PRs and Actions before starting a new batch.

### Closed milestones — do not repeat

1. **V1.7 production gate** — PR #60; see `V1.7-PRODUCTION-E2E-CLOSURE.md`.
2. **V1.8 learner-journey baseline audit** — see `V1.8-JOURNEY-AUDIT-01.md`.
3. **V1.8 Test/Mock result prioritization** — PR #61 production-closed.
   - Result flow: `attempt summary → up to 3 authorized priorities → one recommended next step → full item review`.
4. **V1.8 navigation/context continuity** — PR #62 production-closed; see `V1.8-CONTEXT-CONTINUITY-CLOSURE.md`.
   - Supports `submitted review → targeted practice → named Return → read-only exact review snapshot`.
   - Supports `Error Notebook → targeted practice → Return to Error Notebook`.
5. **V1.8 Today primary-action consolidation** — PR #63 production-closed; see `V1.8-TODAY-PRIMARY-ACTION-CLOSURE.md`.
   - merge main at closure: `ec0f814eb077242e78a3399bec8ff0c1749a7188`;
   - PR Validate #383 PASS;
   - Pages #227 PASS;
   - final-main Validate #384 PASS;
   - Today browser matrix PASS;
   - MA02 browser interaction PASS;
   - deployed GitHub Pages E2E PASS.

Today now ranks existing actions:

`due review > current Study Plan session > pending AI feedback retry > productive retry signal > adaptive new material`

Only one candidate stays full-size and is labelled `Do this now`; at most two distinct alternatives remain compact. Fresh pre-Placement onboarding is unchanged.

### NEXT UNFINISHED MILESTONE

> **Productive-skill loop clarity:** after external AI feedback priorities are saved, make the lesson itself show one dominant `Revise / Retry now` action and make it clear that the next saved productive retry closes the feedback cycle.

Primary acceptance target:

`attempt → external feedback → save 2–3 priorities → Revise/Retry now → save retry evidence → feedback cycle recorded`

Preserve the existing rule that AI feedback contributes coaching priorities only—not an AI band or examiner score.

## 4. V1.8 mission

V1.8 is **not** a content-expansion release. Reduce cognitive/navigation friction so each meaningful action leads clearly to the next highest-value action.

Desired end-state:

`TODAY → PRACTICE → ERROR → REPAIR/REVIEW → RETRY → RETURN → NEXT BEST ACTION`

## 5. Remaining V1.8 order

1. **Productive-skill loop clarity — NEXT.**
2. **Mobile/accessibility/performance QA** — 360/390/430/768 widths, keyboard/focus/modal/audio/editor/recorder behavior, zoom/overflow/tap targets and route responsiveness.
3. **Only after UX loop stability:** evaluate Full Diagnostic and targeted content gaps such as MA02 production audio or a Task 2 practice bank.

## 6. Explicit non-goals for V1.8

Do not:

- create MA03;
- create MR05/ML05;
- expand Core 30 to 40/50 lessons;
- resume closed V1.6 semantic mining;
- manufacture routes from sparse signals;
- add new RR/LR/VG Repair without new independent evidence plus an instructional gap;
- add accounts/backend, paid LLM API, automatic IELTS scoring, leaderboard or complex gamification.

## 7. Working method / guardrails

- Check current main/open PRs/Actions before each batch.
- Read latest closure/checkpoint docs; do not redo closed audits.
- Prefer smallest safe learner-flow change.
- Preserve existing storage schemas unless an explicit migration is justified and tested.
- Add regression coverage for important learner-facing changes.
- Validate production-sensitive changes locally and against deployed GitHub Pages.
- Update this file after meaningful merged milestones.

## 8. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.8-LEARNER-JOURNEY-OPTIMIZATION.md`.
3. Inspect latest GitHub main/open PRs/Actions.
4. Do not restart V1.6 audits, V1.7 closure, result prioritization, context continuity, or Today consolidation.
5. Continue **Productive-skill loop clarity** unless a newer checkpoint supersedes it.
6. Update this file after the next production-closed milestone.

## 9. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → implemented/closed version docs → this checkpoint → current GitHub runtime/tests`
