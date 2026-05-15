/**
 * Reusable Avatar Component - AttendX Design System
 * Role-based coloring with consistent theming
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../src/constants/theme';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  style?: ViewStyle;
  type?: 'teacher' | 'student';
  borderColor?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colorOptions = [
    '#4F6EF7', // Primary blue
    '#7B3AED', // Purple
    '#0EA5E9', // Sky blue
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#14B8A6', // Teal
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorOptions[Math.abs(hash) % colorOptions.length];
}

export function Avatar({ name, size = 'md', style, type = 'student', borderColor }: AvatarProps) {
  const sizeStyles = {
    xs: { container: { width: 24, height: 24 }, text: { fontSize: 9 } },
    sm: { container: { width: 32, height: 32 }, text: { fontSize: 11 } },
    md: { container: { width: 44, height: 44 }, text: { fontSize: 15 } },
    lg: { container: { width: 56, height: 56 }, text: { fontSize: 19 } },
    xl: { container: { width: 80, height: 80 }, text: { fontSize: 26 } },
    xxl: { container: { width: 120, height: 120 }, text: { fontSize: 38 } },
  };

  const getTypeBorderColor = () => {
    if (borderColor) return borderColor;
    if (type === 'teacher') return colors.primary.primaryLight;
    return colors.success;
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;
  const backgroundColor = getColorFromName(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: currentSize.container.width,
          height: currentSize.container.height,
          backgroundColor,
          borderColor: getTypeBorderColor(),
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: currentSize.text.fontSize }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default Avatar;