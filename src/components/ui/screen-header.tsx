import { Link, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Reveal } from '@/components/ui/reveal';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  backHref?: Href;
  backLabel?: string;
  testID?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  badge,
  backHref = '/(app)/home',
  backLabel = 'System',
  testID,
}: ScreenHeaderProps) {
  return (
    <Reveal style={styles.wrap}>
      <Link
        href={backHref}
        style={styles.backLink}
        testID={testID ? `${testID}-back` : undefined}
      >
        {`\u2190  ${backLabel}`}
      </Link>

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} testID={testID}>
            {title}
          </Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },
  backLink: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  header: {},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
    letterSpacing: 1,
  },
  badge: {
    color: colors.panel,
    backgroundColor: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
});
