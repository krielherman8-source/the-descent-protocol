/* THE DESCENT PROTOCOL — gamepad + touch (twin virtual thumbsticks). Classic script; the game calls
   TDP_INPUT.init(api) once and TDP_INPUT.poll(dt) every frame. api = {IN, keys, onKey, tap(x,y), state(), cycleWeapon(d), menuOpen(), useEdge()}
   Pad buttons are remappable (js/settings.js TDP_SETTINGS.pad(action) -> Standard-Gamepad button index). */
(function(){
let A=null;const DZ=.22;
// ---------------- GAMEPAD ----------------
const prev={};let padOn=false,menuIdx=0,repeatT=0;
function btn(gp,i){const b=gp.buttons[i];return !!b&&(b.pressed||b.value>.4)}
function edge(gp,i){const k=gp.index+':'+i,v=btn(gp,i),e=v&&!prev[k];prev[k]=v;return e}
const PB=a=>window.TDP_SETTINGS?TDP_SETTINGS.pad(a):({fire:7,use:0,wprev:4,wnext:5,drone:3,pause:9,back:1})[a];
const listenOn=()=>!!(window.TDP_SETTINGS&&TDP_SETTINGS.padListening());let wasListening=false;
const toggleMode=()=>!!(window.CFG&&CFG.interact==='toggle');
function analog(gp,i){const b=gp.buttons[i];return !!b&&(b.pressed||b.value>.25)}
function crawlOn(){const c=document.getElementById('crawl');return c&&c.classList.contains('on')}
function sendKey(k){dispatchEvent(new KeyboardEvent('keydown',{key:k}));setTimeout(()=>dispatchEvent(new KeyboardEvent('keyup',{key:k})),30)}
function menuNav(gp){const bs=[...document.querySelectorAll('#menu .panel.on button:not(:disabled)')];if(!bs.length)return;
 const ay=gp.axes[1]||0;repeatT-=1/60;let mv=0;if(edge(gp,12))mv=-1;if(edge(gp,13))mv=1;if(Math.abs(ay)>.6&&repeatT<=0){mv=Math.sign(ay);repeatT=.22}if(Math.abs(ay)<.3)repeatT=0;
 if(mv){menuIdx=(menuIdx+mv+bs.length)%bs.length;bs[menuIdx].focus()}if(!bs.includes(document.activeElement)){menuIdx=Math.min(menuIdx,bs.length-1);bs[menuIdx].focus()}
 if(edge(gp,0)||edge(gp,PB('use'))){bs[menuIdx].dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));bs[menuIdx].click()}
 if(edge(gp,PB('back'))||edge(gp,PB('pause')))A.onKey('escape')}
function pollPad(){const gps=navigator.getGamepads?[...navigator.getGamepads()].filter(Boolean):[];if(!gps.length){if(padOn){padOn=false;A.IN.mx=A.IN.my=0;A.IN.fire=false}return}
 const gp=gps[0],IN=A.IN,st=A.state();
 if(!padOn){const any=gp.buttons.some(b=>b.pressed)||gp.axes.some(a=>Math.abs(a)>.5);if(!any)return;padOn=true;IN.src='pad';document.body.classList.add('pad')}
 // remap capture: the next button that goes down (after the listen started) is bound
 if(listenOn()){if(!wasListening){wasListening=true;for(let i=0;i<gp.buttons.length;i++)prev[gp.index+':'+i]=btn(gp,i);return}
  for(let i=0;i<gp.buttons.length;i++)if(edge(gp,i)){TDP_SETTINGS.padCapture(i);break}
  for(let i=0;i<gp.buttons.length;i++)prev[gp.index+':'+i]=btn(gp,i);return}
 if(wasListening){wasListening=false;for(let i=0;i<gp.buttons.length;i++)prev[gp.index+':'+i]=btn(gp,i);return}
 if(crawlOn()){if(edge(gp,0)||edge(gp,9))sendKey(' ');return}
 if(A.menuOpen()){IN.mx=IN.my=0;IN.fire=false;menuNav(gp);return}
 let lx=gp.axes[0]||0,ly=gp.axes[1]||0;const lm=Math.hypot(lx,ly);if(lm<DZ){lx=ly=0}else{const k=Math.min(1,(lm-DZ)/(1-DZ))/lm;lx*=k;ly*=k}
 if(btn(gp,14))lx=-1;if(btn(gp,15))lx=1;if(btn(gp,12))ly=-1;if(btn(gp,13))ly=1;
 const rx=gp.axes[2]||0,ry=gp.axes[3]||0,rm=Math.hypot(rx,ry);
 if(st==='play'){IN.mx=lx;IN.my=ly;if(rm>.3){IN.aim=Math.atan2(ry,rx);IN.src='pad'}else if(lm>.5&&IN.src==='pad'&&!(gp.buttons[7]&&gp.buttons[7].value>.2))IN.aim=Math.atan2(ly,lx);
  IN.fire=rm>.55||analog(gp,PB('fire'));const u=PB('use');A.keys.e=btn(gp,u);if(edge(gp,u)&&toggleMode())A.useEdge&&A.useEdge();
  if(edge(gp,PB('wprev')))A.cycleWeapon(-1);if(edge(gp,PB('wnext')))A.cycleWeapon(1);if(edge(gp,PB('drone')))A.onKey('q');if(edge(gp,PB('pause')))A.onKey('escape')}
 else{IN.mx=IN.my=0;IN.fire=false;A.keys.e=false;
  if(st==='upgrade'){if(edge(gp,2))A.onKey('1');if(edge(gp,0))A.onKey('2');if(edge(gp,1))A.onKey('3')}
  else if(st==='dead'||st==='victory'){if(edge(gp,0))A.onKey('r');if(edge(gp,PB('back')))A.onKey('escape')}
  else if(edge(gp,PB('pause')))A.onKey('escape')}
 for(let i=0;i<gp.buttons.length;i++)prev[gp.index+':'+i]=btn(gp,i)}
