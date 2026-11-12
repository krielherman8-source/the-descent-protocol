/* The Descent Protocol — "intro look" layer (window.TDP_LOOK), loaded by index.html after visuals.js.
   Brings the intro movie's look into the game without touching gameplay:
   - cold blue / teal facility light with red alien + emergency glows, deeper teal fog haze
   - drifting fog banks, light shafts with floor pools, dust motes, wall-mounted red emergency beacons
   - flickering broken light panels that spit sparks
   - dark spider-carapace enemy materials with a type-coloured rim light (keeps enemy types readable)
   - the Overmind's cracked, glowing biomass, and organic growth creeping over walls/floor as floors get deeper
   - FPS watchdog: drops High -> Medium -> Low when the game cannot hold its frame rate (phones), and phones start on Medium
   Everything is procedural (canvas textures, instanced meshes, a few sprites), cosmetic only, and scaled by CFG.quality. */
(function(){
let T,C,S=()=>null;const R=(a,b)=>a+Math.random()*(b-a),TAU=Math.PI*2;
const Q=()=>C?C.CFG.quality:'high',LV=()=>({low:0,med:1,high:2})[Q()]??2;
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h||w;return [c,c.getContext('2d')]}
function ctex(c,srgb,rep){const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping}return t}
// ---------------------------------------------------------------- textures
let TX=null;function textures(){if(TX)return TX;TX={};
 {const[c,g]=cv(64),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);TX.soft=ctex(c)}
 {const n=128,[c,g]=cv(n);for(let i=0;i<26;i++){const x=R(28,100),y=R(34,94),r=R(14,40),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(255,255,255,${R(.12,.3)})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,n,n)}TX.fog=ctex(c)}
 {const[c,g]=cv(8,128),gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.55,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=gr;g.fillRect(0,0,8,128);TX.shaft=ctex(c)}
 // biomass: wet dark flesh + branching glowing veins (albedo, emissive, alpha)
 {const n=256,[ac,a]=cv(n),[ec,e]=cv(n),[oc,o]=cv(n);a.fillStyle='#4a1416';a.fillRect(0,0,n,n);e.fillStyle='#000';e.fillRect(0,0,n,n);o.fillStyle='#000';o.fillRect(0,0,n,n);
  for(let i=0;i<90;i++){const x=R(0,n),y=R(0,n),r=R(6,30),gr=a.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${R(95,140)|0},${R(24,40)|0},${R(30,44)|0},.8)`);gr.addColorStop(1,'rgba(40,10,12,0)');a.fillStyle=gr;a.fillRect(x-r,y-r,r*2,r*2)}
  const vein=(x,y,an,w,d)=>{if(d>6||w<.6)return;const L=R(14,40);let px=x,py=y;for(let s=0;s<6;s++){const nx=px+Math.cos(an)*L/6,ny=py+Math.sin(an)*L/6;for(const[g,col,k]of[[a,'rgba(120,20,26,.9)',1.8],[e,'rgba(255,60,40,1)',1]]){g.strokeStyle=col;g.lineWidth=w*k;g.lineCap='round';g.beginPath();g.moveTo(px,py);g.lineTo(nx,ny);g.stroke()}an+=R(-.4,.4);px=nx;py=ny}
   vein(px,py,an+R(-.9,-.3),w*.7,d+1);if(Math.random()<.7)vein(px,py,an+R(.3,.9),w*.65,d+1)};
  for(let i=0;i<7;i++)vein(R(0,n),R(0,n),R(0,TAU),R(2.4,4),0);
  {const gr=o.createRadialGradient(n/2,n/2,n*.12,n/2,n/2,n*.5);gr.addColorStop(0,'#fff');gr.addColorStop(.7,'#bbb');gr.addColorStop(1,'#000');o.fillStyle=gr;o.beginPath();for(let i=0;i<=28;i++){const an=i/28*TAU,r=n*(.36+Math.random()*.12);o.lineTo(n/2+Math.cos(an)*r,n/2+Math.sin(an)*r)}o.fill()}
  TX.bioMap=ctex(ac,true,1);TX.bioEm=ctex(ec,true,1);TX.bioAlpha=ctex(oc)}
 // Overmind: dark crust split by molten red cracks (equirect for a sphere)
 {const w=512,h=256,[ac,a]=cv(w,h),[ec,e]=cv(w,h);a.fillStyle='#2a0608';a.fillRect(0,0,w,h);e.fillStyle='#000';e.fillRect(0,0,w,h);
  for(let i=0;i<220;i++){const x=R(0,w),y=R(0,h),r=R(4,26),gr=a.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${R(70,120)|0},${R(10,22)|0},${R(12,22)|0},.7)`);gr.addColorStop(1,'rgba(30,5,8,0)');a.fillStyle=gr;a.fillRect(x-r,y-r,r*2,r*2)}
  const crack=(x,y,an,wd,d)=>{if(d>5||wd<.7)return;let px=x,py=y;const st=(R(6,14))|0;for(let s=0;s<st;s++){const nx=px+Math.cos(an)*R(6,13),ny=py+Math.sin(an)*R(6,13);
    for(const[g,col,k,b]of[[e,'rgba(255,90,30,.35)',4,0],[e,'rgba(255,120,50,1)',1.3,0],[e,'rgba(255,235,170,1)',.45,0],[a,'rgba(255,90,40,1)',1,0]]){g.strokeStyle=col;g.lineWidth=wd*k;g.lineCap='round';g.beginPath();for(const ox of[0,-w,w]){g.moveTo(px+ox,py);g.lineTo(nx+ox,ny)}g.stroke()}
    an+=R(-.55,.55);px=nx;py=ny}crack(px,py,an+R(-1.2,-.4),wd*.72,d+1);crack(px,py,an+R(.4,1.2),wd*.72,d+1)};
  for(let i=0;i<16;i++)crack(R(0,w),R(h*.15,h*.85),R(0,TAU),R(2.5,4.2),0);
  TX.omMap=ctex(ac,true,1);TX.omEm=ctex(ec,true,1)}
 // abdomen markings: dark with glowing bands/spots (white; tinted by the material's emissive colour)
 {const n=64,[c,g]=cv(n);g.fillStyle='#000';g.fillRect(0,0,n,n);for(let i=0;i<4;i++){const y=8+i*15;g.globalAlpha=.45;const gr=g.createLinearGradient(0,y,0,y+6);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,y,n,6)}
  g.globalAlpha=1;for(let i=0;i<10;i++){g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(R(4,60),R(4,60),R(1.2,2.6),0,7);g.fill()}TX.abd=ctex(c,true,1)}
 return TX}
