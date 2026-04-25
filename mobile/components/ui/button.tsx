/**
 * Reusable Button Component - Android Material Design style
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '../../constants/theme';

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

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: isDisabled ? colors.gray400 : colors.primary };
      case 'secondary':
        return { backgroundColor: isDisabled ? colors.gray200 : colors.secondary };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: isDisabled ? colors.gray400 : colors.primary,
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'danger':
        return { backgroundColor: isDisabled ? colors.gray400 : colors.danger };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return isDisabled ? colors.gray400 : colors.primary;
      default:
        return colors.white;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'md':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
      case 'lg':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return fontSize.sm;
      case 'md':
        return fontSize.md;
      case 'lg':
        return fontSize.lg;
      default:
        return fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
              icon ? { marginLeft: spacing.sm } : {},
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
