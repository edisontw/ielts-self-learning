import { MINI_TESTS } from './mini-test-data-v1.js';
import './mini-test-data-v3.js';
import { normalizedMiniTestErrorTag } from './listening-sequence-semantics-v16.js';
import { MOCK_TESTS } from './mock-test-registry-v17.js';
import { resultPriorityPanelHTML } from './result-priorities-v18.js';
import { registerRenderEnhancement, scheduleEnhancementPass } from './render-lifecycle-v15.js';

function htmlToNode(html){
  const template=document.createElement('template');
  template.innerHTML=html.trim();
  return template.content.firstElementChild;
}

function miniResultErrors(root){
  const title=root.querySelector('.page-head h1')?.textContent?.trim()||'';
  const test=MINI_TESTS.find(item=>item.title===title);
  if(!test)return [];
  const cards=[...root.querySelectorAll('.error-item')];
  const errors=[];
  cards.forEach((card,index)=>{
    if(!card.querySelector('.chip.warning'))return;
    const question=test.questions[index];
    if(!question)return;
    errors.push({
      questionId:question.id,
      skill:test.skill,
      errorTag:normalizedMiniTestErrorTag(question),
      question:question.prompt
    });
  });
  return errors;
}

function mockQuestions(test,root){
  const listening=test.listening.parts.flatMap(part=>part.questions);
  const reading=test.reading.passages.flatMap(passage=>passage.questions);
  const scoreLabels=[...root.querySelectorAll('.mock-score .eyebrow')].map(node=>node.textContent?.trim());
  if(scoreLabels.includes('Listening')&&scoreLabels.includes('Academic Reading'))return [...listening,...reading];
  if(scoreLabels.includes('Listening'))return listening;
  if(scoreLabels.includes('Academic Reading'))return reading;
  return [];
}

function mockResultErrors(root){
  const testId=root.dataset.mockTestId||'';
  const test=MOCK_TESTS.find(item=>item.id===testId);
  if(!test)return [];
  const questions=mockQuestions(test,root);
  const cards=[...root.querySelectorAll('.mock-review-item')];
  const errors=[];
  cards.forEach((card,index)=>{
    if(!card.querySelector('.chip.warning'))return;
    const question=questions[index];
    if(!question)return;
    errors.push({
      questionId:question.id,
      skill:question.id.includes('-L')?'listening':'reading',
      errorTag:question.errorTag,
      questionType:question.questionType||'',
      question:question.prompt
    });
  });
  return errors;
}

function insertPanel(root,errors,anchor,sourceLabel){
  if(!errors.length||root.querySelector('[data-result-priorities-v18]')||!anchor)return;
  const node=htmlToNode(resultPriorityPanelHTML(errors,{sourceLabel}));
  if(node)anchor.insertAdjacentElement('beforebegin',node);
}

export function renderResultPriorities(){
  if(typeof document==='undefined')return;

  const mini=document.querySelector('[data-mini-test-player="true"]');
  if(mini&&!mini.querySelector('[data-result-priorities-v18]')){
    const firstError=mini.querySelector('.error-item');
    const review=firstError?.closest('section.card');
    const title=mini.querySelector('.page-head h1')?.textContent?.trim()||'Mini Test';
    insertPanel(mini,miniResultErrors(mini),review,title);
  }

  const mock=document.querySelector('[data-mock-player="true"].mock-result');
  if(mock&&!mock.querySelector('[data-result-priorities-v18]')){
    const review=mock.querySelector('.mock-review-list')?.closest('section.card');
    const testId=mock.dataset.mockTestId||'Full Mock';
    insertPanel(mock,mockResultErrors(mock),review,testId);
  }
}

if(typeof document!=='undefined'){
  registerRenderEnhancement(renderResultPriorities);
  window.addEventListener('ielts-mini-test-submitted',scheduleEnhancementPass);
}
