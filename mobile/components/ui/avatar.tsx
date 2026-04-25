/**
 * Reusable Avatar Component
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../constants/theme';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  source?: string;
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
    '#2563EB', // Blue
    '#7C3AED', // Violet
    '#0891B2', // Cyan
    '#059669', // Emerald
    '#D97706', // Amber
    '#DC2626', // Red
    '#DB2777', // Pink
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorOptions[Math.abs(hash) % colorOptions.length];
}

export function Avatar({ name, size = 'md', style }: AvatarProps) {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32, fontSize: 12 };
      case 'md':
        return { width: 48, height: 48, fontSize: 18 };
      case 'lg':
        return { width: 64, height: 64, fontSize: 24 };
      case 'xl':
        return { width: 80, height: 80, fontSize: 32 };
      default:
        return { width: 48, height: 48, fontSize: 18 };
    }
  };

  const sizeStyle = getSizeStyle();
  const backgroundColor = getColorFromName(name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: sizeStyle.width,
          height: sizeStyle.height,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: sizeStyle.fontSize }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: '700',
  },
});
