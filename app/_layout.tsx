import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useSettingsStore } from '../state/useSettingsStore';
import { useScanStore } from '../state/useScanStore';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const loadScans = useScanStore((state) => state.loadScans);

  useEffect(() => {
    // Load persisted data on app start
    loadSettings();
    loadScans();
  }, [loadSettings, loadScans]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="index"
          options={{ title: 'Image Recognition' }}
        />
        <Stack.Screen
          name="camera"
          options={{ title: 'Camera', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="results"
          options={{ title: 'Results' }}
        />
        <Stack.Screen
          name="history/index"
          options={{ title: 'History' }}
        />
        <Stack.Screen
          name="history/[id]"
          options={{ title: 'Scan Details' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="privacy"
          options={{ title: 'Privacy Policy' }}
        />
        <Stack.Screen
          name="terms"
          options={{ title: 'Terms of Use' }}
        />
      </Stack>
    </>
  );
}

