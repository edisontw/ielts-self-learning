# Production Listening audio assets

This directory is the drop-in asset location for the production-first Listening media layer.

Runtime policy:

`PRODUCTION MP3 → browser playback → if unavailable, labelled browser-voice fallback`

## Production-live Mini Test audio

The following files are present in the repository and have owner-confirmed deployed playback:

- `mini-tests/ml01-research-skills-workshops.mp3`
- `mini-tests/ml02-community-photography-walk.mp3`

## Production-ready Mini Test audio

The following QA-approved files are present in the repository and wired to the Mini Test runtime, but remain `production-ready` until deployed public playback is verified:

- `mini-tests/ml03-community-food-photography-workshop.mp3`
- `mini-tests/ml04-river-monitoring-field-briefing.mp3`

Their status, provenance, duration, format and SHA-256 values are recorded in [`manifest-v1.json`](manifest-v1.json).

The website uses these exact case-sensitive paths. ML01 through ML04 allow one successful playback per attempt and keep the transcript hidden until submission.

## Remaining production paths

Core / Placement files still to be produced and approved:

- `placement-listening.mp3`
- `l01-listen-for-meaning.mp3`
- `l02-connected-speech.mp3`
- `l03-listening-paraphrase.mp3`
- `l04-distractors.mp3`
- `l05-predict.mp3`

Until one of these files exists, the corresponding activity may use browser speech synthesis as a clearly labelled fallback.

## Mini Test preparation references

- `mini-tests/production-audio-spec-v1.json` — ML01 / ML02 speaker turns, pause targets, pace/duration ranges and question-dependent correction/distractor timing.
- `mini-tests/ML03-ML04-PRODUCTION-PLAN.md` — ML03 / ML04 canonical generation blocks, speaker direction, duration targets and answer-bearing QA.
- `../../docs/mini-test-production-audio-pack-v1.md` — generation prompts, voice direction, post-production QA and provenance requirements for the earlier production pack.

`tests/validate-mini-test-audio-prep.mjs` reconstructs the ML01 / ML02 transcripts from the production segments and compares them with the current Mini Test scripts. `tests/validate-listening-media.mjs` enforces the ML01–ML04 runtime map. `tests/validate-audio-manifest.mjs` verifies that QA-approved production MP3 files exist at their runtime paths and match the manifest checksum, size and duration contracts.

## Production requirements

- Keep spoken wording aligned with the current lesson or Mini Test transcript.
- Use natural English pacing rather than deliberately slow teaching speech.
- Preserve corrections, distractors, hesitations and final decisions that the questions depend on.
- Mini Test recordings must be continuous; do not expose sentence-by-sentence playback controls.
- Avoid background music or effects that compete with speech.
- Export normal web-compatible MP3, normally from 44.1 kHz or 48 kHz source audio.
- Keep loudness consistent across files and avoid clipping.
- File names and directory case must match exactly because GitHub Pages paths are case-sensitive.

## Licensing and provenance

For every production file, record:

- creator or voice source;
- date created or received;
- licence or permission basis;
- whether synthetic voice was used;
- relevant editing and post-processing notes;
- deployed playback and content-approval status.

Do not add copyrighted commercial IELTS recordings or other third-party audio without permission.

## Accessibility and fallback

The media layer does not remove transcripts. Practice lessons may expose transcripts according to the lesson design; Test Mode continues to hide transcripts until submission.

If a production file fails, the runtime may attempt browser speech synthesis. If neither source is available, the UI reports that the recording cannot be played rather than consuming the learner's playback attempt.
