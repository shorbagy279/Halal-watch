// app/(auth)/register.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { authApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { IslamicPattern } from '../../components/IslamicPattern';

export default function RegisterScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.register(email.trim().toLowerCase(), password);
      await login(result.token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Could not create account.');
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
        <LinearGradient
          colors={['#071410', Colors.background]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.patternTL}>
          <IslamicPattern size={160} opacity={0.06} />
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.logoSection}>
          <View style={styles.logoMark}>
            <Text style={styles.logoArabic}>هـ</Text>
          </View>
          <Text style={styles.appName}>HalalWatch</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Join us</Text>
          <Text style={styles.subtitle}>Create your free account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              selectionColor={Colors.primary}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                confirmPassword && password !== confirmPassword
                  ? styles.inputError
                  : null,
              ]}
              placeholder="Repeat your password"
              placeholderTextColor={Colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              selectionColor={Colors.primary}
            />
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorMsg}>Passwords don't match</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.submitText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.altBtn}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.altText}>
            Already have an account? <Text style={styles.altTextAccent}>Sign In</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By creating an account, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
  },
  patternTL: { position: 'absolute', top: -20, right: -20 },
  backBtn: {
    marginBottom: Spacing.xxl,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.base,
    fontWeight: '500',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoMark: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoArabic: { fontSize: 28, color: Colors.primary, fontWeight: '700' },
  appName: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  titleSection: { marginBottom: Spacing.xxl },
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
  form: { gap: Spacing.lg },
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
  },
  inputError: {
    borderColor: Colors.scoreBad + '80',
  },
  errorMsg: {
    fontSize: Typography.sizes.xs,
    color: Colors.scoreBad,
    marginTop: 4,
  },
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
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  altBtn: { alignItems: 'center' },
  altText: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  altTextAccent: { color: Colors.primary, fontWeight: '700' },
  terms: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
  termsLink: { color: Colors.primary },
});