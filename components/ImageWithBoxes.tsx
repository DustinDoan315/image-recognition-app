import React, { useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { FacePrediction } from '../lib/types';
import { formatAgeRange, formatConfidence } from '../lib/utils';

interface ImageWithBoxesProps {
  imageUri: string;
  faces: FacePrediction[];
  imageWidth?: number;
  imageHeight?: number;
}

export const ImageWithBoxes: React.FC<ImageWithBoxesProps> = ({
  imageUri,
  faces,
  imageWidth,
  imageHeight,
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const containerWidth = screenWidth - 32; // Account for padding
  const aspectRatio = imageHeight && imageWidth ? imageWidth / imageHeight : 1;
  const displayHeight = containerWidth / aspectRatio;

  const svgElements = useMemo(() => {
    return faces.map((face, index) => {
      const x = face.bbox.x * containerWidth;
      const y = face.bbox.y * displayHeight;
      const width = face.bbox.width * containerWidth;
      const height = face.bbox.height * displayHeight;

      const labelY = y - 8;
      const labelText = `${formatAgeRange(face.age.min, face.age.max)} • ${
        face.gender.label
      } (${formatConfidence(face.gender.confidence)})`;

      return (
        <React.Fragment key={face.id}>
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            stroke="#007AFF"
            strokeWidth={2}
            fill="none"
            rx={4}
          />
          <Rect
            x={x}
            y={labelY - 24}
            width={Math.min(width, labelText.length * 7 + 16)}
            height={24}
            fill="#007AFF"
            rx={4}
          />
          <SvgText
            x={x + 8}
            y={labelY - 6}
            fontSize={12}
            fill="#fff"
            fontWeight="600"
          >
            {labelText}
          </SvgText>
        </React.Fragment>
      );
    });
  }, [faces, containerWidth, displayHeight]);

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, { width: containerWidth, height: displayHeight }]}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { width: containerWidth, height: displayHeight }]}
          resizeMode="contain"
        />
        {faces.length > 0 && (
          <Svg
            style={StyleSheet.absoluteFill}
            width={containerWidth}
            height={displayHeight}
          >
            {svgElements}
          </Svg>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    borderRadius: 12,
  },
});

