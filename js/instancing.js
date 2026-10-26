/* The Descent Protocol — GPU instancing for regular enemies (classic script, window.TDP_INST).
   Each regular enemy type's template (built by makeBug) is flattened into parts:
   - static parts are baked into ONE merged geometry per material (shell, glow, eyes, armour…)
   - animated parts (3 legs, abdomen) keep their own geometry
   and each part becomes a single THREE.InstancedMesh.  Effect overlays (hit flash, frost shell,
   stun ring) are shared InstancedMeshes across all types.  Bosses/elites keep their Group models.
   Draw calls therefore scale with (#types x #materials), not with #enemies. */
(function(){
let T,ctx,root;const kinds={};let fx=null;const CAP0=64;
const _m=new Object(),tmp={};
function init(c){ctx=c;T=c.THREE;root=new T.Group();root.name='instanced-enemies';c.scene.add(root);
 tmp.m=new T.Matrix4();tmp.r=new T.Matrix4();tmp.p=new T.Vector3();tmp.q=new T.Quaternion();tmp.s=new T.Vector3();tmp.e=new T.Euler();tmp.l=new T.Matrix4();
 const add=c.add;fx={hf:mk(c.geoFx,add(0xffffff,.32),512),fr:mk(c.geoFx,add(0x88ddff,.35),512),st:mk(c.geoTorus,add(0xffff66,.9),512)};}
function mk(geo,mat,cap,cs){const m=new T.InstancedMesh(geo,mat,cap);m.count=0;m.frustumCulled=false;m.castShadow=!!cs;m.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(m);return m}
function grow(part){const old=part.mesh,cap=old.instanceMatrix.count*2,n=mk(old.geometry,old.material,cap,old.castShadow);root.remove(old);old.dispose();part.mesh=n}
// merge indexed/non-indexed geometries after applying matrices; keeps position/normal/uv
function merge(list){let nv=0,ni=0;const hasUv=list.every(o=>o.g.attributes.uv);for(const o of list){nv+=o.g.attributes.position.count;ni+=o.g.index?o.g.index.count:o.g.attributes.position.count}
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=hasUv?new Float32Array(nv*2):null,idx=new Uint32Array(ni);let vo=0,io=0;const v=new T.Vector3(),nm=new T.Matrix3();
 for(const o of list){const g=o.g,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;nm.getNormalMatrix(o.m);
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.m);pos.set([v.x,v.y,v.z],(vo+i)*3);if(N){v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor.set([v.x,v.y,v.z],(vo+i)*3)}if(uv)uv.set([U.getX(i),U.getY(i)],(vo+i)*2)}
  if(g.index)for(let i=0;i<g.index.count;i++)idx[io++]=g.index.getX(i)+vo;else for(let i=0;i<P.count;i++)idx[io++]=i+vo;vo+=P.count}
 const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));if(uv)out.setAttribute('uv',new T.BufferAttribute(uv,2));out.setIndex(new T.BufferAttribute(idx,1));out.computeBoundingSphere();return out}
function build(type){const g=ctx.makeBug(type);g.scale.setScalar(1);g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
 const legs=g.userData.legs||[],abd=g.userData.abd;const k={type,legs:[],abd:null,statics:[],n:0};const groups=new Map();
 g.traverse(o=>{if(!o.isMesh)return;if(legs.includes(o)){k.legs.push({pos:o.position.clone(),rot:o.rotation.clone(),scl:o.scale.clone(),ry:o.rotation.y});if(!k.legPart)k.legPart={mesh:mk(o.geometry,o.material,CAP0*3,o.castShadow),cs:o.castShadow};return}
  if(o===abd){k.abd={pos:o.position.clone(),rot:o.rotation.clone(),scl:o.scale.clone()};k.abdPart={mesh:mk(o.geometry,o.material,CAP0,o.castShadow),cs:o.castShadow};return}
  const key=o.material.uuid+(o.castShadow?'s':'');if(!groups.has(key))groups.set(key,{mat:o.material,cs:o.castShadow,list:[]});groups.get(key).list.push({g:o.geometry,m:o.matrixWorld.clone()})});
 for(const gr of groups.values())k.statics.push({mesh:mk(merge(gr.list),gr.mat,CAP0,gr.cs),cs:gr.cs});
 k.parts=[...k.statics,k.legPart,k.abdPart].filter(Boolean);kinds[type]=k;return k}
