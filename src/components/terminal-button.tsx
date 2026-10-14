import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontSizes, fonts, glowShadow, spacing } from '@/theme';

type TerminalButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function TerminalButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  testID,
}: TerminalButtonProps) {
  const isInteractive = !disabled && !loading;
  const text =
    variant === 'ghost'
      ? colors.textDim
      : variant === 'danger'
        ? colors.error
        : colors.primary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        disabled && styles.disabled,
        isInteractive && glowShadow,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: text },
          disabled && styles.disabledText,
        ]}
      >
        {loading ? 'PROCESSING...' : label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.transparent,
  },
  ghost: {
    borderColor: colors.border,
  },
  danger: {
    borderColor: colors.error,
    shadowColor: colors.error,
  },
  disabled: {
    borderColor: colors.disabled,
    backgroundColor: colors.transparent,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    backgroundColor: colors.primaryFaint,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 3,
  },
  disabledText: {
    color: colors.disabledText,
  },
});
