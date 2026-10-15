import { Link, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HudCorners } from '@/components/ui/hud-corners';
import { Reveal } from '@/components/ui/reveal';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  /** Small telemetry line above the title, e.g. "CLASS NETWORK // DIRECTORY". */
  kicker?: string;
  /** Right-aligned section code, e.g. "SEC-07". */
  code?: string;
  testID?: string;
};

const BACK_HREF = '/(app)/home' as Href;

/** Console-style section header used at the top of every inner screen. */
export function ScreenHeader({
  title,
  subtitle,
  badge,
  kicker = 'NULLSEC // SYSTEM',
  code,
  testID,
}: ScreenHeaderProps) {
  return (
    <Reveal style={styles.wrap}>
      <View style={styles.panel}>
        <View style={styles.topRow}>
          <Link href={BACK_HREF} style={styles.back} accessibilityLabel="Back to system">
            {'\u2190 SYSTEM'}
          </Link>
          {code ? <Text style={styles.code}>{code}</Text> : null}
        </View>

        <View style={styles.titleRow}>
          <View style={styles.mark}>
            <View style={styles.markInner} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.kicker}>{kicker}</Text>
            <View style={styles.titleLine}>
              <Text style={styles.title} testID={testID}>
                {title}
              </Text>
              {badge ? <Text style={styles.badge}>{badge}</Text> : null}
            </View>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <HudCorners size={12} thickness={2} inset={-1} opacity={0.75} />
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },
  panel: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelLine,
    borderLeftWidth: 2,
    borderLeftColor: colors.cyan,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  back: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  code: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mark: {
    width: 26,
    height: 40,
    borderWidth: 1,
    borderColor: colors.cyanDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markInner: {
    width: 8,
    height: 18,
    backgroundColor: colors.cyan,
  },
  textCol: {
    flex: 1,
  },
  kicker: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginTop: 3,
    letterSpacing: 0.5,
  },
});
