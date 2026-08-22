# Mini Test V2 — Second Forms and Cross-Form Transfer Evidence

## Purpose

Mini Test V2 adds a second Reading and Listening form so the learner is not judged from one short test form alone.

The four-form bank is:

- `MR01` Reading Mini Test 01 — 12 questions / 12 min
- `MR02` Reading Mini Test 02 — 12 questions / 12 min
- `ML01` Listening Mini Test 01 — 10 questions / 9 min
- `ML02` Listening Mini Test 02 — 10 questions / 9 min

Mini Tests remain a separate IELTS Test Mode layer and do not increase the fixed `/30` core completion count or `/12` Question Type Lab completion count.

## Test Mode contract

All four forms preserve:

`TIMED → ONE SUBMISSION → NO HINTS → SUBMIT → ITEM REVIEW → ERROR NOTEBOOK → REPAIR`

Listening additionally keeps the transcript hidden until submission and uses the current browser speech-synthesis prototype.

Raw Mini Test scores are diagnostic evidence only. They are not IELTS band estimates.

## MR02 focus

`MR02` uses a new passage, **Why Urban Shade Is Becoming Infrastructure**.

It adds fresh transfer checks for:

- main idea
- contradiction
- paraphrase
- definition
- evidence
- scope
- inference
- reference
- matching information / paragraph function
- summary logic

Several error-tag dimensions intentionally overlap MR01 so recurring patterns can be detected across different forms rather than from repeated attempts on the same questions.

## ML02 focus

`ML02` uses a new community photography-walk conversation.

It checks:

- correction
- number
- distractor control
- sequence / directions
- paraphrase
- requested detail
- scope
- final meaning
- final decision

Several dimensions intentionally overlap ML01 for cross-form pattern detection.

## Observed-performance integration

`mini-test-data-v2.js` is loaded before `learning-runtime-v3.js` builds its quiz map.

Therefore submitted MR02 / ML02 answers use the same checked-answer evidence path as MR01 / ML01:

`Mini Test answer → core.lessonAnswers → learning-runtime quizMap → adaptive.skillPerformance`

Study Plan continues to consume `adaptive.skillPerformance`, so the second test form can change Reading / Listening priority when the learner explicitly rebalances the plan.

## Cross-form recurring error patterns

`mini-test-trends-v1.js` annotates each new Mini Test history row with missed error-tag counts immediately after submission.

For each skill it compares the two most recent **different** test forms. A recurring pattern exists only when the same error tag appears in both forms.

Example:

- MR01 missed `reading-main-idea`
- MR02 missed `reading-main-idea`
- result: recurring Reading main-idea pattern

A second attempt on MR02 alone does not count as two-form evidence.

The IELTS page displays the recurring pattern and offers a route to **Review / rebalance Study Plan**.

Rebalancing remains explicit. A Mini Test does not silently rewrite the learner's calendar.

## Data stored locally

New Mini Test submissions may add these diagnostic fields to the matching `adaptive.miniTestHistory` row:

```js
{
  missedErrorTags: {
    "reading-main-idea": 2,
    "reading-scope": 1
  },
  missedTagTotal: 3,
  patternAnnotatedAt: 1234567890
}
```

These fields describe error patterns only. They do not contain or generate IELTS band scores.

## Validation

`tests/validate-mini-test-v2.mjs` verifies:

- MR02 / ML02 registration
- four total Mini Tests after V2 registration
- 12-question / 12-minute Reading and 10-question / 9-minute Listening contracts
- valid answers, rationales and unique IDs
- shared cross-form error-tag dimensions
- V2 load order before observed-performance runtime
- Study Plan consumption of observed performance
- recurring-pattern logic across two different forms
- absence of pseudo band scoring in trend analysis