// ---------------------------------------------------------------- materials (enemies, Overmind)
// fresnel rim: the cold "backlight" outline that separates dark creatures from a dark floor (colour = enemy type)
function rim(m,col,k){m.userData.rimC=new T.Color(col);m.userData.rimK=k;m.onBeforeCompile=sh=>{sh.uniforms.rimC={value:m.userData.rimC};sh.uniforms.rimK={value:m.userData.rimK};
  sh.fragmentShader='uniform vec3 rimC;uniform float rimK;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float fr=1.0-clamp(dot(normal,normalize(vViewPosition)),0.0,1.0);totalEmissiveRadiance+=rimC*rimK*fr*fr*fr;}')};
 m.customProgramCacheKey=()=>'tdp-rim';return m}
function carapace(col,HQ){const c=new T.Color(col),base=c.clone().multiplyScalar(HQ?.13:.2).add(new T.Color(0x07090b));
 const m=new T.MeshStandardMaterial({color:base,emissive:c,emissiveIntensity:.035,metalness:.5,roughness:HQ?.3:.45,map:HQ&&window.TDP_VIS?TDP_VIS.chitin():null});return rim(m,c,HQ?1.25:.9)}
function legMat(col,HQ){const c=new T.Color(col);return rim(new T.MeshStandardMaterial({color:c.clone().multiplyScalar(.09).add(new T.Color(0x060708)),roughness:.4,metalness:.45}),c,HQ?.7:.5)}
// glowing abdomen: dark chitin with lit bands/spots, type colour pulled toward alien red
function abdomen(col,HQ){const c=new T.Color(col).lerp(new T.Color(0xff2418),.7);const tx=textures();
 return rim(new T.MeshStandardMaterial({color:new T.Color(col).multiplyScalar(.12).add(new T.Color(0x0a0506)),emissive:c,emissiveMap:tx.abd,emissiveIntensity:HQ?1.5:1.2,metalness:.4,roughness:.35}),new T.Color(col),HQ?1.1:.8)}
