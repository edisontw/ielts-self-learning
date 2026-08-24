# TTSMaker Workflow for Question Type Lab Production Audio V1

Verified against the public TTSMaker interface on 2026-08-24.

This guide turns the prepared QL01-B/C through QL06-B/C canonical scripts into production MP3 while preserving the project rule:

`PRODUCTION MP3 → if unavailable, LABELLED BROWSER-VOICE FALLBACK`

Canonical scripts and filenames remain defined in:

- `question-type-lab-depth-v1.js#LAB_DEPTH_LISTENING_SCRIPTS`
- `question-type-lab-depth-runtime-v1.js#LAB_DEPTH_AUDIO`
- `docs/question-type-lab-production-audio-v1.md`

Do not rewrite answer-bearing wording during TTS production.

## 1. Best free-plan strategy

TTSMaker currently offers two useful workflows:

### Multi-speaker Dialogue Generator

Use for:

- QL01-B — Advisor / Student
- QL01-C — Mina / Ravi
- QL04-B — Speaker 1 / Speaker 2 / Speaker 3
- QL04-C — Aisha / Ben / Cara
- QL05-B — Interviewer / Coordinator

These are exactly five multi-speaker files. The free Dialogue Generator currently allows up to 5 dialogue blocks, up to 200 characters per block, and up to 5 merged dialogue generations per week. This means the five multi-speaker assets fit one free weekly allocation if each is generated once after voice preview.

### Standard single-speaker TTS

Use for:

- QL02-B — Receptionist
- QL02-C — Guide
- QL03-B — Guide
- QL03-C — Host
- QL05-C — Tutor
- QL06-B — Lecturer
- QL06-C — Manager

These seven monologues are short and fit the standard free TTS character allowance.

## 2. Shared production settings

Target:

- natural British or neutral international English;
- approximately 140–150 words per minute;
- adult voices;
- normal connected speech;
- no announcer introduction;
- no background music;
- no sound effects;
- no spoken speaker labels;
- 0.2–0.4 second pause between dialogue turns;
- MP3 output;
- use High Quality when available;
- preserve canonical wording, numbers, dates and corrections.

For TTSMaker speed, start at normal/default speed. If the preview is clearly faster than approximately 150 wpm, reduce speed slightly, for example around -5% to -10%. Do not slow speech enough to sound like a language-learning demonstration.

For dialogue export, TTSMaker's default pause is approximately 300 ms, which matches this project's preferred 0.2–0.4 second conversational gap. Start with the default pause before changing it.

## 3. QL01-B exact TTSMaker setup

Output filename:

`ql01-b-careers-session-room.mp3`

Target duration: approximately 22–32 seconds.

Open TTSMaker's Multi Speaker Mode / Voice Dialogue Generator.

Create exactly four dialogue blocks. Do not paste `Advisor:` or `Student:` into the text fields.

### Block 1 — Advisor

Text:

`We could hold the careers session in the lecture theatre; it has plenty of seats.`

Voice:

- adult voice A;
- calm, practical, slightly more formal;
- British or neutral international English;
- normal speed initially.

### Block 2 — Student

Text:

`I thought so too, but the theatre is being used for exams that afternoon.`

Voice:

- adult voice B, clearly distinguishable from voice A;
- natural collaborative tone;
- same English variety if possible;
- normal speed initially.

### Block 3 — Advisor

Text:

`Right. The seminar room is available, though it only holds forty people.`

Use exactly the same Advisor voice and settings as Block 1.

### Block 4 — Student

Text:

`That should be enough. Last year only thirty-two attended, so let's book the seminar room.`

Use exactly the same Student voice and settings as Block 2.

Export settings:

- MP3;
- High Quality when available;
- pause between dialogue blocks: Default / about 300 ms;
- no BGM;
- no extra introductory text.

QA before accepting:

- `lecture theatre` sounds like an initial possibility, not the final answer;
- `being used for exams` is clear;
- `seminar room` sounds like the final choice;
- `forty` and `thirty-two` are both intelligible and not exaggerated;
- total clip feels like a real planning conversation.

## 4. QL01-C exact TTSMaker setup

Output filename:

`ql01-c-market-visit.mp3`

Target duration: approximately 22–32 seconds.

Create exactly five dialogue blocks. This is the maximum currently allowed by the free Dialogue Generator, so do not add an empty block or narrator block.

### Block 1 — Mina

`I nearly chose the river walk because it starts close to the hotel.`

Voice:

- adult voice C;
- thoughtful, conversational;
- initially sounds mildly positive about the river walk.

### Block 2 — Ravi

`The forecast says heavy rain, though. The museum tour is indoors, but we've already been there.`

Voice:

- adult voice D, clearly different from Mina;
- practical, natural tone.

### Block 3 — Mina

`True. What about the market visit?`

Use the same Mina voice as Block 1.

### Block 4 — Ravi

`It doesn't start until eleven, which gives us time for breakfast.`

Use the same Ravi voice as Block 2.

### Block 5 — Mina

`Good point. Let's do the market visit.`

Use the same Mina voice as Blocks 1 and 3.

Export settings:

- MP3;
- High Quality when available;
- Default / approximately 300 ms pause;
- no BGM.

QA before accepting:

- `river walk` is clearly considered but not selected;
- `heavy rain` is audible as the reason against it;
- `museum tour` is another rejected option;
- `eleven` is clear;
- `market visit` is clearly the final decision without theatrical emphasis.

## 5. Voice selection procedure

TTSMaker's voice library changes over time, so the project does not hard-code a public voice name. Use this procedure instead:

1. Language: choose English / English (ALL).
2. Preview several adult voices.
3. Prefer British or neutral international pronunciation.
4. For a two-person dialogue, select two voices that differ clearly in timbre. Male/female is acceptable but not required.
5. Avoid cartoonish, childlike, highly dramatic or commercial-announcer voices.
6. Reuse exactly the same selected voice for every block belonging to the same person.
7. Keep pitch at default unless two otherwise-good voices sound too similar.
8. Keep volume similar across speakers.
9. Emotion should remain default/natural; exaggerated acting is not appropriate for IELTS listening practice.

## 6. Efficient free-plan order

To avoid wasting the weekly five-dialogue quota:

1. Use individual block preview / Convert To Speech first when possible.
2. Finalise voice A and voice B before generating the merged file.
3. Generate QL01-B once.
4. Generate QL01-C once.
5. Continue QL04-B, QL04-C and QL05-B only after the first two sound acceptable.
6. Produce all monologues using the standard single-speaker page; they do not need Multi Speaker Mode.

Suggested production order:

1. QL01-B
2. QL01-C
3. QL04-B
4. QL04-C
5. QL05-B
6. QL02-B
7. QL02-C
8. QL03-B
9. QL03-C
10. QL05-C
11. QL06-B
12. QL06-C

## 7. Download and naming

Download the generated file immediately after QA.

Rename exactly to the repository filename. Do not add `(1)`, dates, spaces or TTSMaker-generated suffixes.

Upload destination:

`media/audio/question-type-labs/`

The runtime already tries these exact paths. When the MP3 exists, it should automatically play before the browser-voice fallback.

## 8. After upload

For every uploaded MP3:

1. inspect duration and technical metadata;
2. normalise format only if needed;
3. verify wording against the canonical repository script;
4. test deployed playback;
5. confirm the page status changes from browser fallback to `Production MP3`;
6. record checksum, provenance and QA in the audio manifest only after deployed playback passes.

Do not mark an asset `production-live` merely because a local MP3 exists.
