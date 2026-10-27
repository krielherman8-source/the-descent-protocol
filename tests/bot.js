// Killable objective-doing audit bot. hash: #runs=1&diff=normal&from=0&to=29&deaths=3
// Endless: &endless=10 -> after beating F30, take 'Continue into Endless' and play 10 more floors (F31-F40);
//          &from=30&to=39 -> start Endless from the title (loadout draft) and play F31-F40
// window.BOT_MANUAL=true (set by tests/leak.js) only exposes window.BOT_API={playFloor,...} and does not start runs.
window.addEventListener('load',()=>setTimeout(()=>{try{main()}catch(e){document.body.dataset.log='CRASH '+e.stack}},300));
function main(){
const H=Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map(a=>a.split('=')));
const SK=+(H.skill||1),EN=+(H.endless||0);const RUNS=+(H.runs||1),FROM=+(H.from||0),TO=+(H.to||29),MAXD=+(H.deaths||3),CAP=+(H.cap||300);
const {P,dist,inWall,WEAPONS,FLOORS,ENEMIES}=window;const GW=40,GH=23,C=32,dt=1/60;const out=[];
if(H.diff&&window.setDifficulty)setDifficulty(H.diff);
window.__pause=true;
let goalCell=-1,field=null;
function hzCost(){const c=new Uint8Array(GW*GH);for(const h of S.hazards){if(h.type==='laser'||!h.r)continue;const r=h.r+18;for(let y=Math.max(0,Math.floor((h.y-r)/C));y<=Math.min(GH-1,Math.floor((h.y+r)/C));y++)for(let x=Math.max(0,Math.floor((h.x-r)/C));x<=Math.min(GW-1,Math.floor((h.x+r)/C));x++){if(Math.hypot(x*C+16-h.x,y*C+16-h.y)<r)c[x+y*GW]=8}}
 for(const it of S.items)if(it.muck&&!it.done){const r=it.muck+16;for(let y=0;y<GH;y++)for(let x=0;x<GW;x++)if(Math.hypot(x*C+16-it.x,y*C+16-it.y)<r)c[x+y*GW]=Math.max(c[x+y*GW],6)}return c}
function bfs(gx,gy){const g=S.grid,hc=hzCost(),D=new Int32Array(GW*GH).fill(-1),B=[[gx+gy*GW]];D[gx+gy*GW]=0;
 for(let b=0;b<B.length;b++){const Q=B[b];if(!Q)continue;for(let h=0;h<Q.length;h++){const i=Q[h];if(D[i]!==b)continue;const x=i%GW,y=(i/GW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const j=nx+ny*GW;
  if(g[j])continue;if(dx&&dy&&(g[x+dx+y*GW]||g[x+(y+dy)*GW]))continue;const nd=b+(dx&&dy?3:2)+hc[j];if(D[j]>=0&&D[j]<=nd)continue;D[j]=nd;(B[nd]||(B[nd]=[])).push(j)}}}return D}
function cellOf(o){return [Math.max(0,Math.min(GW-1,Math.floor(o.x/C))),Math.max(0,Math.min(GH-1,Math.floor(o.y/C)))]}
function pathDir(p,goal){const[gx,gy]=cellOf(goal),gi=gx+gy*GW;if(gi!==goalCell||S.t-field.t>1){field=bfs(gx,gy);field.t=S.t;goalCell=gi}
 const[px,py]=cellOf(p),D=field;let best=null,bd=D[px+py*GW]<0?1e9:D[px+py*GW];if(bd<=3)return norm(goal.x-p.x,goal.y-p.y);
 for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=px+dx,ny=py+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const v=D[nx+ny*GW];if(v>=0&&v<bd){bd=v;best=[nx,ny]}}
 if(!best)return norm(goal.x-p.x,goal.y-p.y);let tgt=best,cur=best;
 for(let s2=0;s2<7;s2++){let nb=null,nv=D[cur[0]+cur[1]*GW];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=cur[0]+dx,ny=cur[1]+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const v=D[nx+ny*GW];if(v>=0&&v<nv){nv=v;nb=[nx,ny]}}
  if(!nb)break;cur=nb;if(clear(p,{x:cur[0]*C+16,y:cur[1]*C+16}))tgt=cur;else break}
 return norm(tgt[0]*C+16-p.x,tgt[1]*C+16-p.y)}
