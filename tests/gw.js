// gravity-well floor (F3) repro: idle survival + escape from core at 60 and 144 fps
(async()=>{const L=[],ok=(n,c)=>L.push((c?'PASS ':'FAIL ')+n);const w=ms=>new Promise(r=>setTimeout(r,ms));
window.__pause=true;
try{while(!window.GAME_READY)await w(50);await w(300);
const run=(fps,sec,setup)=>{CFG.diff='normal';newRun();S.floor=2;S.state='play';startFloor();S.tut=null;if(setup)setup();const dt=1/fps;let t=0,dead=-1,minD=1e9;const d0=dist(S.p,S.well);
 for(;t<sec;t+=dt){TDP_INPUT.poll(dt);update(dt);const d=dist(S.p,S.well);minD=Math.min(minD,d);if(S.p.hp<=0&&dead<0){dead=t;break}}return{d0:Math.round(d0),hp:Math.round(S.p.hp),dead:+dead.toFixed(2),minD:Math.round(minD),end:Math.round(dist(S.p,S.well))}};
for(const fps of [60,144]){
 IN.mx=IN.my=0;const a=run(fps,12);L.push(`INFO fps=${fps} idle12s ${JSON.stringify(a)}`);ok(`idle at spawn never pulled into well @${fps}`,a.minD>=400);
 const b=run(fps,6,()=>{S.p.x=S.well.x;S.p.y=S.well.y+1;S.enemies.length=0;S.floorT=10;IN.mx=0;IN.my=1});IN.my=0;L.push(`INFO fps=${fps} escape ${JSON.stringify(b)}`);ok(`walk out of core @${fps}`,b.dead<0&&b.end>200);
 const c=run(fps,4,()=>{S.p.x=S.well.x;S.p.y=S.well.y+1;S.enemies.length=0;S.floorT=10;IN.mx=IN.my=0});L.push(`INFO fps=${fps} idleInCore4s ${JSON.stringify(c)}`);ok(`4s idle in core survivable @${fps}`,c.dead<0&&c.hp>=50);ok(`spawn outside pull radius @${fps}`,a.d0>=300);}
}catch(e){L.push('FAIL exc '+e.message)}
L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
