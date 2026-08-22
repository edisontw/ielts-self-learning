# Local Data Portability V1

## Purpose

IELTS Self-Learning is local-first in V1. Placement, progress, Error Notebook, review schedules, Study Plan, Mini Test history, Writing/Speaking evidence and AI feedback return records live in the browser rather than in an account database.

Local Data Portability V1 gives the learner three explicit controls on the Progress page:

`EXPORT BACKUP → IMPORT BACKUP → RESET LEARNER DATA`

The goal is to make browser-local learning data portable before broader real-world testing without introducing an account or cloud backend.

## Backup format

Exports use a versioned JSON envelope rather than dumping the browser's entire `localStorage`.

```json
{
  "format": "ielts-self-learning-backup",
  "schemaVersion": 1,
  "appVersion": "0.10.0",
  "exportedAt": "...",
  "source": "...",
  "data": {
    "ielts-self-learning-v1": {},
    "ielts-adaptive-v1": {},
    "ielts-study-plan-v1": {},
    "ielts-theme": "dark"
  }
}
```

Only these four keys are accepted.

### `ielts-self-learning-v1`

Includes the core learner state such as:

- Placement and profile
- preferred study time
- completed core lessons
- checked lesson / Lab / Mini Test answers
- notes
- Error Notebook and corrected errors
- study history
- Writing drafts
- Speaking transcripts
- interface scaffolding preference

### `ielts-adaptive-v1`

Includes adaptive learner state such as:

- Error Review schedule/history
- Repair progress
- Vocabulary Review schedule/history
- observed skill performance
- adaptive learning history
- Mini Test history
- Writing/Speaking productive evidence
- productive priority
- AI feedback return records
- Mini Test recurring-error evidence

### `ielts-study-plan-v1`

Includes the current generated Study Plan, its configuration, weekly sessions and manually completed Review/buffer sessions.

### `ielts-theme`

Includes the Light/Dark appearance preference.

## Export

The Progress page creates a JSON file named approximately:

`ielts-self-learning-backup-YYYY-MM-DD.json`

The export is assembled in the browser and downloaded locally. No backup file is sent to a server.

## Import validation

Import is deliberately strict because it replaces local learner state.

Before any write occurs, V1 checks:

1. JSON parses successfully.
2. `format` matches `ielts-self-learning-backup`.
3. `schemaVersion` is supported.
4. all four expected storage keys are present.
5. no unknown storage key is present.
6. core array/object fields have the expected broad shape.
7. adaptive array/object fields have the expected broad shape.
8. Study Plan uses the supported internal version and contains a config plus week/session arrays.
9. theme is `light`, `dark`, or `null`.
10. the backup stays within the 5 MB V1 limit.

After validation, the learner sees a summary before approving replacement:

- Placement present / absent
- core lessons completed
- saved errors
- Mini Test attempts
- Study Plan length

If localStorage writing fails after confirmation, the importer attempts to restore the values that existed before import.

## Reset

`Reset learner data` removes only:

- `ielts-self-learning-v1`
- `ielts-adaptive-v1`
- `ielts-study-plan-v1`

It intentionally keeps `ielts-theme` so resetting learning progress does not unexpectedly change the site's appearance.

The reset requires browser confirmation and reminds the learner to export first if the data may be needed later.

The implementation does not call `localStorage.clear()` because the IELTS site should not delete unrelated storage on the same origin.

## Security / trust boundary

V1 import is a data restore mechanism, not an executable plugin format.

- only allow-listed keys are written
- imported values are JSON data
- no imported code is evaluated
- unknown storage keys are rejected
- import does not upload the file
- imported data does not create an IELTS band estimate

## Non-goals

V1 does not provide:

- cloud sync
- account migration
- encrypted backups
- cross-device automatic sync
- merging two different learner histories
- partial import by category
- schema migration from arbitrary future versions

Those can be considered only after the learner-data model stabilises through deployed usage.