// glowing abdomen for types whose glow is a gameplay cue (spitter purple, bloater yellow, boss colours): dark chitin + glow spots,
// or a full glow for the bloater so 'about to explode' still reads instantly
function glowAbd(c,i,spots){const col=new T.Color(c);const m=new T.MeshStandardMaterial({color:col.clone().multiplyScalar(spots?.1:.3).add(new T.Color(0x080506)),emissive:col,emissiveIntensity:spots?i*2.6:i,emissiveMap:spots?textures().abd:null,metalness:.35,roughness:.35});return rim(m,col,.8)}
let OM=null;function overmindMats(){if(OM)return OM;const tx=textures();
 OM={brain:new T.MeshStandardMaterial({color:0xffffff,map:tx.omMap,emissive:0xff3a1c,emissiveMap:tx.omEm,emissiveIntensity:1.3,roughness:.55,metalness:.1}),
  flesh:rim(new T.MeshStandardMaterial({color:0x2a0a10,emissive:0xff2040,emissiveIntensity:.12,roughness:.32,metalness:.2,map:window.TDP_VIS?TDP_VIS.chitin():null}),0xff3050,.4)};return OM}
// ---------------------------------------------------------------- ambient FX (persist across floors)
let dust=null,sparks=null,fogG=null,SP=[],fogs=[];const SPMAX=260;
function mkDust(){const n=320,g=new T.BufferGeometry(),p=new Float32Array(n*3),ph=new Float32Array(n);for(let i=0;i<n;i++){p[i*3]=R(-80,C.W+80);p[i*3+1]=R(6,150);p[i*3+2]=R(-60,C.H+60);ph[i]=R(0,TAU)}
 g.setAttribute('position',new T.BufferAttribute(p,3));const m=new T.PointsMaterial({size:3.2,map:textures().soft,color:0x9fdcef,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false,fog:false});
 dust=new T.Points(g,m);dust.frustumCulled=false;dust.userData.ph=ph;dust.renderOrder=3;C.scene.add(dust)}
function mkSparks(){const g=new T.BufferGeometry(),p=new Float32Array(SPMAX*3),c=new Float32Array(SPMAX*3);g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('color',new T.BufferAttribute(c,3));
 sparks=new T.Points(g,new T.PointsMaterial({size:3.4,map:textures().soft,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false}));sparks.frustumCulled=false;sparks.renderOrder=3;C.scene.add(sparks)}
function mkFog(){fogG=new T.Group();fogG.name='look-fog';C.scene.add(fogG);const tx=textures();
 for(let i=0;i<14;i++){const m=new T.SpriteMaterial({map:tx.fog,color:i%5===0?0x5a2a30:0x5f93a3,transparent:true,opacity:0,depthWrite:false,fog:false});const s=new T.Sprite(m);const sc=R(380,640);s.scale.set(sc,sc*.55,1);
  s.position.set(R(0,C.W),R(18,70),R(0,C.H));s.userData={vx:R(-9,9),vz:R(-5,5),op:R(.08,.14),ph:R(0,TAU)};s.renderOrder=2;fogG.add(s);fogs.push(s)}}
