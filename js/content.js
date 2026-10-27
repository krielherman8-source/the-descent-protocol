/* THE DESCENT PROTOCOL — late-game content pack (classic script; window.TDP_CONTENT).
   Data-driven additions used by index.html: unique boss models + attacks for the Colossus (F20) and Matriarch (F25),
   timed hazards (steam vents, mortars, fissures, temporary acid), three objective variants (escort / power cells / defend)
   and per-floor set pieces. index.html calls TDP_CONTENT.init(api) once with its helpers. */
(function(){
let A=null;const TAU=Math.PI*2;
const shared={};
function init(api){A=api;const T=A.THREE;shared.disc=new T.CircleGeometry(1,28);shared.ring=new T.RingGeometry(.86,1,40);shared.box=new T.BoxGeometry(1,1,1);shared.col=new T.CylinderGeometry(1,1,1,16,1,true)}
const S=()=>A.S;
const qe=(c,i)=>A.emis(c,Math.round(i*10)/10);
const own=(c,op)=>A.add(c,op).clone();// per-mesh material when opacity animates
// ---------------------------------------------------------------- boss models
function grp(){return new A.THREE.Group()}
function mesh(geo,m,x,y,z,cs){const o=new A.THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);if(cs!==false)o.castShadow=true;return o}
function makeColossus(r){const T=A.THREE,g=grp(),chit=A.M({color:0x241433,emissive:0x5a1a8a,emissiveIntensity:.12,metalness:.35,roughness:.45}),plate=A.M({color:0x1a1424,metalness:.6,roughness:.35}),glow=A.emis(0xb04aff,2.2),crys=A.M({color:0x5a2a90,emissive:0xc070ff,emissiveIntensity:1.4,roughness:.2,flatShading:true});
 const legs=[];// six column legs (two-segment), pivot groups so the walk cycle swings them
 for(let i=0;i<6;i++){const side=i%2?1:-1,row=Math.floor(i/2),lg=grp();lg.position.set(r*(.75-row*.75),r*.55,side*r*.7);
  const up=mesh(new T.CylinderGeometry(r*.16,r*.2,r*1.1,8),plate,0,r*.15,side*r*.45);up.rotation.x=side*1.05;const lo=mesh(new T.CylinderGeometry(r*.2,r*.1,r*.95,8),chit,0,-r*.2,side*r*.95);
  const claw=mesh(new T.ConeGeometry(r*.13,r*.35,6),glow,0,-r*.6,side*r*.98,false);claw.rotation.x=Math.PI;lg.add(up,lo,claw);lg.userData.base=0;legs.push(lg);g.add(lg)}
 const dome=mesh(new T.SphereGeometry(r,20,12,0,TAU,0,Math.PI/2),chit,-r*.1,r*.55,0);dome.scale.set(1.45,1.0,1.05);g.add(dome);
 for(let i=0;i<4;i++){const p=mesh(new T.SphereGeometry(r*1.02,16,6,0,TAU,0,Math.PI/2),plate,-r*.1-r*(i-1.5)*.42,r*.6,0);p.scale.set(.34,1.02-i*.06,1.08);g.add(p);
  const seam=mesh(new T.TorusGeometry(r*.98,r*.03,4,24,Math.PI),glow,-r*.1-r*(i-1.5)*.42+r*.2,r*.58,0,false);seam.rotation.y=Math.PI/2;seam.scale.set(1,.98-i*.06,1.03);g.add(seam)}
 const head=mesh(new T.BoxGeometry(r*.8,r*.55,r*1.15),plate,r*1.35,r*.62,0);g.add(head);
 const horn=mesh(new T.ConeGeometry(r*.24,r*1.5,7),A.M({color:0xd8c8f0,emissive:0x8040ff,emissiveIntensity:.35,roughness:.3}),r*2.2,r*.95,0);horn.rotation.z=-Math.PI/2+.35;g.add(horn);
 for(const sd of[-1,1]){const md=mesh(new T.BoxGeometry(r*.9,r*.22,r*.22),plate,r*1.9,r*.35,sd*r*.5);md.rotation.y=sd*.5;const tip=mesh(new T.ConeGeometry(r*.12,r*.5,5),glow,r*2.35,r*.35,sd*r*.25,false);tip.rotation.z=-Math.PI/2;tip.rotation.x=sd*.6;g.add(md,tip);
  for(let k=0;k<2;k++)g.add(mesh(new T.SphereGeometry(r*.07,8,6),A.emis(0xffd0ff,3),r*1.76,r*.78+k*r*.16,sd*r*(.3+k*.12),false))}
 for(let i=0;i<4;i++){const t=mesh(new T.SphereGeometry(r*(.38-i*.07),10,8),plate,-r*(1.55+i*.42),r*(.55-i*.1),0);t.scale.set(1.2,.8,1);g.add(t)}
 const cl=grp();cl.position.set(-r*.15,r*1.45,0);// crystal growths on the back: the silhouette read
 for(let i=0;i<9;i++){const h=r*(.5+((i*37)%5)*.12),c=mesh(new T.ConeGeometry(r*.13,h,5),crys,Math.cos(i*2.4)*r*.55,h*.35,Math.sin(i*2.4)*r*.45);c.rotation.set(Math.sin(i*2.4)*.45,0,-Math.cos(i*2.4)*.45);cl.add(c)}
 g.add(cl);const L=new T.PointLight(0xb04aff,9000,260,2);L.position.set(0,r*2.2,0);g.add(L);
 g.userData={legs,abd:cl,custom:true,anim(t,e){legs.forEach((l,i)=>{const ph=t*6+(i%2?Math.PI:0)+Math.floor(i/2)*1.3;l.rotation.z=Math.sin(ph)*.18;l.position.y=r*.55+Math.max(0,Math.cos(ph))*r*.08});
  const rage=e.hp<e.max/2;cl.scale.setScalar(1+(rage?.12:0)+Math.sin(t*(rage?9:3))*.04);head.rotation.z=(e.slamW>0?-.35:0)}};return g}
function makeMatriarch(r){const T=A.THREE,g=grp(),chit=A.M({color:0x2a0d1c,emissive:0xff2a80,emissiveIntensity:.1,metalness:.3,roughness:.4}),bone=A.M({color:0xe8d2dc,roughness:.5}),glow=A.emis(0xff4fa0,2.4);
 const sac=new T.Group();sac.position.set(-r*1.55,r*.95,0);
 const skin=mesh(new T.SphereGeometry(r,20,14),new T.MeshPhysicalMaterial({color:0x6a1838,emissive:0xff3a8a,emissiveIntensity:.45,transparent:true,opacity:.55,roughness:.15,depthWrite:false}),0,0,0,false);skin.scale.set(1.6,1.05,1.2);sac.add(skin);
 const em=A.emis(0xffb0e0,2.2);for(let i=0;i<12;i++){const e=mesh(new T.SphereGeometry(r*.17,8,6),em,Math.cos(i*1.9)*r*.9,Math.sin(i*1.3)*r*.45,Math.sin(i*1.9)*r*.65,false);e.scale.y=1.3;sac.add(e)}
 for(let i=0;i<5;i++){const b=mesh(new T.TorusGeometry(r*(1.02-Math.abs(i-2)*.14),r*.04,4,22),chit,(i-2)*r*.5,0,0);b.rotation.y=Math.PI/2;b.scale.set(1.2,1.05,1);sac.add(b)}
 g.add(sac);
 const tho=mesh(new T.CapsuleGeometry(r*.38,r*.9,4,10),chit,r*.15,r*1.35,0);tho.rotation.z=-.5;g.add(tho);
 const head=mesh(new T.SphereGeometry(r*.34,12,10),chit,r*.75,r*2.05,0);head.scale.set(1.3,.9,.9);g.add(head);
 for(const sd of[-1,1])for(let k=0;k<3;k++)g.add(mesh(new T.SphereGeometry(r*.06,6,5),A.emis(0xffee66,3),r*1.08,r*2.1+k*r*.1,sd*r*(.12+k*.06),false));
 const frill=grp();frill.position.set(r*.55,r*2.15,0);// crest fan behind the head
 for(let i=0;i<11;i++){const a=-1.25+i*.25,c=mesh(new T.ConeGeometry(r*.07,r*(1.0+Math.cos(a)*.5),4),i%2?bone:glow,0,0,0);c.position.set(-Math.cos(a)*r*.15,Math.cos(a)*r*.55,Math.sin(a)*r*.75);c.rotation.set(a*.9,0,.35);frill.add(c)}
 const memb=mesh(new T.CircleGeometry(r*.85,16,-.2,Math.PI*1.2),new T.MeshBasicMaterial({color:0xff4fa0,transparent:true,opacity:.28,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}),-r*.1,r*.1,0,false);memb.rotation.y=Math.PI/2;memb.rotation.z=.35;frill.add(memb);g.add(frill);
 for(const sd of[-1,1]){const arm=grp();arm.position.set(r*.55,r*1.6,sd*r*.35);const a1=mesh(new T.BoxGeometry(r*1.1,r*.14,r*.14),bone,r*.45,r*.3,0);a1.rotation.z=.6;const a2=mesh(new T.ConeGeometry(r*.12,r*1.6,4),glow,r*1.25,r*.25,0);a2.rotation.z=-2.2;arm.add(a1,a2);arm.rotation.x=sd*.35;g.add(arm);(g.userData.arms=g.userData.arms||[]).push(arm)}
 const legs=[];for(let i=0;i<4;i++){const sd=i%2?1:-1,row=Math.floor(i/2),lg=grp();lg.position.set(r*(.3-row*.75),r*.9,sd*r*.35);
  const u=mesh(new T.CylinderGeometry(r*.06,r*.08,r*1.4,6),chit,0,r*.3,sd*r*.6);u.rotation.x=sd*-1.1;const l=mesh(new T.CylinderGeometry(r*.07,r*.03,r*1.5,6),bone,0,-r*.2,sd*r*1.25);l.rotation.x=sd*.35;lg.add(u,l);legs.push(lg);g.add(lg)}
 const wings=[];for(const sd of[-1,1]){const w=mesh(new T.CircleGeometry(r*1.3,10,0,1.1),new T.MeshBasicMaterial({color:0xffc0e0,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false}),-r*.2,r*1.7,sd*r*.2,false);w.rotation.set(Math.PI/2+sd*.5,0,Math.PI*.85);g.add(w);wings.push(w)}
 const L=new T.PointLight(0xff4fa0,9000,260,2);L.position.set(-r*1.5,r*1.6,0);g.add(L);const arms=g.userData.arms;
 g.userData={legs,abd:sac,custom:true,anim(t,e){legs.forEach((l,i)=>l.rotation.z=Math.sin(t*5+i*1.7)*.22);sac.scale.setScalar(1+Math.sin(t*2.2)*.04+(e.shriekW>0?.1:0));frill.rotation.x=Math.sin(t*1.3)*.08;frill.scale.setScalar(e.shriekW>0?1.3:1);
  arms.forEach((a,i)=>a.rotation.z=(e.sprayW>0?.6:0)+Math.sin(t*3+i)*.12);wings.forEach((w,i)=>w.rotation.z=Math.PI*.85+Math.sin(t*7+i*Math.PI)*.12)}};return g}
// ---------------------------------------------------------------- timed hazards
const mortar=(x,y,o)=>S().hazards.push(Object.assign({type:'mortar',x,y,r:62,t:1.25,t0:1.25,dmg:24,cx:true},o||{}));
function fissures(e,n,spread){const p=S().p,a0=Math.atan2(p.y-e.y,p.x-e.x);for(let i=0;i<n;i++)S().hazards.push({type:'fissure',x:e.x,y:e.y,a:a0+(i-(n-1)/2)*spread,len:440,t:-.75,dmg:22,cx:true})}
const BOSS_AI={
 colossus(e,dt,p,d){const rage=e.hp<e.max/2;
  if(!(e.slamW>0))A.bossCharge(e,dt,p,rage?6.5:8.5,400,'#b4f');
  if(e.slamW>0){e.slamW-=dt;e.oa=0;e.os=0;e.flash=.05;if(e.slamW<=0){const s=S();s.rings.push({x:e.x,y:e.y,r:10,life:.6,col:'#c6f'});A.burst(e.x,e.y,'#c6f',40);A.sfx('slam');s.shake=Math.min(18,s.shake+9);fissures(e,rage?5:3,rage?.42:.55);
    if(d<160){A.hurtPlayer(24);const k=60/Math.max(d,1);p.x+=(p.x-e.x)*k;p.y+=(p.y-e.y)*k;A.resolve(p)}}}
  else if(!(e.dashT>0)&&!(e.wind>0)&&A.tick(e,'t1',rage?3.4:4.8)){e.slamW=.8;A.floatText(e.x,e.y-70,'SEISMIC SLAM','#d9f')}
  if(A.tick(e,'t3',rage?3.6:5.5)){const n=rage?4:3;for(let i=0;i<n;i++){const a=A.rnd(0,TAU),o=i?A.rnd(40,130):0;mortar(A.clamp(p.x+Math.cos(a)*o+(p.vx||0),40,A.W-40),A.clamp(p.y+Math.sin(a)*o,40,A.H-40),{t:1.15+i*.18,t0:1.15+i*.18,col:'#c6f'})}A.sfx('grenade_launcher')}
  if(A.tick(e,'t2',10))A.bossSummon(e,['leaper','carrier','stalker'],3);if(rage&&A.tick(e,'t4',4.2))A.bossRing(e,14,200,14,'#c6f')},
 matriarch(e,dt,p,d){const rage=e.hp<e.max/2,s=S();
  if(A.tick(e,'t1',rage?5:6.5))e.spiral=3;if(e.spiral>0){e.spiral-=dt;e.sa=(e.sa||0)+dt*(rage?4.2:3.2);if(A.tick(e,'sp',.11)){const n=rage?4:3;for(let k=0;k<n;k++)A.ebullet(e.x,e.y,e.sa+k*TAU/n,220,10,'#ff6fb8')}}
  if(A.tick(e,'t2',rage?5.5:7.5)){for(let i=0;i<4;i++){const a=A.rnd(0,TAU),o=A.rnd(30,150);mortar(A.clamp(p.x+Math.cos(a)*o,40,A.W-40),A.clamp(p.y+Math.sin(a)*o,40,A.H-40),{r:46,t:1.1+i*.15,t0:1.1+i*.15,dmg:14,egg:true,col:'#ff7ad0'})}A.floatText(e.x,e.y-70,'EGG BARRAGE','#f9c')}
  // acid trail while moving
  e.trT=(e.trT||0)-dt;const mv=Math.hypot(e.x-(e.lx??e.x),e.y-(e.ly??e.y));e.lx=e.x;e.ly=e.y;if(e.trT<=0&&mv>.2&&s.hazards.filter(h=>h.trail).length<12){e.trT=.75;s.hazards.push({type:'acid',x:e.x,y:e.y,r:34,life:7,trail:true})}
  if(e.sprayW>0){e.sprayW-=dt;e.oa=0;e.os=0;if(e.sprayW<=0){const a=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-3;k<=3;k++)A.ebullet(e.x,e.y,a+k*.13,300,12,'#bf4')}}
  else if(d<320&&A.tick(e,'t5',3.8)){e.sprayW=.55;e.flash=.1}
  if(A.tick(e,'t3',8.5))A.bossSummon(e,['stalker','mite','mite','mite'],5);
  if(rage){if(e.shriekW>0){e.shriekW-=dt;e.oa=0;e.os=0;if(e.shriekW<=0){A.bossRing(e,26,210,12,'#f6a');s.shake=Math.min(18,s.shake+8);A.sfx('roar');if(d<200){const k=90/Math.max(d,1);p.x+=(p.x-e.x)*k;p.y+=(p.y-e.y)*k;A.resolve(p)}}}
   else if(A.tick(e,'t4',6)){e.shriekW=.9;A.floatText(e.x,e.y-70,'SHRIEK','#f9c')}}}
};
// returns true if the hazard was handled here (also marks expired hazards with life<=0)
function hazard(h,dt){if(!A)return false;const s=S(),p=s.p;
 if(h.type==='mortar'){h.t-=dt;if(h.t<=0){h.life=0;s.rings.push({x:h.x,y:h.y,r:10,life:.4,col:h.col||'#fa6'});A.burst(h.x,h.y,h.col||'#fa6',26);A.sfx('explosion');s.shake=Math.min(18,s.shake+4);
   if(A.dist(h,p)<h.r)A.hurtPlayer(h.dmg);for(const e of s.enemies)if(!A.ENEMIES[e.type].boss&&A.dist(e,h)<h.r)e.hp-=30;
   if(h.egg){if(s.enemies.length<110)A.spawnNear('mite',h.x,h.y,2,24);s.hazards.push({type:'acid',x:h.x,y:h.y,r:38,life:6,trail:true})}}return true}
 if(h.type==='fissure'){h.t+=dt;if(h.t>=.55){h.life=0;return true}if(h.t>0){const cx=Math.cos(h.a),cy=Math.sin(h.a),dx=p.x-h.x,dy=p.y-h.y,pr=dx*cx+dy*cy;
   if(pr>0&&pr<h.len*Math.min(1,h.t*4)&&Math.abs(dx*cy-dy*cx)<p.r+14)A.hurtPlayer(h.dmg);if(Math.random()<.6){const q=A.rnd(0,h.len*Math.min(1,h.t*4));s.parts.push({x:h.x+cx*q,y:h.y+cy*q,vx:A.rnd(-30,30),vy:A.rnd(-30,30),life:.4,col:'#c6f'})}}return true}
 if(h.type==='steam'){const ph=(s.t+h.ph)%h.period;h.on=ph<1.2;h.warn=ph>h.period-.9;if(h.on){if(A.dist(h,p)<h.r)A.hurtPlayer(h.dmg);for(const e of s.enemies)if(A.dist(e,h)<h.r&&!A.ENEMIES[e.type].boss)e.hp-=45*dt}return true}
 return false}
