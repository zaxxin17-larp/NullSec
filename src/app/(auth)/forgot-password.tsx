import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BlinkingCursor } from '@/components/blinking-cursor';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { sendPasswordReset } from '@/services/auth';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { mapAuthError } from '@/utils/errors';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    setServerError(null);
    if (nextEmailError) return;

    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
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
            <BlinkingCursor style={styles.brandCursor} />
          </View>
          <Text style={styles.brandSub}>Password recovery</Text>
        </View>

        <Card
          title="Reset password"
          subtitle="We'll email you a secure reset link."
        >
          {sent ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                If an account exists for {email.trim()}, a reset link is on its way.
                Check your inbox and spam folder.
              </Text>
            </View>
          ) : (
            <>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@school.edu"
                keyboardType="email-address"
                autoComplete="email"
                error={emailError}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                testID="forgot-email"
              />

              {serverError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{serverError}</Text>
                </View>
              ) : null}

              <Button
                label="Send reset link"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting}
                testID="forgot-submit"
              />
            </>
          )}
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remembered it?</Text>
          <Link href="/(auth)/login" style={styles.footerLink}>
            Back to sign in
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
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    letterSpacing: 4,
  },
  brandCursor: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
    marginLeft: 2,
  },
  brandSub: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  successBanner: {
    backgroundColor: colors.presentSoft,
    borderWidth: 1,
    borderColor: colors.present,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  successText: {
    color: colors.present,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
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
