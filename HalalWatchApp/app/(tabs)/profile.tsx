// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { profileApi, ProfileData, playlistApi, MyPlaylist } from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { IslamicPattern } from '../../components/IslamicPattern';

function LogoutIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 17L21 12L16 7M21 12H9" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function PlaylistsIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6H21M3 12H15M3 18H12" stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function GuestView({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <View style={styles.guestContainer}>
      <LinearGradient colors={['#071410', Colors.background, Colors.background]} style={StyleSheet.absoluteFill} />
      <View style={styles.patternTL}><IslamicPattern size={200} opacity={0.05} /></View>
      <View style={styles.patternBR}><IslamicPattern size={150} opacity={0.04} /></View>

      <View style={styles.guestContent}>
        <View style={styles.guestLogoMark}>
          <Text style={styles.guestLogoArabic}>هـ</Text>
        </View>

        <Text style={styles.guestTitle}>Your Profile</Text>
        <Text style={styles.guestSubtitle}>
          Sign in to track your watchlist, create playlists, and get personalized halal ratings.
        </Text>

        <View style={styles.guestDivider}>
          <View style={styles.guestDividerLine} />
          <Text style={styles.guestDividerText}>بِسْمِ اللهِ</Text>
          <View style={styles.guestDividerLine} />
        </View>

        <View style={styles.featurePills}>
          {['📋 Playlists', '⭐ Ratings', '🎬 Watchlist'].map((f) => (
            <View key={f} style={styles.featurePill}>
              <Text style={styles.featurePillText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.signInBtn} onPress={onLogin} activeOpacity={0.85}>
          <Text style={styles.signInBtnText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerBtn} onPress={onRegister} activeOpacity={0.85}>
          <Text style={styles.registerBtnText}>
            New here?{' '}<Text style={styles.registerBtnAccent}>Create Account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [playlists, setPlaylists] = useState<MyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { checkAuthAndLoad(); }, []);

  const checkAuthAndLoad = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);
    await fetchProfile();
  };

  const fetchProfile = async () => {
    try {
      setError(null);
      const [profileData, myPlaylists] = await Promise.all([
        profileApi.getMe(),
        playlistApi.getMine(),
      ]);
      setProfile(profileData);
      setPlaylists(myPlaylists);
      setIsLoggedIn(true);
    } catch (e: any) {
      // ── KEY FIX: 401 = expired/invalid token → clear it and show guest view ──
      const msg: string = e.message || '';
      if (
        msg.includes('401') ||
        msg.toLowerCase().includes('not logged in') ||
        msg.toLowerCase().includes('sign in') ||
        msg.toLowerCase().includes('unauthorized')
      ) {
        await AsyncStorage.removeItem('token');
        setIsLoggedIn(false);
        setError(null);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchProfile(); };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          setIsLoggedIn(false);
          setProfile(null);
          setPlaylists([]);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <GuestView
        onLogin={() => router.push('/(auth)/login')}
        onRegister={() => router.push('/(auth)/register')}
      />
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = profile?.username?.charAt(0).toUpperCase() || '?';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <LinearGradient colors={['#071C14', Colors.background]} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.username}>{profile?.username || 'User'}</Text>
            {profile?.email && <Text style={styles.email} numberOfLines={1}>{profile.email}</Text>}
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>✦ Member</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <LogoutIcon />
          </TouchableOpacity>
        </View>

        {profile?.stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.stats.playlistsCount}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.stats.totalAnalyzedMovies}</Text>
              <Text style={styles.statLabel}>Analyzed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile.stats.averageHalalScore > 0 ? Math.round(profile.stats.averageHalalScore) : '—'}
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Playlists */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>My Playlists</Text>
          </View>
          <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(tabs)/playlists')}>
            <Text style={styles.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {playlists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No playlists yet</Text>
            <Text style={styles.emptyDesc}>Create playlists to organize your favorite halal-rated movies</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/playlists')}>
              <Text style={styles.emptyBtnText}>Create First Playlist</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.playlistList}>
            {playlists.map((pl) => (
              <TouchableOpacity
                key={pl.id} style={styles.playlistRow}
                onPress={() => router.push(`/playlist/${pl.id}`)} activeOpacity={0.8}
              >
                <View style={styles.playlistIconBox}><PlaylistsIcon /></View>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName} numberOfLines={1}>{pl.name}</Text>
                  <Text style={styles.playlistMeta}>
                    {pl.movieCount} {pl.movieCount === 1 ? 'film' : 'films'} · {pl.isPublic ? 'Public' : 'Private'}
                  </Text>
                </View>
                <ChevronIcon />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: Spacing.md, paddingHorizontal: Spacing.xl },
  errorEmoji: { fontSize: 40 },
  errorText: { color: Colors.scoreBad, fontSize: Typography.sizes.sm, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  retryBtnText: { color: Colors.textInverse, fontWeight: '700' },

  // Guest
  guestContainer: { flex: 1, backgroundColor: Colors.background },
  patternTL: { position: 'absolute', top: -10, left: -10 },
  patternBR: { position: 'absolute', bottom: 120, right: -10 },
  guestContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxxl, paddingTop: 60, paddingBottom: 80, gap: Spacing.lg },
  guestLogoMark: { width: 72, height: 72, backgroundColor: Colors.primaryMuted, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.primary + '40', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 },
  guestLogoArabic: { fontSize: 36, color: Colors.primary, fontWeight: '700' },
  guestTitle: { fontSize: Typography.sizes.xxxl, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1, textAlign: 'center' },
  guestSubtitle: { fontSize: Typography.sizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  guestDivider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, width: '100%', marginVertical: Spacing.sm },
  guestDividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  guestDividerText: { fontSize: Typography.sizes.sm, color: Colors.primary + '50', letterSpacing: 1 },
  featurePills: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  featurePill: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  featurePillText: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  signInBtn: { width: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: Spacing.base + 2, alignItems: 'center', marginTop: Spacing.sm, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  signInBtnText: { color: Colors.textInverse, fontWeight: '800', fontSize: Typography.sizes.base, letterSpacing: 0.3 },
  registerBtn: { paddingVertical: Spacing.md, alignItems: 'center' },
  registerBtnText: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  registerBtnAccent: { color: Colors.primary, fontWeight: '700' },

  // Header (logged in)
  header: { paddingTop: 60, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  avatarRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: Colors.primary + '50', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryMuted, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.textInverse, fontSize: 22, fontWeight: '800' },
  userInfo: { flex: 1 },
  username: { fontSize: Typography.sizes.lg, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  email: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  memberBadge: { marginTop: Spacing.xs, alignSelf: 'flex-start', backgroundColor: Colors.primaryMuted, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary + '30' },
  memberBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: '700', letterSpacing: 0.5 },
  logoutBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceElevated, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surfaceElevated, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: Typography.sizes.xl, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border, alignSelf: 'center' },

  // Playlists
  section: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionAccent: { width: 4, height: 20, borderRadius: 2, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.textPrimary },
  newBtn: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary + '40' },
  newBtnText: { color: Colors.primary, fontWeight: '700', fontSize: Typography.sizes.xs },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl + Spacing.xl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.textPrimary },
  emptyDesc: { fontSize: Typography.sizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.md },
  emptyBtn: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary + '40' },
  emptyBtnText: { color: Colors.primary, fontWeight: '700', fontSize: Typography.sizes.sm },
  playlistList: { gap: Spacing.sm },
  playlistRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: Spacing.md },
  playlistIconBox: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: Typography.sizes.base, fontWeight: '700', color: Colors.textPrimary },
  playlistMeta: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 3 },
});