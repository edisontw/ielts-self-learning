# MA02 Listening Production Audio Plan

**Status:** production preparation — scripts locked, recordings not yet approved  
**Source of truth:** `mock-test-data-v2.js`  
**Machine-readable spec:** `ma02-production-audio-spec-v1.json`

## 1. Production rule

Do not rewrite the MA02 Listening scripts while generating audio.

Runtime policy remains:

`PRODUCTION MP3 → browser playback → labelled browser-voice fallback only if production playback fails`

Until all four files pass content/audio QA and are wired into `MOCK_AUDIO.MA02`, MA02 must continue to display `Browser voice beta`.

No announcer introduction, question numbers, background music or sound effects should be added. The spoken wording must exactly match the canonical MA02 scripts.

## 2. Canonical output files

1. `ma02-listening-part1-printmaking-workshop-booking.mp3`
2. `ma02-listening-part2-observatory-visitor-orientation.mp3`
3. `ma02-listening-part3-local-history-digitisation-project.mp3`
4. `ma02-listening-part4-seed-banks-seed-storage.mp3`

All files belong in `media/audio/mock-tests/`.

Preferred delivery format follows the existing production asset convention:

- MP3;
- mono;
- 44.1 kHz;
- approximately 192 kbps;
- consistent loudness across Parts 1–4;
- no clipping.

## 3. Part 1 — Printmaking workshop booking

**Structure:** 2-speaker everyday conversation  
**Script length:** 204 words  
**Target duration:** about 90–105 s  
**Target pace:** about 138–148 wpm plus natural turn pauses  
**Turn pause:** roughly 0.2–0.4 s

### Voice direction

**Receptionist** — adult arts-centre receptionist; clear, efficient, friendly; natural British or neutral international English. Service information should be easy to follow but not over-articulated.

**Caller / Erin** — younger adult caller; clearly different voice; natural, responsive and conversational.

### Canonical generation prompt

Generate a natural two-speaker English conversation for an IELTS-style Listening practice test.

This must sound like a real arts-centre booking call, not text-to-speech, an audiobook, a language-learning demonstration, a radio advert, or a commercial voice-over.

Use the exact speaker turns in `ma02-production-audio-spec-v1.json` Part 1. Do not add, remove, paraphrase or reorder any words.

Delivery:

- natural connected speech;
- approximately 138–148 words per minute overall;
- about 90–105 seconds total;
- 0.2–0.4 second natural pauses between turns;
- no exaggerated pauses before answers;
- no announcer introduction;
- no background music or sound effects.

Important content QA:

- `D-W-Y-E-R` must be intelligible without robotic letter spacing;
- rejected `12th` versus chosen `26th` must be distinct;
- `Studio B` must clearly replace the old upstairs drawing room;
- `forty-two` standard fee must not be confused with `thirty-eight` member fee;
- `Thursday the 24th` and the waiting-list consequence must remain clear;
- `latex` and `nitrile` must remain distinct.

## 4. Part 2 — Observatory visitor orientation

**Structure:** 1-speaker everyday social monologue  
**Script length:** 257 words  
**Target duration:** about 110–125 s  
**Target pace:** about 132–142 wpm  
**Paragraph pause:** roughly 0.45–0.75 s

### Voice direction

**Guide** — adult observatory visitor guide; practical, calm and clear; natural British or neutral international English. Directional and safety information should be easy to follow but still sound like a real orientation.

### Canonical generation prompt

Generate a natural English visitor-orientation monologue for an IELTS-style Listening practice test.

Use the exact Part 2 wording in `ma02-production-audio-spec-v1.json`. Do not add headings, question cues or an introduction.

Delivery:

- approximately 132–142 wpm;
- about 110–125 seconds total;
- natural sentence rhythm;
- short 0.45–0.75 second pauses between source paragraphs;
- do not turn the sequence into slow instructional speech;
- no background music or effects.

Important content QA:

- orientation room is first after the ticket desk;
- sequence remains `red vest → equipment check → marked stairs`;
- public `west dome` versus closed `east dome` must be clear;
- cloud causes a `live demonstration`, decision about `fifteen minutes` before start;
- cafe closes at `eight-thirty`;
- sealed water is allowed upstairs, hot drinks are not;
- used vest goes to the basket beside the exit, not the original rack.

## 5. Part 3 — Local-history digitisation project

**Structure:** 3-speaker university tutorial discussion  
**Script length:** 256 words  
**Target duration:** about 110–125 s  
**Target pace:** about 136–146 wpm plus natural turn pauses  
**Turn pause:** roughly 0.2–0.4 s

