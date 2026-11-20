/* THE DESCENT PROTOCOL — loadout panel + compact HUD chips. Classic script; index.html calls TDP_GEAR.init(api) once.
   api = {S:()=>state, WEAPONS, DRONES, MODS, wLevel, wGrade, wMul, KPL, kL, setWeapon(k), setDrone(k), close()}
   The panel is DOM (large touch targets, tap-outside / X / Esc / Tab to close); the game freezes while it is open (state 'gear'). */
(function(){
let A=null,root=null,box=null,chips=null,cw=null,cd=null,lastW='',lastD='',chipBottom=0,last={};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const compact=()=>!!(window.TDP_MOB||innerWidth<900||innerHeight<430);
const touchy=()=>!!(window.TDP_MOB||document.body.classList.contains('touch'));
const tiny=()=>compact()&&innerHeight<=560;
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function stop(e){e.stopPropagation()}
function init(api){A=api;
 chips=el('div');chips.id='gchips';
 cw=el('button','gchip');cw.id='gc-w';cw.type='button';cd=el('button','gchip');cd.id='gc-d';cd.type='button';
 chips.append(cw,cd);document.body.appendChild(chips);
 for(const b of[cw,cd]){for(const ev of['mousedown','mouseup','touchstart','touchend','pointerdown'])b.addEventListener(ev,stop,{passive:true});
  // tap = open loadout panel; long-press (0.45s) = quick-swap to the next weapon / drone
  let tm=0,lp=false;const swap=()=>{lp=true;if(b===cw)A.cycleWeapon();else A.cycleDrone();last.w=null;if(navigator.vibrate)try{navigator.vibrate(18)}catch(e){}};
  const cancel=()=>{clearTimeout(tm)};
  b.addEventListener('touchstart',()=>{lp=false;clearTimeout(tm);tm=setTimeout(swap,450)},{passive:true});
  b.addEventListener('touchend',cancel,{passive:true});b.addEventListener('touchcancel',cancel,{passive:true});b.addEventListener('touchmove',cancel,{passive:true});
  b.addEventListener('contextmenu',e=>e.preventDefault());
  b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();if(lp){lp=false;return}toggle()})}
 root=el('div');root.id='gear';box=el('div','gbox');root.appendChild(box);document.body.appendChild(root);
 for(const ev of['mousedown','mouseup','touchstart','touchend','pointerdown'])root.addEventListener(ev,stop,{passive:true});
 root.addEventListener('click',e=>{if(e.target===root)A.close()});
 addEventListener('resize',()=>{last={};if(root.classList.contains('on'))render()})}
