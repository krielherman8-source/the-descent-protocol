/* The Descent Protocol — visual upgrade layer (classic script, window.TDP_VIS).
   Everything here is procedural (canvas-generated textures, merged/instanced geometry, one ShaderPass) — no external assets.
   - textures(): floor & wall albedo + normal + roughness maps (metal plates, grates, hazard stripes, rivets, grime)
   - wallUV(): world-scaled UVs for box walls so panel textures keep their size on any wall
   - props(): instanced pipes / crates / barrels / consoles / cable runs along the outer boundary (3-4 draw calls per floor)
   - splat(): alpha texture for blood/acid/scorch decals
   - grade: post pass (colour grade, vignette, film grain, chromatic aberration on damage)
   Quality: 'low' keeps the old look/cost; 'med' adds textures+props+grade; 'high' also adds the shadowed flashlight. */
(function(){
let T;const R=(a,b)=>a+Math.random()*(b-a);
function cv(n){const c=document.createElement('canvas');c.width=c.height=n;return [c,c.getContext('2d')]}
// height canvas (greyscale) -> tangent-space normal map
function normalFrom(h,n,str){const src=h.getImageData(0,0,n,n).data;const [c,g]=cv(n);const out=g.createImageData(n,n),d=out.data;const H=(x,y)=>src[(((y+n)%n)*n+((x+n)%n))*4]/255;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=(H(x+1,y)-H(x-1,y))*str,dy=(H(x,y+1)-H(x,y-1))*str;const l=Math.hypot(dx,dy,1),i=(y*n+x)*4;d[i]=(-dx/l*.5+.5)*255;d[i+1]=(dy/l*.5+.5)*255;d[i+2]=(1/l*.5+.5)*255;d[i+3]=255}
 g.putImageData(out,0,0);return c}
function grime(g,n,k,col){for(let i=0;i<k;i++){const x=R(0,n),y=R(0,n),r=R(4,n*.18),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col.replace('A',R(.08,.3).toFixed(2)));gr.addColorStop(1,col.replace('A','0'));g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}}
function tex(c,rep,srgb){const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
// ---- floor: 2x2 tiles per 512px; tile kinds: riveted plate, grate, tread plate, hazard-bordered plate ----
function floorMaps(){const n=512,[ac,a]=cv(n),[hc,h]=cv(n),[rc,r]=cv(n);
 a.fillStyle='#0b1013';a.fillRect(0,0,n,n);h.fillStyle='#000';h.fillRect(0,0,n,n);r.fillStyle='#909090';r.fillRect(0,0,n,n);
 const kinds=['plate','grate','tread','hazard'];
 for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=i*256,y=j*256,k=kinds[i*2+j];
  const gr=a.createLinearGradient(x,y,x+256,y+256);gr.addColorStop(0,'#2c3840');gr.addColorStop(1,'#1a2328');a.fillStyle=gr;a.fillRect(x+4,y+4,248,248);
  h.fillStyle='#9a9a9a';h.fillRect(x+4,y+4,248,248);h.fillStyle='#b8b8b8';h.fillRect(x+8,y+8,240,240);r.fillStyle='#6a6a6a';r.fillRect(x+4,y+4,248,248);
  if(k==='grate'){a.fillStyle='#05080a';h.fillStyle='#202020';for(let s=30;s<226;s+=14){a.fillRect(x+26,y+s,204,8);h.fillRect(x+26,y+s,204,8)}a.fillStyle='#0d1418';a.fillRect(x+126,y+26,6,204);h.fillStyle='#b0b0b0';h.fillRect(x+126,y+26,6,204)}
  if(k==='tread'){for(let yy=18;yy<240;yy+=16)for(let xx=18;xx<240;xx+=16){const o=((yy/16)|0)%2;a.save();a.translate(x+xx+o*8,y+yy);a.rotate(o?.7:-.7);a.fillStyle='#34424b';a.fillRect(-5,-1.5,10,3);a.restore();h.save();h.translate(x+xx+o*8,y+yy);h.rotate(o?.7:-.7);h.fillStyle='#ffffff';h.fillRect(-5,-1.5,10,3);h.restore()}}
  if(k==='hazard'){a.save();a.beginPath();a.rect(x+10,y+10,236,26);a.clip();for(let s=-40;s<300;s+=28){a.fillStyle='rgba(170,125,20,.75)';a.beginPath();a.moveTo(x+s,y+10);a.lineTo(x+s+14,y+10);a.lineTo(x+s+40,y+36);a.lineTo(x+s+26,y+36);a.fill()}a.restore();
   r.fillStyle='#4a4a4a';r.fillRect(x+10,y+10,236,26);a.fillStyle='#10171b';a.fillRect(x+60,y+90,136,100);h.fillStyle='#606060';h.fillRect(x+60,y+90,136,100);a.fillStyle='rgba(60,180,190,.25)';for(let s=0;s<5;s++)a.fillRect(x+70,y+100+s*18,116,4)}
  if(k==='plate'){a.strokeStyle='#121a1f';a.lineWidth=2;a.strokeRect(x+40,y+40,176,176);h.strokeStyle='#5a5a5a';h.lineWidth=3;h.strokeRect(x+40,y+40,176,176)}
  for(const[px,py]of[[14,14],[242,14],[14,242],[242,242],[128,14],[128,242],[14,128],[242,128]]){a.fillStyle='#3d4a52';a.beginPath();a.arc(x+px,y+py,3.5,0,7);a.fill();h.fillStyle='#fff';h.beginPath();h.arc(x+px,y+py,3.5,0,7);h.fill()}}
 grime(a,n,70,'rgba(0,0,0,A)');grime(a,n,12,'rgba(60,45,20,A)');grime(r,n,60,'rgba(255,255,255,A)');
 for(let i=0;i<260;i++){const x=R(0,n),y=R(0,n),l=R(4,26),an=R(0,6.3);a.strokeStyle=`rgba(150,170,180,${R(.03,.09)})`;a.lineWidth=1;a.beginPath();a.moveTo(x,y);a.lineTo(x+Math.cos(an)*l,y+Math.sin(an)*l);a.stroke()}
 return {map:ac,normal:normalFrom(h,n,3.2),rough:rc}}
