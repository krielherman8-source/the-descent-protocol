/* The Descent Protocol — controls (keyboard + gamepad remapping), control options, settings migration and
   colourblind-friendly markers (classic script, window.TDP_SETTINGS).
   Keyboard rebinding is a thin remap layer: the game keeps reading LOGICAL keys (w/a/s/d/e/q, '1'..'7', 'fire',
   'wprev', 'wnext', 'escape' = pause, 'r' = restart); the keydown/keyup listener passes raw keys through mapKey().
   Esc is reserved: it always pauses / goes back and cancels a rebind, so it can't be bound to anything else.
   Gamepad remapping stores a Standard-Gamepad button index per pad action (see PAD); js/input.js reads pad(a).
   Colourblind mode swaps objective/exit/boss/hazard marker colours for the Okabe–Ito palette and adds a distinct
   shape per marker role. */
(function(){
const VERSION=3;  // v3: + endless (post-game unlock flag)
// [logical action, label, default raw key]
const KB=[['w','MOVE UP','w'],['a','MOVE LEFT','a'],['s','MOVE DOWN','s'],['d','MOVE RIGHT','d'],
 ['fire','FIRE','f'],['e','INTERACT','e'],['q','CYCLE DRONE','q'],['wprev','PREV WEAPON','z'],['wnext','NEXT WEAPON','x'],
 ['1','WEAPON 1','1'],['2','WEAPON 2','2'],['3','WEAPON 3','3'],['4','WEAPON 4','4'],['5','WEAPON 5','5'],['6','WEAPON 6','6'],['7','WEAPON 7','7'],
 ['escape','PAUSE','p'],['r','RESTART','r']];
const KDEF=Object.fromEntries(KB.map(([a,,k])=>[a,k]));
// [pad action, label, default Standard-Gamepad button index]
const PAD=[['fire','FIRE',7],['use','USE / INTERACT',0],['wprev','PREV WEAPON',4],['wnext','NEXT WEAPON',5],['drone','CYCLE DRONE',3],['pause','PAUSE',9],['back','BACK',1]];
const PDEF=Object.fromEntries(PAD.map(([a,,b])=>[a,b]));
const PAD_NAMES=['A','B','X','Y','LB','RB','LT','RT','SELECT','START','L3','R3','D-UP','D-DOWN','D-LEFT','D-RIGHT','HOME'];
const PAD_RESERVED=[12,13,14,15];// d-pad: movement + menu navigation
const NAMED=['arrowup','arrowdown','arrowleft','arrowright','shift','control','alt','tab','enter','backspace'];
const ACTIONS=KB.map(([a,n])=>[a,n]);// back-compat export
const OKABE={objective:'#F0E442',exit:'#56B4E9',boss:'#D55E00',enemy:'#E69F00',laser:'#CC79A7',acid:'#009E73',frost:'#FFFFFF',steam:'#E69F00',mortar:'#CC79A7',item:{hold:'#F0E442',shoot:'#D55E00',touch:'#56B4E9',zone:'#009E73',pickup:'#F0E442',escort:'#56B4E9',cell:'#F0E442',socket:'#F0E442',defend:'#009E73'}};
const SHAPE={hold:'diamond',shoot:'cross',touch:'triangle',zone:'ring',pickup:'square',escort:'triangle',cell:'square',socket:'diamond',defend:'ring',exit:'square',boss:'triangle'};
let CFG,save,sfx,rev={},listening=null,ui=null,onChange=null;
const isObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const validKey=k=>typeof k==='string'&&k!=='escape'&&(k.length===1||NAMED.includes(k));
const validBtn=b=>Number.isInteger(b)&&b>=0&&b<PAD_NAMES.length&&!PAD_RESERVED.includes(b);
// ---------- settings schema / migration ----------
// Keep only the overrides that are valid and leave every action with a unique key/button; anything else falls back to defaults.
// Conflicts: an override beats a default (the default-holder moves to a free fallback key, e.g. an old-schema 'e'->'f'
// bind keeps working and the new FIRE action moves); two clashing overrides -> the later one falls back to its default.
function cleanMap(src,list,def,valid,pool){const out={};if(!isObj(src))return out;
 for(const[a]of list){const v=src[a];if(valid(v)&&v!==def[a])out[a]=v}
 for(let guard=0;guard<list.length*3;guard++){const eff=list.map(([a])=>a in out?out[a]:def[a]);let I=-1,J=-1;
  for(let i=0;i<eff.length&&I<0;i++)for(let j=0;j<i;j++)if(eff[i]===eff[j]){I=i;J=j;break}
  if(I<0)return out;const ai=list[I][0],aj=list[J][0],oi=ai in out,oj=aj in out;
  if(oi&&oj)delete out[ai];
  else{const mv=oi?aj:ai,free=pool.find(k=>!eff.includes(k));if(free===undefined)return {};out[mv]=free}}
 return {}}
function migrate(raw,def){const o=JSON.parse(JSON.stringify(def||{}));const r=isObj(raw)?raw:{};
 o.vol=isObj(o.vol)?o.vol:{master:.8,sfx:.8,music:.55};
 if(isObj(r.vol))for(const c of['master','sfx','music']){const v=r.vol[c];if(typeof v==='number'&&isFinite(v))o.vol[c]=Math.min(1,Math.max(0,v))}
 if(['low','med','high'].includes(r.quality))o.quality=r.quality;
 if(['easy','normal','hard'].includes(r.diff))o.diff=r.diff;
 for(const b of['shake','tut','cb','autofire','endless'])if(typeof r[b]==='boolean')o[b]=r[b];
 if(typeof o.cb!=='boolean')o.cb=false;if(typeof o.autofire!=='boolean')o.autofire=false;if(typeof o.endless!=='boolean')o.endless=false;
 o.interact=r.interact==='toggle'?'toggle':'hold';
 o.binds=cleanMap(r.binds,KB,KDEF,validKey,[...'fzxcvgtyuhjklbnmoip8902345671']);o.pad=cleanMap(r.pad,PAD,PDEF,validBtn,[2,6,8,10,11,16,0,1,3,4,5,7,9]);
 o.v=VERSION;return o}
// ---------- keyboard ----------
const key=a=>(CFG&&CFG.binds&&CFG.binds[a])||KDEF[a];
function rebuild(){rev={};for(const[a]of KB)rev[key(a)]=a}
// raw key -> logical key. Esc is fixed; a default key whose action was moved elsewhere becomes inert ('_'+k).
function mapKey(k){if(listening)return '\u0000';if(k==='escape')return 'escape';if(rev[k])return rev[k];
 if(KB.some(([,,d])=>d===k)||KB.some(([a])=>a===k))return '_'+k;return k}
function label(k){return({' ':'SPACE',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',control:'CTRL',escape:'ESC',backspace:'BKSP'})[k]||String(k).toUpperCase()}
const keyLabel=a=>label(key(a));
function slotsLabel(){const l=['1','2','3','4','5','6','7'].map(keyLabel);return l.join('')==='1234567'?'1-7':l.join(' ')}
function bindKey(X,k){const old=key(X);for(const[a2]of KB)if(a2!==X&&key(a2)===k)setKey(a2,old);setKey(X,k);rebuild();save()}
function setKey(a,k){if(k===KDEF[a])delete CFG.binds[a];else CFG.binds[a]=k}
// ---------- gamepad ----------
const pad=a=>(CFG&&CFG.pad&&a in CFG.pad)?CFG.pad[a]:PDEF[a];
const padName=b=>PAD_NAMES[b]||('B'+b);
const padLabel=a=>padName(pad(a));
function setPad(a,b){if(b===PDEF[a])delete CFG.pad[a];else CFG.pad[a]=b}
// called by js/input.js with the index of the next newly-pressed button while a pad action is listening
function padCapture(b){if(!listening||listening.kind!=='pad')return false;if(!validBtn(b)){flash='D-pad is reserved';refresh();return true}
 const X=listening.a,old=pad(X);for(const[a2]of PAD)if(a2!==X&&pad(a2)===b)setPad(a2,old);setPad(X,b);listening=null;flash='';save();refresh();sfx&&sfx('ui');return true}
let flash='';
const padListening=()=>!!(listening&&listening.kind==='pad');
function cancel(){if(listening){listening=null;flash='';refresh()}}
function resetKeys(){CFG.binds={};rebuild();listening=null;save();refresh()}
function resetPad(){CFG.pad={};listening=null;save();refresh()}
function setInteract(m){CFG.interact=m==='toggle'?'toggle':'hold';save();refresh()}
function setAutofire(v){CFG.autofire=!!v;save();refresh()}
// ---------- UI ----------
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function init(o){CFG=o.CFG;save=()=>{o.save();onChange&&onChange()};sfx=o.sfx;onChange=o.onChange||null;
 CFG.binds=isObj(CFG.binds)?CFG.binds:{};CFG.pad=isObj(CFG.pad)?CFG.pad:{};if(CFG.cb===undefined)CFG.cb=false;rebuild();
 const panel=document.getElementById('m-settings');if(panel){const back=panel.querySelector('button[data-a="back"]');
  const cb=el('label',null,'COLOURBLIND MARKERS <input type="checkbox" id="s-cb">');panel.insertBefore(cb,back);
  cb.querySelector('input').addEventListener('change',e=>{CFG.cb=e.target.checked;save();sfx&&sfx('ui')})}
 const cp=document.getElementById('m-controls');
 if(cp){ui={kb:{},pad:{}};const back=cp.querySelector('button[data-a="back"]');
  const kb=el('div','binds');kb.id='ctl-kb';kb.appendChild(el('div','small dim','KEYBOARD — click an action, then press a key · Esc cancels · conflicts swap · Esc always pauses / goes back'));
  for(const[a,n]of KB){const b=el('button','bind');b.dataset.bind=a;b.addEventListener('click',ev=>{ev.stopPropagation();listening={kind:'kb',a};flash='';refresh();sfx&&sfx('ui')});kb.appendChild(b);ui.kb[a]=[b,n]}
  const rk=el('button','bind rs','RESET KEYS');rk.id='rs-kb';rk.addEventListener('click',ev=>{ev.stopPropagation();resetKeys()});kb.appendChild(rk);
  const pd=el('div','binds');pd.id='ctl-pad';pd.appendChild(el('div','small dim','GAMEPAD (standard mapping) — click an action, then press a pad button · Esc cancels'));
  for(const[a,n]of PAD){const b=el('button','bind');b.dataset.pad=a;b.addEventListener('click',ev=>{ev.stopPropagation();listening={kind:'pad',a};flash='';refresh();sfx&&sfx('ui')});pd.appendChild(b);ui.pad[a]=[b,n]}
  const rp=el('button','bind rs','RESET PAD');rp.id='rs-pad';rp.addEventListener('click',ev=>{ev.stopPropagation();resetPad()});pd.appendChild(rp);
  const op=el('div','binds');op.id='ctl-opt';
  const im=el('button','bind');im.id='s-interact';im.addEventListener('click',ev=>{ev.stopPropagation();setInteract(CFG.interact==='toggle'?'hold':'toggle');sfx&&sfx('ui')});
  const af=el('button','bind');af.id='s-autofire';af.addEventListener('click',ev=>{ev.stopPropagation();setAutofire(!CFG.autofire);sfx&&sfx('ui')});
  op.appendChild(im);op.appendChild(af);
  const msg=el('div','small');msg.id='ctl-msg';
  const fx=el('table');fx.id='ctl-fixed';
  for(const n of[kb,pd,op,msg,fx])cp.insertBefore(n,back);ui.im=im;ui.af=af;ui.msg=msg;ui.fx=fx}
 refresh();
 addEventListener('keydown',e=>{if(!listening)return;e.preventDefault();e.stopImmediatePropagation();const k=e.key.toLowerCase();
  if(k==='escape'){listening=null;flash='';refresh();return}
  if(listening.kind==='kb'&&validKey(k)){bindKey(listening.a,k);listening=null;flash=''}else if(listening.kind==='kb')flash='That key can\u2019t be bound';
  refresh()},true)}
function refresh(){const cbI=document.getElementById('s-cb');if(cbI&&CFG)cbI.checked=!!CFG.cb;if(!ui||!CFG)return;
 for(const a in ui.kb){const[b,n]=ui.kb[a],on=listening&&listening.kind==='kb'&&listening.a===a;b.textContent=on?`${n}: press a key…`:`${n}: ${keyLabel(a)}`;b.classList.toggle('on',!!on)}
 for(const a in ui.pad){const[b,n]=ui.pad[a],on=listening&&listening.kind==='pad'&&listening.a===a;b.textContent=on?`${n}: press a pad button…`:`${n}: ${padLabel(a)}`;b.classList.toggle('on',!!on)}
 ui.im.textContent='INTERACT MODE: '+(CFG.interact==='toggle'?'TOGGLE':'HOLD');ui.af.textContent='AUTO-FIRE: '+(CFG.autofire?'ON':'OFF');ui.af.classList.toggle('lit',!!CFG.autofire);
 ui.msg.textContent=flash||'';
 const R=[['MOUSE','Aim · hold left button to fire'+(CFG.autofire?' (auto-fire is ON: fires at the aim point)':'')],
  ['ESC','Pause / back (always) · '+keyLabel('escape')+' also pauses'],['1/2/3 · click','Choose upgrade in chamber'],
  ['GAMEPAD',`L-stick/d-pad move · R-stick aim+fire · ${padLabel('fire')} fire · ${padLabel('use')} use · ${padLabel('wprev')}/${padLabel('wnext')} weapon · ${padLabel('drone')} drone · ${padLabel('pause')} pause · ${padLabel('back')} back`],
  ['TOUCH','Left thumb move · right thumb aim+fire · USE / WPN / DRN buttons']];
 ui.fx.innerHTML=R.map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('')}
// HUD helpers: the verb + control for the current input source
const useVerb=()=>CFG&&CFG.interact==='toggle'?'PRESS':'HOLD';
function useCtl(src){return src==='pad'?padLabel('use'):src==='touch'?'USE':keyLabel('e')}
function on(){return !!(CFG&&CFG.cb)}
function itemColor(o){return on()&&OKABE.item[o.kind]?OKABE.item[o.kind]:o.color}
function col(role,def){return on()?(OKABE[role]||def):def}
// draw a marker glyph centred at x,y of radius r (used by the minimap and edge arrows in colourblind mode)
function glyph(ctx,shape,x,y,r){ctx.beginPath();if(shape==='diamond'){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.fill()}
 else if(shape==='triangle'){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y+r*.8);ctx.lineTo(x-r,y+r*.8);ctx.closePath();ctx.fill()}
 else if(shape==='square'){ctx.rect(x-r*.8,y-r*.8,r*1.6,r*1.6);ctx.fill()}
 else if(shape==='cross'){const w=r*.45;ctx.rect(x-r,y-w,r*2,w*2);ctx.rect(x-w,y-r,w*2,r*2);ctx.fill()}
 else{ctx.arc(x,y,r,0,7);ctx.lineWidth=Math.max(1.5,r*.4);ctx.strokeStyle=ctx.fillStyle;ctx.stroke()}}
window.TDP_SETTINGS={VERSION,init,migrate,mapKey,key,keyLabel,label,slotsLabel,pad,padLabel,padName,padCapture,padListening,cancel,resetKeys,resetPad,setInteract,setAutofire,
 useVerb,useCtl,itemColor,col,glyph,SHAPE,on,refresh,ACTIONS,KB,PAD,KDEF,PDEF,PAD_NAMES};
})();
