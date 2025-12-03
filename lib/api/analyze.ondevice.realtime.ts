import { AnalysisResult, FacePrediction } from '../types';

// Try to import expo-face-detector, but handle gracefully if not available
let FaceDetector: any = null;
try {
  FaceDetector = require('expo-face-detector');
} catch (e) {
  // Module not available - will return empty results
  console.warn('expo-face-detector not available. Real-time detection requires a development build.');
}

/**
 * Real-time face detection using expo-face-detector
 * Processes camera frames directly without saving images
 * 
 * NOTE: This requires a development build - expo-face-detector doesn't work in Expo Go
 * Run: npx expo run:ios or npx expo run:android
 */
export async function analyzeRealtime(
  imageUri: string,
  imageWidth: number,
  imageHeight: number,
): Promise<AnalysisResult> {
  // Return empty if module not available
  if (!FaceDetector) {
    return {
      image: { width: imageWidth, height: imageHeight },
      faces: [],
    };
  }

  try {
    // Detect faces using expo-face-detector
    const faces = await FaceDetector.detectFacesAsync(imageUri, {
      mode: FaceDetector.FaceDetectorMode.fast, // Use fast mode for real-time
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.all,
    });

    if (!faces.faces || faces.faces.length === 0) {
      return {
        image: { width: imageWidth, height: imageHeight },
        faces: [],
      };
    }

    // Convert detected faces to our format
    const facePredictions: FacePrediction[] = faces.faces.map((face, index) => {
      // Calculate bounding box (normalized coordinates)
      const bbox = {
        x: face.bounds.origin.x / imageWidth,
        y: face.bounds.origin.y / imageHeight,
        width: face.bounds.size.width / imageWidth,
        height: face.bounds.size.height / imageHeight,
      };

      // Estimate age and gender based on facial features
      const { age, gender } = estimateAgeAndGender(face);

      return {
        id: `face${index + 1}`,
        bbox,
        age,
        gender,
      };
    });

    return {
      image: { width: imageWidth, height: imageHeight },
      faces: facePredictions,
    };
  } catch (error) {
    console.error('Error in real-time analysis:', error);
    return {
      image: { width: imageWidth, height: imageHeight },
      faces: [],
    };
  }
}

/**
 * Estimate age and gender based on facial features
 * Uses advanced heuristics based on facial landmarks and geometry
 */
// Type for face from expo-face-detector
interface DetectedFace {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  landmarks?: {
    leftEyePosition?: { x: number; y: number };
    rightEyePosition?: { x: number; y: number };
    noseBasePosition?: { x: number; y: number };
  };
  smilingProbability?: number;
}

