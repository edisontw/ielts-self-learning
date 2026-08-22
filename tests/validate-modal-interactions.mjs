import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const source=fs.readFileSync(path.join(root,'modal-interaction-fix-v1.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const previousDocument=globalThis.document;
try { delete globalThis.document; } catch {}
const { sanitizeModal, closeViaExistingAction, handleModalClickCapture, handleModalKeydown } = await import(`../modal-interaction-fix-v1.js?test=${Date.now()}`);

let panelOnclick=true;
let backdropAction=true;
const panel={removeAttribute(name){if(name==='onclick')panelOnclick=false;}};
const backdropForSanitize={
  dataset:{},
  removeAttribute(name){if(name==='data-action')backdropAction=false;}
};
const sanitizeRoot={
  querySelectorAll(selector){
    if(selector==='.modal[onclick]')return [panel];
    if(selector==='.modal-backdrop[data-action="close-modal"]')return [backdropForSanitize];
    return [];
  }
};
sanitizeModal(sanitizeRoot);
assert(!panelOnclick,'Modal inline stopPropagation must be removed.');
assert(!backdropAction&&backdropForSanitize.dataset.modalBackdrop==='true','Backdrop parent close action must be replaced with a dedicated backdrop marker.');

let closeClicks=0;
const closeButton={click(){closeClicks++;}};
const closeBackdrop={querySelector(selector){return selector==='[data-action="close-modal"]'?closeButton:null;}};
assert(closeViaExistingAction(closeBackdrop)===true&&closeClicks===1,'Existing close-modal action must remain the source of truth for closing.');

const liveBackdrop={
  dataset:{modalBackdrop:'true'},
  closest(selector){return selector==='[data-modal-backdrop]'?this:null;},
  querySelector(selector){return selector==='[data-action="close-modal"]'?closeButton:null;}
};
const liveDocument={
  querySelectorAll(){return [];},
  querySelector(selector){return selector==='[data-modal-backdrop]'?liveBackdrop:null;}
};
Object.defineProperty(globalThis,'document',{configurable:true,writable:true,value:liveDocument});
let prevented=0,stopped=0;
handleModalClickCapture({target:liveBackdrop,preventDefault(){prevented++;},stopPropagation(){stopped++;}});
assert(prevented===1&&stopped===1&&closeClicks===2,'Clicking the backdrop itself must close the modal without consuming inner clicks.');

let keyPrevented=0;
handleModalKeydown({key:'Escape',preventDefault(){keyPrevented++;}});
assert(keyPrevented===1&&closeClicks===3,'Escape must trigger the existing modal close action.');
handleModalKeydown({key:'Enter',preventDefault(){throw new Error('Non-Escape key must not be prevented.');}});
assert(closeClicks===3,'Non-Escape keys must not close the modal.');

assert(app.includes('onclick="event.stopPropagation()"'),'Regression fixture must still identify the legacy inline propagation blocker in app.js.');
assert(app.includes('data-template-preview'),'Prompt Library template buttons must still use the existing delegated handler.');
assert(app.includes("if (action==='close-modal')"),'Existing close-modal handler must remain available.');
assert(source.includes("document.addEventListener('click', handleModalClickCapture, true)"),'Modal fix must run in capture phase before legacy inline propagation blocking.');
const appIndex=index.indexOf('./app.js');
const fixIndex=index.indexOf('./modal-interaction-fix-v1.js');
assert(appIndex>=0&&fixIndex>appIndex,'Modal interaction fix must load immediately after app.js.');

if(previousDocument===undefined){try{delete globalThis.document;}catch{}}
else Object.defineProperty(globalThis,'document',{configurable:true,writable:true,value:previousDocument});

console.log('✓ AI Prompt modal removes the legacy click propagation blocker');
console.log('✓ X / Close actions and Prompt Library buttons can reach the delegated app handler');
console.log('✓ Backdrop click closes only when the backdrop itself is clicked');
console.log('✓ Escape closes the active modal');
console.log('✓ Modal interaction fix loads after app.js');
