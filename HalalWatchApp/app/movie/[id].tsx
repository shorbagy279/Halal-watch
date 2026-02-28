// app/movie/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Modal, FlatList, Dimensions
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { movieApi, playlistApi, MoviePageResponse, MyPlaylist } from '../../services/api';
import { ScoreGauge, VerdictBadge } from '../../components/ScoreGauge';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');
const POSTER_HEIGHT = height * 0.48;

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={Colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? Colors.scoreGood : score >= 50 ? Colors.scoreCaution : Colors.scoreBad;
  const pct = `${Math.round(score)}%`;

  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreRowLabel}>{label}</Text>
      <View style={styles.scoreRowBar}>
        <View style={[styles.scoreRowFill, { width: pct as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.scoreRowValue, { color }]}>{Math.round(score)}</Text>
    </View>
  );
}

function AddToPlaylistModal({
  visible,
  onClose,
  tmdbId,
  movieTitle,
  posterUrl,
}: {
  visible: boolean;
  onClose: () => void;
  tmdbId: number;
  movieTitle: string;
  posterUrl?: string;
}) {
  const [playlists, setPlaylists] = useState<MyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      playlistApi.getMine()
        .then(setPlaylists)
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const handleAdd = async (playlistId: number) => {
    setAdding(playlistId);
    try {
      await playlistApi.addMovie(playlistId, tmdbId, movieTitle, posterUrl);
      Alert.alert('Added!', `"${movieTitle}" added to playlist.`);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add movie');
    } finally {
      setAdding(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Add to Playlist</Text>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ padding: Spacing.xl }} />
          ) : playlists.length === 0 ? (
            <View style={styles.noPlaylistsMsg}>
              <Text style={styles.noPlaylistsText}>No playlists yet. Create one first!</Text>
              <TouchableOpacity
                style={styles.goCreateBtn}
                onPress={() => { onClose(); router.push('/(tabs)/playlists'); }}
              >
                <Text style={styles.goCreateText}>Go to Playlists →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(p) => String(p.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.playlistOption}
                  onPress={() => handleAdd(item.id)}
                  disabled={adding === item.id}
                >
                  <View>
                    <Text style={styles.playlistOptionName}>{item.name}</Text>
                    <Text style={styles.playlistOptionCount}>{item.movieCount} films</Text>
                  </View>
                  {adding === item.id ? (
                    <ActivityIndicator color={Colors.primary} size="small" />
                  ) : (
                    <Text style={styles.addText}>+ Add</Text>
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }}
            />
          )}
          <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function MovieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const tmdbId = parseInt(id);

  const [data, setData] = useState<MoviePageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    movieApi.getMovie(tmdbId)
      .then(setData)
      .catch(() => Alert.alert('Error', 'Could not load movie'))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  const handleAnalyze = async () => {
    if (!data) return;
    Alert.alert(
      'Start Analysis',
      `Analyze "${data.movie.title}" for halal content? This may take a minute.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Analyze',
          onPress: async () => {
            setAnalyzing(true);
            try {
              await movieApi.analyze(tmdbId, data.movie.title);
              const refreshed = await movieApi.getMovie(tmdbId);
              setData(refreshed);
              Alert.alert('Done!', 'Analysis complete.');
            } catch (e: any) {
              Alert.alert('Analysis Failed', e.message || 'Something went wrong.');
            } finally {
              setAnalyzing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.textMuted }}>Movie not found</Text>
      </View>
    );
  }

  const { movie, hasReport, report } = data;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Poster + gradient */}
        <View style={styles.posterSection}>
          <Image
            source={{ uri: movie.poster }}
            style={styles.poster}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(8,15,9,0.6)', Colors.background]}
            style={styles.posterGradient}
          />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BackIcon />
          </TouchableOpacity>

          {/* Title over poster */}
          <View style={styles.posterTitleArea}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <Text style={styles.movieYear}>{movie.year}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.analyzeBtn}
              onPress={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <ActivityIndicator color={Colors.textInverse} size="small" />
              ) : (
                <Text style={styles.analyzeBtnText}>
                  {hasReport ? '↻ Re-analyze' : '⚡ Analyze'}
                </Text>
              )}
            </TouchableOpacity>

            {isLoggedIn && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addBtnText}>+ Playlist</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Overview */}
          {movie.overview ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{movie.overview}</Text>
            </View>
          ) : null}

          {/* Safety Report */}
          {hasReport && report ? (
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Safety Report</Text>
                <VerdictBadge verdict={report.verdict} />
              </View>

              {/* Main Score */}
              <View style={styles.mainScoreSection}>
                <ScoreGauge score={report.overallScore} label="Overall" size="lg" />
                <View style={styles.mainScoreInfo}>
                  <Text style={styles.mainScoreLabel}>Halal Score</Text>
                  <Text style={styles.mainScoreDesc}>
                    Based on Reddit community analysis of content themes
                  </Text>
                  <Text style={styles.reportDate}>
                    Analyzed {new Date(report.generatedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Category Scores */}
              <View style={styles.categoryScores}>
                <Text style={styles.categoryTitle}>Category Breakdown</Text>
                <ScoreRow label="Nudity / Sexual Content" score={report.nudityScore} />
                <ScoreRow label="LGBT Themes" score={report.lgbtScore} />
                <ScoreRow label="Islam / Arab Representation" score={report.biasScore} />
              </View>
            </View>
          ) : (
            <View style={styles.noReportCard}>
              <Text style={styles.noReportEmoji}>📊</Text>
              <Text style={styles.noReportTitle}>No analysis yet</Text>
              <Text style={styles.noReportDesc}>
                Tap "Analyze" to scrape Reddit discussions and generate a halal safety score.
              </Text>
            </View>
          )}

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      <AddToPlaylistModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        tmdbId={tmdbId}
        movieTitle={movie.title}
        posterUrl={movie.poster}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Poster
  posterSection: {
    height: POSTER_HEIGHT,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '30%',
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: Spacing.base,
    width: 38,
    height: 38,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterTitleArea: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.base,
    right: Spacing.base,
  },
  movieTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  movieYear: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Content
  content: { paddingHorizontal: Spacing.base },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  analyzeBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    ...Shadows.greenGlow,
  },
  analyzeBtnText: {
    color: Colors.textInverse,
    fontWeight: '800',
    fontSize: Typography.sizes.base,
    letterSpacing: 0.3,
  },
  addBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  addBtnText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },

  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  overview: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  // Report card
  reportCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  reportTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  mainScoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mainScoreInfo: { flex: 1 },
  mainScoreLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  mainScoreDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  reportDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  categoryScores: {},
  categoryTitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  scoreRowLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    width: 140,
    lineHeight: 16,
  },
  scoreRowBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  scoreRowFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  scoreRowValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },

  // No report
  noReportCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  noReportEmoji: { fontSize: 40 },
  noReportTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  noReportDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  playlistOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  playlistOptionName: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  playlistOptionCount: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  noPlaylistsMsg: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  noPlaylistsText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.base,
    textAlign: 'center',
  },
  goCreateBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  goCreateText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  modalCancelBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: Typography.sizes.base,
  },
});