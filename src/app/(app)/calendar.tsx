import { Link, Redirect } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { CalendarGrid } from '@/components/calendar-grid';
import { EventModal } from '@/components/event-modal';
import { ScreenContainer } from '@/components/screen-container';
import { TerminalButton } from '@/components/terminal-button';
import { useAuth } from '@/context/auth-context';
import {
  addEvent,
  deleteEvent,
  subscribeToEvents,
  type CalendarEvent,
} from '@/services/events';
import { colors, fontSizes, fonts, spacing } from '@/theme';
import {
  addMonths,
  formatDateLabel,
  formatMonthLabel,
  parseDateKey,
  todayKey,
  type DateKey,
} from '@/utils/date';

function describeError(error: Error): string {
  const code = (error as { code?: string }).code;
  if (code === 'permission-denied') return 'ERROR: ACCESS DENIED — DEPLOY RULES';
  if (code === 'unavailable') return 'ERROR: NETWORK UNREACHABLE';
  return 'ERROR: CALENDAR SYNC FAILED';
}

export default function CalendarScreen() {
  const { user } = useAuth();

  const initial = useMemo(() => {
    const { year, month0 } = parseDateKey(todayKey());
    return { year, month0 };
  }, []);

  const [cursor, setCursor] = useState(initial);
  const [selected, setSelected] = useState<DateKey>(todayKey());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToEvents(
      uid,
      (next) => {
        setEvents(next);
        setSyncError(null);
        setLoading(false);
      },
      (error) => {
        setSyncError(describeError(error));
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [uid]);

  const eventDates = useMemo(
    () => new Set(events.map((event) => event.date)),
    [events],
  );

  const selectedEvents = useMemo(
    () => events.filter((event) => event.date === selected),
    [events, selected],
  );

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  function changeMonth(delta: number) {
    setCursor((prev) => addMonths(prev.year, prev.month0, delta));
  }

  function goToToday() {
    const key = todayKey();
    const { year, month0 } = parseDateKey(key);
    setCursor({ year, month0 });
    setSelected(key);
  }

  function handleSelectDay(key: DateKey) {
    const { year, month0 } = parseDateKey(key);
    setCursor({ year, month0 });
    setSelected(key);
    setActionError(null);
  }

  async function handleAddEvent(input: { title: string; notes: string }) {
    if (!uid || submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await addEvent(uid, { ...input, date: selected });
      setModalVisible(false);
    } catch (error) {
      setActionError(describeError(error as Error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!uid) return;
    setActionError(null);
    try {
      await deleteEvent(uid, eventId);
    } catch (error) {
      setActionError(describeError(error as Error));
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <Link href="/(app)/home" style={styles.backLink}>
          {'< BACK'}
        </Link>
        <Text style={styles.topLabel}>{'// SCHEDULER'}</Text>
      </View>

      <Text style={styles.title}>{'>_ CALENDAR'}</Text>

      <View style={styles.monthNav}>
        <Pressable
          onPress={() => changeMonth(-1)}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          testID="calendar-prev"
        >
          <Text style={styles.navText}>{'<'}</Text>
        </Pressable>

        <Text style={styles.monthLabel} testID="calendar-month">
          {formatMonthLabel(cursor.year, cursor.month0)}
        </Text>

        <Pressable
          onPress={() => changeMonth(1)}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          testID="calendar-next"
        >
          <Text style={styles.navText}>{'>'}</Text>
        </Pressable>
      </View>

      <CalendarGrid
        year={cursor.year}
        month0={cursor.month0}
        selected={selected}
        today={todayKey()}
        eventDates={eventDates}
        onSelectDay={handleSelectDay}
      />

      <View style={styles.dayPanel}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayLabel}>{formatDateLabel(selected)}</Text>
          <Pressable
            onPress={goToToday}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
            hitSlop={8}
            testID="calendar-today"
          >
            <Text style={styles.todayLink}>TODAY</Text>
          </Pressable>
        </View>

        {syncError ? <Text style={styles.error}>{syncError}</Text> : null}
        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : selectedEvents.length === 0 ? (
          <Text style={styles.empty}>{'// NO EVENTS LOGGED'}</Text>
        ) : (
          <View style={styles.eventList}>
            {selectedEvents.map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.notes ? (
                    <Text style={styles.eventNotes}>{event.notes}</Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => handleDeleteEvent(event.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${event.title}`}
                  hitSlop={8}
                  testID={`event-delete-${event.id}`}
                >
                  <Text style={styles.deleteText}>[X]</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <TerminalButton
          label="New event"
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
          testID="calendar-add"
        />
      </View>

      {modalVisible ? (
        <EventModal
          visible
          date={selected}
          submitting={submitting}
          onClose={() => setModalVisible(false)}
          onSubmit={handleAddEvent}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backLink: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 2,
  },
  topLabel: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    letterSpacing: 4,
    marginBottom: spacing.lg,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  navText: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.lg,
    letterSpacing: 2,
  },
  monthLabel: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 3,
  },
  dayPanel: {
    marginTop: spacing.xl,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  dayLabel: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 2,
  },
  todayLink: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
    textDecorationLine: 'underline',
  },
  loading: {
    marginVertical: spacing.lg,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  eventList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDim,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
  },
  eventNotes: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  deleteText: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  addButton: {
    marginTop: 0,
  },
});
