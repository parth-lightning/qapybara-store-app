#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export JAVA_HOME=/home/shahid/.local/share/java/jdk-17
export ANDROID_HOME=/home/shahid/Android/Sdk
npx expo prebuild --platform android --no-install
./android/gradlew -p android assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=4
