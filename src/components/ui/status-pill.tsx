import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

export type AttendanceStatus = 'present' | 'absent' | 'excused';
export type AttendanceMark = AttendanceStatus | 'unset';

type StatusMeta = {
  label: string;
  icon: string;
  color: string;
  soft: string;
};

const META: Record<AttendanceMark, StatusMeta> = {
  present: { label: 'Present', icon: '\u2713', color: colors.present, soft: colors.presentSoft },
  absent: { label: 'Absent', icon: '\u2715', color: colors.absent, soft: colors.absentSoft },
  excused: { label: 'Excused', icon: '!', color: colors.excused, soft: colors.excusedSoft },
  unset: { label: 'Not set', icon: '\u2013', color: colors.textMuted, soft: colors.surfaceAlt },
};

export function statusMeta(status: AttendanceMark): StatusMeta {
  return META[status];
}

type StatusPillProps = {
  status: AttendanceMark;
  size?: 'md' | 'sm';
  iconOnly?: boolean;
  testID?: string;
};

/** Status indicator that never relies on color alone (icon + text label). */
export function StatusPill({
  status,
  size = 'md',
  iconOnly = false,
  testID,
}: StatusPillProps) {
  const meta = META[status];
  const small = size === 'sm';

  return (
    <View
      testID={testID}
      style={[
        styles.pill,
        small && styles.pillSm,
        { backgroundColor: meta.soft, borderColor: meta.color },
      ]}
    >
      <Text style={[styles.icon, small && styles.iconSm, { color: meta.color }]}>
        {meta.icon}
      </Text>
      {iconOnly ? null : (
        <Text style={[styles.label, small && styles.labelSm, { color: meta.color }]}>
          {meta.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  pillSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  icon: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  iconSm: {
    fontSize: fontSizes.xs,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: 10,
  },
});
