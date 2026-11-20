// touch controls: no USE/WPN/DRN buttons, icon chips (tap = panel, hold = swap), auto-use forced on touch, auto-use finishes every objective item on all 30 floors
(async()=>{const L=[],ok=(c,n)=>L.push((c?'PASS ':'FAIL ')+n);const w=ms=>new Promise(r=>setTimeout(r,ms));
try{while(!window.GAME_READY)await w(50);await w(300);window.__pause=true;CFG.tut=false;
const t=new Touch({identifier:1,target:document.body,clientX:10,clientY:10});document.body.dispatchEvent(new TouchEvent('touchstart',{touches:[t],changedTouches:[t],bubbles:true}));
CFG.interact='hold';newRun();S.state='play';startFloor();S.tut=null;S.p.inv=1e9;
S.p.weapons=['kinetic','pulse_shotgun'];S.p.weapon='kinetic';S.p.drones=['aegis','torchlet'];S.p.drone='aegis';
for(let i=0;i<3;i++){update(1/60);render(1/60)}
ok(document.body.classList.contains('touch')&&document.getElementById('touchui'),'touch UI built');
ok(!document.getElementById('tb-e')&&!document.getElementById('tb-w')&&!document.getElementById('tb-d'),'no USE / WPN / DRN buttons');
ok(!!document.getElementById('tb-p'),'pause button kept');
TDP_INPUT.poll(0);ok(CFG.interact==='auto','touch forces auto-use (was hold)');
const cw=document.getElementById('gc-w'),cd=document.getElementById('gc-d');
ok(document.getElementById('gchips').classList.contains('ic')&&cw.querySelector('img')&&cd.querySelector('img'),'chips are thumbnail icons');
const r=cw.getBoundingClientRect(),r2=cd.getBoundingClientRect();ok(r.width>=40&&r.height>=40&&r2.width>=40&&r2.height>=40,'icon targets >=40px ('+Math.round(r.width)+'x'+Math.round(r.height)+')');
ok(!/Kinetic/.test(cw.textContent),'no text on icon chips');
// long-press quick swap
const tt=el=>new Touch({identifier:7,target:el,clientX:5,clientY:5});
cw.dispatchEvent(new TouchEvent('touchstart',{changedTouches:[tt(cw)],bubbles:true}));await w(600);cw.dispatchEvent(new TouchEvent('touchend',{changedTouches:[tt(cw)],bubbles:true}));cw.click();
ok(S.p.weapon==='pulse_shotgun'&&S.state==='play','long-press weapon icon swaps weapon, no panel');
cd.dispatchEvent(new TouchEvent('touchstart',{changedTouches:[tt(cd)],bubbles:true}));await w(600);cd.dispatchEvent(new TouchEvent('touchend',{changedTouches:[tt(cd)],bubbles:true}));cd.click();
ok(S.p.drone==='torchlet','long-press drone icon swaps drone');
cw.dispatchEvent(new TouchEvent('touchstart',{changedTouches:[tt(cw)],bubbles:true}));await w(80);cw.dispatchEvent(new TouchEvent('touchend',{changedTouches:[tt(cw)],bubbles:true}));cw.click();
ok(S.state==='gear'&&TDP_GEAR.isOpen(),'tap opens loadout panel');TDP_GEAR.toggle();
// auto-use on all 30 floors
const bad=[],kinds={};
for(let f=0;f<30;f++){newRun();S.god=true;S.floor=f;S.state='play';startFloor();S.tut=null;S.p.inv=1e9;S.items.filter(i=>i.kind==='shoot').forEach(i=>i.done=true);S.cards=3;
 for(let pass=0;pass<40;pass++){const left=S.items.filter(i=>!i.done&&!['shoot','escort','defend'].includes(i.kind));if(!left.length)break;
  let prog=false;for(const it of left){kinds[it.kind]=1;if(it.kind==='hold'&&!it.active){for(let q=0;q<5;q++){S.enemies.length=0;update(1/40)}continue}const n0=it.prog||0;
   for(let k=0;k<(it.kind==='hold'||it.kind==='zone'?Math.ceil((it.time||3)*40)+30:6)&&!it.done;k++){S.p.x=it.x;S.p.y=it.y;S.p.hp=S.p.maxHp;S.enemies.length=0;update(1/40)}
   if(it.done||(it.prog||0)>n0)prog=true}
  if(!prog&&pass>3)break}
 const undone=S.items.filter(i=>!i.done&&!['shoot','escort','defend'].includes(i.kind));if(undone.length)bad.push('F'+(f+1)+':'+undone.map(i=>i.kind+'/'+i.label).join(','))}
ok(!bad.length,'auto-use completes every use-type item (hold/cell/socket/touch/zone) on 30 floors (shoot/escort/defend never read USE), kinds='+Object.keys(kinds)+(bad.length?' STUCK '+bad.join(' | '):''));
}catch(e){L.push('EXC '+e.message)}L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
