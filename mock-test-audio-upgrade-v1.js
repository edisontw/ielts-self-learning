import { MOCK_TESTS } from './mock-test-data-v1.js';
import { playListeningMedia, stopListeningMedia } from './listening-media-v1.js';

const test = MOCK_TESTS.find(item => item.id === 'MA01') || MOCK_TESTS[0];
const MOCK_AUDIO = [
  './media/audio/mock-tests/ma01-listening-part1-study-room-booking.mp3',
  './media/audio/mock-tests/ma01-listening-part2-museum-visitor-information.mp3',
  './media/audio/mock-tests/ma01-listening-part3-campus-garden-research-project.mp3',
  './media/audio/mock-tests/ma01-listening-part4-urban-trees-heat-adaptation.mp3'
];
const PLAYER_NOTE = 'Production MP3 · one play only. No pause, seek or replay controls. Browser voice is fallback only if the recording cannot play.';

let playedParts = new Set();
let playInFlight = false;

function setTextIfChanged(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function currentPartIndex() {
  const tabs = [...document.querySelectorAll?.('[data-mock-player] [data-mock-part]') || []];
  const active = tabs.findIndex(tab => tab.classList.contains('active'));
  return active >= 0 ? active : 0;
}

function sourceStatusNode(button) {
  const panel = button?.closest?.('.mock-audio-panel');
  if (!panel) return null;
  let node = panel.querySelector?.('[data-mock-audio-source-status]');
  if (!node) {
    node = document.createElement('div');
    node.dataset.mockAudioSourceStatus = 'true';
    node.className = 'small muted';
    node.style.marginTop = '8px';
    button.insertAdjacentElement('afterend', node);
  }
  return node;
}

function upgradeCopy() {
  const centerNote = document.querySelector?.('[data-mock-center] .mock-beta-note');
  if (centerNote && !centerNote.dataset.productionAudioCopy) {
    centerNote.dataset.productionAudioCopy = '1';
    centerNote.innerHTML = '<strong>Authenticity status:</strong> question counts, section timing, strict feedback rules and exam-style navigation are implemented. Listening uses production multi-voice MP3 recordings as the primary source; browser speech is retained only as a fallback if an audio asset cannot play.';
  }

  const panel = document.querySelector?.('[data-mock-player] .mock-audio-panel');
  const button = panel?.querySelector?.('[data-mock-action="play"]');
  if (!panel || !button) return;

  const note = panel.querySelector?.('p.small.muted');
  setTextIfChanged(note, PLAYER_NOTE);

  const partIndex = currentPartIndex();
  const status = sourceStatusNode(button);
  if (playedParts.has(partIndex)) {
    button.disabled = true;
    button.classList.remove('primary');
    button.classList.add('soft');
    if (!button.textContent.includes('production') && !button.textContent.includes('fallback')) setTextIfChanged(button, 'Audio already played');
    if (status && !status.textContent) setTextIfChanged(status, 'This Part has already used its one allowed playback.');
  } else if (!playInFlight) {
    button.disabled = false;
    if (status && !status.textContent) setTextIfChanged(status, 'Production MP3 preferred · browser voice fallback if unavailable');
  }
}

function resetAudioAttempt() {
  playedParts = new Set();
  playInFlight = false;
  stopListeningMedia();
}

async function handlePlay(button) {
  const partIndex = currentPartIndex();
  const part = test?.listening?.parts?.[partIndex];
  if (!part || playedParts.has(partIndex) || playInFlight) return;

  playInFlight = true;
  button.disabled = true;
  setTextIfChanged(button, 'Loading recording…');
  const status = sourceStatusNode(button);
  if (status) setTextIfChanged(status, 'Checking production MP3…');

  try {
    const result = await playListeningMedia({
      src: MOCK_AUDIO[partIndex],
      script: part.script,
      lang: 'en-GB',
      rate: .96,
      pitch: 1
    });
    playedParts.add(partIndex);
    button.classList.remove('primary');
    button.classList.add('soft');
    button.disabled = true;
    setTextIfChanged(button, result.mode === 'production'
      ? 'Audio played · production MP3'
      : 'Audio played · browser voice fallback');
    if (status) setTextIfChanged(status, result.mode === 'production'
      ? 'Production multi-voice MP3'
      : 'Browser voice fallback · not production IELTS audio');
  } catch (error) {
    button.disabled = false;
    setTextIfChanged(button, 'Play Part once');
    if (status) setTextIfChanged(status, error?.message || 'Listening audio is unavailable.');
  } finally {
    playInFlight = false;
  }
}

function handleCapture(event) {
  const start = event.target?.closest?.('[data-mock-start]');
  if (start) {
    resetAudioAttempt();
    return;
  }

  const action = event.target?.closest?.('[data-mock-action]');
  if (!action) return;

  if (action.dataset.mockAction === 'play') {
    event.preventDefault();
    event.stopImmediatePropagation();
    handlePlay(action);
    return;
  }

  if (action.dataset.mockAction === 'submit') {
    stopListeningMedia();
    return;
  }

  if (action.dataset.mockAction === 'exit') {
    stopListeningMedia();
    playedParts = new Set();
    playInFlight = false;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleCapture, true);
  window.addEventListener('hashchange', resetAudioAttempt);
  new MutationObserver(upgradeCopy).observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(upgradeCopy, 0);
}

export { MOCK_AUDIO, PLAYER_NOTE, setTextIfChanged };
