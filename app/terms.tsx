import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms of Use</Text>
      <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By downloading, installing, or using Image Recognition App ("the App"), you agree 
          to be bound by these Terms of Use. If you do not agree to these terms, please do 
          not use the App.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.text}>
          The App provides face detection and analysis features, including age and gender 
          estimation. The App uses face detection technology but does NOT identify specific 
          individuals. All analysis is provided for informational purposes only.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Use of the App</Text>
        <Text style={styles.text}>
          You agree to use the App only for lawful purposes and in accordance with these Terms. 
          You agree not to:{'\n\n'}
          • Use the App to violate any applicable laws or regulations{'\n\n'}
          • Use the App to infringe upon the rights of others{'\n\n'}
          • Attempt to reverse engineer or modify the App{'\n\n'}
          • Use the App in any way that could damage or impair the App or its functionality
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Privacy</Text>
        <Text style={styles.text}>
          Your use of the App is also governed by our Privacy Policy. Please review our Privacy 
          Policy to understand how we collect, use, and protect your information.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
        <Text style={styles.text}>
          The App and its original content, features, and functionality are owned by us and are 
          protected by international copyright, trademark, and other intellectual property laws.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Disclaimer of Warranties</Text>
        <Text style={styles.text}>
          THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
          EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, 
          ERROR-FREE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.text}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE 
          OF THE APP.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Face Detection Disclaimer</Text>
        <Text style={styles.text}>
          The App uses face detection technology for informational purposes only. The age and 
          gender estimations are approximate and should not be relied upon for critical decisions. 
          The App does NOT identify specific individuals.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. Modifications to Terms</Text>
        <Text style={styles.text}>
          We reserve the right to modify these Terms at any time. We will notify you of any 
          changes by posting the new Terms on this page and updating the "Last Updated" date.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>10. Termination</Text>
        <Text style={styles.text}>
          We may terminate or suspend your access to the App immediately, without prior notice, 
          for any reason, including if you breach these Terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>11. Governing Law</Text>
        <Text style={styles.text}>
          These Terms shall be governed by and construed in accordance with the laws of the 
          jurisdiction in which we operate, without regard to its conflict of law provisions.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>12. Contact Information</Text>
        <Text style={styles.text}>
          If you have any questions about these Terms, please contact us at:{'\n\n'}
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