function handles(type){const E=ctx.ENEMIES[type];return E&&!E.boss}
function set(part,i,m){if(i>=part.mesh.instanceMatrix.count)grow(part);part.mesh.setMatrixAt(i,m)}
// per-frame: write every instance matrix, then set counts
function update(list,t,p){for(const k in kinds){kinds[k].n=0}let nf=0,nr=0,ns=0;const lod=list.length>60;const M=tmp.m,L=tmp.l;
 for(const e of list){const E=ctx.ENEMIES[e.type];if(E.boss)continue;const k=kinds[e.type]||build(e.type);
  const u=e._iu||(e._iu={});const vx=e.x-(u.px??e.x),vy=e.y-(u.py??e.y);if(vx*vx+vy*vy>.01)u.h=Math.atan2(vy,vx);u.px=e.x;u.py=e.y;
  if(E.cloak&&!(ctx.dist(e,p)<170||Math.random()<.25))continue;
  const sc=1.4*(e.flash>0?1.15:1);tmp.q.setFromAxisAngle(Y,-(u.h||0));tmp.p.set(e.x,0,e.y);tmp.s.setScalar(sc);M.compose(tmp.p,tmp.q,tmp.s);
  const i=k.n++;for(const s of k.statics)set(s,i,M);
  const tt=t*18+(e.x+e.y)*.05;
  k.legs.forEach((l,j)=>{tmp.e.set(l.rot.x,l.ry+Math.sin(tt+j*2)*.3,l.rot.z);tmp.q.setFromEuler(tmp.e);L.compose(l.pos,tmp.q,l.scl);L.premultiply(M);set(k.legPart,i*3+j,L)});
  if(k.abd){const a=k.abd;tmp.q.setFromEuler(a.rot);if(e.type==='exploder')tmp.s.set(1.35+Math.sin(t*12)*.15,.8,1.05);else tmp.s.copy(a.scl);L.compose(a.pos,tmp.q,tmp.s);L.premultiply(M);set(k.abdPart,i,L)}
  const r=E.r;
  if(e.flash>0){L.makeScale(r*1.05,r*1.05,r*1.05);L.setPosition(0,r*.7,0);L.premultiply(M);fxSet('hf',nf++,L)}
  if(e.slowT>0){L.makeScale(r*1.15,r*1.15,r*1.15);L.setPosition(0,r*.7,0);L.premultiply(M);fxSet('fr',nr++,L)}
  if(e.stun>0){tmp.e.set(Math.PI/2,0,t*10);tmp.q.setFromEuler(tmp.e);tmp.s.setScalar(r*.9);tmp.p.set(0,r*1.7,0);L.compose(tmp.p,tmp.q,tmp.s);L.premultiply(M);fxSet('st',ns++,L)}}
 for(const k in kinds){const K=kinds[k];for(const pt of K.parts){pt.mesh.count=pt===K.legPart?K.n*3:K.n;pt.mesh.instanceMatrix.needsUpdate=true;pt.mesh.castShadow=pt.cs&&!lod}}
 fx.hf.count=nf;fx.fr.count=nr;fx.st.count=ns;for(const f in fx)fx[f].instanceMatrix.needsUpdate=true}
const fxObj={};function fxSet(n,i,m){if(i>=fx[n].instanceMatrix.count){const o=fx[n];fx[n]=mk(o.geometry,o.material,o.instanceMatrix.count*2);root.remove(o)}fx[n].setMatrixAt(i,m)}
let Y;function prewarm(types){Y=Y||new T.Vector3(0,1,0);for(const t of types)if(handles(t)&&!kinds[t])build(t)}
function stats(){let n=0;for(const k in kinds)n+=kinds[k].parts.length;return{types:Object.keys(kinds).length,meshes:n+3}}
// Constant light budget: three.js recompiles every lit material when the number of visible point lights changes
// (boss spawns with a glow light, exit beacon turning on, zone lights...).  Pad with zero-intensity dummies so the
// count never changes mid-floor -> no shader-compile hitches.  Budget grows (once) if a floor ever needs more.
let dummies=[],budget=6,lastVis=0;
function countLights(o){if(!o.visible)return 0;let n=o.isPointLight&&!o.userData.dummy?1:0;const c=o.children;for(let i=0;i<c.length;i++)n+=countLights(c[i]);return n}
function lightBudget(scene){const n=countLights(scene);if(n>budget)budget=n;while(dummies.length<budget){const L=new T.PointLight(0,0,1,2);L.userData.dummy=true;L.position.set(-9999,-9999,-9999);scene.add(L);dummies.push(L)}
 const need=budget-n;for(let i=0;i<dummies.length;i++)dummies[i].visible=i<need;lastVis=n;return n}
window.TDP_INST={lightBudget,get lights(){return{real:lastVis,budget}},init(c){init(c);Y=new T.Vector3(0,1,0)},handles,update,prewarm,stats,get root(){return root}};
})();
