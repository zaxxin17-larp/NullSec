import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, spacing } from '@/theme';

type LoaderProps = {
  label?: string;
  compact?: boolean;
  testID?: string;
};

/** Minimal, calm loading indicator (respects reduced-motion by avoiding loops). */
export function Loader({ label, compact = false, testID }: LoaderProps) {
  return (
    <View
      style={[styles.container, compact && styles.compact]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Loading'}
    >
      <ActivityIndicator color={colors.accent} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  compact: {
    flex: 0,
    padding: spacing.lg,
    backgroundColor: colors.transparent,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
  },
});
