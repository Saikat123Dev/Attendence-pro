/**
 * Reusable Card Component - AttendX Design System
 * Consistent theming with proper shadows and borders
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, borderRadius, shadows, colors } from '../../src/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated';
}

export function Card({
  children,
  style,
  padding = 'md',
  variant = 'default',
}: CardProps) {
  const paddingStyles = {
    none: {},
    sm: { padding: spacing.sm },
    md: { padding: spacing.lg },
    lg: { padding: spacing.xl },
  };

  const variantStyles = {
    default: {
      backgroundColor: colors.bg.card,
      borderColor: colors.border.subtle,
      ...shadows.sm,
    },
    elevated: {
      backgroundColor: colors.bg.elevated,
      borderColor: colors.border.default,
      ...shadows.md,
    },
  };

  return (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        paddingStyles[padding],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
});

export default Card;