function hazMesh(h){if(!A)return false;const T=A.THREE;if(!h.cx&&h.type!=='steam')return null;const g=grp();
 if(h.type==='mortar'){const d=new T.Mesh(shared.disc,A.add(h.col||'#fa6',.18));d.rotation.x=-Math.PI/2;const r=new T.Mesh(shared.ring,own(h.col||'#fa6',.75));r.rotation.x=-Math.PI/2;const sh=new T.Mesh(new T.IcosahedronGeometry(9,0),A.emis(h.egg?0xff7ad0:0xb070ff,1.6));g.add(d,r,sh);g.userData={d,r,sh}}
 else if(h.type==='fissure'){const b=new T.Mesh(shared.box,own('#c6f',.7));b.name='b';g.add(b);g.userData={b}}
 else if(h.type==='steam'){const d=new T.Mesh(shared.disc,A.M({color:0x20262a,metalness:.7,roughness:.4}));d.rotation.x=-Math.PI/2;d.scale.setScalar(h.r*.7);d.position.y=.7;const r=new T.Mesh(shared.ring,own('#ff9a40',.5));r.rotation.x=-Math.PI/2;r.scale.setScalar(h.r);r.position.y=1;
  const c=new T.Mesh(shared.col,A.add('#dff',.3));c.scale.set(h.r*.75,90,h.r*.75);c.position.y=45;for(let i=0;i<4;i++){const s=new T.Mesh(shared.box,A.mat.dark);s.scale.set(h.r*1.2,1,3);s.position.y=1.2;s.rotation.y=i*Math.PI/4;g.add(s)}g.add(d,r,c);g.userData={r,c}}
 return g}
