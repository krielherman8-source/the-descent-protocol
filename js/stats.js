/* The Descent Protocol — run statistics + stats screens for death and victory (classic script, window.TDP_STATS).
   The game calls: kill(S,type) when an enemy dies, tick(S,dt) every play frame, hit(S,amt) when the player takes damage,
   died(S) on death (also bumps the death counter inside the checkpoint save so Continue keeps it), and
   draw(ctx,S,mode,o) to paint the panel ('dead' | 'victory'). All data lives in S.stats so it rides along with saves. */
(function(){
function ensure(st){st.kt=st.kt||{};st.ft=st.ft||[];st.deaths=st.deaths||0;st.df=st.df||{};return st}
function kill(S,t){const st=ensure(S.stats);st.kt[t]=(st.kt[t]||0)+1}
function tick(S,dt){const st=ensure(S.stats);st.ft[S.floor]=(st.ft[S.floor]||0)+dt}
// remember what was nearest when the player got hit (a cheap, honest "probable cause")
function hit(S,amt){const p=S.p;let best=null,bd=110;for(const e of S.enemies){const d=Math.hypot(e.x-p.x,e.y-p.y)-(e.r||12);if(d<bd){bd=d;best=e.type}}
 S.stats.lastHit=best||'projectile / hazard';S.stats.lastAmt=amt}
function died(S,LS,LSset){const st=ensure(S.stats);st.deaths++;st.df[S.floor]=(st.df[S.floor]||0)+1;
 try{const sv=LS&&LS('tdp_save',null);if(sv&&sv.stats){ensure(sv.stats);sv.stats.deaths=(sv.stats.deaths||0)+1;sv.stats.df[S.floor]=(sv.stats.df[S.floor]||0)+1;LSset('tdp_save',sv)}}catch(e){}}
const mmss=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function draw(ctx,S,mode,o){const st=ensure(S.stats),p=S.p,VW=o.VW,VH=o.VH,T=o.text,dead=mode==='dead';
 ctx.fillStyle=dead?'rgba(20,0,0,.86)':'rgba(0,12,14,.92)';ctx.fillRect(0,0,VW,VH);
 T(dead?'PROTOCOL TERMINATED':'DESCENT COMPLETE — THE OVERMIND IS DEAD',VW/2,70,dead?'#f66':'#7ff',dead?36:30,'center');
 const sub=dead?`Floor ${S.floor+1}/30 — ${S.f.name}   ·   probable cause: ${o.name(st.lastHit)}`:`Difficulty ${String(S.diff||'normal').toUpperCase()}   ·   ${st.deaths} death${st.deaths===1?'':'s'} (checkpoint continues)`;
 T(sub,VW/2,100,dead?'#fbb':'#9cc',14,'center');
 const hd=dead?'#f99':'#7ff',tx=dead?'#fcc':'#bff';
 // column 1: run totals
 let x=90,y=150;T('RUN',x,y,hd,15);
 [[`Time`,mmss(st.time)],[`Floors cleared`,dead?S.floor:30],[`Kills`,st.kills],[`Shots fired`,st.shots],[`Damage dealt`,Math.round(st.dmg)],[`Damage taken`,Math.round(st.taken)],[`Healed`,Math.round(st.healed||0)],
  [`Deaths`,st.deaths],[`Final HP`,`${Math.max(0,Math.ceil(p.hp))}/${p.maxHp}`],[`Upgrades`,p.ups.length]].forEach(([a,b],i)=>{T(a,x,y+28+i*22,tx,13);T(String(b),x+240,y+28+i*22,'#fff',13,'right')});
 // column 2: kills by type (bar list)
 x=400;T('KILLS BY TYPE',x,y,hd,15);const kt=Object.entries(st.kt).sort((a,b)=>b[1]-a[1]).slice(0,11),mx=kt.length?kt[0][1]:1;
 kt.forEach(([k,n],i)=>{const yy=y+28+i*22;T(o.name(k),x,yy,tx,12);ctx.fillStyle=dead?'#a44':'#2aa';ctx.fillRect(x+130,yy-10,Math.max(2,150*n/mx),11);T(String(n),x+290,yy,'#fff',12)});
 if(!kt.length)T('—',x,y+28,tx,12);
 // column 3: floor times chart (with deaths marked)
 x=760;T('TIME PER FLOOR',x,y,hd,15);const ft=st.ft,mt=Math.max(30,...ft.filter(Boolean)),bw=13,h=180,by=y+30+h;
 ctx.strokeStyle='#355';ctx.lineWidth=1;ctx.strokeRect(x-2,y+28,30*bw+4,h+4);
 for(let i=0;i<30;i++){const v=ft[i]||0,bh=v/mt*h,boss=(i+1)%5===0;ctx.fillStyle=i===S.floor&&dead?'#f55':boss?'#d70':dead?'#a66':'#3bb';if(v)ctx.fillRect(x+i*bw,by-bh,bw-2,bh);
  if(st.df[i]){ctx.fillStyle='#f44';for(let j=0;j<Math.min(4,st.df[i]);j++)ctx.fillRect(x+i*bw+3,by+6+j*6,bw-8,4)}}
 [1,5,10,15,20,25,30].forEach(n=>T(String(n),x+(n-1)*bw+bw/2-1,by+40,'#699',10,'center'));T(`max ${mmss(mt)}`,x+30*bw,y+22,'#699',10,'right');
 T('orange = boss floor · red ticks = deaths',x,by+58,'#699',10);
 const slow=ft.map((v,i)=>[v||0,i]).sort((a,b)=>b[0]-a[0]).slice(0,3).filter(a=>a[0]>0).map(a=>`F${a[1]+1} ${mmss(a[0])}`).join('  ');if(slow)T('Longest: '+slow,x,by+78,tx,12);
 if(!dead){T(`Weapons: ${p.weapons.map(k=>o.WEAPONS[k].name).join(', ')}`,VW/2,500,tx,13,'center');T(`Drones: ${p.drones.map(k=>o.DRONES[k].name).join(', ')}`,VW/2,524,tx,13,'center')}
 T(dead?'Click or press R to restart from floor 1  ·  Esc: title (Continue resumes your last checkpoint)':'Click or press R to play again  ·  Esc for title',VW/2,dead?560:580,dead?'#fbb':'#5aa',15,'center')}
window.TDP_STATS={kill,tick,hit,died,draw,ensure};
})();
