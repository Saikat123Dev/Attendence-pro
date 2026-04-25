import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';

// Theme colors
const theme = {
  bg: {
    base: '#0A0D14',
    card: '#141828',
  },
  primary: '#4F6EF7',
  accent: '#7B93FC',
  text: {
    primary: '#F0F2FF',
    secondary: '#C0C5E0',
    muted: '#6B7194',
  },
  border: '#1E2235',
  danger: '#FF5A5A',
  success: '#4ADE80',
};

const PRIMARY_GRADIENT = ['#4F6EF7', '#7B93FC'] as const;

export default function RegisterScreen() {
  const { register, isLoading: authLoading, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError();
  };

  async function handleRegister() {
    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      // Error handled by context
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = () => {
    if (!formData.name || !formData.email || !formData.password) return false;
    if (formData.password !== formData.confirmPassword) return false;
    if (formData.password.length < 6) return false;
    return true;
  };

  const passwordError = formData.password && formData.password.length < 6
    ? 'Password must be at least 6 characters'
    : null;

  const confirmPasswordError = formData.confirmPassword && formData.password !== formData.confirmPassword
    ? 'Passwords do not match'
    : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            {/* Glow effect behind logo */}
            <View style={styles.logoGlow} />
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>AX</Text>
            </View>
          </View>
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join AttendX today</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {error && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIndicator} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.dismissButton}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputWrapper, !formData.name && styles.inputWrapperEmpty]}>
              <View style={styles.inputIcon}>
                <Text style={styles.iconUser}>U</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={theme.text.muted}
                value={formData.name}
                onChangeText={(v) => updateField('name', v)}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, !formData.email && styles.inputWrapperEmpty]}>
              <View style={styles.inputIcon}>
                <Text style={styles.iconEnvelope}>✉</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.text.muted}
                value={formData.email}
                onChangeText={(v) => updateField('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, !formData.password && styles.inputWrapperEmpty]}>
              <View style={styles.inputIcon}>
                <Text style={styles.iconLock}>✕</Text>
              </View>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Min 6 characters"
                placeholderTextColor={theme.text.muted}
                value={formData.password}
                onChangeText={(v) => updateField('password', v)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <Pressable
                style={styles.showPassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={[styles.showPasswordText, showPassword && styles.showPasswordActive]}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
            {passwordError && (
              <View style={styles.fieldErrorContainer}>
                <Text style={styles.fieldError}>{passwordError}</Text>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputWrapper, !formData.confirmPassword && styles.inputWrapperEmpty]}>
              <View style={styles.inputIcon}>
                <Text style={styles.iconLock}>✕</Text>
              </View>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm your password"
                placeholderTextColor={theme.text.muted}
                value={formData.confirmPassword}
                onChangeText={(v) => updateField('confirmPassword', v)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <Pressable
                style={styles.showPassword}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={[styles.showPasswordText, showConfirmPassword && styles.showPasswordActive]}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
            {confirmPasswordError && (
              <View style={styles.fieldErrorContainer}>
                <Text style={styles.fieldError}>{confirmPasswordError}</Text>
              </View>
            )}
          </View>

          {/* Create Account Button */}
          <Pressable
            onPress={handleRegister}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            disabled={!isFormValid() || isLoading}
            style={styles.buttonPressable}
          >
            <LinearGradient
              colors={!isFormValid() || isLoading ? ['#2A3A5C', '#3A4A6C'] : PRIMARY_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.button,
                isPressed && styles.buttonPressed,
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loadingText}>Creating account...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg.base,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...shadows.lg,
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 32,
    backgroundColor: 'transparent',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: theme.bg.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.lg,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 90, 90, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: theme.danger,
  },
  errorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.danger,
    marginRight: spacing.sm,
  },
  errorText: {
    color: theme.danger,
    fontSize: fontSize.sm,
    flex: 1,
  },
  dismissButton: {
    paddingLeft: spacing.sm,
  },
  dismissText: {
    color: theme.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bg.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputWrapperEmpty: {
    borderColor: theme.border,
  },
  inputIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.border,
  },
  inputIconText: {
    fontSize: 18,
  },
  iconUser: {
    fontSize: 18,
    color: theme.primary,
    fontWeight: '600',
  },
  iconEnvelope: {
    fontSize: 18,
    color: theme.primary,
  },
  iconLock: {
    fontSize: 18,
    color: theme.primary,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: spacing.md,
    fontSize: fontSize.md,
    color: theme.text.primary,
    height: 48,
  },
  passwordInput: {
    paddingRight: 60,
  },
  showPassword: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.sm,
  },
  showPasswordText: {
    color: theme.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  showPasswordActive: {
    color: theme.primary,
  },
  fieldErrorContainer: {
    marginTop: spacing.xs,
    paddingLeft: spacing.xs,
    borderLeftWidth: 2,
    borderLeftColor: theme.danger,
  },
  fieldError: {
    color: theme.danger,
    fontSize: fontSize.xs,
  },
  buttonPressable: {
    marginTop: spacing.sm,
  },
  button: {
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1 }],
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonDisabled: {
    backgroundColor: '#2A3A5C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: theme.text.secondary,
    fontSize: fontSize.sm,
  },
  linkButton: {
    marginLeft: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  linkText: {
    color: theme.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