// ---- wall panels: 256px = 128 world units ----
function wallMaps(){const n=256,[ac,a]=cv(n),[hc,h]=cv(n),[rc,r]=cv(n);
 a.fillStyle='#262f35';a.fillRect(0,0,n,n);h.fillStyle='#808080';h.fillRect(0,0,n,n);r.fillStyle='#808080';r.fillRect(0,0,n,n);
 for(let i=0;i<2;i++){const x=i*128;a.fillStyle='#0a0e10';a.fillRect(x,0,3,n);h.fillStyle='#000';h.fillRect(x,0,3,n);
  a.fillStyle='#2f3a41';a.fillRect(x+10,20,108,90);h.fillStyle='#b0b0b0';h.fillRect(x+10,20,108,90);
  for(let s=0;s<6;s++){a.fillStyle='#0c1114';a.fillRect(x+22,140+s*12,84,5);h.fillStyle='#202020';h.fillRect(x+22,140+s*12,84,5)}
  for(const py of[8,120,248]){for(let px=10;px<128;px+=24){a.fillStyle='#46545d';a.beginPath();a.arc(x+px,py,2.5,0,7);a.fill();h.fillStyle='#fff';h.beginPath();h.arc(x+px,py,2.5,0,7);h.fill()}}}
 a.fillStyle='#0a0e10';a.fillRect(0,124,n,4);h.fillStyle='#000';h.fillRect(0,124,n,4);
 // hazard band near the floor (bottom of the texture = v 0)
 for(let s=-20;s<n;s+=20){a.fillStyle='#a07a10';a.beginPath();a.moveTo(s,n-18);a.lineTo(s+10,n-18);a.lineTo(s+22,n);a.lineTo(s+12,n);a.fill()}
 grime(a,n,40,'rgba(0,0,0,A)');grime(r,n,30,'rgba(255,255,255,A)');
 return {map:ac,normal:normalFrom(h,n,2.5),rough:rc}}
let FM,WM;
function textures(W,H){if(FM)return{FM,WM};const f=floorMaps(),w=wallMaps(),rep=[W/256,H/256];
 FM={map:tex(f.map,rep,true),normalMap:tex(f.normal,rep),roughnessMap:tex(f.rough,rep)};WM={map:tex(w.map,null,true),normalMap:tex(w.normal),roughnessMap:tex(w.rough)};return{FM,WM}}
// BoxGeometry faces: +x,-x (u=d,v=h), +y,-y (u=w,v=d), +z,-z (u=w,v=h); 4 verts each
function wallUV(geo,w,h,d,s){const uv=geo.attributes.uv;const sc=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;uv.setXY(i,uv.getX(i)*sc[f][0]/s,uv.getY(i)*sc[f][1]/s)}uv.needsUpdate=true;return geo}
// ---- decal splat alpha ----
let SPL;function splat(){if(SPL)return SPL;const n=128,[c,g]=cv(n);g.fillStyle='#000';g.fillRect(0,0,n,n);g.fillStyle='#fff';
 g.beginPath();for(let i=0;i<=24;i++){const an=i/24*6.283,r=n*.3*(.75+Math.random()*.35);g.lineTo(n/2+Math.cos(an)*r,n/2+Math.sin(an)*r)}g.fill();
 for(let i=0;i<14;i++){const an=R(0,6.28),d=R(n*.3,n*.47),r=R(2,7);g.beginPath();g.arc(n/2+Math.cos(an)*d,n/2+Math.sin(an)*d,r,0,7);g.fill();g.lineWidth=r*.8;g.strokeStyle='#fff';g.beginPath();g.moveTo(n/2+Math.cos(an)*n*.25,n/2+Math.sin(an)*n*.25);g.lineTo(n/2+Math.cos(an)*d,n/2+Math.sin(an)*d);g.stroke()}
 g.globalCompositeOperation='destination-out';grime(g,n,10,'rgba(0,0,0,A)');SPL=new T.CanvasTexture(c);return SPL}
