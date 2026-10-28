// Leak probe: injected at the very top of <head> (before any game script) by tests/leak.mjs.
// Wraps addEventListener/removeEventListener, timers, requestAnimationFrame and Web Audio node creation
// so the leak harness can count what is live at any moment.  Read via window.LEAKPROBE.snap().
(function(){
const P=window.LEAKPROBE={};
// ---- event listeners: key = target id + type + capture; identical re-adds are no-ops like the browser ----
const L=new Map();let tid=0;const tids=new WeakMap();const fids=new WeakMap();let fid=0;
const idOf=(m,o)=>{let v=m.get(o);if(v===undefined){v=m===tids?++tid:++fid;m.set(o,v)}return v};
const cap=o=>typeof o==='boolean'?o:!!(o&&o.capture);
const tname=t=>t===window?'window':t===document?'document':(t&&t.id?'#'+t.id:(t&&t.nodeName)||(t&&t.constructor&&t.constructor.name)||'?');
const aEL=EventTarget.prototype.addEventListener,rEL=EventTarget.prototype.removeEventListener;
EventTarget.prototype.addEventListener=function(type,fn,o){if(fn&&!(this instanceof AudioNode)&&!(this instanceof BaseAudioContext)){const k=idOf(tids,this)+'|'+type+'|'+cap(o)+'|'+idOf(fids,fn);
  if(!L.has(k))L.set(k,{t:tname(this),type,ref:new WeakRef(this),once:o&&o.once})}return aEL.call(this,type,fn,o)};
EventTarget.prototype.removeEventListener=function(type,fn,o){if(fn&&tids.has(this)&&fids.has(fn))L.delete(tids.get(this)+'|'+type+'|'+cap(o)+'|'+fids.get(fn));return rEL.call(this,type,fn,o)};
// ---- timers ----
const iv=new Set(),to=new Set();const sI=window.setInterval,cI=window.clearInterval,sT=window.setTimeout,cT=window.clearTimeout;
window.setInterval=function(f,ms,...a){const id=sI.call(window,f,ms,...a);iv.add(id);return id};
window.clearInterval=function(id){iv.delete(id);return cI.call(window,id)};
window.setTimeout=function(f,ms,...a){let id;id=sT.call(window,typeof f==='function'?(...b)=>{to.delete(id);f(...b)}:f,ms,...a);to.add(id);return id};
window.clearTimeout=function(id){to.delete(id);return cT.call(window,id)};
P.timeoutsPending=()=>to.size;
// ---- rAF: how many callbacks are queued per frame (a duplicated game loop shows up as 2+) ----
const rAF=window.requestAnimationFrame,cAF=window.cancelAnimationFrame;let pend=new Map(),maxPer=0,frames=0,perFrameMax=0,cbNames=new Set();
window.requestAnimationFrame=function(f){const id=rAF.call(window,t=>{pend.delete(id);f(t)});pend.set(id,f.name||'anon');return id};
window.cancelAnimationFrame=function(id){pend.delete(id);return cAF.call(window,id)};
(function tick(){perFrameMax=Math.max(perFrameMax,pend.size);frames++;rAF.call(window,tick)})();
// ---- Web Audio: count nodes created / still reachable (FinalizationRegistry after gc) / currently playing sources ----
const A={created:0,collected:0,byType:{},live:{},playing:0,conn:0,disc:0,startErr:0,startErrMsg:''};// playing counts only starts that succeeded
const fr=new FinalizationRegistry(t=>{A.collected++;A.live[t]--});
const BAC=window.BaseAudioContext&&BaseAudioContext.prototype;
if(BAC)for(const k of Object.getOwnPropertyNames(BAC))if(/^create(?!PeriodicWave|Buffer$)/.test(k)&&typeof BAC[k]==='function'){const orig=BAC[k];
 BAC[k]=function(...a){const n=orig.apply(this,a);const t=k.slice(6);A.created++;A.byType[t]=(A.byType[t]||0)+1;A.live[t]=(A.live[t]||0)+1;fr.register(n,t);
  if(n instanceof AudioScheduledSourceNode){const st=n.start;n.start=function(...b){let r;try{r=st.apply(n,b)}catch(e){A.startErr++;if(!A.startErrMsg)A.startErrMsg=String(e).slice(0,160)+' args='+JSON.stringify(b);throw e}A.playing++;n.addEventListener('ended',()=>A.playing--,{once:true});return r}}return n}}
if(window.AudioNode){const c=AudioNode.prototype.connect,d=AudioNode.prototype.disconnect;AudioNode.prototype.connect=function(...a){A.conn++;return c.apply(this,a)};AudioNode.prototype.disconnect=function(...a){A.disc++;return d.apply(this,a)}}
P.audio=A;
// ---- console errors ----
P.errors=[];const ce=console.error;console.error=function(...a){P.errors.push(a.map(String).join(' ').slice(0,200));return ce.apply(console,a)};
P.snap=()=>{let live=0;const byT={};for(const v of L.values()){if(!v.ref.deref())continue;live++;const k=v.t+':'+v.type;byT[k]=(byT[k]||0)+1}
 const r={frames,vis:document.visibilityState,listeners:live,listenersBy:byT,intervals:iv.size,timeouts:to.size,rafPending:pend.size,rafPerFrameMax:perFrameMax,audioCreated:A.created,audioLive:Object.values(A.live).reduce((a,b)=>a+b,0),audioLiveBy:Object.assign({},A.live),audioPlaying:A.playing,audioConn:A.conn,audioDisc:A.disc,audioStartErr:A.startErr,audioStartErrMsg:A.startErrMsg};perFrameMax=0;return r};
})();
