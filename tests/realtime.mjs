// Real-time headless run for harness pages whose log is written to document.body.dataset.log.
// Virtual-time dump-dom (tests/run.sh) fast-forwards the render loop and is a poor fit for Web Audio.
// Usage: node tests/realtime.mjs page.html[#hash] out.txt [timeoutSec]
import {spawn} from 'child_process';
import fs from 'fs';
import path from 'path';

const page = process.argv[2];
const out = process.argv[3] || '/tmp/suite/realtime.txt';
const tmax = (+process.argv[4] || 120) * 1000;
if (!page) {
  console.error('usage: node tests/realtime.mjs page.html out.txt [timeoutSec]');
  process.exit(2);
}
const port = 9600 + Math.floor(Math.random() * 300);
const prof = '/tmp/pw/rt' + port;
fs.mkdirSync(path.dirname(out), {recursive: true});
const chrome = spawn('google-chrome', [
  '--headless=new', '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--autoplay-policy=no-user-gesture-required', '--window-size=1280,800',
  '--remote-debugging-port=' + port, '--user-data-dir=' + prof, 'about:blank',
], {stdio: 'ignore'});
const sl = ms => new Promise(r => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  await sl(200);
  try {
    targets = await (await fetch('http://127.0.0.1:' + port + '/json')).json();
    if (targets.find(t => t.type === 'page')) break;
  } catch {}
}
const pg = targets && targets.find(t => t.type === 'page');
if (!pg) {
  fs.writeFileSync(out, 'NO PAGE\n');
  chrome.kill();
  process.exit(1);
}
const ws = new WebSocket(pg.webSocketDebuggerUrl);
let id = 0;
const pend = {};
const cons = [];
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
  if (m.method === 'Runtime.exceptionThrown') cons.push(String(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 300));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300));
});
await new Promise(r => ws.addEventListener('open', r, {once: true}));
const send = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({id, method, params})); });
await send('Runtime.enable');
await send('Page.enable');
await send('Page.navigate', {url: 'http://127.0.0.1:8765/' + page});
const t0 = Date.now();
let log = '';
while (Date.now() - t0 < tmax) {
  await sl(250);
  const r = await send('Runtime.evaluate', {expression: 'document.body && (document.body.dataset.log || "")', returnByValue: true});
  log = r.result?.result?.value || '';
  if (log.includes('ERRS')) break;
}
const wall = Math.round((Date.now() - t0) / 1000);
fs.writeFileSync(out, (log || 'TIMEOUT') + '\nCDP ' + JSON.stringify(cons.slice(0, 8)) + '\nwall=' + wall + 's\n');
try { ws.close(); } catch {}
chrome.kill();
setTimeout(() => { try { fs.rmSync(prof, {recursive: true, force: true}); } catch {} process.exit(log.includes('FAIL ') || !log.includes('ERRS') ? 1 : 0); }, 200);
