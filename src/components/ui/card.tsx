import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

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
  return (
    <Reveal style={style} delay={delay}>
      <View style={styles.card} testID={testID}>
        {title || subtitle || headerAccessory ? (
          <View style={styles.header}>
            <View style={styles.headerText}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {headerAccessory}
          </View>
        ) : null}
        <View style={[styles.body, bodyStyle]}>{children}</View>
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: colors.cyan,
  },
  headerText: {
    flex: 1,
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
