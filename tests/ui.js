(async()=>{const L=[],ok=(n,c)=>L.push((c?'PASS ':'FAIL ')+n);const w=ms=>new Promise(r=>setTimeout(r,ms));
window.__pause=true;const step=sec=>{for(let i=0;i<sec*60;i++){TDP_INPUT.poll(1/60);update(1/60)}};const key=k=>dispatchEvent(new KeyboardEvent('keydown',{key:k}));
try{while(!window.GAME_READY)await w(50);await w(300);
ok('title state',S.state==='title');ok('diff button',document.getElementById('b-diff').textContent.includes('NORMAL'));
document.getElementById('b-diff').click();ok('diff cycles to HARD',document.getElementById('b-diff').textContent.includes('HARD')&&CFG.diff==='hard');
document.getElementById('b-diff').click();document.getElementById('b-diff').click();ok('diff back to NORMAL',CFG.diff==='normal');
document.querySelector('[data-a=credits]').click();ok('credits panel',document.getElementById('m-credits').classList.contains('on')&&document.getElementById('credits-body').textContent.includes('Granite'));
key('escape');ok('credits back',document.getElementById('m-title').classList.contains('on'));
document.querySelector('[data-a=start]').click();await w(100);ok('intro crawl on',document.getElementById('crawl').classList.contains('on')&&S.state==='intro');
await w(500);key(' ');await w(100);ok('intro skipped -> play floor1',S.state==='play'&&S.floor===0&&!document.getElementById('crawl').classList.contains('on'));
step(.05);ok('tutorial step1',S.tut&&S.tut.i===0);
IN.mx=1;step(1.2);IN.mx=0;ok('tutorial advanced by move',S.tut.i===1);
S.stats.shots+=10;step(.2);ok('tutorial advanced by shooting',S.tut.i===2);
ok('minimap fn',typeof TDP_MINIMAP.draw==='function');
// health pickup
S.p.hp=50;S.pickups.length=0;S.pickups.push({x:S.p.x,y:S.p.y,heal:18,life:10});step(.2);ok('pickup heals',S.p.hp>=67&&S.pickups.length===0);
// pause/save
key('escape');ok('paused',S.state==='paused');document.querySelector('#m-pause [data-a=quit]').click();ok('save&quit to title',S.state==='title'&&!!loadSave());
document.getElementById('b-cont').click();await w(100);ok('continue',S.state==='play'&&S.floor===0);
// death
S.p.inv=0;damage?.length;S.p.hp=1;S.p.hp=-1;step(.3);ok('death state',S.state==='dead');key('r');await w(100);ok('restart',S.state==='play'&&S.floor===0);
// touch emulation
TDP_INPUT.init; const T=(type,id,x,y)=>{const t=new Touch({identifier:id,target:document.getElementById('hud'),clientX:x,clientY:y});document.getElementById('hud').dispatchEvent(new TouchEvent(type,{touches:type==='touchend'?[]:[t],changedTouches:[t],bubbles:true,cancelable:true}))};
T('touchstart',1,200,500);ok('touch mode on',document.body.classList.contains('touch')&&!!document.getElementById('touchui'));
T('touchmove',1,260,500);ok('left stick moves',IN.mx>.9);const x0=S.p.x;step(.4);ok('player moved by touch',S.p.x>x0+30);
T('touchstart',2,1000,400);T('touchmove',2,1000,340);ok('right stick aims+fires',IN.fire&&Math.abs(IN.aim+Math.PI/2)<.05);const s0=S.stats.shots;step(.4);ok('fires',S.stats.shots>s0);
T('touchend',1,260,500);T('touchend',2,1000,340);ok('release',IN.mx===0&&!IN.fire);
const e=document.getElementById('tb-e');e.dispatchEvent(new TouchEvent('touchstart',{changedTouches:[new Touch({identifier:3,target:e,clientX:0,clientY:0})],bubbles:true,cancelable:true}));ok('USE button holds E',keys.e===true);
e.dispatchEvent(new TouchEvent('touchend',{changedTouches:[new Touch({identifier:3,target:e,clientX:0,clientY:0})],bubbles:true,cancelable:true}));ok('USE release',!keys.e);
// gamepad (fake)
let gp={index:0,axes:[1,0,0,-1],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[gp];step(.1);gp.buttons[0].pressed=true;step(.1);gp.buttons[0].pressed=false;step(.1);ok('pad move+aim',IN.mx>.9&&IN.fire&&IN.src==='pad');
gp.axes=[0,0,0,0];await w(100);
// ending
S.floor=FLOORS.length-1;startFloor();S.enemies.length=0;S.items.forEach(i=>i.done=true);S.exit={x:S.p.x,y:S.p.y};step(.3);ok('ending crawl',S.state==='ending'&&document.getElementById('crawl').classList.contains('on'));
await w(600);key(' ');await w(100);ok('victory after ending',S.state==='victory');
}catch(err){L.push('EXC '+err.message+' '+err.stack)}
L.push('ERRS '+JSON.stringify(ERRS));document.body.dataset.log=L.join('\n')})();
