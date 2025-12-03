export interface FacePrediction {
  id: string;
  bbox: {
    x: number;      // Normalized 0-1
    y: number;      // Normalized 0-1
    width: number;  // Normalized 0-1
    height: number; // Normalized 0-1
  };
  age: {
    min: number;
    max: number;
  };
  gender: {
    label: "male" | "female";
    confidence: number; // 0-1
  };
}

export interface AnalysisResult {
  image: {
    width: number;
    height: number;
  };
  faces: FacePrediction[];
}

export interface ScanEntry {
  id: string;
  createdAt: number;
  thumbnailUri: string;
  faces: FacePrediction[];
  imageUri?: string;
}

