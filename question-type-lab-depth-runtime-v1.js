import { LAB_DEPTH_LISTENING_SCRIPTS } from './question-type-lab-depth-v1.js';
import { playListeningMedia, stopListeningMedia } from './listening-media-v1.js';

export const LAB_DEPTH_AUDIO = {
  'QL01-B': './media/audio/question-type-labs/ql01-b-careers-session-room.mp3',
  'QL01-C': './media/audio/question-type-labs/ql01-c-market-visit.mp3',
  'QL02-B': './media/audio/question-type-labs/ql02-b-pottery-workshop-booking.mp3',
  'QL02-C': './media/audio/question-type-labs/ql02-c-coastal-survey-briefing.mp3',
  'QL03-B': './media/audio/question-type-labs/ql03-b-museum-route.mp3',
  'QL03-C': './media/audio/question-type-labs/ql03-c-workshop-room-directions.mp3',
  'QL04-B': './media/audio/question-type-labs/ql04-b-online-course-feedback.mp3',
  'QL04-C': './media/audio/question-type-labs/ql04-c-new-office-feedback.mp3',
  'QL05-B': './media/audio/question-type-labs/ql05-b-riverside-volunteers.mp3',
  'QL05-C': './media/audio/question-type-labs/ql05-c-field-notebook-submission.mp3',
  'QL06-B': './media/audio/question-type-labs/ql06-b-prototype-redesign.mp3',
  'QL06-C': './media/audio/question-type-labs/ql06-c-office-renovation-date.mp3'
};

function setStatus(key, text) {
  document.querySelectorAll(`[data-lab-depth-status="${key}"]`).forEach(node => {
    if (node.textContent !== text) node.textContent = text;
  });
}

async function handlePracticeAudio(button) {
  const key = button?.dataset?.labDepthAudio;
  const script = LAB_DEPTH_LISTENING_SCRIPTS[key];
  const src = LAB_DEPTH_AUDIO[key] || '';
  if (!key || !script) return;
  button.disabled = true;
  setStatus(key, 'Starting practice audio…');
  try {
    const result = await playListeningMedia({ src, script, lang:'en-GB', rate:.92 });
    setStatus(key, result.mode === 'synthetic'
      ? 'Browser voice practice · production MP3 pending'
      : 'Production MP3');
    button.textContent = '▶ Replay practice audio';
  } catch (error) {
    setStatus(key, error?.message || 'Practice audio is unavailable in this browser.');
  } finally {
    button.disabled = false;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-lab-depth-audio]');
    if (!button) return;
    event.preventDefault();
    handlePracticeAudio(button);
  });
  window.addEventListener?.('beforeunload', () => stopListeningMedia());
}
