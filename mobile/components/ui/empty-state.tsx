/**
 * Reusable Empty State Component
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { spacing, fontSize } from '../../constants/theme';
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
    fontSize: 28,
    color: '#7B93FC',
  },
  illustrationPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: '#162347',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#30478E',
  },
  illustrationInner: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#4F6EF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationCircle: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  illustrationCircleSmall: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#F0F2FF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSize.md,
    color: '#C0C5E0',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.lg,
  },
});
