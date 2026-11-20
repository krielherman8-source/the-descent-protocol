/* THE DESCENT PROTOCOL — story text, credits and the crawl overlay (classic script; exposes window.TDP_STORY). */
(function(){
const INTRO=[
 '<h1>THE DESCENT PROTOCOL</h1>',
 'Deep Site KESTREL-9 went silent forty-one hours ago.',
 'Thirty levels below the ice, the research consortium was growing something they called <b>the Overmind</b>: a hive intelligence meant to run the facility on its own.',
 'It worked too well. The swarm it bred has taken every floor, and the core has started reaching up toward the surface.',
 'There is one emergency order left on the books.',
 '<b>THE DESCENT PROTOCOL.</b>',
 'One operator goes down floor by floor. Restore what can be restored, burn out what cannot, and stop the Overmind at the bottom.',
 'You are that operator. Nobody else is coming down with you.',
 '<i>Descent authorised. Good luck.</i>'];
const ENDING=[
 '<h1>CORE SILENCED</h1>',
 'The Overmind breaks apart into ash and light. On every floor above you, the swarm stops moving at the same moment.',
 'For the first time in forty-one hours, KESTREL-9 is quiet.',
 'The extraction lift climbs past thirty floors of wreckage. The lights you restored are still burning.',
 'Up on the surface, the consortium is already drafting the report. You will not be in it.',
 'Then a single line scrolls across the lift console:',
 '<b>SIGNAL DETECTED — DEEP SITE KESTREL-10</b>',
 '<i>The protocol is never really over.</i>'];
const CREDITS=[
 ['THE DESCENT PROTOCOL',''],
 ['Game design & direction','Granite'],
 ['Programming, art & audio','Built with Grok Bot for Granite'],
 ['Engine','three.js r160 (MIT) · Web Audio API'],
 ['Rendering','UnrealBloomPass · EffectComposer (three.js addons)'],
 ['Music & SFX','Procedurally synthesised at runtime — no samples'],
 ['Models','Procedural primitives — no external assets'],
 ['Playtesting','The audit bot (died many, many times)'],
 ['','© All rights reserved. See LICENSE.']];
function crawl(lines,opt){opt=opt||{};let el=document.getElementById('crawl');if(!el){el=document.createElement('div');el.id='crawl';document.body.appendChild(el)}
 el.innerHTML='<div class="cr-mask"><div class="cr-in">'+lines.map(l=>l.startsWith('<h1>')?l:'<p>'+l+'</p>').join('')+(opt.extra||'')+'</div></div><div class="cr-skip">'+(opt.hint||'Click / Space / tap to continue')+'</div>';
 el.className='on'+(opt.cls?' '+opt.cls:'');const inner=el.querySelector(".cr-in");const dur=opt.dur||(lines.length*3.2+4);
 inner.style.animation='none';void inner.offsetWidth;inner.style.animation=`crawlUp ${dur}s linear forwards`;
 let done=false,t0=performance.now(),armed=false;setTimeout(()=>armed=true,400);
 const finish=()=>{if(done)return;done=true;el.className='';el.innerHTML='';removeEventListener('keydown',kh,true);el.removeEventListener('pointerdown',ph);clearTimeout(to);opt.onDone&&opt.onDone()};
 const kh=e=>{if(!armed)return;if(e.key===' '||e.key==='Enter'||e.key==='Escape'){e.stopPropagation();e.preventDefault();finish()}};
 const ph=e=>{e.stopPropagation();if(armed)finish()};
 addEventListener('keydown',kh,true);el.addEventListener('pointerdown',ph);if(!el._tdpStop){el._tdpStop=true;['mousedown','touchstart'].forEach(t=>el.addEventListener(t,e=>e.stopPropagation()))}/* once per element (was re-added on every crawl) */const to=setTimeout(finish,dur*1000+(opt.hold||2500));
 return{finish,active:()=>!done,elapsed:()=>(performance.now()-t0)/1000}}
function creditsHTML(){return CREDITS.map(([a,b])=>`<div class="cr-row"><span>${a}</span>${b?`<b>${b}</b>`:''}</div>`).join('')}
// One reason per campaign floor (index 0 = floor 1). Endless regular floors copy the template.
// why = why you are doing it, goal = the concrete job, clear = the line when that job is done.
const BRIEFS=[
 {why:'The lift is dead. Restart the generators to power it and descend.',goal:'Restore power to the lift',clear:'Lift powered. Clear a path, then take the exit.'},
 {why:'Security lockers hold a weapon and the key for the next lift. Search them.',goal:'Search the lockers',clear:'Locker opened. The way down is unlocked.'},
 {why:'Mag-locks are pinning the lift. Cut them, and stay out of the gravity well.',goal:'Disable the mag-locks',clear:'Locks released. The lift can drop. Leave the well.'},
 {why:'The lights are dead. Relay the beacons in order so the next shaft can see you.',goal:'Light the beacon relay',clear:'Relay lit. The dark sector is mapped. Head for the exit.'},
 {why:'Biomass is clogging the descent shaft. Burn it out or the lift cannot pass.',goal:'Burn the biomass',clear:'Shaft cleared. The biomass is ash. Reach the exit.'},
 {why:'Reactor terminals still hold the security bypass. Hack them before the floor seals.',goal:'Hack the reactor terminals',clear:'Bypass accepted. Security is open. Move to the exit.'},
 {why:'The air currents blow you off the catwalks. Seal each valve to stop one current.',goal:'Seal the vent valves',clear:'Airflow stopped. The catwalks are safe. Descend.'},
 {why:'Spore muck is eating the deck. Purge the nodes or the floor collapses under you.',goal:'Purge the spore nodes',clear:'Spores burned out. The deck will hold. Find the exit.'},
 {why:'The core nodes must come up together, or the reboot aborts and the lift stays dark.',goal:'Reboot every core node',clear:'Systems back online. The floor accepts the descent.'},
 {why:'Three keycards are sealed in cocoons. They open the security door, and whatever waits behind it.',goal:'Recover the keycards',clear:'The warden is down. The outpost door is yours.'},
 {why:'The central reactor is climbing. Hold the core ring until it stabilizes, or the shaft melts.',goal:'Stabilize the reactor',clear:'Reactor stable. The heat drops. Take the exit.'},
 {why:'These sacs hatch swarmers. Destroy them before they break open.',goal:'Destroy the egg sacs',clear:'Brood destroyed. Nothing left to hatch. Move on.'},
 {why:'An elite Swarmer Prime has sealed this deck. Kill it or the lockdown never lifts.',goal:'Kill the Swarmer Prime',clear:'Prime is down. Lockdown released. Reach the exit.'},
 {why:'The nest will not open the next hatch until you outlast the swarm.',goal:'Survive the nest',clear:'The swarm breaks. The hatch unlocks. Go.'},
 {why:'Frozen systems are locking the vault doors. Thaw them, and stay out of the frost.',goal:'Defrost the vault systems',clear:'Vault thawed. The doors cycle open. Descend.'},
 {why:'The lower decks are flooding. Restart the pumps or the lift drowns.',goal:'Restart the flood pumps',clear:'Pumps online. The water drops. Head down.'},
 {why:'The relay core has to reach the spire, or the floors below stay deaf to your signal.',goal:'Escort the relay to the spire',clear:'Relay seated. The spire is transmitting. Move out.'},
 {why:'The containment grid is dark. Carry the power cells to the socket before the labs spill.',goal:'Deliver the power cells',clear:'Grid powered. Containment holds. Leave the labs.'},
 {why:'The data core only boots if every node is live before the timer dies. Do it in the dark.',goal:'Reboot the data core',clear:'Core online. The archive answers. Continue down.'},
 {why:'The Colossus is the hive\'s gate. It has to fall before the tunnels let you through.',goal:'Slay the Hive Colossus',clear:'The gate-beast is dead. The hive opens. Go deeper.'},
 {why:'These tunnels breed the next wave. Burn the sacs before they hatch behind you.',goal:'Burn the brood sacs',clear:'Tunnels are quiet. The brood is ash. Press on.'},
 {why:'The spore field is seeding every deck above. Purge the nodes so the infection cannot climb.',goal:'Purge the spore field',clear:'Field sterilized. The spores stop rising. Descend.'},
 {why:'The lattice is the Overmind\'s nerves. Relay the beacons in order to blind the floors below.',goal:'Relay the neural beacons',clear:'Lattice blinded. It cannot see the next shaft. Move.'},
 {why:'Acid vents are eating the cistern lifts. Seal each valve to stop one flood current.',goal:'Seal the acid valves',clear:'Vents sealed. The acid settles. Take the lift.'},
 {why:'The Matriarch lays every sac you have burned. Kill her or the hive replaces itself.',goal:'Kill the Hive Matriarch',clear:'The mother is dead. The laying stops. Go to the core.'},
 {why:'Sappers are cracking the last coolant core. Hold them off until the seal finishes.',goal:'Defend the coolant core',clear:'Core sealed. Coolant holds. The breach is shut.'},
 {why:'The collapse locks are all that keep this deck from crushing the shaft.',goal:'Disable the collapse locks',clear:'Locks open. The deck holds long enough. Get to the exit.'},
 {why:'Something hunts in the dead dark. Live through it and the core airlock will cycle.',goal:'Hold out in the dark',clear:'You outlasted it. The airlock cycles. Go.'},
 {why:'The hive heart feeds the Overmind. Burn it out or the last floor never weakens.',goal:'Burn out the hive heart',clear:'The heart is cinders. The Overmind is alone. Descend.'},
 {why:'This is the mind that took Kestrel-9. Destroy it and the swarm above you dies with it.',goal:'Destroy the Overmind',clear:'The Overmind is silent. Reach extraction.'}
];
// Endless boss floors are not always the campaign floor of that boss (the Warden reuses the keycard deck).
const BOSS={
 warden:{why:'The Brood Warden is the hive\'s first gate. It will not let the shaft open while it lives.',goal:'Kill the Brood Warden',clear:'Warden down. This gate is open. Go deeper.'},
 prime:BRIEFS[12],
 colossus:BRIEFS[19],
 matriarch:BRIEFS[24],
 overmind:BRIEFS[29]
};
window.TDP_STORY={INTRO,ENDING,CREDITS,BRIEFS,BOSS,crawl,creditsHTML};
})();
