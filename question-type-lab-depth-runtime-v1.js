import { LAB_DEPTH_LISTENING_SCRIPTS } from './question-type-lab-depth-v1.js';
import { playListeningMedia, stopListeningMedia } from './listening-media-v1.js';

function setStatus(key, text) {
  document.querySelectorAll(`[data-lab-depth-status="${key}"]`).forEach(node => {
    if (node.textContent !== text) node.textContent = text;
  });
}

async function handlePracticeAudio(button) {
  const key = button?.dataset?.labDepthAudio;
  const script = LAB_DEPTH_LISTENING_SCRIPTS[key];
  if (!key || !script) return;
  button.disabled = true;
  setStatus(key, 'Starting practice audio…');
  try {
    const result = await playListeningMedia({ script, lang:'en-GB', rate:.92 });
    setStatus(key, result.mode === 'synthetic'
      ? 'Browser voice practice · production MP3 pending'
      : 'Production audio');
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
