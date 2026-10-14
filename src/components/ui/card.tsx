import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type CardProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /** Right-aligned header accessory (e.g. a count or action). */
  headerAccessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Card({
  children,
  title,
  subtitle,
  headerAccessory,
  style,
  bodyStyle,
  testID,
}: CardProps) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {title || headerAccessory ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {headerAccessory}
        </View>
      ) : null}
      <View style={[styles.body, bodyStyle]}>{children}</View>
    </View>
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDim,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  body: {
    padding: spacing.lg,
  },
});