function clear(a,b){const d=dist(a,b),n=Math.ceil(d/8);for(let i=1;i<=n;i++){const x=a.x+(b.x-a.x)*i/n,y=a.y+(b.y-a.y)*i/n;if(inWall(x,y,15))return false}return true}
function norm(x,y){const m=Math.hypot(x,y)||1;return{x:x/m,y:y/m}}
function los(a,b){const d=dist(a,b),n=Math.ceil(d/10);for(let i=1;i<n;i++){if(inWall(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,2))return false}return true}
function choosePick(){const c=S.choices||[],p=S.p;let bi=0,bs=-1e9;c.forEach((u,i)=>{const n=u.name;let s=Math.random()*1.5;
 if(/Repair|Heal/i.test(n))s+=p.hp<p.maxHp*.5?7:1;else if(n.startsWith('Mod:'))s+=5;else if(n.startsWith('Weapon:'))s+=p.weapons.length<3?4.2:1.5;else if(/Damage/i.test(n))s+=4.5;
 else if(n.startsWith('Drone:'))s+=p.drones.length<2?3.5:2.2;else if(/Overclock/.test(n))s+=4.6;else if(/Plating|Weave/.test(n))s+=p.hp<p.maxHp*.6?4.4:3.4;else if(/Swarm Link/.test(n))s+=2.4;else if(/Max HP|Armor|Hull/i.test(n))s+=3.4;else if(/Rate|Multi/i.test(n))s+=3.6;else s+=2;if(s>bs){bs=s;bi=i}});return bi}
