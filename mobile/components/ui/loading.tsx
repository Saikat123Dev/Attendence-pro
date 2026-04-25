/**
 * Reusable Loading Component - AttendX Dark Pro Theme
 */
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, fontSize } from '../../constants/theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export function Loading({ message, size = 'large', color = '#4F6EF7', style }: LoadingProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size={size} color={color} />
      </View>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    padding: spacing.xxl,
  },
  indicatorContainer: {
    backgroundColor: '#1A2035',
    borderRadius: 40,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1E2235',
  },
  message: {
    fontSize: fontSize.md,
    color: '#8E8E93',
    marginTop: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
