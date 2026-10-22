#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export JAVA_HOME=/home/shahid/.local/share/java/jdk-17
export ANDROID_HOME=/home/shahid/Android/Sdk
npx expo prebuild --platform android --no-install
# Gradle may miss changes to bundled image files. Recreate the JS/assets output.
bundle_output=android/app/build/generated/assets/react/release/index.android.bundle
if [[ -f "$bundle_output" ]]; then unlink "$bundle_output"; fi
./android/gradlew -p android assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=4
