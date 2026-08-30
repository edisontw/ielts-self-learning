let guideOpener = null;
let guideWasOpen = false;

function guideFocusables(panel) {
  if (!panel?.querySelectorAll) return [];
  return [...panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    .filter(node => !node.hidden && node.getAttribute?.('aria-hidden') !== 'true');
}

function captureGuideOpener(event) {
  const opener=event.target?.closest?.('[data-site-guide-open]');
  if (opener) guideOpener=opener;
}

function focusGuideIfNeeded() {
  const panel=document.querySelector?.('[data-site-guide-backdrop] .site-guide-modal');
  if (!panel) return false;
  guideWasOpen=true;
  if (panel.contains?.(document.activeElement)) return true;
  const preferred=panel.querySelector?.('[data-site-guide-close]') || guideFocusables(panel)[0];
  preferred?.focus?.({preventScroll:true});
  return true;
}

function restoreGuideFocusIfClosed() {
  if (!guideWasOpen || document.querySelector?.('[data-site-guide-backdrop]')) return false;
  guideWasOpen=false;
  const opener=guideOpener;
  guideOpener=null;
  if (opener?.isConnected !== false && opener?.focus) {
    opener.focus({preventScroll:true});
    return true;
  }
  return false;
}

function handleGuideFocusKeydown(event) {
  if (event.key !== 'Tab') return;
  const panel=document.querySelector?.('[data-site-guide-backdrop] .site-guide-modal');
  if (!panel) return;
  const items=guideFocusables(panel);
  if (!items.length) return;
  const first=items[0];
  const last=items.at(-1);
  const active=document.activeElement;
  if (event.shiftKey && (active===first || !panel.contains?.(active))) {
    event.preventDefault();
    last.focus({preventScroll:true});
  } else if (!event.shiftKey && active===last) {
    event.preventDefault();
    first.focus({preventScroll:true});
  }
}

function applyGuideFocus() {
  if (!focusGuideIfNeeded()) restoreGuideFocusIfClosed();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click',captureGuideOpener,true);
  document.addEventListener('keydown',handleGuideFocusKeydown,true);
  new MutationObserver(applyGuideFocus).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(applyGuideFocus,0);
}

export {
  guideFocusables,
  captureGuideOpener,
  focusGuideIfNeeded,
  restoreGuideFocusIfClosed,
  handleGuideFocusKeydown
};
