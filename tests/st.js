// settings / controls harness: keyboard + gamepad remapping, interact hold/toggle, auto-fire, prompts, schema migration, colourblind
(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));const ok=(c,n)=>L.push((c?'PASS ':'FAIL ')+n);try{
const OLD={vol:{master:.5,sfx:.8,music:.55},quality:'med',shake:false,diff:'hard',tut:true,binds:{w:'i',e:'f'},cb:false};
if(!sessionStorage.getItem('st_phase')){sessionStorage.setItem('st_phase','1');localStorage.clear();localStorage.setItem('tdp_cfg',JSON.stringify(OLD));location.reload();return}
sessionStorage.removeItem('st_phase');
while(!window.GAME_READY)await w(50);
const T=TDP_SETTINGS,cfgLS=()=>JSON.parse(localStorage.getItem('tdp_cfg')||'{}');
const kd=(k,o)=>dispatchEvent(new KeyboardEvent('keydown',Object.assign({key:k},o||{}))),ku=k=>dispatchEvent(new KeyboardEvent('keyup',{key:k}));
const B=a=>document.querySelector(`button.bind[data-bind="${a}"]`),PB=a=>document.querySelector(`button.bind[data-pad="${a}"]`);
const rebind=(a,k)=>{B(a).click();kd(k)};
// --- migration from the old (v1, unversioned) blob loaded at boot
ok(CFG.v===2&&T.VERSION===2,'migrated cfg has version 2');
ok(CFG.quality==='med'&&CFG.diff==='hard'&&CFG.shake===false&&CFG.vol.master===.5,'old values kept');
ok(T.key('w')==='i'&&T.key('e')==='f','old key overrides kept');
ok(T.key('fire')!=='f'&&T.mapKey(T.key('fire'))==='fire'&&T.mapKey('f')==='e','new default clashing with old override relocated ('+T.keyLabel('fire')+')');
ok(CFG.interact==='hold'&&CFG.autofire===false&&CFG.pad&&typeof CFG.pad==='object','new fields filled with defaults');
ok(cfgLS().v===2,'migrated cfg written back');
// bad data never crashes
let bad=0,badAt=[];for(const r of [null,undefined,5,'x',[],{vol:null,binds:[1,2],pad:'q'},{vol:{master:'loud',sfx:NaN,music:9},quality:7,interact:'sideways',autofire:'yes',binds:{w:'Escape',fire:42,zz:'k',e:'w'},pad:{fire:99,use:-1,drone:'3',back:13}}]){try{const m=T.migrate(r,{vol:{master:.8,sfx:.8,music:.55},quality:'high',diff:'normal',shake:true,tut:true,cb:false,interact:'hold',autofire:false,binds:{},pad:{}});
 if(m.v!==2||typeof m.binds!=='object'||Array.isArray(m.binds)||!(m.vol.master>=0&&m.vol.master<=1)||!(m.vol.music<=1)||m.interact!=='hold'||m.autofire!==false||m.binds.w==='Escape'||m.binds.zz||m.binds.fire||m.pad.fire!==undefined||m.pad.back!==undefined){bad++;badAt.push(JSON.stringify(m))}}catch(e){bad++;badAt.push(e.message)}}
ok(bad===0,'migrate survives bad/corrupt data'+(bad?' BAD '+badAt.join(';'):''));
document.querySelector('[data-a=controls]')||0;
// --- keyboard screen
T.resetKeys();
ok(document.querySelectorAll('#ctl-kb button.bind[data-bind]').length===18,'18 rebindable keyboard actions');
ok(document.querySelectorAll('#ctl-pad button.bind[data-pad]').length===7,'7 remappable pad actions');
const b=B('w');b.click();ok(/press a key/i.test(b.textContent),'listening label');
kd('i');ok(T.mapKey('i')==='w'&&T.mapKey('w')==='_w'&&/: I$/.test(b.textContent),'i -> w, w inert, label');
rebind('d','i');ok(T.mapKey('i')==='d'&&T.mapKey('d')==='w','swap on conflict');
B('d').click();kd('Escape');ok(!/press/i.test(B('d').textContent)&&T.mapKey('i')==='d','escape cancels and keeps binding');
// weapon slots
rebind('1','k');ok(T.key('1')==='k'&&T.mapKey('1')==='_1','weapon slot 1 -> K');
rebind('2','k');ok(T.key('2')==='k'&&T.key('1')==='2','slot conflict swaps (slot1 now 2)');
rebind('3','9');ok(T.key('3')==='9'&&T.mapKey('9')==='3','digits bindable (slot3 -> 9)');
ok(T.slotsLabel()!=='1-7','slots label reflects rebinding ('+T.slotsLabel()+')');
CFG.tut=false;newRun();S.state='play';startFloor();window.__pause=true;S.enemies=[];S.p.hp=S.p.maxHp=1e6;
S.p.weapons=['kinetic','flamethrower','tesla'];S.p.weapon='kinetic';
kd('k');ok(S.p.weapon==='flamethrower','K selects slot 2');kd('2');ok(S.p.weapon==='kinetic','2 selects slot 1');kd('9');ok(S.p.weapon==='tesla','9 selects slot 3');
kd('3');ok(S.p.weapon==='tesla','old default 3 inert');
kd('x');ok(S.p.weapon==='kinetic','X = next weapon (wraps)');kd('z');ok(S.p.weapon==='tesla','Z = prev weapon');
rebind('wnext','n');S.state='play';kd('n');ok(S.p.weapon==='kinetic','rebound next weapon N');kd('x');ok(S.p.weapon==='kinetic','old X inert');
// move with rebound key
const x0=S.p.x;kd('i');for(let i=0;i<30;i++)update(1/60);ku('i');ok(S.p.x>x0+20,'rebound key moves player right');
// keyboard fire
const sh=()=>S.stats.shots;mouse.down=false;let s0=sh();for(let i=0;i<30;i++)update(1/60);ok(sh()===s0,'no fire when idle');
const fk=T.key('fire');kd(fk);for(let i=0;i<30;i++)update(1/60);ku(fk);ok(sh()>s0,'keyboard fire key fires ('+T.keyLabel('fire')+')');
rebind('fire','g');S.state='play';s0=sh();kd('g');for(let i=0;i<30;i++)update(1/60);ku('g');ok(sh()>s0,'rebound fire G fires');
for(let i=0;i<30;i++)update(1/60);s0=sh();kd(fk);for(let i=0;i<30;i++)update(1/60);ku(fk);ok(sh()===s0,'old fire key inert');
// auto-fire
document.getElementById('s-autofire').click();ok(CFG.autofire===true&&/ON/.test(document.getElementById('s-autofire').textContent),'auto-fire toggle on');
s0=sh();for(let i=0;i<30;i++)update(1/60);ok(sh()>s0,'auto-fire fires with nothing held');
document.getElementById('s-autofire').click();for(let i=0;i<30;i++)update(1/60);s0=sh();for(let i=0;i<30;i++)update(1/60);ok(CFG.autofire===false&&sh()===s0,'auto-fire off stops');
// pause / restart
kd('p');ok(S.state==='paused','P pauses');kd('Escape');ok(S.state==='play','Esc resumes');
rebind('escape','o');S.state='play';kd('p');ok(S.state==='play','old P inert');kd('o');ok(S.state==='paused','rebound pause O');kd('Escape');kd('Escape');ok(S.state==='play'||S.state==='paused','esc still works');if(S.state==='paused')kd('Escape');kd('Escape');ok(S.state==='paused','Esc always pauses');kd('Escape');
S.p.hp=0;S.state='dead';rebind('r','y');S.state='dead';kd('r');ok(S.state==='dead','old R inert on death screen');kd('y');ok(S.state==='play','rebound restart Y');
// prompts reflect bindings
rebind('e','u');rebind('a','j');rebind('q','v');
ok(/J/.test(TUT[0].kbm())&&!/ A /.test(TUT[0].kbm()),'tutorial move prompt uses binding: '+TUT[0].kbm());
const tt=TUT.map(t=>typeof t.kbm==='function'?t.kbm():t.kbm).join(' | ');ok(/\bU\b/.test(tt)||/U/.test(tt),'tutorial uses rebound interact');
{const m=tt.match(/\bhold E\b|\bQ\b|WASD|SPACE|\b1-7\b/i);ok(!m,'no hard-coded keys in tutorial'+(m?' found '+m[0]+': '+tt:''))}
newRun();S.state='play';S.floor=0;startFloor();window.__pause=true;S.enemies=[];S.p.hp=S.p.maxHp=1e6;
const pr=S.obj.progress(S);ok(/hold u/i.test(pr),'objective prompt shows rebound interact: '+pr);
const ctl=document.getElementById('m-controls').textContent;ok(/INTERACT: U/.test(ctl)&&/MOVE LEFT: J/.test(ctl),'controls screen shows current bindings');
// hold vs toggle interact
const it=S.items.find(i=>i.kind==='hold'&&!i.done&&i.active);S.p.x=it.x;S.p.y=it.y;
kd('u');for(let i=0;i<20;i++)update(1/60);ku('u');const p1=it.prog;for(let i=0;i<20;i++)update(1/60);ok(p1>0&&it.prog===p1,'hold mode: progress only while held');
document.getElementById('s-interact').click();ok(CFG.interact==='toggle'&&/TOGGLE/.test(document.getElementById('s-interact').textContent),'interact mode toggle');
ok(/press u/i.test(S.obj.progress(S)),'prompt says PRESS in toggle mode');
kd('u');ku('u');for(let i=0;i<20;i++)update(1/60);const p2=it.prog;ok(p2>p1,'toggle: one press keeps interacting');
kd('u',{repeat:true});for(let i=0;i<5;i++)update(1/60);ok(S.useLatch===true,'key repeat ignored');
kd('u');ku('u');const p3=it.prog;for(let i=0;i<20;i++)update(1/60);ok(it.prog===p3&&!S.useLatch,'toggle: second press stops');
document.getElementById('s-interact').click();ok(CFG.interact==='hold','back to hold');
// reset keys
document.getElementById('rs-kb').click();ok(['w','a','s','d','e','q','1','2','3','7','r'].every(a=>T.key(a)===a)&&T.key('fire')==='f'&&T.key('escape')==='p'&&T.mapKey('i')==='i','reset keys -> defaults');
// --- gamepad remapping (stubbed navigator.getGamepads)
const gp={index:0,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[gp];
const step=n=>{for(let i=0;i<n;i++){TDP_INPUT.poll(1/60);update(1/60)}};const press=(i,v)=>{gp.buttons[i].pressed=!!v;gp.buttons[i].value=v?1:0};
goTitle();window.__pause=true;gp.axes[1]=.9;step(2);gp.axes[1]=0;step(2);ok(TDP_INPUT.padActive(),'pad active');
press(2,1);PB('fire').click();ok(T.padListening()&&/press/i.test(PB('fire').textContent),'pad listening');step(2);ok(T.padListening(),'already-held button not captured');press(2,0);step(2);
press(2,1);step(2);press(2,0);step(2);ok(T.pad('fire')===2&&!T.padListening()&&/FIRE: X/.test(PB('fire').textContent),'pad fire -> X');
PB('use').click();press(12,1);step(2);press(12,0);step(2);ok(T.padListening()&&T.pad('use')===0,'d-pad refused while listening');kd('Escape');ok(!T.padListening()&&T.pad('use')===0,'Esc cancels pad listening');
PB('drone').click();press(0,1);step(2);press(0,0);step(2);ok(T.pad('drone')===0&&T.pad('use')===3,'pad conflict swaps (drone A, use Y)');
CFG.tut=false;newRun();S.state='play';startFloor();window.__pause=true;resumeGame();S.state='play';ok(!(document.getElementById('crawl')||{className:''}).className,'no crawl in the way');S.enemies=[];S.p.hp=S.p.maxHp=1e6;step(2);ok(TDP_INPUT.padActive()&&S.state==='play','in play with pad ('+S.state+')');
press(2,1);step(3);ok(IN.fire,'remapped X fires');press(2,0);step(2);gp.buttons[7].pressed=true;gp.buttons[7].value=1;step(3);ok(!IN.fire,'old RT no longer fires');press(7,0);step(2);
press(3,1);step(2);ok(keys.e,'remapped Y = use');press(3,0);step(2);ok(!keys.e,'use released');
ok(/Y/.test(document.getElementById('ctl-fixed').textContent)||/Y/.test(T.padLabel('use')),'pad labels reflect remap');
S.p.weapons=['kinetic','flamethrower'];S.p.weapon='kinetic';press(5,1);step(1);press(5,0);step(1);ok(S.p.weapon==='flamethrower','RB next weapon');
press(9,1);step(1);press(9,0);step(1);ok(S.state==='paused','START pauses');resumeGame&&resumeGame();
document.getElementById('rs-pad').click();ok(T.pad('fire')===7&&T.pad('use')===0&&T.pad('drone')===3&&T.pad('back')===1,'reset pad -> defaults');
navigator.getGamepads=()=>[];step(2);
// persistence
rebind('fire','c');document.getElementById('s-autofire').click();const ls=cfgLS();ok(ls.v===2&&ls.binds.fire==='c'&&ls.autofire===true&&ls.pad&&!ls.pad.fire,'persisted to localStorage');
document.getElementById('s-autofire').click();T.resetKeys();
// colourblind
const cb=document.getElementById('s-cb');ok(!!cb,'cb checkbox');cb.checked=true;cb.dispatchEvent(new Event('change'));ok(T.on(),'cb on');
ok(T.itemColor({kind:'hold',color:'#0f0'})==='#F0E442','cb item colour');ok(cfgLS().cb===true,'cb persisted');
render&&render();ok(true,'render with cb');cb.checked=false;cb.dispatchEvent(new Event('change'));
}catch(e){L.push('EXC '+e.message+' '+e.stack)}L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
