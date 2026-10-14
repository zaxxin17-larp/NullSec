import Constants from 'expo-constants';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ReleaseNotification } from '@/components/release-notification';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { StatusPill } from '@/components/ui/status-pill';
import { useAuth } from '@/context/auth-context';
import {
  subscribeToAttendanceRange,
  type AttendanceDay,
} from '@/services/attendance';
import { subscribeToEvents, type CalendarEvent } from '@/services/events';
import {
  ensureMemberProfile,
  subscribeToMember,
  type MemberRole,
} from '@/services/members';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { checkForUpdates } from '@/updates';
import {
  formatDateLabel,
  formatFullDate,
  makeDateKey,
  todayKey,
} from '@/utils/date';

const TWO_COLUMN_BREAKPOINT = 900;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const twoColumn = width >= TWO_COLUMN_BREAKPOINT;

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [role, setRole] = useState<MemberRole>('student');
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const uid = user?.uid;
  const name = user?.displayName?.trim() || user?.email || 'classmate';

  const today = todayKey();
  const monthStart = useMemo(() => {
    const now = new Date();
    return makeDateKey(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const monthEnd = useMemo(() => {
    const now = new Date();
    return makeDateKey(now.getFullYear(), now.getMonth() + 1, 0);
  }, []);

  useEffect(() => {
    if (!uid) return;
    ensureMemberProfile(uid, name);
  }, [uid, name]);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToMember(
      uid,
      (member) => setRole(member?.role ?? 'student'),
      () => {},
    );
    return unsubscribe;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToEvents(
      uid,
      (next) => {
        setEvents(next);
        setLoadingEvents(false);
      },
      () => setLoadingEvents(false),
    );
    return unsubscribe;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToAttendanceRange(
      monthStart,
      monthEnd,
      setAttendanceDays,
      () => {},
    );
    return unsubscribe;
  }, [uid, monthStart, monthEnd]);

  const todayStatus = useMemo(() => {
    if (!uid) return undefined;
    return attendanceDays.find((day) => day.date === today)?.marks[uid];
  }, [attendanceDays, uid, today]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let excused = 0;
    if (uid) {
      for (const day of attendanceDays) {
        const status = day.marks[uid];
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'excused') excused++;
      }
    }
    const total = present + absent + excused;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, excused, total, rate };
  }, [attendanceDays, uid]);

  const isAdmin = role === 'admin';

  const joinedLabel = (user && user.metadata && user.metadata.creationTime)
    ? user.metadata.creationTime.slice(0, 10)
    : '—';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  async function handleCheckUpdates() {
    if (checkingUpdate) return;
    setCheckingUpdate(true);
    setUpdateMessage(null);
    try {
      await checkForUpdates((result) => setUpdateMessage(result.message));
    } finally {
      setCheckingUpdate(false);
    }
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const upcoming = events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{formatFullDate(today)}</Text>
        <Text style={styles.greeting}>
          {greeting()}, {name}
        </Text>
      </View>

      <ReleaseNotification />

      <View style={[styles.grid, twoColumn && styles.gridWide]}>
        <Card
          title="Today"
          subtitle="Your attendance"
          style={[styles.cell, twoColumn && styles.cellHalf]}
          headerAccessory={
            todayStatus ? <StatusPill status={todayStatus} size="sm" /> : null
          }
        >
          <Text style={styles.muted}>
            {todayStatus
              ? `You are marked ${todayStatus} today.`
              : 'Your attendance has not been taken yet.'}
          </Text>
          <Button
            label={isAdmin ? 'Take attendance' : 'Open calendar'}
            variant="secondary"
            onPress={() => router.push('/(app)/calendar')}
            style={styles.cardAction}
            testID="home-open-calendar"
          />
        </Card>

        <Card
          title="This month"
          subtitle="Your attendance record"
          style={[styles.cell, twoColumn && styles.cellHalf]}
          headerAccessory={<Text style={styles.rate}>{summary.rate}%</Text>}
        >
          {summary.total === 0 ? (
            <Text style={styles.muted}>No attendance marked yet this month.</Text>
          ) : (
            <View style={styles.stats}>
              <Stat label="Present" value={summary.present} color={colors.present} />
              <Stat label="Absent" value={summary.absent} color={colors.absent} />
              <Stat label="Excused" value={summary.excused} color={colors.excused} />
              <Stat label="Marked" value={summary.total} color={colors.textSecondary} />
            </View>
          )}
        </Card>

        <Card
          title="Upcoming"
          subtitle="Scheduled class events"
          style={[styles.cell, twoColumn && styles.cellHalf]}
          headerAccessory={<Text style={styles.count}>{events.length}</Text>}
        >
          {loadingEvents ? (
            <Loader compact />
          ) : upcoming.length === 0 ? (
            <Text style={styles.muted}>No upcoming events scheduled.</Text>
          ) : (
            <View style={styles.list}>
              {upcoming.map((event) => (
                <View key={event.id} style={styles.eventRow}>
                  <View style={styles.eventDate}>
                    <Text style={styles.eventDateText}>{event.date.slice(5)}</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventMeta}>
                      {formatDateLabel(event.date)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card
          title="My profile"
          subtitle="Your class identity"
          style={[styles.cell, twoColumn && styles.cellHalf]}
        >
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.muted}>{user?.email ?? ''}</Text>
          <View style={styles.metaList}>
            <Text style={styles.meta}>Member since {joinedLabel}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              ID {user?.uid ?? ''}
            </Text>
          </View>
        </Card>

        <Card
          title="Module status"
          subtitle="What's online"
          style={[styles.cell, twoColumn && styles.cellHalf]}
        >
          <View style={styles.moduleList}>
            <ModuleRow label="Attendance calendar" online />
            <ModuleRow label="Classmates directory" online={false} />
            <ModuleRow label="Messages" online={false} />
            <ModuleRow label="Notifications" online={false} />
          </View>
        </Card>

        <Card
          title="App"
          subtitle={`NullSec client · v${appVersion}`}
          style={[styles.cell, twoColumn && styles.cellHalf]}
        >
          <Text style={styles.muted}>
            Installed builds can receive over-the-air updates.
          </Text>
          {updateMessage ? (
            <Text style={styles.updateMessage}>{updateMessage}</Text>
          ) : null}
          <Button
            label="Check for updates"
            variant="secondary"
            onPress={handleCheckUpdates}
            loading={checkingUpdate}
            disabled={checkingUpdate}
            style={styles.cardAction}
            testID="home-check-updates"
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ModuleRow({ label, online }: { label: string; online: boolean }) {
  return (
    <View style={styles.moduleRow}>
      <View style={[styles.moduleDot, online ? styles.dotOn : styles.dotOff]} />
      <Text style={styles.moduleLabel}>{label}</Text>
      <Text style={[styles.moduleState, online ? styles.stateOn : styles.stateOff]}>
        {online ? 'Online' : 'Planned'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  greeting: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    letterSpacing: 0.5,
  },
  grid: {
    gap: spacing.lg,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '100%',
  },
  cellHalf: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 320,
    maxWidth: '49%',
  },
  toggleWrap: {
    marginTop: spacing.lg,
  },
  cardAction: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
  muted: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    marginTop: spacing.sm,
  },
  rate: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
  },
  count: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
  },
  stat: {
    minWidth: 60,
  },
  statValue: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  eventDate: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  eventDateText: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  eventMeta: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
  },
  profileName: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.lg,
  },
  metaList: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
  },
  moduleList: {
    gap: spacing.sm,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moduleDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
  dotOn: {
    backgroundColor: colors.present,
  },
  dotOff: {
    backgroundColor: colors.borderStrong,
  },
  moduleLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  moduleState: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
  },
  stateOn: {
    color: colors.present,
  },
  stateOff: {
    color: colors.textMuted,
  },
  updateMessage: {
    color: colors.accentStrong,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.md,
  },
});
