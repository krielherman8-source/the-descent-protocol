# The Descent Protocol on Android and iPhone

This folder wraps the browser game in a native WebView with [Capacitor](https://capacitorjs.com/). The game you play is still `index.html` plus `js/`, `css/` and `vendor/` at the repository root. Nothing here rewrites combat, visuals, touch controls, auto-interact, saves or weapon mastery.

The repository stays public. GitHub Pages still serves the site from the `main` branch root (`https://krielherman8-source.github.io/the-descent-protocol/`). Building an app does not turn Pages off and does not make the repo private.

## What you get

| | Android | iPhone / iPad |
|---|---|---|
| Project in this repo | `mobile/android` | `mobile/ios` |
| Compiled in CI or on Linux | A **debug APK** can be built where the Android SDK is installed | **No.** Xcode only runs on macOS. A Linux machine can refresh the bundled web files. It cannot produce an `.ipa` or install to a phone. |
| Store listing | Not created | Not created |

The bundle id in `capacitor.config.json`, Gradle and the Xcode project is the placeholder:

`app.provisional.thedescentprotocol`

That is **not** a publisher identity. Replace it with an id you own before any store upload. This repo does not contain a release keystore, an Apple certificate, or a provisioning profile.

## What the app changes, and what it leaves alone

The WebView loads a copy of the same page (`mobile/build.sh` copies it into `mobile/www`).

- **Offline.** `css/`, `js/` and `vendor/` (Three.js r160 and the postprocessing addons) are inside the app. The page's only remote URLs are the unpkg fallback used when someone opens `index.html` from `file://`. The app is served from `https://localhost` (Android) or `capacitor://localhost` (iOS), so that fallback does not run. `node audit-externals.mjs` checks the copy.
- **Landscape.** The native projects request landscape only. The browser build does not lock orientation.
- **Safe area.** The viewport uses `viewport-fit=cover`. Touch buttons and the menu pad with `env(safe-area-inset-*)`. The canvas shrinks by the same insets. On a desktop window those insets are 0, so the browser layout stays put.
- **Touch.** The existing left stick, right stick and USE / WPN / DRN / pause buttons are unchanged. Auto-interact is still the default the first time a touch device saves settings.
- **Background.** Leaving the app pauses a live run, clears a stuck finger, suspends Web Audio and writes the same checkpoint Continue already reads. Coming back turns audio on again and leaves the pause menu up. You press Resume yourself. Hiding a desktop browser tab only suspends and restores audio.
- **Saves.** Still `localStorage` inside the WebView (`tdp_save`, `tdp_cfg`, `tdp_best`), including per-weapon mastery.

## Install the tools

You need Node.js 20 or newer (the lockfile was made with Node 22) and Git.

### Android debug APK

1. Install a JDK (17 or 21). Check with `java -version`.
2. Install the Android SDK command-line tools (Android Studio is fine too).
3. Point `ANDROID_HOME` at the SDK directory (the one that contains `platform-tools` and `platforms`).
4. Accept the SDK licenses once: `yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses`
5. Install the packages this project compiles against (Capacitor 8 uses Android 36):

```bash
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
```

6. From the repository:

```bash
cd mobile
npm ci
./build.sh android
```

`npm ci` installs the pinned Capacitor 8.6.0 packages from `package-lock.json`. The script copies the game, audits external URLs, syncs them into the Android project and runs `./gradlew assembleDebug`.

The APK is:

`mobile/android/app/build/outputs/apk/debug/app-debug.apk`

Gradle signs that file with the **debug** keystore on your machine (`~/.android/debug.keystore`). That keystore is created automatically, is not in this repo, and is not a release key. Do not send it to anyone as a publishing credential.

### Put the APK on a phone

USB debugging on, then:

```bash
adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Or copy the APK onto the phone and open it. Android will ask you to allow installs from that app. The first launch is landscape. Tap the screen once if the title says audio is waiting.

There is no emulator run recorded in this repository's packaging notes unless a person actually starts one. A successful Gradle build means the APK file exists. It does not, by itself, mean a phone was tested.

### iPhone project (source is here; a Mac has to compile it)

`mobile/ios` is a Capacitor 8 Xcode project (Swift Package Manager, not CocoaPods): landscape only, the same provisional bundle id, WebView background `#020507`, scrolling off. It is **source**. It is not a compiled iOS app, and this repository does not contain an `.ipa`.

On a Mac:

1. Install Xcode from the App Store, open it once, and let it install the extra tools. The project targets iOS 15.
2. In this repo:

```bash
cd mobile
npm ci
./build.sh ios
```

That runs `npx cap sync ios`, which copies the game into `ios/App/App/public` and refreshes `App/CapApp-SPM/Package.swift`. Then open `mobile/ios/App/App.xcodeproj` in Xcode. The first open downloads the Capacitor Swift package from GitHub (`capacitor-swift-pm`). That download is the native shell, not the game. The game files are already on disk.

3. To run on the simulator, pick an iPhone simulator and press Run. No paid account is required for the simulator.
4. To run on your iPhone, connect it, pick your Personal Team under Signing & Capabilities, and press Run. Xcode creates a free development profile for **your** Apple ID. Those profiles expire after about a week and only install on devices you register. This repository does not enroll you in the Apple Developer Program, does not create a distribution certificate, and does not upload to TestFlight or the App Store.
5. Before any public release, change `app.provisional.thedescentprotocol` to a bundle id on your own Apple team, and set the display name if you want something else.

`./build.sh ios` on Linux copies the web bundle into `ios/App/App/public` and then stops with exit code 2. That exit is expected. It is not an iOS build. Nothing in this setup was run in Xcode.

## Day-to-day

After you change the game at the repo root:

```bash
cd mobile
./build.sh android    # new debug APK
# on a Mac:
./build.sh ios        # refresh Xcode, then Run
```

`./build.sh sync` copies the game into the native projects without compiling.

## Checks that do not need a phone

From the repository root, with Google Chrome installed:

```bash
bash tests/suite.sh
```

That uses virtual time (`tests/run.sh`) and writes `/tmp/suite/*.txt`. Web Audio does not run under virtual time. For the shell, mastery and save checks, build the page and drive it in real time:

```bash
mkdir -p /tmp/srv
ln -sfn "$PWD/js" /tmp/srv/js
ln -sfn "$PWD/css" /tmp/srv/css
ln -sfn "$PWD/vendor" /tmp/srv/vendor
python3 tests/mk.py tests/mob.js mob.html
python3 -m http.server 8765 --directory /tmp/srv
node tests/realtime.mjs mob.html /tmp/suite/mob.txt 120
```

`tests/mob.js` checks weapon mastery (30 kills, +2% fire rate, cap 30, per weapon), Continue restoring that mastery, browser background (audio suspends, the run keeps playing) and the native background path (pause, checkpoint, resume stays paused, sticks released). `tests/st.js` still covers auto-interact and Endless scaling against the halved per-floor curve. `tests/ui.js` covers menus, touch sticks and Continue.

The external-URL audit:

```bash
cd mobile && node sync-www.mjs && node audit-externals.mjs
```
