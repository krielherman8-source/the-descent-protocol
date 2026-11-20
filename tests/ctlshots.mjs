// node --experimental-websocket tests/ctlshots.mjs -> shots/controls/*.png + metrics (needs :8765 server + tests/lay.html from an empty script)
import {spawn} from 'child_process';import fs from 'fs';
const OUT='/workspace/descent/shots/controls/';fs.mkdirSync(OUT,{recursive:true});
const c=spawn('google-chrome',['--headless=new','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=9341','--user-data-dir=/tmp/pw/ctl','about:blank'],{stdio:'ignore'});
const sl=ms=>new Promise(r=>setTimeout(r,ms));let t;for(let i=0;i<50;i++){await sl(300);try{t=await (await fetch('http://127.0.0.1:9341/json')).json();if(t.length)break}catch{}}
const ws=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);let id=0;const pend={};ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}};
await new Promise(r=>ws.onopen=r);const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)console.log('EXC',JSON.stringify(r.result.exceptionDetails).slice(0,300));return r.result?.result?.value};
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(OUT+n+'.png',Buffer.from(r.result.data,'base64'))};
let bad=0;const chk=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)bad++};
for(const [n,w,h] of [['1024x500',1024,500],['844x390',844,390]]){
 await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});
 await send('Page.navigate',{url:'http://localhost:8765/lay.html?fresh='+Date.now()+'&touch=1'});
 for(let i=0;i<120;i++){await sl(500);if(await ev('!!window.GAME_READY'))break}await sl(800);
 for(const [fl,tag] of [[1,'lab_f1'],[18,'infested_f18']]){
  await ev(`localStorage.clear();document.getElementById('menu')?.classList.add('hide');CFG.tut=false;newRun();S.floor=${fl-1};S.state='play';startFloor();S.p.inv=1e9;S.p.weapons=['kinetic','pulse_shotgun','tesla'];S.p.weapon='pulse_shotgun';S.p.wgrade={pulse_shotgun:3};S.p.drones=['aegis','torchlet'];S.p.drone='aegis';1`);
  await sl(2200);await shot(`${n}_${tag}_1_briefing`);
  const R=`(()=>{const r=e=>{const b=document.getElementById(e)?.getBoundingClientRect();return b?{x:b.x,y:b.y,w:b.width,h:b.height}:null};return {cw:r('gc-w'),cd:r('gc-d'),tbp:r('tb-p'),tbe:!!document.getElementById('tb-e'),tbw:!!document.getElementById('tb-w'),tbd:!!document.getElementById('tb-d'),hudBottom:S.hudBottom,hudRight:S.hudRight,errs:window.ERRS}})()`;
  const a=await ev(R);console.log(n,tag,JSON.stringify(a));
  if(fl===1){chk(!a.tbe&&!a.tbw&&!a.tbd,`${n}: no USE/WPN/DRN buttons`);chk(a.cw.w>=40&&a.cw.h>=40&&a.cd.w>=40&&a.cd.h>=40,`${n}: icons >= 40px`);
   chk(a.cw.x+a.cw.w<w/2&&a.cd.x+a.cd.w<w/2,`${n}: icons stay in the left half (clear of right stick/aim area)`);chk(a.hudRight<w*.4,`${n}: HUD panel is <40% of the width (${Math.round(a.hudRight)}px)`);chk(a.hudBottom<h*.4,`${n}: HUD + icons are <40% of the height (${Math.round(a.hudBottom)}px)`);}
  await ev(`S.brief&&(S.brief.life=0);1`);await sl(500);await shot(`${n}_${tag}_2_play`);
  if(fl===1){await ev(`document.getElementById('gc-w').click();1`);await sl(500);await shot(`${n}_3_panel_open`);await ev(`TDP_GEAR.toggle();1`);await sl(300)}}
}
console.log('BAD',bad);c.kill();process.exit(0)
