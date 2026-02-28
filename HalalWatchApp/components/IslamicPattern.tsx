// components/IslamicPattern.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Polygon, Circle } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface IslamicPatternProps {
  size?: number;
  opacity?: number;
  color?: string;
}

export function IslamicPattern({
  size = 120,
  opacity = 0.06,
  color = Colors.primary,
}: IslamicPatternProps) {
  return (
    <View style={{ opacity }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* 8-pointed star (Rub el Hizb) */}
        <G fill={color} fillRule="evenodd">
          {/* Outer octagram */}
          <Polygon
            points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
          {/* Inner circle */}
          <Circle cx="50" cy="50" r="12" fill="none" stroke={color} strokeWidth="1" />
          {/* Center dot */}
          <Circle cx="50" cy="50" r="3" fill={color} />
          {/* Cross lines */}
          <Path d="M50 20 L50 80 M20 50 L80 50" stroke={color} strokeWidth="0.8" opacity="0.5" />
          <Path d="M29 29 L71 71 M71 29 L29 71" stroke={color} strokeWidth="0.8" opacity="0.5" />
        </G>
      </Svg>
    </View>
  );
}

export function ArabicBorderPattern({
  width = 300,
  height = 4,
  color = Colors.primary,
  opacity = 0.3,
}: {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}) {
  const segments = Math.floor(width / 20);
  return (
    <View style={{ opacity }}>
      <Svg width={width} height={height * 6} viewBox={`0 0 ${width} ${height * 6}`}>
        <G fill={color}>
          {Array.from({ length: segments }).map((_, i) => (
            <G key={i} transform={`translate(${i * 20}, 0)`}>
              <Polygon
                points={`10,0 20,${height * 3} 10,${height * 6} 0,${height * 3}`}
                fill="none"
                stroke={color}
                strokeWidth="0.8"
              />
            </G>
          ))}
        </G>
      </Svg>
    </View>
  );
}