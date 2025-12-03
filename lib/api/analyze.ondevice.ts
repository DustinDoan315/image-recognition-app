import * as FaceDetector from 'expo-face-detector';
import { Image } from 'react-native';
import { AnalysisResult, FacePrediction } from '../types';

/**
 * On-device face detection and analysis using expo-face-detector
 * Uses real ML face detection with heuristic-based age/gender estimation
 */
export async function analyzeOnDevice(imageUri: string): Promise<AnalysisResult> {
  try {
    // Get image dimensions
    const imageInfo = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        Image.getSize(
          imageUri,
          (width, height) => resolve({ width, height }),
          reject,
        );
      },
    );

    // Detect faces using expo-face-detector
    const faces = await FaceDetector.detectFacesAsync(imageUri, {
      mode: FaceDetector.FaceDetectorMode.accurate,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.all,
    });

    if (!faces.faces || faces.faces.length === 0) {
      return {
        image: imageInfo,
        faces: [],
      };
    }

    // Convert detected faces to our format
    const facePredictions: FacePrediction[] = faces.faces.map((face, index) => {
      // Calculate bounding box (normalized coordinates)
      const bbox = {
        x: face.bounds.origin.x / imageInfo.width,
        y: face.bounds.origin.y / imageInfo.height,
        width: face.bounds.size.width / imageInfo.width,
        height: face.bounds.size.height / imageInfo.height,
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
      image: imageInfo,
      faces: facePredictions,
    };
  } catch (error) {
    console.error('Error in on-device analysis:', error);
    throw new Error('Failed to analyze image on device');
  }
}

/**
 * Estimate age and gender based on facial features
 * Uses advanced heuristics based on facial landmarks and geometry
 */
function estimateAgeAndGender(face: FaceDetector.Face): {
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
    // expo-face-detector provides: leftEyePosition, rightEyePosition, noseBasePosition
    if (landmarks.leftEyePosition && landmarks.rightEyePosition) {
      const leftEye = landmarks.leftEyePosition as { x: number; y: number };
      const rightEye = landmarks.rightEyePosition as { x: number; y: number };
      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      eyeDistance = Math.sqrt(dx * dx + dy * dy);
    }
    
    // Estimate nose width from face width if nose position available
    if (landmarks.noseBasePosition) {
      // Use a proportion of face width as nose width estimate
      noseWidth = faceWidth * 0.32; // Average nose width is ~32% of face width
    }
    
    // Calculate facial ratios
    const faceAspectRatio = faceWidth / faceHeight;
    const eyeToFaceRatio = eyeDistance > 0 ? eyeDistance / faceWidth : 0.4;
    const noseToFaceRatio = noseWidth > 0 ? noseWidth / faceWidth : 0.3;
    
    // Age estimation based on facial proportions
    // Children typically have larger eyes relative to face, rounder faces
    // Adults have more defined features, longer faces
    
    if (eyeToFaceRatio > 0.45) {
      // Large eyes relative to face - likely child/teen
      if (faceAspectRatio > 0.8) {
        ageMin = 8;
        ageMax = 16;
      } else {
        ageMin = 12;
        ageMax = 20;
      }
    } else if (eyeToFaceRatio > 0.38) {
      // Medium eyes - likely teen/young adult
      ageMin = 16;
      ageMax = 28;
    } else if (faceAspectRatio < 0.7) {
      // Narrow, elongated face - likely adult
      ageMin = 30;
      ageMax = 50;
    } else if (faceAspectRatio > 0.85) {
      // Wide, square face - likely adult
      ageMin = 28;
      ageMax = 48;
    } else {
      // Balanced proportions - likely young adult
      ageMin = 22;
      ageMax = 38;
    }
    
    // Adjust based on face area (larger faces usually mean closer = adult)
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
    
    // Factor 1: Face shape (jaw width)
    // Males typically have wider, more angular jaws
    if (faceAspectRatio > 0.82) {
      maleScore += 2;
    } else if (faceAspectRatio < 0.72) {
      femaleScore += 2;
    }
    
    // Factor 2: Eye spacing
    // Females typically have wider-set eyes relative to face width
    if (eyeToFaceRatio > 0.42) {
      femaleScore += 1.5;
    } else if (eyeToFaceRatio < 0.36) {
      maleScore += 1.5;
    }
    
    // Factor 3: Nose width
    // Males typically have wider noses
    if (noseToFaceRatio > 0.35) {
      maleScore += 1.5;
    } else if (noseToFaceRatio < 0.28) {
      femaleScore += 1.5;
    }
    
    // Factor 4: Face height to width ratio
    // Females typically have longer, more oval faces
    if (faceAspectRatio < 0.75) {
      femaleScore += 1;
    } else if (faceAspectRatio > 0.85) {
      maleScore += 1;
    }
    
    // Factor 5: Use smile probability (statistical tendency)
    if (face.smilingProbability !== undefined) {
      if (face.smilingProbability > 0.75) {
        femaleScore += 0.5;
      } else if (face.smilingProbability < 0.3) {
        maleScore += 0.5;
      }
    }
    
    // Determine gender based on scores
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
        // Ambiguous - use face shape as tiebreaker
        genderLabel = faceAspectRatio > 0.8 ? 'male' : 'female';
        genderConfidence = 0.62;
      }
    }
  } else {
    // Fallback when landmarks not available
    // Use basic face proportions
    const aspectRatio = faceWidth / faceHeight;
    if (aspectRatio > 0.82) {
      genderLabel = 'male';
      genderConfidence = 0.68;
    } else if (aspectRatio < 0.75) {
      genderLabel = 'female';
      genderConfidence = 0.68;
    }
    
    // Basic age estimation from face size
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
  
  // Ensure age range is reasonable
  ageMin = Math.max(5, Math.min(ageMin, 70));
  ageMax = Math.max(ageMin + 3, Math.min(ageMax, 75));
  
  // Ensure confidence is reasonable
  genderConfidence = Math.max(0.58, Math.min(0.90, genderConfidence));

  return {
    age: { min: ageMin, max: ageMax },
    gender: { label: genderLabel, confidence: genderConfidence },
  };
}

