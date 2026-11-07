#!/usr/bin/env bash
# Build the native wrapper. From mobile/: ./build.sh [android|ios|sync]
# android  — bundle the game, sync, assemble a debug APK (needs ANDROID_HOME and a JDK)
# ios      — on macOS, sync and remind you to compile in Xcode. Elsewhere, refresh the
#            prepared project and stop. This script never signs with a release identity.
# sync     — copy the game into both native projects without compiling
set -euo pipefail
MOB="$(cd "$(dirname "$0")" && pwd)"
cd "$MOB"
TARGET="${1:-android}"

if [[ ! -d node_modules/@capacitor/cli ]]; then
  echo "Installing pinned wrapper dependencies (npm ci)..."
  npm ci
fi

node sync-www.mjs
node audit-externals.mjs

sync_ios_web() {
  if [[ ! -d ios/App/App ]]; then
    echo "mobile/ios is not in the tree. On macOS run: npx cap add ios"
    return 1
  fi
  mkdir -p ios/App/App/public
  rm -rf ios/App/App/public/*
  cp -R www/. ios/App/App/public/
  cp capacitor.config.json ios/App/App/capacitor.config.json
  echo "Copied the offline bundle into ios/App/App/public."
}

case "$TARGET" in
  android)
    npx cap sync android
    SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
    if [[ -z "$SDK" ]]; then
      echo "ANDROID_HOME is not set. Install the Android SDK and export ANDROID_HOME. See mobile/README.md."
      exit 1
    fi
    printf 'sdk.dir=%s\n' "$SDK" > android/local.properties
    (cd android && ./gradlew assembleDebug --no-daemon)
    echo "Debug APK: $MOB/android/app/build/outputs/apk/debug/app-debug.apk"
    echo "Signed with the local debug keystore only. No release key was used."
    ;;
  ios)
    sync_ios_web || true
    if [[ "$(uname -s)" != "Darwin" ]]; then
      echo
      echo "This machine is $(uname -s). An iPhone app was not compiled or installed here."
      echo "The Xcode project under mobile/ios is source only until you open it on a Mac."
      echo "On a Mac, with Xcode installed: cd mobile && ./build.sh ios"
      echo "Then open mobile/ios/App/App.xcworkspace (after the first pod install) or App.xcodeproj."
      exit 2
    fi
    npx cap sync ios
    echo "Synced. Open ios/App/App.xcworkspace in Xcode, pick a simulator or your own signing team, and press Run."
    echo "This script does not create an Apple Developer account or a distribution certificate."
    ;;
  sync)
    npx cap sync android
    if [[ "$(uname -s)" == "Darwin" ]]; then npx cap sync ios; else sync_ios_web || true; fi
    ;;
  *)
    echo "usage: ./build.sh [android|ios|sync]"
    exit 1
    ;;
esac
