# AI Feedback Return V1

## Goal

Keep the existing free external-LLM workflow while making revision behaviour visible inside the local-first learner model.

The website still does **not** call a paid LLM API and does **not** treat an AI-generated IELTS band as learner evidence.

## Learning loop

`ATTEMPT → SAVE PROCESS EVIDENCE → COPY PROMPT → EXTERNAL LLM → RETURN 2–3 PRIORITIES → REVISION / RETRY → SAVE PROCESS EVIDENCE → COMPARE`

## What is stored

Each returned feedback set contains only:

```js
{
  id,
  ts,
  skill,              // writing | speaking
  lessonId,
  sourceEvidenceId,
  sourceAttemptKind,
  priorities,         // 2–3 short actionable changes
  appliedByEvidenceId,
  appliedAt,
  comparison
}
```

There is intentionally no `aiScore`, `bandScore`, `examinerScore`, or equivalent field.

Users may see a score in an external LLM response, but that value is not imported into the learner profile.

## Before / after comparison

When a later productive-evidence event is saved as `attemptKind: 'retry'`, the runtime links it to the latest pending feedback set for the same lesson and skill.

Comparison uses only signals already owned by the site:

- five productive self-check criteria
- process self-check change
- word-count change
- newly satisfied criteria
- criteria no longer checked

This comparison describes revision behaviour. It is **not IELTS scoring**.

## UI

### Writing / Speaking lesson

The AI Feedback Return card appears after Productive-skill evidence.

The learner enters:

1. Priority 1
2. Priority 2
3. Priority 3 (optional)

A saved productive attempt is required before feedback can be logged so every feedback set has a concrete source.

### Today

If returned feedback has not yet been followed by a saved retry, Today shows a feedback-waiting-for-revision card linking back to the relevant lesson.

### Progress

Writing and Speaking show:

- total returned feedback sets
- how many have been applied by a later retry
- how many are still waiting
- the latest process comparison when available

## Storage

Local storage key remains:

`ielts-adaptive-v1`

New branch:

```js
adaptive.aiFeedbackReturns = {
  writing: [],
  speaking: []
};
```

No account or backend is required.

## Guardrail

External AI feedback is coaching input. The learner profile continues to rely on Placement, objective checked answers, productive process evidence, review history, and actual retries rather than an imported AI band estimate.
