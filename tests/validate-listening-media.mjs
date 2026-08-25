import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const {
  MINI_TEST_AUDIO,
  fallbackScriptForSrc,
  miniTestAudioSrc,
  playListeningMedia,
  stopListeningMedia
}=await import('../listening-media-v1.js');

class GoodAudio {
  constructor(src){this.src=src;this.listeners={};this.currentTime=0;this.preload='';}
  addEventListener(type,fn){this.listeners[type]=fn;}
  removeEventListener(type,fn){if(this.listeners[type]===fn)delete this.listeners[type];}
  play(){queueMicrotask(()=>this.listeners.playing?.());return Promise.resolve();}
  pause(){this.paused=true;}
}
class BadAudio {
  constructor(src){this.src=src;this.listeners={};this.currentTime=0;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  removeEventListener(type,fn){if(this.listeners[type]===fn)delete this.listeners[type];}
  play(){return Promise.reject(new Error('404'));}
  pause(){this.paused=true;}
}
class FakeUtterance { constructor(text){this.text=text;} }
function speechEnv(AudioCtor){
  const speech={spoken:[],cancelled:0,cancel(){this.cancelled++;},speak(u){this.spoken.push(u);}};
  return {AudioCtor,speechSynthesis:speech,SpeechSynthesisUtterance:FakeUtterance};
}

assert(fallbackScriptForSrc('./media/audio/l01-listen-for-meaning.mp3').includes('fourteen minutes'),'L01 must retain a browser-voice fallback script.');
assert(fallbackScriptForSrc('./media/audio/placement-listening.mp3').includes('main library entrance'),'Placement must retain a browser-voice fallback script.');
for(const file of ['l02-connected-speech.mp3','l03-listening-paraphrase.mp3','l04-distractors.mp3','l05-predict.mp3']){
  assert(fallbackScriptForSrc(`./media/audio/${file}`).length>80,`${file} must retain fallback speech.`);
}
assert(Object.keys(MINI_TEST_AUDIO).length===4,'Current production Mini Test audio map must cover exactly ML01 through ML04.');
assert(miniTestAudioSrc('ML01')==='./media/audio/mini-tests/ml01-research-skills-workshops.mp3','ML01 production path changed unexpectedly.');
assert(miniTestAudioSrc('ML02')==='./media/audio/mini-tests/ml02-community-photography-walk.mp3','ML02 production path changed unexpectedly.');
assert(miniTestAudioSrc('ML03')==='./media/audio/mini-tests/ml03-community-food-photography-workshop.mp3','ML03 production path changed unexpectedly.');
assert(miniTestAudioSrc('ML04')==='./media/audio/mini-tests/ml04-river-monitoring-field-briefing.mp3','ML04 production path changed unexpectedly.');

const good=speechEnv(GoodAudio);
const production=await playListeningMedia({src:miniTestAudioSrc('ML03'),script:'Fallback should not be spoken.'},good);
assert(production.mode==='production','Playable production audio must be selected before synthetic speech.');
assert(good.speechSynthesis.spoken.length===0,'Speech synthesis must not run when production audio starts successfully.');
stopListeningMedia(good);

const bad=speechEnv(BadAudio);
const fallback=await playListeningMedia({src:miniTestAudioSrc('ML04'),script:'Use this browser voice only after production failure.',lang:'en-US',rate:1},bad);
assert(fallback.mode==='synthetic','Failed production audio must fall back to browser speech when available.');
assert(bad.speechSynthesis.spoken.length===1,'Production failure should trigger exactly one synthetic fallback playback.');
assert(bad.speechSynthesis.spoken[0].text.includes('browser voice'),'Fallback must speak the supplied test script.');
stopListeningMedia(bad);

let unavailable=false;
try{
  await playListeningMedia({src:'./missing.mp3',script:'fallback'}, {AudioCtor:BadAudio,speechSynthesis:null,SpeechSynthesisUtterance:null});
}catch(error){unavailable=error.message.includes('No playable Listening audio');}
assert(unavailable,'When production and speech fallback both fail, media playback must report failure rather than pretending to play.');

const mediaSource=fs.readFileSync(path.join(root,'listening-media-v1.js'),'utf8');
const miniUpgrade=fs.readFileSync(path.join(root,'mini-test-audio-upgrade-v1.js'),'utf8');
const miniRuntime=fs.readFileSync(path.join(root,'mini-test-runtime-v1.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const assetReadme=fs.readFileSync(path.join(root,'media/audio/README.md'),'utf8');

assert(mediaSource.includes("wrap.hidden = true"),'Practice-mode browser-voice fallback controls must start hidden.');
assert(mediaSource.includes("audio.addEventListener('error'"),'Fallback controls must be exposed only after production audio failure.');
assert(mediaSource.indexOf('startProductionAudio')<mediaSource.indexOf('startSyntheticAudio'),'Media controller must define the production path before the synthetic fallback path.');
assert(miniUpgrade.includes("event.stopImmediatePropagation()"),'Mini Test production-audio layer must intercept the legacy play button before its direct TTS handler.');
assert(miniUpgrade.includes("attemptPlayed = true")&&miniUpgrade.includes("catch (error)"),'Mini Test must count playback only after successful production or fallback start.');
assert(miniUpgrade.includes("stopListeningMedia()")&&miniUpgrade.includes("action === 'submit'"),'Mini Test submit must stop production or synthetic playback.');
assert(miniUpgrade.includes('Production audio asset')&&miniUpgrade.includes('Browser voice fallback'),'Mini Test UI must disclose which audio source actually played.');
assert(miniRuntime.includes('transcript stays hidden until submission'),'Existing Test Mode transcript restriction must remain intact.');
assert(index.includes('./listening-media-v1.js')&&!index.includes('./audio-fallback.js'),'Index must use the production-first media layer instead of the legacy always-visible TTS fallback.');
assert(index.indexOf('./mini-test-audio-upgrade-v1.js')>index.indexOf('./mini-test-runtime-v1.js'),'Mini Test audio enhancement must load after the stable Test Mode runtime.');
for(const token of ['ml01-research-skills-workshops.mp3','ml02-community-photography-walk.mp3','ml03-community-food-photography-workshop.mp3','ml04-river-monitoring-field-briefing.mp3','placement-listening.mp3']){
  assert(assetReadme.includes(token),`Production asset contract must document ${token}.`);
}

console.log('✓ Listening media prefers production HTML Audio before browser speech');
console.log('✓ Production failure falls back to browser voice without false playback completion');
console.log('✓ L01–L05 and Placement retain explicit fallback scripts');
console.log('✓ ML01–ML04 use stable drop-in production asset paths');
console.log('✓ Practice fallback controls stay hidden until an audio error');
console.log('✓ Mini Test one-play control is upgraded without changing Test Mode scoring / transcript rules');
