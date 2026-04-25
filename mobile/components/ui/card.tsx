/**
 * Reusable Card Component - Android Material Design style
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, style, padding = 'md' }: CardProps) {
  const paddingStyle = {
    none: {},
    sm: { padding: spacing.sm },
    md: { padding: spacing.md },
    lg: { padding: spacing.lg },
  };

  return (
    <View style={[styles.card, paddingStyle[padding], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
});
