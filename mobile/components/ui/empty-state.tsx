/**
 * Reusable Empty State Component - AttendX Dark Pro Theme
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, fontSize } from '../../constants/theme';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {typeof icon === 'string' ? <Text style={styles.iconText}>{icon}</Text> : icon}
        </View>
      )}
      {!icon && (
        <View style={styles.illustrationPlaceholder}>
          <View style={styles.illustrationInner}>
            <View style={styles.illustrationCircle} />
            <View style={styles.illustrationCircleSmall} />
          </View>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconText: {
    fontSize: 32,
    color: '#4F6EF7',
  },
  illustrationPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1E2235',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  illustrationInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#141828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F6EF7',
    opacity: 0.6,
  },
  illustrationCircleSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
    opacity: 0.8,
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#F0F2FF',
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: fontSize.md,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.lg,
  },
});
