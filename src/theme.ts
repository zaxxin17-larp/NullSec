import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * NullSec / ctOS-class design system: single source of truth for colors, fonts,
 * spacing, radii and effects.
 *
 * Aesthetic: clean white "futuristic operating system" — light-gray canvas,
 * white surfaces, charcoal type, thin precise borders and restrained
 * cyan / electric-blue accents. No neon, no oversized rounded cards.
 *
 * Legacy token names (primary, textDim, error, ...) are kept as aliases so any
 * component can be migrated incrementally without breaking compilation.
 */

export const colors = {
  // Canvas & surfaces
  background: '#eef0f3',
  surface: '#ffffff',
  surfaceAlt: '#f6f7f9',
  surfaceSunken: '#e9ebef',
  inputBackground: '#f6f7f9',

  // Lines
  border: '#dfe3e8',
  borderDim: '#eceef1',
  borderStrong: '#c8ced6',
  borderFocus: '#0093b0',

  // Type
  text: '#14171a',
  textSecondary: '#48515a',
  textMuted: '#818a93',

  // Accent (cyan / electric blue)
  accent: '#0093b0',
  accentStrong: '#00768f',
  accentSoft: '#e0f4f8',
  glow: '#0093b0',
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
  overlay: 'rgba(15, 20, 25, 0.42)',
  white: '#ffffff',
  transparent: 'transparent',

  // Legacy aliases (map onto the new palette)
  primary: '#0093b0',
  primaryDim: '#00768f',
  primaryFaint: '#e0f4f8',
  textDim: '#48515a',
} as const;

function pick(value: string | undefined, fallback: string): string {
  return value ?? fallback;
}

export const fonts = {
  /** UI / body font — system stack for crisp native + web rendering. */
  sans: pick(
    Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    }),
    'system-ui, sans-serif',
  ),
  /** Technical font for labels and numbers. */
  mono: pick(
    Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
    }),
    'monospace',
  ),
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
  sm: 4,
  md: 8,
  pill: 999,
} as const;

/** Soft, restrained elevation for cards and floating surfaces. */
export const shadow: ViewStyle = {
  shadowColor: '#0b1b22',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 2,
};

/** @deprecated legacy alias — use `shadow`. */
export const glowShadow: ViewStyle = shadow;

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