// ---------------- TOUCH ----------------
let ui=null,touchOn=false;const sticks={L:null,R:null};const R=56;
function el(tag,cls,html){const e=document.createElement(tag);e.className=cls;if(html)e.innerHTML=html;return e}
function buildUI(){ui=el('div','');ui.id='touchui';
 for(const s of['L','R']){const b=el('div','stk-base'),k=el('div','stk-knob');b.appendChild(k);b.id='stk'+s;ui.appendChild(b)}
 const bt=[['tb-e','USE','e'],['tb-w','WPN','w'],['tb-d','DRN','q'],['tb-p','❚❚','escape']];
 for(const[id,lab,k]of bt){const b=el('div','tbtn',lab);b.id=id;ui.appendChild(b);
  b.addEventListener('touchstart',ev=>{ev.preventDefault();ev.stopPropagation();b.classList.add('dn');if(k==='e'){A.keys.e=true;toggleMode()&&A.useEdge&&A.useEdge()}else if(k==='w')A.cycleWeapon(1);else A.onKey(k)},{passive:false});
  const up=ev=>{ev.preventDefault();b.classList.remove('dn');if(k==='e')A.keys.e=false};b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false})}
 const hint=el('div','thint','LEFT STICK: MOVE · RIGHT STICK: AIM & FIRE');ui.appendChild(hint);
 document.body.appendChild(ui)}
function enableTouch(){if(touchOn)return;touchOn=true;if(!ui)buildUI();document.body.classList.add('touch');A.IN.src='touch'}
function inUI(t){return t&&t.closest&&(t.closest('#menu:not(.hide)')||t.closest('#crawl.on')||t.closest('.tbtn'))}
function showStick(s,st){const b=document.getElementById('stk'+s);if(!b)return;if(!st){b.style.display='none';return}b.style.display='block';b.style.left=(st.x0-R)+'px';b.style.top=(st.y0-R)+'px';
 const k=b.firstChild;k.style.transform=`translate(${st.dx}px,${st.dy}px)`}
function onStart(ev){enableTouch();if(inUI(ev.target))return;const st=A.state();
 if(st!=='play'){ev.preventDefault();const t=ev.changedTouches[0];A.tap(t.clientX,t.clientY);return}
 ev.preventDefault();for(const t of ev.changedTouches){const side=t.clientX<innerWidth/2?'L':'R';if(sticks[side])continue;sticks[side]={id:t.identifier,x0:t.clientX,y0:t.clientY,dx:0,dy:0};showStick(side,sticks[side])}apply()}
function onMove(ev){if(!touchOn)return;let used=false;for(const t of ev.changedTouches)for(const s of['L','R']){const st=sticks[s];if(st&&st.id===t.identifier){used=true;let dx=t.clientX-st.x0,dy=t.clientY-st.y0;const m=Math.hypot(dx,dy);if(m>R){
   // floating base: drag the base along when pulled past the rim
   st.x0+=dx/m*(m-R);st.y0+=dy/m*(m-R);dx=dx/m*R;dy=dy/m*R}st.dx=dx;st.dy=dy;showStick(s,st)}}if(used){ev.preventDefault();apply()}}
function onEnd(ev){if(!touchOn)return;for(const t of ev.changedTouches)for(const s of['L','R']){const st=sticks[s];if(st&&st.id===t.identifier){sticks[s]=null;showStick(s,null)}}apply()}
function apply(){const IN=A.IN,L=sticks.L,Rr=sticks.R;if(L){const m=Math.hypot(L.dx,L.dy),k=m<8?0:Math.min(1,m/R)/m;IN.mx=L.dx*k;IN.my=L.dy*k}else{IN.mx=IN.my=0}
 if(Rr){const m=Math.hypot(Rr.dx,Rr.dy);if(m>10){IN.aim=Math.atan2(Rr.dy,Rr.dx);IN.fire=true}else IN.fire=false}else IN.fire=false}
function init(api){A=api;addEventListener('touchstart',onStart,{passive:false});addEventListener('touchmove',onMove,{passive:false});addEventListener('touchend',onEnd,{passive:false});addEventListener('touchcancel',onEnd,{passive:false});
 addEventListener('gamepadconnected',()=>{});if(/[?&]touch=1/.test(location.search))enableTouch()}
function poll(){if(!A)return;try{pollPad()}catch(e){}if(touchOn&&ui)ui.classList.toggle('hidden',A.state()!=='play')}
window.TDP_INPUT={init,poll,touchActive:()=>touchOn,padActive:()=>padOn,_sticks:sticks};
})();
