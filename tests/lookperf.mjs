// Look-pass cost check: node tests/lookperf.mjs URL [quality] -> avg render ms, draw calls, triangles on floors 1/15/30 with a swarm
// (headless swiftshader = CPU rendering, so absolute ms are far slower than a real GPU; compare before vs after only)
import {spawn} from 'child_process';
const U=process.argv[2],Q=process.argv[3]||'high',port=9400+Math.floor(Math.random()*50);
const c=spawn('google-chrome',['--headless=new','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port='+port,'--user-data-dir=/tmp/pw/perf'+port,'about:blank'],{stdio:'ignore'});
const sl=ms=>new Promise(r=>setTimeout(r,ms));let t;for(let i=0;i<50;i++){await sl(300);try{t=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(t.length)break}catch{}}
const ws=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);let id=0;const pend={};ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}};
await new Promise(r=>ws.onopen=r);const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true});if(r.result?.exceptionDetails)console.log('EXC',JSON.stringify(r.result.exceptionDetails).slice(0,300));return r.result?.result?.value};
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:U+'?gfx='+Q});for(let i=0;i<120;i++){await sl(500);if(await ev('!!window.GAME_READY'))break}await sl(1500);
for(const fl of[0,14,29]){const r=await ev(`(async()=>{window.__pause=true;document.getElementById('menu')?.classList.add('hide');newRun();S.floor=${fl};S.state='play';startFloor();S.p.inv=1e9;
 const ts=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss);for(let i=0;i<60;i++){const a=Math.random()*6.28,r=150+Math.random()*260;spawnEnemy(ts[i%ts.length],S.p.x+Math.cos(a)*r,S.p.y+Math.sin(a)*r*.7)}
 for(let i=0;i<20;i++){update(1/60);render(1/60)}renderer.info.autoReset=false;renderer.info.reset();render(1/60);const CL=renderer.info.render.calls,TR=renderer.info.render.triangles;renderer.info.autoReset=true;
 const gl=renderer.getContext();let tot=0;const F=40;for(let i=0;i<F;i++){S.p.inv=1e9;update(1/60);const a=performance.now();render(1/60);gl.finish();tot+=performance.now()-a}
 return 'floor '+(${fl}+1)+' render='+(tot/F).toFixed(1)+'ms calls='+CL+' tris='+TR+' lights='+JSON.stringify(TDP_INST.lights)})()`);console.log(Q,r)}
c.kill();process.exit(0);
