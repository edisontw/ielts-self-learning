import { registerRenderEnhancement, scheduleEnhancementPass } from './render-lifecycle-v15.js';

export const RETURN_CONTEXT_KEY='ielts-return-context-v18';
export const RETURN_CONTEXT_MAX_AGE_MS=2*60*60*1000;

const esc=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const attrEsc=(value='')=>String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"');

export function freshReturnContext(context,now=Date.now()){
  return Boolean(context&&context.version===1&&Number.isFinite(context.createdAt)&&now-context.createdAt>=0&&now-context.createdAt<=RETURN_CONTEXT_MAX_AGE_MS);
}

function readContext(){
  try{
    const context=JSON.parse(sessionStorage.getItem(RETURN_CONTEXT_KEY)||'null');
    if(!freshReturnContext(context)){sessionStorage.removeItem(RETURN_CONTEXT_KEY);return null;}
    return context;
  }catch{return null;}
}

function writeContext(context){
  try{sessionStorage.setItem(RETURN_CONTEXT_KEY,JSON.stringify(context));}catch{}
}

function clearContext(){
  try{sessionStorage.removeItem(RETURN_CONTEXT_KEY);}catch{}
}

function mockReturnLabel(root){
  const testId=root.dataset.mockTestId||'Full Mock';
  const labels=[...root.querySelectorAll('.mock-score .eyebrow')].map(node=>node.textContent?.trim());
  if(labels.includes('Listening')&&labels.includes('Academic Reading'))return `Return to ${testId} Full Mock review`;
  if(labels.includes('Academic Reading'))return `Return to ${testId} Reading review`;
  if(labels.includes('Listening'))return `Return to ${testId} Listening review`;
  return `Return to ${testId} review`;
}

function sourceLabelForResult(root){
  if(root.matches('[data-mini-test-player="true"]'))return root.querySelector('.page-head h1')?.textContent?.trim()||'Mini Test review';
  const label=mockReturnLabel(root).replace(/^Return to /,'').replace(/ review$/,'');
  return label||'Full Mock review';
}

function sanitiseReviewSnapshot(root){
  const clone=root.cloneNode(true);
  clone.removeAttribute('style');
  clone.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  clone.querySelectorAll('input,textarea,select').forEach(node=>{node.disabled=true;node.setAttribute('aria-disabled','true');});
  clone.querySelectorAll('[data-mini-action],[data-mock-action],[data-speaking-action],[data-copy-text]').forEach(node=>{
    node.disabled=true;
    node.setAttribute('aria-disabled','true');
    node.removeAttribute('data-mini-action');
    node.removeAttribute('data-mock-action');
    node.removeAttribute('data-speaking-action');
    node.removeAttribute('data-copy-text');
  });
  clone.querySelectorAll('audio,video').forEach(node=>{try{node.pause?.();}catch{}node.removeAttribute('autoplay');});
  clone.dataset.returnReviewSnapshot='true';
  return clone.outerHTML;
}

function captureResultContext(button){
  const root=button.closest('[data-mini-test-player="true"], [data-mock-player="true"].mock-result');
  if(!root||!root.querySelector('[data-result-priorities-v18]'))return false;
  const isMini=root.matches('[data-mini-test-player="true"]');
  const sourceLabel=sourceLabelForResult(root);
  const returnLabel=isMini?`Return to ${sourceLabel} review`:mockReturnLabel(root);
  writeContext({
    version:1,
    createdAt:Date.now(),
    kind:isMini?'mini-result':'mock-result',
    sourceLabel,
    returnLabel,
    targetHash:'#/ielts',
    snapshotHtml:sanitiseReviewSnapshot(root),
    returning:false
  });
  return true;
}

function captureImproveContext(button){
  if(!location.hash.includes('/improve'))return false;
  const errorItem=button.closest('.error-item');
  const errorId=errorItem?.querySelector('[data-error-id]')?.dataset.errorId||'';
  const fromNotebook=Boolean(errorItem);
  writeContext({
    version:1,
    createdAt:Date.now(),
    kind:fromNotebook?'error-notebook':'improve',
    sourceLabel:fromNotebook?'Error Notebook':'Improve',
    returnLabel:fromNotebook?'Return to Error Notebook':'Return to Improve',
    targetHash:'#/improve',
    focusErrorId:errorId,
    returning:false
  });
  return true;
}

