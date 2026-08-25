# ML03 / ML04 Production Audio Plan

Status: generation prep only. Do **not** mark either asset production-ready or production-live until the final MP3 exists, QA passes, runtime is wired, and deployed playback is verified.

Canonical source of truth: `mini-test-data-v3.js` on `main`.

## Shared production contract

- Natural IELTS-style Listening delivery, not audiobook / announcer / language-demo speech.
- British or neutral international English.
- Target pace: about 140–150 words per minute.
- Natural connected speech; numbers, times, prices, directions and dates must remain clear without over-articulation.
- No background music, sound effects or spoken speaker labels.
- Preserve canonical wording exactly. Splitting a long turn across generation blocks is allowed; rewriting is not.
- Natural pauses between dialogue turns: about 0.2–0.4 s.
- Final packaging after content QA: mono MP3, 44.1 kHz, 192 kbps.

---

# ML03 — Community Food Photography Workshop

Final filename:

`ml03-community-food-photography-workshop.mp3`

Reserved runtime path after QA:

`./media/audio/mini-tests/ml03-community-food-photography-workshop.mp3`

Canonical length: ~371 spoken words.

Target final duration: roughly 148–160 seconds.

## Voices

**Organiser**
- Adult community-centre organiser.
- Clear, efficient, friendly and practical.
- Natural British or neutral international English.
- Times, room directions and prices must be clear but not over-articulated.

**Participant**
- Adult participant.
- Clearly different voice from the Organiser.
- Curious, conversational and natural.
- Corrections and uncertainty should sound genuine rather than theatrical.

## Preferred generation method — Dialogue Generator

Use the same Organiser voice in every Organiser block and the same Participant voice in every Participant block.

The two long Organiser turns are split only to satisfy block-length limits; the wording remains canonical.

### Batch 1 — blocks 1–5

1. **Organiser**
   `Hello, Westbridge Community Centre. Are you calling about the Saturday food photography workshop?`
2. **Participant**
   `Yes. I downloaded the leaflet last week. It says the workshop begins at eleven, but the booking page now says ten thirty.`
3. **Organiser**
   `Ten thirty is correct. We brought it forward by half an hour because the tutor wants more time for the practical session.`
4. **Organiser**
   `Registration opens at ten fifteen, so please do not arrive before ten because another class will still be leaving.`
5. **Participant**
   `Fine. Is it still in Studio Three?`

### Batch 2 — blocks 6–10

6. **Organiser**
   `No, that room has a lighting problem. Go to Studio Five instead.`
7. **Organiser**
   `From the main entrance, take the stairs to the first floor, turn left at the reception desk, and Studio Five is the second door on your right, just after the kitchen.`
8. **Participant**
   `Do I need to bring a camera? I only have my phone with me this weekend.`
9. **Organiser**
   `A phone is enough. The tutor will demonstrate both phone and camera settings. What you do need is one small object or food item to photograph. We provide plates, backgrounds, lamps, and tripods.`
10. **Participant**
   `I was thinking of bringing a cake, but that may be difficult on the bus.`

### Batch 3 — blocks 11–15

11. **Organiser**
    `Something simple is better. Fruit, a cup, or even packaged food is fine. Avoid anything that needs refrigeration because there is no student fridge available.`
12. **Participant**
    `How much is the workshop? The leaflet says twenty-eight pounds.`
13. **Organiser**
    `That was the early price. The standard fee is thirty-two pounds now. However, community-centre members pay twenty-six. Are you a member?`
14. **Participant**
    `Yes, I joined in May.`
15. **Organiser**
    `Then it will be twenty-six pounds. Payment is online only. We used to accept card payments at reception, but we stopped doing that for weekend courses.`

### Batch 4 — blocks 16–20

16. **Participant**
    `Does the fee include lunch?`
17. **Organiser**
    `No lunch, but tea, coffee, and a light snack are included. There is a café downstairs if you want something more substantial during the break.`
18. **Participant**
    `And what happens after the workshop?`
19. **Organiser**
    `The tutor will email a short feedback sheet on Monday. Participants can also upload one photograph to a shared gallery, but that part is optional.`
20. **Participant**
    `Great. I’ll pay the member fee online this afternoon and bring some fruit to photograph.`

Generate four dialogue files, then concatenate in order. At the three batch seams, use only a natural ~0.25–0.35 s gap. Do not add an introduction or closing tone.

### If Dialogue Generator quota is unavailable

Use standard TTS with the same two selected voices and generate the 20 blocks individually. Preserve the voice assignment above. The final assembly step is identical and can be done after upload; the learner should not have to manually edit the audio.

## ML03 answer-bearing QA

The final recording must preserve these contrasts clearly:

