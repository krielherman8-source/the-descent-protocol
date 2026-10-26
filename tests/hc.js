// shader-compile hitch probe: logs frames where new GPU programs appear + light counts. #f=19&warm=0
(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));try{while(!window.GAME_READY)await w(50);window.__pause=true;
const H=Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map(a=>a.split('=')));
if(H.nobudget)TDP_INST.lightBudget=()=>0;
const lc=[];for(const fl of (H.f||'19').split(',').map(Number)){newRun();S.floor=fl;startFloor();S.state='play';let pr=renderer.info.programs.length;const ev=[];
for(let i=0;i<480;i++){S.p.inv=1e9;if(i===60)['leaper','carrier','stalker','mite','prime','warden','exploder','spitter'].forEach((t,j)=>spawnNear(t,300+j*100,200,1,1));if(i===300){S.items.forEach(it=>it.done=true);S.enemies.forEach(e=>e.hp=0)}update(1/60);render(1/60);
 const n=renderer.info.programs.length;if(n!==pr){ev.push(i+':+'+(n-pr)+'(L'+TDP_INST.lights.real+'/'+TDP_INST.lights.budget+')');pr=n}}
L.push(`F${fl+1} programs=${pr} compiles after frame0: ${ev.filter(e=>!e.startsWith('0:')).join(' ')||'none'} | frame0: ${ev.filter(e=>e.startsWith('0:')).join(' ')} lights=${JSON.stringify(TDP_INST.lights)} exit=${!!S.exit}`)}
}catch(e){L.push('EXC '+e.message+e.stack)}L.push('ERRS '+JSON.stringify(ERRS));document.body.dataset.log=L.join('\n')})();
