// native-shell lifecycle, weapon mastery and checkpoint round-trip (browser harness; native path is opt-in)
(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));const ok=(c,n)=>L.push((c?'PASS ':'FAIL ')+n);
try{while(!window.GAME_READY)await w(50);
 ok(typeof TDP_SHELL==='object'&&typeof TDP_SHELL.onBackground==='function','shell hooks present');
 ok(TDP_SHELL.isNative()===false,'browser is not the native shell');
 const near=(a,b)=>Math.abs(a-b)<1e-9;
 const wm=__TDP_DBG.wm,p=wm.newPlayer();
 ok(wm.KPL===30&&wm.wLevel(p,'kinetic')===0&&near(wm.wMasteryMul(p,'kinetic'),1),'mastery starts at level 0');
 p.wxp={kinetic:29};ok(wm.wLevel(p,'kinetic')===0,'29 kills is still level 0');
 p.wxp={kinetic:30};ok(wm.wLevel(p,'kinetic')===1&&near(wm.wMasteryMul(p,'kinetic'),1.02),'30 kills is level 1, +2% fire rate');
 p.wxp={kinetic:30*30};ok(wm.wLevel(p,'kinetic')===30&&near(wm.wMasteryMul(p,'kinetic'),1.6),'30 levels is +60% and the cap');
 p.wxp={kinetic:30*30+80};ok(wm.wLevel(p,'kinetic')===30,'kills past level 30 do not raise the cap');
 p.wxp={kinetic:60,railgun:30};ok(wm.wLevel(p,'kinetic')===2&&wm.wLevel(p,'railgun')===1,'mastery is per weapon');
 // audio + background: a browser hide suspends audio and does not pause the run
 CFG.tut=false;newRun();window.__pause=true;S.state='play';audioInit();
 if(AU.ctx){if(AU.ctx.state!=='running')await AU.ctx.resume();ok(AU.ctx.state==='running','audio context running');
  const floor=S.floor,hp=S.p.hp;S.p.wxp={kinetic:60};
  const b=await TDP_SHELL.onBackground({native:false});
  ok(b.native===false&&S.state==='play'&&S.floor===floor&&S.p.hp===hp,'browser background keeps the run playing');
  ok(AU.ctx.state==='suspended','browser background suspends audio');
  const f=await TDP_SHELL.onForeground({native:false});
  ok(f.state==='play'&&AU.ctx.state==='running','browser foreground resumes audio and stays in play');
  // native background pauses, checkpoints, and does not auto-resume combat
  IN.mx=1;IN.fire=true;keys.e=true;mouse.down=true;
  const n=await TDP_SHELL.onBackground({native:true});
  ok(n.native===true&&S.state==='paused','native background pauses a live run');
  ok(IN.mx===0&&IN.fire===false&&!keys.e&&mouse.down===false,'native background releases touch, fire and mouse');
  const sv=loadSave();ok(!!sv&&sv.floor===floor&&sv.p&&sv.p.wxp&&sv.p.wxp.kinetic===60,'native background writes the checkpoint with weapon mastery');
  const back=await TDP_SHELL.onForeground({native:true});
  ok(back.state==='paused','native foreground leaves the pause menu up');
  resumeGame();ok(S.state==='play','resume continues the same run');
  const x0=S.p.x;for(let i=0;i<10;i++)update(1/60);ok(S.p.x===x0,'sticks do not keep moving after a background release');
  goTitle();window.__pause=true;document.getElementById('b-cont').click();window.__pause=true;
  ok(S.state==='play'&&S.p.wxp&&S.p.wxp.kinetic===60&&__TDP_DBG.wm.wLevel(S.p,'kinetic')===2,'continue restores per-weapon mastery');
 }else ok(false,'audio context missing');
}catch(e){L.push('EXC '+e.message+' '+e.stack)}
L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
