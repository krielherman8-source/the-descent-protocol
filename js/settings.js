/* The Descent Protocol — key rebinding + colourblind-friendly markers (classic script, window.TDP_SETTINGS).
   Rebinding is a thin remap layer: the game keeps reading logical keys (w/a/s/d/e/q); the keydown/keyup
   listener passes raw keys through mapKey().  Colourblind mode swaps objective/exit/boss/hazard marker
   colours for the Okabe–Ito palette and adds a distinct shape per marker role. */
(function(){
const ACTIONS=[['w','MOVE UP'],['a','MOVE LEFT'],['s','MOVE DOWN'],['d','MOVE RIGHT'],['e','INTERACT / HOLD'],['q','CYCLE DRONE']];
const OKABE={objective:'#F0E442',exit:'#56B4E9',boss:'#D55E00',enemy:'#E69F00',laser:'#CC79A7',acid:'#009E73',frost:'#FFFFFF',steam:'#E69F00',mortar:'#CC79A7',item:{hold:'#F0E442',shoot:'#D55E00',touch:'#56B4E9',zone:'#009E73',pickup:'#F0E442',escort:'#56B4E9',cell:'#F0E442',socket:'#F0E442',defend:'#009E73'}};
const SHAPE={hold:'diamond',shoot:'cross',touch:'triangle',zone:'ring',pickup:'square',escort:'triangle',cell:'square',socket:'diamond',defend:'ring',exit:'square',boss:'triangle'};
let CFG,save,rev={},listening=null,ui=null;
function rebuild(){rev={};for(const[a]of ACTIONS){const k=(CFG.binds&&CFG.binds[a])||a;rev[k]=a}}
// raw key -> logical key. A default key whose action was moved elsewhere becomes inert ('_'+k).
function mapKey(k){if(listening)return '\u0000';if(rev[k])return rev[k];if(ACTIONS.some(([a])=>a===k))return '_'+k;return k}
function init(o){CFG=o.CFG;save=o.save;CFG.binds=CFG.binds||{};if(CFG.cb===undefined)CFG.cb=false;rebuild();
 const panel=document.getElementById('m-settings');if(!panel)return;const back=panel.querySelector('button[data-a="back"]');
 const cb=document.createElement('label');cb.innerHTML='COLOURBLIND MARKERS <input type="checkbox" id="s-cb">';panel.insertBefore(cb,back);
 const cbI=cb.querySelector('input');cbI.checked=CFG.cb;cbI.addEventListener('change',e=>{CFG.cb=e.target.checked;save();o.sfx&&o.sfx('ui')});
 const box=document.createElement('div');box.className='binds';box.innerHTML='<div class="small dim">KEY BINDINGS — click an action, then press a key (Esc cancels)</div>';
 ui={};for(const[a,n]of ACTIONS){const b=document.createElement('button');b.className='bind';b.dataset.bind=a;b.addEventListener('click',ev=>{ev.stopPropagation();listening=a;refresh();o.sfx&&o.sfx('ui')});box.appendChild(b);ui[a]=[b,n]}
 const rs=document.createElement('button');rs.className='bind';rs.textContent='RESET KEYS';rs.addEventListener('click',ev=>{ev.stopPropagation();CFG.binds={};rebuild();save();refresh()});box.appendChild(rs);
 panel.insertBefore(box,back);refresh();
 addEventListener('keydown',e=>{if(!listening)return;e.preventDefault();e.stopImmediatePropagation();const k=e.key.toLowerCase();
  const ok=k.length===1||['arrowup','arrowdown','arrowleft','arrowright','shift','control','tab'].includes(k);
  if(k!=='escape'&&ok&&!'1234567'.includes(k)){const X=listening,old=CFG.binds[X]||X;for(const[a2]of ACTIONS)if(a2!==X&&(CFG.binds[a2]||a2)===k)CFG.binds[a2]=old;CFG.binds[X]=k;rebuild();save()}
  listening=null;refresh()},true)}
function label(k){return({' ':'SPACE',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→'})[k]||k.toUpperCase()}
function refresh(){if(!ui)return;for(const a in ui){const[b,n]=ui[a];b.textContent=listening===a?`${n}: press a key…`:`${n}: ${label((CFG.binds[a])||a)}`;b.classList.toggle('on',listening===a)}
 const cbI=document.getElementById('s-cb');if(cbI)cbI.checked=!!CFG.cb}
function on(){return !!(CFG&&CFG.cb)}
function itemColor(o){return on()&&OKABE.item[o.kind]?OKABE.item[o.kind]:o.color}
function col(role,def){return on()?(OKABE[role]||def):def}
// draw a marker glyph centred at x,y of radius r (used by the minimap and edge arrows in colourblind mode)
function glyph(ctx,shape,x,y,r){ctx.beginPath();if(shape==='diamond'){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.fill()}
 else if(shape==='triangle'){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y+r*.8);ctx.lineTo(x-r,y+r*.8);ctx.closePath();ctx.fill()}
 else if(shape==='square'){ctx.rect(x-r*.8,y-r*.8,r*1.6,r*1.6);ctx.fill()}
 else if(shape==='cross'){const w=r*.45;ctx.rect(x-r,y-w,r*2,w*2);ctx.rect(x-w,y-r,w*2,r*2);ctx.fill()}
 else{ctx.arc(x,y,r,0,7);ctx.lineWidth=Math.max(1.5,r*.4);ctx.strokeStyle=ctx.fillStyle;ctx.stroke()}}
window.TDP_SETTINGS={init,mapKey,itemColor,col,glyph,SHAPE,on,refresh,ACTIONS};
})();
