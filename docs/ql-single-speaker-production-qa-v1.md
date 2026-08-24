# QL Single-speaker Production Audio QA V1

Date: 2026-08-24

All files were checked against the canonical Question Type Lab scripts supplied for QL02-B, QL02-C, QL03-B, QL03-C, QL05-C, QL06-B and QL06-C.

## Processing summary

- Output format for every file: mono MP3, 44.1 kHz, 192 kbps.
- QL02-B: long synthetic sentence gaps were reduced while preserving the letter-by-letter spelling and wording.
- QL02-C: source pace was approximately 187 wpm; tempo reduced to 0.75x, final pace approximately 141 wpm.
- QL06-C: source pace was approximately 178 wpm; tempo reduced to 0.80x, final pace approximately 142 wpm.
- QL03-B, QL03-C, QL05-C and QL06-B: format standardisation only.
- No canonical wording, answer detail, date, direction, number or distractor was changed.

## Assets

| ID | File | Duration | Approx. pace | Size | SHA-256 | QA |
|---|---|---:|---:|---:|---|---|
| QL02-B | `ql02-b-pottery-workshop-booking.mp3` | 19.54 s | 138 wpm after pause adjustment | 469620 | `ea19df7085e7c91ce3e23c879d5306b21f4e748382f4b1654b55b6f7a8c8ea35` | Passed; Mercer spelling, 18 September, 10:15, 10:00 and £22 retained |
| QL02-C | `ql02-c-coastal-survey-briefing.mp3` | 17.03 s | 141 wpm | 409434 | `be5c134b3444fdfb178d1ee773f6d3e8a4a0dd46ff0e1f4dd80dfbaf93c10993` | Passed after tempo correction; west gate, 7:45 and 8 sharp retained |
| QL03-B | `ql03-b-museum-route.mp3` | 19.96 s | 142 wpm | 479651 | `7364156e262ead2ac33fd411f21ad821f66e23099b26c0c488ac725adef41f6a` | Passed; left/right, opposite and beyond sequence retained |
| QL03-C | `ql03-c-workshop-room-directions.mp3` | 21.73 s | 144 wpm | 522283 | `99a22996247fc29385034cfc037eda6233c11e4f2580d66ee811f907d2572625` | Passed; glass doors, left turn, emergency exit and staff-room distractor retained |
| QL05-C | `ql05-c-field-notebook-submission.mp3` | 18.34 s | 138 wpm | 440781 | `515ca560dddbec109cb3ea9313e9cb6165327312ac623db98acf339b3ce4024c` | Passed; 23rd, 12 pages, PDF and Friday 4 p.m. retained |
| QL06-B | `ql06-b-prototype-redesign.mp3` | 14.11 s | 145 wpm | 339216 | `76726cca91e60cf37a44f7521f526b1ad42ceeb647b8044f7ad28b0a5236bcfc` | Passed; brittle material, failed thickness attempt and flexible outer layer retained |
| QL06-C | `ql06-c-office-renovation-date.mp3` | 19.38 s | 142 wpm | 465858 | `84ae544affe03a812dd48577adfb6adefa9aea013cf59b5bc021c28ec635abce` | Passed after tempo correction; April, May, 12th and Monday 15 May retained |

## Duration notes

QL02-B and QL03-B are within rounding tolerance of their original planning ranges. QL02-C and QL06-B are shorter than the planning estimates, but are accepted because their final speech rates are natural and all canonical content is complete. Planning duration is not used as a reason to introduce artificial silence.

## Batch completion

This batch completes the seven single-speaker assets and brings the Question Type Lab production-audio set to 12 of 12 files. Repository files remain `production-ready` until deployed playback is independently verified.
