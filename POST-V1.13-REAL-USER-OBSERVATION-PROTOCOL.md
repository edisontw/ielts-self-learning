# Post-V1.13 Real-User Observation Protocol

Status: **READY FOR SMALL REPRESENTATIVE TRIAL**  
Prepared: **2026-08-31**

## Purpose

V1.13 seeded browser UAT is closed and production-verified. The remaining uncertainty is human rather than deterministic:

- where a learner hesitates;
- which terms are misunderstood;
- whether the learner trusts the recommended next action;
- whether the learner can explain why that action is being recommended;
- whether the learner chooses an unintended route even when the interface is technically correct.

This protocol is an evidence-gathering step. It does **not** authorize V1.14 feature or content expansion by itself.

## Participant profile

Prefer **3–5 representative IELTS Academic learners** if available.

Useful profile:

- approximately IELTS 5.5–6.5, or a learner who reasonably identifies as intermediate / upper-intermediate;
- preparing for IELTS Academic or considering IELTS preparation;
- able to use a desktop or mobile browser independently;
- not previously familiar with this website if possible.

Do not exclude a learner merely because they do not know an exact IELTS band. Do not collect unnecessary personal data.

## Session format

Recommended session length: **30–45 minutes**.

Use the production site:

`https://edisontw.github.io/ielts-self-learning/`

For the first session, start with a fresh browser profile / private window where practical.

Observer rule:

- do not teach the interface before the task;
- give the task goal, not the route;
- do not rescue the learner immediately when they hesitate;
- if the learner asks for help, record the point of confusion before helping;
- observe behaviour first, then ask brief follow-up questions.

Think-aloud is optional. Do not force continuous verbalization if it distracts the learner.

## Observation tasks

### Task 1 — Decide what to do first

Prompt:

> You have found this IELTS self-learning website for the first time. Decide what you would do first and start doing it.

Observe:

- whether the learner notices Quick Placement;
- whether the purpose of Placement is understood;
- whether they instead enter Learn / IELTS / Improve / Progress and why;
- whether `Today`, `Learn`, `IELTS`, `Improve`, `Progress`, `Learning Better`, `Practice Mode` or `Test Mode` terminology causes hesitation;
- time to first meaningful action.

Do not tell the learner to use Placement unless they become blocked and explicitly request help.

### Task 2 — Use the result to choose the next action

If the learner completes Quick Placement, ask:

> Based on this result, decide what you should do next.

Observe:

- whether the learner interprets Placement as an exact IELTS band despite the warning;
- whether Study Plan creation is discoverable;
- whether Today provides one obvious next action;
- whether the learner can explain why that action is recommended;
- whether the recommendation feels credible or arbitrary.

If completing all 24 Placement items would consume too much of the session, this task may be run in a separate short session or with a prepared non-personal seeded test profile. Do not alter the learner's real answers to accelerate the result.

### Task 3 — Make a mistake and recover

Prompt:

> Do one practice activity. Intentionally choose one answer you think may be wrong, then use the website to work out how to improve that mistake.

Observe:

- whether explanation is noticed;
- whether `Save error` is understood;
- whether the learner finds Improve / Error Notebook without instruction;
- whether Repair / review terminology is understood;
- whether Retry is discoverable;
- whether `Corrected` and later review make sense;
- whether the learner can describe what will happen next.

Do not instruct the exact Error Notebook route unless the learner becomes blocked.

### Task 4 — Finish a timed IELTS activity and decide what to practise

Use one Question Type Lab, Mini Test, or Full Mock component appropriate to the available session time.

Prompt:

> Complete this IELTS activity, review the result, then decide what you should practise next.

Observe:

- whether Practice Mode versus Test Mode is understood;
- whether the result priority is understandable;
- whether the learner follows targeted practice or chooses another route;
- whether the learner understands why that practice was selected;
- whether returning to the submitted review is discoverable;
- whether read-only submitted state is understood rather than mistaken for a broken test.

For a short session, a Mini Test is preferred over a Full Mock.

### Task 5 — Try one Writing or Speaking AI-feedback handoff

Prompt:

> Use one Writing or Speaking practice activity. When you reach the AI-feedback step, work out what you would do next.

Observe:

- whether `Copy AI coaching prompt` is understandable;
- whether the learner assumes a specific paid AI service is required;
- whether they understand that returned feedback is coaching, not an official IELTS band;
- for Speaking, whether transcript-only limitations are understood;
- whether the learner knows where to return 2–3 priorities;
- whether revision / retry feels connected to the feedback.

