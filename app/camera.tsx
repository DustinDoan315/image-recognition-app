import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { optimizeImageForAnalysis } from '../lib/utils';
import { showPermissionDeniedAlert } from '../lib/permissions';
import { CameraFaceOverlay } from '../components/CameraFaceOverlay';
import { analyzeRealtime } from '../lib/api/analyze.ondevice.realtime';
import { FacePrediction } from '../lib/types';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<FacePrediction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Camera dimensions (assuming full screen)
  const cameraWidth = screenWidth;
  const cameraHeight = screenHeight;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to use this feature.
          </Text>
          <Button
            title="Grant Permission"
            onPress={async () => {
              const result = await requestPermission();
              if (!result.granted) {
                showPermissionDeniedAlert('Camera');
              }
            }}
            style={styles.permissionButton}
          />
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="secondary"
          />
        </View>
      </View>
    );
  }

  // Real-time face detection handler
  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  // Process camera frames for face detection
  const processFrame = useCallback(async () => {
    if (!cameraRef.current || isProcessing || !cameraReady) return;

    setIsProcessing(true);
    try {
      // Take a snapshot for analysis (low quality for speed)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        skipProcessing: true,
        base64: false,
      });

      if (photo?.uri) {
        // Analyze the frame
        const result = await analyzeRealtime(
          photo.uri,
          cameraWidth,
          cameraHeight,
        );
        setDetectedFaces(result.faces);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    } finally {
      setIsProcessing(false);
      // Schedule next frame processing (throttle to ~2 FPS for performance)
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      processingTimeoutRef.current = setTimeout(() => {
        processFrame();
      }, 500); // Process every 500ms
    }
  }, [cameraReady, isProcessing, cameraWidth, cameraHeight]);

  // Start processing when camera is ready
  useEffect(() => {
    if (cameraReady && !isProcessing) {
      processFrame();
    }
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [cameraReady, processFrame, isProcessing]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setCapturedUri(photo.uri);
        // Stop real-time processing when capturing
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleUsePhoto = async () => {
    if (!capturedUri) return;

    try {
      const optimizedUri = await optimizeImageForAnalysis(capturedUri);
      router.replace({
        pathname: '/results',
        params: { imageUri: optimizedUri },
      });
    } catch (error) {
      console.error('Error processing photo:', error);
      Alert.alert('Error', 'Failed to process photo. Please try again.');
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setDetectedFaces([]);
    // Resume real-time processing
    if (cameraReady && !isProcessing) {
      processFrame();
    }
  };

  if (capturedUri) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
        />
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Photo Captured</Text>
          <View style={styles.previewActions}>
            <Button
              title="Retake"
              onPress={handleRetake}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Use Photo"
              onPress={handleUsePhoto}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={handleCameraReady}
      />
      {/* Real-time face detection overlay */}
      {detectedFaces.length > 0 && (
        <CameraFaceOverlay
          faces={detectedFaces}
          cameraWidth={cameraWidth}
          cameraHeight={cameraHeight}
        />
      )}
      {/* Face count indicator */}
      {detectedFaces.length > 0 && (
        <View style={styles.faceCountContainer}>
          <Text style={styles.faceCountText}>
            {detectedFaces.length} {detectedFaces.length === 1 ? 'Face' : 'Faces'} Detected
          </Text>
        </View>
      )}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => router.back()}
        >
          <Text style={styles.controlButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}
          >
            <Text style={styles.controlButtonText}>
              {flash === 'on' ? '⚡' : '⚡'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <Text style={styles.controlButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    marginBottom: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  previewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  previewText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 24,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  faceCountContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    backgroundColor: 'rgba(0, 255, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  faceCountText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});

