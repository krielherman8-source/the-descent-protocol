/* THE DESCENT PROTOCOL — native-shell lifecycle (Capacitor WebView).
   The browser game is unchanged, except that hiding the page suspends Web Audio and
   showing it again resumes that context (iOS and Android suspend it themselves).
   Inside the Android/iOS app, backgrounding also pauses a live run and writes the
   same checkpoint Continue already uses. Safe-area insets are CSS variables in
   css/ui.css; index.html resize() reads them and is a no-op when they are 0. */
(function(){
function isNative(){try{return !!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform())}catch(e){return false}}
function audioSuspend(){const AU=window.AU;if(!AU||!AU.ctx||AU.ctx.state!=='running')return Promise.resolve();
 AU._shellWanted=true;return AU.ctx.suspend().catch(function(){})}
function audioResume(){const AU=window.AU;if(!AU||!AU.ctx||!AU._shellWanted||AU.ctx.state!=='suspended')return Promise.resolve();
 return AU.ctx.resume().then(function(){if(AU.ctx.state==='running')AU._shellWanted=false}).catch(function(){})}
function releaseInput(){try{window.TDP_INPUT&&TDP_INPUT.release&&TDP_INPUT.release()}catch(e){}
 try{if(window.mouse)mouse.down=false}catch(e){}
 try{if(window.keys){for(const k in keys)keys[k]=false}}catch(e){}}
function onBackground(opt){const native=opt&&typeof opt.native==='boolean'?opt.native:isNative();
 const p=audioSuspend();releaseInput();
 const S=window.S;
 if(native&&S&&!S.demo&&S.state==='play'&&typeof pauseGame==='function')pauseGame();
 if(native&&S&&!S.demo&&typeof saveGame==='function'&&window.S&&(S.state==='play'||S.state==='paused')){try{saveGame()}catch(e){}}
 return Promise.resolve(p).then(function(){const AU=window.AU;return{native:native,state:window.S&&S.state,audio:AU&&AU.ctx?AU.ctx.state:null}})}
function onForeground(opt){const native=opt&&typeof opt.native==='boolean'?opt.native:isNative();
 return Promise.resolve(audioResume()).then(function(){const AU=window.AU;return{native:native,state:window.S&&S.state,audio:AU&&AU.ctx?AU.ctx.state:null}})}
document.addEventListener('visibilitychange',function(){if(document.hidden)onBackground();else onForeground()});
function hookCap(){let App=null,SB=null;
 try{App=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App}catch(e){}
 try{SB=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.StatusBar}catch(e){}
 if(SB&&!SB.__tdp){SB.__tdp=true;try{SB.setOverlaysWebView({overlay:true})}catch(e){}try{SB.setBackgroundColor({color:'#020507'})}catch(e){}try{SB.hide()}catch(e){}}
 if(!App||App.__tdp)return !!App;
 App.__tdp=true;
 const add=function(ev,fn){try{App.addListener(ev,fn)}catch(e){}};
 add('pause',function(){onBackground({native:true})});
 add('resume',function(){onForeground({native:true})});
 add('appStateChange',function(s){if(s&&s.isActive)onForeground({native:true});else onBackground({native:true})});
 add('backButton',function(){try{
  const S=window.S;
  if(S&&S.state==='title'&&typeof menuDepth==='function'&&menuDepth()<=1&&App.exitApp){App.exitApp();return}
  if(typeof onKey==='function')onKey('escape');
 }catch(e){}});
 return true}
addEventListener('load',hookCap);
let n=0;const iv=setInterval(function(){if(hookCap()||++n>40)clearInterval(iv)},250);
window.TDP_SHELL={onBackground:onBackground,onForeground:onForeground,isNative:isNative,hookCap:hookCap};
})();
