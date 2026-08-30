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
- Academic Writing Task 1 course + 12 practice prompts;
- Speaking Practice Bank;
- Quick Placement, Study Plan, Adaptive Today, Error Notebook, Review Queue, productive evidence, AI feedback return, backup/import/reset and Diagnostics;
- production audio across earlier Listening surfaces; MA02 Listening may remain on its explicit browser-voice production gate until separately upgraded.

Do **not** start the next phase by adding generic lessons, Mini Tests, Full Mocks or Repairs.

## 3. V1.8 learner-journey optimization — CLOSED 2026-08-30

Do not repeat these milestones:

1. **V1.7 production gate** — PR #60.
2. **V1.8 learner-journey baseline audit** — complete.
3. **Test/Mock result prioritization** — PR #61 production-closed.
   - `attempt summary → up to 3 authorized priorities → one recommended next step → full item review`.
4. **Navigation/context continuity** — PR #62 production-closed.
   - `submitted review → targeted practice → named Return → read-only exact review snapshot`.
   - `Error Notebook → targeted practice → Return to Error Notebook`.
5. **Today primary-action consolidation** — PR #63 production-closed.
   - ranks `due review > current Study Plan session > pending AI feedback retry > productive retry > adaptive new material`;
   - one full-size `Do this now`, at most two compact deduplicated alternatives.
6. **Productive feedback → retry clarity** — PR #64 production-closed.
   - Writing/Speaking: `attempt → save 2–3 coaching priorities → Revise/Retry → save retry evidence → close feedback cycle`;
   - no AI band/examiner score enters learner evidence.
7. **Mobile/accessibility QA batch 01** — PR #65 production-closed.
   - 360 / 390 / 430 / 768 browser matrix;
   - no horizontal overflow;
   - Prompt modal / Site Guide Tab + Shift+Tab focus trap and return focus;
   - visible focus, skip link, reduced motion and pinch zoom preserved.
8. **Performance measurement baseline** — PR #66 production-closed.
   - merge main `583e48d2d622ae8601137a09e5055ffebe4dba49`;
   - final-main Validate #393 PASS; Pages #233 PASS; deployed E2E PASS;
   - measured 46 index module scripts / 62 eager JS modules / ~851 KB JS / ~49.6 KB CSS;
   - local Chrome baseline ~278 ms startup and ~25 ms representative route transitions;
   - zero audio/media fetched before explicit playback;
   - baseline found 21 MutationObservers and 5 setInterval calls.
9. **Adaptive Today lifecycle optimization** — PR #67 production-closed.
   - merge main `203cda832d18a0387ecc84e027c346ed8cd3c23a`;
   - final-main Validate #395 PASS; Pages #234 PASS; deployed E2E PASS;
   - removed Adaptive Today document-wide MutationObserver and permanent 1.1-second polling;
   - moved Adaptive Today to shared V1.5 event-driven render lifecycle;
   - static baseline improved to 20 MutationObservers / 4 setInterval calls;
   - remaining intervals are active Writing / Mini Test / Full Mock timers, not idle global polling.

V1.8 is closed. Do not continue low-value performance micro-optimization without new evidence.

## 4. Current phase — V1.9 Better Diagnosis

V1.9 improves the **quality and visibility of diagnostic evidence before adding more content**.

The original V1.1 plan envisioned a Full Diagnostic that can be split across sessions:

- Reading 20–25 min;
- Listening 15–20 min;
- Writing 20–40 min;
- Speaking 10–15 min.

Current implemented evidence already exists but is fragmented:

- Quick Placement: V/G/R/L 6 questions each;
- Reading Mini Tests MR01–MR04;
- Listening Mini Tests ML01–ML04;
- Full Mock MA01/MA02 Reading/Listening results;
- Writing productive first/retry evidence;
- Speaking productive first/retry evidence;
- Full Mock Writing word-count evidence.

### Current V1.9 batch — Diagnostic Evidence Center

See `V1.9-DIAGNOSTIC-AUDIT-01.md`.

Batch 1 should **reuse existing evidence before creating another test bank**. It is an evidence-coverage layer, not a relabelled exam-equivalent Full Diagnostic.

Initial baseline rules:

- Quick Placement required as the starting profile;
- Reading: ≥1 distinct timed Mini Test / Full Mock form; ≥2 forms = broader evidence;
- Listening: ≥1 distinct timed Mini Test / Full Mock form; ≥2 forms = broader evidence;
- Writing: ≥1 `first` productive attempt with 150+ words; complete Mock Writing (Task 1 150+ + Task 2 250+) or multiple substantial first attempts = broader evidence;
- Speaking: ≥1 `first` productive attempt with 60+ transcript words; multiple distinct substantial prompt samples = broader evidence;
- Speaking Mock beta completion alone is **not** diagnostic skill evidence because it stores no transcript/quality evidence.

The center must remain read-only and derive state from existing storage. No new learner-data schema is justified for Batch 1.

Desired learner flow:

`Quick Placement → timed Reading baseline → timed Listening baseline → substantial Writing first attempt → substantial Speaking first attempt → Today`

Existing evidence should satisfy steps automatically; never force a learner to redo valid evidence only to complete a dashboard.

## 5. V1.9 guardrails

Do not:

- call one short Mini Test a complete Full Diagnostic;
- output one fake overall IELTS band from mixed evidence;
- auto-score Writing/Speaking as official IELTS bands;
- treat Speaking Mock beta completion alone as a Speaking proficiency signal;
- create dedicated new diagnostic forms until the evidence-center audit shows a real remaining gap;
- create MA03, MR05 or ML05 as a substitute for diagnosis;
- resume V1.6 semantic mining;
- add new RR/LR/VG Repair from sparse evidence;
- expand Core 30 merely to increase content count.

## 6. Likely next decision after Diagnostic Evidence Center

After Batch 1 is production-closed, inspect real coverage and decide whether dedicated longer diagnostic assets are necessary.

Highest-probability remaining gaps:

1. Writing Task 2 standardized first-attempt evidence;
2. Speaking standardized first-attempt collection across Parts 1–3;
3. only if short timed R/L evidence proves insufficient, dedicated 15–25 minute Reading/Listening diagnostic forms.

Do not assume all three are required in advance.

Targeted content expansion such as MA02 production audio or a Task 2 practice bank comes **after** diagnostic evidence quality is understood.

## 7. Working method

- Check current main/open PRs/Actions before each batch.
- Read latest closure/checkpoint docs; do not redo closed audits.
- Prefer the smallest safe learner-flow change.
- Preserve existing storage schemas unless a migration is justified and tested.
- Add regression coverage for important learner-facing changes.
- Validate production-sensitive changes in real Chrome and against deployed GitHub Pages.
- Update this file after meaningful merged milestones.

## 8. New-window startup instruction

1. Read `CHATGPT_PROJECT_CONTEXT.md`.
2. Read `V1.9-DIAGNOSTIC-AUDIT-01.md`.
3. Inspect current GitHub main/open PRs/Actions.
4. Do not restart V1.6 audits or V1.8 learner-journey/performance work.
5. Continue the **V1.9 Diagnostic Evidence Center** unless a newer checkpoint supersedes it.
6. After production closure, evaluate the remaining Writing/Speaking diagnostic evidence gap before adding dedicated diagnostic content.

## 9. Source-of-truth hierarchy

`V1.0 product principles → V1.1 UX/architecture → implemented/closed version docs → this checkpoint → current GitHub runtime/tests`
