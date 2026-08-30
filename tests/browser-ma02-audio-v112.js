const out=document.querySelector('#result');
const frame=document.querySelector('#app');
out.textContent='V112_MA02_AUDIO_E2E_RUNNING';

const assets=[
  {path:'media/audio/mock-tests/ma02-listening-part1-printmaking-workshop-booking.mp3',size:2170505,duration:[90,105]},
  {path:'media/audio/mock-tests/ma02-listening-part2-observatory-visitor-orientation.mp3',size:2742900,duration:[110,125]},
  {path:'media/audio/mock-tests/ma02-listening-part3-local-history-digitisation-project.mp3',size:2682087,duration:[110,125]},
  {path:'media/audio/mock-tests/ma02-listening-part4-seed-banks-seed-storage.mp3',size:3085835,duration:[128,145]}
];
const wait=async(fn,label,timeout=20000)=>{const start=Date.now();while(Date.now()-start<timeout){try{const value=fn();if(value)return value}catch{}await new Promise(r=>setTimeout(r,60))}throw new Error(`Timed out waiting for ${label}`)};
const includes=(node,text)=>Boolean(node?.textContent?.includes(text));
const load=async(hash,width=1280,height=900)=>{frame.style.width=`${width}px`;frame.style.height=`${height}px`;const loaded=new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));frame.src=`../index.html?ma02audio=${Date.now()}${hash}`;await loaded;return frame.contentDocument};
const decodeDuration=bytes=>new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));
  const audio=new Audio();
  const timer=setTimeout(()=>{URL.revokeObjectURL(url);reject(new Error('Timed out decoding MP3 metadata'));},12000);
  audio.addEventListener('loadedmetadata',()=>{clearTimeout(timer);const duration=audio.duration;URL.revokeObjectURL(url);resolve(duration);},{once:true});
  audio.addEventListener('error',()=>{clearTimeout(timer);URL.revokeObjectURL(url);reject(new Error('Browser could not decode MP3 metadata'));},{once:true});
  audio.preload='metadata';
  audio.src=url;
  audio.load();
});

try{
  let doc=frame.contentDocument;
  const center=await wait(()=>frame.contentDocument?.querySelector('[data-mock-center]'),'Mock Center');
  doc=frame.contentDocument;
  const ma02=center.querySelector('[data-mock-card="MA02"]');
  if(!ma02)throw new Error('MA02 card is missing');
  await wait(()=>includes(ma02,'Production MP3 primary'),'MA02 production card copy');
  await wait(()=>includes(center.querySelector('.mock-beta-note'),'MA01 and MA02 use production MP3'),'Mock Center production audio note');

  const adapter=await fetch(`../mock-test-audio-upgrade-v1.js?qa=${Date.now()}`).then(response=>response.ok?response.text():Promise.reject(new Error(`Audio adapter HTTP ${response.status}`)));
  for(const asset of assets){if(!adapter.includes(`./${asset.path}`))throw new Error(`Runtime adapter missing ${asset.path}`)}

  for(const asset of assets){
    const response=await fetch(`../${asset.path}?qa=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`${asset.path} returned HTTP ${response.status}`);
    const bytes=await response.arrayBuffer();
    if(bytes.byteLength!==asset.size)throw new Error(`${asset.path} size ${bytes.byteLength} != ${asset.size}`);
    const duration=await decodeDuration(bytes);
    if(!(duration>=asset.duration[0]&&duration<=asset.duration[1]))throw new Error(`${asset.path} decoded duration ${duration} is outside ${asset.duration.join('–')}`);
  }

  ma02.querySelector('[data-mock-test="MA02"][data-mock-start="listening"]').click();
  const player=await wait(()=>doc.querySelector('[data-mock-player][data-mock-test-id="MA02"]'),'MA02 Listening player');
  const panel=player.querySelector('.mock-audio-panel');
  await wait(()=>includes(panel,'Production MP3'),'MA02 Listening production copy');
  if(!includes(panel,'fallback'))throw new Error('MA02 Listening panel does not disclose browser-voice fallback');
  const play=panel.querySelector('[data-mock-action="play"]');
  if(!play||play.disabled)throw new Error('MA02 one-play production audio control is unavailable');

  doc=await load('#/ielts',390,844);
  const mockStage=await wait(()=>doc.querySelector('[data-ielts-stage="mock"]'),'390px Full Mock stage tab');
  mockStage.click();
  const mobileCenter=await wait(()=>{const node=doc.querySelector('[data-mock-center]');return node&&!node.hidden?node:null},'390px visible Mock Center');
  const mobileMa02=mobileCenter.querySelector('[data-mock-card="MA02"]');
  if(!mobileMa02||!includes(mobileMa02,'Production MP3 primary'))throw new Error('MA02 production card is not reachable at 390px');
  const root=doc.documentElement,body=doc.body;
  if(root.scrollWidth>root.clientWidth+2||body.scrollWidth>body.clientWidth+2)throw new Error(`390px horizontal overflow: root ${root.scrollWidth}/${root.clientWidth}, body ${body.scrollWidth}/${body.clientWidth}`);

  out.textContent='V17_PRODUCTION_E2E_PASS';
}catch(error){
  out.textContent=`V17_PRODUCTION_E2E_FAIL: ${error.stack||error}`;
}
