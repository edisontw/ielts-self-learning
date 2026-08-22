(() => {
  const scripts = {
    'l01-listen-for-meaning.mp3': `Maya: We're still at nearly fourteen minutes, and the limit is ten. Daniel: I know. I thought the slides would go faster once we practised them. Maya: The introduction is fine. I think the historical background is taking too long. We spend almost three minutes explaining how the policy developed. Daniel: We could shorten that, but I don't want to lose the survey section. That's the part that actually supports our argument about student travel habits. Maya: Agreed. The survey stays. What if we turn the background into one slide and give only the two dates people really need? Daniel: That would probably save a minute and a half. We could also cut the second example. It's interesting, but it makes the same point as the first one. Maya: Good. Let's make those changes now and then run through the whole thing again. If we're still over ten minutes, we can shorten the conclusion.`,
    'placement-listening.mp3': `Hello everyone. Before we start tomorrow's field trip, I need to make two changes to the schedule. We originally planned to meet outside the science building at eight thirty, but the entrance there will be closed for maintenance. Please meet at the main library entrance instead. The time is unchanged: eight thirty. We will travel to the coastal research centre by coach. Some of you asked whether you could take the train and meet us there, but the centre is about twenty minutes from the nearest station, so please use the coach unless you have already spoken to me about a different arrangement. Bring a notebook and a waterproof jacket. You do not need to bring lunch because the centre will provide sandwiches and fruit. If you have a dietary requirement and you haven't told the department yet, send me a message before four o'clock today. The weather forecast has improved, so the outdoor sampling activity will probably go ahead. However, the beach can be windy even when it is dry. We should return to campus at about five fifteen, although heavy traffic could make us slightly late.`,
    'l02-connected-speech.mp3': `Student: Hi, I booked room two B for Thursday afternoon, but I think I may have written the time down wrongly. Could you check? Staff: Sure. You were going to have it from two until three thirty, but the earlier group cancelled, so it's available from one thirty. Do you want to move it? Student: One thirty would be better. We need the projector because we're practising a presentation. Staff: That's fine. The room has one built in. Just collect the key from reception ten minutes before.`,
    'l03-listening-paraphrase.mp3': `Coordinator: The weekend field course costs sixty five pounds. That price covers all course materials and the Saturday site visit, but not the evening meal. You don't need previous fieldwork experience; beginners are welcome, although basic map reading skills are useful. We provide notebooks and safety vests, but you'll need to bring waterproof footwear. One final change: Sunday's lab session has been rescheduled to next Saturday because the research centre will be closed for maintenance.`,
    'l04-distractors.mp3': `Clerk: Which service were you looking at? Traveller: I was thinking of Friday evening, but Saturday morning is actually better because I can avoid travelling after work. Clerk: There's an eight forty and a nine fifteen. Traveller: Let's take the nine fifteen. And could I have a window seat? Actually, make that an aisle seat. I need to get off quickly at the other end. Clerk: The cheapest ticket is non refundable. The flexible one is twelve pounds more. Traveller: I might have to change my return time, so I'll take the flexible one. Clerk: You can collect it at the booking office or from a machine. Traveller: The office may be busy, so I'll use the machine.`,
    'l05-predict.mp3': `Staff: I've found your registration. It's under the surname Patel. The workshop fee is eighteen pounds, and that includes all materials. Please meet in the education room on the second floor, not in the main hall. We provide notebooks, so you don't need to bring one, but you must wear closed toe shoes for the practical activity. Registration opens at nine thirty and the workshop itself starts at nine forty five.`
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
