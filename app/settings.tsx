import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../state/useSettingsStore';
import { useScanStore } from '../state/useScanStore';
import { checkPermissions } from '../lib/permissions';
import Constants from 'expo-constants';

type MLMode = 'ondevice' | 'api';

export default function SettingsScreen() {
  const router = useRouter();
  const storeScansLocally = useSettingsStore((state) => state.storeScansLocally);
  const setStoreScansLocally = useSettingsStore((state) => state.setStoreScansLocally);
  const mlMode = useSettingsStore((state) => state.mlMode);
  const setMLMode = useSettingsStore((state) => state.setMLMode);
  const clearAllScans = useScanStore((state) => state.clearAllScans);
  const [permissions, setPermissions] = useState({ camera: false, gallery: false });

  React.useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    const perms = await checkPermissions();
    setPermissions(perms);
  };

  const handleDeleteAllHistory = () => {
    Alert.alert(
      'Delete All History',
      'Are you sure you want to delete all scan history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearAllScans();
            Alert.alert('Success', 'All history has been deleted');
          },
        },
      ],
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear cached data. Your scan history will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            // In a real app, you might clear image cache here
            Alert.alert('Success', 'Cache cleared');
          },
        },
      ],
    );
  };

  const handleRequestPermissions = async () => {
    await loadPermissions();
    if (!permissions.camera || !permissions.gallery) {
      Alert.alert(
        'Permissions',
        'Some permissions are missing. Please enable them in your device settings.',
      );
    } else {
      Alert.alert('Success', 'All permissions are granted');
    }
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Data Control Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Control</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Store scans locally</Text>
            <Text style={styles.settingDescription}>
              Save scan results to your device
            </Text>
          </View>
          <Switch
            value={storeScansLocally}
            onValueChange={setStoreScansLocally}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={handleDeleteAllHistory}
        >
          <Text style={styles.settingButtonText}>Delete All History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={handleClearCache}
        >
          <Text style={styles.settingButtonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      {/* ML Mode Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ML Mode</Text>
        <Text style={styles.settingDescription}>
          Choose how face detection and analysis is performed
        </Text>
        
        <View style={styles.mlModeContainer}>
          <TouchableOpacity
            style={[
              styles.mlModeButton,
              mlMode === 'ondevice' && styles.mlModeButtonActive,
            ]}
            onPress={() => setMLMode('ondevice')}
          >
            <Text
              style={[
                styles.mlModeButtonText,
                mlMode === 'ondevice' && styles.mlModeButtonTextActive,
              ]}
            >
              On-Device ML
            </Text>
            <Text style={styles.mlModeButtonSubtext}>
              Real face detection (Recommended)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mlModeButton,
              mlMode === 'api' && styles.mlModeButtonActive,
            ]}
            onPress={() => setMLMode('api')}
          >
            <Text
              style={[
                styles.mlModeButtonText,
                mlMode === 'api' && styles.mlModeButtonTextActive,
              ]}
            >
              API
            </Text>
            <Text style={styles.mlModeButtonSubtext}>
              Cloud API (when available)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Permissions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        
        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Camera:</Text>
          <Text style={[
            styles.permissionStatus,
            permissions.camera ? styles.permissionGranted : styles.permissionDenied
          ]}>
            {permissions.camera ? 'Granted' : 'Denied'}
          </Text>
        </View>

        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Gallery:</Text>
          <Text style={[
            styles.permissionStatus,
            permissions.gallery ? styles.permissionGranted : styles.permissionDenied
          ]}>
            {permissions.gallery ? 'Granted' : 'Denied'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={handleRequestPermissions}
        >
          <Text style={styles.settingButtonText}>Check Permissions</Text>
        </TouchableOpacity>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version:</Text>
          <Text style={styles.infoValue}>{appVersion}</Text>
        </View>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => router.push('/terms')}
        >
          <Text style={styles.settingButtonText}>Terms of Use</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => router.push('/privacy')}
        >
          <Text style={styles.settingButtonText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => {
            Alert.alert(
              'Support',
              'For support, please contact us at support@example.com',
            );
          }}
        >
          <Text style={styles.settingButtonText}>Support / Contact</Text>
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
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingButton: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  settingButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionLabel: {
    fontSize: 16,
    color: '#333',
  },
  permissionStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  permissionGranted: {
    color: '#34C759',
  },
  permissionDenied: {
    color: '#FF3B30',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  mlModeContainer: {
    marginTop: 12,
    gap: 12,
  },
  mlModeButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  mlModeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  mlModeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  mlModeButtonTextActive: {
    color: '#007AFF',
  },
  mlModeButtonSubtext: {
    fontSize: 12,
    color: '#999',
  },
});

