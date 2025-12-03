import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Linking, Platform, Alert } from 'react-native';

export interface PermissionStatus {
  camera: boolean;
  gallery: boolean;
}

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
}

/**
 * Request gallery/media library permission
 */
export async function requestGalleryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting gallery permission:', error);
    return false;
  }
}

/**
 * Check current permission status
 */
export async function checkPermissions(): Promise<PermissionStatus> {
  try {
    const cameraStatus = await Camera.getCameraPermissionsAsync();
    const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    return {
      camera: cameraStatus.status === 'granted',
      gallery: galleryStatus.status === 'granted',
    };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return { camera: false, gallery: false };
  }
}

/**
 * Open device settings
 */
export async function openSettings(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  } catch (error) {
    console.error('Error opening settings:', error);
    Alert.alert(
      'Unable to Open Settings',
      'Please manually enable permissions in your device settings.',
    );
  }
}

/**
 * Show permission denied alert with option to open settings
 */
export function showPermissionDeniedAlert(permissionType: 'Camera' | 'Gallery'): void {
  Alert.alert(
    `${permissionType} Permission Required`,
    `Please enable ${permissionType.toLowerCase()} access in your device settings to use this feature.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openSettings },
    ],
  );
}

