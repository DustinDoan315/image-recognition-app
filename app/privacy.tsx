import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          This Privacy Policy describes how Image Recognition App ("we", "our", or "us") 
          collects, uses, and protects your information when you use our mobile application.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.text}>
          • Photos: We process photos you select or capture through the app to perform 
          face detection and analysis.{'\n\n'}
          • Analysis Results: We store analysis results locally on your device if you 
          choose to save them.{'\n\n'}
          • No Personal Identification: Our app uses face detection technology but does 
          NOT identify individuals or store personal identifying information.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.text}>
          • Face Detection: We analyze images to detect faces and estimate age and gender.{'\n\n'}
          • Local Storage: Analysis results are stored locally on your device only if you 
          enable this feature in settings.{'\n\n'}
          • No Sharing: We do not share, sell, or transmit your photos or analysis results 
          to third parties.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Data Storage</Text>
        <Text style={styles.text}>
          • All processing happens on your device or on secure servers.{'\n\n'}
          • Analysis results are stored locally on your device only if you choose to save them.{'\n\n'}
          • You can delete all stored data at any time through the app settings.{'\n\n'}
          • We do not maintain copies of your photos or analysis results on our servers.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Permissions</Text>
        <Text style={styles.text}>
          • Camera: Used to capture photos for analysis.{'\n\n'}
          • Photo Library: Used to select existing photos for analysis.{'\n\n'}
          • These permissions are required for the app to function and can be revoked 
          at any time through your device settings.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.text}>
          • You can delete all stored scan history at any time.{'\n\n'}
          • You can disable local storage of scans in settings.{'\n\n'}
          • You can revoke camera and photo library permissions at any time.{'\n\n'}
          • You can uninstall the app at any time, which will remove all locally stored data.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Face Detection Disclaimer</Text>
        <Text style={styles.text}>
          This app uses face detection technology to identify faces in images and estimate 
          age and gender. It does NOT identify specific individuals or store personal 
          identifying information. The analysis is performed for informational purposes only.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
        <Text style={styles.text}>
          Our app is not intended for children under 13 years of age. We do not knowingly 
          collect personal information from children under 13.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy from time to time. We will notify you of any 
          changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions about this Privacy Policy, please contact us at:{'\n\n'}
          support@example.com
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
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
  text: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
});

