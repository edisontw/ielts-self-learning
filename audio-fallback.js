(() => {
  const scripts = {
    'l01-listen-for-meaning.mp3': `Maya: We're still at nearly fourteen minutes, and the limit is ten. Daniel: I know. I thought the slides would go faster once we practised them. Maya: The introduction is fine. I think the historical background is taking too long. We spend almost three minutes explaining how the policy developed. Daniel: We could shorten that, but I don't want to lose the survey section. That's the part that actually supports our argument about student travel habits. Maya: Agreed. The survey stays. What if we turn the background into one slide and give only the two dates people really need? Daniel: That would probably save a minute and a half. We could also cut the second example. It's interesting, but it makes the same point as the first one. Maya: Good. Let's make those changes now and then run through the whole thing again. If we're still over ten minutes, we can shorten the conclusion.`,
    'placement-listening.mp3': `Hello everyone. Before we start tomorrow's field trip, I need to make two changes to the schedule. We originally planned to meet outside the science building at eight thirty, but the entrance there will be closed for maintenance. Please meet at the main library entrance instead. The time is unchanged: eight thirty. We will travel to the coastal research centre by coach. Some of you asked whether you could take the train and meet us there, but the centre is about twenty minutes from the nearest station, so please use the coach unless you have already spoken to me about a different arrangement. Bring a notebook and a waterproof jacket. You do not need to bring lunch because the centre will provide sandwiches and fruit. If you have a dietary requirement and you haven't told the department yet, send me a message before four o'clock today. The weather forecast has improved, so the outdoor sampling activity will probably go ahead. However, the beach can be windy even when it is dry. We should return to campus at about five fifteen, although heavy traffic could make us slightly late.`
  };

  function enhance(root = document) {
    root.querySelectorAll?.('audio').forEach(audio => {
      if (audio.dataset.fallbackReady) return;
      const src = audio.getAttribute('src') || '';
      const key = Object.keys(scripts).find(k => src.includes(k));
      if (!key) return;
      audio.dataset.fallbackReady = '1';
      const wrap = document.createElement('div');
      wrap.className = 'cluster';
      wrap.style.marginTop = '8px';
      wrap.innerHTML = `<button class="btn soft small-btn" type="button" data-tts-key="${key}">▶ Play prototype browser voice</button><span class="small muted">Runtime synthetic audio fallback</span>`;
      audio.insertAdjacentElement('afterend', wrap);
      audio.addEventListener('error', () => { audio.style.display = 'none'; });
    });
  }

  function speak(key) {
    if (!('speechSynthesis' in window)) {
      alert('This browser does not support speech synthesis. Use the transcript for this prototype.');
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(scripts[key]);
    u.lang = 'en-GB';
    u.rate = 0.92;
    speechSynthesis.speak(u);
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-tts-key]');
    if (btn) speak(btn.dataset.ttsKey);
  });
  new MutationObserver(() => enhance()).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => enhance());
})();
