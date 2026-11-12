// Look-pass shots: node tests/lookshots.mjs PREFIX URL [outdir] [quality]
// -> <outdir>/<prefix>_f01.png, _f15.png, _f30_boss.png (floor 1, mid floor 15 with a swarm, final Overmind floor)
import {spawn} from 'child_process';import fs from 'fs';
const P=process.argv[2]||'after',U=process.argv[3]||'http://localhost:8771/index.html',OUT=process.argv[4]||'/workspace/descent/shots/look/',Q=process.argv[5]||'';fs.mkdirSync(OUT,{recursive:true});
const port=9340+Math.floor(Math.random()*50);
const c=spawn('google-chrome',['--headless=new','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port='+port,'--user-data-dir=/tmp/pw/look'+port,'about:blank'],{stdio:'ignore'});
const sl=ms=>new Promise(r=>setTimeout(r,ms));let t;for(let i=0;i<50;i++){await sl(300);try{t=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(t.length)break}catch{}}
const pg=t.find(x=>x.type==='page');const ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const pend={};const errs=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}if(m.method==='Runtime.exceptionThrown')errs.push(JSON.stringify(m.params.exceptionDetails).slice(0,300));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errs.push(JSON.stringify(m.params.args).slice(0,300))};
await new Promise(r=>ws.onopen=r);const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});await send('Runtime.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true});if(r.result?.exceptionDetails)console.log('EXC',x.slice(0,60),JSON.stringify(r.result.exceptionDetails).slice(0,300));return r.result?.result?.value};
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(OUT+P+'_'+n+'.png',Buffer.from(r.result.data,'base64'));console.log('shot',OUT+P+'_'+n+'.png')};
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
const nav=async u=>{await send('Page.navigate',{url:u});for(let i=0;i<120;i++){await sl(500);if(await ev('!!window.GAME_READY'))break}await sl(1500)};
await nav(U);await ev('localStorage.clear();1');await nav(U);
const start=async fl=>{await ev(`document.getElementById('menu')?.classList.add('hide');${Q?`CFG.quality='${Q}';applyQuality();`:''}newRun();S.floor=${fl};S.state='play';startFloor();S.p.inv=1e9;1`)};
const clr=()=>ev(`S.banner=null;document.querySelectorAll('.brief,#brief').forEach(e=>e.remove());1`);
const swarm=n=>ev(`{S.p.x=640;S.p.y=430;const ts=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss);for(let i=0;i<${n};i++){const a=Math.random()*6.28,r=150+Math.random()*240;spawnEnemy(ts[i%ts.length],640+Math.cos(a)*r,430+Math.sin(a)*r*.7)}}1`);
await start(0);await sl(5000);await clr();await swarm(8);await ev('CFG.auto=true;1');await sl(1500);await clr();await shot('f01');
await start(14);await sl(4000);await clr();await swarm(40);await sl(1800);await clr();await shot('f15');
await start(29);for(let i=0;i<60;i++){await sl(500);if(await ev('S.enemies.some(e=>ENEMIES[e.type].boss)'))break}await sl(3000);await clr();await swarm(14);await sl(1500);await clr();await shot('f30_boss');
if(process.env.CLOSE){await start(13);await sl(4000);await ev(`{S.enemies.length=0;S.p.x=640;S.p.y=420;const ts=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss);ts.forEach((t,i)=>{const a=i/ts.length*6.28;spawnEnemy(t,640+Math.cos(a)*120,420+Math.sin(a)*90)});__TDP_DBG.camOff.multiplyScalar(.5)}1`);await sl(2500);await ev('window.__pause=true;1');await clr();await sl(500);await shot('close');await ev('__TDP_DBG.camOff.multiplyScalar(2);window.__pause=false;1')}
if(process.env.SUPPLY){await start(4);await sl(3000);await clr();await ev(`{S.floorT=61;supplyTick(0);const e=spawnEnemy('runner',S.p.x+120,S.p.y-40);supplyKill(e);swarmN=0}1`.replace('swarmN=0',''));await swarm(10);await sl(900);await clr();await shot('supply')}
console.log('ERRS',errs.length,errs.slice(0,5).join('\n'));c.kill();process.exit(0);
