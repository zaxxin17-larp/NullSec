import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BlinkingCursor } from '@/components/blinking-cursor';
import { ReleaseNotification } from '@/components/release-notification';
import { ScreenContainer } from '@/components/screen-container';
import { TerminalButton } from '@/components/terminal-button';
import { UpdateBanner } from '@/components/update-banner';
import { useAuth } from '@/context/auth-context';
import { logOut } from '@/services/auth';
import { colors, fontSizes, fonts, spacing } from '@/theme';
import { checkForUpdates, type UpdatePhase } from '@/updates';

export default function HomeScreen() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<UpdatePhase>('idle');
  const [message, setMessage] = useState('');
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const operator = user.displayName?.trim() || user.email || 'OPERATOR';

  async function handleCheckUpdates() {
    if (checkingUpdates) return;
    setCheckingUpdates(true);
    try {
      const result = await checkForUpdates((update) => {
        setPhase(update.phase);
        setMessage(update.message);
      });

      // On 'restarting' the app reloads; otherwise fade the banner out shortly.
      if (result.phase !== 'restarting' && result.phase !== 'idle') {
        setTimeout(() => {
          setPhase('idle');
          setMessage('');
        }, 2600);
      }
    } finally {
      setCheckingUpdates(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logOut();
      // onAuthStateChanged redirects back to login.
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <ReleaseNotification />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{'// SESSION ACTIVE'}</Text>
        <View style={styles.grantedRow}>
          <Text style={styles.granted}>ACCESS GRANTED</Text>
          <BlinkingCursor style={styles.granted} />
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>OPERATOR</Text>
        <Text style={styles.operator} testID="home-username">
          {operator}
        </Text>
        <View style={styles.metaList}>
          <Text style={styles.meta} numberOfLines={1}>
            UID: {user.uid}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            CHANNEL: PRIVATE
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TerminalButton
          label="Check for updates"
          variant="ghost"
          onPress={handleCheckUpdates}
          disabled={checkingUpdates}
          style={styles.action}
          testID="home-check-updates"
        />
        <TerminalButton
          label="Logout"
          variant="danger"
          onPress={handleLogout}
          disabled={loggingOut}
          style={styles.action}
          testID="home-logout"
        />
      </View>

      <UpdateBanner visible={message.length > 0} message={message} phase={phase} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  grantedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  granted: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    letterSpacing: 4,
  },
  panel: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  panelLabel: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  operator: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  metaList: {
    gap: spacing.xs,
  },
  meta: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  action: {
    marginTop: 0,
  },
});
