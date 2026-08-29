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

await command('Runtime.enable');
let last='';
while(Date.now()-started<timeoutMs){
  const evaluated=await command('Runtime.evaluate',{
    expression:"document.querySelector('#result')?.textContent || ''",
    returnByValue:true,
    awaitPromise:true
  });
  const status=String(evaluated?.result?.value||'');
  if(status!==last&&status){console.log(`V1.7 browser harness status: ${status.split('\n')[0]}`);last=status}
  if(status==='V17_PRODUCTION_E2E_PASS'){
    ws.close();
    process.exit(0);
  }
  if(status.startsWith('V17_PRODUCTION_E2E_FAIL')){
    console.error(status);
    ws.close();
    process.exit(1);
  }
  await sleep(150);
}

ws.close();
throw new Error(`Timed out waiting for rendered V1.7 E2E result; last status: ${last||'(empty)'}`);
