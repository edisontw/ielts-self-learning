# Question Type Lab production audio

Production MP3 target directory for V1.3 Listening depth sets.

Expected files:

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

Until a file exists, `question-type-lab-depth-runtime-v1.js` attempts the production path and then falls back to the labelled browser-voice practice mode.

Generation prompts, roles, target durations and canonical scripts are in `docs/question-type-lab-production-audio-v1.md`.

After each MP3 is uploaded and deployed, verify playback and then register technical metadata/checksum/provenance in the production audio manifest. Do not mark an asset `production-live` before the file exists and playback has been checked.
