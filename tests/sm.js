(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));try{while(!window.GAME_READY)await w(50);window.__pause=true;newRun();S.god=true;
for(let f=15;f<30;f++){S.floor=f;S.state="play";startFloor();const t0=performance.now();let maxProg=0;
 for(let i=0;i<1500;i++){const it=S.items[0];if(it&&(it.kind==='escort'||it.kind==='defend')){S.p.x=it.x+20;S.p.y=it.y+20;if(i%30==0)S.enemies.forEach(e=>{if(dist(e,it)<100)e.hp=0})}
  if(S.f.objective==='cells'){const c=S.carry?S.socket:S.items.find(i=>i.kind==='cell'&&!i.done);if(c){S.p.x=c.x;S.p.y=c.y}}
  update(1/60);if(i%25==0)render(1/60);if(S.state!=='play')break;maxProg=Math.max(maxProg,it?it.prog||0:0)}
 const bosses=S.enemies.filter(e=>ENEMIES[e.type].boss).map(e=>e.type+':'+Math.round(e.hp));
 L.push(`F${f+1} ${S.f.objective} st=${S.state} done=${S.obj.done(S)} prog=${S.obj.progress(S)} hz=${[...new Set(S.hazards.map(h=>h.type))]} n=${S.enemies.length} boss=${bosses} ${Math.round(performance.now()-t0)}ms`)}
}catch(err){L.push('EXC '+err.message+' '+err.stack)}
L.push('ERRS '+JSON.stringify(ERRS));document.body.dataset.log=L.join('\n')})();
