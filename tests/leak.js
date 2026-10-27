// Long-session leak harness (run via tests/leak.mjs, which also injects tests/leakprobe.js and tests/bot.js).
// hash: #sc=full|cycle&diff=normal&cap=300&deaths=3&cycles=6
//  full : one 30-floor run driven by the audit bot; samples after every floor.
//  cycle: repeated short sessions exercising death -> Restart (R), death -> title (Esc) -> Continue,
//         pause -> Save & Quit -> Start (intro crawl skipped) ; samples after each step.
// Output: body[data-log] = one line per sample (JSON) + ERRS line.
window.BOT_MANUAL=true;
window.addEventListener('load',()=>setTimeout(()=>leakMain().catch(e=>{document.body.dataset.log='CRASH '+e.stack}),600));
async function leakMain(){
const H=Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map(a=>a.split('=')));
const SC=H.sc||'full',out=[],dt=1/60;const D=window.__TDP_DBG,R=window.renderer;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
if(H.diff)setDifficulty(H.diff);audioInit();
await sleep(300);
for(let i=0;i<40&&!window.BOT_API;i++)await sleep(100);
const {playFloor}=window.BOT_API;
async function gcAll(){if(!window.gc)return;for(let i=0;i<3;i++){gc();await sleep(60)}}
async function sample(tag){window.__pause=true;await sleep(+(H.settle||400));/* let rAF loop render and audio drain */window.render(1/60);await gcAll();
 const sc=D.scene;let objs=0,lights=0,litOn=0,meshes=0;const sg=new Set();sc.traverse(o=>{objs++;if(o.geometry)sg.add(o.geometry);if(o.isMesh||o.isInstancedMesh)meshes++;if(o.isLight){lights++}});
 sc.traverseVisible(o=>{if(o.isLight&&o.intensity>0)litOn++});
 R.info.autoReset=false;R.info.reset();R.render(sc,window.camera);const calls=R.info.render.calls;R.info.autoReset=true;
 let pool=0;for(const k in D.POOL)pool+=D.POOL[k].length;const maps={};for(const k in D.maps)maps[k]=D.maps[k].size;
 const pr=LEAKPROBE.snap(),pm=performance.memory;
 const r={tag,floor:S.floor+1,state:S.state,geo:R.info.memory.geometries,tex:R.info.memory.textures,progs:R.info.programs?R.info.programs.length:0,calls,
  sceneChildren:sc.children.length,sceneObjs:objs,meshes,lights,lightsOn:litOn,poolKeys:Object.keys(D.POOL).length,sceneGeos:sg.size,poolBy:Object.fromEntries(Object.entries(D.POOL).map(([k,v])=>[k,v.length])),topKids:Object.entries(sc.children.reduce((a,c)=>{const k=(c.type)+(c.visible?'':'~');a[k]=(a[k]||0)+1;return a},{})).join(' '),pooled:pool,maps,caches:D.caches?D.caches():null,
  enemies:S.enemies.length,bullets:S.bullets.length+S.ebullets.length,parts:S.parts.length,decals:D.decals(),gibs:D.gibs.length,arcs:D.arcMeshes.length,
  heapMB:pm?+(pm.usedJSHeapSize/1048576).toFixed(2):null,...pr};
 out.push(JSON.stringify(r));document.body.dataset.progress=out.length;
 const sk=tag+'@'+r.floor;if(H.snap&&H.snap.split(',').includes(sk)){document.body.dataset.snap=sk;while(document.body.dataset.snap)await sleep(200)}// leak.mjs writes /tmp/leak/<sk>.heapsnapshot
 return r}
const key=k=>{dispatchEvent(new KeyboardEvent('keydown',{key:k}));dispatchEvent(new KeyboardEvent('keyup',{key:k}))};
const click=sel=>{const b=document.querySelector(sel);b.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));b.dispatchEvent(new MouseEvent('click',{bubbles:true}))};
async function skipCrawl(){for(let i=0;i<30&&S.state==='intro';i++){await sleep(500);key(' ')}}
function die(){S.god=false;S.p.hp=0;for(let i=0;i<120&&S.state!=='dead';i++)update(dt);return S.state}
async function play(n,tag){for(let i=0;i<n&&S.state!=='victory'&&S.state!=='ending';i++){playFloor(S.floor,0);await sample(tag)}}
await sample('boot-title');
if(SC==='full'){newRun();window.__pause=true;S.god=false;await sample('F1-start');
 for(let f=0;f<30;f++){playFloor(f,0);await sample('after-floor');if(S.state==='victory'||S.state==='ending')break}
 await sleep(1000);goTitle();await sample('title-after-run')}
else{const C=+(H.cycles||6);
 for(let c=0;c<C;c++){
  newRun();window.__pause=true;await play(2,'c'+c+'-run');
  die();key('r');window.__pause=true;await sample('c'+c+'-restartR');           // dead -> R (startGame)
  await play(2,'c'+c+'-afterR');
  die();key('Escape');await sample('c'+c+'-deadToTitle');                      // dead -> Esc -> title
  click('#b-cont');window.__pause=true;await sample('c'+c+'-continue');          // title -> CONTINUE (checkpoint)
  await play(1,'c'+c+'-afterCont');
  S.state='play';key('Escape');click('#m-pause [data-a="quit"]');await sample('c'+c+'-quitTitle'); // pause -> save & quit
  click('#m-title [data-a="start"]');await skipCrawl();window.__pause=true;await sample('c'+c+'-startIntro')}}
out.push('ERRS '+JSON.stringify(ERRS.concat(LEAKPROBE.errors).slice(0,8)));document.body.dataset.log=out.join('\n')}
