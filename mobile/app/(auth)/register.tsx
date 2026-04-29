import { useMemo, useState } from 'react';
import { useRef } from 'react';
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
import { spacing, fontSize, borderRadius } from '@/constants/theme';

const theme = {
  bg: '#090F1E',
  card: '#11192E',
  border: '#243153',
  textPrimary: '#F1F5FF',
  textSecondary: '#B6C2E3',
  danger: '#FF7C85',
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
        colors={['#0E1731', '#090F1E']}
        style={styles.backgroundGradient}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
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
            leftIcon={<MaterialIcons name="person-outline" size={18} color="#7B93FC" />}
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
            leftIcon={<MaterialIcons name="alternate-email" size={18} color="#7B93FC" />}
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
            leftIcon={<MaterialIcons name="lock-outline" size={18} color="#7B93FC" />}
            rightIcon={
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color="#9FB0DB"
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
            leftIcon={<MaterialIcons name="lock-outline" size={18} color="#7B93FC" />}
            rightIcon={
              <MaterialIcons
                name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color="#9FB0DB"
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
    marginBottom: spacing.lg,
  },
  brandIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#4F6EF7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B93FC',
    marginBottom: spacing.sm,
  },
  title: {
    color: theme.textPrimary,
    fontSize: fontSize.xxxl,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.textSecondary,
    fontSize: fontSize.md,
    marginTop: 2,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.lg,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#331D28',
    borderWidth: 1,
    borderColor: '#5F2A39',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    color: '#FFB2BB',
    fontSize: fontSize.sm,
  },
  errorDismiss: {
    color: '#FFCDD2',
    fontWeight: '700',
    fontSize: fontSize.xs,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.lg,
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
    color: '#7B93FC',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
