/**
 * Reusable Avatar Component
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

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
    '#2A9D8F',
    '#3D5A80',
    '#E76F51',
    '#F4A261',
    '#6A4C93',
    '#118AB2',
    '#8E6C88',
    '#7A8B5A',
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
      return { border: '#7B93FC' };
    }
    return { border: '#43C49A' };
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
  },
});