function mainW(p){return p.weapons.includes('tesla')?'tesla':p.weapons.includes('railgun')?'railgun':'kinetic'}
function tick(st){st.n=(st.n||0)+1;const RT=Math.round(1+(1-SK)*12);if(st.n%RT!==0&&S.state==='play')return;const p=S.p;IN.mx=IN.my=0;IN.fire=false;keys.e=false;
 const en=S.enemies.filter(e=>e.hp>0&&!e.cloaked);const boss=en.find(e=>ENEMIES[e.type].boss);
 // goal
 let goal=null,mode='hunt',it=null;
 if(S.exit)goal=S.exit,mode='exit';
 else{const items=S.items.filter(i=>i.active!==false&&!i.done);
  if(items.length){items.sort((a,b)=>dist(a,p)-dist(b,p));it=items[0];goal=it;mode=it.kind}
  else if(en.length){const t=boss||en.reduce((a,b)=>dist(a,p)<dist(b,p)?a:b);goal=t;mode='hunt'}}
 if(S.f.objective==='cells'&&!S.exit){const c=S.carry?S.socket:S.items.find(i=>i.kind==='cell'&&!i.done);if(c){goal=it=c;mode='cell'}}
 let mv={x:0,y:0};const dGoal=goal?dist(goal,p):0;
 if(goal){let want=true;
  if(mode==='hold'&&dGoal<50){want=dGoal>22;keys.e=S.enemies.filter(e=>dist(e,p)<130).length<3||(goal.prog>.6)||p.hp>p.maxHp*.55}
  if(mode==='zone'&&dGoal<goal.r*.45)want=false;
  if((mode==='escort'||mode==='defend')&&dGoal<goal.r*.5)want=false;
  if(mode==='shoot'&&dGoal<230&&los(p,goal))want=false;
  if(mode==='hunt'&&dGoal<(boss?300:180)&&los(p,goal))want=false;
  st.want=want;if(want){const d=pathDir(p,goal),pw=(mode==='escort'||mode==='defend')&&dGoal>goal.r*.5?1.8:1;mv.x+=d.x*pw;mv.y+=d.y*pw}}else st.want=false;
 if(boss&&(mode==='hunt'||mode==='exit'||!goal)){const d=dist(boss,p),ux=(p.x-boss.x)/d,uy=(p.y-boss.y)/d;st.sd=st.sd||1;if(Math.random()<.004)st.sd*=-1;
  const rad=d<270?1.3:d>360?-1:0;mv.x=ux*rad-uy*st.sd*.9;mv.y=uy*rad+ux*st.sd*.9;}
 for(let k=0;k<8;k++){const a=k*Math.PI/4,cx=Math.cos(a),cy=Math.sin(a);if(inWall(p.x+cx*30,p.y+cy*30)){const wk=(mode==='exit'||st.stuckT>0)?.25:.55;mv.x-=cx*wk;mv.y-=cy*wk;if(boss)st.sd*=(Math.random()<.02?-1:1)}}
 // threats
 const hold=keys.e||((mode==='zone'||mode==='escort'||mode==='defend')&&dGoal<goal.r*.6);
 for(const e of en){const d=dist(e,p),T=ENEMIES[e.type],R=T.boss?240:(e.type==='exploder'?150:95)+e.r;if(d<R){const k=(mode==='hold'&&dGoal<60&&!T.boss?.15:mode==='exit'&&!T.boss&&e.type!=='exploder'?.3:1)*(R-d)/R*(hold?(T.boss?1.4:.6):2.2);mv.x-=(e.x-p.x)/d*k;mv.y-=(e.y-p.y)/d*k}}
 if(Math.random()<SK)for(const b of S.ebullets){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d>140)continue;const vm=Math.hypot(b.vx,b.vy)||1,ux=b.vx/vm,uy=b.vy/vm;if(dx*ux+dy*uy>0)continue;
  const side=dx*uy-dy*ux;mv.x+=uy*Math.sign(side||1)*-1.2;mv.y+=-ux*Math.sign(side||1)*-1.2}
 for(const h of S.hazards){if(h.type==='laser'||h.type==='fissure'){if(mode==='exit'&&dGoal<140)continue;if(h.type==='fissure'&&h.t<-.45)continue;const L=h.el??h.len,cx=Math.cos(h.a),cy=Math.sin(h.a),dx=p.x-h.x,dy=p.y-h.y,pr=dx*cx+dy*cy,pe=dx*cy-dy*cx;if(pr>(h.r0||0)&&pr<L&&Math.abs(pe)<50){mv.x+=cy*Math.sign(pe)*1.5;mv.y+=-cx*Math.sign(pe)*1.5}}
  else if(h.type!=='steam'||h.on||h.warn){const d=dist(h,p);if(d<h.r+25&&!(goal&&dist(goal,h)<h.r)){const k=(mode==='exit'||mode==='hold')?.35:1.1;mv.x+=(p.x-h.x)/(d||1)*k;mv.y+=(p.y-h.y)/(d||1)*k}}}
 if(S.winds)for(const z of S.winds){if(S.items[z.valve]&&S.items[z.valve].done)continue;if(p.y>z.y0-10&&p.y<z.y1+10&&(mode==='hold'||mode==='exit'||mode==='hunt')){mv.x-=Math.sign(z.vx)*(mode==='hold'&&dGoal<60?1.6:.9)}}
 // stuck recovery: if path distance to the goal has not dropped for 1.5s, jitter sideways for .6s
 if(goal&&field&&(mode==='exit'||mode==='hunt'||mode==='hold'||mode==='touch'||mode==='cell'||mode==='pickup')){const[cx2,cy2]=cellOf(p),dv=field[cx2+cy2*GW];
  if(st.bestD==null||dv<st.bestD-1||st.goalI!==goalCell){st.bestD=dv;st.bestT=S.t;st.goalI=goalCell}
  if(st.want&&!boss&&dGoal>40&&S.t-st.bestT>1.5&&!(mode==='hold'&&dGoal<60)){st.stuckT=.6;st.jit=Math.random()*6.28;st.bestT=S.t;st.unstick=(st.unstick||0)+1}}
 if(st.stuckT>0){st.stuckT-=dt*(1+Math.round((1-SK)*12));mv.x=mv.x*.5+Math.cos(st.jit);mv.y=mv.y*.5+Math.sin(st.jit)}
 for(const it2 of S.items)if(it2.muck&&!it2.done){const d=dist(it2,p);if(d<it2.muck+20){mv.x+=(p.x-it2.x)/d*1.2;mv.y+=(p.y-it2.y)/d*1.2}}
 if(S.well&&S.items.some(i=>!i.done)){const d=dist(S.well,p);if(d<160){mv.x+=(p.x-S.well.x)/d*2;mv.y+=(p.y-S.well.y)/d*2}}
 // boss windups: back off
 if(boss&&!(boss.wind>0)&&!(boss.dashT>0))boss.dodgeRoll=undefined;
 if(boss&&(boss.wind>0||boss.dashT>0)&&(boss.dodgeRoll??=Math.random())<SK){const d=dist(boss,p),ux=(p.x-boss.x)/d,uy=(p.y-boss.y)/d;if(boss.sideDir==null||boss.wind>.5)boss.sideDir=Math.random()<.5?1:-1;mv.x+=-uy*boss.sideDir*2.5+ux*.5;mv.y+=ux*boss.sideDir*2.5+uy*.5}
 const m=Math.hypot(mv.x,mv.y);if(m>.05){IN.mx=mv.x/Math.max(m,1);IN.my=mv.y/Math.max(m,1);if(m<1){IN.mx=mv.x/m;IN.my=mv.y/m}}
 // targeting
 let tgt=null;const near=en.filter(e=>dist(e,p)<260&&los(p,e)).sort((a,b)=>dist(a,p)-dist(b,p));
 if(near.length&&(dist(near[0],p)<170||mode!=='shoot'))tgt=near[0];
 if(boss&&los(p,boss)&&(!tgt||dist(tgt,p)>150))tgt=boss;
 if(it&&(mode==='defend'||mode==='escort')){const th=en.filter(e=>dist(e,it)<(mode==='defend'?it.r+40:110)&&los(p,e)).sort((a,b)=>(b.goal?1:0)-(a.goal?1:0)||dist(a,it)-dist(b,it))[0];if(th&&(!tgt||dist(tgt,p)>90))tgt=th}
 if(!tgt&&mode==='shoot'&&dGoal<330&&los(p,goal))tgt=goal;
 if(!tgt&&en.length){const v=en.filter(e=>dist(e,p)<420&&los(p,e)).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(v)tgt=v}
 const W=p.weapons;let wsel=mainW(p);
 if(tgt===goal&&goal&&goal.burnBonus&&W.includes('flamethrower')&&dGoal<170)wsel='flamethrower';
 else if(near.filter(e=>dist(e,p)<170).length>=4&&W.includes('flamethrower'))wsel='flamethrower';
 else if(tgt&&ENEMIES[tgt.type]&&ENEMIES[tgt.type].boss&&W.includes('railgun')&&!near.some(e=>dist(e,p)<140&&!ENEMIES[e.type].boss))wsel='railgun';
 if(mode==='exit')wsel=mainW(p);
 p.weapon=wsel;
 if(tgt){const lead=tgt.vx!=null?.08:0;IN.aim=Math.atan2(tgt.y+(tgt.vy||0)*lead-p.y,tgt.x+(tgt.vx||0)*lead-p.x)+(Math.random()-.5)*(1-SK)*.6;IN.fire=true}
 // stuck tracking
 st.mode=mode}
