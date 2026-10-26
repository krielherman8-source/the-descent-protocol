import {spawn} from 'child_process';
const url='http://localhost:8765/'+process.argv[2];
const c=spawn('google-chrome',['--headless=new','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--window-size=1280,800','--remote-debugging-port=9333','--user-data-dir=/tmp/pw/prof','about:blank'],{stdio:'ignore'});
const sl=ms=>new Promise(r=>setTimeout(r,ms));let t;for(let i=0;i<50;i++){await sl(300);try{t=await (await fetch('http://127.0.0.1:9333/json')).json();if(t.length)break}catch{}}
const pg=t.find(x=>x.type==='page');const ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const pend={};
ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}};
await new Promise(r=>ws.onopen=r);const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
await send('Page.navigate',{url});const T0=Date.now();let log='';
while(Date.now()-T0<900000){await sl(2000);const r=await send('Runtime.evaluate',{expression:'document.body&&document.body.dataset.log||""'});log=r.result?.result?.value||'';if(log.includes('ERRS'))break}
console.log(log);c.kill();process.exit(0);
