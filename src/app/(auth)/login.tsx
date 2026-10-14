import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/auth-context';
import { logIn } from '@/services/auth';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
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

    if (nextEmailError || nextPasswordError) return;

    setSubmitting(true);
    try {
      await logIn(email.trim(), password);
      // AuthProvider redirects on success.
    } catch (error) {
      setServerError(mapAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.column}>
        <View style={styles.brandBlock}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark} />
            <Text style={styles.brand}>NULLSEC</Text>
          </View>
          <Text style={styles.brandSub}>Class Network</Text>
        </View>

        <Card title="Sign in" subtitle="Access your class workspace">
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@school.edu"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
            returnKeyType="next"
            testID="login-email"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoComplete="password"
            error={passwordError}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            testID="login-password"
          />

          {serverError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          ) : null}

          <Button
            label="Sign in"
            onPress={handleLogin}
            loading={submitting}
            disabled={submitting}
            testID="login-submit"
          />

          <Link href="/(auth)/forgot-password" style={styles.forgot}>
            Forgot password?
          </Link>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New here?</Text>
          <Link href="/(auth)/signup" style={styles.footerLink}>
            Create an account
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  column: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  brandBlock: {
    marginBottom: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 14,
    height: 14,
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
  },
  brand: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    letterSpacing: 4,
  },
  brandSub: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  forgot: {
    color: colors.accentStrong,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  footerLink: {
    color: colors.accentStrong,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
