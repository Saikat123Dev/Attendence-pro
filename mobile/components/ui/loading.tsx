/**
 * Reusable Loading Component - AttendX Design System
 * Consistent theming with glowing indicator effect
 */
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { spacing, fontSize, borderRadius, colors, shadows } from '../../src/constants/theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export function Loading({ message, size = 'large', color = colors.primary.primary, style }: LoadingProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.brandPill}>
        <Text style={styles.brandText}>AttendX</Text>
      </View>
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size={size} color={color} />
      </View>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    padding: spacing.xxl,
  },
  brandPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(79, 110, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.18)',
    marginBottom: spacing.lg,
  },
  brandText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  indicatorContainer: {
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius.full,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadows.md,
    shadowColor: colors.primary.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default Loading;