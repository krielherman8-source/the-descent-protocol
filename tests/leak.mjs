// usage: node --experimental-websocket tests/leak.mjs 'leak.html#sc=full&diff=normal' out.txt [timeoutMin]
// Builds /tmp/srv/leak.html (index.html + leakprobe in <head> + bot.js + leak.js), syncs js/css/vendor into /tmp/srv,
// launches headless Chrome with precise memory info and exposed gc, drives it over CDP in REAL time (no virtual clock,
// so Web Audio, timers and rAF behave as in a browser) and writes the per-sample log to out.txt.
import {spawn,execSync} from 'child_process';import fs from 'fs';import path from 'path';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');const SRV='/tmp/srv';
fs.mkdirSync(SRV,{recursive:true});execSync(`cp -r ${ROOT}/js ${ROOT}/css ${ROOT}/vendor ${SRV}/`);
let s=fs.readFileSync(ROOT+'/index.html','utf8');
const probe=fs.readFileSync(ROOT+'/tests/leakprobe.js','utf8');
s=s.replace('<head>','<head><script>window.ERRS=[];window.onerror=(m,src,l)=>{ERRS.push(m+" @"+l)};addEventListener("unhandledrejection",e=>ERRS.push("rej "+e.reason));\n'+probe+'</script>');
s=s.replace('</body>','<script>\n'+fs.readFileSync(ROOT+'/tests/leak.js','utf8')+'\n'+fs.readFileSync(ROOT+'/tests/bot.js','utf8')+'\n</script></body>');
fs.writeFileSync(SRV+'/leak.html',s);
try{execSync('pgrep -f "http.server 8765"')}catch{spawn('python3',['-m','http.server','8765'],{cwd:SRV,detached:true,stdio:'ignore'}).unref();await new Promise(r=>setTimeout(r,800))}
const port=9400+Math.floor(Math.random()*500),prof='/tmp/pw/leak'+port;
const c=spawn('google-chrome',['--headless=new','--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--window-size=1280,800','--autoplay-policy=no-user-gesture-required',
 '--enable-precise-memory-info','--js-flags=--expose-gc','--remote-debugging-port='+port,'--user-data-dir='+prof,'about:blank'],{stdio:'ignore'});
const sl=ms=>new Promise(r=>setTimeout(r,ms));let t;for(let i=0;i<60;i++){await sl(300);try{t=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(t.find(x=>x.type==='page'))break}catch{}}
const pg=t.find(x=>x.type==='page');const ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const pend={};const cons=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}
 if(m.method==='Runtime.exceptionThrown')cons.push('EXC '+(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text).slice(0,200));
 if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')cons.push('CONSOLE.ERROR '+m.params.args.map(a=>a.value??a.description).join(' ').slice(0,200))};
await new Promise(r=>ws.onopen=r);const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
await send('Runtime.enable');await send('Page.navigate',{url:'http://localhost:8765/'+process.argv[2]});const T0=Date.now();let log='';const TMAX=(+process.argv[4]||40)*60000;
async function heapSnap(name){const chunks=[];const prev=ws.onmessage;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='HeapProfiler.addHeapSnapshotChunk')chunks.push(m.params.chunk);else prev(e)};
 await send('HeapProfiler.collectGarbage');await send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});ws.onmessage=prev;fs.writeFileSync('/tmp/leak/'+name+'.heapsnapshot',chunks.join(''))}
while(Date.now()-T0<TMAX){await sl(1000);{const q=await send('Runtime.evaluate',{expression:'document.body&&document.body.dataset.snap||""'});const sn=q.result?.result?.value;
 if(sn){await heapSnap(sn.replace(/[^\w@.-]/g,'_'));await send('Runtime.evaluate',{expression:'delete document.body.dataset.snap'})}}const r=await send('Runtime.evaluate',{expression:'document.body&&(document.body.dataset.log||"")'});log=r.result?.result?.value||'';if(log.includes('ERRS')||log.startsWith('CRASH'))break}
if(!log){const r=await send('Runtime.evaluate',{expression:'document.body&&document.body.dataset.progress'});log='TIMEOUT progress='+(r.result?.result?.value)}
fs.writeFileSync(process.argv[3],log+'\nCDP_CONSOLE '+JSON.stringify(cons.slice(0,10))+'\nwall='+Math.round((Date.now()-T0)/1000)+'s\n');
c.kill();try{fs.rmSync(prof,{recursive:true,force:true})}catch{}process.exit(0);
