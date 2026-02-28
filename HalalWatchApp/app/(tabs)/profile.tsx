// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { profileApi, ProfileData } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { IslamicPattern } from '../../components/IslamicPattern';

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { isLoggedIn, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    profileApi.getMe()
      .then(setProfile)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.authPrompt}>
          <IslamicPattern size={120} opacity={0.08} />
          <Text style={styles.authTitle}>Welcome to HalalWatch</Text>
          <Text style={styles.authDesc}>
            Sign in to track your watchlists, view your history, and join the community.
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Hero */}
        <View style={styles.profileHero}>
          <LinearGradient
            colors={['#0A2010', Colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.patternBg}>
            <IslamicPattern size={200} opacity={0.05} />
          </View>

          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[Colors.primaryDim, Colors.primaryMuted]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.username}>{profile?.username}</Text>
          {profile?.email && (
            <Text style={styles.email}>{profile.email}</Text>
          )}
        </View>

        {/* Stats */}
        {profile?.stats && (
          <View style={styles.statsRow}>
            <StatBox label="Playlists" value={profile.stats.playlistsCount} />
            <View style={styles.statDivider} />
            <StatBox label="Films Analyzed" value={profile.stats.totalAnalyzedMovies} />
            <View style={styles.statDivider} />
            <StatBox
              label="Avg. Score"
              value={`${profile.stats.averageHalalScore}%`}
            />
          </View>
        )}

        {/* Playlists */}
        {profile?.playlists && profile.playlists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Playlists</Text>
            {profile.playlists.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.playlistRow}
                onPress={() => router.push(`/playlist/${p.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.playlistIconBox}>
                  <Text style={styles.playlistIcon}>📋</Text>
                </View>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{p.name}</Text>
                  <Text style={styles.playlistMeta}>
                    {p.movieCount} films · {p.isPublic ? 'Public' : 'Private'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  header: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Auth prompt
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.lg,
  },
  authTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  authDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginBtn: {
    width: '100%',
    paddingVertical: Spacing.base,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  loginBtnText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: Typography.sizes.base,
    letterSpacing: 0.3,
  },
  registerBtn: {
    width: '100%',
    paddingVertical: Spacing.base,
    backgroundColor: 'transparent',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  registerBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: Typography.sizes.base,
  },

  // Profile hero
  profileHero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    position: 'relative',
    overflow: 'hidden',
  },
  patternBg: {
    position: 'absolute',
    top: -20,
    right: -40,
    opacity: 1,
  },
  avatarWrapper: {
    marginBottom: Spacing.base,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '60',
  },
  avatarText: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  username: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  email: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  playlistIconBox: {
    width: 40,
    height: 40,
    backgroundColor: Colors.glassGreen,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  playlistIcon: { fontSize: 18 },
  playlistInfo: { flex: 1 },
  playlistName: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  playlistMeta: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textMuted,
    lineHeight: 28,
  },

  logoutBtn: {
    paddingVertical: Spacing.base,
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderRadius: Radius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.25)',
  },
  logoutText: {
    color: Colors.scoreBad,
    fontWeight: '700',
    fontSize: Typography.sizes.base,
  },
});