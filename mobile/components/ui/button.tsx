/**
 * Reusable Button Component - AttendX Dark Pro Theme
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { minHeight: 36, paddingHorizontal: spacing.lg };
      case 'md':
        return { minHeight: 44, paddingHorizontal: spacing.xl };
      case 'lg':
        return { minHeight: 52, paddingHorizontal: spacing.xxl };
      default:
        return { minHeight: 44, paddingHorizontal: spacing.xl };
    }
  };

  const getFontSize = (): number => {
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

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color="#FFFFFF" size="small" />;
    }

    return (
      <>
        {icon}
        <Text
          style={[
            styles.text,
            { color: '#FFFFFF', fontSize: getFontSize() },
            icon ? { marginLeft: spacing.sm } : {},
            textStyle,
          ]}
        >
          {title}
        </Text>
      </>
    );
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.9}
          style={isDisabled ? styles.disabledOpacity : undefined}
        >
          <LinearGradient
            colors={isDisabled ? ['#4F6EF780', '#7C3AED80'] : ['#4F6EF7', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, getSizeStyle()]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'ghost') {
    return (
      <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          style={[styles.button, styles.ghost, getSizeStyle(), isDisabled && styles.disabledOpacity]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.9}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'danger') {
    return (
      <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.danger,
            getSizeStyle(),
            isDisabled && styles.disabledOpacity,
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.9}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'outline') {
    return (
      <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          style={[styles.button, styles.outline, getSizeStyle(), isDisabled && styles.disabledOpacity]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.9}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={[styles.button, styles.secondary, getSizeStyle(), isDisabled && styles.disabledOpacity]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    borderRadius: 14,
  },
  gradient: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#252B42',
  },
  danger: {
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4F6EF7',
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
  },
  disabledOpacity: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
