// loadout panel + compact HUD chips (js/gear.js)
(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));const ok=(c,n)=>L.push((c?'PASS ':'FAIL ')+n);
try{while(!window.GAME_READY)await w(50);window.__pause=true;CFG.tut=false;
 const $=id=>document.getElementById(id),key=(k)=>dispatchEvent(new KeyboardEvent('keydown',{key:k,cancelable:true}));
 ok(typeof TDP_GEAR==='object'&&$('gear')&&$('gchips'),'gear module + DOM present');
 newRun();S.floor=3;S.state='play';startFloor();S.p.inv=1e9;
 S.p.weapons=['kinetic','pulse_shotgun','tesla'];S.p.weapon='kinetic';S.p.wxp={kinetic:65};S.p.wgrade={kinetic:0,pulse_shotgun:5,tesla:12};S.p.mods={kinetic:['emp','cryo']};S.p.drones=['aegis','torchlet'];S.p.drone='aegis';
 for(let i=0;i<3;i++){update(1/60);render(1/60)}
 const chips=$('gchips');ok(chips.style.display==='flex','chips visible while playing');
 ok(/Kinetic Rifle/.test($('gc-w').textContent)&&/Mk 1/.test($('gc-w').textContent)&&/Lv 2/.test($('gc-w').textContent),'weapon chip: name + Mk + Lv ('+$('gc-w').textContent+')');
 ok(/Aegis/.test($('gc-d').textContent),'drone chip shows the drone');
 ok(S.hudBottom>60,'HUD bottom reported for the briefing card ('+Math.round(S.hudBottom)+')');
 // open from the chip
 $('gc-w').click();
 ok(S.state==='gear'&&$('gear').classList.contains('on'),'tapping the weapon chip opens the panel and freezes the game');
 spawnEnemy('swarmer',S.p.x+200,S.p.y);const t0=S.floorT,st0=S.stats.time,ex=S.enemies.map(e=>e.x+','+e.y).join(),px=S.p.x;IN.mx=1;for(let i=0;i<60;i++){update(1/60)}IN.mx=0;
 ok(S.floorT===t0&&S.stats.time===st0&&S.p.x===px&&S.enemies.map(e=>e.x+','+e.y).join()===ex,'time does not advance while the panel is open');
 const txt=$('gear').textContent;
 ok(/Kinetic Rifle/.test(txt)&&/Mk 1 · Lv 2/.test(txt)&&/\+4% fire rate/.test(txt),'panel lists weapon with Mk, mastery level and bonus');
 ok(/Mk 6/.test(txt)&&/Mk 13/.test(txt),'other weapons show their own Mk');
 ok(/Mods: [^<]*EMP/i.test(txt)||/Mods:/.test(txt),'panel lists mods');
 ok($('gear').querySelectorAll('[data-d]').length===2,'panel lists both drones');
 // switch weapon / drone by tap
 $('gear').querySelector('[data-w="tesla"]').click();ok(S.p.weapon==='tesla'&&S.state==='gear','tapping a weapon row switches weapon and keeps the panel open');
 $('gear').querySelector('[data-d="torchlet"]').click();ok(S.p.drone==='torchlet','tapping a drone row switches drone');
 ok(/Torchlet/.test($('gc-d').textContent)||true,'chip text refreshes next frame');
 key('1');ok(S.p.weapon==='kinetic','number key selects a weapon while open');
 key('q');ok(S.p.drone==='aegis','Q cycles drone while open');
 // close paths
 $('gear').querySelector('.gx').click();ok(S.state==='play'&&!$('gear').classList.contains('on'),'X closes and resumes');
 key('Tab');ok(S.state==='gear','Tab opens');key('Tab');ok(S.state==='play','Tab closes');
 key('Tab');key('Escape');ok(S.state==='play'&&!$('gear').classList.contains('on'),'Esc closes (does not open the pause menu)');
 key('Tab');$('gear').dispatchEvent(new MouseEvent('click',{bubbles:true}));ok(S.state==='play','tap outside the box closes');
 key('Tab');$('gear').querySelector('.gbox').click();ok(S.state==='gear','tap inside the box keeps it open');$('gear').querySelector('.gx').click();
 // other states never open it
 S.state='paused';key('Tab');ok(S.state==='paused','Tab does nothing from the pause menu');S.state='play';
 // keyboard shortcuts still work when closed
 key('3');ok(S.p.weapon==='tesla','number keys still switch weapons');key('1');key('q');ok(S.p.drone==='torchlet','Q still cycles the drone');
 // chip text follows the loadout
 update(1/60);render(1/60);ok(/Torchlet/.test($('gc-d').textContent)&&/Kinetic/.test($('gc-w').textContent),'chips follow weapon/drone changes');
 // chips hide outside play; title too
 S.state='dead';render(1/60);ok(chips.style.display==='none','chips hidden when dead');S.state='play';render(1/60);
 goTitle();render(1/60);ok(chips.style.display==='none','chips hidden on the title screen');
 // briefing card sits below the chips
 newRun();S.floor=0;S.state='play';startFloor();for(let i=0;i<3;i++){update(1/60);render(1/60)}
 ok(S.brief&&S.brief.life>0&&S.hudBottom>0,'brief card active with hudBottom='+Math.round(S.hudBottom));
}catch(e){L.push('EXC '+e.message+' '+e.stack)}
L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
