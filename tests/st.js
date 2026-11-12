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
ok(CFG.v===4&&T.VERSION===4,'migrated cfg has version 4');
ok(CFG.endless===false,'old blob migrates with Endless locked');
ok(CFG.quality==='med'&&CFG.diff==='hard'&&CFG.shake===false&&CFG.vol.master===.5,'old values kept');
ok(T.key('w')==='i'&&T.key('e')==='f','old key overrides kept');
ok(T.key('fire')!=='f'&&T.mapKey(T.key('fire'))==='fire'&&T.mapKey('f')==='e','new default clashing with old override relocated ('+T.keyLabel('fire')+')');
ok(CFG.interact==='hold'&&CFG.autofire===false&&CFG.pad&&typeof CFG.pad==='object','new fields filled with defaults');
ok(cfgLS().v===4&&cfgLS().endless===false,'migrated cfg written back');
// bad data never crashes
let bad=0,badAt=[];for(const r of [null,undefined,5,'x',[],{vol:null,binds:[1,2],pad:'q'},{vol:{master:'loud',sfx:NaN,music:9},quality:7,interact:'sideways',autofire:'yes',binds:{w:'Escape',fire:42,zz:'k',e:'w'},pad:{fire:99,use:-1,drone:'3',back:13}}]){try{const m=T.migrate(r,{vol:{master:.8,sfx:.8,music:.55},quality:'high',diff:'normal',shake:true,tut:true,cb:false,interact:'hold',autofire:false,binds:{},pad:{}});
 if(m.v!==4||m.endless!==false||typeof m.binds!=='object'||Array.isArray(m.binds)||!(m.vol.master>=0&&m.vol.master<=1)||!(m.vol.music<=1)||m.interact!=='hold'||m.autofire!==false||m.binds.w==='Escape'||m.binds.zz||m.binds.fire||m.pad.fire!==undefined||m.pad.back!==undefined){bad++;badAt.push(JSON.stringify(m))}}catch(e){bad++;badAt.push(e.message)}}
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
document.getElementById('s-interact').click();ok(CFG.interact==='auto'&&/AUTO/.test(document.getElementById('s-interact').textContent),'interact mode auto');
{const it2=S.items.find(i=>i.kind==='hold'&&!i.done&&i.active&&i!==it)||it;S.p.x=it2.x;S.p.y=it2.y;const q0=it2.prog;for(let i=0;i<20;i++)update(1/60);ok(it2.prog>q0,'auto: progress while standing on it, no key');
 ok(/stand/i.test(S.obj.progress(S))&&/STAND HERE TO/.test(__TDP_DBG.useHint(it2)),'auto prompt: '+__TDP_DBG.useHint(it2));
 S.p.x=it2.x+300;S.p.y=it2.y;const q1=it2.prog;for(let i=0;i<20;i++)update(1/60);ok(it2.prog<=q1,'auto: no progress out of range');
 const tt=it2.time;it2.prog=0;S.p.x=it2.x;S.p.y=it2.y;let n=0;while(!it2.done&&n<6000){update(1/60);n++}ok(it2.done&&Math.abs(n/60-tt)<.3,'auto: same duration as hold ('+(n/60).toFixed(2)+'s vs '+tt+'s)');}
{const ex=S.exit;S.exit={x:S.p.x,y:S.p.y};S.exitDwell=0;const st0=S.state,f0=S.floor;update(1/60);update(1/60);ok(S.state===st0&&S.floor===f0,'auto: exit needs ~0.4s dwell (not instant)');S.exit=ex;S.exitDwell=0}
{const m=d=>T.migrate(d,{interact:'hold',binds:{},pad:{}});ok(m({v:3,interact:'hold'}).interact==='hold'&&m({v:3,interact:'auto'}).interact==='auto','desktop: old save keeps hold, auto accepted');
 window.ontouchstart=null;ok(m(null).interact==='auto'&&m({v:3,interact:'hold'}).interact==='auto'&&m({v:4,interact:'hold'}).interact==='hold','touch: default auto, v3 save upgraded to auto once, v4 choice respected');delete window.ontouchstart;
 ok(m(null).interact==='hold','desktop default stays hold');}
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
rebind('fire','c');document.getElementById('s-autofire').click();const ls=cfgLS();ok(ls.v===4&&ls.binds.fire==='c'&&ls.autofire===true&&ls.pad&&!ls.pad.fire,'persisted to localStorage');
document.getElementById('s-autofire').click();T.resetKeys();
// colourblind
const cb=document.getElementById('s-cb');ok(!!cb,'cb checkbox');cb.checked=true;cb.dispatchEvent(new Event('change'));ok(T.on(),'cb on');
ok(T.itemColor({kind:'hold',color:'#0f0'})==='#F0E442','cb item colour');ok(cfgLS().cb===true,'cb persisted');
render&&render();ok(true,'render with cb');cb.checked=false;cb.dispatchEvent(new Event('change'));

