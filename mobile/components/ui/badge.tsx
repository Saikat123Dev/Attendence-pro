/**
 * Reusable Badge Component
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '../../constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'default', size = 'md', style }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'error':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'info':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'primary':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: colors.gray100, text: colors.textSecondary };
    }
  };

  const colorScheme = getColors();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: colorScheme.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: colorScheme.text },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: fontSize.xs,
  },
  textMd: {
    fontSize: fontSize.sm,
  },
});
