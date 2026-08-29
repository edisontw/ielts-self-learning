import fs from 'node:fs';
import { BACKUP_FORMAT, BACKUP_SCHEMA_VERSION, BACKUP_KEYS, MOCK_KEY, validateBackup, summarizeBackup } from '../data-portability-v1.js';
import { readMockDiagnostics } from '../mock-diagnostics-extension-v1.js';
import { MOCK_TESTS } from '../mock-test-registry-v17.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const history=MOCK_TESTS.map((test,index)=>({id:`mock-test-${index+1}`,ts:Date.now()+index,testId:test.id,mode:'Full L/R/W',listening:{raw:30,band:7},reading:{raw:30,band:7},writing:{wordCounts:{[test.writing.tasks[0].id]:160,[test.writing.tasks[1].id]:270}}}));
const data=Object.fromEntries(BACKUP_KEYS.map(key=>[key,null]));
data[MOCK_KEY]={history};
const payload={format:BACKUP_FORMAT,schemaVersion:BACKUP_SCHEMA_VERSION,appVersion:'v1.7-test',exportedAt:new Date().toISOString(),source:null,data};
assert(validateBackup(payload)===payload,'Existing backup schema must accept MA01 + MA02 history without migration.');
assert(summarizeBackup(payload).mockTests===2,'Backup summary must count both Full Mock attempts.');

const storage={getItem:key=>key===MOCK_KEY?JSON.stringify({history}):null};
const diagnostic=readMockDiagnostics(storage);
assert(diagnostic.status==='healthy'&&diagnostic.attempts===2,'Diagnostics must remain healthy with mixed MA01/MA02 history.');

const runtime=fs.readFileSync(new URL('../mock-test-runtime-v1.js',import.meta.url),'utf8');
assert(runtime.includes("STORE='ielts-mock-v1'"),'V1.7 must preserve the existing Full Mock localStorage key.');
assert(runtime.includes('testId:test.id'),'History must record the selected mock id dynamically.');
assert(runtime.includes('questionId:q.id')&&runtime.includes('lessonId:test.id'),'Error Notebook records must preserve unique question id and selected mock id.');
assert(!runtime.includes('ielts-mock-v2'),'V1.7 must not create an unnecessary new Mock storage key.');

const allQuestionIds=MOCK_TESTS.flatMap(test=>[
  ...test.listening.parts.flatMap(part=>part.questions),
  ...test.reading.passages.flatMap(passage=>passage.questions)
]).map(question=>question.id);
assert(new Set(allQuestionIds).size===allQuestionIds.length,'MA01/MA02 question ids must remain globally unique for Error Notebook compatibility.');

const curriculum=fs.readFileSync(new URL('../data.js',import.meta.url),'utf8');
assert(!runtime.includes('completedLessons.length +')&&!runtime.includes('/31'),'Mock runtime must not alter the 30-unit curriculum denominator.');
assert(curriculum.includes('LB01'),'Core curriculum source remains present and separate from Mock registry.');
console.log('V1.7 multi-mock compatibility validation passed: same mock storage key/schema, MA01+MA02 history, diagnostics, backup, and Error Notebook ids remain compatible; no denominator migration.');