// ---- props along the outer boundary (instanced; positions are cosmetic only, outside the play strip) ----
let PR=null;// shared (kept) prop geometry/materials, created once
function props(ctx){const {group,W,H,dark,emis,inner}=ctx;if(!PR)PR={box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(1,1,1,12),
  crate:new T.MeshStandardMaterial({color:0x8a8a70,metalness:.35,roughness:.6,map:crateTex()}),barrel:new T.MeshStandardMaterial({color:0x7a3414,metalness:.5,roughness:.45}),pipe:new T.MeshStandardMaterial({color:0x56646c,metalness:.75,roughness:.32})};
 const box=PR.box,cyl=PR.cyl,mats=PR;
 const lists={crate:[],barrel:[],pipe:[],cons:[],led:[]};const o=new T.Object3D();const put=(L,x,y,z,sx,sy,sz,ry,rx,rz)=>{o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);o.scale.set(sx,sy,sz);o.updateMatrix();L.push(o.matrix.clone())};
 // pipe runs on the inner face of the back (north) wall + side walls, with brackets
 for(const hh of[34,48,60])put(lists.pipe,W/2,hh,-4-(hh%3),hh===48?5:3.2,W+40,hh===48?5:3.2,0,0,Math.PI/2);
 for(const sd of[0,1])for(const hh of[40,58])put(lists.pipe,sd?W+4:-4,hh,H/2,3.5,H,3.5,0,Math.PI/2,0);
 for(let x=40;x<W;x+=160)put(lists.cons,x,47,-2,4,30,8,0);
 // consoles against the back wall with glowing screens; crate stacks & barrels in the corners/along walls
 for(let x=180;x<W-100;x+=R(260,420)){if(inner(x,20))continue;put(lists.cons,x,14,6,40,28,10,0);put(lists.led,x,22,11.5,30,10,1,0)}
 const corner=[[18,18],[W-18,18],[18,H-18],[W-18,H-18]];
 for(const[cx,cy]of corner){for(let k=0;k<3;k++){const s=R(16,22);put(lists.crate,cx+R(-6,6)+(k===1?(cx<W/2?22:-22):0),s/2+(k===2?22:0),cy+(k===2?0:R(-4,4)),s,s,s,R(-.3,.3))}
  for(let k=0;k<2;k++)put(lists.barrel,cx+(cx<W/2?1:-1)*(10+k*15),12,cy+(cy<H/2?1:-1)*36,7,24,7,0)}
 for(let y=200;y<H-150;y+=R(240,380))for(const sd of[0,1]){if(Math.random()<.5)continue;const x=sd?W-12:12;if(inner(x,y))continue;put(lists.barrel,x,12,y,7,24,7,0);if(Math.random()<.5)put(lists.crate,x,9,y+20,18,18,18,R(-.3,.3))}
 const mk=(geo,m,L,cs)=>{if(!L.length)return;const im=new T.InstancedMesh(geo,m,L.length);L.forEach((M,i)=>im.setMatrixAt(i,M));im.castShadow=!!cs;im.receiveShadow=true;group.add(im)};
 mk(box,mats.crate,lists.crate,1);mk(cyl,mats.barrel,lists.barrel,1);mk(cyl,mats.pipe,lists.pipe);mk(box,dark,lists.cons,1);mk(box,emis,lists.led);
 return [box,cyl,PR.crate,PR.barrel,PR.pipe]}
function crateTex(){const n=64,[c,g]=cv(n);g.fillStyle='#8a8a7a';g.fillRect(0,0,n,n);g.strokeStyle='#3a3a30';g.lineWidth=5;g.strokeRect(3,3,58,58);g.beginPath();g.moveTo(3,3);g.lineTo(61,61);g.stroke();g.fillStyle='#c09020';g.fillRect(8,26,48,6);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
// ---- post: grade + vignette + grain + chromatic aberration ----
const GradeShader={uniforms:{tDiffuse:{value:null},time:{value:0},dmg:{value:0},grain:{value:.035},vig:{value:.9}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`uniform sampler2D tDiffuse;uniform float time,dmg,grain,vig;varying vec2 vUv;
 float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}
 void main(){vec2 d=vUv-.5;float r2=dot(d,d);float ca=(.0012+dmg*.012)*r2*4.;
  vec3 c=vec3(texture2D(tDiffuse,vUv+d*ca).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-d*ca).b);
  float l=dot(c,vec3(.299,.587,.114));c=mix(c,c*vec3(.86,1.02,1.08),smoothstep(.5,0.,l)*.6);c=mix(c,c*vec3(1.08,1.,.9),smoothstep(.45,1.,l)*.5);
  c=(c-.5)*1.08+.5;c=mix(vec3(l),c,1.08);
  c*=1.-vig*smoothstep(.12,.62,r2*1.55);c=mix(c,c*vec3(1.4,.5,.5),dmg*smoothstep(.08,.5,r2*2.)*.8);
  c+=(h(vUv*vec2(1280.,720.))-.5)*grain;gl_FragColor=vec4(max(c,0.),1.);}`};
window.TDP_VIS={init(c){T=c.THREE},textures,wallUV,splat,props,GradeShader};
})();
