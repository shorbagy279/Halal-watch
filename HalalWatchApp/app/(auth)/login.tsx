// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { authApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { IslamicPattern } from '../../components/IslamicPattern';

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={Colors.textPrimary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.login(email.trim().toLowerCase(), password);
      await login(result.token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background */}
        <LinearGradient
          colors={['#071410', Colors.background, Colors.background]}
          style={StyleSheet.absoluteFill}
        />

        {/* Islamic pattern decorations */}
        <View style={styles.patternTL}>
          <IslamicPattern size={180} opacity={0.06} />
        </View>
        <View style={styles.patternBR}>
          <IslamicPattern size={140} opacity={0.04} />
        </View>

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <BackIcon />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoMark}>
            <Text style={styles.logoArabic}>هـ</Text>
          </View>
          <Text style={styles.appName}>HalalWatch</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={Colors.primary}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                selectionColor={Colors.primary}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPass(!showPass)}
              >
                <Text style={styles.eyeText}>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.submitText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register link */}
        <TouchableOpacity
          style={styles.altBtn}
          onPress={() => router.replace('/(auth)/register')}
        >
          <Text style={styles.altText}>
            New here? <Text style={styles.altTextAccent}>Create an account</Text>
          </Text>
        </TouchableOpacity>

        {/* Bismillah */}
        <Text style={styles.bismillah}>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    minHeight: '100%',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
  },
  patternTL: { position: 'absolute', top: -20, left: -20, zIndex: 0 },
  patternBR: { position: 'absolute', bottom: 80, right: -20, zIndex: 0 },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    zIndex: 1,
  },
  logoMark: {
    width: 64,
    height: 64,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoArabic: {
    fontSize: 32,
    color: Colors.primary,
    fontWeight: '700',
  },
  appName: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  titleSection: {
    marginBottom: Spacing.xxl,
    zIndex: 1,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.lg,
    zIndex: 1,
  },
  fieldGroup: { gap: Spacing.sm },
  fieldLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    marginBottom: 0,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    height: 52,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: Colors.border,
    borderTopRightRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: { fontSize: 16 },
  submitBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.base + 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    color: Colors.textInverse,
    fontWeight: '800',
    fontSize: Typography.sizes.base,
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  altBtn: { alignItems: 'center' },
  altText: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
  },
  altTextAccent: {
    color: Colors.primary,
    fontWeight: '700',
  },
  bismillah: {
    textAlign: 'center',
    color: Colors.primary + '30',
    fontSize: Typography.sizes.base,
    marginTop: Spacing.xxxl,
    letterSpacing: 1,
  },
});