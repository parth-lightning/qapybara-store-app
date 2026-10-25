# Building the Android APK for Stillform Mobile

This repository contains all the code, assets, configurations, and scripts required to build the release Android APK for the Stillform mobile shopping app.

## Prerequisites

- **Node.js**: v22+
- **JDK**: Java Development Kit 17 (e.g. Temurin 17)
- **Android SDK**: `cmdline-tools`, `platform-tools`, `platforms;android-34` or higher, `build-tools`
- **Environment Variables**:
  - `ANDROID_HOME` or `ANDROID_SDK_ROOT` pointing to your Android SDK directory.
  - `JAVA_HOME` pointing to your JDK 17 directory.

## Build Steps

### 1. Install Dependencies
```bash
npm ci
```
*Note: A postinstall script (`scripts/fix-phosphor.cjs`) automatically runs to ensure Phosphor icon package compatibility.*

### 2. Run Automated Checks
```bash
# Unit tests
npx jest --runInBand

# TypeScript type checks
npx tsc --noEmit

# ESLint
npm run lint
```

### 3. Generate Android Native Project (Expo Prebuild)
```bash
npx expo prebuild --platform android --no-install
```
This generates the native `android/` directory containing the Android manifest, gradle build configs, and native module bindings from `app.json`.

### 4. Compile the Release APK with Gradle
```bash
# Invalidate stale bundled JS/assets cache
bundle_output=android/app/build/generated/assets/react/release/index.android.bundle
if [ -f "$bundle_output" ]; then rm "$bundle_output"; fi

# Assemble the release APK
./android/gradlew -p android assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=4
```
Alternatively, execute the bundled bash script:
```bash
bash scripts/build-android.sh
```

### 5. APK Output Location
The built APK is saved to:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 6. Install on Android Device via ADB
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Automated CI/CD
A GitHub Actions workflow is provided at `.github/workflows/android-build-apk.yml`. Pushing to `main` or triggering manually (`workflow_dispatch`) builds the APK in an Ubuntu runner and uploads the artifact `stillform-release-apk`.
