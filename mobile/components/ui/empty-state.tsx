/**
 * Reusable Empty State Component - AttendX Design System
 * Consistent theming for empty list states
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { spacing, fontSize, colors, borderRadius } from '../../src/constants/theme';
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
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationOuter}>
            <View style={styles.illustrationInner}>
              <View style={styles.illustrationDot} />
              <View style={styles.illustrationDotSmall} />
            </View>
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
    padding: spacing.xxxl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  illustrationWrapper: {
    marginBottom: spacing.lg,
  },
  illustrationOuter: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(79, 110, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.2)',
  },
  illustrationInner: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationDot: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',
    opacity: 0.95,
  },
  illustrationDotSmall: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.lg,
  },
});

export default EmptyState;