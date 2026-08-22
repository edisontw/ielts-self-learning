(() => {
  let placement = null;
  let loading = null;

  async function getPlacement() {
    if (placement) return placement;
    if (!loading) loading = fetch('./content/placement/quick-placement-v1.json').then(r => r.json()).then(d => placement = d).catch(() => null);
    return loading;
  }

  async function enhance() {
    const progress = document.querySelector('.section-progress');
    const question = document.querySelector('.placement-question');
    if (!progress || !question) return;
    const data = await getPlacement();
    if (!data || !document.querySelector('.placement-question')) return;

    if (progress.textContent.includes('Section 3/4') && !document.querySelector('.placement-passage')) {
      const reading = data.sections.find(s => s.skill === 'reading');
      if (!reading) return;
      const box = document.createElement('div');
      box.className = 'placement-passage';
      box.innerHTML = reading.passage.split('\n\n').map(p => `<p>${p.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`).join('');
      question.insertAdjacentElement('beforebegin', box);
    }

    if (progress.textContent.includes('Section 4/4') && !document.querySelector('.audio-box')) {
      const box = document.createElement('div');
      box.className = 'audio-box';
      box.style.marginBottom = '16px';
      box.innerHTML = `<div class="small muted">Placement listening · practice placement mode</div><div class="cluster" style="margin-top:8px"><button class="btn soft small-btn" type="button" data-tts-key="placement-listening.mp3">▶ Replay prototype browser voice</button><span class="small muted">The transcript remains hidden.</span></div>`;
      question.insertAdjacentElement('beforebegin', box);
    }
  }

  new MutationObserver(() => enhance()).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', enhance);
})();
