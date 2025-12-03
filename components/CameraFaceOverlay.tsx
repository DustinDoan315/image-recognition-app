import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { FacePrediction } from '../lib/types';
import { formatAgeRange, formatConfidence } from '../lib/utils';

interface CameraFaceOverlayProps {
  faces: FacePrediction[];
  cameraWidth: number;
  cameraHeight: number;
}

export const CameraFaceOverlay: React.FC<CameraFaceOverlayProps> = ({
  faces,
  cameraWidth,
  cameraHeight,
}) => {
  if (faces.length === 0) {
    return null;
  }

  const svgElements = faces.map((face) => {
    const x = face.bbox.x * cameraWidth;
    const y = face.bbox.y * cameraHeight;
    const width = face.bbox.width * cameraWidth;
    const height = face.bbox.height * cameraHeight;

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
          stroke="#00FF00"
          strokeWidth={3}
          fill="none"
          rx={4}
        />
        <Rect
          x={x}
          y={labelY - 28}
          width={Math.min(width, labelText.length * 7 + 16)}
          height={28}
          fill="#00FF00"
          rx={4}
          opacity={0.9}
        />
        <SvgText
          x={x + 8}
          y={labelY - 8}
          fontSize={12}
          fill="#000"
          fontWeight="700"
        >
          {labelText}
        </SvgText>
      </React.Fragment>
    );
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={cameraWidth} height={cameraHeight}>
        {svgElements}
      </Svg>
    </View>
  );
};

