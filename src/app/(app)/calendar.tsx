import { Link, Redirect } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CalendarGrid } from '@/components/calendar-grid';
import { EventModal } from '@/components/event-modal';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/auth-context';
import {
  addEvent,
  deleteEvent,
  subscribeToEvents,
  type CalendarEvent,
} from '@/services/events';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
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
  if (code === 'permission-denied') {
    return 'You do not have permission to sync attendance. Ask an admin to deploy the updated rules.';
  }
  if (code === 'unavailable') return 'Network unavailable. Changes will retry.';
  return 'Could not sync attendance right now.';
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
      <Link href="/(app)/home" style={styles.backLink}>
        {'\u2190  System'}
      </Link>

      <View style={styles.header}>
        <Text style={styles.title}>Attendance calendar</Text>
        <Text style={styles.subtitle}>
          Plan sessions and track attendance day by day.
        </Text>
      </View>

      <View style={styles.monthNav}>
        <Pressable
          onPress={() => changeMonth(-1)}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          testID="calendar-prev"
        >
          <Text style={styles.navText}>{'\u2039'}</Text>
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
          <Text style={styles.navText}>{'\u203a'}</Text>
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

      <Card
        style={styles.dayPanel}
        title={formatDateLabel(selected)}
        headerAccessory={
          <Pressable onPress={goToToday} hitSlop={8} accessibilityRole="button" testID="calendar-today">
            <Text style={styles.todayLink}>Today</Text>
          </Pressable>
        }
      >
        {syncError ? <Text style={styles.error}>{syncError}</Text> : null}
        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

        {loading ? (
          <Loader compact />
        ) : selectedEvents.length === 0 ? (
          <Text style={styles.empty}>No events for this day yet.</Text>
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
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Button
          label="New event"
          variant="secondary"
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
          testID="calendar-add"
        />
      </Card>

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
  backLink: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  navText: {
    color: colors.text,
    fontSize: fontSizes.lg,
    lineHeight: 22,
  },
  monthLabel: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 2,
    fontWeight: '600',
  },
  dayPanel: {
    marginTop: spacing.xl,
  },
  todayLink: {
    color: colors.accentStrong,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
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
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  eventNotes: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  deleteText: {
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
});
