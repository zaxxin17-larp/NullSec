import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  error?: string | null;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoFocus?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'send';
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete = 'off',
  textContentType,
  error = null,
  editable = true,
  multiline = false,
  numberOfLines,
  maxLength,
  autoFocus,
  returnKeyType,
  onSubmitEditing,
  onFocus,
  onBlur,
  style,
  testID,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.accent
      : colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={[styles.label, error ? styles.labelError : null]}>
          {label}
        </Text>
      ) : null}

      {/* collapsable={false}: keeps the native input from being re-created when
          the wrapper's style changes on focus (RN New Architecture). */}
      <View
        collapsable={false}
        style={[styles.box, { borderColor }, multiline && styles.boxMultiline]}
      >
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          importantForAutofill="no"
          selectionColor={colors.accent}
          underlineColorAndroid="transparent"
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          testID={testID}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  labelError: {
    color: colors.danger,
  },
  box: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  boxMultiline: {
    minHeight: 88,
    paddingVertical: spacing.sm,
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
});
