/**
 * Reusable Input Component - AttendX Design System
 * Consistent theming, focus glow animation, error states
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { spacing, fontSize, borderRadius, colors } from '../../src/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  containerStyle,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return colors.danger;
    if (isFocused) return colors.primary.primary;
    return colors.border.default;
  };

  const getShadowOpacity = () => {
    if (isFocused) return 0.25;
    return 0;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 2 : 1,
            shadowOpacity: getShadowOpacity(),
          },
          error && styles.errorBorder,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={colors.text.muted}
          selectionColor={colors.primary.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.error}>
          <Text style={styles.errorIcon}>⚠ </Text>
          {error}
        </Text>
      )}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius.md,
    minHeight: 52,
    borderWidth: 1,
    shadowColor: colors.primary.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 2,
  },
  errorBorder: {
    borderWidth: 2,
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  leftIcon: {
    paddingLeft: spacing.md,
  },
  rightIcon: {
    paddingRight: spacing.md,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: fontSize.xs,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
});

export default Input;