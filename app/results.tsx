import React, { useState, useEffect } from 'react';
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
import { ImageWithBoxes } from '../components/ImageWithBoxes';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Button } from '../components/Button';
import { analyzeImage } from '../lib/api';
import { AnalysisResult } from '../lib/types';
import { useScanStore } from '../state/useScanStore';
import { useSettingsStore } from '../state/useSettingsStore';
import { generateId, generateThumbnail, formatAgeRange, formatConfidence } from '../lib/utils';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const imageUri = params.imageUri;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const addScan = useScanStore((state) => state.addScan);
  const storeScansLocally = useSettingsStore((state) => state.storeScansLocally);

  useEffect(() => {
    if (!imageUri) {
      router.back();
      return;
    }

    analyzeImageAsync();
  }, [imageUri]);

  const analyzeImageAsync = async () => {
    if (!imageUri) return;

    setLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzeImage(imageUri);
      setResult(analysisResult);

      if (analysisResult.faces.length === 0) {
        setError('No faces detected in this image');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !imageUri) return;

    try {
      const thumbnailUri = await generateThumbnail(imageUri);
      const scanEntry = {
        id: generateId(),
        createdAt: Date.now(),
        thumbnailUri,
        faces: result.faces,
        imageUri,
      };

      await addScan(scanEntry);
      Alert.alert('Success', 'Scan saved to history');
    } catch (err) {
      console.error('Error saving scan:', err);
      Alert.alert('Error', 'Failed to save scan');
    }
  };

  const handleShare = async () => {
    if (!result) return;

    try {
      const faceSummary = result.faces.length === 1
        ? '1 face detected'
        : `${result.faces.length} faces detected`;

      const facesInfo = result.faces
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

  const handleRetake = () => {
    router.back();
  };

  if (loading) {
    return <LoadingOverlay message="Analyzing image..." />;
  }

  if (error && !result) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Analysis Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorActions}>
            <Button title="Try Again" onPress={analyzeImageAsync} />
            <Button
              title="Go Back"
              onPress={handleRetake}
              variant="secondary"
              style={styles.errorButton}
            />
          </View>
        </View>
      </View>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ImageWithBoxes
        imageUri={imageUri!}
        faces={result.faces}
        imageWidth={result.image.width}
        imageHeight={result.image.height}
      />

      {result.faces.length === 0 ? (
        <View style={styles.noFacesContainer}>
          <Text style={styles.noFacesTitle}>No Faces Detected</Text>
          <Text style={styles.noFacesText}>
            We couldn't detect any faces in this image. Please try a different photo.
          </Text>
          <Button
            title="Try Again"
            onPress={handleRetake}
            style={styles.actionButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>
              {result.faces.length} {result.faces.length === 1 ? 'Face' : 'Faces'} Detected
            </Text>
          </View>

          <View style={styles.facesList}>
            {result.faces.map((face, index) => (
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
            {storeScansLocally && (
              <Button
                title="Save to History"
                onPress={handleSave}
                style={styles.actionButton}
              />
            )}
            <Button
              title="Share Results"
              onPress={handleShare}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Retake"
              onPress={handleRetake}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorActions: {
    width: '100%',
  },
  errorButton: {
    marginTop: 12,
  },
  noFacesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  noFacesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noFacesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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

