// weapon tiers by floor + struggle supply drops
(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));const ok=(c,n)=>L.push((c?'PASS ':'FAIL ')+n);try{
while(!window.GAME_READY)await w(50);window.__pause=true;
const scale0=JSON.stringify((()=>{newRun();S.floor=19;return scaleF()})());
// --- tier distribution of the chamber weapon slot at floors 1/10/20/30 for a starting loadout (kinetic only)
const N=3000,dist={};for(const fl of[1,10,20,30]){newRun();S.floor=fl-1;const c={1:0,2:0,3:0,none:0},ks={};
 for(let i=0;i<N;i++){const p=__TDP_DBG.wm.newPlayer();const o=rollWeapon(p,fl);if(!o){c.none++;continue}c[WTIER[o.k]]++;ks[o.k]=(ks[o.k]||0)+1}
 dist[fl]={t1:c[1]/N,t2:c[2]/N,t3:c[3]/N};L.push(`F${fl} tier1=${(c[1]/N*100).toFixed(1)}% tier2=${(c[2]/N*100).toFixed(1)}% tier3=${(c[3]/N*100).toFixed(1)}% `+JSON.stringify(ks))}
const near=(a,b)=>Math.abs(a-b)<.04;
ok(near(dist[1].t1,.7)&&near(dist[1].t2,.3)&&dist[1].t3===0,'F1: 70% basic / 30% mid / no top-tier');
ok(near(dist[10].t1,.3)&&near(dist[10].t2,.5)&&near(dist[10].t3,.2),'F10: 30/50/20');
ok(dist[20].t1===0&&near(dist[20].t2,.45)&&near(dist[20].t3,.55),'F20: no basic weapons, 45/55');
ok(dist[30].t1===0&&near(dist[30].t2,.15)&&near(dist[30].t3,.85),'F30: no basic weapons, 15/85');
// --- owned weapons are kept; when nothing of an allowed tier is left the slot becomes a refit of the lowest-grade gun
newRun();const p=S.p;p.weapons=['kinetic','pulse_shotgun','flamethrower','grenade_launcher','bio_harvester','tesla','railgun'];p.weapon='kinetic';p.wgrade={railgun:5};
S.floor=24;let o=rollWeapon(p,25);ok(o&&o.refit&&o.k==='kinetic','all owned -> refit offered for lowest-grade weapon ('+(o&&o.k)+')');
const c=weaponCard(p,25);c.apply(p);ok(p.weapons.length===7&&wGrade(p,'kinetic')===24&&Math.abs(wDmgMul(p,'kinetic')-1.6)<1e-9,'refit keeps all 7 weapons and sets Mk 25 (+60% dmg)');
p.wgrade={};newRun();S.floor=24;S.p.weapons=['kinetic','pulse_shotgun'];const r=rollWeapon(S.p,25);ok(r&&!r.refit&&WTIER[r.k]>=2,'F25 with basic guns only -> new mid/top weapon, never a weak one');
// grade scales damage of a late find; mastery untouched
newRun();S.floor=19;const q=S.p;giveWeapon(q,'tesla',20);ok(Math.abs(wDmgMul(q,'tesla')-1.475)<1e-9&&q.weapon==='tesla'&&q.weapons.includes('kinetic'),'tesla found on F20 = +47.5% dmg, kinetic kept');
q.weapon='kinetic';S.bullets.length=0;WEAPONS.kinetic.fire(q,0);const b0=S.bullets[S.bullets.length-1].dmg;q.wgrade.kinetic=19;WEAPONS.kinetic.fire(q,0);const b1=S.bullets[S.bullets.length-1].dmg;
ok(Math.abs(b1/b0-1.475)<1e-6,'bullet damage follows the weapon grade');
ok(__TDP_DBG.wm.wMasteryMul(q,'kinetic')===1&&JSON.stringify(q.wxp)==='{}','weapon mastery (wxp) untouched');
ok(JSON.stringify((()=>{S.floor=19;return scaleF()})())===scale0,'difficulty scaling unchanged');
// chamber still offers a weapon card per floor band
newRun();S.floor=24;let bad=0;for(let i=0;i<200;i++){S.p.weapons=['kinetic'];const ch=rollChoices();const wc=ch.find(x=>x.wk);if(wc&&WTIER[wc.wk]<2&&!wc.refit)bad++}ok(bad===0,'F25 chambers never offer a basic weapon ('+bad+')');
// --- supply drops
newRun();S.floor=4;S.state='play';startFloor();S.p.inv=1e9;S.god=true;const step=(n,dt=1/30)=>{for(let i=0;i<n;i++){S.p.inv=1e9;supplyTick(dt);S.floorT+=dt}};
const kill=()=>{const e=spawnEnemy('runner',S.p.x+200,S.p.y);supplyKill(e);return e};
step(30*30);kill();ok(!S.sup.list.length,'no drop at 30 s while healthy');
step(31*30);ok(S.sup.armed,'armed after 60 s on the floor');kill();ok(S.sup.list.length===1&&S.sup.n===1,'next kill drops a supply crate');
kill();ok(S.sup.list.length===1,'only one crate at a time');
const ups0=S.p.ups.length,st0=JSON.stringify([S.p.dmgMul,S.p.rateMul,S.p.speed,S.p.maxHp,S.p.droneRateMul,S.p.multishot,S.p.weapons,S.p.mods]);
S.p.x=S.sup.list[0].x;S.p.y=S.sup.list[0].y;S.p.hp=S.p.maxHp-40;step(1);const st1=JSON.stringify([S.p.dmgMul,S.p.rateMul,S.p.speed,S.p.maxHp,S.p.droneRateMul,S.p.multishot,S.p.weapons,S.p.mods]);
ok(!S.sup.list.length&&(st1!==st0||S.p.hp===S.p.maxHp),'pickup applies an upgrade');ok(S.sup.cd>59,'60 s cooldown after pickup');
step(30*30);kill();ok(S.sup.list.length===0,'no drop during cooldown');step(31*30);kill();ok(S.sup.n===2,'second drop after cooldown');
S.sup.list[0].life=.01;step(2);step(21*30);kill();ok(S.sup.n===3,'expired crate -> short 20 s cooldown, third drop');
S.sup.list.length=0;S.sup.cd=0;step(70*30);kill();ok(S.sup.n===3&&!S.sup.list.length,'max 3 per floor');
S.floor=5;startFloor();step(10);supplyTick(0);ok(S.sup.n===0&&!S.sup.armed,'resets on a new floor');
S.p.hp=S.p.maxHp*.3;step(36*30);ok(S.sup.armed,'low HP (<35%) arms it from 35 s');
S.p.hp=S.p.maxHp;newRun();S.floor=4;S.state='play';startFloor();S.items.forEach(it=>it.done=true);step(65*30);ok(!S.sup.armed,'no drop once the objective is done');
// supply content is floor-scaled: a weapon from a supply crate on F28 is never basic
newRun();S.floor=27;let wb=0,wn=0;for(let i=0;i<600;i++){S.p.weapons=['kinetic'];const c=rollSupply(S.p,28);if(c.wk&&!c.refit){wn++;if(WTIER[c.wk]<2)wb++}}ok(wn>50&&wb===0,`F28 supply weapons all mid/top tier (${wn} weapon drops)`);
// render path draws the crate
newRun();S.floor=4;S.state='play';startFloor();S.sup=null;supplyTick(0);S.sup.armed=true;kill();render(1/60);ok(__TDP_DBG.scene.children.some(o=>o.isGroup&&o.visible&&o.position.distanceTo(new THREE.Vector3(S.sup.list[0].x,o.position.y,S.sup.list[0].y))<1),'crate mesh rendered with beam');
}catch(e){L.push('FAIL exception '+e.message+' '+e.stack)}L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
