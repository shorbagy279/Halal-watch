// components/ScoreGauge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../constants/theme';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number) {
  if (score >= 75) return Colors.scoreGood;
  if (score >= 50) return Colors.scoreCaution;
  return Colors.scoreBad;
}

export function ScoreGauge({ score, label, size = 'md' }: ScoreGaugeProps) {
  const dimensions = { sm: 56, md: 76, lg: 100 };
  const dim = dimensions[size];
  const radius = (dim - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const fontSize = size === 'sm' ? 12 : size === 'md' ? 16 : 22;
  const labelSize = size === 'sm' ? 8 : size === 'md' ? 10 : 12;

  return (
    <View style={styles.container}>
      <Svg width={dim} height={dim} style={{ transform: [{ rotate: '-90deg' }] }}>
        <G>
          <Circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={Colors.surfaceHigh}
            strokeWidth={size === 'sm' ? 4 : 6}
          />
          <Circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={size === 'sm' ? 4 : 6}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={[styles.center, { width: dim, height: dim }]}>
        <Text style={[styles.score, { fontSize, color }]}>{Math.round(score)}</Text>
        {size !== 'sm' && (
          <Text style={[styles.label, { fontSize: labelSize }]}>{label}</Text>
        )}
      </View>
    </View>
  );
}

export function VerdictBadge({ verdict }: { verdict: string }) {
  const config = {
    APPROPRIATE: { color: Colors.verdictAppropriate, bg: 'rgba(46,204,113,0.12)', label: '✓ Appropriate' },
    CAUTION: { color: Colors.verdictCaution, bg: 'rgba(243,156,18,0.12)', label: '⚠ Caution' },
    INAPPROPRIATE: { color: Colors.verdictInappropriate, bg: 'rgba(231,76,60,0.12)', label: '✕ Inappropriate' },
  };
  const c = config[verdict as keyof typeof config] || config.CAUTION;

  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.color }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: {
    color: Colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 1,
    letterSpacing: 0.3,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});