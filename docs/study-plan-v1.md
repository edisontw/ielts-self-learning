# Adaptive Study Plan V1

## Purpose

Study Plan V1 turns the existing learner-data model into a usable 4 / 8 / 12 / 16-week plan without introducing an exact IELTS band prediction.

The plan consumes:

- Quick Placement section results
- observed Reading / Listening / Writing / Speaking / Vocabulary / Grammar performance
- Writing / Speaking productive retry priority
- Error Review due dates
- Vocabulary Review due dates
- completed 30-unit core lessons
- Question Type Lab completion
- Mini Test history
- target IELTS band
- available study days and minutes per session

## Planning principle

The schedule preserves the product balance:

`SKILL BUILDING ≈ 60% · EXPLICIT IELTS TRANSFER ≤ 40%`

Foundation weeks deliberately use less explicit test practice. Build / Transfer / Test & Review phases can rise toward the 40% IELTS-transfer allocation.

A short 4-week plan is not represented as sufficient to finish all content when the learner selects a low weekly time budget. The engine fills only the available sessions and prioritises the most useful work.

## Phases

### Foundation

- Quick Placement if not yet completed
- Learning Better / core skill lessons
- review queue
- limited IELTS Strategy / Lab exposure

### Build

- priority Reading / Listening / Writing / Speaking lessons
- Grammar / Vocabulary repair when relevant
- productive Writing / Speaking retry sessions
- selected Question Type Labs

### Transfer

- continued skill building
- more Question Type Lab work
- review / retry
- preparation for Test Mode

### Test & Review

- Reading / Listening Mini Tests
- item review
- Error Notebook → Repair → Retry
- unfinished high-priority lessons / Labs

## Priority signal

Priority is not a test score and is never presented as an IELTS band.

For each skill, the engine begins with Placement weakness. It then blends in observed checked-answer accuracy as evidence accumulates. Writing and Speaking can additionally receive productive-retry priority. Saved skill-specific errors add a small priority boost.

The purpose is scheduling, not grading.

## Plan controls

The Progress page exposes:

- 4 / 8 / 12 / 16 weeks
- 3 / 4 / 5 / 6 study days per week
- 20 / 30 / 45 / 60 minutes per session
- Create / Rebalance plan

The generated plan is stored locally in `ielts-study-plan-v1`.

## Runtime behaviour

Progress shows the whole plan by week and phase.

Today shows the next incomplete session from the current week.

Completion can be inferred automatically for:

- Placement
- normal lessons
- Question Type Labs
- submitted Mini Tests
- productive retries recorded after the plan was generated

Review/buffer sessions can be marked done manually.

## Rebalancing

The plan is intentionally regenerable. The learner should rebalance when:

- available weekly time changes
- a Mini Test reveals a new weakness
- several errors become due
- Writing / Speaking retry evidence changes the productive-skill priority
- a long interruption makes the previous calendar unrealistic

V1 does not silently rewrite the entire plan after every answer. It updates completion state continuously and lets the learner explicitly regenerate the schedule when the planning assumptions have materially changed.

## Non-goals

Study Plan V1 does not:

- predict an official IELTS band
- guarantee a target band by a deadline
- claim that 4 weeks is enough for every learner
- replace Error Review or spaced Vocabulary Review
- force completion of every core lesson before targeted repair
- require an account or backend
