// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { homeApi, HomepageData, CommunityPlaylist, MovieCard } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<HomepageData | null>(null);
  const [communityPlaylists, setCommunityPlaylists] = useState<CommunityPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [homeData, playlists] = await Promise.all([
        homeApi.getHomepage(),
        homeApi.getCommunityPlaylists(),
      ]);
      setData(homeData);
      setCommunityPlaylists(playlists);
    } catch (e: any) {
      setError(e.message || 'Failed to load homepage');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const ScoreBar = ({ score, color }: { score: number; color: string }) => (
    <View style={styles.scoreBarBg}>
      <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: color }]} />
    </View>
  );

  const MovieCard = ({ movie, onPress }: { movie: MovieCard; onPress: () => void }) => (
    <TouchableOpacity style={styles.movieCard} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: movie.poster || 'https://via.placeholder.com/150x220?text=No+Image' }}
        style={styles.moviePoster}
        resizeMode="cover"
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
        <Text style={styles.movieYear}>{movie.year}</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>★ {movie.overallScore}/100</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const Section = ({
    title,
    subtitle,
    movies,
    accentColor,
  }: {
    title: string;
    subtitle: string;
    movies: MovieCard[];
    accentColor: string;
  }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionAccent, { backgroundColor: accentColor }]} />
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <FlatList
        horizontal
        data={movies}
        keyExtractor={(item) => item.tmdbId.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <MovieCard
            movie={item}
            onPress={() => router.push(`/movie/${item.tmdbId}`)}
          />
        )}
      />
    </View>
  );

  const PlaylistCard = ({ playlist }: { playlist: CommunityPlaylist }) => {
    // FIX: properly render preview posters from the array
    const posters = playlist.previewPosters || [];

    return (
      <TouchableOpacity
        style={styles.playlistCard}
        onPress={() => router.push(`/playlist/${playlist.id}`)}
        activeOpacity={0.85}
      >
        {/* Poster grid - FIXED: was rendering empty fragment before */}
        <View style={styles.playlistPostersGrid}>
          {posters.length > 0 ? (
            posters.slice(0, 4).map((poster, idx) => (
              <Image
                key={idx}
                source={{ uri: poster }}
                style={[
                  styles.playlistPosterThumb,
                  posters.length === 1 && styles.playlistPosterFull,
                ]}
                resizeMode="cover"
              />
            ))
          ) : (
            <View style={styles.playlistPosterPlaceholder}>
              <Text style={styles.playlistPosterPlaceholderText}>📽️</Text>
            </View>
          )}
        </View>

        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName} numberOfLines={1}>{playlist.name}</Text>
          <Text style={styles.playlistMeta}>by {playlist.creator}</Text>
          <View style={styles.playlistStats}>
            <Text style={styles.playlistStatText}>🎬 {playlist.movieCount}</Text>
            <Text style={styles.playlistStatText}>❤️ {playlist.likes}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading HalalWatch...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HalalWatch</Text>
        <Text style={styles.headerSubtitle}>Discover movies with confidence</Text>
      </View>

      {/* FIX: Corrected section labels - low nudity = clean, not high score = clean */}
      {data && (
        <>
          <Section
            title="Nudity-Free"
            subtitle="Movies with lowest nudity scores"
            movies={data.nudityFree}
            accentColor="#22C55E"
          />
          <Section
            title="LGBT-Free"
            subtitle="Movies with no LGBT content"
            movies={data.lgbtFree}
            accentColor="#3B82F6"
          />
          <Section
            title="Bias-Free"
            subtitle="No anti-Islam or Arab bias"
            movies={data.biasFree}
            accentColor="#F59E0B"
          />
        </>
      )}

      {/* Community Playlists */}
      {communityPlaylists.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: '#A855F7' }]} />
            <View>
              <Text style={styles.sectionTitle}>Community Playlists</Text>
              <Text style={styles.sectionSubtitle}>Curated by the community</Text>
            </View>
          </View>
          <FlatList
            horizontal
            data={communityPlaylists}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => <PlaylistCard playlist={item} />}
          />
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', gap: 12 },
  loadingText: { color: '#94A3B8', fontSize: 14 },
  errorIcon: { fontSize: 40 },
  errorText: { color: '#F87171', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: '#22C55E', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  retryBtnText: { color: '#fff', fontWeight: '600' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -0.5,
  },
  headerSubtitle: { color: '#64748B', fontSize: 14, marginTop: 4 },

  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 12,
  },
  sectionAccent: { width: 4, height: 36, borderRadius: 2 },
  sectionTitle: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
  sectionSubtitle: { color: '#64748B', fontSize: 12, marginTop: 2 },

  movieCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  moviePoster: { width: '100%', height: CARD_WIDTH * 1.4 },
  movieInfo: { padding: 10 },
  movieTitle: { color: '#F1F5F9', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  movieYear: { color: '#64748B', fontSize: 11, marginTop: 3 },
  scoreBadge: {
    marginTop: 6,
    backgroundColor: '#0F2A1A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  scoreBadgeText: { color: '#22C55E', fontSize: 11, fontWeight: '700' },

  scoreBarBg: { height: 4, backgroundColor: '#1E293B', borderRadius: 2, marginTop: 4 },
  scoreBarFill: { height: 4, borderRadius: 2 },

  playlistCard: {
    width: 180,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  playlistPostersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 180,
    height: 120,
  },
  playlistPosterThumb: {
    width: 90,
    height: 60,
  },
  playlistPosterFull: {
    width: 180,
    height: 120,
  },
  playlistPosterPlaceholder: {
    width: 180,
    height: 120,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistPosterPlaceholderText: { fontSize: 32 },
  playlistInfo: { padding: 10 },
  playlistName: { color: '#F1F5F9', fontSize: 13, fontWeight: '700' },
  playlistMeta: { color: '#64748B', fontSize: 11, marginTop: 2 },
  playlistStats: { flexDirection: 'row', gap: 10, marginTop: 6 },
  playlistStatText: { color: '#94A3B8', fontSize: 11 },
});