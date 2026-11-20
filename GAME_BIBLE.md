# THE DESCENT PROTOCOL — Game Bible

**Studio:** Infinity Gaming Studios  
**Game director:** Granite  
**Version of this document:** 1.0 (20 Nov 2026), written against the `build/apk-latest` branch (Android app 1.3)  
**Platforms:** Browser (live), Android APK (built), iPhone (goal, not yet built)

## How to read this document

Everything in this bible is one of two things:

- **BUILT** — it exists in the game today. I checked it against the code and the design doc (`game_concept.txt`, `README.md`, `js/` and `index.html`).
- **[PROPOSAL - needs Granite's approval]** — a new idea. Nothing tagged like this is built, promised or decided. Granite approves, changes or rejects each one.

A short glossary is at the end for any jargon.

---

## 1. Concept and pitch

### The one-line pitch
*One operator. Thirty floors. An alien hive that gets worse every step down.*

### The longer pitch (BUILT)
THE DESCENT PROTOCOL is an angled top-down 3D sci-fi swarm shooter. You look down at your operator from a tilted camera and fight huge crowds of aliens. Each of the 30 floors of Deep Site KESTREL-9 has a job you must finish, a crowd to survive and a way down. Between floors you pick one upgrade. Your guns get stronger the deeper you go, and the building itself changes from a clean lab into a living hive.

### Why it is fun (design pillars)
1. **Swarm power fantasy (BUILT).** Dozens of enemies at once, and your weapons chew through them: chain lightning, flames, grenades, needles.
2. **Every floor has a reason (BUILT).** The player is always told *why* they are doing the job (see section 3). Nobody is left wondering why they are switching on generators.
3. **Going down feels like going down (BUILT).** Floors look different, enemies change, weapons get better, bosses arrive on set floors.
4. **Short, clear choices (BUILT).** Three picture cards between floors. No menus to study.
5. **Play anywhere (BUILT / in progress).** Same game in the browser and on an Android phone, with touch controls made for thumbs. iPhone is the goal.

### Target player **[PROPOSAL - needs Granite's approval]**
Phone and browser players aged about 13+, who like Vampire-Survivors-style and twin-stick shooters, play in 10–20 minute sessions, and like short runs with a big finish.

---

## 2. Core loop

### The loop (BUILT, from the design doc)
Every floor repeats these steps:

1. **Arrive** on a new floor. A briefing card appears: floor name, *why* the job matters, and the goal.
2. **Do the job** (the floor objective): restore power, search lockers, burn biomass, and so on.
3. **Survive the swarm.** Enemies keep arriving in waves while you work.
4. **Clear the way.** Finish the objective; a line on screen confirms what it achieved.
5. **Take the exit.** On phones you stand on it for about 0.4 s (auto-use).
6. **Upgrade chamber.** Choose **1 of 3** picture cards.
7. **Descend** to the next floor. The game saves a checkpoint here.

### The loop at three time scales
| Scale | What the player does | What they feel |
|---|---|---|
| Seconds | Move, aim, fire, dodge, swap weapon | Fast and brutal |
| Minutes (one floor) | Brief, work the objective under pressure, exit, pick upgrade | Tension then relief |
| A whole run (30 floors) | Build a loadout, survive five bosses, reach the Overmind | Growth and dread |

### Helpers that keep the loop moving (BUILT)
- **Supply drop** when the player is struggling (section 6).
- **Health drops** from kills, plus 2 medkits near the spawn each floor (1 from floor 11).
- **Minimap and off-screen arrows** point at the objective.
- **Checkpoint save** each time you leave an upgrade chamber. *Continue* resumes from it.

### Modes
- **Campaign** — 30 floors (BUILT).
- **Endless Descent** — unlocks when you beat the Overmind on any difficulty. Floors 31+, a fresh loadout draft, a boss every 5 floors, stacking upgrades (BUILT, see section 6).
- **Difficulty** — Easy, Normal, Hard on the title screen (BUILT).

---

## 3. Mechanics and systems

### 3.1 Controls (BUILT)
- **Keyboard and mouse:** W A S D move, mouse aims, hold left click (or F) fires, E interacts, keys 1–7 pick a weapon, Z / X previous / next weapon, Q cycles drone, P pauses, Tab opens the loadout panel. All keys can be rebound in Settings.
- **Gamepad:** sticks to move and aim, trigger fires, bumpers swap weapons, Y cycles drone. Buttons can be remapped.
- **Touch (Android app and phones):** left thumb is a floating move stick, right thumb is the aim-and-fire stick.
  - There is **no USE button**: *auto-use* is forced on, so you just stand on an object or exit to use it. Exits need a short 0.4 s stand so you do not leave by accident.
  - **Two small icon chips** under the HUD show your weapon and drone. **Tap** a chip to open the loadout panel. **Hold for about half a second** to swap straight to the next weapon or drone.

### 3.2 Floor objectives and briefing cards (BUILT)
Each floor shows a **briefing card** at the start with three things: the floor name, a **why** line and a **goal** line. It fades by itself or on a tap or key, and it never pauses the fight. The HUD repeats the goal with a progress count. When the job is done, a line ties it back to the reason.

Objective types used across the 30 floors:

| Type | Floors | Example from the game |
|---|---|---|
| Activate / restore | 1, 4, 9, 11, 16, 19 | F1 *Restore power to the lift*: "The lift is dead. Restart the generators to power it and descend." |
| Search / collect | 2, 10 | F2 *Search the lockers*: "Security lockers hold a weapon and the key for the next lift." |
| Disable / seal | 3, 7, 24, 27 | F3 *Disable the mag-locks* (with a gravity well that pulls you in) |
| Burn / purge / destroy | 5, 8, 12, 21, 22, 29 | F5 *Burn the biomass*, F12 *Destroy the egg sacs* |
| Hack | 6 | F6 *Hack the reactor terminals* |
| Survive / defend | 14, 26, 28 | F14 *Survive the nest*, F26 *Defend the coolant core* |
| Escort / deliver | 17, 18 | F17 *Escort the relay to the spire* |
| Boss kill | 10, 13, 20, 25, 30 | Each boss floor has a boss reason |

The full list of all 30 (name, goal, reason, done-line) is in `game_concept.txt`; the same text lives in `js/story.js`.

### 3.3 Combat basics (BUILT)
- The player aims independently of movement. Walls block shots and line of sight.
- Enemies come in waves from set spawn points. Floors have walls, hazards and set pieces such as lasers or gravity wells.
- Damage numbers, hit flashes, screen shake (can be turned off), gibs and blood decals give feedback.
- A **low-health warning** below 30% HP: pulsing red edges, a heartbeat sound (faster below 15%) and a HUD hint.

### 3.4 Weapons (BUILT)
| Tier | Weapon | What it does |
|---|---|---|
| Basic | **Kinetic Rifle** | Accurate automatic rifle. The starting gun. |
| Basic | **Pulse Shotgun** | 7-pellet close-range blast |
| Basic | **Flamethrower** | Piercing flames, sets enemies on fire, double damage on biomass |
| Mid | **Grenade Launcher** | Lobbed grenades with a wide blast |
| Mid | **Bio-Harvester** | Leech beam that drains enemies and heals you |
| Top | **Tesla Arc Cannon** | Instant arc that chains through 5 targets |
| Top | **Needle Railgun** | Instant needle that pierces every enemy in a line |

**Weapons scale with depth** so a weak gun never turns up on a late floor:

| Floors | Basic | Mid | Top |
|---|---|---|---|
| 1–7 | 70% | 30% | 0% |
| 8–15 | 30% | 50% | 20% |
| 16–22 | 0% | 45% | 55% |
| 23–30 | 0% | 15% | 85% |

- **Mk level** (the grade of a weapon you find): **+2.5% damage for every floor of depth, capped at +100%.** A weapon found on floor 20 is a stronger copy of the same gun than one from floor 2.
- **Refit:** when you already own everything on offer, the card becomes a *Refit* that brings your **weakest gun** up to the current floor's Mk level.
- **Weapon mastery** (separate from Mk): every weapon gains a level per 30 kills, up to Lv 30, each level giving +2% fire rate. Mastery is saved with the run.

### 3.5 Mods (BUILT)
A mod attaches to one weapon and works on that weapon's hits.

| Mod | Effect |
|---|---|
| Explosive Tips | Hits can set off a small blast |
| Cryo Chamber | Hits chill enemies (50% slow for 2 s) |
| Vampiric Coil | Heal 6% of the damage you deal |
| EMP Converter | Hits can briefly stun enemies |

### 3.6 Drones (BUILT)
One drone is active at a time; you can own several and switch.

| Drone | Job |
|---|---|
| **Aegis** (default) | Orbits you, shoots the nearest enemy |
| **Torchlet** | Wide orbit that burns everything it touches |
| **Bastion** | Regenerating shield that blocks a hit, plus a knockback pulse |
| **Needler** | Piercing 3-needle bursts at the toughest nearby enemy |
| **Harvestor** | Kills drop bio-orbs; the drone collects them and heals you |
| **Specter** | Projects a decoy hologram that lures the swarm, then detonates |

### 3.7 Loadout panel (BUILT)
A panel listing your weapons (with Mk, Lv, mods) and drones, each with a picture. Open it with Tab (desktop) or by tapping a chip (phone). Close it with the X, a tap outside or Esc. **The game pauses while it is open.** It is smaller and has bigger touch targets on phones.

### 3.8 Upgrade chambers (BUILT)
After each floor you see **three picture cards**, built to give variety: one new weapon and one new drone while any remain, then a mod for your current weapon (about 45% of the time) or a stat upgrade. Stat upgrades are:

- +25% damage, +20% fire rate, +12% move speed, +25 max HP (and heal 25), +35% drone power, Multishot +1 (an extra projectile per shot), Full Repair.

### 3.9 Supply drop — the "you are struggling" helper (BUILT)
- Triggers after **60 seconds** on a floor, or **35 seconds when HP is below 35%**.
- The next kill drops a **gold crate** with a light beam and a "SUPPLY DROP" popup. The crate holds a weapon, mod or upgrade card and is picked up by walking over it.
- Crate lasts 30 s. Cooldown 60 s (20 s if the last crate expired). **At most 3 per floor.** No drops from bosses or after the objective is done.

### 3.10 Health and difficulty (BUILT)
- Kill drops: 5% chance (10% under 50% HP), double from Brutes and Brood Carriers, boosted on early floors, with a "pity" drop guaranteed after a streak of kills without one while hurt. Bosses drop 4 big kits.
- Difficulty multipliers: **Easy** (enemy HP ×0.75, damage ×0.6, 80% as many enemies, heals ×1.6), **Normal** (all ×1), **Hard** (HP ×1.3, damage ×1.5, 120% enemies, heals ×0.55).

### 3.11 Settings and accessibility (BUILT)
Master / SFX / music volume, graphics quality (Low: no bloom or shadows; Medium: bloom; High: bloom, sharper shadows and sharp screens), screen shake toggle, full rebinding, interact mode (Hold / Toggle / Auto), auto-fire, and colourblind shape markers on objectives, minimap and arrows. On phones, quality starts at Medium and the game lowers it by itself if it runs slowly.

### 3.12 Tutorial (BUILT)
A 5-step guided floor 1 that adapts to keyboard, gamepad or touch.

---

## 4. World and story

### Setting (BUILT, from the intro crawl)
**Deep Site KESTREL-9** went silent 41 hours ago. Thirty levels below the ice, a research consortium grew a hive intelligence called **the Overmind**, meant to run the facility by itself. It worked too well. Its swarm took every floor and the core has begun reaching toward the surface.

The only emergency order left is **THE DESCENT PROTOCOL**: one operator goes down floor by floor, restores what can be restored, burns out what cannot and stops the Overmind. *"Nobody else is coming down with you."*

### Ending (BUILT)
The Overmind breaks apart. On every floor above, the swarm stops at the same moment. The extraction lift climbs past thirty floors of wreckage, the lights you restored still burning. The consortium is already writing the report, and you will not be in it. Then the console shows: **SIGNAL DETECTED — DEEP SITE KESTREL-10.** *"The protocol is never really over."* This is a sequel hook.

### How the story is told (BUILT)
- Intro text crawl and ending crawl, plus a credits screen.
- **Floor briefings** carry the story during play. They quietly build a bigger picture: the lower you go, the more the objectives are about *stopping the hive from spreading up* (F22 "the spore field is seeding every deck above"), *blinding it* (F23 "the lattice is the Overmind's nerves") and *cutting off its source* (F25 Matriarch, F29 the Heart).
- A separate **intro video** was made with the Video Builder teammate. It is a polished cinematic opening, and its look was carried into the game's visuals (see section 7).

### The world by floor band (BUILT)
| Floors | Place | Feel |
|---|---|---|
| 1–7 | **Clean lab / working facility**: Breaching, Armory, Gravity Well, Dark Sector, Nesting Grounds, Security Network, Ventilation | A dead but orderly building. The first signs of the nest appear. |
| 8–15 | **Damaged facility**: Spore overgrowth, System Purge, Cocooned Outpost, Fusion Complex, Egg Chamber, Lockdown, Swarm Nest, Cryo Vault | Something is clearly living here |
| 16–23 | **Infested**: Pumpworks, Relay Spire, Quarantine Labs, Data Core, Hive Threshold, Brood Tunnels, Spore Fields, Neural Lattice | Tech is being eaten by the hive |
| 24–30 | **Hive**: Acid Cisterns, Brood Throne, Core Breach, Gravity Collapse, Dead Sector, The Heart, The Overmind | You are inside the creature |

### Lore expansion **[PROPOSAL - needs Granite's approval]**
Found audio logs and terminal notes (one short line each, two or three per band) telling who the consortium was, who the operator is, and what happened in the 41 hours. This adds story without slowing play. The operator currently has **no name or face**; giving one is a decision for Granite.

---

## 5. Characters and enemies

### The player (BUILT)
An unnamed **operator**. Starts with the Kinetic Rifle and the Aegis drone. Can carry several weapons and drones and swap freely. A named hero and a voice is a **[PROPOSAL - needs Granite's approval]**.

### Regular enemies (BUILT)
| Enemy | HP | Speed | Contact dmg | Behaviour |
|---|---|---|---|---|
| **Swarmer** | 20 | Medium (110) | 10 | The basic crowd. Chases you. |
| **Runner** | 12 | Very fast (185) | 6 | Fragile and quick, arrives first |
| **Brute** | 90 | Slow (62) | 25 | Tank. Chases and hits hard. |
| **Spitter** | 30 | Slow-medium (80) | 8 | Ranged. Shoots from a distance. |
| **Bloater** | 25 | Fast (135) | 30 | Runs at you and explodes |
| **Stalker** | 45 | Fast (150) | 18 | Cloaked and see-through, ambushes |
| **Leaper** | 40 | Medium (95) | 16 | Jumps at you from range |
| **Brood Carrier** | 140 | Slow (55) | 20 | Amber sac that splits into Mites when killed |
| **Mite** | 6 | Very fast (205) | 4 | Tiny swarm that spills from Carriers |

New enemy types arrive as you descend: floors 1–2 are mostly Swarmers, then Runners, Brutes, Spitters, Bloaters, Stalkers, Leapers and Carriers join, until the deep floors use the full mix.

### Bosses (BUILT)
| Floor | Boss | HP | What to expect |
|---|---|---|---|
| 10 | **Brood Warden** | 1,450 | Rings of shots, summons swarmers; enrages at half HP |
| 13 | **Swarmer Prime** | 4,400 | Upright mantis with scythes and a horn crown. Charges, summons, rings. Enrages at half HP. |
| 20 | **Hive Colossus** | 6,800 | The hive's gate. Huge and slow. Summons Leapers, Carriers, Stalkers. |
| 25 | **Hive Matriarch** | 7,400 | Mother of the brood. Summons Stalkers and Mites. |
| 30 | **The Overmind** | 16,000 | Stationary. **Three phases** (lasers online in phase 2, enraged in phase 3). Summons everything. |

(HP is before difficulty scaling.) A returning Brood Warden also appears as an Endless-mode boss.

### Allies **[PROPOSAL - needs Granite's approval]**
A voice on the radio, a handler at the surface named for a role not a person (for example "CONTROL"), who reads out the briefing lines. This reuses text that already exists, so it would be cheap to make.

Each enemy has its own colour (green Swarmer, orange Brute, purple Spitter, teal Stalker, amber Carrier, pink/red bosses) so players can read the crowd at a glance. Keep that.

---

## 6. Progression and economy

### What "progress" means (BUILT)
There is **no shop, currency or account**. Power comes from what you pick up during a run.

| Layer | How it grows | Where it lives |
|---|---|---|
| Floor | 1 → 30, checkpoint at each chamber | Save game |
| Loadout | New weapons, drones, mods from cards and crates | Run |
| Weapon Mk | +2.5% damage per floor depth, cap +100% | Run, shown on the HUD chip |
| Weapon mastery | +2% fire rate per level (30 kills each, max Lv 30) | Saved with the run |
| Stats | Damage, rate, speed, HP, drone power, multishot | Run |
| Best-run stats | Totals, kills by type, time per floor | Title screen / stats screen |

### Pacing of power (BUILT)
- Floors 1–7: mostly basic guns, learning the tools.
- Floors 8–15: mid-tier guns appear, first bosses.
- Floors 16–22: top-tier weapons become the majority.
- Floors 23–30: 85% of weapon offers are top-tier. The goal is that the last floors feel powerful but dangerous, not weak.

### Supply and health economy (BUILT)
Described in 3.9 and 3.10. These are the game's "safety net" so struggling players are helped instead of stuck.

### Endless Descent (BUILT)
Floors 31+, a boss every 5 floors, a fresh loadout draft. Reuses the floor reasons on rebuilt decks and offers **stacking upgrades**: Overclock Core (+10% damage and +6% fire rate), Nanite Weave (+20 max HP, repair 40), Ablative Plating (−8% damage taken, down to −50%) and Swarm Link (+20% drone power, +6% move speed). The best-run record is kept.

### Proposals for deeper progression **[PROPOSAL - needs Granite's approval]**
1. **Operator ranks** — a permanent XP bar across runs that unlocks *starting options*, not raw power (for example, begin with the Pulse Shotgun, or pick your drone). Keeps runs fair.
2. **Daily Descent** — one shared seed per day with its own best-floor leaderboard.
3. **Challenge modifiers** — optional "mutators" such as *No Medkits*, *Double Swarm*, *Glass Cannon* that give a score bonus.
4. **Achievements** — "Reach F10 without a supply drop", "Win with only the Kinetic Rifle" and so on.

---

## 7. Art and audio direction

### Camera and look (BUILT)
Angled top-down 3D, Three.js r160. All models are **procedural shapes** built from code (no imported art files), which keeps the download small and lets every enemy have a distinct silhouette.

### Lab to hive (BUILT)
The environment changes with depth through four bands:

1. **Floors 1–7 — clean lab:** cool white and blue, tidy, bright flashlight pools.
2. **Floors 8–15 — damaged facility:** scorch marks, sparks, flickering, dirtier textures.
3. **Floors 16–23 — infested:** biomass, webbing, red beacons, warm organic colour creeping in.
4. **Floors 24–30 — hive:** walls and floors grown over with flesh-like texture and heavy fog, dark and wet.

The change is gradual, not a switch, so the descent feels continuous.

### Post-processing and effects (BUILT)
- **Bloom** (glow on bright things), **colour grade**, **vignette** (darker edges) and **film grain**, carried over from the intro video's look.
- **Fog**, floating sparks and motes, red warning beacons.
- Screen shake, hit flashes, instanced gibs, blood and scorch decals, thick beams and lightning arcs.
- Walls between the camera and the player fade out so you never lose sight of yourself.
- A descent transition between floors.
- **Quality settings** (Low / Medium / High) and auto-lowering on slow phones.

### Picture cards (BUILT)
Choices in the upgrade chamber, supply crates and the loadout panel all have a picture: a 3D-model thumbnail for weapons and drones and a clean line icon for mods and stat upgrades.

### UI (BUILT)
Compact HUD for phones, with the HP and goal panel top-left. Objective markers use **shapes as well as colours** (colourblind-friendly).

### Audio (BUILT)
All sound is made live in the browser with the Web Audio API, with **no sound files**:
- Per-weapon sound effects, explosions, hits, enemy deaths, pickups, objective ticks, boss roars and UI sounds.
- **Generative dark-synth music:** it begins as a quiet drone, then bass, kick, hats and a lead layer fade in as combat gets busier, and peak at full intensity during bosses.
- A compressor and limiter keep the master volume safe.

### Direction going forward **[PROPOSAL - needs Granite's approval]**
- A **proper composed theme** for the title screen and ending (the live synth stays for gameplay).
- A **voice or radio line** for each briefing (see section 5).
- A **distinct "hero look"** for the operator, with 3–4 unlockable colour schemes.
- Keep the *procedural* approach for now. Hand-made 3D models would be a large cost and can wait for the Unity version.

---

## 8. Monetisation

**Nothing in this section is built. The game today is free to play with no ads, no purchases and no accounts. Every item below is [PROPOSAL - needs Granite's approval].**

### Principles **[PROPOSAL - needs Granite's approval]**
1. **Never pay-to-win.** Money must not buy damage, HP or better weapon drops.
2. **No ads in the middle of a fight.** The game is about tension; interruptions would damage it.
3. **Be clear and honest** about prices and what is bought.
4. **A fair free game** that people want to pay for, not one that nags.

### Options, simplest first **[PROPOSAL - needs Granite's approval]**
| Option | How it works | Pros | Cons |
|---|---|---|---|
| **A. Premium app** | One price (for example a small fixed fee) for Android and iPhone. The browser version stays free as a demo (floors 1–10). | Simple, no pressure on players, no ads | Fewer downloads |
| **B. Free + one unlock** | Free to floor 10 or 15, a single "Full Descent" purchase unlocks the rest, Endless and the Daily Descent | Players try before paying | Needs a paywall moment |
| **C. Cosmetics only** | Operator colour schemes, drone skins, weapon trails, bought with real money. Zero effect on power. | Fair, safe | Need enough art to sell |
| **D. Optional rewarded ads** | "Watch an ad to get one extra continue" or "an extra card reroll", only at chambers, never in combat | Income from free players | Ads may feel cheap, harder to approve |
| **E. Supporter pack** | One-off "Founder's Pack" with cosmetics and a credits line | Good for early fans | Small income |

### Recommendation **[PROPOSAL - needs Granite's approval]**
Start with **B (free to floor 10, one unlock) plus C (cosmetics)** after launch. Hold off on D until the game is proven; ads are hard to take back. Avoid loot boxes, energy timers and any paid power.

### What has to be decided before any money is taken
- Who legally sells the game (the studio needs a publisher identity; the app currently uses the placeholder id `app.provisional.thedescentprotocol`, which must be replaced).
- Store accounts: Google Play (one-time fee) and Apple Developer (yearly fee).
- Age rating: there is gore and alien violence, so expect a teen-type rating.
- Privacy policy and, if ads or analytics are used, consent screens.
- Tax and payout setup (see a professional; this bible does not give legal or tax advice).

---

## 9. Roadmap

### Done so far (BUILT)
| Milestone | Status |
|---|---|
| Core game: 30 floors, 5 bosses, 7 weapons, 4 mods, 6 drones, difficulty levels, save, Endless | Done |
| Intro video and its look carried into the game (bloom, grade, fog, vignette, grain) | Done |
| Weapons that scale with depth, plus Mk levels and Refits | Done |
| Supply drop for struggling players | Done |
| Floor briefing cards (the "why") | Done (in PR #2) |
| Loadout panel, picture cards, compact phone HUD | Done |
| Lab-to-hive environment progression | Done |
| Android APK 1.0 → 1.3 (touch controls, auto-use, icon chips) | Done (1.3 is latest) |

### Where the code lives today
- **Live site:** the `main` branch serves GitHub Pages. It does **not yet include** the newest work: Capacitor mobile wrapper (PR #1), briefings (PR #2) and the look pass, weapon tiers and supply drops (PR #3).
- **Most complete build:** branch `build/apk-latest`, which is main plus PRs #1–#3 and the 1.2 / 1.3 work. A playable copy is in `preview/` on main.
- **Going live** means merging that work into main, which updates the public site. Granite has not yet said "make it live".
- The repo is **public with Pages on, on purpose.** A private Unity version exists separately.

### Proposed phases **[PROPOSAL - needs Granite's approval]**
Dates are targets only and depend on testing and usage.

**Phase 1 — Go live and tidy (next)**
- Granite plays APK 1.3 and gives feedback on button feel and briefing clarity.
- Merge PRs #1–#3 / `build/apk-latest` into main so the public site gets everything.
- Small polish: make the Overmind more visible on floor 30, fix any remaining touch issues, update the README controls text (it still mentions the old USE / WPN / DRN buttons).

**Phase 2 — Android beta**
- Replace the placeholder bundle id with the studio's real one.
- Create a signed release build and a closed test on Google Play with a small group of friends.
- Add a basic crash and performance check on a few real phones (low, mid and high end).

**Phase 3 — Content pass**
- Audio logs and lore lines, a named operator, a radio handler.
- A composed title and ending theme.
- Balance pass: use stats from the stats screen to tune floors that kill players too often.
- Achievements and operator ranks.

**Phase 4 — iPhone**
- The iOS project already exists in `mobile/ios`, but **no iPhone build has been made** (Xcode needs a Mac).
- Needs a Mac, an Apple Developer account, a test device and TestFlight beta.

**Phase 5 — Launch and live service**
- Store pages, trailer (reuse the intro video), screenshots, privacy policy.
- Release on Google Play and the App Store; web version stays as a demo.
- Optional: Daily Descent and challenge modifiers after launch.

**Phase 6 — The Unity version**
- A private Unity version exists. Goal: move to Unity to get better phone performance, richer 3D art and native iOS and Android builds from one project.
- The decision to ship the web-wrapped game or the Unity one (or both) is for Granite. The bible suggests shipping the Capacitor version first, because it is playable now.

### Big decisions Granite must make **[PROPOSAL - needs Granite's approval]**
1. Go live now or wait?
2. Which monetisation option (section 8)?
3. Is Unity the long-term home, or a second product?
4. Name and look of the operator?

---

## Glossary

- **APK** — the file that installs an Android app.
- **Auto-use** — standing on an object or exit uses it, with no button press.
- **Bloom** — a glow around bright things.
- **Boss** — a big enemy with its own pattern, on floors 10, 13, 20, 25 and 30.
- **Capacitor** — a tool that wraps a web game into a phone app.
- **Checkpoint** — an automatic save when you leave an upgrade chamber.
- **Endless Descent** — a mode that keeps going past the campaign with stacking upgrades.
- **Hitscan** — a shot that lands instantly rather than travelling.
- **Mk (Mark)** — the grade of a weapon: the deeper the floor where you find it, the more damage it does.
- **Mod** — an add-on that attaches to one weapon.
- **Mastery** — a weapon's level that rises with kills and speeds up its fire rate.
- **Procedural** — made by code at runtime, not by hand in a drawing or music program.
- **Refit** — a card that upgrades your weakest weapon.
- **Spawn** — where enemies appear.
- **Supply drop** — a crate dropped by a kill when you are struggling.
- **Three.js** — the 3D code library the game is built on.
- **Tier** — Basic, Mid or Top weapon strength group.
- **Vignette** — darkening at the screen edges.
- **Unity** — a professional game engine (the private version uses it).
- **WebView** — a mini web browser inside an app.
