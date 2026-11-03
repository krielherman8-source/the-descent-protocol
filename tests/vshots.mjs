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
const U='http://localhost:8765/index.html';
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
const nav=async u=>{await send('Page.navigate',{url:u});for(let i=0;i<120;i++){await sl(500);if(await ev('!!window.GAME_READY'))break}await sl(1500)};
await nav(U);await ev('localStorage.clear();1');await nav(U);
const start=async(fl)=>{await ev(`document.getElementById('menu')?.classList.add('hide');${Q?`CFG.quality='${Q}';applyQuality();`:''}newRun();S.floor=${fl};S.state='play';startFloor();S.p.inv=1e9;1`)};
const boss=async()=>{for(let i=0;i<80;i++){await sl(500);if(await ev('S.enemies.some(e=>ENEMIES[e.type].boss)'))break}await sl(3000)};
await start(5);await sl(5000);await shot('room');
await start(13);await sl(16000);await shot('swarm');
await start(9);await boss();await shot('boss_warden');
await start(19);await boss();await shot('boss_colossus');
await start(1);await sl(6000);await shot('dark');
await start(20);await sl(9000);await ev(`S.state='upgrade';S.choices=rollChoices();1`);await sl(1500);await shot('upgrade');
console.log('ERRS',errs.length,errs.slice(0,5).join('\n'));c.kill();process.exit(0);
