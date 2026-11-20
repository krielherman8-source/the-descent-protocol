// node --experimental-websocket tests/hiveshots.mjs [floors=1,10,20,30] [w h] -> shots/hive/fNN_before.png (?nohive=1) / fNN_after.png (needs :8765 server + tests/lay.html)
import {spawn} from 'child_process';import fs from 'fs';
const OUT=process.env.OUT||'/workspace/descent/shots/hive/';fs.mkdirSync(OUT,{recursive:true});
const FL=(process.argv[2]||'1,10,20,30').split(',').map(Number),VW=+(process.argv[3]||1280),VH=+(process.argv[4]||720),MODES=(process.env.MODES||'before,after').split(','),Q=process.env.Q||'high',mob=process.env.MOB==='1';
const c=spawn('google-chrome',['--headless=new','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=9339','--user-data-dir=/tmp/pw/hive','about:blank'],{stdio:'ignore'});
const sl=ms=>new Promise(r=>setTimeout(r,ms));let t;for(let i=0;i<50;i++){await sl(300);try{t=await (await fetch('http://127.0.0.1:9339/json')).json();if(t.length)break}catch{}}
const ws=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);let id=0;const pend={};ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}};
await new Promise(r=>ws.onopen=r);const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)console.log('EXC',JSON.stringify(r.result.exceptionDetails).slice(0,400));return r.result?.result?.value};
await send('Emulation.setDeviceMetricsOverride',{width:VW,height:VH,deviceScaleFactor:1,mobile:mob});if(mob)await send('Emulation.setTouchEmulationEnabled',{enabled:true});
for(const mode of MODES){
 await send('Page.navigate',{url:`http://localhost:8765/lay.html?fresh=${Date.now()}&gfx=${Q}${mode==='before'?'&nohive=1':''}`});
 for(let i=0;i<120;i++){await sl(500);if(await ev('!!window.GAME_READY'))break}await sl(800);
 for(const f of FL){
  await ev(`document.getElementById('menu')?.classList.add('hide');CFG.tut=false;newRun();S.floor=${f-1};S.state='play';startFloor();S.p.inv=1e9;S.brief&&(S.brief.life=0);1`);await sl(3500);
  if(process.env.NORTH){await ev(`const b=S.enemies.find(e=>ENEMIES[e.type].boss);if(b){S.p.x=b.x;S.p.y=b.y+160;S.p.inv=1e9}1`);await sl(2500)}
  const info=await ev(`JSON.stringify({calls:renderer.info.render.calls,tris:renderer.info.render.triangles,errs:ERRS})`);
  const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${OUT}f${String(f).padStart(2,'0')}_${mode}${process.env.NORTH?'_boss':''}.png`,Buffer.from(r.result.data,'base64'));console.log(mode,'F'+f,info)}}
c.kill();process.exit(0)
