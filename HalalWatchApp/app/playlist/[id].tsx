// app/playlist/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { playlistApi, PlaylistDetail } from '../../services/api';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const playlistId = parseInt(id || '0');
  const router = useRouter();

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIX: likes state initialized from actual playlist data
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const data = await playlistApi.getPlaylist(playlistId);
      setPlaylist(data);
      // FIX: populate likes from actual data if available
      // The PlaylistDetail type may include likes - use it
      const anyData = data as any;
      setLikesCount(anyData.likes ?? 0);
      setLiked(anyData.isLikedByUser ?? false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Like button now calls API and updates state from response
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((prev) => prev + (wasLiked ? -1 : 1));

    try {
      const result = await playlistApi.toggleLike(playlistId);
      // Update with server truth
      setLiked(result.liked);
      setLikesCount(result.likes);
    } catch (e: any) {
      // Revert on failure
      setLiked(wasLiked);
      setLikesCount((prev) => prev + (wasLiked ? 1 : -1));
      Alert.alert('Error', 'Please log in to like playlists.');
    } finally {
      setLiking(false);
    }
  };

  const handleRemoveMovie = async (tmdbId: number, title: string) => {
    Alert.alert('Remove Movie', `Remove "${title}" from this playlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await playlistApi.removeMovie(playlistId, tmdbId);
            setPlaylist((prev) =>
              prev
                ? {
                    ...prev,
                    movies: prev.movies.filter((m) => m.tmdbId !== tmdbId),
                  }
                : prev
            );
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (error || !playlist) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Playlist not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.playlistName} numberOfLines={2}>{playlist.name}</Text>
          {playlist.description ? (
            <Text style={styles.playlistDesc} numberOfLines={2}>{playlist.description}</Text>
          ) : null}
          <Text style={styles.playlistOwner}>by {playlist.owner}</Text>
        </View>
        {/* FIX: Like button with real count from API */}
        <TouchableOpacity
          onPress={handleLike}
          style={[styles.likeButton, liked && styles.likeButtonActive]}
          disabled={liking}
        >
          {liking ? (
            <ActivityIndicator size="small" color={liked ? '#EF4444' : '#64748B'} />
          ) : (
            <>
              <Text style={styles.likeIcon}>{liked ? '❤️' : '🤍'}</Text>
              <Text style={[styles.likeCount, liked && styles.likeCountActive]}>
                {likesCount}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Movie count */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          🎬 {playlist.movies.length} {playlist.movies.length === 1 ? 'movie' : 'movies'}
        </Text>
        {playlist.isPublic && <Text style={styles.publicBadge}>Public</Text>}
      </View>

      {/* Movies list */}
      <FlatList
        data={playlist.movies}
        keyExtractor={(item) => item.tmdbId.toString()}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.movieItem}
            onPress={() => router.push(`/movie/${item.tmdbId}`)}
            activeOpacity={0.85}
          >
            <Image
              source={{
                uri: item.posterUrl || 'https://via.placeholder.com/60x90?text=?',
              }}
              style={styles.moviePoster}
              resizeMode="cover"
            />
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle} numberOfLines={2}>{item.movieTitle}</Text>
              <Text style={styles.addedAt}>
                Added {new Date(item.addedAt).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveMovie(item.tmdbId, item.movieTitle)}
              style={styles.removeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No movies yet</Text>
            <Text style={styles.emptySubtext}>Search for movies and add them to this playlist</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', gap: 12 },
  errorText: { color: '#F87171', fontSize: 14 },
  backBtn: { padding: 12 },
  backBtnText: { color: '#22C55E', fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  backButtonText: { color: '#F1F5F9', fontSize: 22 },

  headerInfo: { flex: 1 },
  playlistName: { color: '#F1F5F9', fontSize: 20, fontWeight: '800' },
  playlistDesc: { color: '#64748B', fontSize: 13, marginTop: 4 },
  playlistOwner: { color: '#22C55E', fontSize: 12, marginTop: 4 },

  likeButton: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#334155',
    minWidth: 52,
  },
  likeButtonActive: { backgroundColor: '#2A0A0A' },
  likeIcon: { fontSize: 18 },
  likeCount: { color: '#94A3B8', fontSize: 11, fontWeight: '700', marginTop: 2 },
  likeCountActive: { color: '#EF4444' },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  statsText: { color: '#64748B', fontSize: 13 },
  publicBadge: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#0F2A1A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  movieItem: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  moviePoster: { width: 56, height: 80 },
  movieInfo: { flex: 1, padding: 12 },
  movieTitle: { color: '#F1F5F9', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  addedAt: { color: '#64748B', fontSize: 11, marginTop: 4 },
  removeBtn: { padding: 12 },
  removeBtnText: { color: '#475569', fontSize: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#94A3B8', fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: '#475569', fontSize: 13, textAlign: 'center' },
});