function burst(x,y,z,n){for(let i=0;i<n&&SP.length<SPMAX;i++){const a=R(0,TAU),v=R(40,160);SP.push({x,y,z,vx:Math.cos(a)*v,vy:R(30,170),vz:Math.sin(a)*v*.6+R(20,70),life:R(.35,.9),l0:.9})}}
// ---------------------------------------------------------------- per-floor dressing
let lvl=null,pulseMats=[],beacons=[],flickers=[],emitters=[],shafts=[];
const KEEP=[];// shared geometries kept between floors
let G=null;function geos(){if(G)return G;G={blob:new T.IcosahedronGeometry(1,2),disc:new T.CircleGeometry(1,24).rotateX(-Math.PI/2),shaft:new T.CylinderGeometry(.42,1,1,24,1,true),box:new T.BoxGeometry(1,1,1),plane:new T.PlaneGeometry(1,1)};return G}
// volumetric-looking light cone: soft at the silhouette edges (view-angle falloff) and fading toward the top
function shaftMat(){return new T.ShaderMaterial({uniforms:{col:{value:new T.Color(0x7fd0ff)},op:{value:.22}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
 vertexShader:'varying vec2 vUv;varying vec3 vN,vV;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalMatrix*normal;vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform vec3 col;uniform float op;varying vec2 vUv;varying vec3 vN,vV;void main(){float e=abs(dot(normalize(vN),normalize(vV)));float a=op*pow(e,2.5)*pow(1.-vUv.y,1.6);gl_FragColor=vec4(col*a,a);}'})}
let BM=null;function bioMats(){if(BM)return BM;const tx=textures();
 BM={wall:rim(new T.MeshStandardMaterial({color:0xffffff,map:tx.bioMap,emissive:0xff2a20,emissiveMap:tx.bioEm,emissiveIntensity:1.2,roughness:.38,metalness:.1}),0xff3a30,.35),
  floor:new T.MeshStandardMaterial({color:0xffffff,map:tx.bioMap,emissive:0xff2a20,emissiveMap:tx.bioEm,emissiveIntensity:1.0,alphaMap:tx.bioAlpha,transparent:true,depthWrite:false,roughness:.25,metalness:.1,polygonOffset:true,polygonOffsetFactor:-1}),
  shaft:shaftMat(),
  pool:new T.MeshBasicMaterial({map:textures().soft,color:0x58b8e0,transparent:true,opacity:.11,blending:T.AdditiveBlending,depthWrite:false,fog:false}),
  red:new T.MeshBasicMaterial({color:0xff2a1a,fog:false}),redGlow:new T.MeshBasicMaterial({map:textures().soft,color:0xff2a14,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false,fog:false}),
  redPool:new T.MeshBasicMaterial({map:textures().soft,color:0xff1a10,transparent:true,opacity:.2,blending:T.AdditiveBlending,depthWrite:false,fog:false}),
  panel:new T.MeshBasicMaterial({color:0x9fe8ff,fog:false}),panelGlow:new T.MeshBasicMaterial({map:textures().soft,color:0x7fd8ff,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false,fog:false})};return BM}
function inst(geo,mat,list,cs){if(!list.length)return null;const im=new T.InstancedMesh(geo,mat,list.length);list.forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=!!cs;im.receiveShadow=true;lvl.add(im);return im}
const _o=()=>new T.Object3D();
function put(L,x,y,z,sx,sy,sz,ry,rx,rz){const o=_o();o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);o.scale.set(sx,sy,sz);o.updateMatrix();L.push(o.matrix.clone())}
// depth 0..1: how far the Overmind's growth has crept (none on the first floors, everywhere by floor 30 / endless)
function depthK(s){const fl=s.floor|0;if(s.endless)return 1;const th=s.f&&s.f.theme;return Math.max(th==='hive'||th==='core'?.55:0,Math.min(1,Math.max(0,(fl-5)/22)))}
function build(ctx){// called at the end of buildLevel (level group already built)
 if(lvl){lvl.parent&&lvl.parent.remove(lvl);const keepM=BM?Object.values(BM):[];lvl.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.material&&!keepM.includes(o.material))o.material.dispose()})}
 lvl=new T.Group();lvl.name='look-level';C.scene.add(lvl);beacons=[];flickers=[];emitters=[];shafts=[];SP.length=0;
 const s=S(),q=LV(),W=C.W,H=C.H,walls=ctx.walls||[],g=geos(),bm=bioMats(),dark=!!(s.f&&s.f.dark);
 const inner=(x,y,m)=>walls.some(w=>x>w.x-m&&x<w.x+w.w+m&&y>w.y-m&&y<w.y+w.h+m);
 // --- lighting grade: colder sky/fill, cyan key, deeper haze
 C.hemi.color.set(0x5d9fc4);C.hemi.groundColor.set(0x0a0608);C.sun.color.set(0x8fcfff);if(!dark){C.hemi.intensity*=.86;C.sun.intensity*=.9}
 C.scene.fog.color.set(dark?0x010304:0x05121a);C.scene.fog.near=q?640:900;C.scene.fog.far=q?1750:2100;C.scene.background.set(dark?0x010203:0x03080b);
 // --- red emergency beacons on the back (north) wall + side walls: lamp + glow sprite + red spill on the floor
 if(q>0){const pos=[];for(let x=150;x<W-100;x+=R(300,420))pos.push([x,62,3,0]);for(let y=200;y<H-120;y+=R(320,420)){pos.push([3,54,y,1]);pos.push([W-3,54,y,-1])}
  for(const[x,y,z,sd]of pos){const lamp=new T.Mesh(g.box,bm.red);lamp.scale.set(sd?3:14,5,sd?14:3);lamp.position.set(x,y,z);const gl=new T.Sprite(new T.SpriteMaterial({map:textures().soft,color:0xff2a14,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false,fog:false}));gl.scale.set(70,70,1);gl.position.set(x+sd*4,y,z+(sd?0:4));
   const pool=new T.Mesh(g.disc,bm.redPool.clone());pool.scale.set(sd?60:110,1,sd?110:60);pool.position.set(x+sd*30,.7,z+(sd?0:34));lvl.add(lamp,gl,pool);beacons.push({gl,pool,ph:R(0,TAU),sp:R(2.2,3.2)})}}
 // --- light shafts + cold pools (cosmetic volume; lamps from the floor data first, then a few ceiling shafts in open floor)
 if(q>0){const spots=[];if(s.lamps)for(const[cx,cy]of s.lamps)spots.push([ctx.cp(cx),ctx.cp(cy),46,60]);const want=q>1?5:3;
  for(let k=0,tries=0;k<want&&tries<60;tries++){const x=R(120,W-120),y=R(100,H-100);if(inner(x,y,50)||spots.some(p=>Math.hypot(p[0]-x,p[1]-y)<260))continue;spots.push([x,y,R(70,110),260]);k++}
  for(const[x,y,r,h]of spots){const sh=new T.Mesh(g.shaft,bm.shaft);sh.scale.set(r,h,r);sh.position.set(x,h/2,y);sh.renderOrder=2;const pool=new T.Mesh(g.disc,bm.pool);pool.scale.set(r*1.5,1,r*1.5);pool.position.set(x,.8,y);lvl.add(sh,pool);shafts.push(sh)}}
 // --- broken light panels on the back wall that flicker and spit sparks
 {const n=q>1?3:q>0?2:1;for(let i=0;i<n;i++){const x=R(120,W-120),y=R(38,70),z=2.5;const pn=new T.Mesh(g.plane,bm.panel.clone());pn.scale.set(26,6,1);pn.position.set(x,y,z);
  const gl=new T.Sprite(new T.SpriteMaterial({map:textures().soft,color:0x8fe0ff,transparent:true,opacity:.4,blending:T.AdditiveBlending,depthWrite:false,fog:false}));gl.scale.set(80,50,1);gl.position.set(x,y,z+3);lvl.add(pn,gl);
  flickers.push({pn,gl,t:R(0,3),on:1});emitters.push({x,y,z:z+3,t:R(.5,4)})}
  // sparks also come off random props along the side walls
  for(let i=0;i<(q>1?3:1);i++){const sd=Math.random()<.5;emitters.push({x:sd?8:W-8,y:R(30,60),z:R(120,H-120),t:R(1,6)})}}
 // --- Overmind biomass creeping over walls and floor (scales with depth)
 const k=depthK(s);if(k>0){const wl=[],fl=[],vl=[];const nW=Math.round(k*(q>1?7:q>0?5:3)),nF=Math.round(k*(q>1?70:q>0?48:22));
  for(const w of walls){for(let i=0;i<nW;i++){const side=(Math.random()*4)|0;let x,y;if(side<2){x=w.x+R(0,w.w);y=side?w.y+w.h:w.y}else{y=w.y+R(0,w.h);x=side===2?w.x:w.x+w.w}
    const sz=R(9,22)*(.6+k*.6);put(wl,x,R(0,14),y,sz*R(.9,1.6),sz*R(.35,.7),sz*R(.9,1.6),R(0,TAU));
    if(Math.random()<.55*k)put(vl,x,R(20,48),y,R(3,6),R(18,40),R(3,6),R(0,TAU),R(-.25,.25),R(-.25,.25))}}
  // the back wall: thick growth along the base and climbing tendrils
  const nB=Math.round(k*(q>1?26:16));for(let i=0;i<nB;i++){const x=R(0,W),sz=R(14,34)*(.6+k*.5);put(wl,x,R(0,26),R(-6,4),sz*R(1,1.8),sz*R(.5,1),sz*R(.5,.8),R(0,TAU));if(Math.random()<.6)put(vl,x+R(-20,20),R(30,70),R(-3,2),R(4,8),R(26,52),R(3,6),0,0,R(-.4,.4))}
  for(const sd of[0,1])for(let i=0;i<Math.round(k*10);i++){const z=R(0,H),sz=R(12,28)*(.6+k*.5);put(wl,sd?W+R(-4,6):R(-6,4),R(0,26),z,sz*R(.7,1.1),sz*R(.7,1.2),sz*R(1,1.8),R(0,TAU))}
  // floor creep: hugs walls, corners and the outer edge so the middle of the arena stays clean
  for(let i=0,tries=0;i<nF&&tries<nF*8;tries++){let x,y;const r=Math.random();if(r<.5&&walls.length){const w=walls[(Math.random()*walls.length)|0];x=R(w.x-50,w.x+w.w+50);y=R(w.y-50,w.y+w.h+50)}
    else if(r<.85){const e=(Math.random()*4)|0;x=e<2?R(0,W):e===2?R(0,90):R(W-90,W);y=e<2?(e?R(H-80,H):R(0,90)):R(0,H)}else{x=R(0,W);y=R(0,H)}
    if(Math.hypot(x-s.p.x,y-s.p.y)<120)continue;const sz=R(40,110)*(.55+k*.6);put(fl,x,.5+(i%12)*.03,y,sz,1,sz*R(.6,1),R(0,TAU));i++}
  inst(g.blob,bm.wall,wl,q>1);inst(g.blob,bm.wall,vl,false);inst(g.disc,bm.floor,fl,false);bm.wall.emissiveIntensity=1.2;pulseMats=[[bm.wall,.7+k*.9],[bm.floor,.35+k*.5]]}else pulseMats=[];
 if(ctx.level){const om=overmindMats();ctx.keep&&ctx.keep(om.flesh);ctx.level.traverse(o=>{const m=o.material;if(o.isMesh&&m&&m.isMeshStandardMaterial&&m!==om.flesh&&m.emissive&&m.emissive.getHex()===0xff2050&&m.color.getHex()===0x3a0814){m.dispose();o.material=om.flesh}})}
 setVis()}
