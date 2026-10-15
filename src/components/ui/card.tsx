import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { HudCorners } from '@/components/ui/hud-corners';
import { Reveal } from '@/components/ui/reveal';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type CardProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /** Right-aligned header accessory (e.g. a count or action). */
  headerAccessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  /** Entrance stagger in ms (see `Reveal`). */
  delay?: number;
  testID?: string;
};

/** ctOS HUD panel: raised header strip, left accent rail and corner brackets. */
export function Card({
  children,
  title,
  subtitle,
  headerAccessory,
  style,
  bodyStyle,
  delay = 0,
  testID,
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || headerAccessory);

  return (
    <Reveal style={style} delay={delay}>
      <View style={styles.card} testID={testID}>
        {hasHeader ? (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.mark} />
              <View style={styles.headerText}>
                {title ? <Text style={styles.title}>{title}</Text> : null}
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.ticks}>
                <View style={styles.tick} />
                <View style={styles.tick} />
                <View style={styles.tick} />
              </View>
              {headerAccessory}
            </View>
          </View>
        ) : null}
        <View style={[styles.body, bodyStyle]}>{children}</View>
        <HudCorners size={11} thickness={2} inset={-1} opacity={0.7} />
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 2,
    borderLeftColor: colors.cyanDim,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.panelAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.cyan,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  mark: {
    width: 6,
    height: 6,
    backgroundColor: colors.cyan,
  },
  headerText: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ticks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tick: {
    width: 2,
    height: 10,
    backgroundColor: colors.panelLine,
  },
  title: {
    color: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginTop: 1,
    letterSpacing: 0.5,
  },
  body: {
    padding: spacing.lg,
  },
});
