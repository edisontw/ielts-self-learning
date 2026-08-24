# Speaking Practice Bank V1

Date: 2026-08-25

## Purpose

This stage adds depth to the existing S01–S05 Speaking curriculum instead of duplicating strategy lessons.

Existing lessons already cover:

- S01 — answer development;
- S02 — fluency control rather than speed;
- S03 — continue after mistakes instead of restarting;
- S04 — Part 2 long-turn planning and development;
- S05 — Part 3 explanation, comparison and speculation.

The new bank provides repeated original prompts plus a recorder/transcript/retry workflow:

`CHOOSE → ANSWER → LISTEN → TRANSCRIBE → SELF-CHECK → FEEDBACK → REPAIR → RETRY`

## Public-format reference

Implementation was checked against IELTS public Speaking guidance on 2026-08-25.

- Speaking is 11–14 minutes in total and contains three parts.
- Part 1 is an introduction/interview on familiar topics and lasts about 4–5 minutes.
- Part 2 is the individual long turn. The test taker has one minute to prepare and can speak for up to two minutes. Part 2 lasts about 3–4 minutes including preparation and follow-up.
- Part 3 is a broader, more abstract discussion connected to the Part 2 theme and lasts about 4–5 minutes.
- Public Speaking assessment criteria are Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.

The bank is original IELTS-style practice. It is not official IELTS material and is not affiliated with or endorsed by IELTS.

## Bank size

| Area | Sets | Questions / prompts |
| --- | ---: | ---: |
| Part 1 familiar topics | 12 | 48 questions |
| Part 2 cue cards | 12 | 12 cue cards |
| Part 3 linked discussions | 12 | 48 questions |
| **Total** | **36 sets** | **108 prompts/questions** |

Part 2 and Part 3 are linked by theme, and each Part 2 card also points to a related Part 1 topic.

## Topic coverage

Part 1 covers familiar areas such as home, work/study, routines, transport, food, technology, reading, outdoor time, friends, shopping, weekends and learning skills.

Part 2/Part 3 themes cover learning, places, advice, possessions, community events, challenge, travel, technology, reading/storytelling, photography, public services and lifestyle change.

## Workspace

`SPB01 — Speaking Practice Bank` provides four modes:

1. **Part 1**
   - topic selector;
   - four questions per topic;
   - random-question button;
   - optional 45-second pacing drill clearly labelled as practice, not an IELTS rule.

2. **Part 2**
   - 12 cue cards;
   - four planning bullets plus two possible follow-up questions;
   - portable preparation notes;
   - 1:00 preparation timer;
   - 2:00 long-turn timer;
   - direct jump to the linked Part 3 theme.

3. **Part 3**
   - 12 linked discussion themes;
   - four questions per theme;
   - random-question button;
   - optional 90-second practice timer, not an official per-answer limit.

4. **Retry bank**
   - built from the learner's recent `speaking-bank-attempt` events;
   - reopens the exact prompt;
   - marks the next attempt as a retry;
   - shows the previously selected retry target.

## Recording policy

Browser `MediaRecorder` is used when available.

The resulting audio Blob is intentionally temporary:

- it remains in the current page for playback;
- it is not written into localStorage;
- it is not included in learner-data backup;
- it disappears when the page/session is replaced.

This avoids storing large binary audio in the local-first data model.

The portable evidence is the transcript, preparation note and attempt metadata.

## Data portability

The bank reuses the existing core record `ielts-self-learning-v1`:

- transcript → `speakingTranscripts[promptId]`;
- Part 2 preparation note → `notes[spb-prep-promptId]`;
- saved attempt → `studyHistory` with `type: speaking-bank-attempt`.

No backup-schema change is required because these fields are already part of the portable core learner record.

The transcript textarea also uses the existing `.speaking-input` / `data-speaking-id` hook, so `productive-evidence-v1.js` can continue to record first-attempt/retry process evidence.

## Feedback policy

The copied AI prompt is deliberately transcript-only.

It may coach evidence visible in text, including:

- whether the question was answered;
- answer development and organisation;
- vocabulary choice and paraphrase;
- grammatical range/control.

It must **not** claim to evaluate pronunciation, stress, intonation, actual speech rate, pauses or hesitation from a transcript. Those require audio evidence.

The prompt also rejects a fake precise official IELTS band score and asks for three priorities, repair drills and a same-prompt retry before a model answer.

## Repair routing

The workspace links directly back to the existing curriculum:

- S01 — develop the answer;
- S02 — improve flow / pausing;
- S03 — stop restarting after small mistakes;
- S04 — strengthen Part 2 long turns;
- S05 — strengthen Part 3 abstract discussion.

## Validation contract

`tests/validate-speaking-practice-bank-v1.mjs` locks:

- 12 Part 1 topics × 4 questions;
- 12 Part 2 cue cards × 4 bullets × 2 follow-ups;
- 12 Part 3 sets × 4 questions;
- exactly 108 unique prompt/question IDs;
- one-to-one Part 2 → Part 3 linking;
- original-content provenance and format-check date;
- SPB01 registration;
- recorder and timer support;
- portable `speakingTranscripts` / `studyHistory` usage;
- Productive Evidence hook;
- transcript-only AI evidence limits;
- S01–S05 repair routing;
- required index/runtime/CSS integration.

The app version remains `0.14.0`; this is a content-depth stage rather than an application/schema version change.
