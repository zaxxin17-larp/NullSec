import { Pressable, StyleSheet, Text, View } from 'react-native';

import { statusMeta } from '@/components/ui/status-pill';
import { ATTENDANCE_STATUSES, type AttendanceStatus } from '@/services/attendance';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type AttendanceToggleProps = {
  value?: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  size?: 'md' | 'sm';
  testID?: string;
};

/** Segmented control for Present / Absent / Excused. */
export function AttendanceToggle({
  value,
  onChange,
  disabled = false,
  size = 'md',
  testID,
}: AttendanceToggleProps) {
  const small = size === 'sm';

  return (
    <View style={styles.row} testID={testID}>
      {ATTENDANCE_STATUSES.map((status) => {
        const meta = statusMeta(status);
        const active = value === status;
        return (
          <Pressable
            key={status}
            onPress={() => onChange(status)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={meta.label}
            accessibilityState={{ selected: active, disabled }}
            style={[
              styles.item,
              small && styles.itemSm,
              active && { backgroundColor: meta.soft, borderColor: meta.color },
              disabled && styles.itemDisabled,
            ]}
            testID={testID ? `${testID}-${status}` : undefined}
          >
            <Text
              style={[
                styles.icon,
                small && styles.iconSm,
                { color: active ? meta.color : colors.textMuted },
              ]}
            >
              {meta.icon}
            </Text>
            {small ? null : (
              <Text
                style={[
                  styles.label,
                  { color: active ? meta.color : colors.textSecondary },
                ]}
              >
                {meta.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  itemSm: {
    minHeight: 32,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
  },
  iconSm: {
    fontSize: fontSizes.xs,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 0.5,
  },
});
