import type { TextStyle, ViewStyle } from 'react-native';

/**
 * NullSec design system — dark ctOS.
 *
 * Void-dark canvas with layered HUD panels, luminous hairline borders and cyan /
 * amber technical accents (sci-fi FUI). Typography is Share Tech Mono (the
 * "hacker" face) loaded in the root layout.
 */

const SHARE_TECH_MONO = 'ShareTechMono_400Regular';

export const colors = {
  // Dark ctOS canvas & surfaces (void at the back, panels in front)
  background: '#05090d',
  surface: '#0a1118',
  surfaceAlt: '#101a22',
  surfaceSunken: '#070c11',
  inputBackground: '#0e1720',

  // Dark hairline structure
  border: '#1b2833',
  borderDim: '#131d26',
  borderStrong: '#2c3e4b',
  borderFocus: '#3fd6e8',

  /** Faint technical grid drawn behind the page canvas. */
  gridLine: 'rgba(63, 214, 232, 0.05)',

  // ctOS dark HUD panels
  panel: '#0c1219',
  panelAlt: '#131d26',
  panelLine: '#22303b',
  ink: '#dbe8ec',
  inkDim: '#7f909b',
  cyan: '#3fd6e8',
  cyanDim: '#1d7f8c',
  orange: '#f5a623',

  // Type (light surfaces)
  text: '#dbe8ec',
  textSecondary: '#9aabb5',
  textMuted: '#63737e',

  // Accent (cyan / electric blue)
  accent: '#3fd6e8',
  accentStrong: '#8aeaf5',
  accentSoft: 'rgba(63, 214, 232, 0.14)',
  glow: '#3fd6e8',
  blue: '#2f6bed',

  // Semantic — attendance
  present: '#4bd08b',
  presentSoft: 'rgba(75, 208, 139, 0.16)',
  absent: '#ef5b5b',
  absentSoft: 'rgba(239, 91, 91, 0.16)',
  excused: '#f2c14e',
  excusedSoft: 'rgba(242, 193, 78, 0.16)',

  // Semantic — general
  error: '#ef5b5b',
  errorDim: 'rgba(239, 91, 91, 0.16)',
  danger: '#ef5b5b',
  success: '#4bd08b',
  warning: '#f2c14e',

  // States
  disabled: '#26333d',
  disabledText: '#5b6a74',

  // Utility
  overlay: 'rgba(2, 5, 9, 0.72)',
  white: '#ffffff',
  transparent: 'transparent',

  // Legacy aliases (map onto the palette)
  primary: '#3fd6e8',
  primaryDim: '#1d7f8c',
  primaryFaint: 'rgba(63, 214, 232, 0.14)',
  textDim: '#9aabb5',
} as const;

export const fonts = {
  /** Body / UI — the Share Tech Mono "hacker" face. */
  sans: SHARE_TECH_MONO,
  /** Technical labels and numbers — same mono face. */
  mono: SHARE_TECH_MONO,
  /** @deprecated kept for legacy components. */
  monoFallback: 'monospace',
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 30,
  display: 40,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  none: 0,
  sm: 2,
  md: 2,
  pill: 999,
} as const;

/** Accent choices for custom avatars (also exposed as swatches in Settings). */
export const avatarColors = [
  '#3fd6e8',
  '#2f6bed',
  '#7c5cff',
  '#e0529c',
  '#f5a623',
  '#f2c14e',
  '#4bd08b',
  '#2fb8a0',
  '#ef5b5b',
  '#8b98a5',
] as const;

/** Crisp ctOS elevation — a hard offset shadow rather than a soft blur. */
export const shadow: ViewStyle = {
  shadowColor: '#0a0f14',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.16,
  shadowRadius: 14,
  elevation: 3,
};

/** @deprecated legacy alias — use `shadow`. */
export const glowShadow: ViewStyle = {
  shadowColor: colors.cyan,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 12,
  elevation: 6,
};

export const monoText: TextStyle = {
  fontFamily: fonts.mono,
  color: colors.text,
  letterSpacing: 0.5,
};

export const theme = {
  colors,
  fonts,
  fontSizes,
  spacing,
  radii,
  shadow,
  glowShadow,
} as const;

export type Theme = typeof theme;