function setVis(){const q=LV();if(dust){dust.visible=true;dust.geometry.setDrawRange(0,q>1?320:q>0?200:70)}if(fogG){fogG.visible=q>0;fogs.forEach((f,i)=>f.visible=i<(q>1?14:8))}}
// ---------------------------------------------------------------- per-frame
let fpsW={t:0,n:0,bad:0,cool:0},lastNow=0,toastEl=null;
function toast(msg){if(!toastEl){toastEl=document.createElement('div');toastEl.style.cssText='position:fixed;left:50%;bottom:12%;transform:translateX(-50%);z-index:6;font:13px monospace;letter-spacing:1px;color:#bff;background:rgba(2,14,18,.8);border:1px solid #2aa;padding:8px 14px;pointer-events:none;transition:opacity .6s';document.body.appendChild(toastEl)}
 toastEl.textContent=msg;toastEl.style.opacity='1';clearTimeout(toast.h);toast.h=setTimeout(()=>toastEl.style.opacity='0',4200)}
const autoOK=()=>!(navigator.webdriver||/HeadlessChrome/.test(navigator.userAgent)||window.__noAutoQ||new URLSearchParams(location.search).get('gfx'));
function watchdog(){const now=performance.now(),ft=now-(lastNow||now);lastNow=now;const s=S();if(!s||s.state!=='play'||document.hidden||ft>250||!autoOK())return;
 fpsW.t+=ft;fpsW.n++;if(fpsW.t<3000)return;const fps=fpsW.n*1000/fpsW.t;fpsW.t=0;fpsW.n=0;if(fpsW.cool>0){fpsW.cool--;return}
 const q=Q(),lim=q==='high'?40:q==='med'?30:0;if(fps<lim){if(++fpsW.bad>=2){fpsW.bad=0;fpsW.cool=2;const nq=q==='high'?'med':'low';C.setQuality(nq);toast(`GRAPHICS SET TO ${nq==='med'?'MEDIUM':'LOW'} FOR SMOOTHER PLAY · change it in Settings`)}}else fpsW.bad=0}
