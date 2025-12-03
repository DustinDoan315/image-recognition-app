# Agent Prompt: Store-Ready Expo Image Recognition App

## Goal

Build a store-ready, mobile-first image recognition app using Expo SDK 54, TypeScript, and Expo Router, with mock ML data first and upgradeable API architecture later.

## Requirements

### 1. Project Setup

**Expo SDK**: Latest SDK 54 (React Native 0.81.5, React 19.1.0)
- New Architecture enabled by default
- TypeScript with strict mode
- Expo Router v6+ (file-based routing)

**Required Libraries** (already installed):
- `expo-camera` (~17.0.9)
- `expo-image-picker` (~17.0.8)
- `expo-media-library` (~18.2.0)
- `react-native-svg` (15.12.1)
- `expo-image-manipulator` (~14.0.7)
- `zustand` (^5.0.9)
- `@tanstack/react-query` (^5.90.11)
- `axios` (^1.13.2)
- `@react-native-async-storage/async-storage` (2.2.0)
- `nativewind` - Tailwind CSS for React Native

**Project Structure**:
```
app/
  _layout.tsx          # Root layout with Expo Router
  index.tsx            # Home screen
  camera.tsx           # Camera capture screen
  results.tsx          # Results display screen
  history/
    index.tsx          # History list
    [id].tsx           # History detail (dynamic route)
  onboarding.tsx       # First launch + permissions
  settings.tsx         # Privacy/settings
  privacy.tsx          # Privacy Policy screen
  terms.tsx            # Terms of Use screen

components/
  ImageWithBoxes.tsx   # Image with SVG bounding boxes
  ScanCard.tsx         # History card component
  Button.tsx           # Reusable button
  LoadingOverlay.tsx   # Loading state component

lib/
  api/
    analyze.mock.ts    # Mock ML logic
    analyze.ts         # Real API implementation (future)
    client.ts          # Axios wrapper
    index.ts           # Export switch (mock vs real)
  types.ts             # TypeScript types
  utils.ts             # Utility functions
  permissions.ts       # Permission helpers

state/
  useScanStore.ts      # Scan history state (zustand)
  useSettingsStore.ts  # Settings state (zustand)
```

### 2. Screens (Store-Ready)

#### Onboarding Screen (`app/onboarding.tsx`)
- First-launch detection using AsyncStorage
- Clear explanation of app functionality (face detection, age/gender estimation)
- Privacy-first data handling explanation
- Camera permission request with `Camera.requestPermissionsAsync()`
- Gallery permission request with `ImagePicker.requestMediaLibraryPermissionsAsync()`
- "Open Settings" button if permissions denied
- Navigate to home after completion

#### Home Screen (`app/index.tsx`)
- Clean, modern design
- Primary actions:
  - "Scan with Camera" button → navigate to `/camera`
  - "Pick from Gallery" button → pick image → navigate to `/results`
- Secondary actions:
  - "History" button → navigate to `/history`
  - "Settings" button → navigate to `/settings`
- Last scan thumbnail (if exists) → navigate to history detail
- Empty state for first-time users

#### Camera Screen (`app/camera.tsx`)
- Full-screen camera preview using `expo-camera`
- Capture button (centered bottom)
- Flash toggle
- Camera flip (front/back)
- "Retake / Use Photo" bottom sheet after capture
- Image processing: resize before analysis using `manipulateAsync`
- Navigate to Results screen with captured image URI

#### Results Screen (`app/results.tsx`)
- Display captured image
- SVG bounding boxes using `react-native-svg` (from mock/API data)
- Age range chips (e.g., "23-29 years")
- Gender labels with confidence percentages
- "Save to History" button (if enabled in settings)
- "Share" button
- "Retake" button
- Loading overlay during analysis
- Error states: no faces detected, analysis error

#### History List (`app/history/index.tsx`)
- FlatList with `ScanCard` components
- Thumbnail + summary ("2 faces detected")
- Pull-to-refresh
- Empty state
- Delete swipe action
- Navigate to detail on press

#### History Detail (`app/history/[id].tsx`)
- Same UI as Results screen (reusable component)
- Read-only mode (no "analyze" button)
- Load from history store by ID
- Share functionality
- Delete button

#### Settings Screen (`app/settings.tsx`)
**Critical for App Store Review**

**Sections**:
1. **Data Control**
   - Toggle: "Store scans locally" (on/off)
   - Button: "Delete all history" → confirmation modal
   - Button: "Clear cache"

2. **ML Mode**
   - Toggle: "Use Mock Data" / "Use API" (for development)

3. **App Info**
   - Version number
   - Link: Terms of Use → `/terms`
   - Link: Privacy Policy → `/privacy`
   - Link: Support/Contact (placeholder)

4. **Permissions**
   - Status indicators for Camera/Gallery
   - "Request Permissions" button if denied

#### Privacy Policy (`app/privacy.tsx`)
- Static page with privacy policy content
- Data collection explanation
- Data storage (local only)
- No data sharing statement
- Face detection disclaimer (not identification)
- User rights (delete data)

#### Terms of Use (`app/terms.tsx`)
- Static page with terms of use content

