# Production Listening audio assets

This directory is the drop-in asset location for the production-first Listening media layer.

The runtime policy is:

`PRODUCTION AUDIO → browser playback → if unavailable, browser-voice fallback`

No code change is required when a production MP3 is added at one of the paths below.

## Current asset paths

Core / Placement:

- `placement-listening.mp3`
- `l01-listen-for-meaning.mp3`
- `l02-connected-speech.mp3`
- `l03-listening-paraphrase.mp3`
- `l04-distractors.mp3`
- `l05-predict.mp3`

Mini Tests:

- `mini-tests/ml01-research-skills-workshops.mp3`
- `mini-tests/ml02-community-photography-walk.mp3`

Until a file exists, the website may use browser speech synthesis as a clearly labelled prototype fallback.

## ML01 / ML02 production preparation pack

Before generating or recording the two Mini Test assets, use:

- `mini-tests/production-audio-spec-v1.json` — machine-readable speaker turns, pause targets, pace/duration ranges, and question-dependent correction/distractor timing.
- `../../docs/mini-test-production-audio-pack-v1.md` — platform-agnostic generation prompts, voice direction, post-production QA, runtime checks, and provenance requirements.

`tests/validate-mini-test-audio-prep.mjs` reconstructs both transcripts from the production segments and compares them with the current Mini Test source scripts. This prevents the production-audio specification from silently drifting away from the questions.

## Production requirements

- Keep the spoken wording aligned with the current lesson / Mini Test transcript.
- Use natural English pacing rather than deliberately slow teaching speech.
- Preserve corrections, distractors, hesitations and final decisions that the questions depend on.
- Mini Test recordings should be one continuous recording; do not expose sentence-by-sentence playback controls.
- Avoid loud background music or effects that compete with speech.
- Export MP3 using normal web-compatible settings. A 44.1 kHz or 48 kHz source and a sensible speech bitrate are sufficient.
- Check loudness consistency across files before release.
- File names and directory case must match exactly because GitHub Pages paths are case-sensitive.

## Licensing / provenance

For every production file, record its provenance before public release:

- creator / voice source;
- date created;
- licence or permission basis;
- whether synthetic voice was used;
- editing / post-processing notes when relevant.

Do not add copyrighted commercial IELTS recordings or other third-party audio without permission.

## Accessibility and fallback

The media layer does not remove transcripts. Practice lessons may expose transcripts according to the lesson design; Test Mode continues to hide transcripts until submission.

If a production file fails to load, the runtime attempts browser speech synthesis. If neither is available, the UI reports that the recording cannot be played rather than pretending the attempt was completed.
