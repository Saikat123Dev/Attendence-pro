/**
 * Smart Attendance System - Dark Theme
 * Comprehensive dark theme constants for consistent UI design
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Backgrounds
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  surfaceHighlight: '#2D2D2D',

  // Borders
  border: '#333333',
  borderLight: '#3A3A3C',

  // Primary
  primary: '#4A9EFF',
  primaryPressed: '#3A8AE8',
  primaryLight: '#4A9EFF20',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#5C5C5C',
  placeholder: '#636366',

  // Status
  success: '#30D158',
  successLight: '#30D15820',
  warning: '#FFD60A',
  warningLight: '#FFD60A20',
  error: '#FF453A',
  errorLight: '#FF453A20',
  info: '#4A9EFF',
  infoLight: '#4A9EFF20',

  // Other
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Shadows
  shadowColor: '#000000',
};

// Backwards compatibility
export const Colors = {
  light: colors,
  dark: colors,
};

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// =============================================================================
// FONT SIZES
// =============================================================================

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default { colors, shadows, spacing, borderRadius, fontSize };