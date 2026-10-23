/* THE DESCENT PROTOCOL — story text, credits and the crawl overlay (classic script; exposes window.TDP_STORY). */
(function(){
const INTRO=[
 '<h1>THE DESCENT PROTOCOL</h1>',
 'Deep Site KESTREL-9 went silent forty-one hours ago.',
 'Thirty levels below the ice, the research consortium was growing something they called <b>the Overmind</b>: a hive intelligence meant to run the facility on its own.',
 'It worked too well. The swarm it bred has taken every floor, and the core has started reaching up toward the surface.',
 'There is one emergency order left on the books.',
 '<b>THE DESCENT PROTOCOL.</b>',
 'One operator goes down floor by floor. Restore what can be restored, burn out what cannot, and stop the Overmind at the bottom.',
 'You are that operator. Nobody else is coming down with you.',
 '<i>Descent authorised. Good luck.</i>'];
const ENDING=[
 '<h1>CORE SILENCED</h1>',
 'The Overmind breaks apart into ash and light. On every floor above you, the swarm stops moving at the same moment.',
 'For the first time in forty-one hours, KESTREL-9 is quiet.',
 'The extraction lift climbs past thirty floors of wreckage. The lights you restored are still burning.',
 'Up on the surface, the consortium is already drafting the report. You will not be in it.',
 'Then a single line scrolls across the lift console:',
 '<b>SIGNAL DETECTED — DEEP SITE KESTREL-10</b>',
 '<i>The protocol is never really over.</i>'];
const CREDITS=[
 ['THE DESCENT PROTOCOL',''],
 ['Game design & direction','Granite'],
 ['Programming, art & audio','Built with Grok Bot for Granite'],
 ['Engine','three.js r160 (MIT) · Web Audio API'],
 ['Rendering','UnrealBloomPass · EffectComposer (three.js addons)'],
 ['Music & SFX','Procedurally synthesised at runtime — no samples'],
 ['Models','Procedural primitives — no external assets'],
 ['Playtesting','The audit bot (died many, many times)'],
 ['','© All rights reserved. See LICENSE.']];
function crawl(lines,opt){opt=opt||{};let el=document.getElementById('crawl');if(!el){el=document.createElement('div');el.id='crawl';document.body.appendChild(el)}
 el.innerHTML='<div class="cr-mask"><div class="cr-in">'+lines.map(l=>l.startsWith('<h1>')?l:'<p>'+l+'</p>').join('')+(opt.extra||'')+'</div></div><div class="cr-skip">'+(opt.hint||'Click / Space / tap to continue')+'</div>';
 el.className='on'+(opt.cls?' '+opt.cls:'');const inner=el.querySelector(".cr-in");const dur=opt.dur||(lines.length*3.2+4);
 inner.style.animation='none';void inner.offsetWidth;inner.style.animation=`crawlUp ${dur}s linear forwards`;
 let done=false,t0=performance.now(),armed=false;setTimeout(()=>armed=true,400);
 const finish=()=>{if(done)return;done=true;el.className='';el.innerHTML='';removeEventListener('keydown',kh,true);el.removeEventListener('pointerdown',ph);clearTimeout(to);opt.onDone&&opt.onDone()};
 const kh=e=>{if(!armed)return;if(e.key===' '||e.key==='Enter'||e.key==='Escape'){e.stopPropagation();e.preventDefault();finish()}};
 const ph=e=>{e.stopPropagation();if(armed)finish()};
 addEventListener('keydown',kh,true);el.addEventListener('pointerdown',ph);['mousedown','touchstart'].forEach(t=>el.addEventListener(t,e=>e.stopPropagation()));const to=setTimeout(finish,dur*1000+(opt.hold||2500));
 return{finish,active:()=>!done,elapsed:()=>(performance.now()-t0)/1000}}
function creditsHTML(){return CREDITS.map(([a,b])=>`<div class="cr-row"><span>${a}</span>${b?`<b>${b}</b>`:''}</div>`).join('')}
window.TDP_STORY={INTRO,ENDING,CREDITS,crawl,creditsHTML};
})();
