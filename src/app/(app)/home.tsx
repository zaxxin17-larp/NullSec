import Constants from 'expo-constants';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ReleaseNotification } from '@/components/release-notification';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/auth-context';
import { subscribeToEvents, type CalendarEvent } from '@/services/events';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { checkForUpdates } from '@/updates';
import { todayKey, formatFullDate, formatDateLabel } from '@/utils/date';

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
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const uid = user?.uid;

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

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const name = user.displayName?.trim() || user.email || 'classmate';
  const today = todayKey();
  const upcoming = events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const joinedLabel = user.metadata.creationTime
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
          subtitle="Class attendance"
          style={[styles.cell, twoColumn && styles.cellHalf]}
        >
          <Text style={styles.muted}>
            No attendance has been recorded for today yet.
          </Text>
          <View style={styles.actions}>
            <Button
              label="Take attendance"
              onPress={() => router.push('/(app)/calendar')}
              testID="home-take-attendance"
            />
            <Button
              label="Open calendar"
              variant="secondary"
              onPress={() => router.push('/(app)/calendar')}
              testID="home-open-calendar"
            />
          </View>
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
          <Text style={styles.muted}>{user.email}</Text>
          <View style={styles.metaList}>
            <Text style={styles.meta}>Member since {joinedLabel}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              ID {user.uid}
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
            style={styles.updateButton}
            testID="home-check-updates"
          />
        </Card>
      </View>
    </ScreenContainer>
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
    fontFamily: fonts.sans,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    letterSpacing: -0.5,
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  muted: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  count: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    fontWeight: '700',
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
    fontWeight: '700',
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
  eventMeta: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
  },
  profileName: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.lg,
    fontWeight: '700',
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
  updateButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
});
