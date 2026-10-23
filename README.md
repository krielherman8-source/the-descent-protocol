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
- **Gamepad:** left stick move, right stick aim (auto-fire), A use, X/Y weapon/drone, Start pause.
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
- **Save:** an automatic checkpoint each time you descend from an upgrade chamber stores the floor, loadout and stats. Continue resumes from it. Winning clears the save.
- **Audio:** a compressor and a brick-wall limiter on the master bus. Everything is procedural Web Audio, with no sample files:
  - Per-weapon SFX, plus explosions, hits, deaths, pickups, objective ticks, boss roars and UI sounds.
  - Generative dark-synth music. It starts as a drone pad, then bass, kick, hats and a lead layer in with combat density, peaking at full intensity during bosses.
- **Visuals:**
  - UnrealBloom on medium and high quality.
  - Screen shake, hit flashes and a red damage vignette.
  - Instanced gibs, plus blood and scorch decals.
  - Walls that block the camera's view of the player fade out.
  - Thick beams and lightning arcs.
  - Distinct models for Swarmer Prime (upright mantis with scythes and horn crown) and Brood Carrier (translucent amber sac with larvae).
  - A descent transition between floors.
- **Performance:** mesh pooling for enemies and bullets, instanced gibs and decals, a 2000-point particle cap and an enemy cap. Above 60 enemies, regular enemies stop casting shadows (about 30% fewer draw calls at 150).

## Arsenal
- **Weapons:** Kinetic Rifle, Pulse Shotgun, Flamethrower, Tesla Arc Cannon, Grenade Launcher, Needle Railgun, Bio-Harvester.
- **Mods:** Explosive Tips, Cryo Chamber, Vampiric Coil, EMP Converter. Each attaches to the equipped weapon.
- **Drones:** Aegis, Torchlet, Bastion, Needler, Harvestor, Specter.
- **Floors:** 30 in total, with bosses on 10 (Warden), 13 (Swarmer Prime), 20 (Colossus), 25 (Matriarch) and 30 (The Overmind, three phases).

## Balance (final pass)
Tuned with a killable scripted bot that also plays every objective (skill 1 and 0.6 = slower reactions, noisier aim, misses dodges).
- **Boss HP (base):** Warden 1700, Prime 4400, Colossus 6800, Matriarch 7400, Overmind 16000. Each is multiplied by 1+0.03 per floor. Enemy damage grows 2% per floor.
- **Explosive mod:** 0.12 s proc cooldown. Splash heals Vampiric at a third of the normal rate.
- **Hack terminals:** 70 px use radius, decay 0.25/s.
- The bot clears the full 30 floors at both skill levels. The Overmind takes 54-141 s at skill 0.8 and sometimes kills the bot.
