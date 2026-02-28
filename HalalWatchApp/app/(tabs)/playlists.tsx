// app/(tabs)/playlists.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, Switch, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { playlistApi, MyPlaylist } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

function PlusIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={Colors.textInverse} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

function LockIcon({ isPublic }: { isPublic: boolean }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      {isPublic ? (
        <>
          <Circle cx="12" cy="12" r="9" stroke={Colors.primary} strokeWidth={1.5} />
          <Path d="M12 8V12M12 16H12.01" stroke={Colors.primary} strokeWidth={1.5} strokeLinecap="round" />
        </>
      ) : (
        <Path
          d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11M5 11H19C19.55 11 20 11.45 20 12V21C20 21.55 19.55 22 19 22H5C4.45 22 4 21.55 4 21V12C4 11.45 4.45 11 5 11Z"
          stroke={Colors.textMuted}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

function PlaylistItem({ item }: { item: MyPlaylist }) {
  return (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => router.push(`/playlist/${item.id}`)}
      activeOpacity={0.8}
    >
      {/* Poster mosaic placeholder */}
      <View style={styles.playlistThumb}>
        <View style={styles.thumbGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.thumbCell} />
          ))}
        </View>
        <View style={styles.thumbOverlay}>
          <Text style={styles.thumbCount}>{item.movieCount}</Text>
          <Text style={styles.thumbCountLabel}>films</Text>
        </View>
      </View>

      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.playlistDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}
        <View style={styles.playlistMeta}>
          <LockIcon isPublic={item.isPublic} />
          <Text style={[styles.playlistMetaText, { color: item.isPublic ? Colors.primary : Colors.textMuted }]}>
            {item.isPublic ? 'Public' : 'Private'}
          </Text>
          <Text style={styles.playlistMetaDot}>·</Text>
          <Text style={styles.playlistMetaText}>{item.movieCount} films</Text>
        </View>
      </View>

      <View style={styles.chevron}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path d="M9 18L15 12L9 6" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

function CreatePlaylistModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a playlist name.');
      return;
    }
    setLoading(true);
    try {
      await playlistApi.create(name.trim(), description.trim(), isPublic);
      setName('');
      setDescription('');
      setIsPublic(false);
      onCreated();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>New Playlist</Text>

          <Text style={styles.fieldLabel}>Name *</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="My Halal Watchlist"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            selectionColor={Colors.primary}
            maxLength={60}
          />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldTextarea]}
            placeholder="What's this playlist about..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            selectionColor={Colors.primary}
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Make Public</Text>
              <Text style={styles.switchDesc}>Others can discover & like it</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
              thumbColor={isPublic ? Colors.primary : Colors.textMuted}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.textInverse} size="small" />
              ) : (
                <Text style={styles.createText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function PlaylistsScreen() {
  const { isLoggedIn } = useAuth();
  const [playlists, setPlaylists] = useState<MyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    if (!isLoggedIn) { setLoading(false); return; }
    try {
      const data = await playlistApi.getMine();
      setPlaylists(data);
    } catch { }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { load(); }, [load]);

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Playlists</Text>
        </View>
        <View style={styles.authPrompt}>
          <Text style={styles.authEmoji}>📋</Text>
          <Text style={styles.authTitle}>Sign in to create playlists</Text>
          <Text style={styles.authDesc}>Save your favorite halal-rated films in organized collections.</Text>
          <TouchableOpacity
            style={styles.authBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Playlists</Text>
          <Text style={styles.headerSub}>{playlists.length} collection{playlists.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.createFab} onPress={() => setShowCreate(true)}>
          <PlusIcon />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : playlists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyTitle}>No playlists yet</Text>
          <Text style={styles.emptyDesc}>Tap + to create your first curated watchlist</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
            <Text style={styles.emptyBtnText}>+ Create Playlist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
          }
        >
          {playlists.map((p) => <PlaylistItem key={p.id} item={p} />)}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <CreatePlaylistModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  createFab: {
    width: 42,
    height: 42,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: {
    paddingHorizontal: Spacing.base,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  playlistThumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  thumbGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbCell: {
    width: '50%',
    height: '50%',
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 0.5,
    borderColor: Colors.background,
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  thumbCount: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  thumbCountLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playlistInfo: { flex: 1 },
  playlistName: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  playlistDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  playlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  playlistMetaText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  playlistMetaDot: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  chevron: { padding: 4 },

  // Auth prompt
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.base,
  },
  authEmoji: { fontSize: 56 },
  authTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  authDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  authBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  authBtnText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: Typography.sizes.base,
  },

  // Empty
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
  },
  emptyBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  emptyBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
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
    marginBottom: Spacing.xl,
    letterSpacing: -0.3,
  },
  fieldLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  fieldInput: {
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  fieldTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  switchLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  switchDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: Typography.sizes.base,
  },
  createBtn: {
    flex: 2,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  createText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: Typography.sizes.base,
  },
});