function playFloor(fi,run){fi=S.floor;const F0=floorAt(fi),rec={f:fi+1,name:F0.name,obj:F0.objective+(F0.boss&&F0.objective==='boss'?':'+F0.boss:''),deaths:0,t:0,hp:0,stuck:''};
 let tries=0;
 while(true){const save=JSON.stringify(loadSave()||{});
  let k=0,st={},lastP={x:S.p.x,y:S.p.y},still=0,res='';const t0=S.stats.time;let lowHp=999;
  rec.src=rec.src||{};for(;k<CAP*60;k++){tick(st);if(H.trace&&k%300==0)out.push(`  t${k/60} st=${S.state} mode=${st.mode} p=${S.p.x|0},${S.p.y|0} hp=${S.p.hp|0} en=${S.enemies.length} keysE=${keys.e} mv=${IN.mx.toFixed(2)},${IN.my.toFixed(2)} hold=${S.holding?1:0} ${S.obj.progress(S).slice(0,40)}`);const hp0=S.p.hp,nb=S.ebullets.filter(b=>dist(b,S.p)<40).length;update(dt);if(S.p.hp<hp0-.5){const p=S.p,b=S.enemies.find(e=>ENEMIES[e.type].boss&&dist(e,p)<e.r+p.r+60);const mob=S.enemies.some(e=>!ENEMIES[e.type].boss&&dist(e,p)<e.r+p.r+25);const src=nb?'bullet':b?'boss':mob?'mob':'other';rec.src[src]=(rec.src[src]||0)+Math.round(hp0-S.p.hp)}if(k%240==0)render(dt);
   if(S.state==='play'){lowHp=Math.min(lowHp,S.p.hp);if(dist(S.p,lastP)<.5&&st.mode!=='hold'&&st.mode!=='zone'&&!IN.fire)still++;else still=0;lastP={x:S.p.x,y:S.p.y};if(still>600){res='STILL';break}}
   if(S.state==='dead'){res='dead';break}
   if(S.state==='upgrade'){res='clear';break}
   if(S.state==='victory'||S.state==='ending'){res='victory';break}}
  if(!res)res='TIMEOUT';
  rec.t+=Math.round(S.stats.time-t0);rec.un=(rec.un||0)+(st.unstick||0);
  if(res==='clear'||res==='victory'){rec.hp=Math.round(S.p.hp);rec.low=Math.round(lowHp);if(res==='clear'){S.p.weapon=mainW(S.p);S.choices=rollChoices();pick(choosePick());for(let j=0;j<130;j++)update(dt)}return rec}
  if(res==='dead'){rec.deaths++;rec.dinfo=(rec.dinfo||'')+` [d@${Math.round(S.stats.time-t0)}s en=${S.enemies.length} ${st.mode} ${(S.obj.progress?S.obj.progress(S):'').slice(0,40)}]`;if(rec.deaths>=MAXD){rec.stuck='KILLEDx'+MAXD;S.god=true;continueRun();window.__pause=true;S.god=true}else{continueRun();window.__pause=true}continue}
  // stuck/timeout: describe & force
  const its=S.items.filter(i=>!i.done).map(i=>i.kind+'@'+Math.round(i.x)+','+Math.round(i.y)+(i.active===false?'(inactive)':'')).join(' ');
  const pd=S.exit?pathDir(S.p,S.exit):{x:0,y:0};const hzn=S.hazards.map(h=>h.type+':'+Math.round(dist(h,S.p))+(h.r?'/r'+Math.round(h.r):'')).filter(x=>+x.split(':')[1].split('/')[0]<260).join(',');rec.stuck=res+' unstick='+(st.unstick||0)+' hz['+hzn+'] ex='+(S.exit?Math.round(S.exit.x)+','+Math.round(S.exit.y):'')+' winds='+(S.winds?S.winds.length:0)+' pd='+pd.x.toFixed(2)+','+pd.y.toFixed(2)+' st='+S.state+' mode='+st.mode+' p='+Math.round(S.p.x)+','+Math.round(S.p.y)+' en='+S.enemies.length+'{'+S.enemies.slice(0,8).map(e=>e.type+'@'+Math.round(e.x)+','+Math.round(e.y)+(inWall(e.x,e.y)?'W':'')+(e.cloaked?'C':'')+' hp'+Math.round(e.hp)).join(' ')+'}'+' items['+its+'] obj='+(S.obj.progress?S.obj.progress(S):'');
  // force complete
  S.items.forEach(i=>{i.done=true});S.enemies.forEach(e=>e.hp=0);S.surviveT=0;S.god=true;for(let j=0;j<600&&S.state==='play';j++){update(dt);if(S.exit){S.p.x=S.exit.x;S.p.y=S.exit.y}}
  S.god=false;if(S.state==='upgrade'){S.choices=rollChoices();pick(choosePick());for(let j=0;j<130;j++)update(dt)}return rec}}