- old start **11:00** → current start **10:30**
- registration **10:15**
- old room **Studio Three** → current room **Studio Five**
- route: first floor → left at reception → second door on right → after kitchen
- phone is sufficient; participant must bring **one small object or food item**
- old leaflet price **£28** → standard **£32** → this member pays **£26**
- payment is **online only**; reception card payment is an old arrangement
- no lunch; tea, coffee and light snack included
- final decision: pay member fee online + bring fruit

---

# ML04 — River-monitoring Field Briefing

Final filename:

`ml04-river-monitoring-field-briefing.mp3`

Reserved runtime path after QA:

`./media/audio/mini-tests/ml04-river-monitoring-field-briefing.mp3`

Canonical length: ~354 spoken words.

Target final duration: roughly 142–153 seconds.

## Voice

**Supervisor**
- Adult field-course supervisor.
- Clear, practical, calm and academically natural.
- British or neutral international English.
- This is a real pre-fieldwork briefing, not a documentary narration.
- Times, equipment requirements and deadlines must be clear without artificial slow speech.

## Standard TTS generation

Use one identical Supervisor voice for all three segments. Generate each segment separately, then concatenate with a natural ~0.25–0.40 s paragraph gap.

### Segment 1 — meeting + site sequence

`Before Thursday’s river-monitoring field project, I need to confirm the revised plan. The original schedule said we would meet at the science building at eight forty-five. We are still leaving campus at nine, but please meet outside the student centre at eight thirty-five instead. The science-building entrance is closed for electrical work.

The coach journey takes about forty minutes. When we arrive, Group A will begin at the upstream sampling point, while Group B starts near the footbridge. After the morning break the groups will exchange locations, so everyone completes both activities. Do not move between sites by yourself; wait for the field tutor to lead your group.`

### Segment 2 — equipment + morning task

`For equipment, the department provides water-testing kits, gloves, sample bottles, and clipboards. You need to bring a pencil, waterproof footwear, and a reusable drinking bottle. The old instruction sheet also listed safety glasses, but those are now supplied with the testing kits. Please do not bring your own chemical reagents.

The morning task is water-quality sampling. You will record temperature, acidity, and water clarity. We had planned to measure flow speed as well, but recent rain has made the river too fast for the student method we normally use, so that measurement has been removed.`

### Segment 3 — lunch + afternoon + submission

`Lunch is at the visitor centre from twelve forty to one twenty. Sandwiches are provided for students who selected a meal when they registered. If you did not order one, bring your own lunch. Tea and drinking water are available to everyone.

In the afternoon, each group will complete a habitat survey. You do not need to identify every plant species. Instead, record the percentage of the riverbank covered by vegetation and note any obvious signs of erosion. At two fifty, everyone returns to the visitor centre for a short comparison of results.

We expect the coach to leave at three thirty and reach campus at about four fifteen. If traffic is heavy, arrival may be closer to four thirty. Your field notes are not submitted on Thursday. Scan or photograph them and upload one PDF by six p.m. on Monday. The reflective paragraph is due separately on Wednesday.`

## ML04 answer-bearing QA

The final recording must preserve these contrasts clearly:

- old meeting: science building **8:45** → current meeting: student centre **8:35**
- campus departure remains **9:00**
- Group A upstream / Group B footbridge, then groups exchange after morning break
- learner brings pencil + waterproof footwear + reusable bottle
- safety glasses are now supplied
- flow-speed measurement was planned but removed
- lunch **12:40–1:20**; sandwiches only for pre-registered meal orders
- afternoon habitat survey: vegetation percentage + erosion signs
- results comparison **2:50**
- coach leaves **3:30**; expected campus arrival **4:15**, possibly **4:30**
- field notes: one PDF by **6 p.m. Monday**
- reflective paragraph: separately due **Wednesday**

---

# Post-generation workflow

After the raw files are supplied:

1. Inspect actual duration, codec, sample rate, channels, bitrate, clipping and silence.
2. Check every answer-bearing correction / number / direction against `mini-test-data-v3.js`.
3. Correct tempo only if clearly outside the intended natural range; do not change wording.
4. Assemble ML03 batches and ML04 segments.
5. Standardise final delivery to mono MP3, 44.1 kHz, 192 kbps.
6. Calculate SHA-256 and file size.
7. Add final MP3s under `media/audio/mini-tests/`.
8. Add ML03 / ML04 paths to `MINI_TEST_AUDIO` in `listening-media-v1.js`.
9. Update `media/audio/manifest-v1.json` as `production-ready` pending deployed verification.
10. Extend audio validators with actual file-size/checksum/duration contracts.
11. PR → full CI → browser smoke → merge.
12. Verify public playback; only then promote to `production-live`.
