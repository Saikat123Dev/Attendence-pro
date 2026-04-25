/**
 * Smart Attendance System - Android-optimized Color Palette
 * Material Design 3 inspired theme
 */

import { Platform } from 'react-native';

// Flat color palette - no nesting for easier imports
export const colors = {
  // Primary brand colors
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',

  // Secondary colors
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic colors
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  background: '#F3F4F6',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  placeholder: '#9CA3AF',
  disabled: '#D1D5DB',

  // Status
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
};

// Backwards compatibility alias
export const Colors = {
  light: colors,
  dark: {
    ...colors,
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    border: '#374151',
  },
};

// Shadows for elevation (Android)
export const shadows = {
  sm: Platform.select({
    android: { elevation: 2 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  }),
  md: Platform.select({
    android: { elevation: 4 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  }),
  lg: Platform.select({
    android: { elevation: 8 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  }),
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export default { colors, shadows, spacing, borderRadius, fontSize };
