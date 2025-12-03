import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Resize and compress image before analysis
 */
export async function optimizeImageForAnalysis(
  uri: string,
): Promise<string> {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return uri; // Return original if optimization fails
  }
}

/**
 * Generate thumbnail for history
 */
export async function generateThumbnail(uri: string): Promise<string> {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return uri; // Return original if thumbnail generation fails
  }
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Format age range for display
 */
export function formatAgeRange(min: number, max: number): string {
  return `${min}-${max} years`;
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