### 3. Mock ML Layer (Mobile-First)

**Create `lib/api/analyze.mock.ts`**:
```typescript
export async function analyzeMock(imageUri: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    image: { width: 1080, height: 1920 },
    faces: [
      {
        id: "face1",
        bbox: { x: 0.2, y: 0.1, width: 0.3, height: 0.25 },
        age: { min: 23, max: 29 },
        gender: { label: "female", confidence: 0.87 }
      },
      {
        id: "face2",
        bbox: { x: 0.6, y: 0.15, width: 0.25, height: 0.3 },
        age: { min: 35, max: 42 },
        gender: { label: "male", confidence: 0.92 }
      }
    ]
  };
}
```

**API Switch** (`lib/api/index.ts`):
```typescript
export const analyzeImage = 
  process.env.EXPO_PUBLIC_USE_MOCK !== "false" 
    ? analyzeMock 
    : analyzeReal;
```

### 4. History & Local Storage

**Use AsyncStorage via zustand** (`state/useScanStore.ts`):
- Store results metadata, not full images (thumbnails only)
- Thumbnail generation using `expo-image-manipulator`
- History entry structure:
```typescript
{
  id: string;
  createdAt: number;
  thumbnailUri: string;
  faces: FacePrediction[];
  imageUri?: string; // Optional, for detail view
}
```

### 5. State Management

**Settings Store** (`state/useSettingsStore.ts`):
- `storeScansLocally: boolean`
- `useMockData: boolean`
- `hasCompletedOnboarding: boolean`
- Persist to AsyncStorage

**Scan Store** (`state/useScanStore.ts`):
- `scans: ScanEntry[]`
- `addScan(scan: ScanEntry)`
- `deleteScan(id: string)`
- `clearAllScans()`
- `getScanById(id: string)`
- Persist to AsyncStorage

### 6. UX Requirements

#### Loading & Error States
- Use `LoadingOverlay` during analysis
- Handle:
  - No faces detected → friendly message + retry button
  - Permission denied → instructions + "Open Settings" button
  - Image load errors → error modal + retry
  - Analysis error → error message + retry button
  - Offline mode (for real API later) → indicator + cached results

#### Image Optimization
- Before sending to mock API, always resize:
  ```typescript
  manipulateAsync(uri, [{ resize: { width: 800 } }], { compress: 0.8 })
  ```
- Generate thumbnails for history (200x200px)
- Lazy load images in history list

#### Component Optimization
- Use `React.memo` for expensive components
- Memoize SVG calculations
- Virtualized lists for history
- Optimize re-renders with zustand selectors

### 7. TypeScript Types (`lib/types.ts`)

```typescript
export interface FacePrediction {
  id: string;
  bbox: {
    x: number;      // Normalized 0-1
    y: number;      // Normalized 0-1
    width: number;  // Normalized 0-1
    height: number; // Normalized 0-1
  };
  age: {
    min: number;
    max: number;
  };
  gender: {
    label: "male" | "female";
    confidence: number; // 0-1
  };
}

export interface AnalysisResult {
  image: {
    width: number;
    height: number;
  };
  faces: FacePrediction[];
}

export interface ScanEntry {
  id: string;
  createdAt: number;
  thumbnailUri: string;
  faces: FacePrediction[];
  imageUri?: string;
}
```

### 8. Store-Readiness Requirements

**Mandatory**:
- App icon (already configured)
- Splash screen (already configured)
- Camera usage reason (configured in app.json)
- Terms of Use + Privacy Policy pages
- No identifying individuals disclaimer
- Clear opt-in to data saving

**App Configuration** (already updated in app.json):
- iOS: `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`
- Android: Camera and storage permissions

### 9. Deliverables

**Code Implementation**:
- ✅ All screens with full functionality
- ✅ Mock ML logic wired into Results screen
- ✅ State management for settings + history
- ✅ `ImageWithBoxes` component with SVG bounding boxes
- ✅ Full navigation flow via Expo Router
- ✅ Local-only version that is 100% functional without backend
- ✅ Error handling and edge cases
- ✅ Performance optimizations

**Code Quality**:
- TypeScript strict mode
- Consistent code style
- Reusable components
- Proper error boundaries
- Accessibility considerations

**Instructions**:
- Clear comments on where to plug in real API later
- Environment variable configuration for mock/real switch
- API contract documentation

## Implementation Notes

1. **Navigation**: Use Expo Router hooks (`useRouter`, `useLocalSearchParams`)
2. **Styling**: Use NativeWind (Tailwind CSS) or StyleSheet for consistent design
3. **Permissions**: Always check permissions before accessing camera/gallery
4. **Image Processing**: Always resize images before analysis to optimize performance
5. **Error Handling**: Provide clear, actionable error messages
6. **Privacy**: Make privacy controls prominent and easy to understand
7. **Performance**: Use memoization, lazy loading, and optimized image handling

## Next Steps After Implementation

1. Replace mock ML with real API (drop-in replacement)
2. Add analytics (optional, privacy-compliant)
3. Add crash reporting (Sentry, etc.)
4. A/B testing for onboarding flow
5. User feedback collection

