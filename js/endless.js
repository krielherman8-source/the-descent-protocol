/* THE DESCENT PROTOCOL — Endless Descent (post-game mode, classic script; exposes window.TDP_ENDLESS).
   Floors 31+ (0-based index 30+) are generated from the 30 hand-made floors:
   - regular floors: every non-boss floor template in a per-run seeded shuffle; each pass through the pool is
     reshuffled and never repeats the previous floor across the pass boundary
   - every 5th floor (F35, F40, ...) is a boss floor; bosses come from [warden, prime, colossus, matriarch, overmind]
     in a seeded shuffle per cycle of five (no back-to-back repeat across cycles)
   - scaling is multiplicative per endless floor on top of the base curve (see K) so it grows smoothly forever
   Pure logic only (no DOM / Three.js) so tests can call it directly. */
(function(){
const START=30;                       // 0-based index of F31, the first endless floor
const BOSSES=['warden','prime','colossus','matriarch','overmind'];
// per endless floor e (F31 -> e=1): enemy HP x hp^e, damage taken x dmg^e, wave size x count^e, boss HP x boss^e
const K={hp:1.06,dmg:1.03,count:1.03,boss:1.05,capMax:56};
// boss HP weights in endless so the rotation is roughly even (the Warden is an F10 boss, the Overmind an F30 one)
const BOSS_W={warden:3,prime:1.1,colossus:1,matriarch:1,overmind:.7};
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuf(arr,r){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
let FL=null,MIX=null,REG=null,BOSSIDX=null;const cache=new Map();
function init(o){FL=o.FLOORS;MIX=o.mix;REG=[];BOSSIDX={};FL.forEach((f,i)=>{if(f.objective==='boss')BOSSIDX[f.boss]=i;else REG.push(i)});
 BOSSIDX.warden=FL.findIndex(f=>f.objective==='keycards');cache.clear()}
const isEndless=i=>i>=START;
const depth=i=>Math.max(0,i-(START-1));         // F31 -> 1, F40 -> 10
const isBossFloor=i=>isEndless(i)&&(i+1)%5===0;  // F35, F40, F45 ...
// cycle-th pass through a list, shuffled with a seed; first element never equals the previous pass's last
function pass(list,seed,c,salt){const memo='p'+salt+':'+seed+':'+c;if(cache.has(memo))return cache.get(memo);
 let o=shuf(list,rng((seed^salt)+c*104729));if(c>0&&o.length>1){const prev=pass(list,seed,c-1,salt);if(o[0]===prev[prev.length-1]){const t=o[0];o[0]=o[1];o[1]=t}}
 cache.set(memo,o);return o}
function bossFor(i,seed){const k=(i+1)/5-7;return pass(BOSSES,seed,Math.floor(k/5),0xB055)[k%5]}   // F35 -> k=0
const regularOrdinal=i=>(i-START)-(Math.floor((i+1)/5)-6);   // index among the regular (non-boss) endless floors
function regularFor(i,seed){const j=regularOrdinal(i),n=REG.length;return pass(REG,seed,Math.floor(j/n),0x5EED)[j%n]}
const BNAME={warden:'Brood Warden',prime:'Hive Prime',colossus:'Colossus',matriarch:'Matriarch',overmind:'Overmind'};
// floor definition for any index; endless floors are shallow copies of a template (never mutate the originals)
function floorAt(i,seed){if(!isEndless(i))return FL[i];const key=seed+':'+i;if(cache.has(key))return cache.get(key);let f;
 if(isBossFloor(i)){const b=bossFor(i,seed),ti=BOSSIDX[b],t=FL[ti];
  f=Object.assign({},t,{objective:'boss',boss:b,task:'Kill the '+BNAME[b],name:b==='warden'?"Warden's Return":t.name,
   bossLine:'Endless depth '+(i+1)+' — it remembers you',spawn:b==='warden'?[20,17]:t.spawn,elite:undefined,src:ti})}
 else{const ti=regularFor(i,seed);f=Object.assign({},FL[ti],{src:ti})}
 f.mix=MIX;f.endless=true;cache.set(key,f);return f}
function scale(i){const d=depth(i);return{hp:Math.pow(K.hp,d),dmg:Math.pow(K.dmg,d),count:Math.pow(K.count,d),boss:Math.pow(K.boss,d)}}
function cap(i,base){return isEndless(i)?Math.min(base,K.capMax):base}
function bossW(type){return BOSS_W[type]||1}
const newSeed=()=>((Math.random()*2**32)>>>0)||1;
// records: best[diff]={floor,time}; deeper floor wins, equal floor -> faster time wins
function better(r,floor,time){return !r||floor>r.floor||(floor===r.floor&&time<r.time)}
function record(b,diff,floor,time){b.endless=b.endless||{};const r=b.endless[diff];if(better(r,floor,time)){b.endless[diff]={floor,time:Math.round(time*10)/10};return true}return false}
window.TDP_ENDLESS={START,K,BOSSES,BOSS_W,init,isEndless,depth,isBossFloor,bossFor,regularFor,floorAt,scale,cap,bossW,newSeed,record,better,rng,shuf,
 regularPool:()=>REG.slice()};
})();