function hazUpd(h,g){const u=g.userData,s=S();g.position.set(h.x,0,h.y);
 if(h.type==='mortar'){const k=1-h.t/h.t0;u.d.scale.setScalar(h.r);u.d.position.y=1.5;u.r.scale.setScalar(h.r*(1.05-k*.05));u.r.position.y=2;u.r.material.opacity=.4+.5*Math.abs(Math.sin(s.t*12));u.sh.position.y=20+Math.sin(k*Math.PI)*160;u.sh.position.x=-(1-k)*90}
 else if(h.type==='fissure'){const L=h.len*(h.t>0?Math.min(1,h.t*4):1),w=h.t>0?14:4;u.b.position.set(Math.cos(h.a)*L/2,h.t>0?6:2,Math.sin(h.a)*L/2);u.b.rotation.y=-h.a;u.b.scale.set(L,h.t>0?10:1,w);u.b.material.opacity=h.t>0?.85:.25+.2*Math.sin(s.t*20)}
 else if(h.type==='steam'){u.c.visible=h.on;u.c.scale.y=90+Math.sin(s.t*30)*8;u.r.material.opacity=h.warn?.4+.5*Math.abs(Math.sin(s.t*14)):h.on?.7:.15}}
// ---------------------------------------------------------------- objective variants
function objectives(){const P=A.P,dist=A.dist;
 return{
 escort:{label:'Escort the payload',
  setup(S,f){const path=f.path.map(q=>P(q[0],q[1]));const it=A.mkItem({kind:'escort',x:path[0].x,y:path[0].y,r:120,label:f.payload||'PAYLOAD',color:'#6cf',path,seg:0,amb:0,speed:f.payloadSpeed||36,trav:0});
   it.total=path.slice(1).reduce((a,q,i)=>a+dist(q,path[i]),0);S.items=[it]},
  update(dt,S){const it=S.items[0];if(it.done)return;const near=dist(S.p,it)<it.r;it.contest=S.enemies.filter(e=>dist(e,it)<75).length;it.moving=near&&it.contest<2;
   if(it.moving){let mv=it.speed*dt*(it.contest?.5:1);while(mv>0&&it.seg<it.path.length-1){const q=it.path[it.seg+1],d=dist(it,q);if(d<=mv){it.x=q.x;it.y=q.y;it.seg++;mv-=d;it.trav+=d}else{it.x+=(q.x-it.x)/d*mv;it.y+=(q.y-it.y)/d*mv;it.trav+=mv;mv=0}}
    it.prog=Math.min(1,it.trav/it.total);if(it.seg>=it.path.length-1){it.done=true;it.prog=1;A.burst(it.x,it.y,it.color,40);A.sfx('complete');A.floatText(it.x,it.y-40,it.label+' DELIVERED',it.color)}}
   const th=[.3,.62,.85];if(it.amb<th.length&&it.prog>=th[it.amb]){it.amb++;A.floatText(it.x,it.y-40,'AMBUSH!','#f66');A.sfx('roar');const n=Math.round((4+S.floor/4)*A.DF().count);for(let i=0;i<n;i++){const a=A.rnd(0,TAU),r=A.rnd(230,320);A.spawnEnemy(A.pickType(),A.clamp(it.x+Math.cos(a)*r,30,A.W-30),A.clamp(it.y+Math.sin(a)*r,30,A.H-30))}}},
  progress:S=>{const it=S.items[0];return `Payload ${Math.floor(it.prog*100)}%`+(it.done?'':it.contest>1?'  — CONTESTED: clear the bugs around it':it.contest?'  — slowed: a bug is on it':dist(S.p,it)>it.r?'  — stay close to push it':'  — moving')},done:A.allDone},
 cells:{label:'Deliver power cells',
  setup(S,f){S.carry=null;const so=A.mkItem({kind:'socket',...P(...(f.socket||[20,11])),label:'GRID SOCKET',color:'#ffd23a',r:30,active:false,need:f.points.length,got:0});
   S.items=f.points.map((q,i)=>A.mkItem({kind:'cell',...P(q[0],q[1]),label:'POWER CELL',color:'#ffd23a',idx:i,r:14}));S.items.push(so);S.socket=so},
  update(dt,S){const p=S.p,so=S.socket;
   if(!S.carry)for(const it of S.items){if(it.kind!=='cell'||it.done)continue;it.active=true;if(dist(p,it)<it.r+p.r+10){S.carry=it;it.active=false;A.sfx('pickup');A.floatText(p.x,p.y-30,'CELL ACQUIRED — slower fire while carrying','#ffd23a');break}}
   if(S.carry){for(const it of S.items)if(it.kind==='cell')it.active=false;const c=S.carry;c.x=p.x;c.y=p.y;so.active=true;p.slow=Math.min(p.slow,.85);
    if(dist(p,so)<so.r+p.r+6){c.done=true;c.x=so.x+Math.cos(so.got*2.1)*16;c.y=so.y+Math.sin(so.got*2.1)*16;S.carry=null;so.got++;A.burst(so.x,so.y,so.color,30);A.sfx('complete');A.floatText(so.x,so.y-40,`CELL ${so.got}/${so.need} SEATED`,so.color);if(so.got>=so.need)so.done=true;else{const n=Math.round((2+S.floor/7)*A.DF().count);for(let i=0;i<n;i++){const q=A.edgeSpawn?A.edgeSpawn():{x:A.rnd(40,A.W-40),y:Math.random()<.5?40:A.H-40};A.spawnEnemy(A.pickType(),q.x,q.y)}}}}
   else so.active=false},
  progress:S=>{const so=S.socket;return `Power cells ${so.got}/${so.need}`+(S.carry?'  — carry it to the socket (slower fire while carrying)':'  — pick up a cell')},done:A.allDone},
 defend:{label:'Defend the core',
  setup(S,f){S.items=[A.mkItem({kind:'defend',...P(...(f.core||[20,11])),r:150,label:'CORE',color:'#3ff0ff',hp:100,time:f.defendT||50,t:0,breaches:0})]},
  update(dt,S){const it=S.items[0];if(it.done)return;it.t+=dt;it.prog=Math.min(1,it.t/it.time);let n=0;
   for(const e of S.enemies){if(A.ENEMIES[e.type].boss)continue;if(e.sap===undefined)e.sap=Math.random()<.45;if(e.sap){e.goal=it;if(dist(e,it)<70+e.r)n++}}
   it.under=n;if(n)it.hp-=n*2.4*dt;else it.hp=Math.min(100,it.hp+2*dt);
   if(it.hp<=0){it.hp=60;it.breaches++;it.t=Math.max(0,it.t-8);S.rings.push({x:it.x,y:it.y,r:10,life:.7,col:'#f55'});A.burst(it.x,it.y,'#f55',50);S.shake=16;A.sfx('slam');if(dist(S.p,it)<it.r)A.hurtPlayer(18);
    for(const e of S.enemies)if(!A.ENEMIES[e.type].boss&&dist(e,it)<it.r)e.hp-=60;A.floatText(it.x,it.y-50,'CORE BREACH! −8s','#f66')}
   if(it.prog>=1){it.done=true;A.burst(it.x,it.y,it.color,50);A.sfx('complete');A.floatText(it.x,it.y-50,'CORE SEALED',it.color);for(const e of S.enemies)e.goal=null}},
  progress:S=>{const it=S.items[0];return `Core sealed ${Math.floor(it.prog*100)}%  integrity ${Math.max(0,Math.round(it.hp))}%`+(it.under?'  — SAPPERS ON THE CORE!':'')},done:A.allDone},
 }}
