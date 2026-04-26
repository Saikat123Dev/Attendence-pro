/**
 * Reusable Card Component
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { borderRadius, shadows, spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, style, padding = 'md' }: CardProps) {
  const paddingStyle = {
    none: {},
    sm: { padding: spacing.sm },
    md: { padding: 16 },
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
    backgroundColor: '#121A2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#202A43',
    ...shadows.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
