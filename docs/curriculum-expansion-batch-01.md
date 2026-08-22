# Curriculum Expansion — Batch 01

Date: 2026-08-22

This batch expands the V1.1 30-unit curriculum map without replacing the existing lesson engine.

## Complete lessons added

### Reading
- R02 — Read for Structure, Not Just Words
- R03 — Paraphrases: The Language IELTS Uses to Hide Answers
- R04 — True, False or Not Given?
- R05 — Matching Headings Without Reading Every Line

### Listening
- L02 — Why You Hear the Word but Still Miss the Answer
- L03 — Recognize Paraphrases While Listening
- L04 — Don't Fall for the Distractor
- L05 — Predict Before You Listen

### Continuation step
- W02 — One Main Idea Is Not Enough — Develop It
- W03 — Build a Strong Academic Paragraph

## Integration requirements preserved

Every new lesson is registered into the same mutable `LESSONS` registry used by the generic lesson renderer. Adaptive metadata is registered into `CORE_LESSON_META`, so the Today recommendation engine can use weakness, review due status, target relevance, skill balance, difficulty, available time, and recent repetition without a second content system.

Objective questions use the existing quiz block schema, including answer rationale and `errorTag`. Wrong answers can therefore continue through:

`ERROR → NOTEBOOK → RETRIEVAL REVIEW → RETRY`

Each lesson also declares `repairLessons`, `relatedLessons`, and `nextLessons` metadata for future richer graph-based recommendation work. The current runtime still uses the existing repair/review implementation rather than inventing a parallel workflow.

Vocabulary Review is extended with lesson-derived chunks from the new Reading, Listening, and Writing material. Cards unlock through the existing source-lesson completion rule.

Observed skill performance continues to aggregate checked lesson answers, so the new objective questions automatically add evidence beyond Quick Placement.

## Listening media

L02–L05 include complete transcripts and browser-speech fallback scripts. This keeps the prototype runnable before production recordings are available. These synthetic voices are not a production substitute, especially for connected-speech training.

## Validation

`npm test` now additionally validates:

- R02–R05 / L02–L05 completeness
- W02–W03 continuation content
- unique quiz IDs
- answers present in options
- answer rationales and error tags
- adaptive lesson metadata
- lesson graph metadata
- lesson-derived Vocabulary Review sources
- L02–L05 browser-audio fallback registration
- curriculum module load order before `app.js`

## Next content order

Recommended next expansion:

1. W04–W05
2. S02–S05
3. LB02–LB04
4. I01–I03
5. finish any remaining 30-unit gaps and then add mini-test/question-type depth

Keep the 60% English-development / 40% IELTS-preparation balance and avoid converting every lesson into exam practice.
