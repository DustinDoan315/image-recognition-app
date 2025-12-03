import { analyzeReal } from './analyze';
import { analyzeOnDevice } from './analyze.ondevice';
import { useSettingsStore } from '../../state/useSettingsStore';

/**
 * Get the current ML mode from settings store
 */
function getMLMode(): 'ondevice' | 'api' {
  // Try to get from settings store first
  try {
    const mlMode = useSettingsStore.getState().mlMode;
    if (mlMode) return mlMode;
  } catch (e) {
    // Settings store not available, fall back to env
  }
  
  // Fall back to environment variable
  const mode = process.env.EXPO_PUBLIC_USE_MOCK || 'ondevice';
  
  if (mode === 'ondevice' || mode === 'on-device') {
    return 'ondevice';
  } else {
    return 'api';
  }
}

/**
 * API switch: Use on-device ML or real API based on settings
 * - 'ondevice': Use on-device ML (expo-face-detector) - DEFAULT
 * - 'api': Use real API
 */
export const analyzeImage = (() => {
  const mode = getMLMode();
  
  if (mode === 'ondevice') {
    return analyzeOnDevice;
  } else {
    return analyzeReal;
  }
})();