The observer does not need to collect or store the learner's essay, transcript, or external AI conversation.

### Task 6 — Returning learner check

Preferred method: a second short session **24–72 hours later** using the same local browser profile.

Prompt:

> You have come back to continue studying. Decide what you should do now.

Observe:

- whether due review is noticed and trusted;
- whether Today and Study Plan appear to agree;
- whether completed lessons are mistaken for new work;
- whether the learner understands why review can outrank new material;
- after completing the due action, whether the next action is clear.

If a second session is impossible, use a prepared non-personal seeded returning-learner profile rather than changing the participant's real history during the session.

## What to record

For each task, record only concise observation data:

| Field | Record |
|---|---|
| Task | T1–T6 |
| Device | desktop / mobile + approximate viewport |
| Outcome | completed / completed with help / blocked |
| Time to meaningful action | approximate seconds |
| Hesitation | location + approximate duration if >5 s |
| Unintended route | what they chose and why, if known |
| Terminology issue | exact term that caused confusion |
| Help request | what they asked |
| Trust | 1–5 after the task |
| Explanation check | can / partly can / cannot explain why the next action was recommended |
| Observer note | one or two sentences only |

Do not store names, account identifiers, essays, transcripts, selected-answer text, external AI conversations, or other unnecessary personal content in the repository.

## Short follow-up questions

Ask only after the learner has attempted the task:

1. What did you think the website wanted you to do next?
2. Why did you choose that action?
3. Was any label or term unclear?
4. Did the recommendation feel relevant to you? Why or why not?
5. What did you expect to happen after completing that action?

Avoid broad preference questions such as only asking whether the learner "liked" the interface.

## Friction classification

Use the existing V1.13 severity model:

- `P0 BLOCKER` — cannot continue, data loss, broken state;
- `P1 HIGH` — next action is wrong, misleading, or materially difficult to find;
- `P2 MEDIUM` — understandable but unnecessarily confusing or repetitive;
- `P3 LOW` — polish only, no meaningful learning-loop impact.

Also tag the type:

- navigation;
- recommendation;
- state synchronization;
- explanation / copy;
- terminology;
- mobile / accessibility;
- Test Mode boundary;
- productive-feedback handoff;
- trust / rationale;
- other.

## Evidence gate for implementation

Do not open a new product milestone merely because one learner expresses a preference.

Implementation threshold:

- any reproducible `P0` or `P1` finding may justify immediate focused work;
- a `P2` finding should normally repeat in **at least two participants** or have an obvious low-risk/high-value fix;
- `P3` should normally be deferred;
- before adding content, confirm that existing Core / Repair / Lab / Mini Test / Full Mock / productive-feedback routes cannot solve the observed problem;
- preserve Test Mode boundaries, local-first learner data, Core 30 denominator, production-MP3-first Listening policy, and the no-fake-official-band rule.

## Suggested minimum evidence before a new milestone

A reasonable small-trial checkpoint is:

- at least **3 representative learners**;
- Tasks 1–5 attempted by each where practical;
- at least **2 returning-learner observations** for Task 6 if practical;
- all observations classified P0–P3;
- repeated terminology / navigation / trust issues summarized without private learner content.

If the trial produces **no repeated P0/P1 and no repeated high-value P2**, do not manufacture V1.14 work. Keep the current production baseline and wait for stronger evidence.

## Repository result format

When observations exist, create a separate summary such as:

`POST-V1.13-REAL-USER-OBSERVATION-RESULTS.md`

That summary should contain only anonymized aggregates and friction findings, for example:

- `3/4 learners hesitated at ...`;
- `2/4 interpreted ... as ...`;
- `P1 navigation: ...`;
- `P2 terminology: ...`.

Do not commit raw recordings or private learner content.

## Decision after the trial

Choose one of three outcomes:

1. **NO NEW MILESTONE** — baseline remains stable; evidence is insufficient for product work.
2. **FOCUSED HARDENING** — one or more reproducible P0/P1 or repeated high-value P2 findings justify a narrow fix milestone.
3. **EVIDENCE-BACKED EXPANSION** — only if observation demonstrates a learner need that the current content/routes cannot satisfy.

The default remains: **evidence first, smallest change second**.
