import { mockTestById } from './mock-test-registry-v17.js';
import { playListeningMedia, stopListeningMedia } from './listening-media-v1.js';

const MA01_AUDIO = [
  './media/audio/mock-tests/ma01-listening-part1-study-room-booking.mp3',
  './media/audio/mock-tests/ma01-listening-part2-museum-visitor-information.mp3',
  './media/audio/mock-tests/ma01-listening-part3-campus-garden-research-project.mp3',
  './media/audio/mock-tests/ma01-listening-part4-urban-trees-heat-adaptation.mp3'
];
const MA02_AUDIO = [
  './media/audio/mock-tests/ma02-listening-part1-printmaking-workshop-booking.mp3',
  './media/audio/mock-tests/ma02-listening-part2-observatory-visitor-orientation.mp3',
  './media/audio/mock-tests/ma02-listening-part3-local-history-digitisation-project.mp3',
  './media/audio/mock-tests/ma02-listening-part4-seed-banks-seed-storage.mp3'
];
const MOCK_AUDIO = { MA01:MA01_AUDIO, MA02:MA02_AUDIO };
const PLAYER_NOTE = {
  MA01:'Production MP3 · one play only. No pause, seek or replay controls. Browser voice is fallback only if the recording cannot play.',
  MA02:'Production MP3 · one play only. No pause, seek or replay controls. Browser voice is fallback only if the recording cannot play.'
};
const CENTER_NOTE='Audio status: MA01 and MA02 use production MP3 recordings. A labelled browser-voice fallback is used only if a recording cannot play.';

let playedParts = new Set();
let playInFlight = false;

function setTextIfChanged(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function currentTestId() {
  return document.querySelector?.('[data-mock-player]')?.dataset?.mockTestId || 'MA01';
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
  setTextIfChanged(document.querySelector?.('[data-mock-center] .mock-beta-note'), CENTER_NOTE);

  const panel = document.querySelector?.('[data-mock-player] .mock-audio-panel');
  const button = panel?.querySelector?.('[data-mock-action="play"]');
  if (!panel || !button) return;

  const testId = currentTestId();
  const hasProduction = Boolean(MOCK_AUDIO[testId]?.[currentPartIndex()]);
  const note = panel.querySelector?.('p.small.muted');
  setTextIfChanged(note, PLAYER_NOTE[testId] || PLAYER_NOTE.MA02);

  const partIndex = currentPartIndex();
  const status = sourceStatusNode(button);
  if (playedParts.has(`${testId}:${partIndex}`)) {
    button.disabled = true;
    button.classList.remove('primary');
    button.classList.add('soft');
    if (!button.textContent.includes('production') && !button.textContent.includes('fallback')) setTextIfChanged(button, 'Audio already played');
    if (status && !status.textContent) setTextIfChanged(status, 'This Part has already used its one allowed playback.');
  } else if (!playInFlight) {
    button.disabled = false;
    if (status && !status.textContent) setTextIfChanged(status, hasProduction ? 'Production MP3 preferred · browser voice fallback if unavailable' : 'Browser voice beta · production recording pending');
  }
}

function resetAudioAttempt() {
  playedParts = new Set();
  playInFlight = false;
  stopListeningMedia();
}

async function handlePlay(button) {
  const testId = currentTestId();
  const test = mockTestById(testId);
  const partIndex = currentPartIndex();
  const part = test?.listening?.parts?.[partIndex];
  const key = `${testId}:${partIndex}`;
  if (!part || playedParts.has(key) || playInFlight) return;

  playInFlight = true;
  button.disabled = true;
  const src = MOCK_AUDIO[testId]?.[partIndex] || '';
  setTextIfChanged(button, src ? 'Loading recording…' : 'Starting browser voice…');
  const status = sourceStatusNode(button);
  if (status) setTextIfChanged(status, src ? 'Checking production MP3…' : 'Production recording unavailable; preparing browser voice…');

  try {
    const result = await playListeningMedia({ src, script:part.script, lang:'en-GB', rate:.96, pitch:1 });
    playedParts.add(key);
    button.classList.remove('primary');
    button.classList.add('soft');
    button.disabled = true;
    setTextIfChanged(button, result.mode === 'production' ? 'Audio played · production MP3' : 'Audio played · browser voice fallback');
    if (status) setTextIfChanged(status, result.mode === 'production' ? 'Production MP3 recording' : 'Browser voice fallback · not production IELTS audio');
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
  if (action.dataset.mockAction === 'exit') resetAudioAttempt();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleCapture, true);
  window.addEventListener('hashchange', resetAudioAttempt);
  new MutationObserver(upgradeCopy).observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(upgradeCopy, 0);
}

export { MOCK_AUDIO, MA01_AUDIO, MA02_AUDIO, PLAYER_NOTE, CENTER_NOTE, setTextIfChanged, currentTestId };
