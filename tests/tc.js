// touch check: auto mode on touch de-emphasises USE, USE still works
(async()=>{const L=[],ok=(c,n)=>L.push((c?'PASS ':'FAIL ')+n);const w=ms=>new Promise(r=>setTimeout(r,ms));
try{while(!window.GAME_READY)await w(50);await w(300);
const t=new Touch({identifier:1,target:document.body,clientX:10,clientY:10});document.body.dispatchEvent(new TouchEvent('touchstart',{touches:[t],changedTouches:[t],bubbles:true}));
CFG.interact='auto';newRun();S.state='play';startFloor();S.tut=null;await w(500);
const b=document.getElementById('tb-e');ok(document.body.classList.contains('touch')&&b,'touch UI built');
TDP_INPUT.poll(0);ok(b&&b.classList.contains('deemph')&&getComputedStyle(b).opacity<0.5,'USE de-emphasised in auto');
CFG.interact='hold';TDP_INPUT.poll(0);ok(b&&!b.classList.contains('deemph'),'USE normal in hold');
}catch(e){L.push('EXC '+e.message)}L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
