(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));const ok=(c,n)=>L.push((c?'PASS ':'FAIL ')+n);try{
while(!window.GAME_READY)await w(50);
const b=document.querySelector('button.bind[data-bind="w"]');ok(!!b,'bind buttons present');ok(document.querySelectorAll('button.bind').length===7,'7 bind buttons');
b.click();ok(/press a key/.test(b.textContent),'listening label');
dispatchEvent(new KeyboardEvent('keydown',{key:'i'}));ok(TDP_SETTINGS.mapKey('i')==='w','i -> w');ok(TDP_SETTINGS.mapKey('w')==='_w','w inert');ok(/: I$/.test(b.textContent),'label I');
const bd=document.querySelector('button.bind[data-bind="d"]');bd.click();dispatchEvent(new KeyboardEvent('keydown',{key:'i'}));ok(TDP_SETTINGS.mapKey('i')==='d'&&TDP_SETTINGS.mapKey('d')==='w','swap on conflict');
bd.click();dispatchEvent(new KeyboardEvent('keydown',{key:'3'}));ok(TDP_SETTINGS.mapKey('i')==='d','digits refused');
bd.click();dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));ok(!/press/.test(bd.textContent),'escape cancels');
newRun();S.state='play';startFloor();window.__pause=true;const x0=S.p.x;dispatchEvent(new KeyboardEvent('keydown',{key:'i'}));for(let i=0;i<30;i++)update(1/60);dispatchEvent(new KeyboardEvent('keyup',{key:'i'}));ok(S.p.x>x0+20,'rebound key moves player right ('+(S.p.x-x0).toFixed(0)+')');
document.querySelector('button.bind:not([data-bind])').click();ok(TDP_SETTINGS.mapKey('d')==='d'&&TDP_SETTINGS.mapKey('i')==='i','reset keys');
const cb=document.getElementById('s-cb');ok(!!cb,'cb checkbox');cb.checked=true;cb.dispatchEvent(new Event('change'));ok(TDP_SETTINGS.on(),'cb on');
ok(TDP_SETTINGS.itemColor({kind:'hold',color:'#0f0'})==='#F0E442','cb item colour');ok(JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>/cfg/i.test(k)))||'{}').cb===true,'cb persisted');
render&&render();ok(true,'render with cb');cb.checked=false;cb.dispatchEvent(new Event('change'));
}catch(e){L.push('EXC '+e.message+' '+e.stack)}L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
