# The Descent Protocol

An angled top-down 3D sci-fi swarm shooter. It is built with Three.js r160 and has no build step: `index.html` plus a few classic scripts in `js/` (story, input, minimap) and `css/ui.css`.

**Run:** serve the folder (`python3 -m http.server`) and open `index.html`.
Three.js and its postprocessing addons are vendored in `vendor/`. When you open the file straight from disk (`file://`), the import map falls back to the unpkg CDN.

## Controls
- WASD: move (screen-relative).
- Mouse: aim. Hold left click to fire.
- Hold E: interact.
- 1-7: switch weapon. Q: cycle drone.
- 1/2/3 or click: pick an upgrade card.
- Esc: pause, or go back in menus. R: restart after death.
- **Gamepad:** left stick/d-pad move, right stick aim, RT/LT fire, A or X use, LB/RB switch weapon, Y cycle drone, Start pause, B back.
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
  - Key rebinding for move / interact / cycle-drone (conflicts swap, Esc cancels, Reset keys).
  - Colourblind markers: shape glyphs (not just colour) on objectives, minimap and edge arrows.
- **Stats screen** on death and victory: run totals, kills by enemy type, time-per-floor chart (boss floors and deaths marked), probable cause of death.
- **Save:** an automatic checkpoint each time you descend from an upgrade chamber stores the floor, loadout and stats. Continue resumes from it. Winning clears the save.
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
- **Floors:** 30 in total, with bosses on 10 (Warden), 13 (Swarmer Prime), 20 (Colossus), 25 (Matriarch) and 30 (The Overmind, three phases).

## Balance (final pass)
Tuned with a killable scripted bot that also plays every objective (skill 1 and 0.6 = slower reactions, noisier aim, misses dodges).
- **Boss HP (base):** Warden 1450, Prime 4400, Colossus 6800, Matriarch 7400, Overmind 16000. Each is multiplied by 1+0.03 per floor. Enemy damage grows 2% per floor.
- **Explosive mod:** 0.12 s proc cooldown. Splash heals Vampiric at a third of the normal rate.
- **Hack terminals:** 70 px use radius, decay 0.2/s; the alarm summons 3 swarmers.
- **Weapons:** Railgun 70 dmg / 1.15 shots/s; Tesla range 390, chain falloff 0.78.
- **F17 escort:** ambushes 3 + floor/6, the payload only stops when 3+ bugs contest it, waves of 7 (+3) every 8 s.
- **F18 cells:** seat spawns 1 + floor/8 from the arena edge (never on the player), 1.25x fire delay while carrying, a warden elite at 45 s.
- The bot clears the full 30 floors at both skill levels. The Overmind takes 54-141 s at skill 0.8 and sometimes kills the bot.
- **Difficulty:** Easy hp .75 / dmg .6 / count .8; Hard hp 1.3 / dmg 1.5 / count 1.2 / heal .55 / boss 1.25. Live-enemy cap 24 + 0.7 per floor (× difficulty count).
- Bot audit (Oct 2026): 2 runs per difficulty, all reach floor 30. Easy has few deaths and Hard has several.

## Tests (`tests/`)
Headless Chrome harness pages. `mk.py X.js X.html` inlines a test into a copy of index.html, and `run.sh page#hash budget` runs it with virtual time and prints the log.
- `sm.js` smoke-tests floors 16-30. `ui.js` covers menus, tutorial, touch, pad and ending. `st.js` covers rebinding and colourblind. `ex.js` checks exit reachability.
- `perf.js` reports draw calls and hitches. `hc.js` probes shader compiles. `bot.js` is the full-run bot (`#runs=1&diff=hard`).
- `au.js` + `aurun.sh` do the offline audio level render (real-time CDP via `cdp2.mjs`, because OfflineAudioContext cannot run under virtual time).
- `suite.sh` runs the whole suite.