function update(dt){if(!C)return;watchdog();const s=S();if(!s)return;const t=s.t||0,q=LV();
 // dust motes: slow drift + sway, wrapped around the arena
 if(dust&&dust.visible){const P=dust.geometry.attributes.position.array,ph=dust.userData.ph,n=dust.geometry.drawRange.count;for(let i=0;i<n&&i*3<P.length;i++){P[i*3]+=(6+Math.sin(t*.4+ph[i])*7)*dt;P[i*3+1]+=Math.sin(t*.7+ph[i]*3)*4*dt;P[i*3+2]+=Math.cos(t*.3+ph[i])*5*dt;if(P[i*3]>C.W+80)P[i*3]=-80}dust.geometry.attributes.position.needsUpdate=true;dust.material.opacity=.4+.15*Math.sin(t*.9)}
 if(fogG&&fogG.visible)for(const f of fogs){const u=f.userData;f.position.x+=u.vx*dt;f.position.z+=u.vz*dt;if(f.position.x<-300)f.position.x=C.W+300;if(f.position.x>C.W+300)f.position.x=-300;if(f.position.z<-200)f.position.z=C.H+200;if(f.position.z>C.H+200)f.position.z=-200;f.material.opacity=u.op*(.75+.25*Math.sin(t*.35+u.ph))}
 for(const b of beacons){const v=Math.max(0,Math.sin(t*b.sp+b.ph));b.gl.material.opacity=.15+.65*v*v;b.pool.material.opacity=.05+.2*v*v}
 for(const f of flickers){f.t-=dt;if(f.t<=0){f.on=f.on?0:1;f.t=f.on?R(.8,3.5):R(.04,.18)}const v=f.on?(.85+Math.random()*.15):Math.random()<.3?.4:.05;f.pn.material.color.setRGB(.62*v,.9*v,v);f.gl.material.opacity=.4*v}
 for(const e of emitters){e.t-=dt;if(e.t<=0){e.t=R(1.6,5.5)/(q>1?1:.7);burst(e.x,e.y,e.z,q>1?18:q>0?12:7);const fl=flickers.find(f=>Math.abs(f.pn.position.x-e.x)<1);if(fl){fl.on=0;fl.t=R(.05,.15)}}}
 if(sparks){const P=sparks.geometry.attributes.position.array,Cc=sparks.geometry.attributes.color.array;for(let i=SP.length-1;i>=0;i--){const p=SP[i];p.life-=dt;if(p.life<=0){SP.splice(i,1);continue}p.vy-=520*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<1){p.y=1;p.vy*=-.35;p.vx*=.5;p.vz*=.5}}
  for(let i=0;i<SP.length;i++){const p=SP[i],k=Math.min(1,p.life/.5);P[i*3]=p.x;P[i*3+1]=p.y;P[i*3+2]=p.z;Cc[i*3]=1.6*k;Cc[i*3+1]=(.75+.3*k)*k;Cc[i*3+2]=.3*k*k}
  sparks.geometry.setDrawRange(0,SP.length);sparks.geometry.attributes.position.needsUpdate=true;sparks.geometry.attributes.color.needsUpdate=true}
 // biomass heartbeat (double-thump)
 if(pulseMats.length){const ph=(t*1.1)%1,beat=Math.exp(-((ph-.1)**2)/.004)+.6*Math.exp(-((ph-.28)**2)/.004);for(const[m,base]of pulseMats)m.emissiveIntensity=base*(.55+.6*beat)}
 if(OM){const ph=(t*.9)%1;OM.brain.emissiveIntensity=1.0+.6*(Math.exp(-((ph-.1)**2)/.006)+.6*Math.exp(-((ph-.3)**2)/.006))}}
