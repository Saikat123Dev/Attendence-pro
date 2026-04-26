/**
 * Reusable Badge Component
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { fontSize } from '../../constants/theme';

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
        return { bg: '#0E2B24', text: '#69D8B5', border: '#1D5D4D' };
      case 'absent':
        return { bg: '#3A1A22', text: '#FF9AA7', border: '#7D3140' };
      case 'late':
        return { bg: '#3E2D10', text: '#F7C870', border: '#7A5A22' };
      case 'success':
        return { bg: '#0E2B24', text: '#69D8B5', border: '#1D5D4D' };
      case 'warning':
        return { bg: '#3E2D10', text: '#F7C870', border: '#7A5A22' };
      case 'danger':
        return { bg: '#3A1A22', text: '#FF9AA7', border: '#7D3140' };
      case 'error':
        return { bg: '#3A1A22', text: '#FF9AA7', border: '#7D3140' };
      case 'info':
        return { bg: '#162347', text: '#9EB2FF', border: '#3D53A8' };
      case 'primary':
        return { bg: '#162347', text: '#9EB2FF', border: '#3D53A8' };
      case 'light':
        return { bg: 'rgba(255,255,255,0.15)', text: '#FFFFFF', border: 'rgba(255,255,255,0.3)' };
      default:
        return { bg: '#1C2336', text: '#B7C0E0', border: '#2B3552' };
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
    borderRadius: 999,
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
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: fontSize.sm,
  },
});
