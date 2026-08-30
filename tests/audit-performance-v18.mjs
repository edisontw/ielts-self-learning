import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scriptSrc=[...index.matchAll(/<script\b[^>]*type=["']module["'][^>]*src=["']\.\/([^"']+)["']/g)].map(m=>m[1]);
const cssHref=[...index.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']\.\/([^"']+)["']/g)].map(m=>m[1]);

const importRe=/(?:^|\n)\s*(?:import|export)\s+(?:[^'"\n]*?\s+from\s+)?["'](\.[^"']+\.js)["']/g;
const seen=new Set();
const queue=[...scriptSrc];
while(queue.length){
  const rel=queue.shift();
  if(seen.has(rel))continue;
  const full=path.join(root,rel);
  if(!fs.existsSync(full))throw new Error(`Missing eager module: ${rel}`);
  seen.add(rel);
  const src=fs.readFileSync(full,'utf8');
  for(const match of src.matchAll(importRe)){
    const child=path.normalize(path.join(path.dirname(rel),match[1])).replaceAll('\\','/');
    if(!seen.has(child))queue.push(child);
  }
}

const modules=[...seen].map(rel=>{
  const src=fs.readFileSync(path.join(root,rel),'utf8');
  return {
    rel,
    bytes:Buffer.byteLength(src),
    observers:(src.match(/new\s+MutationObserver\s*\(/g)||[]).length,
    intervals:(src.match(/setInterval\s*\(/g)||[]).length,
    dynamicImports:(src.match(/import\s*\(/g)||[]).length
  };
}).sort((a,b)=>b.bytes-a.bytes);
const css=cssHref.map(rel=>({rel,bytes:fs.statSync(path.join(root,rel)).size})).sort((a,b)=>b.bytes-a.bytes);
const jsBytes=modules.reduce((sum,x)=>sum+x.bytes,0);
const cssBytes=css.reduce((sum,x)=>sum+x.bytes,0);
const observerFiles=modules.filter(x=>x.observers);
const intervalFiles=modules.filter(x=>x.intervals);

const result={
  indexModuleScripts:scriptSrc.length,
  eagerUniqueModules:modules.length,
  eagerJsBytes:jsBytes,
  cssFiles:css.length,
  cssBytes,
  mutationObservers:observerFiles.reduce((s,x)=>s+x.observers,0),
  observerFiles:observerFiles.map(x=>`${x.rel}:${x.observers}`),
  setIntervals:intervalFiles.reduce((s,x)=>s+x.intervals,0),
  intervalFiles:intervalFiles.map(x=>`${x.rel}:${x.intervals}`),
  dynamicImports:modules.reduce((s,x)=>s+x.dynamicImports,0),
  largestModules:modules.slice(0,12).map(x=>[x.rel,x.bytes]),
  largestCss:css.slice(0,8).map(x=>[x.rel,x.bytes])
};

if(result.eagerUniqueModules>120)throw new Error(`Eager module graph unexpectedly exceeds 120 modules: ${result.eagerUniqueModules}`);
if(result.eagerJsBytes>3_000_000)throw new Error(`Eager JS unexpectedly exceeds 3 MB: ${result.eagerJsBytes}`);
if(result.cssBytes>750_000)throw new Error(`Eager CSS unexpectedly exceeds 750 KB: ${result.cssBytes}`);

console.log('V18_PERFORMANCE_STATIC '+JSON.stringify(result));