### Voice direction

**Tutor** — adult university tutor; calm, analytical, natural British or neutral international English.

**Nina** — younger adult female student; engaged, thoughtful, conversational.

**Omar** — younger adult male student; clearly distinct from Tutor and Nina; natural and conversational.

### Canonical generation prompt

Generate a natural three-speaker English university tutorial conversation for an IELTS-style Listening practice test.

Use the exact Part 3 speaker turns in `ma02-production-audio-spec-v1.json`. Do not change wording or speaker assignment.

Delivery:

- approximately 136–146 wpm overall;
- about 110–125 seconds total;
- natural academic discussion rhythm;
- 0.2–0.4 second turn pauses;
- students should sound like they are discussing a real project, not reading prepared lines;
- no music, sound effects or announcer introduction.

Important content QA:

- nearly `nine hundred` letters is the full collection; `two hundred` is the sample;
- sampling is `every fourth letter after a random starting point`;
- permission concerns reproducing photographs online;
- if permission has not arrived by Friday, launch with text transcripts only;
- shared sample is used to compare disagreements and agree conventions;
- handwriting recognition is first draft only; every transcript still gets human checking;
- user test has `twelve` history-society volunteers because they are more likely archive users.

## 6. Part 4 — Seed banks and seed storage

**Structure:** 1-speaker academic monologue  
**Script length:** 307 words  
**Target duration:** about 128–145 s  
**Target pace:** about 136–145 wpm  
**Paragraph pause:** roughly 0.45–0.75 s

### Voice direction

**Lecturer** — adult academic lecturer; clear and engaged; natural British or neutral international English. Technical terms should be intelligible without sounding like a vocabulary demonstration.

### Canonical generation prompt

Generate a natural academic lecture extract for an IELTS-style Listening practice test.

Use the exact Part 4 wording in `ma02-production-audio-spec-v1.json`. Do not simplify, paraphrase or add definitions beyond the source script.

Delivery:

- approximately 136–145 wpm;
- about 128–145 seconds total;
- natural lecture phrasing and emphasis;
- 0.45–0.75 second paragraph pauses;
- technical vocabulary clear but not over-enunciated;
- no music, sound effects or announcer introduction.

Important content QA:

- `orthodox seeds` tolerate drying / low-temperature storage;
- `recalcitrant seeds` are damaged by excessive water loss;
- `desiccation` remains clearly defined as removal or loss of water;
- multiple parent plants/populations link to genetic diversity;
- `viability` is the periodic germination-test term;
- low germination may trigger regeneration;
- regeneration can shift genetic composition;
- seed banks cannot preserve ecological interactions and should complement habitat conservation.

## 7. If the TTS platform requires separate speaker files

For Parts 1 and 3, separate-speaker generation is allowed, but assembly must preserve:

- exact speaker order;
- exact wording;
- natural 0.2–0.4 s turn gaps;
- no duplicated or missing words at edit boundaries;
- consistent loudness and room character across voices.

Do not create one audio file per question. Each MA02 Part must remain one continuous playback asset.

## 8. Content QA before repository integration

For every part:

1. Compare the final spoken wording with the locked script.
2. Check every item in `criticalQa` from the JSON spec.
3. Confirm no answer-bearing correction/distractor was accidentally flattened.
4. Confirm duration falls near the target range without sounding artificially slow/fast.
5. Confirm no added intro, outro, music, effects or question numbering.
6. Confirm normal playback has no clipping, long dead air or abrupt edits.

## 9. Repository integration after approved MP3 files exist

Only after all four recordings pass content QA:

1. add files at the four canonical paths;
2. normalize/inspect format and duration;
3. compute exact file size and SHA-256;
4. add provenance/status records to `media/audio/manifest-v1.json`;
5. wire all four files into `MOCK_AUDIO.MA02`;
6. change MA02 copy from browser-voice beta to production-first + labelled fallback;
7. update `MA02.audioStatus` / source-policy wording only after the production gate is satisfied;
8. extend audio-manifest and mock-audio validations;
9. verify one-play Test Mode semantics;
10. deploy and verify the exact production files on GitHub Pages.

Browser speech synthesis remains fallback-only after production integration.

## 10. Automated preparation guard

Run:

```bash
node tests/validate-ma02-audio-prep-v112.mjs
```

The guard reconstructs all four canonical scripts from the production spec and requires exact equality with the current MA02 source. It also ensures the prep branch has not prematurely marked MA02 production-live.
