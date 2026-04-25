/**
 * Reusable Badge Component - AttendX Dark Pro Theme
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fontSize } from '../../constants/theme';

type BadgeVariant = 'present' | 'absent' | 'late' | 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'light' | 'danger';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'default', size = 'md', style }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'present':
        return { bg: '#10B981', text: '#34D399', border: '#10B98130' };
      case 'absent':
        return { bg: '#EF4444', text: '#F87171', border: '#EF444430' };
      case 'late':
        return { bg: '#F59E0B', text: '#FBBF24', border: '#F59E0B30' };
      case 'success':
        return { bg: '#10B981', text: '#34D399', border: '#10B98130' };
      case 'warning':
        return { bg: '#F59E0B', text: '#FBBF24', border: '#F59E0B30' };
      case 'danger':
        return { bg: '#EF4444', text: '#F87171', border: '#EF444430' };
      case 'error':
        return { bg: '#EF4444', text: '#F87171', border: '#EF444430' };
      case 'info':
        return { bg: '#4F6EF7', text: '#93ACFF', border: '#4F6EF730' };
      case 'primary':
        return { bg: '#7C3AED', text: '#C4B5FD', border: '#7C3AED30' };
      case 'light':
        return { bg: 'rgba(255,255,255,0.15)', text: '#FFFFFF', border: 'rgba(255,255,255,0.3)' };
      default:
        return { bg: '#2D2D2D', text: '#8E8E93', border: '#33333330' };
    }
  };

  const colorScheme = getColors();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: colorScheme.bg },
        { borderColor: colorScheme.border },
        { borderWidth: 1 },
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
    borderRadius: 20,
    alignSelf: 'flex-start',
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
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: fontSize.sm,
  },
});
