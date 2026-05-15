import { colors, fontSize, spacing } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ErrorBoundaryProps = {
  children?: React.ReactNode;
};

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Caught error:', error);
    this.setState({ error });
  }

  handleReload = () => {
    // Try to recover by navigating to the login/root screen
    router.replace('/(auth)/login');
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>An unexpected error occurred. Please try reloading the app.</Text>
          <Pressable style={styles.button} onPress={this.handleReload}>
            <Text style={styles.buttonText}>Reload</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children ?? null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
