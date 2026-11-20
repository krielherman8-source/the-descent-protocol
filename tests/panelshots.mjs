// node --experimental-websocket tests/panelshots.mjs  -> shots/panel/*.png + layout metrics (needs the http server on :8765 and tests/lay.html built from an empty script via mk.py)
import {spawn} from 'child_process';import fs from 'fs';
const OUT='/workspace/descent/shots/panel/';fs.mkdirSync(OUT,{recursive:true});
const c=spawn('google-chrome',['--headless=new','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=9337','--user-data-dir=/tmp/pw/panel','about:blank'],{stdio:'ignore'});
const sl=ms=>new Promise(r=>setTimeout(r,ms));let t;for(let i=0;i<50;i++){await sl(300);try{t=await (await fetch('http://127.0.0.1:9337/json')).json();if(t.length)break}catch{}}
const ws=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);let id=0;const pend={};
ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}};
await new Promise(r=>ws.onopen=r);const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)console.log('EXC',JSON.stringify(r.result.exceptionDetails).slice(0,300));return r.result?.result?.value};
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(OUT+n+'.png',Buffer.from(r.result.data,'base64'))};
const V=[['desktop_1280x720',1280,720,false],['phone_844x390',844,390,true],['phone_667x375',667,375,true],['phone_portrait_390x844',390,844,true]];
let bad=0;const chk=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)bad++};
for(const [n,w,h,m] of V){
 await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:m});await send('Emulation.setTouchEmulationEnabled',{enabled:m});
 await send('Page.navigate',{url:'http://localhost:8765/lay.html?fresh='+Date.now()+(m?'&touch=1':'')});
 for(let i=0;i<120;i++){await sl(500);if(await ev('!!window.GAME_READY'))break}await sl(800);
 await ev(`localStorage.clear();document.getElementById('menu')?.classList.add('hide');CFG.tut=false;newRun();S.floor=17;S.state='play';startFloor();S.p.inv=1e9;S.p.weapons=['kinetic','pulse_shotgun','grenade_launcher','tesla'];S.p.weapon='pulse_shotgun';S.p.wxp={kinetic:130,pulse_shotgun:75};S.p.wgrade={kinetic:0,pulse_shotgun:6,grenade_launcher:11,tesla:16};S.p.mods={kinetic:['emp','cryo'],pulse_shotgun:['explosive']};S.p.drones=['aegis','torchlet','bastion'];S.p.drone='aegis';1`);
 await sl(2200);await shot(`${n}_1_hud_with_briefing`);
 const R=`(()=>{const r=e=>{const b=document.getElementById(e)?.getBoundingClientRect();return b?{x:b.x,y:b.y,w:b.width,h:b.height}:null};return {w:innerWidth,h:innerHeight,cw:r('gc-w'),cd:r('gc-d'),tbe:r('tb-e'),tbw:r('tb-w'),tbd:r('tb-d'),tbp:r('tb-p'),hudBottom:S.hudBottom,hudRight:S.hudRight,errs:ERRS}})()`;
 const a=await ev(R);console.log(n,JSON.stringify(a));
 const need=m||w<900?40:28;chk(a.cw.h>=need&&a.cd.h>=need,`${n}: chip height >= ${need}px (${a.cw.h}/${a.cd.h})`);
 chk(a.cw.x+a.cw.w<=w&&a.cd.x+a.cd.w<=w&&a.cd.y+a.cd.h<=h,`${n}: chips inside the viewport`);
 const ov=(p,q)=>p&&q&&p.x<q.x+q.w&&q.x<p.x+p.w&&p.y<q.y+q.h&&q.y<p.y+p.h;
 for(const k of['tbe','tbw','tbd','tbp'])if(a[k])for(const ch of['cw','cd'])chk(!ov(a[ch],a[k]),`${n}: ${ch} does not overlap ${k}`);
 // briefing card top edge must be below the chips
 chk(a.hudBottom>=a.cw.y&&a.hudBottom>=a.cd.y+a.cd.h-1,`${n}: briefing card starts below the chips (hudBottom ${Math.round(a.hudBottom)})`);
 await ev(`S.brief.life=0;1`);await sl(300);await shot(`${n}_2_hud_compact`);
 await ev(`document.getElementById('gc-w').click();1`);await sl(500);await shot(`${n}_3_panel_open`);
 const g=await ev(`(()=>{const b=document.querySelector('#gear .gbox').getBoundingClientRect(),x=document.querySelector('#gear .gx').getBoundingClientRect(),rows=[...document.querySelectorAll('#gear .grow')].map(e=>{const q=e.getBoundingClientRect();return {h:q.height,w:q.width}});return {box:{x:b.x,y:b.y,w:b.width,h:b.height},x:{w:x.width,h:x.height},minRow:Math.min(...rows.map(r=>r.h)),rows:rows.length,state:S.state,sh:document.querySelector('#gear .gbox').scrollHeight,ch:document.querySelector('#gear .gbox').clientHeight}})()`);
 console.log(n,'panel',JSON.stringify(g));
 chk(g.state==='gear'&&g.x.w>=40&&g.x.h>=40,`${n}: X button >= 40px (${g.x.w}x${g.x.h})`);chk(g.minRow>=40,`${n}: rows >= 40px (${g.minRow})`);
 chk(g.box.x>=0&&g.box.y>=0&&g.box.x+g.box.w<=w+1&&g.box.y+g.box.h<=h+1,`${n}: panel fits the screen${g.sh>g.ch?' (scrolls inside)':''}`);
 await ev(`document.querySelector('#gear .gx').click();1`);
 // upgrade chamber with pictures (weapon, drone, mod) + supply-drop popup
 await ev(`S.supplyPop={c:{name:'Weapon: Tesla Arc Cannon Mk 18',desc:'Chains lightning between enemies · +42% damage',wk:'tesla'},life:5};1`);await sl(400);await shot(n+'_4_supply_drop_popup');await ev(`S.supplyPop=null;1`);
 await ev(`S.state='upgrade';S.choices=[{name:'Weapon: Needle Railgun Mk 18',desc:'Hitscan needle pierces every enemy in a line · +42% damage',gear:true,wk:'railgun',tier:3,apply(){}},{name:'Drone: Needler',desc:'Fires piercing 3-needle bursts at the toughest enemy nearby',gear:true,dk:'needler',apply(){}},{name:'Mod: Cryo Chamber',desc:'Hits chill enemies (50% slow, 2s) → Pulse Shotgun',gear:true,mod:true,mk:'cryo',apply(){}}];1`);await sl(500);await shot(n+'_5_upgrade_chamber');
 await ev(`S.choices=[{name:'Refit: Kinetic Rifle Mk 18',desc:'Rebuild your Kinetic Rifle: +42% damage (floor 18 grade)',gear:true,refit:true,wk:'kinetic',apply(){}},{name:'+20% Fire Rate',desc:'All weapons',apply(){}},{name:'Endless: Nanite Weave II',desc:'+20 max HP and repair 40 HP (stacks)',endless:true,apply(){}}];1`);await sl(500);await shot(n+'_6_upgrade_chamber_stats');
 await ev(`S.state='play';S.choices=null;1`);

 chk((await ev('S.state'))==='play',`${n}: closes back to play`);
}
console.log(bad?`${bad} FAILED`:'ALL OK');c.kill();process.exit(bad?1:0)
