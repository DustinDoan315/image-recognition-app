import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import {
  requestCameraPermission,
  requestGalleryPermission,
  showPermissionDeniedAlert,
} from '../lib/permissions';
import { useSettingsStore } from '../state/useSettingsStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasCompletedOnboarding = useSettingsStore(
    (state) => state.setHasCompletedOnboarding,
  );
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Request permissions
      const cameraGranted = await requestCameraPermission();
      const galleryGranted = await requestGalleryPermission();

      if (!cameraGranted || !galleryGranted) {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and gallery permissions to use this app. You can enable them in Settings.',
          [
            { text: 'OK', onPress: () => {} },
          ],
        );
      }

      // Mark onboarding as complete
      await setHasCompletedOnboarding(true);
      router.replace('/');
    } catch (error) {
      console.error('Error in onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Image Recognition</Text>
        <Text style={styles.subtitle}>
          Analyze faces in photos with age and gender estimation
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What This App Does</Text>
        <Text style={styles.sectionText}>
          • Detects faces in your photos{'\n'}
          • Estimates age ranges{'\n'}
          • Estimates gender with confidence scores{'\n'}
          • Stores results locally on your device
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>
        <Text style={styles.sectionText}>
          • All processing happens on your device or secure servers{'\n'}
          • No personal data is stored or shared{'\n'}
          • Face detection only - does not identify individuals{'\n'}
          • You control what data is saved locally
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions Needed</Text>
        <Text style={styles.sectionText}>
          • Camera: To capture photos for analysis{'\n'}
          • Photo Library: To select existing photos
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          style={styles.button}
        />
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Use and Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

