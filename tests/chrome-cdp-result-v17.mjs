const port=process.env.CDP_PORT||'9227';
const targetUrl=process.env.TARGET_URL||'';
const timeoutMs=Number(process.env.E2E_TIMEOUT_MS||60000);
const started=Date.now();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function findTarget(){
  while(Date.now()-started<timeoutMs){
    try{
      const response=await fetch(`http://127.0.0.1:${port}/json/list`);
      if(response.ok){
        const targets=await response.json();
        const page=targets.find(item=>item.type==='page'&&(!targetUrl||item.url===targetUrl||item.url.startsWith(targetUrl.split('?')[0])));
        if(page?.webSocketDebuggerUrl)return page;
      }
    }catch{}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for Chrome DevTools target on port ${port}`);
}

const target=await findTarget();
const ws=new WebSocket(target.webSocketDebuggerUrl);
const pending=new Map();
let nextId=1;

await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Timed out opening Chrome DevTools WebSocket')),5000);
  ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});
  ws.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Chrome DevTools WebSocket failed to open'));},{once:true});
});

ws.addEventListener('message',event=>{
  let message;
  try{message=JSON.parse(event.data)}catch{return}
  if(!message.id)return;
  const waiter=pending.get(message.id);
  if(!waiter)return;
  pending.delete(message.id);
  if(message.error)waiter.reject(new Error(message.error.message||'CDP command failed'));
  else waiter.resolve(message.result);
});

function command(method,params={}){
  const id=nextId++;
  return new Promise((resolve,reject)=>{
    pending.set(id,{resolve,reject});
    ws.send(JSON.stringify({id,method,params}));
  });
}

async function evaluate(expression){
  const response=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  return response?.result?.value;
}

await command('Runtime.enable');
let last='';
while(Date.now()-started<timeoutMs){
  const status=String(await evaluate("document.querySelector('#result')?.textContent || ''")||'');
  if(status!==last&&status){console.log(`Browser harness status: ${status.split('\n')[0]}`);last=status}
  const trimmed=status.trim();
  if(/_PASS$/.test(trimmed)){
    ws.close();
    process.exit(0);
  }
  if(/_FAIL(?::|$)/.test(trimmed)){
    console.error(status);
    ws.close();
    process.exit(1);
  }
  await sleep(150);
}

const diagnostics=await evaluate(`(()=>{const f=document.querySelector('#app');const d=f?.contentDocument;let mock=null,core=null;try{mock=JSON.parse(localStorage.getItem('ielts-mock-v1')||'null')}catch{}try{core=JSON.parse(localStorage.getItem('ielts-self-learning-v1')||'null')}catch{}return JSON.stringify({outerReady:document.readyState,frameSrc:f?.getAttribute('src')||'',frameHash:f?.contentWindow?.location?.hash||'',frameReady:d?.readyState||'',appShell:Boolean(d?.querySelector('.app-shell')),mockCenter:Boolean(d?.querySelector('[data-mock-center]')),ma02Card:Boolean(d?.querySelector('[data-mock-card="MA02"]')),playerTestId:d?.querySelector('[data-mock-player]')?.dataset?.mockTestId||'',playerResult:Boolean(d?.querySelector('[data-mock-player].mock-result')),mockHistory:(mock?.history||[]).map(x=>({testId:x.testId,mode:x.mode})),coreErrors:(core?.errors||[]).length});})()`);
console.error(`Browser timeout diagnostics: ${diagnostics}`);
ws.close();
throw new Error(`Timed out waiting for rendered E2E result; last status: ${last||'(empty)'}`);
