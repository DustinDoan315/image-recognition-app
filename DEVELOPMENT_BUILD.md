# Development Build Required

## Important Notice

The real-time face detection feature requires a **development build** because `expo-face-detector` uses native code that isn't available in Expo Go.

## Quick Start

### Option 1: Local Development Build (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run on iOS:**
   ```bash
   npx expo run:ios
   ```

3. **Run on Android:**
   ```bash
   npx expo run:android
   ```

### Option 2: EAS Development Build

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Build development client:**
   ```bash
   # iOS
   eas build --profile development --platform ios

   # Android
   eas build --profile development --platform android
   ```

4. **Install the build on your device** and run:
   ```bash
   npx expo start --dev-client
   ```

## Why Development Build?

`expo-face-detector` is a native module that requires custom native code. Expo Go only includes a limited set of native modules, so custom native modules require a development build.

## Features That Work Without Development Build

- Image analysis from gallery (uses the same face detector but processes saved images)
- All other app features

## Features That Require Development Build

- Real-time face detection in camera view
- On-device ML processing (both work, but real-time camera requires dev build)

## Troubleshooting

If you see `Cannot find native module 'ExpoFaceDetector'`:
1. Make sure you've run `npx expo prebuild` (already done)
2. Build and run with `npx expo run:ios` or `npx expo run:android`
3. Don't use Expo Go - use the development build instead

