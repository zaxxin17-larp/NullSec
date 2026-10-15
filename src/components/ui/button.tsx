import { useMemo } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
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
  const scale = useMemo(() => new Animated.Value(1), []);

  function pressIn() {
    Animated.timing(scale, {
      toValue: 0.96,
      duration: 90,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }

  function pressOut() {
    Animated.timing(scale, {
      toValue: 1,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }

  const textColor =
    variant === 'primary'
      ? colors.panel
      : variant === 'danger'
        ? colors.danger
        : colors.text;

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        testID={testID}
        onPress={onPress}
        onPressIn={isInteractive ? pressIn : undefined}
        onPressOut={isInteractive ? pressOut : undefined}
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
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.panel : colors.accent}
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
    </Animated.View>
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
  primary: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
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
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 1,
  },
  labelSm: {
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
});
