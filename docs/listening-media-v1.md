# Listening Media V1 — Production-first audio

## Purpose

Replace the prototype assumption that browser speech synthesis is the primary Listening source.

The media policy is now:

`PRODUCTION FILE FIRST → FALL BACK ONLY IF NEEDED → KEEP TRANSCRIPT RULES UNCHANGED`

The change is deliberately isolated from scoring, answer checking, Error Notebook and Study Plan logic.

## Runtime files

### `listening-media-v1.js`

Shared media controller for normal lesson audio, Placement audio and Mini Test playback.

Responsibilities:

- prefer HTML Audio when a production `src` is available;
- fall back to browser `speechSynthesis` only after production playback is unavailable;
- expose one shared stop function for HTML Audio and synthetic speech;
- attach fallback controls to lesson / Placement `<audio>` elements only after an audio error;
- map current Mini Test production asset paths;
- keep fallback scripts for the existing L01–L05 and Placement recordings.

### `mini-test-audio-upgrade-v1.js`

Progressive enhancement for the existing Mini Test Test Mode runtime.

It does not replace Mini Test scoring or submission. It intercepts only the Listening playback control and:

1. records the active Listening Mini Test ID;
2. attempts its production MP3;
3. falls back to the existing test script through browser speech if the MP3 cannot play;
4. enforces one successful playback per test attempt;
5. stops either media source when the learner submits, exits, retakes or changes route;
6. changes old prototype wording to production-first wording in the rendered UI.

The underlying `mini-test-runtime-v1.js` continues to own:

- timer;
- question state;
- one submission;
- answer persistence;
- Mini Test history;
- Error Notebook transfer;
- transcript reveal after submission.

## Asset contract

See [`../media/audio/README.md`](../media/audio/README.md).

Current production targets:

- Placement: `media/audio/placement-listening.mp3`
- Core Listening lessons: `media/audio/l01...l05...mp3`
- `ML01`: `media/audio/mini-tests/ml01-research-skills-workshops.mp3`
- `ML02`: `media/audio/mini-tests/ml02-community-photography-walk.mp3`

A file can be added later without changing lesson JSON or Test Mode code as long as the target path remains the same.

## Practice-mode behaviour

Existing lesson `<audio>` elements remain normal browser audio controls.

When the production MP3 loads:

- the production player remains visible;
- no synthetic fallback button is shown.

When the production MP3 errors:

- the broken audio control is hidden;
- a clearly labelled browser-voice fallback appears;
- the learner is told that the fallback is not production IELTS audio.

This avoids showing two competing playback choices when the real audio is available.

## Placement behaviour

Placement currently uses the same production-first asset path and fallback controller.

The transcript remains hidden during Placement according to the existing placement UI. If neither production audio nor browser speech is available, the interface reports the missing capability rather than silently marking audio as played.

## Mini Test behaviour

Listening Mini Tests continue to use one successful playback per attempt.

The playback button is disabled only after one of these actually starts:

- production MP3;
- browser-voice fallback.

If both fail, the button becomes available again so the learner is not charged an attempt for a technical failure.

The source label reports either:

- `Production audio asset`, or
- `Browser voice fallback · not production IELTS audio`.

The transcript remains hidden until Mini Test submission.

## Non-goals

This milestone does not:

- claim that the current repository already contains production-quality recordings;
- create or licence third-party IELTS recordings;
- change Mini Test difficulty or scoring;
- estimate IELTS bands from audio performance;
- add waveform editing or server-side media processing;
- upload user microphone recordings.

## Release QA

Validation should prove:

- successful production playback never invokes speech synthesis;
- failed production playback falls back to synthetic speech when available;
- complete media failure does not falsely count as a playback;
- ML01 and ML02 production paths are stable;
- lesson fallback controls remain hidden until an audio error;
- Mini Test playback interception occurs before the legacy speech path;
- the old `audio-fallback.js` script is not loaded;
- Test Mode timer / submit / transcript rules remain owned by the existing runtime.

## Next production step

Create or source the actual audio files one by one, beginning with:

1. `ML01`
2. `ML02`
3. Placement
4. L01–L05

For each file, check transcript alignment, natural pacing, distractor timing, loudness and mobile playback before declaring it production-ready.
