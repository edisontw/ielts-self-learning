function sanitizeModal(root = document) {
  root.querySelectorAll?.('.modal[onclick]').forEach(panel => panel.removeAttribute('onclick'));
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

function handleModalClickCapture(event) {
  sanitizeModal(document);
  const backdrop = event.target?.closest?.('[data-modal-backdrop]');
  if (!backdrop || event.target !== backdrop) return;
  event.preventDefault();
  event.stopPropagation();
  closeViaExistingAction(backdrop);
}

function handleModalKeydown(event) {
  if (event.key !== 'Escape') return;
  sanitizeModal(document);
  const backdrop = document.querySelector?.('[data-modal-backdrop]');
  if (!backdrop) return;
  event.preventDefault();
  closeViaExistingAction(backdrop);
}

function apply() { sanitizeModal(document); }

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleModalClickCapture, true);
  document.addEventListener('keydown', handleModalKeydown);
  new MutationObserver(apply).observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(apply, 0);
}

export { sanitizeModal, closeViaExistingAction, handleModalClickCapture, handleModalKeydown };
