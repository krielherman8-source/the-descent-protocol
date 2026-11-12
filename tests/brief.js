// every floor has a reason, a goal and a completion line; the briefing and HUD say them
(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));const ok=(c,n)=>L.push((c?'PASS ':'FAIL ')+n);
try{while(!window.GAME_READY)await w(50);
 ok(TDP_STORY.BRIEFS.length===30&&FLOORS.length===30,'30 campaign floors, 30 briefings');
 const whys=new Set();
 FLOORS.forEach((f,i)=>{const b=TDP_STORY.BRIEFS[i];
  const good=b&&f.why===b.why&&f.goal===b.goal&&f.clear===b.clear&&f.why.length>24&&f.goal.length>8&&f.clear.length>8&&f.why!==f.goal;
  if(!good)L.push('FAIL F'+(i+1)+' briefing '+JSON.stringify({why:f.why,goal:f.goal,clear:f.clear}));
  else whys.add(f.why)});
 ok(whys.size===30,'each floor has its own reason');
 window.__pause=true;CFG.tut=false;newRun();S.state='play';
 for(let i=0;i<30;i++){S.floor=i;S.endless=null;startFloor();
  const f=FLOORS[i],p=S.obj.progress(S);
  ok(S.brief&&S.brief.why===f.why&&S.brief.goal===f.goal&&S.brief.life>1,'F'+(i+1)+' briefing card armed');
  ok(p.indexOf(f.goal)===0&&/\d/.test(p),'F'+(i+1)+' HUD goal with a count: '+p)}
 render(1/60);ok(true,'briefing card draws');
 S.floor=0;startFloor();S.brief.arm=1;dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
 ok(S.brief.life>1,'briefing stays up until it is armed');
 S.brief.arm=0;dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
 ok(S.brief.life<=.75,'tap or click dismisses the briefing');
 S.brief.life=.2;update(.3);ok(S.brief.life<=0,'briefing fades on its own');
 S.floor=0;startFloor();S.god=true;S.p.hp=S.p.maxHp=1e6;S.enemies=[{type:'swarmer',x:80,y:80,r:9,hp:30,max:30,speed:10,dmg:1,color:'#7cff4f',burn:0,flash:0,cd:9,side:1}];
 S.items.forEach(it=>{it.done=true;it.prog=1});update(1/60);
 ok(S.banner&&S.banner.a==='OBJECTIVE COMPLETE'&&S.banner.b===FLOORS[0].clear,'completion line while the swarm remains: '+((S.banner&&S.banner.b)||''));
 S.floor=0;startFloor();S.enemies=[];S.items.forEach(it=>{it.done=true});update(1/60);
 ok(S.exit&&S.banner&&S.banner.b===FLOORS[0].clear,'completion line when the floor is already clear');
 const reg=TDP_ENDLESS.floorAt(30,7);
 ok(reg.src!=null&&reg.why===FLOORS[reg.src].why&&reg.goal===FLOORS[reg.src].goal,'endless regular floor reuses its template reason');
 let warden=null,seed=0;for(seed=1;seed<120&&!warden;seed++){const q=TDP_ENDLESS.floorAt(34,seed);if(q.boss==='warden')warden=q}
 ok(!!warden&&warden.goal==="Kill the Brood Warden"&&/Warden/.test(warden.why)&&!/keycard/i.test(warden.why),'endless Warden uses the boss reason, not the keycard errand');
 for(const boss of['prime','colossus','matriarch','overmind']){
  const b=TDP_STORY.BOSS[boss];ok(b&&b.why&&b.goal&&b.clear,'endless boss brief '+boss)}
}catch(e){L.push('EXC '+e.message+' '+e.stack)}
L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
