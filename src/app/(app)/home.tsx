import Constants from 'expo-constants';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { ReleaseNotification } from '@/components/release-notification';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { HudCorners } from '@/components/ui/hud-corners';
import { Loader } from '@/components/ui/loader';
import { Reveal } from '@/components/ui/reveal';
import { StatusPill } from '@/components/ui/status-pill';
import { useActivity } from '@/context/activity-context';
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
  formatDateTime,
  formatFullDate,
  makeDateKey,
  todayKey,
} from '@/utils/date';

const TWO_COLUMN_BREAKPOINT = 900;

/** Brighter accents so the numbers stay legible on the dark hero panel. */
const ON_DARK = {
  present: '#5bd98a',
  absent: '#ff8a8a',
  excused: '#f7c15a',
};

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
  const { items: activityItems, unreadCount } = useActivity();
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

  const announcements = useMemo(
    () => activityItems.filter((item) => item.kind === 'announcement'),
    [activityItems],
  );

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

  const latestAnnouncements = announcements.slice(0, 3);
  const unreadCountLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <ScreenContainer>
      <Reveal>
        <View style={styles.hero}>
          <HudCorners size={12} inset={6} opacity={0.5} />
          <View style={styles.heroTop}>
            <Text style={styles.heroDate}>{formatFullDate(today)}</Text>
            <Text style={styles.heroCode}>SEC · CLASS-01</Text>
          </View>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>
              {greeting()}, {name}
            </Text>
            {isAdmin ? <Text style={styles.adminTag}>ADMIN</Text> : null}
          </View>

          {todayStatus ? (
            <View style={styles.todayRow}>
              <Text style={styles.todayLabel}>TODAY</Text>
              <StatusPill status={todayStatus} size="sm" />
            </View>
          ) : (
            <Text style={styles.heroHint}>Attendance not marked yet today</Text>
          )}

          <View style={styles.heroDivider} />

          <Text style={styles.heroSection}>{'// Attendance · this month'}</Text>
          <View style={styles.statRow}>
            <Stat label="Present" value={summary.present} color={ON_DARK.present} />
            <Stat label="Absent" value={summary.absent} color={ON_DARK.absent} />
            <Stat label="Excused" value={summary.excused} color={ON_DARK.excused} />
            <Stat label="Rate" value={`${summary.rate}%`} color={colors.cyan} />
          </View>
        </View>
      </Reveal>

      <ReleaseNotification />

      <Reveal delay={60} style={styles.section}>
        <Text style={styles.sectionTitle}>{'// Quick access'}</Text>
        <View style={styles.actions}>
          <QuickAction
            index="01"
            label="ATTENDANCE"
            meta={isAdmin ? 'Take attendance' : 'Calendar'}
            onPress={() => router.push('/(app)/calendar')}
            testID="home-open-calendar"
          />
          <QuickAction
            index="02"
            label="CLASSMATES"
            meta="Directory"
            onPress={() => router.push('/(app)/members')}
            testID="home-open-members"
          />
          <QuickAction
            index="03"
            label="NOTICES"
            meta={`${announcements.length} posted`}
            onPress={() => router.push('/(app)/announcements')}
            testID="home-open-announcements"
          />
          <QuickAction
            index="04"
            label="MESSAGES"
            meta="Class chat"
            onPress={() => router.push('/(app)/messages')}
            testID="home-open-messages"
          />
          <QuickAction
            index="05"
            label="ALERTS"
            meta={unreadCount > 0 ? `${unreadCountLabel} new` : 'All caught up'}
            onPress={() => router.push('/(app)/notifications')}
            testID="home-open-notifications"
          />
        </View>
      </Reveal>

      <View style={[styles.grid, twoColumn && styles.gridWide]}>
        <Card
          title="Notices"
          subtitle="Latest announcements"
          style={[styles.cell, twoColumn && styles.cellHalf]}
          headerAccessory={
            <Pressable
              onPress={() => router.push('/(app)/announcements')}
              accessibilityRole="button"
              hitSlop={8}
              testID="home-view-all-notices"
            >
              <Text style={styles.cardLink}>VIEW ALL</Text>
            </Pressable>
          }
          delay={120}
        >
          {latestAnnouncements.length === 0 ? (
            <Text style={styles.muted}>No announcements yet.</Text>
          ) : (
            <View style={styles.list}>
              {latestAnnouncements.map((item) => (
                <View key={item.id} style={styles.noticeRow}>
                  <Text style={styles.noticeTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.noticeMeta}>
                    {item.createdAt
                      ? `${item.authorName} · ${formatDateTime(item.createdAt)}`
                      : item.authorName}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card
          title="Upcoming"
          subtitle="Next on the calendar"
          style={[styles.cell, twoColumn && styles.cellHalf]}
          headerAccessory={<Text style={styles.count}>{upcoming.length}</Text>}
          delay={180}
        >
          {loadingEvents ? (
            <Loader compact />
          ) : upcoming.length === 0 ? (
            <Text style={styles.muted}>Nothing scheduled right now.</Text>
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
                    <Text style={styles.eventMeta}>{formatDateLabel(event.date)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerVersion}>NULLSEC CLIENT · v{appVersion}</Text>
        <Pressable
          onPress={handleCheckUpdates}
          disabled={checkingUpdate}
          accessibilityRole="button"
          hitSlop={8}
          testID="home-check-updates"
        >
          <Text style={styles.footerLink}>
            {checkingUpdate ? 'Checking…' : 'Check for updates'}
          </Text>
        </Pressable>
      </View>
      {updateMessage ? (
        <Text style={styles.footerMessage}>{updateMessage}</Text>
      ) : null}
    </ScreenContainer>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  index,
  label,
  meta,
  onPress,
  testID,
}: {
  index: string;
  label: string;
  meta: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
    >
      <View style={styles.actionTop}>
        <Text style={styles.actionIndex}>{index}</Text>
        <Text style={styles.actionChevron}>{'→'}</Text>
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionMeta} numberOfLines={1}>
        {meta}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.panel,
    borderRadius: radii.md,
    borderTopWidth: 2,
    borderTopColor: colors.cyan,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroCode: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  heroDate: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  greeting: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    letterSpacing: 0.5,
  },
  adminTag: {
    color: colors.panel,
    backgroundColor: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  todayLabel: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  heroHint: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  heroDivider: {
    height: 1,
    backgroundColor: colors.panelLine,
    marginVertical: spacing.lg,
  },
  heroSection: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  stat: {
    flexGrow: 1,
    minWidth: 72,
  },
  statValue: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
  },
  statLabel: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  action: {
    flexGrow: 1,
    flexBasis: 150,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
    borderLeftWidth: 2,
    borderLeftColor: colors.cyanDim,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
  },
  actionPressed: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
  },
  actionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  actionIndex: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  actionChevron: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
  },
  actionLabel: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
  },
  actionMeta: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
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
  cardLink: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
  count: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
  },
  muted: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  list: {
    gap: spacing.md,
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
  noticeRow: {
    borderLeftWidth: 2,
    borderLeftColor: colors.cyan,
    paddingLeft: spacing.md,
  },
  noticeTitle: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  noticeMeta: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderDim,
  },
  footerVersion: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  footerLink: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
  footerMessage: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginTop: spacing.sm,
  },
});
