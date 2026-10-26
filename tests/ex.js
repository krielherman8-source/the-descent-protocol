(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));try{while(!window.GAME_READY)await w(50);window.__pause=true;newRun();
for(let f=0;f<30;f++){S.floor=f;S.state="play";startFloor();S.p.x=40;S.p.y=40;S.enemies.length=0;S.items.forEach(i=>{i.done=true});S.spawnT=1e9;for(let i=0;i<5;i++)update(1/60);
 const e=S.exit;if(!e){L.push(`F${f+1} no exit`);continue}const gx=Math.floor(e.x/32),gy=Math.floor(e.y/32);
 const hz=S.hazards.filter(h=>h.type==='laser'?false:dist(h,e)<h.r+40).map(h=>h.type);const las=S.hazards.filter(h=>h.type==='laser'&&dist(h,e)<(h.el??h.len)+20).length;
 L.push(`F${f+1} ${S.f.objective} exit=${e.x|0},${e.y|0} grid=${S.grid[gx+gy*40]} hz=${hz} lasersNear=${las} inWall=${inWall(e.x,e.y,14)}`)}}catch(err){L.push('EXC '+err.message)}
L.push('ERRS '+JSON.stringify(ERRS));document.body.dataset.log=L.join('\n')})();
