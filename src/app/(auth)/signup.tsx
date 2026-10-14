import { Link, Redirect } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { TerminalButton } from '@/components/terminal-button';
import { TerminalInput } from '@/components/terminal-input';
import { TermsModal } from '@/components/terms-modal';
import { useAuth } from '@/context/auth-context';
import { signUp } from '@/services/auth';
import { colors, fontSizes, fonts, spacing } from '@/theme';
import { mapAuthError } from '@/utils/errors';
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/utils/validation';

type Field = 'username' | 'email' | 'password' | 'confirm';

export default function SignUpScreen() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    username: false,
    email: false,
    password: false,
    confirm: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(
    () => ({
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirmPassword(password, confirmPassword),
    }),
    [username, email, password, confirmPassword],
  );

  const formValid = !errors.username && !errors.email && !errors.password && !errors.confirm;
  const canSubmit = formValid && acceptedTerms && !submitting;

  const showError = (field: Field): string | null =>
    touched[field] || submitAttempted ? errors[field] : null;

  if (user) {
    return <Redirect href="/(app)/home" />;
  }

  function markTouched(field: Field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleCreateAccount() {
    if (submitting) return;

    setSubmitAttempted(true);
    setServerError(null);

    if (!formValid || !acceptedTerms) {
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email.trim(), password, username.trim());
      // onAuthStateChanged redirects on success.
    } catch (error) {
      setServerError(mapAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{'>_ REGISTER'}</Text>
        <Text style={styles.divider}>{'// NEW OPERATOR ENROLLMENT'}</Text>
      </View>

      <View style={styles.form}>
        <View key="username">
          <TerminalInput
            label="callsign"
            value={username}
            onChangeText={setUsername}
            onBlur={() => markTouched('username')}
            placeholder="agent_zero"
            error={Boolean(showError('username'))}
            testID="signup-username"
          />
          {showError('username') ? (
            <Text style={styles.fieldError}>{showError('username')}</Text>
          ) : null}
        </View>

        <View key="email">
          <TerminalInput
            label="identity"
            value={email}
            onChangeText={setEmail}
            onBlur={() => markTouched('email')}
            placeholder="user@nullsec.io"
            keyboardType="email-address"
            error={Boolean(showError('email'))}
            testID="signup-email"
          />
          {showError('email') ? (
            <Text style={styles.fieldError}>{showError('email')}</Text>
          ) : null}
        </View>

        <View key="password">
          <TerminalInput
            label="passphrase"
            value={password}
            onChangeText={setPassword}
            onBlur={() => markTouched('password')}
            placeholder="********"
            secureTextEntry
            error={Boolean(showError('password'))}
            testID="signup-password"
          />
          {showError('password') ? (
            <Text style={styles.fieldError}>{showError('password')}</Text>
          ) : null}
        </View>

        <View key="confirm">
          <TerminalInput
            label="confirm passphrase"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => markTouched('confirm')}
            placeholder="********"
            secureTextEntry
            error={Boolean(showError('confirm'))}
            onSubmitEditing={handleCreateAccount}
            testID="signup-confirm"
          />
          {showError('confirm') ? (
            <Text style={styles.fieldError}>{showError('confirm')}</Text>
          ) : null}
        </View>

        <Pressable
          key="terms"
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((prev) => !prev)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          testID="signup-terms-checkbox"
        >
          <Text style={styles.checkbox}>
            {acceptedTerms ? '[X]' : '[ ]'}
          </Text>
          <Text style={styles.termsText}>
            I have read and agree to the{' '}
            <Text
              style={styles.termsLink}
              onPress={() => setTermsVisible(true)}
              suppressHighlighting
            >
              Terms &amp; Conditions
            </Text>
          </Text>
        </Pressable>

        {serverError ? (
          <View key="server" style={styles.serverError}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        <TerminalButton
          key="submit"
          label="CREATE ACCOUNT"
          onPress={handleCreateAccount}
          disabled={!canSubmit}
          loading={submitting}
          style={styles.button}
          testID="signup-submit"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ALREADY ENROLLED?</Text>
        <Link href="/(auth)/login" style={styles.footerLink}>
          LOGIN
        </Link>
      </View>

      <TermsModal
        visible={termsVisible}
        onAccept={() => {
          setAcceptedTerms(true);
          setTermsVisible(false);
        }}
        onClose={() => setTermsVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    letterSpacing: 4,
  },
  divider: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  form: {
    marginBottom: spacing.xl,
  },
  fieldError: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 1,
  },
  termsText: {
    flex: 1,
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  serverError: {
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  serverErrorText: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
  footerLink: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
