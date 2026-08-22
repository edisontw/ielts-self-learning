# ML01 / ML02 Production Audio Preparation Pack V1

This pack prepares the two Listening Mini Tests for production-quality audio while keeping the current Test Mode logic unchanged.

Source scripts:

- `ML01` → `mini-test-data-v1.js`
- `ML02` → `mini-test-data-v2.js`

Machine-readable recording specification:

- `media/audio/mini-tests/production-audio-spec-v1.json`

Final drop-in files:

- `media/audio/mini-tests/ml01-research-skills-workshops.mp3`
- `media/audio/mini-tests/ml02-community-photography-walk.mp3`

Once either MP3 exists at the exact path, the production-first media layer uses it automatically. Browser speech synthesis remains fallback only.

## Production principle

The recordings should sound like normal adult conversations, not language-learning dictation.

The answer should be recoverable from meaning, but answer words must not be artificially highlighted. Distractors, old information, corrections, numbers, and rejected options need to remain fully audible and plausible.

The spoken wording is locked to the current Mini Test transcript. Do not add an introduction such as “You will now hear…”, do not read speaker names, do not repeat key details, and do not add an outro.

## Shared voice direction

- Natural adult English.
- Clear but normal connected speech.
- No deliberately slow teaching pace.
- Two clearly distinguishable speakers per recording.
- Neutral British or broadly international English is appropriate for this first production set.
- Do not imitate or clone a named real person.
- Keep numbers, room names, days, direction words, corrections, and contrast markers intelligible.
- Avoid exaggerated acting, dramatic emotion, radio-announcer delivery, or synthetic over-enunciation.
- No background music.
- If subtle room tone is added, it must never interfere with speech.

Recommended turn gap: about **180–450 ms**. A genuine topic transition may be slightly longer, but avoid long dead air.

## ML01 — Research Skills Workshops

### Target

- Approx. script length: **272 words**.
- Target pace: **138–148 words/minute**.
- Target finished duration: approximately **112–124 seconds**.
- Voices:
  - **Advisor** — adult university academic-skills advisor; calm, clear, professional.
  - **Student / Maya** — young adult postgraduate student; engaged, conversational, clearly distinct from Advisor.

### Critical test-design moments

1. **Monday → Wednesday change of mind**
   - Monday must initially sound like a genuine earlier choice.
   - The change after “but” should be natural, not over-signalled.
   - Wednesday is the final current preference.

2. **Training Room B / old Room A**
   - Room B is current.
   - Room A is old information but must remain fully audible as a plausible distractor.

3. **Wednesday laptop / Friday laptop**
   - Wednesday: laptop not required; computers provided.
   - Friday: laptop required for software installation.
   - Preserve the contrast around “though”.

4. **Free / old £10 fee**
   - Current cost is free.
   - £10 is genuine historical information and must not be mumbled or skipped.
   - “used to” and “removed this year” should remain naturally intelligible.

5. **Online registration / 24 seats**
   - The causal link is important: register because capacity is limited.

6. **One journal article / uncertain article**
   - Required item: one journal article.
   - An uncertain article is especially useful for the exercise.

7. **Tuesday repeat**
   - Following Tuesday morning is the fallback if Wednesday is full.
   - “Don’t book both” must be clear but not shouted.

### Platform-agnostic generation prompt

Use this together with the exact ML01 `segments` in `production-audio-spec-v1.json`:

> Generate one continuous, natural two-speaker university conversation for an IELTS-style Listening Mini Test. Use two clearly different adult voices. Advisor: calm, professional, helpful, neutral British or broadly international English. Maya: young adult postgraduate student, engaged and conversational. Target 138–148 words per minute and approximately 112–124 seconds total. Use normal connected speech and short natural turn gaps. Do not read speaker labels. Do not add an introduction, repeat information, paraphrase the script, explain anything, or add an outro. Keep all wording exactly as supplied. Preserve the natural distractors and corrections: Monday before Wednesday becomes the preferred workshop; Training Room B before mentioning old Room A; no laptop for Wednesday but laptop for Friday; workshops are free although an old £10 fee is mentioned; online registration because there are 24 seats; one journal article with an uncertain article described as useful; Tuesday morning as the repeat session. Do not exaggerate answer words. No music or distracting sound effects. Produce clean speech suitable for one-play Test Mode.

## ML02 — Community Photography Walk

### Target

- Approx. script length: **345 words**.
- Target pace: **140–150 words/minute**.
- Target finished duration: approximately **138–153 seconds**.
- Voices:
  - **Coordinator** — adult community-event coordinator; friendly, efficient, clear.
  - **Participant** — adult participant; curious, conversational, clearly distinct from Coordinator.

### Critical test-design moments

1. **9:30 → 10:00 correction + 15-minute early arrival**
   - The poster’s 9:30 must sound plausible.
   - The website’s 10:00 is confirmed as current.
   - Registration arrival is about 15 minutes early.