function itemMesh(it,g,u){if(!A)return false;const T=A.THREE,c=new T.Color(it.color);
 if(it.kind==='escort'){const cart=grp();cart.add(A.box(46,14,30,A.mat.armor,0,14,0),A.box(50,4,34,A.mat.dark,0,6,0));for(const sx of[-16,16])for(const sz of[-16,16])cart.add(A.cyl(6,6,6,A.mat.dark,sx,6,sz));u.core=A.sph(10,A.emis(c,2.2),0,34,0);cart.add(u.core);
   u.cage=new T.Mesh(new T.TorusGeometry(14,1.5,6,20),A.emis(c,1.4));u.cage.position.y=34;cart.add(u.cage);g.add(cart);u.cart=cart;
   u.floor=new T.Mesh(shared.ring,own(c,.4));u.floor.rotation.x=-Math.PI/2;u.floor.scale.setScalar(it.r);u.floor.position.y=1.5;g.add(u.floor);
   const pl=new T.Group();for(let i=1;i<it.path.length;i++){const a=it.path[i-1],b=it.path[i],L=A.dist(a,b),m=new T.Mesh(shared.box,A.add(c,.22));m.scale.set(L,1,6);m.position.set((a.x+b.x)/2-it.x,.9,(a.y+b.y)/2-it.y);m.rotation.y=-Math.atan2(b.y-a.y,b.x-a.x);pl.add(m)}g.add(pl);u.pathLine=pl;u.origin={x:it.x,y:it.y};return true}
 if(it.kind==='cell'){u.core=A.cyl(6,6,20,A.emis(c,2.2),0,24,0);g.add(A.cyl(10,12,5,A.mat.steel,0,2.5,0),u.core,A.cyl(7,7,3,A.mat.dark,0,35,0),A.cyl(7,7,3,A.mat.dark,0,13,0));return true}
 if(it.kind==='socket'){g.add(A.cyl(it.r+6,it.r+10,6,A.mat.steel,0,3,0));for(let i=0;i<it.need;i++){const a=i*2.1;g.add(A.cyl(8,8,4,A.mat.dark,Math.cos(a)*16,7,Math.sin(a)*16))}u.core=new T.Mesh(new T.TorusGeometry(it.r,2.5,6,32),A.emis(c,1));u.core.rotation.x=Math.PI/2;u.core.position.y=9;g.add(u.core);
   u.beam=new T.Mesh(new T.CylinderGeometry(12,16,200,16,1,true),A.add(c,.16));u.beam.position.y=100;g.add(u.beam);return true}
 if(it.kind==='defend'){g.add(A.cyl(34,40,22,A.mat.steel,0,11,0));u.core=A.cyl(12,16,84,A.emis(c,1.2),0,64,0);g.add(u.core);u.rings=[];for(let i=0;i<3;i++){const r=new T.Mesh(new T.TorusGeometry(28+i*7,2,6,32),A.emis(c,.9));r.position.y=34+i*24;g.add(r);u.rings.push(r)}
   u.floor=new T.Mesh(shared.ring,own(c,.45));u.floor.rotation.x=-Math.PI/2;u.floor.scale.setScalar(it.r);u.floor.position.y=1.5;g.add(u.floor);u.hpbar=A.box(1,4,4,A.emis(0x55ff88,2.5),0,118,0,false);g.add(u.hpbar);const L=new T.PointLight(c,14000,320,2);L.position.y=90;g.add(L);u.L=L;return true}
 return false}
