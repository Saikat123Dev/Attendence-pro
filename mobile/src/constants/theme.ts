// AttendX Theme - Comprehensive Design System
// For React Native Mobile Application

import { TextStyle, ViewStyle } from 'react-native';

// ============================================================
// COLOR PALETTE
// ============================================================

// Background Layers (darkest to lightest)
const bgBase = '#0A0D14';
const bgSurface = '#0F1320';
const bgCard = '#141828';
const bgElevated = '#1A2035';
const bgOverlay = 'rgba(10, 13, 20, 0.85)';

// Borders & Dividers
const borderSubtle = '#1E2235';
const borderDefault = '#252B42';
const borderStrong = '#2E3550';

// Brand & Primary
const primary = '#4F6EF7';
const primaryLight = '#7B9BFF';
const primaryGlow = 'rgba(79, 110, 247, 0.25)';
const accent = '#7C3AED';

// RBAC Identity Colors
const teacherBase = '#4F6EF7';
const teacherMuted = 'rgba(79,110,247,0.12)';
const teacherBorder = 'rgba(79,110,247,0.3)';

const studentBase = '#10B981';
const studentMuted = 'rgba(16,185,129,0.12)';
const studentBorder = 'rgba(16,185,129,0.3)';

// Semantic Status Colors
const success = '#10B981';
const successMuted = 'rgba(16,185,129,0.15)';
const warning = '#F59E0B';
const warningMuted = 'rgba(245,158,11,0.15)';
const danger = '#EF4444';
const dangerMuted = 'rgba(239,68,68,0.15)';
const info = '#06B6D4';
const infoMuted = 'rgba(6,182,212,0.15)';

// Text Hierarchy
const textPrimary = '#F0F2FF';
const textSecondary = '#C0C5E0';
const textTertiary = '#8090C0';
const textMuted = '#4A5280';
const textDisabled = '#2E3550';

// ============================================================
// COLOR TYPES
// ============================================================

export interface RbacColors {
  base: string;
  muted: string;
  border: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  muted: string;
  disabled: string;
}

export interface BackgroundColors {
  base: string;
  surface: string;
  card: string;
  elevated: string;
  overlay: string;
}

export interface BorderColors {
  subtle: string;
  default: string;
  strong: string;
}

export interface SemanticColors {
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
  info: string;
  infoMuted: string;
}

export interface PrimaryColors {
  primary: string;
  primaryLight: string;
  primaryGlow: string;
  accent: string;
}

export interface Colors {
  bg: BackgroundColors;
  border: BorderColors;
  primary: PrimaryColors;
  teacher: RbacColors;
  student: RbacColors;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
  info: string;
  infoMuted: string;
  text: TextColors;
}

// ============================================================
// SPACING
// ============================================================

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 32,
};

// ============================================================
// BORDER RADIUS
// ============================================================

export interface Radius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

const radius: Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

// ============================================================
// FONT SIZES
// ============================================================

export interface FontSize {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  display: number;
}

const fontSize: FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 15,
  xl: 18,
  xxl: 24,
  xxxl: 28,
  display: 32,
};

// ============================================================
// FONT WEIGHTS
// ============================================================

export type FontWeight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export interface FontWeights {
  regular: FontWeight;
  medium: FontWeight;
  semibold: FontWeight;
  bold: FontWeight;
}

const fontWeights: FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// ============================================================
// LINE HEIGHTS
// ============================================================

export interface LineHeight {
  tight: number;
  normal: number;
  relaxed: number;
}

const lineHeight: LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// ============================================================
// SHADOWS
// ============================================================

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  sm: ShadowStyle;
  md: ShadowStyle;
  lg: ShadowStyle;
  primaryGlow: ShadowStyle;
}

const shadows: Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryGlow: {
    shadowColor: '#4F6EF7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ============================================================
// GRADIENTS
// ============================================================

export interface Gradient {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export interface Gradients {
  primary: Gradient;
  success: Gradient;
  card: Gradient;
}

const gradients: Gradients = {
  primary: {
    colors: ['#4F6EF7', '#7C3AED'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  success: {
    colors: ['#10B981', '#059669'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  card: {
    colors: ['#141828', '#0F1320'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

// ============================================================
// OPACITY
// ============================================================

export interface Opacity {
  invisible: number;
  disabled: number;
  muted: number;
  medium: number;
  full: number;
}

const opacity: Opacity = {
  invisible: 0,
  disabled: 0.4,
  muted: 0.6,
  medium: 0.8,
  full: 1,
};

// ============================================================
// Z-INDEX LAYERS
// ============================================================

export interface ZIndex {
  base: number;
  dropdown: number;
  sticky: number;
  modal: number;
  toast: number;
  tooltip: number;
}

const zIndex: ZIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
};

// ============================================================
// ASSEMBLE COLORS OBJECT
// ============================================================

const colors: Colors = {
  bg: {
    base: bgBase,
    surface: bgSurface,
    card: bgCard,
    elevated: bgElevated,
    overlay: bgOverlay,
  },
  border: {
    subtle: borderSubtle,
    default: borderDefault,
    strong: borderStrong,
  },
  primary: {
    primary: primary,
    primaryLight: primaryLight,
    primaryGlow: primaryGlow,
    accent: accent,
  },
  teacher: {
    base: teacherBase,
    muted: teacherMuted,
    border: teacherBorder,
  },
  student: {
    base: studentBase,
    muted: studentMuted,
    border: studentBorder,
  },
  success: success,
  successMuted: successMuted,
  warning: warning,
  warningMuted: warningMuted,
  danger: danger,
  dangerMuted: dangerMuted,
  info: info,
  infoMuted: infoMuted,
  text: {
    primary: textPrimary,
    secondary: textSecondary,
    tertiary: textTertiary,
    muted: textMuted,
    disabled: textDisabled,
  },
};

// ============================================================
// THEME OBJECT
// ============================================================

export interface Theme {
  colors: Colors;
  spacing: Spacing;
  radius: Radius;
  fontSize: FontSize;
  fontWeights: FontWeights;
  lineHeight: LineHeight;
  shadows: Shadows;
  gradients: Gradients;
  opacity: Opacity;
  zIndex: ZIndex;
}

export const theme: Theme = {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeights,
  lineHeight,
  shadows,
  gradients,
  opacity,
  zIndex,
};

// ============================================================
// CONVENIENCE EXPORTS
// ============================================================

export {
    radius as borderRadius, colors, fontSize,
    fontWeights, gradients, lineHeight, opacity, radius, shadows, spacing, zIndex
};

// ============================================================
// TYPED STYLE CREATORS
// ============================================================

export function createCardStyle(sty: ViewStyle): ViewStyle {
  return {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadows.sm,
    ...sty,
  };
}

export function createElevatedStyle(sty: ViewStyle): ViewStyle {
  return {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.md,
    ...sty,
  };
}

export function createTextStyle(sty: TextStyle): TextStyle {
  return {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeights.regular,
    ...sty,
  };
}

export function createHeadingStyle(sty: TextStyle): TextStyle {
  return {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeights.bold,
    ...sty,
  };
}

export default theme;
