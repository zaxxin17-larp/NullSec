import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const isInteractive = !disabled && !loading;

  const textColor =
    variant === 'primary'
      ? colors.cyan
      : variant === 'danger'
        ? colors.danger
        : colors.text;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        disabled && styles.disabled,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.accent}
        />
      ) : (
        <Text
          style={[
            styles.label,
            size === 'sm' && styles.labelSm,
            { color: disabled ? colors.disabledText : textColor },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.transparent,
    flexDirection: 'row',
  },
  sm: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: fontSizes.sm,
  },
  primary: {
    backgroundColor: colors.panel,
    borderColor: colors.panel,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  ghost: {
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
  },
  disabled: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.82,
  },
});
