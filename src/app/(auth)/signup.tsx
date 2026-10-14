import { Link, Redirect } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { TermsModal } from '@/components/terms-modal';
import { useAuth } from '@/context/auth-context';
import { signUp } from '@/services/auth';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { mapAuthError } from '@/utils/errors';
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/utils/validation';

type Field = 'name' | 'email' | 'password' | 'confirm';

export default function SignUpScreen() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(
    () => ({
      name: validateUsername(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirmPassword(password, confirmPassword),
    }),
    [name, email, password, confirmPassword],
  );

  const formValid = !errors.name && !errors.email && !errors.password && !errors.confirm;
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

    if (!formValid || !acceptedTerms) return;

    setSubmitting(true);
    try {
      await signUp(email.trim(), password, name.trim());
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
          <Text style={styles.brandSub}>Create your class account</Text>
        </View>

        <Card title="Create account">
          <TextField
            label="Full name"
            value={name}
            onChangeText={setName}
            onBlur={() => markTouched('name')}
            placeholder="Jane Doe"
            autoComplete="name"
            autoCapitalize="words"
            error={showError('name')}
            testID="signup-name"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            onBlur={() => markTouched('email')}
            placeholder="you@school.edu"
            keyboardType="email-address"
            autoComplete="email"
            error={showError('email')}
            testID="signup-email"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => markTouched('password')}
            placeholder="At least 6 characters"
            secureTextEntry
            autoComplete="new-password"
            error={showError('password')}
            testID="signup-password"
          />
          <TextField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => markTouched('confirm')}
            placeholder="Re-enter your password"
            secureTextEntry
            autoComplete="new-password"
            error={showError('confirm')}
            onSubmitEditing={handleCreateAccount}
            testID="signup-confirm"
          />

          <Pressable
            style={styles.termsRow}
            onPress={() => setAcceptedTerms((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
            testID="signup-terms-checkbox"
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
              {acceptedTerms ? <Text style={styles.checkmark}>{'\u2713'}</Text> : null}
            </View>
            <Text style={styles.termsText}>
              I have read and agree to the{' '}
              <Text
                style={styles.termsLink}
                onPress={() => setTermsVisible(true)}
                suppressHighlighting
              >
                Terms &amp; Conditions
              </Text>
              .
            </Text>
          </Pressable>

          {serverError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          ) : null}

          <Button
            label="Create account"
            onPress={handleCreateAccount}
            disabled={!canSubmit}
            loading={submitting}
            testID="signup-submit"
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" style={styles.footerLink}>
            Sign in
          </Link>
        </View>
      </View>

      {termsVisible ? (
        <TermsModal
          visible
          onAccept={() => {
            setAcceptedTerms(true);
            setTermsVisible(false);
          }}
          onClose={() => setTermsVisible(false)}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  column: {
    width: '100%',
    maxWidth: 480,
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
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.accentStrong,
    fontWeight: '600',
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
