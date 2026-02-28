// components/MovieCard.tsx
import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';
import { ScoreGauge } from './ScoreGauge';

const CARD_WIDTH = (Dimensions.get('window').width - 48 - 12) / 2;

interface MovieCardProps {
  tmdbId: number;
  title: string;
  poster: string;
  year?: string;
  overallScore?: number;
  mpaRating?: string;
  compact?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 75) return Colors.scoreGood;
  if (score >= 50) return Colors.scoreCaution;
  return Colors.scoreBad;
}

export function MovieCard({
  tmdbId,
  title,
  poster,
  year,
  overallScore,
  mpaRating,
  compact = false,
}: MovieCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => router.push(`/movie/${tmdbId}`)}
      activeOpacity={0.85}
    >
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: poster || 'https://via.placeholder.com/200x300/0D1A10/2ECC71' }}
          style={[styles.poster, compact && styles.posterCompact]}
          resizeMode="cover"
        />
        {overallScore !== undefined && (
          <View style={[
            styles.scorePill,
            { backgroundColor: getScoreColor(overallScore) + '22', borderColor: getScoreColor(overallScore) + '55' }
          ]}>
            <Text style={[styles.scorePillText, { color: getScoreColor(overallScore) }]}>
              {Math.round(overallScore)}
            </Text>
          </View>
        )}
        {mpaRating && mpaRating !== 'N/A' && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{mpaRating}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {year && <Text style={styles.year}>{year}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export function MovieListItem({
  tmdbId,
  title,
  poster,
  year,
  overallScore,
}: MovieCardProps) {
  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => router.push(`/movie/${tmdbId}`)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: poster || 'https://via.placeholder.com/60x90/0D1A10/2ECC71' }}
        style={styles.listPoster}
        resizeMode="cover"
      />
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={2}>{title}</Text>
        {year && <Text style={styles.listYear}>{year}</Text>}
      </View>
      {overallScore !== undefined && (
        <ScoreGauge score={overallScore} label="" size="sm" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  cardCompact: {
    width: 130,
    marginRight: Spacing.md,
  },
  posterContainer: {
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    backgroundColor: Colors.surface,
  },
  posterCompact: {
    height: 130 * 1.5,
  },
  scorePill: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  scorePillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  info: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  year: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  // List item styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  listPoster: {
    width: 48,
    height: 72,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  listYear: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
});