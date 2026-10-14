import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * NullSec theme: single source of truth for colors, fonts, spacing and effects.
 * Hacker / terminal aesthetic: black canvas, neon green phosphor, dim borders.
 */

export const colors = {
  background: '#0a0a0a',
  inputBackground: '#050805',
  surface: '#0b0f0b',

  primary: '#00ff41',
  primaryDim: '#00b32e',
  primaryFaint: '#0a3d18',

  text: '#00ff41',
  textDim: '#08912b',
  textMuted: '#0a7a24',

  border: '#0e3a1a',
  borderDim: '#0a2a12',
  borderFocus: '#00ff41',

  glow: '#00ff41',

  error: '#ff2b2b',
  errorDim: '#3a0a0a',

  disabled: '#123318',
  disabledText: '#0a4d1c',

  overlay: 'rgba(2, 6, 2, 0.94)',
  transparent: 'transparent',
} as const;

export const fonts = {
  /** Loaded via expo-font / @expo-google-fonts/share-tech-mono */
  mono: 'ShareTechMono_400Regular',
  /** Fallback used before fonts load (and for native UI chrome) */
  monoFallback: (Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }) ?? 'monospace') as string,
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 34,
  display: 46,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  none: 0,
  sm: 2,
} as const;

/** Neon focus glow — shared by inputs and buttons. */
export const glowShadow: ViewStyle = {
  shadowColor: colors.glow,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.9,
  shadowRadius: 8,
  elevation: 6,
};

export const monoText: TextStyle = {
  fontFamily: fonts.mono,
  color: colors.text,
  letterSpacing: 1,
};

export const theme = {
  colors,
  fonts,
  fontSizes,
  spacing,
  radii,
  glowShadow,
} as const;

export type Theme = typeof theme;
