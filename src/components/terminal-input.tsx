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

import { colors, fontSizes, fonts, glowShadow, spacing } from '@/theme';

type TerminalInputProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'username' | 'name' | 'off';
  textContentType?: TextInputProps['textContentType'];
  error?: boolean;
  editable?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'send';
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function TerminalInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete = 'off',
  textContentType,
  error = false,
  editable = true,
  returnKeyType,
  onSubmitEditing,
  onFocus,
  onBlur,
  style,
  testID,
}: TerminalInputProps) {
  const [focused, setFocused] = useState(false);
  const [defaultValue] = useState(() => value);

  const borderColor = error
    ? colors.error
    : focused
      ? colors.borderFocus
      : colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      ) : null}
      <View
        // collapsable={false} is required: this wrapper's style changes on focus
        // (the glowShadow adds elevation/shadowColor), which otherwise makes
        // Fabric recreate the native TextInput and drop focus mid-typing on
        // Android/New Architecture. See facebook/react-native#45798.
        collapsable={false}
        style={[
          styles.box,
          { borderColor },
          focused && !error ? glowShadow : null,
          error ? styles.boxError : null,
        ]}
      >
        <Text style={styles.prompt}>{'>'}</Text>
        <TextInput
          style={styles.input}
          // True uncontrolled: use a constant defaultValue to avoid layout-effect
          // resets that can drop characters when typing fast on Android/New Arch.
          defaultValue={defaultValue}
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
          // Android autofill (Google) glitches terminal-style fields while typing.
          importantForAutofill="no"
          selectionColor={colors.primary}
          underlineColorAndroid="transparent"
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          testID={testID}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  labelError: {
    color: colors.error,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  boxError: {
    backgroundColor: colors.errorDim,
  },
  prompt: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.text,
    // System monospace for the editable text. The custom Share Tech Mono font
    // can desync the caret/IME on Android and make typing appear to glitch.
    fontFamily: fonts.monoFallback,
    fontSize: fontSizes.md,
    // No letterSpacing here: on Android it misplaces the caret and makes
    // typed text appear to jitter / drop characters.
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
});
