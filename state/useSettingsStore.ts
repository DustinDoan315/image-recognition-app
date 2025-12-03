import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MLMode = 'ondevice' | 'api';

interface SettingsState {
  storeScansLocally: boolean;
  mlMode: MLMode;
  hasCompletedOnboarding: boolean;
  setStoreScansLocally: (value: boolean) => void;
  setMLMode: (mode: MLMode) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  loadSettings: () => Promise<void>;
}

const SETTINGS_STORAGE_KEY = '@settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  storeScansLocally: true,
  mlMode: 'ondevice' as MLMode, // Default to on-device ML
  hasCompletedOnboarding: false,

  setStoreScansLocally: async (value: boolean) => {
    set({ storeScansLocally: value });
    await saveSettings();
  },

  setMLMode: async (mode: MLMode) => {
    set({ mlMode: mode });
    await saveSettings();
    // Update environment variable for API switch
    if (typeof process !== 'undefined' && process.env) {
      if (mode === 'ondevice') {
        process.env.EXPO_PUBLIC_USE_MOCK = 'ondevice';
      } else {
        process.env.EXPO_PUBLIC_USE_MOCK = 'false';
      }
    }
  },

  setHasCompletedOnboarding: async (value: boolean) => {
    set({ hasCompletedOnboarding: value });
    await saveSettings();
  },

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set({
          storeScansLocally: settings.storeScansLocally ?? true,
          mlMode: (settings.mlMode === 'api' ? 'api' : 'ondevice') as MLMode,
          hasCompletedOnboarding: settings.hasCompletedOnboarding ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },
}));

async function saveSettings() {
  try {
    const state = useSettingsStore.getState();
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        storeScansLocally: state.storeScansLocally,
        mlMode: state.mlMode,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    );
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Load settings on initialization
useSettingsStore.getState().loadSettings();

