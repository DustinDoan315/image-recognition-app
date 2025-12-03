import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageWithBoxes } from '../../components/ImageWithBoxes';
import { Button } from '../../components/Button';
import { useScanStore } from '../../state/useScanStore';
import { formatAgeRange, formatConfidence } from '../../lib/utils';

export default function HistoryDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getScanById = useScanStore((state) => state.getScanById);
  const deleteScan = useScanStore((state) => state.deleteScan);
  const [scan, setScan] = useState(getScanById(params.id!));

  useEffect(() => {
    if (!scan) {
      Alert.alert('Error', 'Scan not found', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [scan, router]);

  if (!scan) {
    return null;
  }

  const handleShare = async () => {
    try {
      const faceSummary = scan.faces.length === 1
        ? '1 face detected'
        : `${scan.faces.length} faces detected`;

      const facesInfo = scan.faces
        .map((face, index) => {
          const age = formatAgeRange(face.age.min, face.age.max);
          const gender = face.gender.label;
          const confidence = formatConfidence(face.gender.confidence);
          return `Face ${index + 1}: ${age}, ${gender} (${confidence})`;
        })
        .join('\n');

      await Share.share({
        message: `Image Recognition Results\n\n${faceSummary}\n\n${facesInfo}`,
        title: 'Image Recognition Results',
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteScan(scan.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {scan.imageUri && (
        <ImageWithBoxes
          imageUri={scan.imageUri}
          faces={scan.faces}
        />
      )}

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>
          {scan.faces.length} {scan.faces.length === 1 ? 'Face' : 'Faces'} Detected
        </Text>
        <Text style={styles.summaryDate}>
          {new Date(scan.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.facesList}>
        {scan.faces.map((face, index) => (
          <View key={face.id} style={styles.faceCard}>
            <Text style={styles.faceNumber}>Face {index + 1}</Text>
            <View style={styles.faceInfo}>
              <View style={styles.faceInfoRow}>
                <Text style={styles.faceInfoLabel}>Age:</Text>
                <Text style={styles.faceInfoValue}>
                  {formatAgeRange(face.age.min, face.age.max)}
                </Text>
              </View>
              <View style={styles.faceInfoRow}>
                <Text style={styles.faceInfoLabel}>Gender:</Text>
                <Text style={styles.faceInfoValue}>
                  {face.gender.label} ({formatConfidence(face.gender.confidence)})
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title="Share Results"
          onPress={handleShare}
          style={styles.actionButton}
        />
        <Button
          title="Delete Scan"
          onPress={handleDelete}
          variant="danger"
          style={styles.actionButton}
        />
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
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 14,
    color: '#666',
  },
  facesList: {
    marginTop: 16,
  },
  faceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  faceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  faceInfo: {
    gap: 8,
  },
  faceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faceInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  faceInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
});