// post: bloom tuned so emissives glow but bullets and the HUD stay crisp (HUD is a separate 2D canvas and never bloomed)
function quality(q,ctx){if(ctx.bloom){ctx.bloom.strength=q==='high'?.72:.6;ctx.bloom.radius=.62;ctx.bloom.threshold=.82}
 if(ctx.grade){const u=ctx.grade.uniforms;if(u.look)u.look.value=q==='high'?1:.85;if(u.grain)u.grain.value=q==='high'?.04:.03}setVis()}
function init(c){C=c;T=c.THREE;S=c.getS;textures();mkDust();mkSparks();mkFog();
 // phones/tablets start on Medium once (bloom + grade, cheaper shadows); the player can still pick High in Settings
 try{const mob=matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);if(mob&&!localStorage.getItem('tdp_look_mob')){localStorage.setItem('tdp_look_mob','1');if(Q()==='high'&&autoOK()){c.CFG.quality='med';c.saveCfg&&c.saveCfg()}}}catch(e){}}
window.TDP_LOOK={init,build,update,quality,carapace,legMat,abdomen,glowAbd,overmindMats,rim,depthK,toast,get stats(){return{sparks:SP.length,beacons:beacons.length,shafts:shafts.length,bio:pulseMats.length,level:lvl}}};
})();
