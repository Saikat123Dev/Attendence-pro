/**
 * Register Screen - AttendX Design System
 * Account creation with consistent theming
 */
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { borderRadius, colors, fontSize, spacing } from '@/src/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const theme = {
  bg: colors.bg.base,
  card: colors.bg.card,
  border: colors.border.subtle,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  danger: colors.danger,
};

export default function RegisterScreen() {
  const { register, isLoading: authLoading, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const submitLockRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const passwordError = useMemo(() => {
    if (!formData.password) return '';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }, [formData.password]);

  const confirmPasswordError = useMemo(() => {
    if (!formData.confirmPassword) return '';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return '';
  }, [formData.password, formData.confirmPassword]);

  const isFormValid = Boolean(
    formData.name.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword &&
      !passwordError &&
      !confirmPasswordError
  );

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError();
  }

  async function handleRegister() {
    if (!isFormValid || isLoading || submitLockRef.current) return;
    submitLockRef.current = true;
    setIsLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
    } catch {
      // Error handled in context
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
    }
  }

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
        <View style={styles.header}>
          <View style={styles.brandIcon}>
            <MaterialIcons name="person-add-alt-1" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Set up your AttendX account</Text>
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
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            editable={!isLoading}
            leftIcon={<MaterialIcons name="person-outline" size={20} color={colors.primary.primaryLight} />}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            leftIcon={<MaterialIcons name="alternate-email" size={20} color={colors.primary.primaryLight} />}
          />

          <Input
            label="Password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!isLoading}
            error={passwordError || undefined}
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

          <Input
            label="Confirm Password"
            placeholder="Retype your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!isLoading}
            error={confirmPasswordError || undefined}
            leftIcon={<MaterialIcons name="lock-outline" size={20} color={colors.primary.primaryLight} />}
            rightIcon={
              <MaterialIcons
                name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={colors.text.secondary}
              />
            }
            onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
          />

          <Button
            title={isLoading ? 'Creating Account...' : 'Create Account'}
            onPress={handleRegister}
            disabled={!isFormValid || isLoading || authLoading}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Sign In</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.4)',
    marginBottom: spacing.sm,
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
