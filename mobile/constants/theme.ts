/**
 * Smart Attendance System - Dark Theme
 * Comprehensive dark theme constants for consistent UI design
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Backgrounds
  background: '#0A0D14',
  surface: '#0F1320',
  surfaceElevated: '#141828',
  surfaceHighlight: '#1A2035',

  // Borders
  border: '#1E2235',
  borderLight: '#252B42',

  // Primary
  primary: '#4F6EF7',
  primaryPressed: '#3D5FE8',
  primaryLight: '#4F6EF720',

  // Text
  text: '#F0F2FF',
  textSecondary: '#C0C5E0',
  textMuted: '#8090C0',
  placeholder: '#6B7194',

  // Status
  success: '#10B981',
  successLight: '#10B98120',
  warning: '#F59E0B',
  warningLight: '#F59E0B20',
  error: '#EF4444',
  errorLight: '#EF444420',
  info: '#06B6D4',
  infoLight: '#06B6D420',

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
  md: 12,
  lg: 16,
  xl: 20,
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
