// app/movie/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { movieApi, playlistApi, MoviePageResponse, AnalysisResult, MyPlaylist } from '../../services/api';

const { width } = Dimensions.get('window');

const VERDICT_CONFIG = {
  APPROPRIATE: { color: '#22C55E', bg: '#0F2A1A', label: '✅ Halal Appropriate', icon: '✅' },
  CAUTION: { color: '#F59E0B', bg: '#2A1F0A', label: '⚠️ Use Caution', icon: '⚠️' },
  INAPPROPRIATE: { color: '#EF4444', bg: '#2A0A0A', label: '🚫 Not Appropriate', icon: '🚫' },
};

export default function MovieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tmdbId = parseInt(id || '0');
  const router = useRouter();

  const [movieData, setMovieData] = useState<MoviePageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState<MyPlaylist[]>([]);
  const [addingToPlaylist, setAddingToPlaylist] = useState<number | null>(null);

  useEffect(() => {
    fetchMovie();
  }, [tmdbId]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movieApi.getMovie(tmdbId);
      setMovieData(data);
      if (data.report) {
        // Map report to analysis result shape for display
        setAnalysisResult({
          message: 'Report loaded',
          movie: data.movie.title,
          overallScore: data.report.overallScore,
          verdict: data.report.verdict,
          nuditySexScore: data.report.nudityScore,
          lgbtScore: data.report.lgbtScore,
          islamArabBiasScore: data.report.biasScore,
          totalComments: 0,
        });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Analyze button now shows loading state and handles errors properly
  const handleAnalyze = async () => {
    if (!movieData) return;
    setAnalyzing(true);
    try {
      const result = await movieApi.analyze(tmdbId, movieData.movie.title);
      setAnalysisResult(result);
      // Refresh movie data to get updated hasReport
      const updated = await movieApi.getMovie(tmdbId);
      setMovieData(updated);
    } catch (e: any) {
      Alert.alert(
        'Analysis Failed',
        e.message.includes('10.0.2.2') || e.message.includes('Network')
          ? 'Cannot connect to server. Make sure your backend is running.'
          : e.message,
        [{ text: 'OK' }]
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddToPlaylist = async () => {
    try {
      const playlists = await playlistApi.getMine();
      setMyPlaylists(playlists);
      setShowAddPlaylist(true);
    } catch (e: any) {
      Alert.alert('Error', 'Please log in to add to playlists.');
    }
  };

  const confirmAddToPlaylist = async (playlistId: number) => {
    if (!movieData) return;
    setAddingToPlaylist(playlistId);
    try {
      await playlistApi.addMovie(
        playlistId,
        tmdbId,
        movieData.movie.title,
        movieData.movie.poster
      );
      setShowAddPlaylist(false);
      Alert.alert('Added!', `"${movieData.movie.title}" added to playlist.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const ScoreRow = ({
    label,
    score,
    color,
    description,
  }: {
    label: string;
    score: number;
    color: string;
    description: string;
  }) => (
    <View style={styles.scoreRow}>
      <View style={styles.scoreRowHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={[styles.scoreValue, { color }]}>{score}/100</Text>
      </View>
      <View style={styles.scoreBarBg}>
        <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.scoreDescription}>{description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (error || !movieData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Movie not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { movie } = movieData;
  const verdict = analysisResult
    ? VERDICT_CONFIG[analysisResult.verdict as keyof typeof VERDICT_CONFIG]
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButtonFloat} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster' }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.movieTitle}>{movie.title}</Text>
          <Text style={styles.movieYear}>{movie.year}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Overview */}
        {movie.overview ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Overview</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>
        ) : null}

        {/* Verdict banner */}
        {verdict && analysisResult && (
          <View style={[styles.verdictBanner, { backgroundColor: verdict.bg, borderColor: verdict.color }]}>
            <Text style={[styles.verdictLabel, { color: verdict.color }]}>{verdict.label}</Text>
            <Text style={[styles.verdictScore, { color: verdict.color }]}>
              Overall: {analysisResult.overallScore}/100
            </Text>
          </View>
        )}

        {/* Score breakdown */}
        {analysisResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Score Breakdown</Text>
            <Text style={styles.scoreNote}>Lower score = more of that content</Text>

            <ScoreRow
              label="Nudity/Sexual Content"
              score={analysisResult.nuditySexScore}
              color={analysisResult.nuditySexScore > 70 ? '#22C55E' : analysisResult.nuditySexScore > 40 ? '#F59E0B' : '#EF4444'}
              description={
                analysisResult.nuditySexScore > 70
                  ? 'Minimal or no nudity/sexual content'
                  : analysisResult.nuditySexScore > 40
                  ? 'Some sexual content present'
                  : 'Significant sexual content'
              }
            />
            <ScoreRow
              label="LGBT Content"
              score={analysisResult.lgbtScore}
              color={analysisResult.lgbtScore > 70 ? '#22C55E' : analysisResult.lgbtScore > 40 ? '#F59E0B' : '#EF4444'}
              description={
                analysisResult.lgbtScore > 70
                  ? 'No LGBT themes'
                  : analysisResult.lgbtScore > 40
                  ? 'Minor LGBT themes'
                  : 'Significant LGBT content'
              }
            />
            <ScoreRow
              label="Islam/Arab Bias"
              score={analysisResult.islamArabBiasScore}
              color={analysisResult.islamArabBiasScore > 70 ? '#22C55E' : analysisResult.islamArabBiasScore > 40 ? '#F59E0B' : '#EF4444'}
              description={
                analysisResult.islamArabBiasScore > 70
                  ? 'No anti-Islam or Arab bias detected'
                  : analysisResult.islamArabBiasScore > 40
                  ? 'Some questionable portrayals'
                  : 'Significant anti-Islam/Arab bias'
              }
            />
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* FIX: Analyze button with proper loading state */}
          {!movieData.hasReport && !analysisResult && (
            <TouchableOpacity
              style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
              onPress={handleAnalyze}
              disabled={analyzing}
              activeOpacity={0.8}
            >
              {analyzing ? (
                <View style={styles.analyzingContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.analyzeBtnText}>Analyzing... (may take 30s)</Text>
                </View>
              ) : (
                <Text style={styles.analyzeBtnText}>🔍 Analyze This Movie</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.addPlaylistBtn}
            onPress={handleAddToPlaylist}
            activeOpacity={0.8}
          >
            <Text style={styles.addPlaylistBtnText}>+ Add to Playlist</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add to Playlist Modal */}
      <Modal
        visible={showAddPlaylist}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddPlaylist(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Playlist</Text>
            {myPlaylists.length === 0 ? (
              <Text style={styles.modalEmpty}>No playlists yet. Create one first!</Text>
            ) : (
              <FlatList
                data={myPlaylists}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.playlistItem}
                    onPress={() => confirmAddToPlaylist(item.id)}
                    disabled={addingToPlaylist === item.id}
                  >
                    {addingToPlaylist === item.id ? (
                      <ActivityIndicator size="small" color="#22C55E" />
                    ) : (
                      <>
                        <Text style={styles.playlistItemName}>{item.name}</Text>
                        <Text style={styles.playlistItemMeta}>{item.movieCount} movies</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowAddPlaylist(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', gap: 12 },
  errorText: { color: '#F87171', fontSize: 14 },
  backBtn: { padding: 12 },
  backBtnText: { color: '#22C55E', fontSize: 16 },

  backButtonFloat: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { color: '#fff', fontSize: 20 },

  hero: { height: 400, position: 'relative' },
  poster: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  movieTitle: { color: '#fff', fontSize: 26, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  movieYear: { color: '#94A3B8', fontSize: 14, marginTop: 4 },

  content: { padding: 16, gap: 16 },

  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
  },
  cardTitle: { color: '#F1F5F9', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  overview: { color: '#94A3B8', fontSize: 14, lineHeight: 22 },

  verdictBanner: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
  },
  verdictLabel: { fontSize: 18, fontWeight: '800' },
  verdictScore: { fontSize: 14, marginTop: 4, opacity: 0.8 },

  scoreNote: { color: '#64748B', fontSize: 12, marginBottom: 16, fontStyle: 'italic' },
  scoreRow: { marginBottom: 16 },
  scoreRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scoreLabel: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },
  scoreValue: { fontSize: 13, fontWeight: '700' },
  scoreBarBg: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: 6, borderRadius: 3 },
  scoreDescription: { color: '#64748B', fontSize: 11, marginTop: 4 },

  actions: { gap: 12 },

  analyzeBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  analyzeBtnDisabled: { backgroundColor: '#1A5E32', opacity: 0.8 },
  analyzingContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  addPlaylistBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    alignItems: 'center',
  },
  addPlaylistBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: { color: '#F1F5F9', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalEmpty: { color: '#64748B', textAlign: 'center', padding: 20 },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  playlistItemName: { color: '#F1F5F9', fontSize: 15, fontWeight: '600' },
  playlistItemMeta: { color: '#64748B', fontSize: 12 },
  modalCloseBtn: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  modalCloseBtnText: { color: '#94A3B8', fontWeight: '600' },
});