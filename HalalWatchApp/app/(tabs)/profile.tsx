// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileApi, ProfileData, playlistApi, MyPlaylist } from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [playlists, setPlaylists] = useState<MyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      await fetchProfile();
    } else {
      setLoading(false);
    }
  };

  // FIX: fetch /profile/me for user-specific stats, not global stats
  const fetchProfile = async () => {
    try {
      setError(null);
      const [profileData, myPlaylists] = await Promise.all([
        profileApi.getMe(),
        playlistApi.getMine(),
      ]);
      setProfile(profileData);
      setPlaylists(myPlaylists);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          setIsLoggedIn(false);
          setProfile(null);
          setPlaylists([]);
        },
      },
    ]);
  };

  const StatCard = ({ value, label, icon }: { value: string | number; label: string; icon: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.center}>
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={styles.guestTitle}>Join HalalWatch</Text>
        <Text style={styles.guestSubtitle}>Create an account to save playlists and track your watchlist</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{profile?.username || 'User'}</Text>
          {profile?.email && <Text style={styles.email}>{profile.email}</Text>}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* FIX: User-specific stats from /profile/me */}
      {profile?.stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="📋"
              value={profile.stats.playlistsCount}
              label="Playlists"
            />
            <StatCard
              icon="🎬"
              value={profile.stats.totalAnalyzedMovies}
              label="Analyzed"
            />
            <StatCard
              icon="⭐"
              value={
                profile.stats.averageHalalScore > 0
                  ? `${Math.round(profile.stats.averageHalalScore)}`
                  : 'N/A'
              }
              label="Avg Score"
            />
          </View>
        </View>
      )}

      {/* My Playlists */}
      <View style={styles.playlistsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Playlists</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/playlists')}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {playlists.length === 0 ? (
          <View style={styles.emptyPlaylists}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No playlists yet</Text>
            <Text style={styles.emptySubtext}>Create playlists to organize your movies</Text>
          </View>
        ) : (
          playlists.map((pl) => (
            <TouchableOpacity
              key={pl.id}
              style={styles.playlistRow}
              onPress={() => router.push(`/playlist/${pl.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.playlistIcon}>
                <Text style={styles.playlistIconText}>🎬</Text>
              </View>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{pl.name}</Text>
                <Text style={styles.playlistMeta}>
                  {pl.movieCount} movies · {pl.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
              <Text style={styles.playlistChevron}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    gap: 12,
    paddingHorizontal: 32,
  },
  errorText: { color: '#F87171', fontSize: 14 },
  retryBtn: { backgroundColor: '#22C55E', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#fff', fontWeight: '600' },

  guestIcon: { fontSize: 64 },
  guestTitle: { color: '#F1F5F9', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  guestSubtitle: { color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  loginBtn: {
    width: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  registerBtn: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  registerBtnText: { color: '#94A3B8', fontWeight: '600', fontSize: 15 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  userInfo: { flex: 1 },
  username: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
  email: { color: '#64748B', fontSize: 12, marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  logoutBtnText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  statsSection: { padding: 20 },
  sectionTitle: { color: '#F1F5F9', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { fontSize: 22 },
  statValue: { color: '#22C55E', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: 11 },

  playlistsSection: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAllBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  seeAllText: { color: '#22C55E', fontSize: 13, fontWeight: '600' },

  emptyPlaylists: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: '#475569', fontSize: 13, textAlign: 'center' },

  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistIconText: { fontSize: 18 },
  playlistInfo: { flex: 1 },
  playlistName: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  playlistMeta: { color: '#64748B', fontSize: 12, marginTop: 2 },
  playlistChevron: { color: '#475569', fontSize: 22 },
});