function itemUpd(it,g){if(!A)return false;const u=g.userData,s=S();
 if(it.kind==='escort'){g.position.set(it.x,0,it.y);if(u.pathLine)u.pathLine.position.set(u.origin.x-it.x,0,u.origin.y-it.y);u.cage.rotation.x=s.t*2;u.cage.rotation.y=s.t*1.3;u.core.material=qe(it.contest?'#ff5050':it.color,it.moving?2.6:1.2);u.floor.material.opacity=A.dist(s.p,it)<it.r?.6:.25;
  if(it.seg<it.path.length-1){const q=it.path[it.seg+1];u.cart.rotation.y=-Math.atan2(q.y-it.y,q.x-it.x)}return true}
 if(it.kind==='cell'){if(s.carry===it){g.position.set(it.x,26,it.y)}else g.position.set(it.x,0,it.y);u.core.material=qe(it.color,it.done?1:1.6+Math.sin(s.t*6)*.6);return true}
 if(it.kind==='socket'){u.beam.visible=it.active&&!it.done;u.core.material=qe(it.color,it.done?2.4:it.active?1.2+Math.sin(s.t*6)*.6:.3);return true}
 if(it.kind==='defend'){u.rings.forEach((r,i)=>{r.rotation.x=Math.PI/2+Math.sin(s.t*(1+i))*.5;r.rotation.y=s.t*(i+1)*.8});u.core.material=qe(it.under?'#ff5050':it.color,it.done?.6:1+Math.sin(s.t*6)*.4);
  const k=Math.max(0,it.hp)/100;u.hpbar.scale.x=Math.max(.01,k*60);u.hpbar.material=qe(k>.5?0x55ff88:k>.25?0xffcc44:0xff4444,2.5);u.floor.material.opacity=it.under?.7:.35;return true}
 return false}
