const PRACTICE_FALLBACK_SCRIPTS = {
  'l01-listen-for-meaning.mp3': `Maya: We're still at nearly fourteen minutes, and the limit is ten. Daniel: I know. I thought the slides would go faster once we practised them. Maya: The introduction is fine. I think the historical background is taking too long. We spend almost three minutes explaining how the policy developed. Daniel: We could shorten that, but I don't want to lose the survey section. That's the part that actually supports our argument about student travel habits. Maya: Agreed. The survey stays. What if we turn the background into one slide and give only the two dates people really need? Daniel: That would probably save a minute and a half. We could also cut the second example. It's interesting, but it makes the same point as the first one. Maya: Good. Let's make those changes now and then run through the whole thing again. If we're still over ten minutes, we can shorten the conclusion.`,
  'placement-listening.mp3': `Hello everyone. Before we start tomorrow's field trip, I need to make two changes to the schedule. We originally planned to meet outside the science building at eight thirty, but the entrance there will be closed for maintenance. Please meet at the main library entrance instead. The time is unchanged: eight thirty. We will travel to the coastal research centre by coach. Some of you asked whether you could take the train and meet us there, but the centre is about twenty minutes from the nearest station, so please use the coach unless you have already spoken to me about a different arrangement. Bring a notebook and a waterproof jacket. You do not need to bring lunch because the centre will provide sandwiches and fruit. If you have a dietary requirement and you haven't told the department yet, send me a message before four o'clock today. The weather forecast has improved, so the outdoor sampling activity will probably go ahead. However, the beach can be windy even when it is dry. We should return to campus at about five fifteen, although heavy traffic could make us slightly late.`,
  'l02-connected-speech.mp3': `Student: Hi, I booked room two B for Thursday afternoon, but I think I may have written the time down wrongly. Could you check? Staff: Sure. You were going to have it from two until three thirty, but the earlier group cancelled, so it's available from one thirty. Do you want to move it? Student: One thirty would be better. We need the projector because we're practising a presentation. Staff: That's fine. The room has one built in. Just collect the key from reception ten minutes before.`,
  'l03-listening-paraphrase.mp3': `Coordinator: The weekend field course costs sixty five pounds. That price covers all course materials and the Saturday site visit, but not the evening meal. You don't need previous fieldwork experience; beginners are welcome, although basic map reading skills are useful. We provide notebooks and safety vests, but you'll need to bring waterproof footwear. One final change: Sunday's lab session has been rescheduled to next Saturday because the research centre will be closed for maintenance.`,
  'l04-distractors.mp3': `Clerk: Which service were you looking at? Traveller: I was thinking of Friday evening, but Saturday morning is actually better because I can avoid travelling after work. Clerk: There's an eight forty and a nine fifteen. Traveller: Let's take the nine fifteen. And could I have a window seat? Actually, make that an aisle seat. I need to get off quickly at the other end. Clerk: The cheapest ticket is non refundable. The flexible one is twelve pounds more. Traveller: I might have to change my return time, so I'll take the flexible one. Clerk: You can collect it at the booking office or from a machine. Traveller: The office may be busy, so I'll use the machine.`,
  'l05-predict.mp3': `Staff: I've found your registration. It's under the surname Patel. The workshop fee is eighteen pounds, and that includes all materials. Please meet in the education room on the second floor, not in the main hall. We provide notebooks, so you don't need to bring one, but you must wear closed toe shoes for the practical activity. Registration opens at nine thirty and the workshop itself starts at nine forty five.`
};

export const MINI_TEST_AUDIO = {
  ML01: './media/audio/mini-tests/ml01-research-skills-workshops.mp3',
  ML02: './media/audio/mini-tests/ml02-community-photography-walk.mp3'
};

let activeAudio = null;
let activeUtterance = null;

function basename(src='') {
  return String(src).split('?')[0].split('#')[0].split('/').pop() || '';
}

export function fallbackScriptForSrc(src='') {
  return PRACTICE_FALLBACK_SCRIPTS[basename(src)] || '';
}

export function miniTestAudioSrc(testId='') {
  return MINI_TEST_AUDIO[testId] || '';
}

export function defaultMediaEnv() {
  const win = typeof window === 'undefined' ? {} : window;
  return {
    AudioCtor: typeof Audio === 'undefined' ? null : Audio,
    speechSynthesis: win.speechSynthesis || null,
    SpeechSynthesisUtterance: win.SpeechSynthesisUtterance || (typeof SpeechSynthesisUtterance === 'undefined' ? null : SpeechSynthesisUtterance)
  };
}

export function canUseSpeech(env=defaultMediaEnv()) {
  return Boolean(env.speechSynthesis && env.SpeechSynthesisUtterance);
}

