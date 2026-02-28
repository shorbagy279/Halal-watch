// app/(tabs)/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { homeApi, HomepageData, CommunityPlaylist } from '../../services/api';
import { MovieCard } from '../../components/MovieCard';
import { IslamicPattern } from '../../components/IslamicPattern';

const { width } = Dimensions.get('window');

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function CommunityPlaylistCard({ item }: { item: CommunityPlaylist }) {
  return (
    <TouchableOpacity
      style={styles.communityCard}
      onPress={() => router.push(`/playlist/${item.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.communityPosters}>
        {item.previewPosters.slice(0, 4).map((p, i) => (
          <View
            key={i}
            style={[
              styles.communityPosterSlot,
              { left: i * 18, zIndex: 4 - i }
            ]}
          >
            {p ? (
              <React.Fragment>
                {/* Image would load here */}
              </React.Fragment>
            ) : null}
          </View>
        ))}
      </View>
      <View style={styles.communityInfo}>
        <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.communityMeta}>
          by {item.creator} · {item.movieCount} films
        </Text>
        <View style={styles.communityFooter}>
          <Text style={styles.communityLikes}>♥ {item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [community, setCommunity] = useState<CommunityPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [homeData, communityData] = await Promise.all([
        homeApi.getHomepage(),
        homeApi.getCommunityPlaylists(),
      ]);
      setData(homeData);
      setCommunity(communityData);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Hero Header */}
        <View style={styles.hero}>
          <LinearGradient
            colors={['#0A2010', Colors.background]}
            style={styles.heroGradient}
          />
          <View style={styles.heroPatternTopRight}>
            <IslamicPattern size={160} opacity={0.07} />
          </View>
          <View style={styles.heroPatternBottomLeft}>
            <IslamicPattern size={100} opacity={0.05} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Text style={styles.logoMarkText}>هـ</Text>
              </View>
              <View>
                <Text style={styles.appName}>HalalWatch</Text>
                <Text style={styles.appTagline}>Family-Safe Cinema Guide</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <Text style={styles.heroSubtitle}>
              Discover movies rated for content that matters to your family
            </Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Nudity-Free Section */}
            {data?.nudityFree && data.nudityFree.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Clean Content"
                  subtitle="Low nudity & sexual content scores"
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {data.nudityFree.map((movie) => (
                    <MovieCard
                      key={movie.tmdbId}
                      tmdbId={movie.tmdbId}
                      title={movie.title}
                      poster={movie.poster}
                      year={movie.year}
                      overallScore={movie.overallScore}
                      mpaRating={movie.mpaRating}
                      compact
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* LGBT-Free Section */}
            {data?.lgbtFree && data.lgbtFree.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Family Values"
                  subtitle="Traditional content for all ages"
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {data.lgbtFree.map((movie) => (
                    <MovieCard
                      key={movie.tmdbId}
                      tmdbId={movie.tmdbId}
                      title={movie.title}
                      poster={movie.poster}
                      year={movie.year}
                      overallScore={movie.overallScore}
                      compact
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Bias-Free Section */}
            {data?.biasFree && data.biasFree.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Fair Representation"
                  subtitle="No anti-Islamic or anti-Arab bias"
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {data.biasFree.map((movie) => (
                    <MovieCard
                      key={movie.tmdbId}
                      tmdbId={movie.tmdbId}
                      title={movie.title}
                      poster={movie.poster}
                      year={movie.year}
                      overallScore={movie.overallScore}
                      compact
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Community Playlists */}
            {community.length > 0 && (
              <View style={[styles.section, { marginBottom: 100 }]}>
                <SectionHeader
                  title="Community Picks"
                  subtitle="Curated by the community"
                />
                {community.slice(0, 5).map((p) => (
                  <CommunityPlaylistCard key={p.id} item={p} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Hero
  hero: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPatternTopRight: {
    position: 'absolute',
    top: -20,
    right: -20,
    opacity: 1,
  },
  heroPatternBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    opacity: 1,
  },
  heroContent: { position: 'relative', zIndex: 1 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  logoMark: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '700',
  },
  appName: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
    marginLeft: 11,
    letterSpacing: 0.2,
  },
  horizontalList: {
    gap: Spacing.md,
    paddingRight: Spacing.base,
  },

  // Community
  communityCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  communityPosters: {
    width: 72,
    height: 48,
    position: 'relative',
  },
  communityPosterSlot: {
    position: 'absolute',
    width: 32,
    height: 48,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  communityInfo: { flex: 1 },
  communityName: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  communityMeta: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  communityFooter: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  communityLikes: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Error
  errorContainer: {
    margin: Spacing.base,
    padding: Spacing.xl,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    color: Colors.scoreBad,
    fontSize: Typography.sizes.base,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  retryText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: Typography.sizes.sm,
  },
});