// ===================== ENDLESS DESCENT =====================
{const E=TDP_ENDLESS,best=()=>JSON.parse(localStorage.getItem('tdp_best')||'null'),near=(a,b)=>Math.abs(a-b)<1e-6,btn=document.getElementById('b-endless');
 T.resetKeys();setDifficulty('normal');localStorage.removeItem('tdp_best');localStorage.removeItem('tdp_save');CFG.endless=false;saveCfg();CFG.tut=false;
 ok(T.migrate({endless:true},{}).endless===true&&T.migrate({endless:'yes'},{}).endless===false&&T.migrate({},{}).endless===false,'migrate: endless flag validated (bool only, default locked)');
 // --- unlock gating
 goTitle();window.__pause=true;ok(btn&&btn.disabled&&/LOCKED/.test(btn.textContent)&&/floor 30/i.test(document.getElementById('endless-hint').textContent),'title: Endless button shown locked with hint');
 btn.click();ok(S.state==='title','locked Endless button does nothing');ok(startEndless()===false,'startEndless refused while locked');
 newRun();window.__pause=true;S.state='victory';ok(continueEndless()===false&&S.state==='victory','victory: continue-into-endless refused while locked');
 // beat floor 30 -> unlock (persisted)
 newRun();window.__pause=true;S.god=true;S.floor=29;startFloor();S.state='play';S.enemies=[];S.items.forEach(i=>i.done=true);S.bossSpawned=true;update(1/60);S.enemies=[];update(1/60);
 ok(!!S.exit,'F30 extraction opened');S.p.x=S.exit.x;S.p.y=S.exit.y;update(1/60);
 ok(S.state==='ending'&&CFG.endless===true&&cfgLS().endless===true,'beating floor 30 unlocks Endless and persists it ('+S.state+')');
 ok(best()&&best().wins===1&&best().floor===30,'win recorded');
 {const c=document.getElementById('crawl');if(c)c.className=''}S.state='victory';
 const lb=S.p.ups.length;render(1/60);const eb=endlessBtnRect();mouse.sx=eb.x+eb.w/2;mouse.sy=eb.y+eb.h/2;onClick();
 ok(S.state==='upgrade'&&S.endless&&S.endless.seed>0&&S.choices.length===3&&S.floor===29,'victory: clicking CONTINUE INTO ENDLESS opens an upgrade chamber with the same run');
 ok(S.p.ups.length===lb,'build carried over');
 pick(0);for(let i=0;i<200&&S.state!=='play';i++)update(1/60);
 ok(S.floor===30&&S.f.endless&&S.state==='play','descends into F31 ('+S.f.name+')');
 ok(floorLbl(S.floor)==='ENDLESS F31','HUD label ENDLESS F31');render(1/60);
 ok(best().endless&&best().endless.normal&&best().endless.normal.floor===31,'endless best floor recorded on reaching F31');
 goTitle();window.__pause=true;ok(!btn.disabled&&!/LOCKED/.test(btn.textContent),'title: Endless button unlocked');
 ok(/ENDLESS BEST: NORMAL F31/.test(document.getElementById('best').textContent),'title best-run stats show endless best: '+document.getElementById('best').textContent);
 // keyboard path on victory screen
 newRun();window.__pause=true;S.state='victory';kd('e');ok(S.state==='upgrade'&&!!S.endless,'victory: interact key continues into endless');
 // --- scaling values
 ok(E.K.hp>1&&E.K.dmg>1&&E.K.count>1&&near(E.scale(30).hp,E.K.hp)&&near(E.scale(39).hp,Math.pow(E.K.hp,10))&&near(E.scale(39).dmg,Math.pow(E.K.dmg,10))&&near(E.scale(39).count,Math.pow(E.K.count,10))&&near(E.scale(39).boss,Math.pow(E.K.boss,10))&&near(E.scale(40).hp/E.scale(39).hp,E.K.hp),'endless multipliers compound per floor: F31 x'+E.K.hp+' hp, F40 x'+E.scale(39).hp.toFixed(3)+' hp');
 ok(E.scale(29).hp===1&&E.scale(10).dmg===1,'no endless scaling on floors 1-30');
 newRun();window.__pause=true;S.floor=29;const s30=scaleF();S.endless={seed:12345};S.floor=39;startFloor();const s40=scaleF();
 ok(near(s40.hp,(1+39*.055)*Math.pow(E.K.hp,10))&&near(s40.count,(1+39*.0125)*Math.pow(E.K.count,10))&&near(S.dmgK,Math.pow(E.K.dmg,10)),'scaleF on F40 = base curve x endless multiplier');
 {const st=[];for(let f=30;f<60;f++){const sa=E.scale(f-1),sb=E.scale(f),ha=(1+(f-1)*.055)*(f-1<30?1:sa.hp),hb=(1+f*.055)*sb.hp;st.push(hb/ha)}ok(near(s40.hp/s30.hp,(1+39*.055)/(1+29*.055)*Math.pow(E.K.hp,10))&&st.every(r=>r>1&&r<1.15),'smooth growth: F30->F40 hp x'+(s40.hp/s30.hp).toFixed(2)+', every floor step x'+Math.min(...st).toFixed(3)+'..x'+Math.max(...st).toFixed(3))}
 ok(E.cap(30,24+30*.7)===45&&E.cap(80,24+80*.7)===56&&E.cap(80,(24+80*.7)*1.2)===56&&E.cap(10,31)===31,'live-enemy cap clamps at 56 in endless (all difficulties)');
 {S.floor=79;startFloor();S.state='play';S.enemies=[];for(let i=0;i<40;i++)spawnWave();ok(S.enemies.length<=56,'F80 waves stay under the live cap ('+S.enemies.length+')');S.diff='hard';S.enemies=[];for(let i=0;i<40;i++)spawnWave();ok(S.enemies.length<=56,'F80 hard also capped ('+S.enemies.length+')');S.diff='normal';S.enemies=[]}
 {S.floor=39;startFloor();S.enemies=[];const ex=TDP_ENDLESS.scale(39).boss*(1+39*.015),b=spawnEnemy(S.f.boss,100,100);ok(near(b.max,ENEMIES[S.f.boss].hp*ex*E.bossW(S.f.boss)),'F40 boss HP scaled ('+S.f.boss+' '+Math.round(b.max)+')');S.enemies=[]}
 {const dk=S.dmgK;S.p.hp=1000;S.p.maxHp=1000;S.p.inv=0;S.god=false;S.p.armor=1;hurtPlayer(10);ok(near(1000-S.p.hp,10*dk),'endless damage multiplier applied to hits ('+(1000-S.p.hp).toFixed(2)+')')}
 // --- rotation
 const seq=(seed,n)=>{const o=[];for(let i=30;i<30+n;i++)o.push(E.floorAt(i,seed));return o};
 const A=seq(777,50),A2=seq(777,50),Bq=seq(778,50);
 ok(A.every((f,i)=>f===A2[i]),'rotation deterministic per seed');ok(A.some((f,i)=>f.name!==Bq[i].name),'different seed, different rotation');
 ok(A.every((f,i)=>((i+31)%5===0)===(f.objective==='boss')),'boss every 5 floors (F35, F40, ...) and only then');
 const bs=A.filter(f=>f.objective==='boss').map(f=>f.boss);let rot=true;for(let c=0;c+5<=bs.length;c+=5)if(new Set(bs.slice(c,c+5)).size!==5)rot=false;
 ok(rot&&bs.every((b,i)=>!i||b!==bs[i-1])&&bs.every(b=>E.BOSSES.includes(b)),'boss rotation: each cycle of 5 uses all 5 bosses, no back-to-back ('+bs.join(',')+')');
 const reg=A.filter(f=>f.objective!=='boss'),pool=E.regularPool();
 ok(new Set(reg.slice(0,pool.length).map(f=>f.src)).size===pool.length,'regular floors: first pass covers all '+pool.length+' templates once');
 ok(reg.every((f,i)=>!i||f.src!==reg[i-1].src),'no template repeats back-to-back');
 ok(A.every(f=>f.endless&&OBJECTIVES[f.objective]),'every endless floor maps to an existing objective');
 ok(FLOORS.every(f=>!f.endless),'templates not mutated');
 // --- endless upgrades
 {newRun();window.__pause=true;S.endless={seed:5};S.floor=31;let seen=new Set();for(let i=0;i<80;i++)rollChoices().forEach(c=>c.endless&&seen.add(c.name.replace(/ [IVX]+$/,'')));
  ok(seen.size>=3,'endless-only upgrades offered in endless chambers ('+[...seen].join(', ')+')');
  S.endless=null;let none=true;for(let i=0;i<60;i++)if(rollChoices().some(c=>c.endless))none=false;ok(none,'endless upgrades never offered in a normal run');S.endless={seed:5};
  const ap=()=>endlessUps(S.p).find(u=>/Plating/.test(u.name));for(let i=0;i<12;i++){const u=ap();if(u)u.apply(S.p)}ok(near(S.p.armor,.5)&&!ap(),'Ablative Plating stacks down to 50% and then stops being offered');
  const d0=S.p.dmgMul,oc=()=>endlessUps(S.p).find(u=>/Overclock/.test(u.name));oc().apply(S.p);const u2=oc();u2.apply(S.p);ok(near(S.p.dmgMul,d0*1.21)&&S.p.eu.oc===2&&/Overclock Core II/.test(S.p.ups[S.p.ups.length-1]),'Overclock Core stacks (II)')}
 // --- save / continue round trip in endless
 {newRun();window.__pause=true;S.endless={seed:4242};S.floor=33;startFloor();S.p.eu={oc:2};S.p.armor=.92;S.p.ups.push('X');S.stats.etime=123;const nm=S.f.name,obj=S.f.objective;saveGame();
  ok(loadSave()&&loadSave().endless.seed===4242&&loadSave().floor===33,'endless checkpoint saved');
  goTitle();window.__pause=true;ok(/CONTINUE — ENDLESS F34/.test(document.getElementById('b-cont').textContent),'title Continue shows ENDLESS F34');
  document.getElementById('b-cont').click();window.__pause=true;
  ok(S.state==='play'&&S.floor===33&&S.endless&&S.endless.seed===4242&&S.f.name===nm&&S.f.objective===obj&&S.f.endless,'continue restores endless floor + seed ('+S.f.name+')');
  ok(S.p.eu.oc===2&&near(S.p.armor,.92)&&S.stats.etime===123,'continue restores endless upgrades and time');
  S.state='play';S.enemies=[];S.items.forEach(i=>i.done=true);S.bossSpawned=true;S.cards=99;for(let i=0;i<3;i++)update(1/60);S.enemies=[];update(1/60);
  if(S.exit){S.p.x=S.exit.x;S.p.y=S.exit.y;update(1/60)}ok(S.state==='upgrade','F34 clear -> upgrade chamber, not extraction ('+S.state+')');
  pick(0);for(let i=0;i<200&&S.state!=='play';i++)update(1/60);ok(S.floor===34&&S.f.objective==='boss'&&loadSave().floor===34&&loadSave().endless.seed===4242,'descent -> F35 boss floor, checkpoint updated');
  const sv=JSON.parse(localStorage.getItem('tdp_save'));localStorage.setItem('tdp_save',JSON.stringify(Object.assign({},sv,{endless:{seed:'x'}})));ok(loadSave()===null,'corrupt endless save rejected');
  localStorage.setItem('tdp_save',JSON.stringify(Object.assign({},sv,{floor:40,endless:undefined})));ok(loadSave()===null,'non-endless save past F30 rejected');localStorage.setItem('tdp_save',JSON.stringify(sv))}
 // --- records
 {const b={};ok(E.record(b,'normal',34,500)&&b.endless.normal.floor===34,'record: first');ok(!E.record(b,'normal',33,100),'record: shallower ignored');ok(E.record(b,'normal',34,400)&&b.endless.normal.time===400,'record: same floor faster wins');
  ok(!E.record(b,'normal',34,450),'record: same floor slower ignored');ok(E.record(b,'normal',36,900)&&b.endless.normal.floor===36,'record: deeper wins');ok(E.record(b,'hard',31,50)&&b.endless.normal.floor===36,'record: per difficulty');}
 {localStorage.removeItem('tdp_best');newRun();window.__pause=true;S.diff='hard';S.endless={seed:9};S.floor=36;S.stats.etime=600;startFloor();ok(best().endless.hard.floor===37&&best().endless.hard.time===600,'reaching F37 on hard records it');
  const r0=best().runs;S.state='play';S.god=false;S.p.inv=0;S.p.hp=0;update(1/60);ok(S.state==='dead'&&best().runs===r0&&best().floor<=30&&best().endless.hard.floor===37,'endless death keeps the 1-30 record clean and endless best intact');
  render(1/60);ok(true,'endless death stats screen renders');
  goTitle();window.__pause=true;ok(/HARD F37 \(10:00\)/.test(document.getElementById('best').textContent),'title shows endless best per difficulty')}
 // --- title draft start
 {CFG.endless=true;btn.click();ok(S.state==='upgrade'&&S.draft&&S.draft.of===29&&S.floor===29&&!!S.endless,'title Endless starts a loadout draft');window.__pause=true;
  let n=0;while(S.state==='upgrade'&&n<40){pick(0);n++}for(let i=0;i<200&&S.state!=='play';i++)update(1/60);ok(n===29&&S.floor===30&&S.f.endless&&S.p.ups.length>=1,'29 draft picks then F31 ('+S.p.weapons.length+' weapons, '+S.p.drones.length+' drones)')}
 localStorage.removeItem('tdp_save');goTitle();window.__pause=true}
}catch(e){L.push('EXC '+e.message+' '+e.stack)}L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
