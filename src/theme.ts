import type { TextStyle, ViewStyle } from 'react-native';

/**
 * NullSec design system — hybrid ctOS.
 *
 * Light page canvas with dark ctOS "HUD" panels (top nav, card headers) and
 * cyan / orange technical accents. Typography is Share Tech Mono (the "hacker"
 * face) loaded in the root layout.
 */

const SHARE_TECH_MONO = 'ShareTechMono_400Regular';

export const colors = {
  // Light canvas & surfaces
  background: '#e9edf1',
  surface: '#ffffff',
  surfaceAlt: '#f4f6f8',
  surfaceSunken: '#e2e7ec',
  inputBackground: '#f4f6f8',

  // Light-mode lines
  border: '#cdd4db',
  borderDim: '#e3e8ed',
  borderStrong: '#aab3bd',
  borderFocus: '#0a9db3',

  /** Faint technical grid drawn behind the page canvas. */
  gridLine: 'rgba(10, 157, 179, 0.07)',

  // ctOS dark HUD panels
  panel: '#0c1116',
  panelAlt: '#141b22',
  panelLine: '#243039',
  ink: '#d8e7ea',
  inkDim: '#7c8b94',
  cyan: '#3fd6e8',
  cyanDim: '#1d7f8c',
  orange: '#f5a623',

  // Type (light surfaces)
  text: '#111820',
  textSecondary: '#3f4a54',
  textMuted: '#77828c',

  // Accent (cyan / electric blue)
  accent: '#0a9db3',
  accentStrong: '#067e91',
  accentSoft: '#e0f4f8',
  glow: '#3fd6e8',
  blue: '#2f6bed',

  // Semantic — attendance
  present: '#1f8a4c',
  presentSoft: '#e6f4ec',
  absent: '#cf3a3a',
  absentSoft: '#fbeaea',
  excused: '#b5791a',
  excusedSoft: '#fbf2e2',

  // Semantic — general
  error: '#cf3a3a',
  errorDim: '#fbeaea',
  danger: '#cf3a3a',
  success: '#1f8a4c',
  warning: '#b5791a',

  // States
  disabled: '#c9cfd6',
  disabledText: '#98a1aa',

  // Utility
  overlay: 'rgba(8, 12, 16, 0.52)',
  white: '#ffffff',
  transparent: 'transparent',

  // Legacy aliases (map onto the palette)
  primary: '#0a9db3',
  primaryDim: '#067e91',
  primaryFaint: '#e0f4f8',
  textDim: '#3f4a54',
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