function toggle(){const s=A.S();if(!s)return;if(s.state==='gear')A.close();else A.open()}
function modsOf(p,k){const m=(p.mods&&p.mods[k])||[];return m.length?m.map(x=>A.MODS[x]?A.MODS[x].name:x).join(', '):'none'}
function render(){const s=A.S();if(!s||!s.p)return;const p=s.p;
 const key=i=>i+1;
 const W=p.weapons.map((k,i)=>{const w=A.WEAPONS[k],lv=A.wLevel(p,k),gr=A.wGrade(p,k)+1,xp=((p.wxp||{})[k]||0),nx=lv>=30?'max level':`${A.KPL-(xp%A.KPL)} kills to Lv ${lv+1}`;
  return `<button type="button" class="grow${k===p.weapon?' on':''}" data-w="${k}"><img class="gi" alt="" src="${A.icon('weapon',k)}"><div class="gb"><div class="r1"><span class="gk">${key(i)}</span><span class="gn">${esc(w.name)}</span><span class="gm">Mk ${gr} · Lv ${lv}</span></div>`+
  `<div class="r2">${lv?`+${lv*2}% fire rate · `:''}${nx}<br>Mods: ${esc(modsOf(p,k))}</div></div></button>`}).join('');
 const D=p.drones.map(k=>{const d=A.DRONES[k],on=k===p.drone;
  return `<button type="button" class="grow${on?' on':''}" data-d="${k}"><img class="gi" alt="" src="${A.icon('drone',k)}"><div class="gb"><div class="r1"><span class="gn">${esc(d.name)}</span><span class="gm">${on?'<span class="tag">ACTIVE</span>':'standby'}</span></div><div class="r2">${esc(d.desc||'')}${on&&k==='bastion'?(p.shield?' · shield up':' · shield charging'):''}</div></div></button>`}).join('');
 box.innerHTML=`<div class="ghd"><div class="gt">LOADOUT</div><div class="gh">TAB / ESC to close · keys 1-${Math.max(1,p.weapons.length)} weapon · ${esc(A.kL('q'))} drone</div><button type="button" class="gx" aria-label="Close">✕</button></div>`+
  `<div class="gcols"><div><h4>WEAPONS</h4>${W}</div><div><h4>DRONES</h4>${D||'<div class="r2">none</div>'}</div></div>`;
 box.querySelector('.gx').addEventListener('click',e=>{e.stopPropagation();A.close()});
 box.querySelectorAll('[data-w]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();A.setWeapon(b.dataset.w);render()}));
 box.querySelectorAll('[data-d]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();A.setDrone(b.dataset.d);render()}))}
function show(){document.body.classList.toggle('compact',compact());render();root.classList.add('on');cw.classList.add('on')}
function hide(){root.classList.remove('on');cw.classList.remove('on');cd.classList.remove('on')}
/* per-frame from drawHUD: o={show,left,top,scale} (css px); keeps the two chips' text current and returns the chips' height (css px) */
function hud(o){if(!chips)return 0;const s=A.S();const vis=!!o.show;
 if(last.vis!==vis){chips.style.display=vis?'flex':'none';last.vis=vis}
 if(!vis)return 0;
 const cm=compact();if(last.cm!==cm){document.body.classList.toggle('compact',cm);last.cm=cm;last.lt=null}
 const ic=touchy();if(last.ic!==ic){chips.classList.toggle('ic',ic);last.ic=ic;last.lt=null;lastW=lastD=''}
 const tn=tiny();if(last.tn!==tn){document.body.classList.toggle('tiny',tn);last.tn=tn;last.lt=null}
 if(last.l!==o.left||last.t!==o.top){chips.style.left=o.left+'px';chips.style.top=o.top+'px';last.l=o.left;last.t=o.top;last.lt=null}
 const p=s.p,w=A.WEAPONS[p.weapon],d=A.DRONES[p.drone],i=p.weapons.indexOf(p.weapon);
 const tw=ic?`<img alt="" src="${A.icon('weapon',p.weapon)}"><u>${A.wGrade(p,p.weapon)+1}</u>`:`<b>${i+1}</b> ${esc(w.name)} <i>Mk ${A.wGrade(p,p.weapon)+1} · Lv ${A.wLevel(p,p.weapon)}</i>`,td=ic?(d?`<img alt="" src="${A.icon('drone',p.drone)}">`:'<b>◎</b>'):`<b>◎</b> ${esc(d?d.name:'-')}`;
 cw.setAttribute('aria-label','Weapon: '+w.name+' (tap: loadout, hold: next weapon)');cd.setAttribute('aria-label','Drone: '+(d?d.name:'none')+' (tap: loadout, hold: next drone)');cd.style.display=(ic&&!d)?'none':'';
 if(tw!==lastW){cw.innerHTML=tw;lastW=tw;last.lt=null}if(td!==lastD){cd.innerHTML=td;lastD=td;last.lt=null}
 if(last.lt==null){last.lt=1;chipBottom=chips.offsetHeight}
 return chipBottom}
window.TDP_GEAR={init,show,hide,hud,toggle,render,isOpen:()=>!!root&&root.classList.contains('on'),get compact(){return compact()},get tiny(){return tiny()}};
})();
