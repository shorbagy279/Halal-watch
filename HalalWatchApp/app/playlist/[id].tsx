// app/playlist/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { playlistApi, PlaylistDetail } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={Colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const playlistId = parseInt(id);

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likingLoading, setLikingLoading] = useState(false);

  useEffect(() => {
    playlistApi.getPlaylist(playlistId)
      .then((data) => {
        setPlaylist(data);
      })
      .catch(() => Alert.alert('Error', 'Failed to load playlist'))
      .finally(() => setLoading(false));
  }, [playlistId]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      Alert.alert('Sign In Required', 'Please sign in to like playlists.');
      return;
    }
    setLikingLoading(true);
    try {
      const result = await playlistApi.toggleLike(playlistId);
      setLiked(result.liked);
      setLikes(result.likes);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLikingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.textMuted }}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <BackIcon />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.likeBtn, liked && styles.likeBtnActive]}
          onPress={handleLike}
          disabled={likingLoading}
        >
          {likingLoading ? (
            <ActivityIndicator color={liked ? Colors.textInverse : Colors.primary} size="small" />
          ) : (
            <>
              <Text style={[styles.likeIcon, liked && styles.likeIconActive]}>♥</Text>
              <Text style={[styles.likeCount, liked && styles.likeCountActive]}>
                {likes}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Playlist Info */}
      <View style={styles.info}>
        <Text style={styles.playlistName}>{playlist.name}</Text>
        {playlist.description ? (
          <Text style={styles.playlistDesc}>{playlist.description}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>by {playlist.owner}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{playlist.movies.length} films</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={[styles.metaText, { color: playlist.isPublic ? Colors.primary : Colors.textMuted }]}>
            {playlist.isPublic ? 'Public' : 'Private'}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Movies */}
      {playlist.movies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyTitle}>No movies yet</Text>
          <Text style={styles.emptyDesc}>Search for films and add them to this playlist</Text>
        </View>
      ) : (
        <FlatList
          data={playlist.movies}
          keyExtractor={(item) => String(item.tmdbId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.movieItem}
              onPress={() => router.push(`/movie/${item.tmdbId}`)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.posterUrl || 'https://via.placeholder.com/60x90/0D1A10/2ECC71' }}
                style={styles.moviePoster}
                resizeMode="cover"
              />
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={2}>{item.movieTitle}</Text>
                <Text style={styles.movieAdded}>
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.viewHint}>
                <Text style={styles.viewHintText}>›</Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 56 },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 64,
    justifyContent: 'center',
  },
  likeBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary + '50',
  },
  likeIcon: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  likeIconActive: {
    color: Colors.primary,
  },
  likeCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  likeCountActive: {
    color: Colors.primary,
  },
  info: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  playlistName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  playlistDesc: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  metaDot: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
  },
  movieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  moviePoster: {
    width: 44,
    height: 66,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  movieInfo: { flex: 1 },
  movieTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  movieAdded: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  viewHint: {
    width: 28,
    alignItems: 'center',
  },
  viewHintText: {
    fontSize: 22,
    color: Colors.textMuted,
    lineHeight: 26,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});