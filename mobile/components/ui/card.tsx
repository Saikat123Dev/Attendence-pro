/**
 * Reusable Card Component - AttendX Dark Pro Theme
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
    backgroundColor: '#141828',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2235',
    ...shadows.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