function lessonIdFromHash(){
  return location.hash.match(/^#\/lesson\/([^/?#]+)/)?.[1]||'';
}

function renderLessonReturn(){
  const context=readContext();
  const lessonId=lessonIdFromHash();
  if(!context||context.returning||!lessonId)return;
  const main=document.querySelector('#main');
  if(!main||main.querySelector('[data-return-context-v18]'))return;
  const destination=main.querySelector('h1')?.textContent?.trim()||lessonId;
  const section=document.createElement('section');
  section.className='card';
  section.dataset.returnContextV18='true';
  section.style.marginBottom='18px';
  section.innerHTML=`<div class="cluster" style="justify-content:space-between;align-items:flex-start;gap:14px"><div><div class="eyebrow">Targeted practice · return path saved</div><strong>${esc(context.sourceLabel)} → ${esc(destination)}</strong><p class="small muted" style="margin:7px 0 0">Your return path is stored only for this browser tab. A submitted Test Mode attempt stays read-only when you return.</p></div><div class="cluster"><button class="btn primary" data-return-context-action="return">${esc(context.returnLabel)}</button><button class="btn ghost small-btn" data-return-context-action="dismiss">Dismiss</button></div></div>`;
  main.insertAdjacentElement('afterbegin',section);
}

function hideBaseForReview(main){
  [...main.children].forEach(child=>{
    if(child.dataset.returnReviewV18==='true')return;
    child.dataset.returnReviewWasHidden=child.hidden?'1':'0';
    child.hidden=true;
  });
}

function restoreBaseAfterReview(main){
  [...main.children].forEach(child=>{
    if(child.dataset.returnReviewWasHidden==null)return;
    child.hidden=child.dataset.returnReviewWasHidden==='1';
    delete child.dataset.returnReviewWasHidden;
  });
}

function renderReturnedReview(){
  const context=readContext();
  if(!context?.returning||!context.snapshotHtml||!location.hash.includes('/ielts'))return;
  const main=document.querySelector('#main');
  if(!main||main.querySelector('[data-return-review-v18]'))return;
  hideBaseForReview(main);
  const shell=document.createElement('section');
  shell.dataset.returnReviewV18='true';
  shell.innerHTML=`<section class="card" style="margin-bottom:18px"><div class="cluster" style="justify-content:space-between;align-items:flex-start;gap:14px"><div><div class="eyebrow">Returned review · read-only</div><h1 style="margin:6px 0 8px">${esc(context.sourceLabel)}</h1><p class="muted" style="margin:0">Continue reviewing the submitted attempt or choose another evidence-backed priority. Test answers and submission controls remain locked.</p></div><button class="btn soft" data-return-context-action="close-review">Back to IELTS practice</button></div></section><div data-return-review-content>${context.snapshotHtml}</div>`;
  main.appendChild(shell);
  setTimeout(()=>shell.querySelector('[data-result-priorities-v18]')?.scrollIntoView({block:'start'}),0);
}

function completeSimpleReturn(){
  const context=readContext();
  if(!context?.returning||context.snapshotHtml||!location.hash.includes('/improve'))return;
  const focusId=context.focusErrorId;
  clearContext();
  if(focusId){
    setTimeout(()=>{
      const card=document.querySelector(`[data-error-id="${attrEsc(focusId)}"]`)?.closest('.error-item');
      card?.scrollIntoView({block:'center'});
    },0);
  }
}

export function renderReturnContext(){
  if(typeof document==='undefined')return;
  renderLessonReturn();
  renderReturnedReview();
  completeSimpleReturn();
}

function beginReturn(){
  const context=readContext();
  if(!context)return;
  context.returning=true;
  writeContext(context);
  if(location.hash===context.targetHash){scheduleEnhancementPass();return;}
  location.hash=context.targetHash;
  window.scrollTo({top:0,behavior:'smooth'});
}

function closeReturnedReview(){
  const main=document.querySelector('#main');
  main?.querySelector('[data-return-review-v18]')?.remove();
  if(main)restoreBaseAfterReview(main);
  clearContext();
  window.scrollTo({top:0,behavior:'smooth'});
}

function dismissLessonReturn(action){
  clearContext();
  action.closest('[data-return-context-v18]')?.remove();
}

function handleClick(event){
  const action=event.target.closest('[data-return-context-action]');
  if(action){
    const type=action.dataset.returnContextAction;
    if(type==='return')beginReturn();
    else if(type==='dismiss')dismissLessonReturn(action);
    else if(type==='close-review')closeReturnedReview();
    return;
  }

  if(event.target.closest('[data-mini-action="start"],[data-mock-start]'))clearContext();

  const lessonButton=event.target.closest('[data-lesson]');
  if(lessonButton){
    if(captureResultContext(lessonButton))return;
    captureImproveContext(lessonButton);
    return;
  }

  if(event.target.closest('[data-nav]')&&readContext())clearContext();
}

if(typeof document!=='undefined'){
  document.addEventListener('click',handleClick,true);
  window.addEventListener('hashchange',()=>setTimeout(scheduleEnhancementPass,0));
  registerRenderEnhancement(renderReturnContext);
}
