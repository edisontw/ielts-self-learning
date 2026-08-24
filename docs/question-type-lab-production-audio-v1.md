# Question Type Lab Production Audio V1

This pack prepares production MP3 for the 12 Listening depth sets added in V1.3.

For the current TTSMaker-specific click-by-click workflow, including the free-plan strategy and exact QL01-B/C dialogue blocks, see [`ttsmaker-question-type-lab-workflow-v1.md`](ttsmaker-question-type-lab-workflow-v1.md).

Runtime policy:

`PRODUCTION MP3 → if unavailable, LABELLED BROWSER-VOICE FALLBACK`

The canonical scripts remain in `question-type-lab-depth-v1.js#LAB_DEPTH_LISTENING_SCRIPTS`. Do not replace them with automatic transcription.

## Shared generation specification

Generate natural IELTS-style English listening practice audio. It must sound like a real conversation, briefing, interview, lecture excerpt, or workplace exchange — not text-to-speech, an audiobook, newsreading, a language-learning demonstration, or a commercial voice-over.

Delivery:
- natural British or neutral international English;
- approximately 140–150 words per minute;
- normal connected speech and contractions where appropriate;
- numbers, dates, spelling and directions clear but not unnaturally over-articulated;
- natural pauses between turns, roughly 0.2–0.4 seconds;
- no long artificial pauses;
- no background music;
- no sound effects;
- no announcer introduction;
- do not read speaker labels aloud;
- preserve the canonical wording exactly enough that every answer remains valid;
- mono MP3 preferred; 44.1 kHz / 192 kbps is the current production convention.

For two- or three-speaker clips, use clearly different adult voices. Avoid exaggerated acting. For monologues, use one natural adult voice appropriate to the role.

## Asset plan

| ID | File | Format | Roles | Target duration |
|---|---|---|---|---:|
| QL01-B | `ql01-b-careers-session-room.mp3` | 2-speaker conversation | Advisor / Student | 22–32 s |
| QL01-C | `ql01-c-market-visit.mp3` | 2-speaker conversation | Mina / Ravi | 22–32 s |
| QL02-B | `ql02-b-pottery-workshop-booking.mp3` | service monologue | Receptionist | 20–28 s |
| QL02-C | `ql02-c-coastal-survey-briefing.mp3` | briefing monologue | Guide | 18–27 s |
| QL03-B | `ql03-b-museum-route.mp3` | directions monologue | Guide | 20–30 s |
| QL03-C | `ql03-c-workshop-room-directions.mp3` | directions monologue | Host | 20–30 s |
| QL04-B | `ql04-b-online-course-feedback.mp3` | 3-speaker comments | Speaker 1 / 2 / 3 | 28–40 s |
| QL04-C | `ql04-c-new-office-feedback.mp3` | 3-speaker conversation | Aisha / Ben / Cara | 22–34 s |
| QL05-B | `ql05-b-riverside-volunteers.mp3` | interview | Interviewer / Coordinator | 18–28 s |
| QL05-C | `ql05-c-field-notebook-submission.mp3` | tutorial monologue | Tutor | 16–24 s |
| QL06-B | `ql06-b-prototype-redesign.mp3` | academic monologue | Lecturer | 17–26 s |
| QL06-C | `ql06-c-office-renovation-date.mp3` | workplace monologue | Manager | 17–26 s |

All files go under `media/audio/question-type-labs/`.

## Per-asset prompts and canonical scripts

### QL01-B — Careers session room

Use the shared specification above. Two adult speakers with clearly different voices.

- Advisor: calm, practical, slightly more formal.
- Student: natural, collaborative, decisive at the end.
- The lecture theatre is a plausible first option but is rejected; make the correction sound natural rather than theatrical.

Script:

> Advisor: We could hold the careers session in the lecture theatre; it has plenty of seats. Student: I thought so too, but the theatre is being used for exams that afternoon. Advisor: Right. The seminar room is available, though it only holds forty people. Student: That should be enough. Last year only thirty-two attended, so let's book the seminar room.

### QL01-C — Market visit

Use the shared specification above. Two adult speakers with clearly different voices.

- Mina: thoughtful, initially leaning toward the river walk.
- Ravi: conversational and practical.
- The final market decision should emerge naturally after rejecting the earlier options.

Script:

> Mina: I nearly chose the river walk because it starts close to the hotel. Ravi: The forecast says heavy rain, though. The museum tour is indoors, but we've already been there. Mina: True. What about the market visit? Ravi: It doesn't start until eleven, which gives us time for breakfast. Mina: Good point. Let's do the market visit.

### QL02-B — Pottery workshop booking

Use the shared specification above. One adult receptionist voice: efficient, friendly, natural service tone. Spell M-E-R-C-E-R distinctly but without exaggerated pauses. Make the date, arrival time and £22 materials fee clear.

