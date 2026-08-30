let modalOpener = null;
let modalOpenerSelector = '';
let modalWasOpen = false;

const MODAL_OPENER_SELECTOR = [
  '[data-action="open-prompt-library"]',
  '[data-action="open-error-prompt"]',
  '[data-action="preview-writing-prompt"]',
  '[data-error-prompt]',
  '[data-template-preview]'
].join(',');

const attrEsc = (value='') => String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"');

function focusableElements(panel) {
  if (!panel?.querySelectorAll) return [];
  return [...panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    .filter(node => !node.hidden && node.getAttribute?.('aria-hidden') !== 'true');
}

function openerSelector(opener) {
  if (!opener?.dataset) return '';
  if (opener.dataset.action) return `[data-action="${attrEsc(opener.dataset.action)}"]`;
  if (opener.dataset.errorPrompt) return `[data-error-prompt="${attrEsc(opener.dataset.errorPrompt)}"]`;
  if (opener.dataset.templatePreview) return `[data-template-preview="${attrEsc(opener.dataset.templatePreview)}"]`;
  return '';
}

function sanitizeModal(root = document) {
  root.querySelectorAll?.('.modal[onclick]').forEach(panel => panel.removeAttribute('onclick'));
  root.querySelectorAll?.('.modal').forEach((panel, index) => {
    panel.setAttribute?.('role', panel.getAttribute?.('role') || 'dialog');
    panel.setAttribute?.('aria-modal', 'true');
    const title = panel.querySelector?.('h2');
    if (title && !panel.getAttribute?.('aria-labelledby')) {
      if (!title.id) title.id = `modal-title-v18-${index}`;
      panel.setAttribute?.('aria-labelledby', title.id);
    }
  });
  root.querySelectorAll?.('.modal-backdrop[data-action="close-modal"]').forEach(backdrop => {
    backdrop.removeAttribute('data-action');
    backdrop.dataset.modalBackdrop = 'true';
  });
}

function closeViaExistingAction(backdrop) {
  const close = backdrop?.querySelector?.('[data-action="close-modal"]');
  if (close) {
    close.click();
    return true;
  }
  return false;
}

function captureModalOpener(event) {
  const opener = event.target?.closest?.(MODAL_OPENER_SELECTOR);
  if (!opener) return;
  modalOpener = opener;
  modalOpenerSelector = openerSelector(opener);
}

function focusModalIfNeeded() {
  const panel = document.querySelector?.('[data-modal-backdrop] .modal');
  if (!panel) return false;
  modalWasOpen = true;
  if (panel.contains?.(document.activeElement)) return true;
  const preferred = panel.querySelector?.('[data-action="close-modal"]') || focusableElements(panel)[0];
  if (preferred?.focus) preferred.focus({ preventScroll:true });
  else {
    panel.setAttribute?.('tabindex', '-1');
    panel.focus?.({ preventScroll:true });
  }
  return true;
}

function restoreModalFocusIfClosed() {
  if (!modalWasOpen || document.querySelector?.('[data-modal-backdrop]')) return false;
  modalWasOpen = false;
  const opener = modalOpener?.isConnected === false && modalOpenerSelector
    ? document.querySelector?.(modalOpenerSelector)
    : modalOpener;
  modalOpener = null;
  modalOpenerSelector = '';
  if (opener?.focus) {
    opener.focus({ preventScroll:true });
    return true;
  }
  return false;
}

function handleModalClickCapture(event) {
  captureModalOpener(event);
  sanitizeModal(document);
  const backdrop = event.target?.closest?.('[data-modal-backdrop]');
  if (!backdrop || event.target !== backdrop) return;
  event.preventDefault();
  event.stopPropagation();
  closeViaExistingAction(backdrop);
}

function handleModalKeydown(event) {
  sanitizeModal(document);
  const backdrop = document.querySelector?.('[data-modal-backdrop]');
  if (!backdrop) return;
  const panel = backdrop.querySelector?.('.modal');

  if (event.key === 'Escape') {
    event.preventDefault();
    closeViaExistingAction(backdrop);
    return;
  }

  if (event.key !== 'Tab' || !panel) return;
  const focusables = focusableElements(panel);
  if (!focusables.length) {
    event.preventDefault();
    panel.setAttribute?.('tabindex', '-1');
    panel.focus?.({ preventScroll:true });
    return;
  }
  const first = focusables[0];
  const last = focusables.at(-1);
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !panel.contains?.(active))) {
    event.preventDefault();
    last.focus({ preventScroll:true });
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus({ preventScroll:true });
  }
}

function apply() {
  sanitizeModal(document);
  if (!focusModalIfNeeded()) restoreModalFocusIfClosed();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleModalClickCapture, true);
  document.addEventListener('keydown', handleModalKeydown);
  new MutationObserver(apply).observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(apply, 0);
}

export {
  sanitizeModal,
  closeViaExistingAction,
  handleModalClickCapture,
  handleModalKeydown,
  focusableElements,
  focusModalIfNeeded,
  restoreModalFocusIfClosed,
  openerSelector
};
