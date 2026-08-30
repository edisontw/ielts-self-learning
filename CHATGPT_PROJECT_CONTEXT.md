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

1. **V1.7 production gate** — PR #60.
2. **V1.8 learner-journey baseline audit** — complete.
3. **V1.8 Test/Mock result prioritization** — PR #61 production-closed.
   - `attempt summary → up to 3 authorized priorities → one recommended next step → full item review`.
4. **V1.8 navigation/context continuity** — PR #62 production-closed.
   - `submitted review → targeted practice → named Return → read-only exact review snapshot`.
   - `Error Notebook → targeted practice → Return to Error Notebook`.
5. **V1.8 Today primary-action consolidation** — PR #63 production-closed.
   - ranks `due review > current Study Plan session > pending AI feedback retry > productive retry > adaptive new material`;
   - one full-size `Do this now`, at most two compact deduplicated alternatives.
6. **V1.8 productive feedback → retry clarity** — PR #64 production-closed.
   - merge main at closure: `226798ff313e47039e8896b8f0685cedc06006a1`;
   - final-main Validate #388 PASS; Pages #230 PASS; deployed E2E PASS.
   - Writing/Speaking flow: `attempt → save 2–3 AI coaching priorities → dominant Revise/Retry CTA → focus existing draft/transcript → save Revision/retry evidence → automatically close feedback cycle → compare process evidence`.
   - pending feedback automatically primes Productive Evidence to `Revision / retry`.
   - no AI band/examiner score enters learner evidence.
7. **V1.8 mobile/accessibility QA batch 01** — PR #65 production-closed.
   - merge main at closure: `3250bb110a79fc1cec05220b09ba32f2ae935be6`;
   - final-main Validate #390 PASS; Pages #231 PASS; deployed E2E PASS.
   - real-browser 360 / 390 / 430 / 768 route matrix passes without horizontal page overflow;
   - visible button/link targets meet the 24px browser gate;
   - Prompt modal and Site Guide trap Tab/Shift+Tab and restore focus after close;
   - Prompt modal return focus survives app rerender by relocating the invoking control;
   - visible-focus, skip-link, reduced-motion and pinch-zoom guardrails remain intact.
   - PR attempt 1 had an isolated MA02 return-review timing failure; unchanged attempt 2 PASS and final-main #390 PASS, so no reproducible regression remained.

### NEXT UNFINISHED MILESTONE

> **Performance QA:** measure and lock startup/runtime performance before making optimization changes.

Audit first; do not refactor by intuition. Priorities:

1. initial static payload and number of eagerly loaded JS/CSS modules;
2. startup DOM / render lifecycle cost and duplicate document-wide observers;
3. route responsiveness after localStorage hydration;
4. Full Mock / Mini Test payload cost and whether heavy test assets can be deferred safely;
5. audio loading behavior and whether media is fetched before the learner requests it;
6. caching/static Pages behavior where measurable in the current architecture.

Any optimization must preserve learner data, existing routes, Test Mode, repair ownership, and the production E2E gates.

## 4. V1.8 mission

V1.8 is **not** a content-expansion release. Reduce cognitive/navigation friction so each meaningful action leads clearly to the next highest-value action.

Desired end-state:

`TODAY → PRACTICE → ERROR → REPAIR/REVIEW → RETRY → RETURN → NEXT BEST ACTION`

## 5. Remaining V1.8 order

1. **Performance QA — NEXT:** measure startup/payload/render/media behavior, then make only evidence-backed changes.
2. **Accessibility follow-up only if evidence finds a real gap:** editor/recorder/audio semantics, 200% zoom or other manual/automated findings not covered by batch 01.
3. **Only after UX/performance stability:** evaluate Full Diagnostic and targeted content gaps such as MA02 production audio or a Task 2 practice bank.

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
2. Read `V1.8-LEARNER-JOURNEY-OPTIMIZATION.md` if additional rationale is needed.
3. Inspect latest GitHub main/open PRs/Actions.
4. Do not restart V1.6 audits, V1.7 closure, result prioritization, context continuity, Today consolidation, productive retry clarity, or mobile/accessibility QA batch 01.
5. Continue **Performance QA** unless a newer checkpoint supersedes it.
6. Update this file after the next production-closed milestone.

## 9. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → implemented/closed version docs → this checkpoint → current GitHub runtime/tests`