Script:

> Receptionist: I have your booking here. The family name is Mercer, M-E-R-C-E-R. You're joining the pottery workshop on the eighteenth of September. It starts at ten fifteen, but please arrive by ten o'clock to collect an apron. The materials fee is twenty-two pounds, payable at reception.

### QL02-C — Coastal survey briefing

Use the shared specification above. One adult guide voice: clear, practical field-trip briefing. Keep 7:45 and 8:00 distinct.

Script:

> Guide: For tomorrow's coastal survey, meet beside the west gate at seven forty-five. Bring a pencil and a reusable water bottle. We provide the measuring equipment. The coach leaves at eight sharp, and lunch will be available at the visitor centre.

### QL03-B — Museum route

Use the shared specification above. One adult guide voice. Directions should be easy to follow but use normal connected speech; do not insert artificial gaps between each instruction.

Script:

> Guide: Start at the main entrance. Walk straight ahead until you reach the fountain. Turn left there and pass the café on your right. The information desk is the next room on the left, directly opposite the small gallery. The accessible lift is just beyond the information desk.

### QL03-C — Workshop room directions

Use the shared specification above. One adult host voice. Keep the route continuous. Slightly stress the contrast in the final sentence so the staff-room distractor is audible but not overacted.

Script:

> Host: From reception, take the corridor on your right. Go past Room A and continue to the glass doors. Immediately after the doors, turn left. The workshop room is at the end of that short corridor, beside the emergency exit. Do not use the room opposite the kitchen; that is the staff room.

### QL04-B — Online course feedback

Use the shared specification above. Three clearly different adult voices. Each comment should sound like an individual participant responding to the same course evaluation.

- Speaker 1: organised, appreciates deadlines.
- Speaker 2: wants more live tutor interaction.
- Speaker 3: wants examples relevant to small community organisations.

Script:

> Speaker 1: I liked the course content, but what really helped me was having a weekly deadline. Without that structure, I would have postponed the exercises. Speaker 2: The deadlines were fine for me. My main difficulty was that I couldn't ask questions in real time. I wanted more live contact with the tutor. Speaker 3: I didn't need more tutor contact, but the examples were mostly from large companies. I wanted cases closer to small community organisations.

### QL04-C — New office feedback

Use the shared specification above. Three clearly different adult workplace voices. Keep the contrast between each person's priority natural.

Script:

> Aisha: The new office is quieter than the old one, which is useful, but the biggest improvement is the natural light. Ben: I notice the light too, but for me the important change is the shorter journey. Cara: My journey is actually longer now. What I value is having several small meeting rooms instead of one large shared space.

### QL05-B — Riverside Park volunteers

Use the shared specification above. Two adult voices.

- Interviewer: neutral, concise questions.
- Coordinator: friendly, practical, gives exact details clearly.

Script:

> Interviewer: What should volunteers bring on the first day? Coordinator: Just photo identification. We provide gloves, tools and drinking water. Interviewer: And where do they meet? Coordinator: At the north entrance to Riverside Park, next to the bicycle racks. Please arrive by eight twenty.

### QL05-C — Field notebook submission

Use the shared specification above. One adult tutor voice: calm academic instruction. Keep Monday the 23rd, twelve pages and Friday 4 p.m. distinct.

Script:

> Tutor: The field notebook is due on Monday the twenty-third. Submit it online as a single PDF. The maximum length is twelve pages, not including the reference list. If you have technical problems, email the course office before four p.m. on Friday.

### QL06-B — Prototype redesign

Use the shared specification above. One adult lecturer voice: natural academic explanation, not a formal newsreader. The progression must be clear: brittle material → thicker material rejected → flexible outer layer succeeds.

Script:

> Lecturer: The earliest prototypes failed mainly because the material became brittle in cold conditions. Engineers first tried increasing its thickness, but that added too much weight. The successful redesign used a flexible outer layer instead.

### QL06-C — Office renovation date

Use the shared specification above. One adult manager voice: practical workplace update. Make the sequence April → May → desks on the 12th → staff return Monday the 15th easy to follow without over-emphasising the numbers.

Script:

> Manager: We initially expected the renovation to finish in April. A delay in electrical work moved the date to May, and then the supplier confirmed that the new desks would arrive on the twelfth. So staff will return to the office on Monday the fifteenth of May.

## Upload and QA workflow

For each completed MP3:

1. Rename it exactly to the filename above.
2. Upload it to `media/audio/question-type-labs/`.
3. Confirm the deployed page plays the production MP3 instead of the browser-voice fallback.
4. Check that all numbers, names, corrections, directions and final decisions match the canonical script.
5. Record technical metadata, checksum, provenance and QA in the production manifest only after the file exists.
6. Keep browser voice as a labelled fallback if the production file cannot load.
