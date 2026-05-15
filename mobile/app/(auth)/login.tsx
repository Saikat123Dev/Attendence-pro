/**
 * Login Screen - AttendX Design System
 * Clean authentication flow with consistent theming
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Link } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import { spacing, fontSize, borderRadius, colors } from '@/src/constants/theme';

const theme = {
  bg: colors.bg.base,
  card: colors.bg.card,
  border: colors.border.subtle,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  textMuted: colors.text.muted,
  danger: colors.danger,
};

export default function LoginScreen() {
  const { login, isLoading: authLoading, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password || isLoading) return;
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      // Error is handled in context and shown in UI
    } finally {
      setIsLoading(false);
    }
  }

  const disabled = !email || !password || isLoading || authLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.bg.surface, colors.bg.base]}
        style={styles.backgroundGradient}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandWrap}>
          <View style={styles.brandIcon}>
            <MaterialIcons name="fact-check" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>AttendX</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your attendance workspace</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorWrap}>
              <MaterialIcons name="error-outline" size={16} color={theme.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={clearError}>
                <Text style={styles.errorDismiss}>Dismiss</Text>
              </Pressable>
            </View>
          ) : null}

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            leftIcon={<MaterialIcons name="alternate-email" size={20} color={colors.primary.primaryLight} />}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!isLoading}
            leftIcon={<MaterialIcons name="lock-outline" size={20} color={colors.primary.primaryLight} />}
            rightIcon={
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={colors.text.secondary}
              />
            }
            onRightIconPress={() => setShowPassword((prev) => !prev)}
          />

          <Button
            title={isLoading ? 'Signing In...' : 'Sign In'}
            onPress={handleLogin}
            disabled={disabled}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Create Account</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.4)',
  },
  brandText: {
    color: theme.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: theme.textPrimary,
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.xl,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  errorDismiss: {
    color: 'rgba(239, 68, 68, 0.8)',
    fontWeight: '700',
    fontSize: fontSize.xs,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: {
    color: theme.textSecondary,
    fontSize: fontSize.sm,
  },
  footerLink: {
    color: colors.primary.primaryLight,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});