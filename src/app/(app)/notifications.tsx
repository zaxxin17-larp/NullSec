import { Link, Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useActivity, type ActivityItem } from '@/context/activity-context';
import { useAuth } from '@/context/auth-context';
import { subscribeToEvents, type CalendarEvent } from '@/services/events';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { formatDateLabel, formatDateTime, todayKey } from '@/utils/date';

const KIND_LABEL: Record<ActivityItem['kind'], string> = {
  announcement: 'Notice',
  message: 'Message',
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, unreadIds, loading, markSeen } = useActivity();

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Clear the unread badge when the screen is dismissed.
  useFocusEffect(
    useCallback(() => {
      return () => markSeen();
    }, [markSeen]),
  );

  const unread = useMemo(() => new Set(unreadIds), [unreadIds]);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToEvents(uid, setEvents, () => {});
    return unsubscribe;
  }, [uid]);

  const upcoming = useMemo(
    () =>
      events
        .filter((event) => event.date >= todayKey())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4),
    [events],
  );

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScreenContainer>
      <Link href="/(app)/home" style={styles.backLink}>
        {'\u2190  System'}
      </Link>

      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Recent activity in your class.
        </Text>
      </View>

      <Card
        title="Recent activity"
        subtitle="Notices and messages"
        headerAccessory={<Text style={styles.count}>{items.length}</Text>}
      >
        {loading ? (
          <Loader compact />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>No activity yet.</Text>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View
                key={item.id}
                style={styles.row}
                testID={`activity-${item.id}`}
              >
                <View style={styles.rowHead}>
                  <Text style={styles.kind}>{KIND_LABEL[item.kind]}</Text>
                  {unread.has(item.id) ? (
                    <Text style={styles.newTag}>NEW</Text>
                  ) : null}
                  <Text style={styles.time}>
                    {item.createdAt ? formatDateTime(item.createdAt) : ''}
                  </Text>
                </View>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.kind === 'announcement'
                    ? item.title
                    : `${item.authorName}`}
                </Text>
                {item.body ? (
                  <Text style={styles.rowBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card
        style={styles.panel}
        title="Upcoming events"
        subtitle="Scheduled class events"
        headerAccessory={<Text style={styles.count}>{upcoming.length}</Text>}
      >
        {upcoming.length === 0 ? (
          <Text style={styles.empty}>No upcoming events.</Text>
        ) : (
          <View style={styles.list}>
            {upcoming.map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDateText}>{event.date.slice(5)}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={styles.time}>{formatDateLabel(event.date)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <Button
          label="Open calendar"
          variant="secondary"
          onPress={() => router.push('/(app)/calendar')}
          style={styles.cardAction}
          testID="notifications-open-calendar"
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backLink: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  panel: {
    marginTop: spacing.lg,
  },
  count: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    borderWidth: 1,
    borderColor: colors.borderDim,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  kind: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  newTag: {
    color: colors.panel,
    backgroundColor: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  time: {
    marginLeft: 'auto',
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 10,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  rowBody: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    marginTop: 2,
    lineHeight: 17,
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
  empty: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  cardAction: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
});
