import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const audio=fs.readFileSync(path.join(root,'mock-test-audio-upgrade-v1.js'),'utf8');
const sync=fs.readFileSync(path.join(root,'mock-integration-fix-v1.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

assert(audio.includes('setTextIfChanged(note, PLAYER_NOTE)'), 'Mock audio copy updates must be idempotent.');
assert(!audio.includes("if (note) note.textContent = 'Production MP3"), 'Mock audio observer must not unconditionally rewrite observed text.');
assert(audio.includes('new MutationObserver(upgradeCopy)'), 'Mock production-audio upgrade should remain mutation-aware.');
assert(sync.includes("window.addEventListener('ielts-mock-errors-saved'"), 'Mock/core sync must react after Mock errors are persisted.');
assert(sync.includes('window.location.reload()'), 'Base app must reload after exiting a Mock whose core learner state changed externally.');
assert(index.indexOf('./mock-integration-fix-v1.js')>index.indexOf('./mock-test-runtime-v1.js'), 'Mock state sync must load after the Mock runtime.');
assert(index.indexOf('./mock-integration-fix-v1.js')>index.indexOf('./mock-test-audio-upgrade-v1.js'), 'Mock state sync must load after the Mock audio upgrade.');

console.log('✓ Mock Listening observer text updates are idempotent');
console.log('✓ Mock → Error Notebook handoff refreshes the base in-memory app state after exit');
console.log('✓ Mock integration fix loads after the runtimes it coordinates');