export function stopListeningMedia(env=defaultMediaEnv()) {
  try { activeAudio?.pause?.(); } catch {}
  try { if (activeAudio) activeAudio.currentTime = 0; } catch {}
  activeAudio = null;
  try { env.speechSynthesis?.cancel?.(); } catch {}
  activeUtterance = null;
}

function startProductionAudio(src, env) {
  return new Promise((resolve, reject) => {
    if (!src || !env.AudioCtor) return reject(new Error('HTML Audio is unavailable.'));
    let settled = false;
    const audio = new env.AudioCtor(src);
    activeAudio = audio;
    const cleanup = () => {
      audio.removeEventListener?.('playing', onPlaying);
      audio.removeEventListener?.('error', onError);
    };
    const onPlaying = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ mode:'production', src, audio });
    };
    const onError = () => {
      if (settled) return;
      settled = true;
      cleanup();
      if (activeAudio === audio) activeAudio = null;
      reject(new Error('Production audio could not be played.'));
    };
    audio.preload = 'auto';
    audio.addEventListener?.('playing', onPlaying, { once:true });
    audio.addEventListener?.('error', onError, { once:true });
    try {
      const promise = audio.play?.();
      if (promise && typeof promise.then === 'function') promise.then(onPlaying).catch(onError);
    } catch {
      onError();
    }
  });
}

function startSyntheticAudio(script, { lang='en-GB', rate=.94, pitch=1 }={}, env) {
  if (!script || !canUseSpeech(env)) throw new Error('No playable Listening audio or browser-voice fallback is available.');
  env.speechSynthesis.cancel?.();
  const utterance = new env.SpeechSynthesisUtterance(String(script).replace(/\n+/g,' '));
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  activeUtterance = utterance;
  env.speechSynthesis.speak(utterance);
  return { mode:'synthetic', utterance };
}

export async function playListeningMedia(options={}, env=defaultMediaEnv()) {
  const { src='', script='', lang='en-GB', rate=.94, pitch=1 } = options;
  stopListeningMedia(env);
  if (src) {
    try { return await startProductionAudio(src, env); }
    catch {}
  }
  return startSyntheticAudio(script, { lang, rate, pitch }, env);
}

function fallbackControls(audio, script) {
  const existing = audio.parentElement?.querySelector?.('[data-listening-fallback-controls]');
  if (existing) return existing;
  const wrap = document.createElement('div');
  wrap.dataset.listeningFallbackControls = 'true';
  wrap.className = 'cluster';
  wrap.style.marginTop = '8px';
  wrap.hidden = true;
  wrap.innerHTML = `<button class="btn soft small-btn" type="button" data-listening-fallback-play>▶ Play browser-voice fallback</button><span class="small muted" data-listening-media-status>Production audio unavailable</span>`;
  audio.insertAdjacentElement('afterend', wrap);
  wrap.querySelector('[data-listening-fallback-play]')?.addEventListener('click', async () => {
    const button = wrap.querySelector('[data-listening-fallback-play]');
    try {
      const result = await playListeningMedia({ script, lang:'en-GB', rate:.92 });
      button.textContent = result.mode === 'synthetic' ? '▶ Replay browser voice' : '▶ Replay audio';
      wrap.querySelector('[data-listening-media-status]').textContent = 'Browser voice fallback · not production IELTS audio';
    } catch (error) {
      button.disabled = true;
      wrap.querySelector('[data-listening-media-status]').textContent = error.message;
    }
  });
  return wrap;
}

export function enhanceAudioElement(audio) {
  if (!audio || audio.dataset.listeningMediaEnhanced) return;
  audio.dataset.listeningMediaEnhanced = '1';
  audio.dataset.listeningMediaPolicy = 'production-first';
  const src = audio.getAttribute('src') || '';
  const script = fallbackScriptForSrc(src);
  if (!script) return;
  const fallback = fallbackControls(audio, script);
  const showFallback = () => {
    audio.dataset.listeningMediaSource = 'synthetic-fallback';
    audio.style.display = 'none';
    fallback.hidden = false;
  };
  audio.addEventListener('canplay', () => {
    audio.dataset.listeningMediaSource = 'production';
    audio.style.display = '';
    fallback.hidden = true;
  });
  audio.addEventListener('error', showFallback);
  if (audio.error) showFallback();
}

export function enhanceListeningAudio(root=document) {
  root.querySelectorAll?.('audio').forEach(enhanceAudioElement);
}

if (typeof document !== 'undefined') {
  const apply = () => enhanceListeningAudio(document);
  new MutationObserver(apply).observe(document.documentElement, { childList:true, subtree:true });
  document.addEventListener('DOMContentLoaded', apply);
  setTimeout(apply, 0);
}
