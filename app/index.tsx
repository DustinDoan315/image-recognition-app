import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useScanStore } from '../state/useScanStore';
import { useSettingsStore } from '../state/useSettingsStore';
import { Button } from '../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { optimizeImageForAnalysis } from '../lib/utils';
import { requestGalleryPermission, showPermissionDeniedAlert } from '../lib/permissions';

export default function HomeScreen() {
  const router = useRouter();
  const scans = useScanStore((state) => state.scans);
  const hasCompletedOnboarding = useSettingsStore(
    (state) => state.hasCompletedOnboarding,
  );
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    loadSettings();
    // Redirect to onboarding if not completed
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, loadSettings, router]);

  const lastScan = scans[0];

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const handleGalleryPress = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        showPermissionDeniedAlert('Gallery');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const optimizedUri = await optimizeImageForAnalysis(result.assets[0].uri);
        router.push({
          pathname: '/results',
          params: { imageUri: optimizedUri },
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleHistoryPress = () => {
    router.push('/history');
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleLastScanPress = () => {
    if (lastScan) {
      router.push(`/history/${lastScan.id}`);
    }
  };

  if (!hasCompletedOnboarding) {
    return null; // Will redirect
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Image Recognition</Text>
        <Text style={styles.subtitle}>
          Analyze faces in photos with age and gender estimation
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Scan with Camera"
          onPress={handleCameraPress}
          style={styles.primaryButton}
        />
        <Button
          title="Pick from Gallery"
          onPress={handleGalleryPress}
          variant="secondary"
          style={styles.secondaryButton}
        />
      </View>

      {lastScan && (
        <TouchableOpacity
          style={styles.lastScan}
          onPress={handleLastScanPress}
          activeOpacity={0.7}
        >
          <Text style={styles.lastScanTitle}>Last Scan</Text>
          <View style={styles.lastScanContent}>
            <Image
              source={{ uri: lastScan.thumbnailUri }}
              style={styles.lastScanThumbnail}
            />
            <View style={styles.lastScanInfo}>
              <Text style={styles.lastScanFaces}>
                {lastScan.faces.length} {lastScan.faces.length === 1 ? 'face' : 'faces'} detected
              </Text>
              <Text style={styles.lastScanDate}>
                {new Date(lastScan.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleHistoryPress}
        >
          <Text style={styles.footerButtonText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleSettingsPress}
        >
          <Text style={styles.footerButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    marginBottom: 32,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 12,
  },
  lastScan: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lastScanTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lastScanContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastScanThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  lastScanInfo: {
    marginLeft: 12,
    flex: 1,
  },
  lastScanFaces: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lastScanDate: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  footerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