// ---------------------------------------------------------------- set pieces (decor on top of wall blocks / map edges, never blocking)
const SETS={
 pumps(ctx){const{T,add}=ctx;for(const w of ctx.walls){const n=Math.max(1,Math.round(w.w/140));for(let i=0;i<n;i++){const x=w.x+(i+.5)*w.w/n,z=w.y+w.h/2;add(A.cyl(14,16,40,A.mat.armor,x,92,z),A.cyl(16,16,4,ctx.trim,x,112,z));const p=A.cyl(4,4,Math.max(w.h,20),A.mat.dark,x,80,z);p.rotation.x=Math.PI/2;add(p)}}},
 spire(ctx){const{add}=ctx,x=ctx.W+13,z=ctx.P(38,6).y;add(A.cyl(10,22,220,A.mat.armor,x,110,z));for(let i=0;i<5;i++)add(A.cyl(26-i*4,26-i*4,3,ctx.trim,x,40+i*40,z));add(A.sph(12,A.emis(0x66ccff,3),x,228,z))},
 tanks(ctx){const{T,add}=ctx;const gl=new T.MeshPhysicalMaterial({color:0x88ffcc,transparent:true,opacity:.25,roughness:.05,depthWrite:false});for(const w of ctx.walls){if(w.w<64&&w.h<64)continue;const x=w.x+w.w/2,z=w.y+w.h/2;add(A.cyl(15,15,46,gl,x,96,z),A.cyl(17,17,6,A.mat.armor,x,74,z),A.cyl(17,17,6,A.mat.armor,x,120,z));const sp=A.sph(7,A.emis(0x3fc,1.2),x,96,z);sp.scale.y=1.8;add(sp)}},
 racks(ctx){const{add}=ctx;for(const w of ctx.walls){const n=Math.max(1,Math.round(w.h/64));for(let i=0;i<n;i++){const z=w.y+(i+.5)*w.h/n;add(A.box(Math.min(w.w,26),30,22,A.mat.dark,w.x+w.w/2,88,z));for(let k=0;k<3;k++)add(A.box(2,2,18,A.emis(k%2?0x55ffaa:0x3399ff,2.5),w.x+w.w/2+Math.min(w.w,26)/2+.5,80+k*8,z,false))}}},
 ribs(ctx){const{T,add}=ctx;const bone=A.M({color:0xd8c0c8,roughness:.6});for(let i=0;i<5;i++){const t=new T.Mesh(new T.TorusGeometry(150,9,6,20,Math.PI),bone);t.position.set(ctx.W/2-260+i*130,0,ctx.H/2);t.rotation.y=Math.PI/2;t.castShadow=true;t.scale.set(1,.85,1);t.position.z=-30;add(t);const t2=t.clone();t2.position.z=ctx.H+30;add(t2)}},
 eggs(ctx){const{add}=ctx;for(const w of ctx.walls){for(let i=0;i<3;i++){const e=A.sph(9,A.emis(0xff6ab0,.8,0x301020),w.x+w.w/2+A.rnd(-6,6),76+i*10,w.y+A.rnd(0,w.h));e.scale.y=1.4;add(e)}}},
 stalks(ctx){const{T,add}=ctx;const m=A.M({color:0x4a5a12,emissive:0x8aff20,emissiveIntensity:.15,roughness:.7});for(const w of ctx.walls){const x=w.x+w.w/2,z=w.y+w.h/2;add(A.cyl(4,8,90,m,x,117,z));const cap=A.sph(22,A.emis(0xbfff40,.6,0x223300),x,164,z);cap.scale.y=.45;add(cap)}},
 nerves(ctx){const{T,add}=ctx;const m=A.emis(0xd070ff,1.6);const c=ctx.walls.map(w=>({x:w.x+w.w/2,y:w.y+w.h/2}));for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++){const a=c[i],b=c[j],L=Math.hypot(b.x-a.x,b.y-a.y);if(L>300)continue;const t=new T.Mesh(new T.CylinderGeometry(1.6,1.6,L,5),m);t.position.set((a.x+b.x)/2,86+Math.sin(i+j)*6,(a.y+b.y)/2);t.rotation.z=Math.PI/2;t.rotation.y=-Math.atan2(b.y-a.y,b.x-a.x);add(t)}},
 cisterns(ctx){const{add}=ctx;for(const w of ctx.walls){const n=Math.max(1,Math.round(w.w/180));for(let i=0;i<n;i++){const x=w.x+(i+.5)*w.w/n,z=w.y+w.h/2;add(A.cyl(22,22,30,A.mat.armor,x,88,z),A.cyl(18,18,2,A.add(0x9aff20,.6),x,104,z))}}},
 throne(ctx){const{T,add}=ctx;const bone=A.M({color:0xe0c8d0,roughness:.55}),x=ctx.W/2,z=ctx.P(20,3).y;add(A.box(110,30,40,bone,x,88,z-10));for(let i=0;i<9;i++){const c=new T.Mesh(new T.ConeGeometry(7,70+Math.sin(i)*30,5),bone);c.position.set(x-60+i*15,120,z-24);c.castShadow=true;add(c)}add(A.sph(10,A.emis(0xff4fa0,3),x,150,z-24))},
 coolant(ctx){const{T,add}=ctx;const m=A.emis(0x33f0ff,1.2);for(const w of ctx.walls){const x=w.x+w.w/2,z=w.y+w.h/2;const t=new T.Mesh(new T.TorusGeometry(18,4,6,16),m);t.rotation.x=Math.PI/2;t.position.set(x,80,z);add(t,A.cyl(8,8,20,A.mat.armor,x,84,z))}},
 debris(ctx){const{T,add}=ctx;const m=A.M({color:0x3a3048,roughness:.8,flatShading:true});const set=[];for(let i=0;i<14;i++){const r=new T.Mesh(new T.DodecahedronGeometry(A.rnd(6,16),0),m);r.castShadow=true;r.userData.orb={a:i*.45,rad:90+(i%5)*45,h:30+(i%4)*22,sp:.25+(i%3)*.12};add(r);set.push(r)}ctx.anim(t=>{const c=ctx.P(20,11);for(const r of set){const o=r.userData.orb,a=o.a+t*o.sp;r.position.set(c.x+Math.cos(a)*o.rad,o.h+Math.sin(t*2+o.a)*6,c.y+Math.sin(a)*o.rad);r.rotation.x=t*o.sp*2}})},
 wreck(ctx){const{add}=ctx;for(const w of ctx.walls){if(Math.random()<.5)continue;const x=w.x+A.rnd(0,w.w),z=w.y+A.rnd(0,w.h),b=A.box(26,18,22,A.mat.armorDark,x,81,z);b.rotation.y=A.rnd(0,3);b.rotation.z=A.rnd(-.4,.4);add(b)}},
 heart(ctx){const{T,add}=ctx;const m=A.M({color:0x5a0a14,emissive:0xff2040,emissiveIntensity:.35,roughness:.4});for(const w of ctx.walls){const x=w.x+w.w/2,z=w.y+w.h/2,v=new T.Mesh(new T.TorusKnotGeometry(12,4,40,6),m);v.position.set(x,92,z);v.castShadow=true;add(v)}
  const veins=A.add(0xff2040,.25);for(let i=0;i<10;i++){const a=i*.63,L=A.rnd(160,320),v=new T.Mesh(shared.box,veins);v.scale.set(L,1,4);const c=ctx.P(20,11);v.position.set(c.x+Math.cos(a)*L/2,.8,c.y+Math.sin(a)*L/2);v.rotation.y=-a;add(v)}},
 tendrils(ctx){const{T,add}=ctx;const m=A.M({color:0x3a0814,emissive:0xff2050,emissiveIntensity:.3,roughness:.4});for(let i=0;i<12;i++){const a=i/12*TAU,c=ctx.P(20,9),t=new T.Mesh(new T.CylinderGeometry(3,12,180,7),m);t.position.set(c.x+Math.cos(a)*380,30,c.y+Math.sin(a)*300);t.rotation.z=Math.cos(a)*1.2;t.rotation.x=-Math.sin(a)*1.2;add(t)}},
};
const anims=[];
function setPiece(f,ctx){if(!A)return false;anims.length=0;const fn=SETS[f.set];if(!fn)return;ctx.anim=fn2=>anims.push(fn2);fn(ctx)}
function animate(t){for(const a of anims)a(t)}
window.TDP_CONTENT={init,makeColossus,makeMatriarch,BOSS_AI,hazard,hazMesh,hazUpd,objectives,itemMesh,itemUpd,setPiece,animate,SETS:Object.keys(SETS)};
})();
