# Image Recognition App

A store-ready, mobile-first image recognition app built with Expo SDK 54, TypeScript, and React Native. The app uses face detection to analyze photos and estimate age and gender.

## Features

- 📸 **Camera Integration**: Capture photos directly from the app
- 🖼️ **Gallery Selection**: Pick photos from your device gallery
- 🔍 **Face Detection**: Detect multiple faces in images
- 👤 **Age & Gender Estimation**: Estimate age ranges and gender with confidence scores
- 📚 **History**: Save and view past scan results
- 🔒 **Privacy-First**: All data stored locally, no sharing with third parties
- ⚙️ **Settings**: Control data storage and app behavior
- 📱 **Store-Ready**: Configured for App Store and Google Play submission

## Tech Stack

- **Expo SDK 54** - React Native framework
- **TypeScript** - Type-safe development
- **Expo Router** - File-based routing
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **React Native SVG** - SVG rendering for bounding boxes
- **Expo Image Manipulator** - Image optimization

## Project Structure

```
app/
  _layout.tsx          # Root layout
  index.tsx            # Home screen
  camera.tsx           # Camera screen
  results.tsx          # Results screen
  history/             # History screens
    index.tsx
    [id].tsx
  onboarding.tsx       # Onboarding flow
  settings.tsx         # Settings screen
  privacy.tsx          # Privacy Policy
  terms.tsx            # Terms of Use

components/
  ImageWithBoxes.tsx   # Image with bounding boxes
  ScanCard.tsx         # History card
  Button.tsx           # Reusable button
  LoadingOverlay.tsx   # Loading overlay

lib/
  api/                 # API layer
    analyze.ondevice.ts # On-device ML implementation
    analyze.ts         # Real API (future)
    client.ts          # HTTP client
    index.ts           # API switch
  types.ts             # TypeScript types
  utils.ts             # Utility functions
  permissions.ts       # Permission helpers

state/
  useScanStore.ts      # Scan history state
  useSettingsStore.ts  # Settings state
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Expo Go app on your physical device (for testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd image-recognition-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web (limited functionality)
npm run web
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
# ML Mode: "ondevice" or "false" (for API)
# Default is "ondevice" (on-device ML using expo-face-detector)
EXPO_PUBLIC_USE_MOCK=ondevice

# Real API URL (only used when EXPO_PUBLIC_USE_MOCK=false)
EXPO_PUBLIC_API_URL=https://api.example.com
```

**Note:** You can also change the ML mode directly in the app Settings screen. The app defaults to **On-Device ML** which uses `expo-face-detector` for real face detection.

### App Configuration

The app is configured in `app.json` with:
- Camera and photo library permissions
- iOS and Android bundle identifiers
- Splash screen and app icons

## ML Modes

The app supports two ML modes:

1. **On-Device ML (Default)**: Uses `expo-face-detector` for real face detection on your device. This is the recommended mode as it works offline and provides accurate face detection.

2. **API**: Uses a cloud API for face detection (when implemented).

You can switch between modes in the Settings screen, or by setting the `EXPO_PUBLIC_USE_MOCK` environment variable.

### Switching to Real API

To switch to a real API:

1. Set `EXPO_PUBLIC_USE_MOCK=false` in your `.env` file, or use the Settings screen to select "API" mode
2. Set `EXPO_PUBLIC_API_URL` to your API endpoint
3. Implement the real API in `lib/api/analyze.ts`

The API should accept a POST request with FormData containing an image file and return:

```typescript
{
  image: { width: number, height: number },
  faces: [
    {
      id: string,
      bbox: { x: number, y: number, width: number, height: number },
      age: { min: number, max: number },
      gender: { label: "male" | "female", confidence: number }
    }
  ]
}
```

## Building for Production

### Using EAS Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios --profile production
```

5. Build for Android:
```bash
eas build --platform android --profile production
```

6. Submit to stores:
```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

## Store Submission Requirements

### iOS

- App icon (1024x1024px)
- Splash screen (configured in app.json)
- Privacy Nutrition Labels
- Camera usage description: "Used to capture photos for face feature analysis"
- Photo library usage description: "Used to select photos for analysis"

### Android

- Adaptive icon (configured in app.json)
- Content rating questionnaire
- Privacy policy URL
- Camera and storage permissions (configured in app.json)

## Privacy & Compliance

- All processing happens locally or on secure servers
- No personal data is stored or shared
- Face detection only - does not identify individuals
- Users can delete all data at any time
- Privacy Policy and Terms of Use included

## Testing

Test the app on:
- Low-end and high-end Android devices
- iPhone XR and newer models
- Dark/Light mode
- No network connectivity scenarios
- Permission denied edge cases

## Troubleshooting

### Camera Permission Issues

If camera permissions are not working:
1. Check `app.json` has the correct permission descriptions
2. Verify permissions in device settings
3. Rebuild the app after changing permissions

### Image Analysis Not Working

1. Check that `EXPO_PUBLIC_USE_MOCK` is set to "ondevice" (default) or "false" for API
2. Verify image URI is valid
3. Check console for error messages
4. Ensure camera permissions are granted for on-device ML

## License

[Your License Here]

## Support

For support, contact: support@example.com

