import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanEntry } from '../lib/types';

interface ScanState {
  scans: ScanEntry[];
  addScan: (scan: ScanEntry) => Promise<void>;
  deleteScan: (id: string) => Promise<void>;
  clearAllScans: () => Promise<void>;
  getScanById: (id: string) => ScanEntry | undefined;
  loadScans: () => Promise<void>;
}

const SCANS_STORAGE_KEY = '@scans';
const MAX_SCANS = 50; // Limit history entries

export const useScanStore = create<ScanState>((set, get) => ({
  scans: [],

  addScan: async (scan: ScanEntry) => {
    const { scans } = get();
    const newScans = [scan, ...scans].slice(0, MAX_SCANS); // Keep only latest 50
    set({ scans: newScans });
    await saveScans(newScans);
  },

  deleteScan: async (id: string) => {
    const { scans } = get();
    const newScans = scans.filter(scan => scan.id !== id);
    set({ scans: newScans });
    await saveScans(newScans);
  },

  clearAllScans: async () => {
    set({ scans: [] });
    await saveScans([]);
  },

  getScanById: (id: string) => {
    return get().scans.find(scan => scan.id === id);
  },

  loadScans: async () => {
    try {
      const stored = await AsyncStorage.getItem(SCANS_STORAGE_KEY);
      if (stored) {
        const scans = JSON.parse(stored);
        set({ scans: Array.isArray(scans) ? scans : [] });
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  },
}));

async function saveScans(scans: ScanEntry[]) {
  try {
    await AsyncStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans));
  } catch (error) {
    console.error('Error saving scans:', error);
  }
}

// Load scans on initialization
useScanStore.getState().loadScans();

