// Offline audio mix capture: #scene=menu|combat|boss&duck=0|1
(async()=>{const L=[];const w=ms=>new Promise(r=>setTimeout(r,ms));try{
const H=Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map(a=>a.split('=')));const DUR=+(H.dur||12),SR=44100;
let OC=null;window.AudioContext=function(){OC=new OfflineAudioContext(8,SR*DUR,SR);Object.defineProperty(OC,'state',{get:()=>'running'});OC.resume=()=>Promise.resolve();return OC};
while(!window.GAME_READY)await w(50);window.__pause=true;
const sc=H.scene||'combat';
if(sc==='menu'){goTitle()}else{newRun();S.god=true;S.floor=sc==='boss'?19:7;S.state='play';startFloor();const p=S.p;
 p.weapons=['kinetic','grenade_launcher','railgun'];
 if(sc==='combat'){S.enemies.length=0;for(let i=0;i<34;i++)spawnNear(['swarmer','runner','brute','spitter','exploder'][i%5],p.x+rnd(-420,420),p.y+rnd(-300,300),1,1)}}
AU.ctx=null;audioInit();if(H.duck==='0')AU.duckOff=true;AU.duckLog=[];
const c=OC,M=c.createChannelMerger(8);M.connect(c.destination);c.destination.channelInterpretation='discrete';
AU.out.disconnect();const tap=(node,ch)=>{const sp=c.createChannelSplitter(2);node.connect(sp);sp.connect(M,0,ch);sp.connect(M,1,ch+1)};
tap(AU.out,0);tap(AU.sfx,2);tap(AU.duck,4);tap(AU.master,6);
const STEP=.05;let fr=0;
for(let t=STEP;t<DUR-STEP;t+=STEP)c.suspend(t).then(()=>{if(S.state==='play'){const p=S.p;let best=null,bd=1e9;for(const e of S.enemies){const d=dist(e,p);if(d<bd){bd=d;best=e}}
   if(best){IN.aim=Math.atan2(best.y-p.y,best.x-p.x);IN.fire=true}else IN.fire=false;fr++;p.weapon=['kinetic','grenade_launcher','railgun'][Math.floor(fr/60)%3];IN.mx=Math.cos(fr*.02);IN.my=Math.sin(fr*.03)}
  for(let i=0;i<3;i++)update(1/60);if(sc==='menu'){S.t+=STEP}window.musicTick();c.resume()});
const buf=await c.startRendering();
const db=x=>x>0?(20*Math.log10(x)).toFixed(1):'-inf';const names=['out','sfx','music','master(pre-lim)'];const st={};
for(let b=0;b<4;b++){const a=buf.getChannelData(b*2),bb=buf.getChannelData(b*2+1);let pk=0,ss=0,clip=0;const win=Math.floor(SR*.4);let wmax=0,ws=0;
 for(let i=0;i<a.length;i++){const v=Math.max(Math.abs(a[i]),Math.abs(bb[i]));if(v>pk)pk=v;if(v>=1)clip++;const q=(a[i]*a[i]+bb[i]*bb[i])/2;ss+=q;ws+=q;if(i>=win){const o=buf.getChannelData(b*2)[i-win],o2=bb[i-win];ws-=(o*o+o2*o2)/2}if(i%512==0&&i>=win)wmax=Math.max(wmax,Math.sqrt(Math.max(0,ws)/win))}
 st[names[b]]={peak:db(pk),rms:db(Math.sqrt(ss/a.length)),rms400max:db(wmax),clip:(clip/a.length*100).toFixed(3)+'%'}}
// ducking: music RMS 50-250ms after each duck trigger vs 300-100ms before
const mu=buf.getChannelData(4),rm=(t0,t1)=>{let s=0,n=0;for(let i=Math.max(0,Math.floor(t0*SR));i<Math.min(mu.length,Math.floor(t1*SR));i++){s+=mu[i]*mu[i];n++}return Math.sqrt(s/(n||1))};
let dsum=0,dn=0;for(const t of AU.duckLog.slice(0,60)){if(t<.4||t>DUR-.3)continue;const a=rm(t-.3,t-.05),b=rm(t+.05,t+.25);if(a>1e-4){dsum+=20*Math.log10((b+1e-9)/a);dn++}}
L.push(`SCENE ${sc} duck=${H.duck!=='0'} enemies=${S.enemies.length} state=${S.state} `+JSON.stringify(st)+` duckEvents=${AU.duckLog.length} musicDeltaAfterBigSfx=${dn?(dsum/dn).toFixed(1)+'dB':'n/a'}`);
}catch(e){L.push('EXC '+e.message+' '+e.stack)}L.push('ERRS '+JSON.stringify(window.ERRS||[]));document.body.dataset.log=L.join('\n')})();
