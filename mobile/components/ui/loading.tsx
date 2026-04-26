/**
 * Reusable Loading Component
 */
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { spacing, fontSize } from '../../constants/theme';

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
    backgroundColor: '#0A0D14',
    padding: spacing.xxl,
  },
  indicatorContainer: {
    backgroundColor: '#121A2F',
    borderRadius: 999,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#202A43',
  },
  message: {
    fontSize: fontSize.md,
    color: '#C0C5E0',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