2. **Gallery entrance → fountain**
   - The participant suggests the gallery entrance.
   - The coordinator rejects it naturally because the entrance is being repaired.
   - Current meeting point: beside the fountain in Market Square.

3. **Route sequence**
   - straight along King Street → library on the left → turn right immediately after pharmacy.
   - Read as natural directions, not a slow list.

4. **2.5 hours / old 3 hours**
   - Current duration is about two and a half hours.
   - Three hours is the original plan.
   - Reason for change: riverside construction narrowed the path.

5. **Phone sufficient**
   - Expensive camera is a plausible question but not required.
   - A phone is fine.

6. **£12 / student £8**
   - Both prices need equal clarity.
   - £12 is standard, £8 is student fee with valid student card.

7. **Online / card / cash**
   - Online guarantees a place.
   - Card may be accepted Saturday if spaces remain.
   - Cash is not accepted.

8. **Light rain / severe weather**
   - Light rain does not cancel.
   - Severe weather triggers an 8:00 email and an indoor gallery session.

9. **Final decision**
   - Last line must end naturally on: booking online that evening.
   - Do not add any speech afterward.

### Platform-agnostic generation prompt

Use this together with the exact ML02 `segments` in `production-audio-spec-v1.json`:

> Generate one continuous, natural two-speaker phone-style conversation for an IELTS-style Listening Mini Test. Use two clearly different adult voices. Coordinator: friendly, efficient, clear, neutral British or broadly international English. Participant: adult, curious and conversational. Target 140–150 words per minute and approximately 138–153 seconds total. Use normal connected speech and short natural turn gaps. Do not read speaker labels. Do not add an introduction, repeat information, paraphrase the script, explain anything, or add an outro. Keep all wording exactly as supplied. Preserve every correction and distractor naturally: poster 9:30 before current 10:00; arrive 15 minutes early; gallery entrance before the corrected fountain meeting point; route sequence after the library and pharmacy; current 2.5-hour walk before old 3-hour plan; phone sufficient rather than expensive camera; £12 standard fee before £8 student fee; online and card accepted while cash is rejected; light rain versus severe-weather indoor fallback; final decision to book online tonight. Do not exaggerate answer words. No music or distracting sound effects. Produce clean speech suitable for one-play Test Mode.

## If the generation platform supports only one voice per request

Generate each speaker turn as a separate clean stem using the voice assignment in the JSON specification, then concatenate in the exact segment order.

Requirements after concatenation:

- no missing or duplicated words;
- no speaker labels;
- no crossfades that cut consonants;
- no turn gap over about 700 ms unless deliberately justified;
- no audible loudness jump between voices;
- no accidental repeated sentence at a join;
- final file is one continuous MP3.

Do not generate one long file with a single voice if a reliable two-speaker workflow is available; speaker separation is part of the listening context.

## Post-production QA checklist

Before adding an MP3 to `main`, verify all of the following.

### Script integrity

- Spoken wording matches the current Mini Test script exactly.
- No speaker label is spoken.
- No added instruction, intro, countdown, explanation, or outro.
- No line is repeated.
- No number, day, room, place, price, or negative word is missing.

### Distractor integrity

ML01:

- Monday and Wednesday are both audible.
- Room B and old Room A are both audible.
- Wednesday and Friday laptop requirements remain distinct.
- “free” and old “ten pounds” both remain clear.
- “twenty-four seats” is not lost.
- Tuesday repeat and “Don’t book both” remain clear.

ML02:

- 9:30, 10:00, and 15 minutes remain distinct.
- Gallery entrance and fountain remain distinct.
- Route order remains unchanged.
- 2.5 hours and old 3 hours remain distinct.
- £12 and £8 remain distinct.
- Online, card, and cash conditions remain distinct.
- Light rain and severe weather conditions remain distinct.
- Final booking decision remains the final spoken information.

### Audio quality

- Natural pace, not slowed for learners.
- No clipping, pumping, obvious synthetic glitches, or abrupt edit joins.
- Consistent loudness between speakers and between ML01 / ML02.
- Consonants remain intelligible on laptop and phone speakers.
- No background sound masks answer-bearing details.
- File starts promptly and ends cleanly.

### Runtime check

After committing the MP3:

1. Open the corresponding Mini Test.
2. Confirm the UI reports **Production audio asset** rather than browser fallback.
3. Confirm playback starts once and the one-play button becomes unavailable only after successful playback starts.
4. Submit the test and confirm transcript appears only after submission.
5. Retake and confirm a fresh attempt again has one playback.
6. Temporarily test with the file unavailable and confirm browser-voice fallback still works.

## Provenance record

For each final file, record before public release:

- generation / recording tool;
- voice source or performer;
- date produced;
- synthetic / human status;
- licence or permission basis;
- editing software and material processing notes;
- final duration;
- final sample rate / bitrate.

Do not use copyrighted commercial IELTS recordings or clone a real person’s voice without permission.
