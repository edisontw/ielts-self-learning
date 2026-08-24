# Academic Writing Task 1 V1

Date: 2026-08-25

## Purpose

This stage adds a dedicated IELTS Academic Writing Task 1 learning path without replacing the existing Writing Task 2 curriculum. It follows the same local-first learning loop used elsewhere in the site:

`ANALYSE → SELECT → OVERVIEW → GROUP → WRITE → SELF-CHECK → FEEDBACK → REVISE → RETRY`

The content is original IELTS-style practice. It is not an official IELTS product and is not affiliated with or endorsed by IELTS.

## Public-format reference

The implementation follows current public IELTS Academic Writing guidance:

- Academic Writing contains two tasks within 60 minutes.
- Task 1 asks the learner to describe visual information such as graphs, charts, tables or diagrams.
- The learner should write at least 150 words and spend about 20 minutes on Task 1.
- Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy are the four Writing assessment criteria.
- Task 1 requires selecting and reporting main features and making comparisons where relevant.

Reference used during implementation: IELTS public Academic Writing format and preparation guidance, checked 2026-08-25.

## Five-lesson path

1. **WT1-01 — Select the Main Features**
   - distinguish high-value features from low-value detail;
   - identify dominant trends, rankings, crossovers and exceptions;
   - select a small evidence set instead of copying the dataset.

2. **WT1-02 — Write a Useful Overview**
   - separate introduction from overview;
   - report dominant patterns without turning the overview into a detail paragraph;
   - adapt overview logic to statistical visuals, processes and maps.

3. **WT1-03 — Compare, Don’t List**
   - turn isolated values into relationships;
   - use controlled comparative language;
   - practise grouping similar values, opposing trends and changing gaps.

4. **WT1-04 — Organise Data into Groups**
   - use a four-part plan: introduction → overview → detail group 1 → detail group 2;
   - group statistical data by trend/level/contrast;
   - group process stages by function and map changes by area or change type.

5. **WT1-05 — Task 1 Full Workspace**
   - choose from 12 original full prompts;
   - switch between Practice and 20-minute Test modes;
   - analyse an accessible visual;
   - save planning notes and draft locally;
   - reveal suggested feature/grouping notes only in Practice mode;
   - copy an external-AI coaching prompt;
   - use the existing Productive-skill evidence card to record first attempt / revision-retry evidence.

## Full prompt bank

The bank contains exactly 12 prompts:

| Family | Count | Prompt IDs |
| --- | ---: | --- |
| Line graph | 2 | WT1-LINE-01, WT1-LINE-02 |
| Bar chart | 2 | WT1-BAR-01, WT1-BAR-02 |
| Table | 2 | WT1-TABLE-01, WT1-TABLE-02 |
| Pie / mixed | 2 | WT1-PIE-01, WT1-MIXED-01 |
| Process | 2 | WT1-PROCESS-01, WT1-PROCESS-02 |
| Map / plan | 2 | WT1-MAP-01, WT1-MAP-02 |

All statistical values are synthetic. Process diagrams and maps are original generated practice diagrams. Source provenance is stored with each prompt.

## Visual system

`writing-task1-runtime-v1.js` renders the prompt data directly in the browser:

- line graphs use SVG;
- grouped bar charts use SVG;
- tables use semantic HTML tables;
- pie charts use CSS conic gradients with legends;
- mixed prompts combine chart components;
- process prompts render stage cards and arrows;
- map prompts render before/after SVG plans.

Every prompt also includes a collapsible **Accessible data / diagram description** so the task is not dependent on visual perception alone.

## Feedback policy

The workspace uses external AI as a learning coach only. The generated prompt asks the model to:

1. identify the three highest-priority problems;
2. check main-feature selection and overview quality;
3. check comparison/grouping accuracy;
4. separate factual reporting errors from optional style changes;
5. give short repair exercises;
6. require the learner to revise before receiving a complete model answer.

The prompt explicitly tells the model not to claim a fake precise official IELTS band score.

## Local data and portability

Task 1 reuses the existing learner-data model rather than creating a new backup schema.

- `ielts-writing-task1-v1` keeps only workspace/UI cache such as the selected prompt and Practice/Test mode.
- Task 1 drafts are mirrored into the existing core learner record: `ielts-self-learning-v1 → writingDrafts[WT1-*]`.
- Task 1 plans are mirrored into `ielts-self-learning-v1 → notes[wt1-plan-WT1-*]`.
- `writing-task1-portability-v1.js` hydrates the workspace cache from the portable core record on page load.
- The existing Backup & Restore flow therefore exports/imports Task 1 drafts and plans without a schema-version change.
- If learner data is reset, the bridge clears stale Task 1 draft/plan cache while preserving harmless UI preferences.
- First-attempt / retry evidence remains in the existing `ielts-adaptive-v1 → productiveEvidence.writing` workflow rather than a second Task 1-only evidence system.

The dynamic draft textarea carries the existing `.writing-input` hook so the current Productive-skill evidence card can recognise the full Task 1 response.

## Validation contract

`tests/validate-writing-task1-v1.mjs` checks:

- exactly five WT1 lessons;
- exactly 12 prompt-bank items;
- exact planned visual-type distribution;
- unique IDs;
- lesson registration in `LESSONS` and `CORE_LESSON_META`;
- visual-data integrity for each prompt type;
- prompt provenance;
- Task 1-specific error tags;
- Writing feedback mini-drafts in WT1-02 and WT1-03;
- the dynamic workspace mount in WT1-05.

`tests/validate-writing-task1-portability-v1.mjs` checks:

- drafts are mirrored to `core.writingDrafts`;
- plans are mirrored to `core.notes`;
- backup/import hydration restores the workspace from portable core data;
- learner-data reset cannot leave stale Task 1 drafts/plans in the UI cache.

The project version remains `0.14.0`; this is a content-depth stage rather than a schema/application version change.
