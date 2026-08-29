import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const audio=fs.readFileSync(path.join(root,'mock-test-audio-upgrade-v1.js'),'utf8');
const sync=fs.readFileSync(path.join(root,'mock-integration-fix-v1.js'),'utf8');
const miniRuntime=fs.readFileSync(path.join(root,'mini-test-runtime-v1.js'),'utf8');
const diag=fs.readFileSync(path.join(root,'mock-diagnostics-extension-v1.js'),'utf8');
const guide=fs.readFileSync(path.join(root,'site-guide-v1.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

assert(audio.includes('setTextIfChanged(note, PLAYER_NOTE['), 'Mock audio copy updates must remain idempotent and test-aware.');
assert(audio.includes('PLAYER_NOTE.MA02'), 'Mock audio copy must expose the MA02 browser-voice production gate.');
assert(!audio.includes("if (note) note.textContent = 'Production MP3"), 'Mock audio observer must not unconditionally rewrite observed text.');
assert(audio.includes('new MutationObserver(upgradeCopy)'), 'Mock production-audio upgrade should remain mutation-aware.');
assert(sync.includes("window.addEventListener('ielts-mock-errors-saved'"), 'Mock/core sync must react after Mock errors are persisted.');
assert(sync.includes("window.addEventListener('ielts-mini-test-errors-saved'"), 'Mini Test/core sync must react after Mini Test errors are persisted.');
assert(miniRuntime.includes("window.dispatchEvent(new CustomEvent('ielts-mini-test-errors-saved'))"), 'Mini Test runtime must emit its core-write handoff event after saving errors.');
assert(sync.includes('[data-mock-action="exit"]')&&sync.includes('[data-mini-action="exit"]'), 'External core-write sync must reload after either Mock or Mini Test exit.');
assert(sync.includes("window.addEventListener('hashchange'"), 'External core-write sync must also refresh when the learner navigates away without using the test Exit button.');
assert(sync.includes('window.location.reload()'), 'Base app must reload after leaving a test whose core learner state changed externally.');
assert(diag.includes("const MOCK_KEY = 'ielts-mock-v1'"), 'Diagnostics extension must inspect Full Mock storage.');
assert(diag.includes('Full Mock data issue'), 'Diagnostics extension must expose malformed Mock storage.');
assert(guide.includes('Four IELTS layers')&&guide.includes('Full Mock Test Center'), 'Learner guide must describe the Full Mock layer.');
assert(index.indexOf('./mock-integration-fix-v1.js')>index.indexOf('./mock-test-runtime-v1.js'), 'External core-write sync must load after the Mock runtime.');
assert(index.indexOf('./mock-integration-fix-v1.js')>index.indexOf('./mini-test-runtime-v1.js'), 'External core-write sync must load after the Mini Test runtime.');
assert(index.indexOf('./mock-integration-fix-v1.js')>index.indexOf('./mock-test-audio-upgrade-v1.js'), 'Mock state sync must load after the Mock audio upgrade.');
assert(index.indexOf('./mock-diagnostics-extension-v1.js')>index.indexOf('./diagnostics-v1.js'), 'Mock diagnostics extension must load after Diagnostics.');

class MemoryStorage {
  constructor(seed={}){this.map=new Map(Object.entries(seed));}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
}
const {readMockDiagnostics}=await import('../mock-diagnostics-extension-v1.js');
let report=readMockDiagnostics(new MemoryStorage({'ielts-mock-v1':JSON.stringify({history:[{id:'m1',testId:'MA01'},{id:'m2',testId:'MA02'}]})}));
assert(report.status==='healthy'&&report.attempts===2,'Diagnostics must count valid MA01 + MA02 Full Mock attempts.');
report=readMockDiagnostics(new MemoryStorage({'ielts-mock-v1':'{"history":{}}'}));
assert(report.status==='error'&&report.error.includes('array'),'Diagnostics must flag malformed Full Mock history.');

console.log('✓ Mock Listening observer text updates remain idempotent and test-aware');
console.log('✓ Mock → Error Notebook handoff refreshes the base in-memory app state after exit');
console.log('✓ Mini Test → Error Notebook handoff refreshes the base state after Exit or route navigation');
console.log('✓ MA01 + MA02 Full Mock history is compatible with learner guidance and Diagnostics');
console.log('✓ Shared external core-write sync loads after both Mini Test and Mock runtimes');
