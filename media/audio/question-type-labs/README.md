# Question Type Lab production audio

Production MP3 directory for V1.3 Listening depth sets.

All 12 Set B / Set C Question Type Lab production files now exist:

- `ql01-b-careers-session-room.mp3`
- `ql01-c-market-visit.mp3`
- `ql02-b-pottery-workshop-booking.mp3`
- `ql02-c-coastal-survey-briefing.mp3`
- `ql03-b-museum-route.mp3`
- `ql03-c-workshop-room-directions.mp3`
- `ql04-b-online-course-feedback.mp3`
- `ql04-c-new-office-feedback.mp3`
- `ql05-b-riverside-volunteers.mp3`
- `ql05-c-field-notebook-submission.mp3`
- `ql06-b-prototype-redesign.mp3`
- `ql06-c-office-renovation-date.mp3`

`question-type-lab-depth-runtime-v1.js` attempts these production paths first and uses the labelled browser-voice practice mode only if an MP3 cannot be played.

Generation prompts, roles, target durations and canonical scripts are in `docs/question-type-lab-production-audio-v1.md`.

Technical metadata, checksums, provenance and QA status are registered in `media/audio/manifest-v1.json`. Assets remain `production-ready` until deployed playback is independently verified; do not mark them `production-live` only because the file exists in the repository.
