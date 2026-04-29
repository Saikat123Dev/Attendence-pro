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
import { spacing, fontSize, borderRadius } from '@/constants/theme';

const theme = {
  bg: '#090F1E',
  card: '#11192E',
  border: '#243153',
  textPrimary: '#F1F5FF',
  textSecondary: '#B6C2E3',
  textMuted: '#6E7DA8',
  danger: '#FF7C85',
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
    } catch (err) {
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
        colors={['#0E1731', '#090F1E']}
        style={styles.backgroundGradient}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
      >
        <View style={styles.brandWrap}>
          <View style={styles.brandIcon}>
            <MaterialIcons name="fact-check" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>AttendX</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Continue to your attendance workspace</Text>
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
            leftIcon={<MaterialIcons name="alternate-email" size={18} color="#7B93FC" />}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!isLoading}
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
    marginBottom: spacing.xl,
  },
  brandIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#4F6EF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#7B93FC',
  },
  brandText: {
    color: theme.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
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
