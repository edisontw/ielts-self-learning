# Question Type Lab + Mini Test V1

## Status

The IELTS practice layer now has three deliberately separate levels:

1. **30-unit core curriculum** — skill development, Learning Better, repair, and IELTS strategy.
2. **Question Type Lab** — one exam decision at a time, in Practice Mode.
3. **Mini Test** — mixed transfer under Test Mode constraints.

This separation prevents the site from turning every lesson into a test bank.

## Question Type Lab — 12 units

### Reading

- `QR01` True / False / Not Given
- `QR02` Matching Headings
- `QR03` Reading Multiple Choice
- `QR04` Sentence Completion
- `QR05` Matching Information
- `QR06` Summary Completion

### Listening

- `QL01` Multiple Choice / distractors
- `QL02` Form & Notes Completion
- `QL03` Map & Plan Labelling
- `QL04` Matching
- `QL05` Short Answer
- `QL06` Sentence Completion

Labs use the normal lesson renderer and therefore retain:

`LEARN → GUIDED PRACTICE → CHECK → EXPLANATION → ERROR TAG → REPAIR → RETRY → REVIEW`

Lab completion is **not** included in the fixed 30-unit core completion count. Checked lab questions can still contribute Reading/Listening observed-performance evidence.

## Mini Test V1

### `MR01` Reading Mini Test 01

- 12 questions
- 12-minute timer
- mixed TFNG, multiple choice, matching-information, completion, structure and main-idea decisions
- one submission before answer review
- full passage remains visible during the test

### `ML01` Listening Mini Test 01

- 10 questions
- 9-minute timer
- one browser-speech prototype playback
- transcript hidden until submission
- mixed distractor, correction, detail, paraphrase, prediction, number and final-decision questions

Browser speech synthesis remains prototype media and must be replaced by production-quality recorded/licensed audio before public release.

## Test Mode rules

During an active Mini Test:

- no per-question answer checking
- no rationale
- no transcript for Listening
- no hints
- timer remains visible
- unanswered items count as incorrect
- submission ends the attempt

After submission:

- diagnostic raw score is shown
- score is explicitly **not an IELTS band estimate**
- every item exposes answer + rationale + error tag
- Listening transcript becomes available for review
- missed items can be copied into the existing Error Notebook
- submitted question results are written to the existing checked-answer store, allowing the observed Reading/Listening profile to update through the normal runtime

## Data integration

Mini Test history is stored under local adaptive state:

`ielts-adaptive-v1.miniTestHistory`

Submitted question answers use the existing core state:

`ielts-self-learning-v1.lessonAnswers`

Missed questions saved for repair use the existing:

`ielts-self-learning-v1.errors`

No separate scoring profile is created.

## Next expansion

Recommended next layer:

1. add a second Reading Mini Test and second Listening Mini Test after real usage reveals whether MR01/ML01 timing and difficulty are appropriate;
2. build the 4 / 8 / 12 / 16-week Study Plan engine using placement, observed answers, productive retry evidence, review due dates, available time, Labs and Mini Tests;
3. add stronger return-from-AI revision logging for Writing/Speaking;
4. replace synthetic Listening speech with production media;
5. perform deployed mobile/desktop interaction QA.
