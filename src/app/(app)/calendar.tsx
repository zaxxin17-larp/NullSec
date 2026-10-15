import { Redirect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CalendarGrid } from '@/components/calendar-grid';
import { EventModal } from '@/components/event-modal';
import { ScreenContainer } from '@/components/screen-container';
import { AttendanceToggle } from '@/components/ui/attendance-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatusPill } from '@/components/ui/status-pill';
import { useAuth } from '@/context/auth-context';
import {
  setAttendanceFor,
  subscribeToAttendanceRange,
  type AttendanceStatus,
  type DayMarks,
} from '@/services/attendance';
import {
  addEvent,
  deleteEvent,
  subscribeToEvents,
  type CalendarEvent,
} from '@/services/events';
import { subscribeToMembers, type MemberProfile } from '@/services/members';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import {
  addMonths,
  formatDateLabel,
  formatMonthLabel,
  makeDateKey,
  parseDateKey,
  todayKey,
  type DateKey,
} from '@/utils/date';

function describeError(error: Error): string {
  const code = (error as { code?: string }).code;
  if (code === 'permission-denied') {
    return 'Only an admin can edit attendance, or the rules need to be deployed.';
  }
  if (code === 'unavailable') return 'Network unavailable. Changes will retry.';
  return 'Could not sync right now.';
}

export default function CalendarScreen() {
  const { user } = useAuth();

  const initial = useMemo(() => {
    const { year, month0 } = parseDateKey(todayKey());
    return { year, month0 };
  }, []);

  const [cursor, setCursor] = useState(initial);
  const [selected, setSelected] = useState<DateKey>(todayKey());

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [monthMarks, setMonthMarks] = useState<Record<DateKey, DayMarks>>({});
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingUid, setSavingUid] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const uid = user?.uid;

  useEffect(() => {
    const unsubscribe = subscribeToMembers(
      setMembers,
      (error) => setSyncError(describeError(error)),
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToEvents(
      uid,
      setEvents,
      (error) => setSyncError(describeError(error)),
    );
    return unsubscribe;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const start = makeDateKey(cursor.year, cursor.month0, 1);
    const end = makeDateKey(cursor.year, cursor.month0 + 1, 0);
    const unsubscribe = subscribeToAttendanceRange(
      start,
      end,
      (days) => {
        const next: Record<DateKey, DayMarks> = {};
        for (const day of days) next[day.date] = day.marks;
        setMonthMarks(next);
        setSyncError(null);
        setLoading(false);
      },
      (error) => {
        setSyncError(describeError(error));
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [uid, cursor.year, cursor.month0]);

  const eventDates = useMemo(
    () => new Set(events.map((event) => event.date)),
    [events],
  );

  const isAdmin = useMemo(
    () => members.some((member) => member.uid === uid && member.role === 'admin'),
    [members, uid],
  );

  const selectedMarks = monthMarks[selected] ?? {};

  const myStatusByDate = useMemo(() => {
    const map: Record<DateKey, AttendanceStatus | undefined> = {};
    if (!uid) return map;
    for (const [date, marks] of Object.entries(monthMarks)) {
      map[date] = marks[uid];
    }
    return map;
  }, [monthMarks, uid]);

  const roster = useMemo(() => {
    const list = [...members];
    if (uid && !list.some((member) => member.uid === uid)) {
      list.push({
        uid,
        username: 'You',
        role: 'student',
        createdAt: null,
        avatarUrl: '',
        accent: '',
        bio: '',
      });
    }
    return list;
  }, [members, uid]);

  const selectedEvents = useMemo(
    () => events.filter((event) => event.date === selected),
    [events, selected],
  );

  const presentCount = Object.values(selectedMarks).filter(
    (status) => status === 'present',
  ).length;

  const changeMonth = useCallback((delta: number) => {
    setCursor((prev) => addMonths(prev.year, prev.month0, delta));
  }, []);

  const goToToday = useCallback(() => {
    const key = todayKey();
    const { year, month0 } = parseDateKey(key);
    setCursor({ year, month0 });
    setSelected(key);
  }, []);

  const handleSelectDay = useCallback((key: DateKey) => {
    const { year, month0 } = parseDateKey(key);
    setCursor({ year, month0 });
    setSelected(key);
    setActionError(null);
  }, []);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  async function handleSetMark(targetUid: string, status: AttendanceStatus) {
    if (!uid || savingUid) return;
    setSavingUid(targetUid);
    setActionError(null);
    try {
      await setAttendanceFor(targetUid, selected, status, uid);
    } catch (error) {
      setActionError(describeError(error as Error));
    } finally {
      setSavingUid(null);
    }
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
      <ScreenHeader
        title="Attendance calendar"
        subtitle={
          isAdmin
            ? 'Mark each student present, absent or excused.'
            : 'View your attendance and the class roster.'
        }
        badge={isAdmin ? 'ADMIN' : undefined}
        testID="calendar-title"
      />

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
        myStatusByDate={myStatusByDate}
        onSelectDay={handleSelectDay}
      />

      <View style={styles.legend}>
        <LegendItem color={colors.present} label="Present" />
        <LegendItem color={colors.absent} label="Absent" />
        <LegendItem color={colors.excused} label="Excused" />
        <LegendItem color={colors.accent} label="Event" />
      </View>

      {syncError ? <Text style={styles.error}>{syncError}</Text> : null}
      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <Card
        style={styles.panel}
        title="Class attendance"
        subtitle={formatDateLabel(selected)}
        headerAccessory={
          <View style={styles.headerAccessory}>
            <Text style={styles.count}>{presentCount} present</Text>
            <Pressable
              onPress={goToToday}
              hitSlop={8}
              accessibilityRole="button"
              testID="calendar-today"
            >
              <Text style={styles.todayLink}>Today</Text>
            </Pressable>
          </View>
        }
      >
        {loading ? (
          <Loader compact />
        ) : roster.length === 0 ? (
          <Text style={styles.empty}>No students in the directory yet.</Text>
        ) : (
          <View style={styles.rosterList}>
            {roster.map((member) => {
              const status = selectedMarks[member.uid];
              const isSelf = member.uid === uid;
              return (
                <View key={member.uid} style={styles.rosterRow}>
                  <Text style={[styles.rosterName, isSelf && styles.rosterSelf]}>
                    {member.username}
                    {isSelf ? ' (you)' : ''}
                  </Text>
                  {isAdmin ? (
                    <View style={styles.rosterToggle}>
                      <AttendanceToggle
                        value={status}
                        onChange={(next) => handleSetMark(member.uid, next)}
                        disabled={savingUid !== null}
                        size="sm"
                        testID={`mark-${member.uid}`}
                      />
                    </View>
                  ) : status ? (
                    <StatusPill status={status} size="sm" />
                  ) : (
                    <Text style={styles.unmarked}>Not marked</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
        {!loading && !isAdmin && roster.length > 0 ? (
          <Text style={styles.hint}>Attendance is taken by an admin.</Text>
        ) : null}
      </Card>

      <Card
        style={styles.panel}
        title="Events"
        subtitle={formatDateLabel(selected)}
      >
        {selectedEvents.length === 0 ? (
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

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
  },
  legendLabel: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
  },
  panel: {
    marginTop: spacing.lg,
  },
  headerAccessory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  todayLink: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
  },
  count: {
    color: colors.present,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    marginTop: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  rosterList: {
    gap: spacing.sm,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDim,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rosterName: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  rosterSelf: {
    color: colors.accentStrong,
  },
  rosterToggle: {
    width: 150,
  },
  unmarked: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
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
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.md,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
});
