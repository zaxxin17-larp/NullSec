import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BlinkingCursor } from '@/components/blinking-cursor';
import { ScreenContainer } from '@/components/screen-container';
import { TerminalButton } from '@/components/terminal-button';
import { TerminalInput } from '@/components/terminal-input';
import { TypewriterText } from '@/components/typewriter-text';
import { useAuth } from '@/context/auth-context';
import { logIn } from '@/services/auth';
import { colors, fontSizes, fonts, spacing } from '@/theme';
import { mapAuthError } from '@/utils/errors';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Redirect href="/(app)/home" />;
  }

  async function handleLogin() {
    if (submitting) return;

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setServerError(null);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setSubmitting(true);
    try {
      await logIn(email.trim(), password);
      // onAuthStateChanged in AuthProvider redirects on success.
    } catch (error) {
      setServerError(mapAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <TypewriterText
            text=">_ NULLSEC"
            speed={80}
            style={styles.logo}
          />
          <BlinkingCursor style={styles.logo} />
        </View>
        <Text style={styles.subtitle}>SECURE TERMINAL ACCESS</Text>
        <Text style={styles.divider}>{'// AUTHENTICATION REQUIRED'}</Text>
      </View>

      <View style={styles.form}>
        <View key="email">
          <TerminalInput
            label="identity"
            value={email}
            onChangeText={setEmail}
            placeholder="user@nullsec.io"
            keyboardType="email-address"
            error={Boolean(emailError)}
            returnKeyType="next"
            testID="login-email"
          />
          {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
        </View>

        <View key="password">
          <TerminalInput
            label="passphrase"
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry
            error={Boolean(passwordError)}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            testID="login-password"
          />
          {passwordError ? (
            <Text style={styles.fieldError}>{passwordError}</Text>
          ) : null}
        </View>

        {serverError ? (
          <View key="server" style={styles.serverError}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        <TerminalButton
          key="submit"
          label="LOGIN"
          onPress={handleLogin}
          loading={submitting}
          disabled={submitting}
          style={styles.button}
          testID="login-submit"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>NO ACTIVE SESSION?</Text>
        <Link href="/(auth)/signup" style={styles.footerLink}>
          CREATE ACCOUNT
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    letterSpacing: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 4,
    marginTop: spacing.sm,
  },
  divider: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    marginTop: spacing.lg,
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
