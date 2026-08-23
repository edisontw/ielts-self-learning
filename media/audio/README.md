# Production Listening audio assets

This directory is the drop-in asset location for the production-first Listening media layer.

Runtime policy:

`PRODUCTION MP3 → browser playback → if unavailable, labelled browser-voice fallback`

## Production-live Mini Test audio

The following files are present in the repository and have owner-confirmed deployed playback:

- `mini-tests/ml01-research-skills-workshops.mp3`
- `mini-tests/ml02-community-photography-walk.mp3`

Their status, provenance, duration, format and SHA-256 values are recorded in [`manifest-v1.json`](manifest-v1.json).

The website uses these exact case-sensitive paths. ML01 and ML02 allow one successful playback per attempt and keep the transcript hidden until submission.

## Remaining production paths

Core / Placement files still to be produced and approved:

- `placement-listening.mp3`
- `l01-listen-for-meaning.mp3`
- `l02-connected-speech.mp3`
- `l03-listening-paraphrase.mp3`
- `l04-distractors.mp3`
- `l05-predict.mp3`

Until one of these files exists, the corresponding activity may use browser speech synthesis as a clearly labelled fallback.

## ML01 / ML02 preparation references

- `mini-tests/production-audio-spec-v1.json` — speaker turns, pause targets, pace/duration ranges and question-dependent correction/distractor timing.
- `../../docs/mini-test-production-audio-pack-v1.md` — generation prompts, voice direction, post-production QA and provenance requirements.

`tests/validate-mini-test-audio-prep.mjs` reconstructs both transcripts from the production segments and compares them with the current Mini Test scripts. `tests/validate-audio-manifest.mjs` verifies that both production MP3 files exist at the runtime paths and remain consistent with the manifest.

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
