# The Descent Protocol

An angled top-down 3D sci-fi swarm shooter. It is built with Three.js r160 and has no build step: `index.html` plus a few classic scripts in `js/` (story, input, minimap) and `css/ui.css`.

**Run:** serve the folder (`python3 -m http.server`) and open `index.html`.
Three.js and its postprocessing addons are vendored in `vendor/`. When you open the file straight from disk (`file://`), the import map falls back to the unpkg CDN. Served over http(s), including GitHub Pages and the phone apps, the page uses only the local `vendor/` copies.

**Phone and tablet apps:** the same page is wrapped with [Capacitor](https://capacitorjs.com/) (a native WebView). Gameplay, visuals, touch controls, auto-interact, saves and weapon mastery are the web game, not a port. Android and iOS build steps, the provisional bundle id, and what was actually compiled are in `mobile/README.md`. This repository stays the public browser build: GitHub Pages serves `/` from `main`.

## Controls
These are the defaults. Every keyboard key and gamepad button can be changed in **Settings → Controls & rebinding**, and all prompts, HUD hints and the Controls screen show your current keys.
- W A S D: move (screen-relative).
- Mouse: aim. Hold left click (or F) to fire.
- Hold E: interact. You can switch this to Toggle (press once to start, press again to stop) or Auto (just stand on the object; E still works).
- 1-7: pick a weapon slot. Z / X: previous / next weapon. Q: cycle drone.
- 1/2/3 or click: pick an upgrade card.
- P: pause. Esc always pauses and goes back in menus, and can't be rebound. R: restart after death.
- **Gamepad** (standard mapping): left stick/d-pad move, right stick aim (pushing it fires), RT fire, A use, LB/RB switch weapon, Y cycle drone, Start pause, B back. Every button except the d-pad can be remapped.
- **Touch** (auto-detected, or `?touch=1`): floating left stick to move, right stick to aim and fire, plus USE/WPN/DRN/pause buttons.

## Features
- **Story:** intro crawl, an ending crawl after the Overmind, and a Credits screen.
- **Tutorial:** a 5-step guided floor 1 (adapts its prompts to keyboard, gamepad or touch).
- **Difficulty:** Easy / Normal / Hard on the title screen.
- **Navigation:** minimap plus off-screen objective arrows. Enemies drop health pickups.
- **Title screen:** Start, Continue, Settings, Controls, plus best-run stats.
- **Settings** (saved in localStorage):
  - Master, SFX and music volume.
  - Graphics quality: low (no bloom or shadows), medium (bloom, 1024 shadows), high (bloom, 2048 shadows, HiDPI).
  - Screen shake toggle.
  - **Controls & rebinding** screen. Keyboard: move, fire, interact, drone, previous/next weapon, weapon slots 1-7, pause and restart. Click an action, then press a key. If the key is already used, the two actions swap. Esc cancels, and Reset keys restores the defaults.
  - Gamepad remapping on the same screen: fire, use, previous/next weapon, drone, pause and back. Click an action, then press a pad button. Conflicts swap here too, and Reset pad restores the defaults.
  - Interact mode: Hold, Toggle or Auto (default on phones and tablets; the USE button is dimmed). In Auto, exits need a short ~0.4 s stand; upgrade cards still need a tap. Auto-fire: on or off (fires all the time at the aim point).
  - Settings are versioned (`v: 4`). Older saves are upgraded on load, and missing or corrupt values fall back to the defaults.
  - Colourblind markers: shape glyphs (not just colour) on objectives, minimap and edge arrows.
- **Health drops:** green +HP crosses pulse with a ground glow and fly to you within ~120 px when you're hurt. Each floor starts with 2 medkits near the spawn (1 from F11). Kill drop chance is 5% (10% under 50% HP), doubled for Brutes/Brood Carriers (which drop a big +35), scaled ×1.6 on F1–5 and ×1.3 on F6–15. A pity drop is guaranteed after 7/10/14 kills without one (early/mid/late) while under 50% HP. Bosses drop 4 big kits. Heal is about 22 HP (25 on F1–5); Easy gets more drops and slightly bigger heals, Hard fewer (difficulty heal ×1.6 / ×1 / ×0.55).
- **Gravity well (Mag-lock floors):** the pull only acts within 400 px, at 40% of your move speed at the edge rising to 60% at the core (always escapable, frame-rate independent), and fades in over the first 3 s. Aliens are not pulled. The core does 8 HP/s on Normal (time-based) with a pulsing red core, a red vignette, an on-screen warning and a warning tone. You always spawn outside the pull radius. Test: `tests/gw.js` (60 and 144 fps).
- **Stats screen** on death and victory: run totals, kills by enemy type, time-per-floor chart (boss floors and deaths marked), probable cause of death.
- **Save:** an automatic checkpoint each time you descend from an upgrade chamber stores the floor, loadout (including per-weapon mastery) and stats. Continue resumes from it. Winning clears the save. The Android/iOS wrapper also writes that same checkpoint when the app is backgrounded during play.
- **App lifecycle:** inside the native wrapper, backgrounding pauses a live run, drops stuck touch/fire input and suspends Web Audio. Returning resumes the audio context and leaves the pause menu up until you press Resume. A browser tab hide only suspends and restores audio; it does not pause the run. The Android back button acts as Esc (pause, back through menus). On the title screen it leaves the app.
- **Audio:** a compressor and a brick-wall limiter on the master bus. Everything is procedural Web Audio, with no sample files:
  - Per-weapon SFX, plus explosions, hits, deaths, pickups, objective ticks, boss roars and UI sounds.
  - Generative dark-synth music. It starts as a drone pad, then bass, kick, hats and a lead layer in with combat density, peaking at full intensity during bosses.
- **Visuals:**
  - UnrealBloom on medium and high quality.
  - Screen shake, hit flashes and a red damage vignette.
  - Low-health warning below 30% HP: pulsing red vignette, heartbeat SFX (faster below 15%) and a HUD hint.
  - Instanced gibs, plus blood and scorch decals.
  - Walls that block the camera's view of the player fade out.
  - Thick beams and lightning arcs.
  - Distinct models for Swarmer Prime (upright mantis with scythes and horn crown) and Brood Carrier (translucent amber sac with larvae).
  - A descent transition between floors.
- **Performance:** enemy bodies are instanced/merged per type (js/instancing.js): about 154 draw calls at 150 enemies, down from 1343. A fixed point-light budget (zero-intensity dummy lights) plus a per-floor pre-warm render stops shader recompiles mid-floor. Also mesh pooling for enemies and bullets, instanced gibs and decals, a 2000-point particle cap and an enemy cap. Above 60 enemies, regular enemies stop casting shadows (about 30% fewer draw calls at 150).

## Arsenal
- **Weapons:** Kinetic Rifle, Pulse Shotgun, Flamethrower, Tesla Arc Cannon, Grenade Launcher, Needle Railgun, Bio-Harvester.
- **Mods:** Explosive Tips, Cryo Chamber, Vampiric Coil, EMP Converter. Each attaches to the equipped weapon.
- **Drones:** Aegis, Torchlet, Bastion, Needler, Harvestor, Specter.
- **Floors:** 30 in total, with bosses on 10 (Warden), 13 (Swarmer Prime), 20 (Colossus), 25 (Matriarch) and 30 (The Overmind, three phases). Each floor opens with a briefing card (name, why you are here, the concrete goal). It fades on its own, or on a tap or key, and play is not paused. The HUD states that goal with a count. When the job is done, a line ties it back to the reason. Endless regular floors reuse the template's reason. An endless boss uses that boss's reason (the returning Warden is not the keycard errand). The full list is in `game_concept.txt`.

## Balance (final pass)
Tuned with a killable scripted bot that also plays every objective (skill 1 and 0.6 = slower reactions, noisier aim, misses dodges).
- **Boss HP (base):** Warden 1450, Prime 4400, Colossus 6800, Matriarch 7400, Overmind 16000. Each is multiplied by 1+0.015 per floor. Enemy HP grows 5.5% per floor, enemy damage 1% per floor and wave count 1.25% per floor (these per-floor rates were halved on 2026-11-04), before difficulty multipliers.
- **Weapon mastery:** kills are counted per weapon. Every 30 kills with a weapon raises that weapon one level, capped at 30. Each level is +2% fire rate for that weapon only (+60% at level 30). The HUD shows `Lv N` on the equipped weapon, and a level-up float reads `NAME LV N · +N×2% FIRE RATE`. Mastery is stored on the player (`wxp`) and comes back with Continue. It replaced the earlier per-floor fire-rate bonus.
- **Explosive mod:** 0.12 s proc cooldown. Splash heals Vampiric at a third of the normal rate.
- **Hack terminals:** 70 px use radius, decay 0.2/s; the alarm summons 3 swarmers.
- **Weapons:** Railgun 70 dmg / 1.15 shots/s; Tesla range 390, chain falloff 0.78.
- **F17 escort:** ambushes 3 + floor/6, the payload only stops when 3+ bugs contest it, waves of 7 (+3) every 8 s.
- **F18 cells:** seat spawns 1 + floor/8 from the arena edge (never on the player), 1.25x fire delay while carrying, a warden elite at 45 s.
- The bot clears the full 30 floors at both skill levels. The Overmind takes 54-141 s at skill 0.8 and sometimes kills the bot.
- **Difficulty:** Easy hp .75 / dmg .6 / count .8; Hard hp 1.3 / dmg 1.5 / count 1.2 / heal .55 / boss 1.25. Live-enemy cap 24 + 0.35 per floor (× difficulty count).
- Bot audit (Oct 2026): 2 runs per difficulty, all reach floor 30. Easy has few deaths and Hard has several.

## Endless Descent (post-game)
- **Unlock:** beat F30 (the Overmind) on any difficulty. The unlock is saved in the versioned settings (older saves migrate; a save that already has a win is unlocked retroactively). Until then the title shows a locked **ENDLESS** button with a hint.
- **Two ways in:** on the victory screen press **CONTINUE INTO ENDLESS** (`E` / pad X) to carry the current run into F31, or press **ENDLESS** on the title for a fresh run that starts with a 29-pick loadout draft (one pick per chamber of a full run), then F31.
- **Floors 31+:** every regular objective comes back in a seeded shuffled rotation (the seed is saved with the run). The HUD reads `ENDLESS F34: <name>`. Every 5th floor (F35, F40, …) is a boss: each block of 5 boss floors uses Warden, Prime, Colossus, Matriarch and Overmind once each in shuffled order, with no back-to-back repeat.
- **Scaling:** on top of the normal per-floor curve, each endless floor multiplies enemy HP by 1.08, enemy damage by 1.04, enemy count by 1.03 and boss HP by 1.06. At F40 the endless-only multipliers are HP ×2.16, damage ×1.48, count ×1.34 and boss HP ×1.79. Including the halved base curve, F40 HP is ×2.62 over F30. Boss HP weights are Warden 3, Prime 1.1, Colossus 1, Matriarch 1, Overmind 0.7, so the cheap early bosses stay a threat. The live-enemy cap keeps the 24 + 0.35/floor formula but is clamped to **56** on every difficulty.
- **Upgrades:** chambers keep offering normal upgrades, plus four stacking endless upgrades: **Overclock Core** (+10% damage, +6% fire rate), **Nanite Weave** (+20 max HP, repair 40), **Ablative Plating** (−8% damage taken, down to −50%) and **Swarm Link** (+20% drone power, +6% move speed). Stacks show as roman numerals.
- **Records:** best endless floor and time (time counted from F31) are kept per difficulty and shown on the title and the stats screen. A deeper floor wins; on the same floor a faster time wins. Endless deaths never touch the F1–30 records.
- **Checkpoint:** endless runs save at every floor like normal runs. **Continue** resumes the endless floor with its seed and rotation. Corrupt endless saves are rejected.
- **Tests and results (Oct 2026):** `st.js` covers unlock, migration, rotation, scaling, cap, upgrades, records, checkpoint and draft (135 PASS at the time; the three Endless expectations that still used the pre-halving floor curve, `.11` HP, `.025` count and `.03` boss HP, were updated to `.055`, `.0125` and `.015`). A Nov 2026 headless rerun of `st.js` is 144 PASS. The bot on Normal clears F31–40 with no errors. Carried builds take 0 deaths. Drafted builds take 0–7 deaths, mostly on F34–39 hold/escort/cells floors, with no timeouts. One carried build went to F60 with 4 deaths (`tests/bot_endless_deep.txt`). The leak harness over F31–40 (`tests/leak_results/endless*.txt`) gives geometries 373–554 (mostly 410–480), heap 14.3–20.4 MB, 16–32 live audio nodes, 57 listeners, 1 interval and 1 rAF. All are flat, with no errors.
- **Harness flags:** `bot.js#endless=10` continues after the F30 victory for 10 endless floors. `bot.js#from=30&to=39` starts from the title Endless draft. `ENDLESS=1 tests/leakrun.sh TAG` adds the endless scenario (`ONLY_ENDLESS=1` runs it alone; `leak.html#sc=endless&floors=15`). `ONLY=endless node tests/shots.mjs` captures the endless screenshots (`screens_final2/19_*`–`22_*`).

## Tests (`tests/`)
Headless Chrome harness pages. `mk.py X.js X.html` inlines a test into a copy of index.html, and `run.sh page#hash budget` runs it with virtual time and prints the log. `node tests/realtime.mjs page out.txt seconds` drives the same page in real time (needed for Web Audio; virtual time does not run it).
- `sm.js` smoke-tests floors 16-30. `ui.js` covers menus, tutorial, touch, pad and ending. `st.js` covers keyboard and gamepad rebinding, hold/toggle/auto interact, auto-fire, binding-aware prompts, settings migration, colourblind and Endless. `mob.js` covers weapon mastery, the checkpoint round-trip, and background/resume for the browser and the native shell. `brief.js` checks that every floor has a reason, a goal and a completion line, and that the briefing and HUD say them. `ex.js` checks exit reachability.
- `perf.js` reports draw calls and hitches. `hc.js` probes shader compiles. `bot.js` is the full-run bot (`#runs=1&diff=hard`).
- `au.js` + `aurun.sh` do the offline audio level render (real-time CDP via `cdp2.mjs`, because OfflineAudioContext cannot run under virtual time).
- `suite.sh` runs the whole suite. `leak.js` + `leak.mjs` + `leakrun.sh` are the long-session leak harness (see Stability).

## Stability (long-session leak pass, Oct 2026)
Measured with `tests/leak.js` in real-time headless Chrome (`--enable-precise-memory-info --js-flags=--expose-gc`, GC before every sample). The bot plays a 30-floor Normal run (`sc=full`), and a cycle run (`sc=cycle`) repeats death→Restart, death→title→Continue and pause→Save&Quit→Start 6×. Raw logs are in `tests/leak_results/`.

| Floor | geometries before → after | textures | heap MB before → after | scene objects before → after | live audio nodes before → after | listeners |
|---|---|---|---|---|---|---|
| F1  | 378 → 363 | 15 → 15 | 12.4 → 13.8 | 183 → 183 | 12 → 16 | 35 → 35 |
| F5  | 476 → 392 | 15 → 15 | 16.7 → 17.7 | 239 → 222 | 18 → 23 | 35 → 35 |
| F10 | 629 → 456 | 15 → 15 | 16.4 → 19.0 | 319 → 343 | 12 → 21 | 35 → 35 |
| F20 | 830 → 457 | 15 → 15 | 18.9 → 29.9* | 449 → 370 | 12 → 22 | 35 → 35 |
| F30 | 1153 → 468 | 15 → 15 | 21.7 → 21.7 | 740 → 443 | 12 → 23 | 35 → 35 |

\* Transient spike on the Colossus floor; F21 reads 22.9 MB. Geometry counts spike on content-heavy floors (F19 is about 630), then fall back. Heap F5→F30 is +4 MB. A heap-snapshot diff puts about 1.1 MB of that in JIT code; the rest is the larger late-floor levels and their capped pools (+430 Mesh objects). After returning to the title it is 20.2 MB, and the cycle run stays flat. Audio nodes are one-shot SFX still playing when the sample is taken, so they vary and do not accumulate.

Cycle run (6 cycles): before, geometries went 364 → 1548, listeners 35 → 47 and heap 15 → 20.5 MB. After, geometries settle at about 404 and the heap at about 17 MB from cycle 2 onward. Listeners step 35 → 37 once and then stay flat. There is 1 interval, 1 rAF per frame and 0 stray timeouts. The small early rise comes from bounded caches warming up (gun models ≤7, drone models ≤6, emissive material cache keyed by content colour).

**Fixed:**
- Floor geometry and materials were never disposed on level change.
- Overflow and non-pooled entity meshes were removed from the scene but not disposed.
- Entity mesh pools grew without limit. They are now trimmed to 24 per type on every floor, and boss pools to 0.
- Swapping gun or drone models rebuilt them every time. They are now cached.
- The objective emissive pulse created a new cached material for every intensity value. It is now quantized to 0.05.
- The intro crawl added 2 listeners on every start.
- The `fxSet` instanced mesh was replaced without being disposed.
- Shared resources are now in a `KEEP` set so disposal never touches them. The old floor is disposed one frame after the new floor has rendered, so shared shader programs are not recompiled.

**Run it:** `tests/leakrun.sh TAG` runs both scenarios in parallel. It takes about 4 min, so run it in the background. Output goes to `/tmp/leak/TAG_full.txt`, `TAG_cycle.txt` and `TAG_summary.txt`. A single run: `node --experimental-websocket tests/leak.mjs 'leak.html#sc=full&diff=normal&cap=300&deaths=3' out.txt 40`. Add `&snap=after-floor@5,after-floor@30` to write heap snapshots to `/tmp/leak/`, then compare them with `python3 tests/heapdiff.py a.heapsnapshot b.heapsnapshot`. Add `&pn=1` to log live shader programs. `python3 tests/leaksum.py file…` prints the table.

## Graphics

Settings → Graphics Quality: **Low / Medium / High** (default High; `?gfx=low|med|high` URL override for benchmarking, not saved).

| | Low | Medium | High |
|---|---|---|---|
| Floor/wall/top textures | flat colour (original) | procedural PBR (colour + normal + roughness) | same |
| Boundary props (pipes, consoles, crates, barrels — instanced) | – | yes | yes |
| Player flashlight (SpotLight) | – | yes | yes, with 1024px shadow map |
| Colour grade, vignette, film grain, chromatic aberration + red edge on damage | – | yes | yes |
| Splat-shaped blood/acid decals | – | yes | yes |
| Brighter fill/sun/lamps (+30% exposure; dark-sector floors unchanged), textured pillar tops | – | yes | yes |
| Enemy death dissolve (instanced shrink/sink with white glow, cap 60) and explosion shockwave ring | – | yes | yes |
| Creature detail (bent jointed legs, carapace ridges, spines, mandibles, antennae, chitin texture, brute shell plates) and marine kit (pauldrons, backpack, antenna, knee pads) | – | yes* | yes* |

\*Creature/marine models are built at start-up; changing quality applies to them after a reload.

All levels: ACES filmic tone mapping, muzzle-flash light, tracers, impact sparks, gibs, enemy hit flash. Point-light budget stays 6.

Measured draw calls with ~145–148 enemies (headless SwiftShader perf harness, `?gfx=`): **Low 114, Medium 168, High 176** (High adds the flashlight shadow pass).

Leak pass after the visual upgrade (Nov 2026, `tests/leakrun.sh`): geometries ~500 and textures 24 at steady state (was ~404 and 15; the difference is the fixed set of HQ textures/props/creature parts built once), flat across 6 cycles (c3–c5 502–505); heap F30 21.8 MB (was 21.7), title after run 21.8 MB; listeners flat.

Credits: every texture, model and effect is generated procedurally in code (`js/visuals.js`, `index.html`) on top of Three.js r160 (MIT, bundled in `vendor/`). No external art assets. Before/after screenshots: `screens_visual/`, regenerate with `node --experimental-websocket tests/vshots.mjs <prefix> screens_visual/`.
