import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { buildMonthGrid, WEEKDAY_LABELS, type DateKey } from '@/utils/date';

type CalendarGridProps = {
  year: number;
  month0: number;
  selected: DateKey | null;
  today: DateKey;
  eventDates: ReadonlySet<DateKey>;
  onSelectDay: (key: DateKey) => void;
};

export function CalendarGrid({
  year,
  month0,
  selected,
  today,
  eventDates,
  onSelectDay,
}: CalendarGridProps) {
  const weeks = buildMonthGrid(year, month0);

  return (
    <View style={styles.container} testID="calendar-grid">
      <View style={styles.row}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.headCell}>
            <Text style={styles.headText}>{label}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.row}>
          {week.map((cell) => {
            const isSelected = selected === cell.key;
            const isToday = today === cell.key;
            const hasEvents = eventDates.has(cell.key);

            return (
              <Pressable
                key={cell.key}
                onPress={() => onSelectDay(cell.key)}
                style={styles.cell}
                accessibilityRole="button"
                accessibilityLabel={`Day ${cell.day}`}
                accessibilityState={{ selected: isSelected }}
                testID={`calendar-day-${cell.key}`}
              >
                <View
                  style={[
                    styles.cellInner,
                    isToday && !isSelected ? styles.cellToday : null,
                    isSelected ? styles.cellSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !cell.inMonth ? styles.dayTextMuted : null,
                      isSelected ? styles.dayTextSelected : null,
                    ]}
                  >
                    {String(cell.day).padStart(2, '0')}
                  </Text>
                  {hasEvents ? (
                    <View
                      style={[styles.dot, isSelected && styles.dotSelected]}
                    />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  headCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  headText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
  cell: {
    flex: 1,
    padding: 2,
  },
  cellInner: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderDim,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellToday: {
    borderColor: colors.accent,
  },
  cellSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  dayText: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  dayTextMuted: {
    color: colors.textMuted,
    opacity: 0.6,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  dot: {
    position: 'absolute',
    bottom: 5,
    width: 4,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
});
