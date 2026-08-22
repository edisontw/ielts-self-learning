import { MINI_TESTS } from './mini-test-data-v1.js';
import { miniTestAudioSrc, playListeningMedia, stopListeningMedia } from './listening-media-v1.js';

let activeTestId = null;
let attemptPlayed = false;
let playInFlight = false;

const testById = id => MINI_TESTS.find(test => test.id === id);

function sourceStatusNode(button) {
  const section = button?.closest?.('.card') || button?.parentElement;
  if (!section) return null;
  let node = section.querySelector?.('[data-mini-audio-source-status]');
  if (!node) {
    node = document.createElement('div');
    node.dataset.miniAudioSourceStatus = 'true';
    node.className = 'small muted';
    node.style.marginTop = '8px';
    button.insertAdjacentElement('afterend', node);
  }
  return node;
}

function upgradePlayerCopy() {
  document.querySelectorAll?.('#main .meta span').forEach(span => {
    if (span.textContent?.trim() === 'one prototype playback') span.textContent = 'one recording · one play';
  });
  const button = document.querySelector?.('[data-mini-action="play-audio"]');
  if (!button) return;
  const section = button.closest?.('.card');
  const heading = section?.querySelector?.('h2');
  const paragraph = section?.querySelector?.('p.muted');
  if (heading?.textContent?.includes('prototype playback')) heading.textContent = 'One recording · one play';
  if (paragraph?.textContent?.includes('Browser speech synthesis is prototype audio')) {
    paragraph.textContent = 'The transcript stays hidden until submission. Production audio is used when available; browser voice is only a fallback.';
  }
  const status = sourceStatusNode(button);
  if (status && !status.textContent) status.textContent = 'Production MP3 preferred · browser voice fallback if the file is unavailable';
}

async function handlePlay(button) {
  if (!activeTestId || attemptPlayed || playInFlight) return;
  const test = testById(activeTestId);
  if (!test || test.skill !== 'listening') return;
  playInFlight = true;
  button.disabled = true;
  button.textContent = 'Loading recording…';
  const status = sourceStatusNode(button);
  if (status) status.textContent = 'Checking production audio…';
  try {
    const result = await playListeningMedia({
      src: miniTestAudioSrc(test.id),
      script: test.script,
      lang: 'en-US',
      rate: 1,
      pitch: 1
    });
    attemptPlayed = true;
    button.classList.remove('primary');
    button.classList.add('soft');
    button.textContent = result.mode === 'production' ? 'Recording played · production audio' : 'Recording played · browser voice fallback';
    if (status) status.textContent = result.mode === 'production'
      ? 'Production audio asset'
      : 'Browser voice fallback · not production IELTS audio';
  } catch (error) {
    button.disabled = false;
    button.textContent = 'Play recording once';
    if (status) status.textContent = error.message || 'Listening audio is unavailable.';
  } finally {
    playInFlight = false;
  }
}

function handleCapture(event) {
  const button = event.target?.closest?.('[data-mini-action]');
  if (!button) return;
  const action = button.dataset.miniAction;
  if (action === 'start') {
    const test = testById(button.dataset.testId);
    if (test?.skill === 'listening') {
      activeTestId = test.id;
      attemptPlayed = false;
      playInFlight = false;
      stopListeningMedia();
      setTimeout(upgradePlayerCopy, 0);
    } else {
      activeTestId = null;
      attemptPlayed = false;
      stopListeningMedia();
    }
    return;
  }
  if (action === 'play-audio') {
    event.preventDefault();
    event.stopImmediatePropagation();
    handlePlay(button);
    return;
  }
  if (action === 'retake') {
    attemptPlayed = false;
    playInFlight = false;
    stopListeningMedia();
    setTimeout(upgradePlayerCopy, 0);
    return;
  }
  if (action === 'submit') {
    stopListeningMedia();
    return;
  }
  if (action === 'exit') {
    stopListeningMedia();
    activeTestId = null;
    attemptPlayed = false;
    playInFlight = false;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleCapture, true);
  window.addEventListener('hashchange', () => {
    stopListeningMedia();
    activeTestId = null;
    attemptPlayed = false;
    playInFlight = false;
    setTimeout(upgradePlayerCopy, 0);
  });
  new MutationObserver(upgradePlayerCopy).observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(upgradePlayerCopy, 0);
}