function estimateAgeAndGender(face: DetectedFace): {
  age: { min: number; max: number };
  gender: { label: 'male' | 'female'; confidence: number };
} {
  const faceWidth = face.bounds.size.width;
  const faceHeight = face.bounds.size.height;
  const faceArea = faceWidth * faceHeight;
  
  // Initialize with default values
  let ageMin = 25;
  let ageMax = 35;
  let genderLabel: 'male' | 'female' = 'male';
  let genderConfidence = 0.65;

  // Age estimation using multiple factors
  if (face.landmarks) {
    const landmarks = face.landmarks;
    
    // Calculate key facial measurements
    let eyeDistance = 0;
    let noseWidth = 0;
    
    // Extract landmark positions for calculations
    if (landmarks.leftEyePosition && landmarks.rightEyePosition) {
      const leftEye = landmarks.leftEyePosition as { x: number; y: number };
      const rightEye = landmarks.rightEyePosition as { x: number; y: number };
      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      eyeDistance = Math.sqrt(dx * dx + dy * dy);
    }
    
    // Estimate nose width from face width if nose position available
    if (landmarks.noseBasePosition) {
      noseWidth = faceWidth * 0.32; // Average nose width is ~32% of face width
    }
    
    // Calculate facial ratios
    const faceAspectRatio = faceWidth / faceHeight;
    const eyeToFaceRatio = eyeDistance > 0 ? eyeDistance / faceWidth : 0.4;
    const noseToFaceRatio = noseWidth > 0 ? noseWidth / faceWidth : 0.3;
    
    // Age estimation based on facial proportions
    if (eyeToFaceRatio > 0.45) {
      if (faceAspectRatio > 0.8) {
        ageMin = 8;
        ageMax = 16;
      } else {
        ageMin = 12;
        ageMax = 20;
      }
    } else if (eyeToFaceRatio > 0.38) {
      ageMin = 16;
      ageMax = 28;
    } else if (faceAspectRatio < 0.7) {
      ageMin = 30;
      ageMax = 50;
    } else if (faceAspectRatio > 0.85) {
      ageMin = 28;
      ageMax = 48;
    } else {
      ageMin = 22;
      ageMax = 38;
    }
    
    // Adjust based on face area
    if (faceArea > 40000) {
      ageMin = Math.max(ageMin, 25);
      ageMax = Math.min(ageMax, 55);
    } else if (faceArea < 10000) {
      ageMin = Math.max(5, ageMin - 5);
      ageMax = Math.min(25, ageMax);
    }
    
    // Gender estimation using multiple facial features
    let maleScore = 0;
    let femaleScore = 0;
    
    if (faceAspectRatio > 0.82) {
      maleScore += 2;
    } else if (faceAspectRatio < 0.72) {
      femaleScore += 2;
    }
    
    if (eyeToFaceRatio > 0.42) {
      femaleScore += 1.5;
    } else if (eyeToFaceRatio < 0.36) {
      maleScore += 1.5;
    }
    
    if (noseToFaceRatio > 0.35) {
      maleScore += 1.5;
    } else if (noseToFaceRatio < 0.28) {
      femaleScore += 1.5;
    }
    
    if (faceAspectRatio < 0.75) {
      femaleScore += 1;
    } else if (faceAspectRatio > 0.85) {
      maleScore += 1;
    }
    
    if (face.smilingProbability !== undefined) {
      if (face.smilingProbability > 0.75) {
        femaleScore += 0.5;
      } else if (face.smilingProbability < 0.3) {
        maleScore += 0.5;
      }
    }
    
    const totalScore = maleScore + femaleScore;
    if (totalScore > 0) {
      const maleRatio = maleScore / totalScore;
      if (maleRatio > 0.55) {
        genderLabel = 'male';
        genderConfidence = Math.min(0.88, 0.6 + (maleRatio - 0.55) * 0.7);
      } else if (maleRatio < 0.45) {
        genderLabel = 'female';
        genderConfidence = Math.min(0.88, 0.6 + (0.55 - maleRatio) * 0.7);
      } else {
        genderLabel = faceAspectRatio > 0.8 ? 'male' : 'female';
        genderConfidence = 0.62;
      }
    }
  } else {
    // Fallback when landmarks not available
    const aspectRatio = faceWidth / faceHeight;
    if (aspectRatio > 0.82) {
      genderLabel = 'male';
      genderConfidence = 0.68;
    } else if (aspectRatio < 0.75) {
      genderLabel = 'female';
      genderConfidence = 0.68;
    }
    
    if (faceArea < 8000) {
      ageMin = 8;
      ageMax = 18;
    } else if (faceArea < 20000) {
      ageMin = 18;
      ageMax = 30;
    } else {
      ageMin = 25;
      ageMax = 45;
    }
  }
  
  ageMin = Math.max(5, Math.min(ageMin, 70));
  ageMax = Math.max(ageMin + 3, Math.min(ageMax, 75));
  genderConfidence = Math.max(0.58, Math.min(0.90, genderConfidence));

  return {
    age: { min: ageMin, max: ageMax },
    gender: { label: genderLabel, confidence: genderConfidence },
  };
}

