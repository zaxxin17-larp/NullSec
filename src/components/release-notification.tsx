import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, spacing } from '@/theme';
import { DISMISSED_RELEASE_KEY, LATEST_RELEASE } from '@/releases';

/**
 * Themed notification card announcing the latest release. Stays dismissed until
 * a newer version appears in the local release feed.
 */
export function ReleaseNotification() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DISMISSED_RELEASE_KEY)
      .then((value) => {
        if (active) setVisible(value !== LATEST_RELEASE.version);
      })
      .catch(() => {
        if (active) setVisible(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    setVisible(false);
    AsyncStorage.setItem(DISMISSED_RELEASE_KEY, LATEST_RELEASE.version).catch(
      () => {},
    );
  };

  return (
    <View style={styles.card} testID="release-notification">
      <View style={styles.header}>
        <Text style={styles.badge}>[ NEW RELEASE ]</Text>
        <Pressable
          onPress={dismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dismiss release notification"
        >
          <Text style={styles.close}>[X]</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>
        v{LATEST_RELEASE.version} :: {LATEST_RELEASE.title}
      </Text>

      <View style={styles.notes}>
        {LATEST_RELEASE.notes.map((note) => (
          <Text key={note} style={styles.note}>
            {'> '}
            {note}
          </Text>
        ))}
      </View>

      <Pressable
        onPress={dismiss}
        style={styles.dismiss}
        accessibilityRole="button"
      >
        <Text style={styles.dismissText}>ACKNOWLEDGE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  badge: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
  },
  close: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
  },
  version: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  notes: {
    gap: spacing.xs,
  },
  note: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  dismiss: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  dismissText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 3,
  },
});
