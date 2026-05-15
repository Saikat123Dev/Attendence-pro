/**
 * Reusable Button Component - AttendX Design System
 * Supports primary, secondary, outline, ghost, danger variants
 * Uses LinearGradient for primary buttons, consistent theming
 */
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, fontSize, borderRadius, shadows, colors } from '../../src/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const PRIMARY_GRADIENT = ['#4F6EF7', '#6B5BFF'] as const;
const DANGER_GRADIENT = ['#EF4444', '#DC2626'] as const;

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles: Record<NonNullable<ButtonProps['size']>, ViewStyle> = {
    sm: { minHeight: 38, paddingHorizontal: spacing.lg },
    md: { minHeight: 46, paddingHorizontal: spacing.xl },
    lg: { minHeight: 54, paddingHorizontal: spacing.xxl },
  };

  const textSizes: Record<NonNullable<ButtonProps['size']>, number> = {
    sm: fontSize.sm,
    md: fontSize.md,
    lg: fontSize.lg,
  };

  const variantStyles = {
    primary: {
      bg: colors.primary.primary,
      text: '#FFFFFF',
      border: 'rgba(79, 110, 247, 0.5)',
      shadowColor: colors.primary.primary,
    },
    secondary: {
      bg: colors.bg.elevated,
      text: colors.text.primary,
      border: colors.border.default,
    },
    outline: {
      bg: 'transparent',
      text: colors.primary.primaryLight,
      border: colors.primary.primary,
    },
    ghost: {
      bg: 'transparent',
      text: colors.text.secondary,
      border: colors.border.default,
    },
    danger: {
      bg: colors.danger,
      text: '#FFFFFF',
      border: 'rgba(239, 68, 68, 0.5)',
      shadowColor: colors.danger,
    },
  } as const;

  const currentVariant = variantStyles[variant];

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={currentVariant.text} size="small" />;
    }
    return (
      <>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text
          style={[
            styles.text,
            { color: currentVariant.text, fontSize: textSizes[size] },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </>
    );
  };

  // Primary and Danger use gradients
  if (variant === 'primary') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.touchable,
          pressed && !isDisabled && styles.pressed,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={isDisabled ? ['#3A465F', '#364056'] : PRIMARY_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            sizeStyles[size],
            styles.primaryBorder,
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'danger') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.touchable,
          pressed && !isDisabled && styles.pressed,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={isDisabled ? ['#7F3333', '#5C2626'] : DANGER_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            sizeStyles[size],
            styles.dangerBorder,
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </Pressable>
    );
  }

  // Other variants use solid backgrounds
  return (
    <Pressable
      style={({ pressed }) => [
        styles.touchable,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <View
        style={[
          styles.button,
          sizeStyles[size],
          {
            backgroundColor: currentVariant.bg,
            borderColor: currentVariant.border,
            borderWidth: variant === 'ghost' ? 0 : 1,
          },
          isDisabled && styles.disabled,
        ]}
      >
        {renderContent()}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: borderRadius.md,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  button: {
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  primaryBorder: {
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.4)',
    ...shadows.md,
  },
  dangerBorder: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    ...shadows.md,
  },
  iconWrap: {
    marginRight: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;