window.BOT_API={playFloor,choosePick,mainW};if(window.BOT_MANUAL)return;
for(let r=0;r<RUNS;r++){newRun();window.__pause=true;S.god=false;
 if(FROM>=30){/* Endless from the title: loadout draft, then F31 */CFG.endless=true;startEndless();window.__pause=true;while(S.state==='upgrade')pick(choosePick());for(let j=0;j<130;j++)update(dt)}
 else if(FROM>0){/* fair loadout for mid-run start: simulate picks */for(let f=0;f<FROM;f++){S.choices=rollChoices();pick(choosePick());for(let j=0;j<130;j++)update(dt)}}
 const recs=[],LAST=FROM>=30?TO:EN?29+EN:TO;for(let f=FROM;f<=LAST;f++){S.god=false;const rc=playFloor(f,r);recs.push(rc);
  if(S.state==='victory'||S.state==='ending'){if(!EN)break;{const c=document.getElementById('crawl');if(c)c.className=''}S.state='victory';render(dt);if(!continueEndless()){out.push('ENDLESS CONTINUE FAILED cfg='+CFG.endless);break}pick(choosePick());for(let j=0;j<130;j++)update(dt)}}
 const p=S.p;out.push('RUN '+r+' skill='+SK+' diff='+(H.diff||'normal')+' floor='+(S.floor+1)+' endless='+(S.endless?S.endless.seed:'-')+' eu='+JSON.stringify(S.p.eu||{})+' armor='+(S.p.armor||1).toFixed(2)+' weapons='+p.weapons.join(',')+' drones='+p.drones.join(',')+' dmg='+p.dmgMul.toFixed(2)+' rate='+p.rateMul.toFixed(2)+' hp='+p.maxHp+' mods='+JSON.stringify(p.mods)+' state='+S.state);
 for(const rc of recs)out.push(`  F${rc.f} ${rc.obj.padEnd(10)} ${rc.f>30?'['+rc.name+'] ':''}t=${rc.t}s deaths=${rc.deaths} un=${rc.un||0} endHp=${rc.hp} low=${rc.low} ${rc.stuck}${rc.dinfo||''} src=${JSON.stringify(rc.src)}`)}
out.push('ERRS '+JSON.stringify(ERRS.slice(0,5)));document.body.dataset.log=out.join('\n')}
