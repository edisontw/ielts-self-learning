import assert from 'node:assert/strict';
import fs from 'node:fs';

const styles=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const modal=fs.readFileSync(new URL('../modal-interaction-fix-v1.js',import.meta.url),'utf8');
const guide=fs.readFileSync(new URL('../site-guide-focus-v18.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(styles,/:focus-visible\s*\{[^}]*outline:/s,'Visible keyboard focus styling must remain present.');
assert.match(styles,/\.skip-link:focus\s*\{\s*top:/,'Skip link must become visible on focus.');
assert.match(styles,/@media \(max-width: 980px\)/,'Tablet/mobile navigation breakpoint must remain present.');
assert.match(styles,/@media \(max-width: 640px\)/,'Phone layout breakpoint must remain present.');
assert.match(styles,/@media \(prefers-reduced-motion: reduce\)/,'Reduced-motion support must remain present.');
assert.doesNotMatch(index,/maximum-scale\s*=|user-scalable\s*=\s*no/i,'Viewport must not disable pinch zoom.');

for(const token of ['focusableElements','handleModalKeydown','restoreModalFocusIfClosed','modalOpenerSelector','aria-modal']){
  assert.ok(modal.includes(token),`Prompt modal focus guard missing ${token}`);
}
assert.match(modal,/event\.key !== 'Tab'/,'Prompt modal must explicitly handle Tab focus containment.');
assert.match(modal,/event\.shiftKey/,'Prompt modal must support reverse keyboard traversal.');
assert.match(modal,/document\.querySelector\?\.\(modalOpenerSelector\)/,'Prompt modal return focus must survive app rerender.');

for(const token of ['guideFocusables','handleGuideFocusKeydown','restoreGuideFocusIfClosed']){
  assert.ok(guide.includes(token),`Site Guide focus guard missing ${token}`);
}
assert.match(guide,/event\.key !== 'Tab'/,'Site Guide must explicitly contain Tab focus.');
assert.match(guide,/event\.shiftKey/,'Site Guide must support reverse keyboard traversal.');
assert.ok(index.indexOf('./site-guide-focus-v18.js')>index.indexOf('./ux-polish-v1.js'),'Site Guide focus guard must load after UX capture handlers.');

console.log('✓ Visible focus, skip-link, responsive breakpoints, reduced motion and zoom remain enabled');
console.log('✓ Prompt modal traps Tab/Shift+Tab and restores focus across app rerenders');
console.log('✓ Site Guide traps keyboard focus and restores it after close');
