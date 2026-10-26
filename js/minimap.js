/* THE DESCENT PROTOCOL — minimap + off-screen objective arrows (classic script; window.TDP_MINIMAP). */
(function(){
const ST=()=>window.TDP_SETTINGS,C=(role,d)=>ST()?ST().col(role,d):d,CB=()=>ST()&&ST().on();
let cacheFor=null,cache=null;
function staticLayer(S,W,H,sc){const c=document.createElement('canvas');c.width=Math.ceil(W*sc);c.height=Math.ceil(H*sc);const g=c.getContext('2d');
 g.fillStyle='rgba(4,22,26,.9)';g.fillRect(0,0,c.width,c.height);g.fillStyle='#2b6f78';for(const w of S.walls)g.fillRect(w.x*sc,w.y*sc,Math.max(1,w.w*sc),Math.max(1,w.h*sc));return c}
// targets the player should head for right now (shared by minimap pulses and the edge arrows)
function targets(S){if(S.exit)return[{x:S.exit.x,y:S.exit.y,col:C('exit','#7ff'),label:'EXIT',kind:'exit'}];
 const out=S.items.filter(i=>i.active!==false&&!i.done).map(i=>({x:i.x,y:i.y,col:i.color,label:i.label,kind:i.kind}));
 if(!out.length){const b=S.enemies.find(e=>(window.ENEMIES[e.type]||{}).boss);if(b)out.push({x:b.x,y:b.y,col:C('boss','#f3a'),label:'BOSS',kind:'boss'})}return out}
function draw(ctx,S,o){const W=o.W,H=o.H,sc=o.size/W,mw=W*sc,mh=H*sc,x0=o.x,y0=o.y;
 if(cacheFor!==S.walls){cache=staticLayer(S,W,H,sc);cacheFor=S.walls}
 ctx.save();ctx.globalAlpha=.92;ctx.drawImage(cache,x0,y0);ctx.globalAlpha=1;ctx.strokeStyle='#2aa';ctx.lineWidth=1;ctx.strokeRect(x0-.5,y0-.5,mw+1,mh+1);
 ctx.beginPath();ctx.rect(x0,y0,mw,mh);ctx.clip();
 for(const h of S.hazards||[]){if(h.type==='laser'){const L=(h.el??h.len)*sc;ctx.strokeStyle=C('laser','rgba(255,60,60,.9)');ctx.beginPath();ctx.moveTo(x0+h.x*sc,y0+h.y*sc);ctx.lineTo(x0+h.x*sc+Math.cos(h.a)*L,y0+h.y*sc+Math.sin(h.a)*L);ctx.stroke()}
  else if(h.type==='fissure'){ctx.strokeStyle=h.t>0?'rgba(200,100,255,.95)':'rgba(200,100,255,.4)';ctx.beginPath();ctx.moveTo(x0+h.x*sc,y0+h.y*sc);ctx.lineTo(x0+(h.x+Math.cos(h.a)*h.len)*sc,y0+(h.y+Math.sin(h.a)*h.len)*sc);ctx.stroke()}
  else if(h.r>0){ctx.fillStyle=CB()?C(h.type,'#fff')+(h.type==='steam'&&!h.on?'40':'70'):h.type==='acid'?'rgba(120,255,60,.35)':h.type==='steam'?(h.on?'rgba(255,170,90,.6)':'rgba(255,170,90,.22)'):h.type==='mortar'?'rgba(255,120,200,.45)':'rgba(140,220,255,.35)';ctx.beginPath();ctx.arc(x0+h.x*sc,y0+h.y*sc,h.r*sc,0,7);ctx.fill()}}
 const pulse=.5+.5*Math.sin(S.t*6);
 for(const it of S.items){if(it.kind==='escort'&&it.path){ctx.strokeStyle=it.color;ctx.globalAlpha=.35;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x0+it.x*sc,y0+it.y*sc);for(let i=it.seg+1;i<it.path.length;i++)ctx.lineTo(x0+it.path[i].x*sc,y0+it.path[i].y*sc);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
  if(it.done&&it.kind!=='hold')continue;const on=it.active!==false&&!it.done;ctx.fillStyle=it.done?'rgba(120,255,255,.35)':it.color;ctx.globalAlpha=on?1:.35;
  const ring=it.kind==='zone'||it.kind==='defend'||it.kind==='escort',r=ring?it.r*sc:3;ctx.beginPath();ctx.arc(x0+it.x*sc,y0+it.y*sc,r,0,7);if(ring){ctx.strokeStyle=it.color;ctx.stroke();ctx.beginPath();ctx.arc(x0+it.x*sc,y0+it.y*sc,3,0,7);ctx.fill()}else if(CB())ST().glyph(ctx,ST().SHAPE[it.kind]||'diamond',x0+it.x*sc,y0+it.y*sc,4.5);else ctx.fill();
  if(on&&!ring){ctx.strokeStyle=it.color;ctx.globalAlpha=.6*(1-pulse);ctx.beginPath();ctx.arc(x0+it.x*sc,y0+it.y*sc,3+pulse*6,0,7);ctx.stroke()}}
 ctx.globalAlpha=1;
 for(const h of S.pickups||[]){ctx.fillStyle='#5f8';ctx.fillRect(x0+h.x*sc-1.5,y0+h.y*sc-1.5,3,3)}
 for(const e of S.enemies){if(e.hp<=0||e.cloaked)continue;const b=o.isBoss(e);ctx.fillStyle=b?C('boss','#f3a'):C('enemy','#f44');const r=b?4.5:1.6;if(b&&CB())ST().glyph(ctx,'triangle',x0+e.x*sc,y0+e.y*sc,5);else ctx.fillRect(x0+e.x*sc-r,y0+e.y*sc-r,r*2,r*2)}
 if(S.exit){ctx.fillStyle=C('exit','#7ff');ctx.globalAlpha=.6+.4*pulse;ctx.fillRect(x0+S.exit.x*sc-4,y0+S.exit.y*sc-4,8,8);ctx.globalAlpha=1}
 const p=S.p,a=o.aim;ctx.translate(x0+p.x*sc,y0+p.y*sc);ctx.rotate(a);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(-4,4);ctx.lineTo(-2,0);ctx.lineTo(-4,-4);ctx.closePath();ctx.fill();
 ctx.restore()}
// screen-edge arrows for objectives that are off screen; toScreen(x,y,z)->{x,y,vis} in device pixels
function arrows(ctx,S,toScreen,w,h,scale){const m=34*scale;for(const t of targets(S)){const s=toScreen(t.x,40,t.y);if(s.vis&&s.x>m&&s.x<w-m&&s.y>m&&s.y<h-m)continue;
  const cx=w/2,cy=h/2;let dx=s.x-cx,dy=s.y-cy;if(!s.vis&&s.behind){dx=-dx;dy=-dy}const a=Math.atan2(dy,dx);
  const k=Math.min((w/2-m)/Math.abs(Math.cos(a)||1e-6),(h/2-m)/Math.abs(Math.sin(a)||1e-6));const x=cx+Math.cos(a)*k,y=cy+Math.sin(a)*k;
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=t.col;ctx.shadowColor=t.col;ctx.shadowBlur=12;ctx.globalAlpha=.85+.15*Math.sin(S.t*6);
  const z=14*scale;ctx.beginPath();ctx.moveTo(z,0);ctx.lineTo(-z*.7,z*.75);ctx.lineTo(-z*.35,0);ctx.lineTo(-z*.7,-z*.75);ctx.closePath();ctx.fill();ctx.restore();
  ctx.save();ctx.fillStyle=t.col;ctx.font=`${Math.round(10*scale)}px monospace`;ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=4;
  ctx.fillText(t.label,x-Math.cos(a)*24*scale,y-Math.sin(a)*24*scale+4);if(CB()){ctx.shadowBlur=0;ST().glyph(ctx,ST().SHAPE[t.kind]||'diamond',x-Math.cos(a)*24*scale,y-Math.sin(a)*24*scale-10*scale,5*scale)}ctx.restore()}}
window.TDP_MINIMAP={draw,arrows,targets};
})();
