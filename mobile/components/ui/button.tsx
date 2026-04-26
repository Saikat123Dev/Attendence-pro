import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, fontSize, borderRadius } from '../../constants/theme';

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

  const sizeStyle: Record<NonNullable<ButtonProps['size']>, ViewStyle> = {
    sm: { minHeight: 38, paddingHorizontal: spacing.lg },
    md: { minHeight: 46, paddingHorizontal: spacing.xl },
    lg: { minHeight: 54, paddingHorizontal: spacing.xxl },
  };

  const textSize: Record<NonNullable<ButtonProps['size']>, number> = {
    sm: fontSize.sm,
    md: fontSize.md,
    lg: fontSize.lg,
  };

  const variantColors = {
    primary: { bg: '#4F6EF7', bg2: '#2D7DD2', text: '#FFFFFF', border: '#5D7BFF' },
    secondary: { bg: '#1A2035', text: '#F0F2FF', border: '#252B42' },
    outline: { bg: 'transparent', text: '#7B93FC', border: '#4F6EF7' },
    ghost: { bg: 'transparent', text: '#C0C5E0', border: '#252B42' },
    danger: { bg: '#3A1920', text: '#FF8D8D', border: '#7C2D34' },
  } as const;

  const colors = variantColors[variant];

  const content = loading ? (
    <ActivityIndicator color={colors.text} size="small" />
  ) : (
    <>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.text, { color: colors.text, fontSize: textSize[size] }, textStyle]}>
        {title}
      </Text>
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[styles.touchable, style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isDisabled ? ['#3A465F', '#364056'] : [variantColors.primary.bg, variantColors.primary.bg2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, sizeStyle[size], styles.primaryBorder, isDisabled && styles.disabled]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.touchable, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      <View
        style={[
          styles.button,
          sizeStyle[size],
          { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 },
          isDisabled && styles.disabled,
        ]}
      >
        {content}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: borderRadius.md,
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
    borderColor: '#5D7BFF',
  },
  iconWrap: {
    marginRight: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
});
