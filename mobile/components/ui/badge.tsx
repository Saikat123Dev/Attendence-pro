/**
 * Reusable Badge Component - AttendX Design System
 * Consistent color variants using theme tokens
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { fontSize, borderRadius } from '../../src/constants/theme';

type BadgeVariant =
  | 'present'
  | 'absent'
  | 'late'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default'
  | 'primary'
  | 'light'
  | 'danger'
  | 'on' | 'off';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'default', size = 'md', style }: BadgeProps) {
  const getColorScheme = () => {
    switch (variant) {
      case 'present':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'absent':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'late':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'info':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#06B6D4', border: 'rgba(6, 182, 212, 0.3)' };
      case 'primary':
        return { bg: 'rgba(79, 110, 247, 0.15)', text: '#7B93FC', border: 'rgba(79, 110, 247, 0.3)' };
      case 'light':
        return { bg: 'rgba(255, 255, 255, 0.1)', text: '#F0F2FF', border: 'rgba(255, 255, 255, 0.2)' };
      case 'on':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'off':
        return { bg: 'rgba(100, 100, 100, 0.15)', text: '#8090C0', border: 'rgba(100, 100, 100, 0.3)' };
      default:
        return { bg: 'rgba(30, 34, 53, 0.8)', text: '#C0C5E0', border: 'rgba(37, 43, 66, 0.8)' };
    }
  };

  const colorScheme = getColorScheme();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        {
          backgroundColor: colorScheme.bg,
          borderColor: colorScheme.border,
        },
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
    minHeight: 24,
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: fontSize.xs,
  },
  textMd: {
    fontSize: fontSize.sm,
  },
});

export default Badge;