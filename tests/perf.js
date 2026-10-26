(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));try{while(!window.GAME_READY)await w(50);if(location.hash.includes("noinst"))window.__noInst=true;window.__pause=true;
newRun();S.floor=14;startFloor();const ts=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss);
for(const N of [0,50,150]){await w(10);document.body.dataset.log=L.join("\n")+"\n..."+N;S.enemies.length=0;for(let i=0;i<N;i++){spawnNear(ts[i%ts.length],rnd(100,1180),rnd(80,640),1,1)}
 S.state="play";S.p.inv=1e9;for(let i=0;i<20;i++){update(1/60);render(1/60)}
 renderer.info.autoReset=false;renderer.info.reset();render(1/60);const CL=renderer.info.render.calls,TR=renderer.info.render.triangles;renderer.info.autoReset=true;let tu=0,tr=0;const F=60;for(let i=0;i<F;i++){S.p.inv=1e9;let a=performance.now();update(1/60);let b=performance.now();render(1/60);let c=performance.now();tu+=b-a;tr+=c-b}
 L.push(`N=${S.enemies.length} update=${(tu/F).toFixed(2)}ms render=${(tr/F).toFixed(2)}ms calls=${CL} tris=${TR}`)}
if(!location.hash.includes('nohitch')){S.enemies.length=0;S.floor=19;startFloor();S.state='play';const ft=[];let gc=0;const mem0=performance.memory?performance.memory.usedJSHeapSize:0;
 for(let i=0;i<420;i++){S.p.inv=1e9;if(i===60)['leaper','carrier','stalker','mite','prime','warden'].forEach((t,j)=>spawnNear(t,300+j*120,200,1,1));const a=performance.now();update(1/60);render(1/60);ft.push(performance.now()-a)}
 const so=[...ft].sort((a,b)=>a-b),avg=ft.reduce((a,b)=>a+b,0)/ft.length;const top=ft.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]).slice(0,5).map(x=>x[1]+':'+x[0].toFixed(0)).join(' ');
 L.push(`HITCH F20 frames=${ft.length} avg=${avg.toFixed(1)}ms p99=${so[Math.floor(so.length*.99)].toFixed(1)} max=${so[so.length-1].toFixed(1)} over3xAvg=${ft.filter(v=>v>avg*3).length} worst=[${top}] heapMB=${(mem0/1e6).toFixed(0)}->${performance.memory?(performance.memory.usedJSHeapSize/1e6).toFixed(0):'?'}`)}
}catch(e){L.push('EXC '+e.message)}L.push('ERRS '+JSON.stringify(ERRS));document.body.dataset.log=L.join('\n')})();
