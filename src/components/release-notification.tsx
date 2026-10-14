import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { colors, fontSizes, fonts, spacing } from '@/theme';
import { DISMISSED_RELEASE_KEY, LATEST_RELEASE } from '@/releases';

/**
 * Release notes card. Stays dismissed until a newer version appears in the
 * local release feed.
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

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    AsyncStorage.setItem(DISMISSED_RELEASE_KEY, LATEST_RELEASE.version).catch(
      () => {},
    );
  };

  return (
    <Card
      testID="release-notification"
      style={styles.card}
      title={`What's new · v${LATEST_RELEASE.version}`}
      headerAccessory={
        <Pressable
          onPress={dismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dismiss release notes"
        >
          <Text style={styles.close}>{'\u2715'}</Text>
        </Pressable>
      }
    >
      <Text style={styles.title}>{LATEST_RELEASE.title}</Text>
      <View style={styles.notes}>
        {LATEST_RELEASE.notes.map((note) => (
          <Text key={note} style={styles.note}>
            {'\u2022  '}
            {note}
          </Text>
        ))}
      </View>
      <Button
        label="Got it"
        variant="secondary"
        size="sm"
        onPress={dismiss}
        style={styles.dismiss}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  close: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  notes: {
    gap: spacing.xs,
  },
  note: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  dismiss: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
});
