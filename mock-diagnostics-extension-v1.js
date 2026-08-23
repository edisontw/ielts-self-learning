const MOCK_KEY = 'ielts-mock-v1';

function readMockDiagnostics(storage = localStorage) {
  let raw = null;
  try { raw = storage.getItem(MOCK_KEY); }
  catch (error) { return { status:'error', attempts:0, chars:0, error:error.message }; }
  if (raw == null || raw === '') return { status:'healthy', attempts:0, chars:0, error:null };
  let data;
  try { data = JSON.parse(raw); }
  catch { return { status:'error', attempts:0, chars:raw.length, error:'Full Mock storage is not valid JSON.' }; }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { status:'error', attempts:0, chars:raw.length, error:'Full Mock storage must be an object.' };
  if ('history' in data && !Array.isArray(data.history)) return { status:'error', attempts:0, chars:raw.length, error:'Full Mock history must be an array.' };
  const history = data.history || [];
  if (history.some(row => !row || typeof row !== 'object' || Array.isArray(row))) return { status:'error', attempts:history.length, chars:raw.length, error:'Full Mock history contains an invalid item.' };
  return { status:'healthy', attempts:history.length, chars:raw.length, error:null };
}

function setTextIfChanged(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function setHTMLIfChanged(node, value) {
  if (node && node.innerHTML !== value) node.innerHTML = value;
}

function applyMockDiagnostics() {
  const panel = document.querySelector?.('[data-diagnostics-panel]');
  if (!panel) return;
  const report = readMockDiagnostics();
  let row = panel.querySelector('[data-mock-diagnostics-extension]');
  if (!row) {
    row = document.createElement('div');
    row.dataset.mockDiagnosticsExtension = 'true';
    const actions = panel.querySelector('.cluster:last-child');
    if (actions) actions.insertAdjacentElement('beforebegin', row); else panel.appendChild(row);
  }
  const kb = report.chars < 1024 ? `${report.chars} B` : `${(report.chars/1024).toFixed(1)} KB`;
  const className = `callout ${report.status === 'error' ? 'danger' : 'success'}`;
  if (row.className !== className) row.className = className;
  const html = report.status === 'error'
    ? `<strong>Full Mock data issue</strong><br><span class="small">${report.error}</span>`
    : `<strong>Full Mock local data:</strong> ${report.attempts} attempt(s) · ${kb}`;
  setHTMLIfChanged(row, html);

  if (report.status === 'error') {
    const chip = panel.querySelector('.adaptive-top .chip');
    if (chip) {
      if (chip.className !== 'chip danger') chip.className = 'chip danger';
      setTextIfChanged(chip, 'Data issue');
    }
  }
}

if (typeof document !== 'undefined') {
  window.addEventListener('hashchange', () => setTimeout(applyMockDiagnostics, 0));
  new MutationObserver(applyMockDiagnostics).observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(applyMockDiagnostics, 0);
}

export { MOCK_KEY, readMockDiagnostics, applyMockDiagnostics, setTextIfChanged, setHTMLIfChanged };
