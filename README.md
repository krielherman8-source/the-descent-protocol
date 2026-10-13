# The Descent Protocol

An angled top-down 3D sci-fi swarm shooter. It is a single HTML file built with Three.js r160 and has no build step.

**Play:** https://krielherman8-source.github.io/the-descent-protocol/. To run it locally, serve the folder (`python3 -m http.server`) and open `index.html`.
Three.js and its postprocessing addons are vendored in `vendor/`. When you open the file straight from disk (`file://`), the import map falls back to the unpkg CDN.

## Controls
- WASD: move (screen-relative).
- Mouse: aim. Hold left click to fire.
- Hold E: interact.
- 1-7: switch weapon. Q: cycle drone.
- 1/2/3 or click: pick an upgrade card.
- Esc: pause, or go back in menus. R: restart after death.

## Features
- **Title screen:** Start, Continue, Settings, Controls, plus best-run stats.
- **Settings** (saved in localStorage):
  - Master, SFX and music volume.
  - Graphics quality: low (no bloom or shadows), medium (bloom, 1024 shadows), high (bloom, 2048 shadows, HiDPI).
  - Screen shake toggle.
- **Save:** an automatic checkpoint each time you descend from an upgrade chamber stores the floor, loadout and stats. Continue resumes from it. Winning clears the save.
- **Audio:** everything is procedural Web Audio, with no sample files:
  - Per-weapon SFX, plus explosions, hits, deaths, pickups, objective ticks, boss roars and UI sounds.
  - Generative dark-synth music. It starts as a drone pad, then bass, kick, hats and a lead layer in with combat density, peaking at full intensity during bosses.
- **Visuals:**
  - UnrealBloom on medium and high quality.
  - Screen shake, hit flashes and a red damage vignette.
  - Instanced gibs, plus blood and scorch decals.
  - Walls that block the camera's view of the player fade out.
  - Thick beams and lightning arcs.
  - Unique models for Swarmer Prime (scythe arms, crest) and Brood Carrier (glowing egg sac).
  - A descent transition between floors.
- **Performance:** mesh pooling for enemies and bullets, instanced gibs and decals, a 2000-point particle cap and a 110-enemy cap.

## Arsenal
- **Weapons:** Kinetic Rifle, Pulse Shotgun, Flamethrower, Tesla Arc Cannon, Grenade Launcher, Needle Railgun, Bio-Harvester.
- **Mods:** Explosive Tips, Cryo Chamber, Vampiric Coil, EMP Converter. Each attaches to the equipped weapon.
- **Drones:** Aegis, Torchlet, Bastion, Needler, Harvestor, Specter.
- **Floors:** 30 in total, with bosses on 10 (Warden), 13 (Swarmer Prime), 20 (Colossus), 25 (Matriarch) and 30 (The Overmind, three phases).

## Balance (Stage 3)
Values were tuned with a scripted bot. It uses only the rifle, kites, dodges and can be killed.
- **Boss HP (base):** Warden 1700, Prime 4400, Colossus 5600, Matriarch 6200, Overmind 5500. Each is multiplied by 1+0.03 per floor.
- **Waves:** growth is capped (6 steps, or 3 on survive floors) and halved while a boss is alive. The spawn interval floor is 75% of the floor's base interval.
- **Survive floors:** floor 14 is 45 s, floor 28 is 50 s.
- **Railgun:** 58 damage at 1.0/s. **Grenade:** 16 direct plus 42 splash, radius 85.
