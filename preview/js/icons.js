/* THE DESCENT PROTOCOL — option pictures. Classic script.
   plate(g,w,h): cold-blue sci-fi backing plate. icon(kind,key,w,h): canvas-drawn line icon (cyan line, red accent) for mods and stat upgrades.
   Weapon/drone pictures are rendered from the game's own 3D models in index.html (modelThumb) and composited on the same plate. */
(function(){
const CY='#5ff',RD='#ff4d5a',cache={};
function plate(g,w,h,tint){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0b2a36');gr.addColorStop(1,'#03111a');g.fillStyle=gr;g.fillRect(0,0,w,h);
 const rg=g.createRadialGradient(w/2,h*.55,4,w/2,h*.55,w*.6);rg.addColorStop(0,tint||'rgba(60,220,240,.22)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(80,255,240,.08)';g.lineWidth=1;for(let x=0;x<w;x+=16){g.beginPath();g.moveTo(x+.5,0);g.lineTo(x+.5,h);g.stroke()}for(let y=0;y<h;y+=16){g.beginPath();g.moveTo(0,y+.5);g.lineTo(w,y+.5);g.stroke()}
 g.strokeStyle='rgba(80,255,240,.5)';g.lineWidth=2;const c=10;g.beginPath();g.moveTo(1,c);g.lineTo(1,1);g.lineTo(c,1);g.moveTo(w-c,1);g.lineTo(w-1,1);g.lineTo(w-1,c);g.moveTo(1,h-c);g.lineTo(1,h-1);g.lineTo(c,h-1);g.moveTo(w-c,h-1);g.lineTo(w-1,h-1);g.lineTo(w-1,h-c);g.stroke()}
function ln(g,pts,close){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(close)g.closePath();g.stroke()}
function circ(g,x,y,r,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);fill?g.fill():g.stroke()}
const A=(g,f)=>{g.save();g.strokeStyle=RD;g.fillStyle=RD;g.shadowColor=RD;f();g.restore()};
function hex(g,x,y,r,rot){g.beginPath();for(let i=0;i<6;i++){const a=rot+i*Math.PI/3;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.stroke()}
const D={ // all drawn in a 128x128 box centred on (64,64)
 explosive(g){circ(g,64,64,26);for(let i=0;i<8;i++){const a=i*Math.PI/4;ln(g,[[64+Math.cos(a)*32,64+Math.sin(a)*32],[64+Math.cos(a)*46,64+Math.sin(a)*46]])}A(g,()=>circ(g,64,64,10,true))},
 cryo(g){for(let i=0;i<6;i++){g.save();g.translate(64,64);g.rotate(i*Math.PI/3);ln(g,[[0,0],[0,-44]]);ln(g,[[0,-26],[-10,-36]]);ln(g,[[0,-26],[10,-36]]);g.restore()}A(g,()=>circ(g,64,64,7,true))},
 vampiric(g){g.beginPath();g.moveTo(64,18);g.bezierCurveTo(90,50,98,66,98,80);g.bezierCurveTo(98,100,82,112,64,112);g.bezierCurveTo(46,112,30,100,30,80);g.bezierCurveTo(30,66,38,50,64,18);g.stroke();
  A(g,()=>{g.beginPath();g.moveTo(64,52);g.bezierCurveTo(76,68,80,76,80,84);g.bezierCurveTo(80,94,72,100,64,100);g.bezierCurveTo(56,100,48,94,48,84);g.bezierCurveTo(48,76,52,68,64,52);g.fill()})},
 emp(g){ln(g,[[74,14],[40,70],[62,70],[52,114],[90,52],[66,52]],true);A(g,()=>{g.beginPath();g.arc(64,64,50,-.6,.6);g.stroke();g.beginPath();g.arc(64,64,50,Math.PI-.6,Math.PI+.6);g.stroke()})},
 damage(g){circ(g,64,64,34);circ(g,64,64,16);ln(g,[[64,14],[64,36]]);ln(g,[[64,92],[64,114]]);ln(g,[[14,64],[36,64]]);ln(g,[[92,64],[114,64]]);A(g,()=>circ(g,64,64,5,true))},
 rate(g){for(let i=0;i<3;i++)ln(g,[[22+i*26,34],[48+i*26,64],[22+i*26,94]]);A(g,()=>ln(g,[[22+52,34],[48+52,64],[22+52,94]]))},
 speed(g){ln(g,[[14,44],[48,44]]);ln(g,[[8,64],[44,64]]);ln(g,[[14,84],[48,84]]);A(g,()=>{ln(g,[[56,28],[104,64],[56,100]]);ln(g,[[56,28],[72,64],[56,100]])})},
 hp(g){g.strokeRect(20,20,88,88);A(g,()=>{g.lineWidth=11;ln(g,[[64,38],[64,90]]);ln(g,[[38,64],[90,64]])})},
 drone(g){g.save();g.translate(64,64);g.rotate(-.4);g.beginPath();g.ellipse(0,0,50,20,0,0,Math.PI*2);g.stroke();g.restore();circ(g,64,64,12);A(g,()=>circ(g,100,44,9,true))},
 multi(g){ln(g,[[20,64],[60,64]]);ln(g,[[60,64],[108,26]]);ln(g,[[60,64],[108,102]]);ln(g,[[96,22],[110,24],[106,38]]);ln(g,[[96,106],[110,104],[106,90]]);A(g,()=>{ln(g,[[60,64],[110,64]]);ln(g,[[98,54],[112,64],[98,74]])})},
 repair(g){hex(g,64,64,46,Math.PI/6);A(g,()=>{g.lineWidth=10;ln(g,[[64,40],[64,88]]);ln(g,[[40,64],[88,64]])})},
 core(g){circ(g,64,64,42);circ(g,64,64,26);ln(g,[[70,26],[54,66],[72,66],[58,102]]);A(g,()=>circ(g,64,64,8,true))},
 weave(g){hex(g,48,48,24,0);hex(g,80,48,24,0);hex(g,64,78,24,0);A(g,()=>{g.lineWidth=8;ln(g,[[64,68],[64,90]]);ln(g,[[54,79],[74,79]])})},
 plating(g){ln(g,[[64,12],[108,28],[104,74],[64,114],[24,74],[20,28]],true);A(g,()=>{g.lineWidth=9;ln(g,[[40,48],[88,48]]);ln(g,[[44,70],[84,70]])})},
 link(g){ln(g,[[30,40],[98,40],[64,100]],true);circ(g,30,40,10);circ(g,98,40,10);circ(g,64,100,10);A(g,()=>circ(g,64,60,8,true))},
 refit(g){circ(g,64,64,24);for(let i=0;i<8;i++){g.save();g.translate(64,64);g.rotate(i*Math.PI/4);g.strokeRect(-6,-42,12,16);g.restore()}A(g,()=>circ(g,64,64,9,true))},
 generic(g){hex(g,64,64,44,Math.PI/6);A(g,()=>{g.lineWidth=8;ln(g,[[64,44],[64,84]]);ln(g,[[44,64],[84,64]])})}};
const STAT=[[/damage/i,'damage'],[/fire rate/i,'rate'],[/move speed/i,'speed'],[/max hp/i,'hp'],[/drone power/i,'drone'],[/multishot/i,'multi'],[/full repair|repair/i,'repair'],[/overclock/i,'core'],[/nanite/i,'weave'],[/plating/i,'plating'],[/swarm link/i,'link']];
const statKey=n=>{n=String(n||'').replace(/^Endless:\s*/,'');for(const[r,k]of STAT)if(r.test(n))return k;return'generic'};
/* canvas w*h: plate + line icon (kind 'mod' key explosive|cryo|vampiric|emp, kind 'stat' key=upgrade name, kind 'refit') */
function icon(kind,key,w,h){w=w||192;h=h||128;const id=kind+'|'+key+'|'+w;if(cache[id])return cache[id];
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');plate(g,w,h);
 const s=Math.min(w,h)*.78/128;g.save();g.translate(w/2-64*s,h/2-64*s);g.scale(s,s);g.strokeStyle=CY;g.fillStyle=CY;g.lineWidth=5;g.lineCap='round';g.lineJoin='round';g.shadowColor=CY;g.shadowBlur=10;
 (D[kind==='stat'?statKey(key):key]||D.generic)(g);g.restore();return cache[id]=c}
/* small gear badge for REFIT cards, drawn onto an existing 2d ctx */
function badge(g,x,y,r){g.save();g.translate(x,y);g.scale(r/64,r/64);g.translate(-64,-64);g.fillStyle='rgba(2,14,20,.85)';circ(g,64,64,60,true);g.strokeStyle=CY;g.lineWidth=7;g.lineCap='round';g.shadowColor=CY;g.shadowBlur=8;circ(g,64,64,60);const sc=.8;g.translate(64*(1-sc),64*(1-sc));g.scale(sc,sc);D.refit(g);g.restore()}
window.TDP_ICONS={plate,icon,badge,statKey,kinds:Object.keys(D)};
})();
