# In-app Diagnostics / Troubleshooting V1

## Purpose

The Diagnostics panel gives learners and maintainers a compact view of whether the current IELTS Self-Learning prototype, browser capabilities, and local learner-data references are compatible.

It is intentionally **read-only**. Diagnostics do not modify learner progress, Study Plan sessions, Mini Test results, review schedules, Writing/Speaking evidence, or AI feedback returns.

The panel is shown on **Progress**, after Local Data Backup / Restore.

## Current release metadata

- App version: `0.11.0`
- Backup schema: `1`
- Study Plan schema: `1`

The app version used by Diagnostics and the `appVersion` written into exported backups must remain aligned.

## Status levels

### Healthy

No local-data structure or reference problems were found and all browser capabilities used by the prototype are available.

### Needs attention

Stored learner data are structurally usable, but one or more optional/runtime capabilities are missing. Examples:

- page is not running in a secure context
- browser speech synthesis is unavailable
- microphone API is unavailable
- `MediaRecorder` is unavailable
- modern Clipboard API is unavailable

These warnings do not automatically mean the whole site is broken. For example, Speaking can still use transcript-only practice if audio recording is unavailable.

### Data issue

A learner-data integrity problem was detected. Examples:

- malformed JSON in one of the IELTS storage keys
- wrong core/adaptive field type
- unsupported Study Plan schema
- completed lesson ID no longer exists in the registered curriculum
- Mini Test history references an unknown test ID
- Study Plan references lesson or Mini Test content that is no longer registered

A Data issue should be investigated before importing, resetting, or relying on the affected progress state.

## Browser capability checks

Diagnostics reports availability for:

- localStorage
- secure context
- browser speech synthesis
- microphone `getUserMedia`
- `MediaRecorder`
- Clipboard API
- JSON backup file export
- JSON backup file import

The panel does not request microphone permission. It only checks whether the browser APIs exist.

## Local learner-data counts

The panel reports counts only, including:

- fixed core completion out of `/30`
- Question Type Lab completion out of `/12`
- checked objective answers
- saved / fixed Error Notebook items
- due Error Review items
- due Vocabulary Review items
- Mini Test attempts
- distinct Mini Test forms seen out of `/4`
- Writing / Speaking productive attempts
- AI feedback-return count
- AI feedback still waiting for a retry
- Study Plan weeks and total planned sessions
- approximate character size of IELTS local storage

Core completion is filtered against the explicit 30 core IDs. Labs do not inflate `/30`.

## Reference integrity

Diagnostics compares persisted IDs with the currently registered content.

### Completed lessons

Every stored `completedLessons` ID must exist in `LESSONS`.

### Mini Tests

Every `miniTestHistory[].testId` must exist in the current `MINI_TESTS` registry.

### Study Plan

Lesson-like tasks must reference a registered lesson:

- `lesson`
- `lab`
- `productive-retry`

`mini-test` tasks must reference a registered Mini Test.

Synthetic tasks such as Placement and Review buffers are not treated as lesson IDs.

## Copy diagnostic report

The user can copy a compact plain-text diagnostic report for troubleshooting.

The copied report may include:

- app/schema versions
- date/time of the check
- browser capability booleans
- language / timezone / viewport
- learner-data counts
- diagnostic error or warning messages

It deliberately does **not** include:

- Writing draft text
- Speaking transcript text
- selected answer text
- Error Notebook question/answer text
- AI feedback priority text
- notes
- prompt contents

For bug reports, prefer the diagnostic report over sharing the full JSON learner backup.

## Refresh behavior

`Refresh diagnostics` recomputes the panel from current browser state.

The panel also refreshes after relevant in-app events such as:

- Study Plan changes
- Mini Test submission
- productive evidence changes
- AI feedback-return changes

It does not silently repair data.

## Relationship to Local Data Backup / Restore

Diagnostics and portability serve different purposes:

- **Diagnostics**: read-only health/status report
- **Export backup**: full learner-data archive that can contain private learning content
- **Import backup**: validated replacement of local IELTS data
- **Reset learner data**: destructive removal of learner-data keys after confirmation

If Diagnostics reports a Data issue and the learner has a known-good backup, restoring that backup may be appropriate. The panel itself never performs that restoration.

## Validation

`tests/validate-diagnostics.mjs` checks:

- healthy data and browser capability reporting
- core/Lab/Mini Test/Study Plan counts
- malformed JSON detection
- stale curriculum IDs
- stale Mini Test IDs
- missing Study Plan content references
- version alignment between package and backup metadata
- browser-style module load ordering
- copied-report privacy boundaries
- Node runner compatibility for mocked browser globals

The validation runs through `npm test` and the existing GitHub Actions workflow.
