// Visual before/after shots: node --experimental-websocket tests/vshots.mjs PREFIX [outdir] [quality]
// e.g. PREFIX=before|after -> screens_visual/<prefix>_<scene>.png ; quality (low|med|high) forces CFG.quality
import {spawn} from 'child_process';import fs from 'fs';
const P=process.argv[2]||'after',OUT=process.argv[3]||'/workspace/descent/screens_visual/',Q=process.argv[4]||'';fs.mkdirSync(OUT,{recursive:true});
const c=spawn('google-chrome',['--headless=new','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=9335','--user-data-dir=/tmp/pw/vprof','about:blank'],{stdio:'ignore'});
const sl=ms=>new Promise(r=>setTimeout(r,ms));let t;for(let i=0;i<50;i++){await sl(300);try{t=await (await fetch('http://127.0.0.1:9335/json')).json();if(t.length)break}catch{}}
const pg=t.find(x=>x.type==='page');const ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const pend={};const errs=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}if(m.method==='Runtime.exceptionThrown')errs.push(JSON.stringify(m.params.exceptionDetails).slice(0,300));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errs.push(JSON.stringify(m.params.args).slice(0,300))};
await new Promise(r=>ws.onopen=r);const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true});if(r.result?.exceptionDetails)console.log('EXC',x.slice(0,60),JSON.stringify(r.result.exceptionDetails).slice(0,300));return r.result?.result?.value};
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(OUT+P+'_'+n+'.png',Buffer.from(r.result.data,'base64'));console.log('shot',n)};
const U=process.env.URL||'http://localhost:8765/index.html',ONLY=process.env.ONLY,on=n=>!ONLY||ONLY.split(',').includes(n);
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
const nav=async u=>{await send('Page.navigate',{url:u});for(let i=0;i<120;i++){await sl(500);if(await ev('!!window.GAME_READY'))break}await sl(1500)};
await nav(U);await ev('localStorage.clear();1');await nav(U);
const start=async(fl)=>{await ev(`document.getElementById('menu')?.classList.add('hide');${Q?`CFG.quality='${Q}';applyQuality();`:''}newRun();S.floor=${fl};S.state='play';startFloor();S.p.inv=1e9;1`)};
const boss=async()=>{for(let i=0;i<80;i++){await sl(500);if(await ev('S.enemies.some(e=>ENEMIES[e.type].boss)'))break}await sl(3000)};
if(on('room')){await start(5);await sl(5000);await shot('room')}
if(on('swarm')){await start(13);await sl(3000);await ev(`S.banner=null;S.p.x=640;S.p.y=420;const ts=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss);for(let i=0;i<70;i++){const a=Math.random()*6.28,r=170+Math.random()*260;spawnEnemy(ts[i%ts.length],640+Math.cos(a)*r,420+Math.sin(a)*r*.7)}CFG.auto=true;1`);await sl(2200);await ev('S.banner=null;1');await shot('swarm');await ev('CFG.auto=false;1')}
if(on('deathfx')){await start(13);await sl(3000);await ev(`S.banner=null;S.p.x=640;S.p.y=420;const ts=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss);for(let i=0;i<40;i++){const a=Math.random()*6.28,r=150+Math.random()*200;spawnEnemy(ts[i%ts.length],640+Math.cos(a)*r,420+Math.sin(a)*r*.7)}1`);await sl(1200);await ev(`S.enemies.forEach(e=>{if(!ENEMIES[e.type].boss)e.hp=0});explodeAt(760,420,120,0,'#ff9040');explodeAt(520,380,100,0,'#ff9040');1`);await sl(180);await ev('window.__pause=true;1');await sl(300);await shot('deathfx');await ev('window.__pause=false;1')}
if(on('boss_warden')){await start(9);await boss();await shot('boss_warden')}
if(on('boss_colossus')){await start(19);await boss();await shot('boss_colossus')}
if(on('dark')){await start(1);await sl(6000);await shot('dark')}
if(on('darksector')){await start('FLOORS.findIndex(f=>f.dark)');await sl(9000);await shot('darksector')}
if(on('upgrade')){await start(20);await sl(9000);await ev(`S.state='upgrade';S.choices=rollChoices();1`);await sl(1500);await shot('upgrade')}
if(on('close')){await start(13);await sl(4000);await ev(`S.enemies.length=0;S.p.x=640;S.p.y=420;const ts=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss);ts.forEach((t,i)=>{const a=i/ts.length*6.28;spawnEnemy(t,640+Math.cos(a)*120,420+Math.sin(a)*90)});__TDP_DBG.camOff.multiplyScalar(.5);1`);await sl(2500);await ev('window.__pause=true;1');await sl(500);await shot('close');await ev('__TDP_DBG.camOff.multiplyScalar(2);window.__pause=false;1')}
console.log('ERRS',errs.length,errs.slice(0,5).join('\n'));c.kill();process.exit(0);
