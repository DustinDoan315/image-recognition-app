import { AnalysisResult } from '../types';
import { apiClient } from './client';

/**
 * Real API implementation for face analysis
 * Use this when backend API is ready
 */
export async function analyzeReal(imageUri: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);

  const response = await apiClient.post<AnalysisResult>('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

