/**
 * Reusable Avatar Component - AttendX Dark Pro Theme
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/theme';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  style?: ViewStyle;
  source?: string;
  type?: 'teacher' | 'student';
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
    '#4F6EF7',
    '#7C3AED',
    '#0891B2',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#EC4899',
    '#6366F1',
    '#8B5CF6',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorOptions[Math.abs(hash) % colorOptions.length];
}

export function Avatar({ name, size = 'md', style, type = 'student' }: AvatarProps) {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32, fontSize: 11 };
      case 'md':
        return { width: 48, height: 48, fontSize: 16 };
      case 'lg':
        return { width: 64, height: 64, fontSize: 22 };
      case 'xl':
        return { width: 96, height: 96, fontSize: 32 };
      case 'xxl':
        return { width: 120, height: 120, fontSize: 40 };
      default:
        return { width: 48, height: 48, fontSize: 16 };
    }
  };

  const getTypeColors = () => {
    if (type === 'teacher') {
      return { bg: '#7C3AED20', border: '#7C3AED50' };
    }
    return { bg: '#4F6EF720', border: '#4F6EF750' };
  };

  const sizeStyle = getSizeStyle();
  const typeColors = getTypeColors();
  const backgroundColor = getColorFromName(name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: sizeStyle.width,
          height: sizeStyle.height,
          backgroundColor,
          borderColor: typeColors.border,
          borderWidth: 2,
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
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
