import { LESSONS } from '../data.js';
import { CORE_LESSON_META } from '../adaptive-data.js';
import { WRITING_TASK1_LESSONS, WRITING_TASK1_PROMPTS } from '../writing-task1-v1.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const lessonIds=['WT1-01','WT1-02','WT1-03','WT1-04','WT1-05'];
const expectedTypes={line:2,bar:2,table:2,pie:1,mixed:1,process:2,map:2};

assert(WRITING_TASK1_LESSONS.length===5,'Task 1 course must contain exactly five core lessons.');
assert(WRITING_TASK1_PROMPTS.length===12,'Task 1 full workspace must contain exactly 12 prompts.');
assert(new Set(WRITING_TASK1_LESSONS.map(x=>x.id)).size===5,'Task 1 lesson IDs must be unique.');
assert(new Set(WRITING_TASK1_PROMPTS.map(x=>x.id)).size===12,'Task 1 prompt IDs must be unique.');
assert(lessonIds.every(id=>WRITING_TASK1_LESSONS.some(x=>x.id===id)), 'Task 1 lesson IDs must remain WT1-01 through WT1-05.');
assert(lessonIds.every(id=>LESSONS.some(x=>x.id===id)), 'Task 1 lessons must be registered in the site lesson catalog.');
assert(lessonIds.every(id=>CORE_LESSON_META.some(x=>x.id===id)), 'Task 1 lessons must be registered in adaptive lesson metadata.');

const distribution=WRITING_TASK1_PROMPTS.reduce((acc,p)=>(acc[p.type]=(acc[p.type]||0)+1,acc),{});
for(const [type,count] of Object.entries(expectedTypes)) assert(distribution[type]===count, `Task 1 prompt bank requires ${count} ${type} prompt(s).`);

for(const prompt of WRITING_TASK1_PROMPTS){
  assert(prompt.prompt.includes('Summarise the information by selecting and reporting the main features'), `${prompt.id} must use the Academic Task 1 reporting instruction.`);
  assert(Array.isArray(prompt.keyFeatures)&&prompt.keyFeatures.length>=3, `${prompt.id} needs at least three planning-note features.`);
  assert(typeof prompt.groupingHint==='string'&&prompt.groupingHint.length>=25, `${prompt.id} needs a useful grouping hint.`);
  assert(prompt.source?.label&&['synthetic','original-diagram'].includes(prompt.source.type), `${prompt.id} must disclose original/synthetic source provenance.`);
  assert(prompt.visual?.kind, `${prompt.id} needs a renderable visual definition.`);

  const v=prompt.visual;
  if(['line','bar'].includes(prompt.type)){
    assert(v.kind===prompt.type, `${prompt.id} visual kind must match prompt type.`);
    assert(Array.isArray(v.series)&&v.series.length>=3, `${prompt.id} must contain at least three data series.`);
    const categories=prompt.type==='line'?v.years:v.categories;
    assert(Array.isArray(categories)&&categories.length>=4, `${prompt.id} needs at least four x-axis categories/years.`);
    assert(v.series.every(s=>s.values.length===categories.length), `${prompt.id} series lengths must match the x-axis.`);
  }
  if(prompt.type==='table'){
    assert(v.kind==='table'&&v.headers.length>=3&&v.rows.length>=4, `${prompt.id} needs a complete table.`);
    assert(v.rows.every(r=>r.length===v.headers.length), `${prompt.id} table rows must match header width.`);
  }
  if(prompt.type==='pie'){
    assert(v.kind==='pie'&&v.panels.length===2, `${prompt.id} must contain two pie panels.`);
    for(const panel of v.panels) assert(panel.values.reduce((sum,[,n])=>sum+n,0)===100, `${prompt.id} ${panel.name} values must total 100%.`);
  }
  if(prompt.type==='mixed'){
    assert(v.kind==='mixed'&&v.bar&&v.pie, `${prompt.id} needs both bar and pie components.`);
    assert(v.pie.values.reduce((sum,[,n])=>sum+n,0)===100, `${prompt.id} pie component must total 100%.`);
  }
  if(prompt.type==='process'){
    assert(v.kind==='process'&&v.stages.length>=6, `${prompt.id} needs a substantial process sequence.`);
  }
  if(prompt.type==='map'){
    assert(v.kind==='map'&&v.before.length>=4&&v.after.length>=4, `${prompt.id} needs before/after map content.`);
    assert(v.beforeLabel&&v.afterLabel, `${prompt.id} map must label both time states.`);
  }
}

for(const lesson of WRITING_TASK1_LESSONS){
  assert(lesson.skill==='writing','Every WT1 lesson must remain a Writing lesson.');
  assert(lesson.ieltsSkill==='writing','Every WT1 lesson must declare IELTS Writing relevance.');
  assert(lesson.questionType==='academic-task-1','Every WT1 lesson must remain Academic Task 1 specific.');
  assert(Array.isArray(lesson.sections)&&lesson.sections.length>=5, `${lesson.id} needs full lesson depth.`);
  assert(Array.isArray(lesson.errorTags)&&lesson.errorTags.some(x=>x.startsWith('writing-task1')), `${lesson.id} needs Task 1-specific error tags.`);
}

const overview=WRITING_TASK1_LESSONS.find(x=>x.id==='WT1-02');
const compare=WRITING_TASK1_LESSONS.find(x=>x.id==='WT1-03');
assert(overview.sections.some(s=>(s.blocks||[]).some(b=>b.type==='writing'&&b.promptType==='writing-task1-feedback')), 'WT1-02 must include a Task 1 writing-feedback mini draft.');
assert(compare.sections.some(s=>(s.blocks||[]).some(b=>b.type==='writing'&&b.promptType==='writing-task1-feedback')), 'WT1-03 must include a Task 1 writing-feedback mini draft.');

const workspace=WRITING_TASK1_LESSONS.find(x=>x.id==='WT1-05');
assert(workspace.sections.some(s=>String(s.html||'').includes('data-wt1-bank-mount')), 'WT1-05 must expose the dynamic 12-prompt workspace mount.');
assert(workspace.timed===true,'WT1-05 must support exam-timed practice.');

console.log('✓ Academic Writing Task 1 course contains five complete lessons');
console.log('✓ Task 1 workspace contains 12 original prompts across all planned visual families');
console.log('✓ Prompt visuals, provenance, planning notes and data integrity are valid');
console.log('✓ WT1 lessons integrate with the existing lesson catalog, adaptive metadata and Writing feedback flow');
