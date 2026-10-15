import { Redirect } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnnouncementModal } from '@/components/announcement-modal';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useAuth } from '@/context/auth-context';
import {
  addAnnouncement,
  deleteAnnouncement,
  subscribeToAnnouncements,
  type Announcement,
} from '@/services/announcements';
import { subscribeToMember } from '@/services/members';
import { colors, fontSizes, fonts, spacing } from '@/theme';
import { formatDateTime } from '@/utils/date';

function describeError(error: Error): string {
  const code = (error as { code?: string }).code;
  if (code === 'permission-denied') {
    return 'Only an admin can post announcements, or the rules need deploying.';
  }
  if (code === 'unavailable') return 'Network unavailable. Retrying…';
  return 'Could not sync the feed right now.';
}

export default function AnnouncementsScreen() {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const uid = user?.uid;
  const name = user?.displayName?.trim() || user?.email || 'Admin';

  useEffect(() => {
    const unsubscribe = subscribeToAnnouncements(
      (next) => {
        setAnnouncements(next);
        setSyncError(null);
        setLoading(false);
      },
      (error) => {
        setSyncError(describeError(error));
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToMember(
      uid,
      (member) => setIsAdmin(member?.role === 'admin'),
      () => {},
    );
    return unsubscribe;
  }, [uid]);

  const canPost = useMemo(() => isAdmin, [isAdmin]);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  async function handlePost(input: { title: string; body: string }) {
    if (!uid || submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await addAnnouncement(uid, name, input);
      setModalVisible(false);
    } catch (error) {
      setActionError(describeError(error as Error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await deleteAnnouncement(id);
    } catch (error) {
      setActionError(describeError(error as Error));
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Announcements"
        subtitle="Notices from your class admins."
        badge={canPost ? 'ADMIN' : undefined}
        testID="announcements-title"
      />

      {canPost ? (
        <Button
          label="New announcement"
          onPress={() => setModalVisible(true)}
          style={styles.postButton}
          testID="announcement-new"
        />
      ) : null}

      {syncError ? <Text style={styles.error}>{syncError}</Text> : null}
      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      {loading ? (
        <Card style={styles.panel}>
          <Loader compact />
        </Card>
      ) : announcements.length === 0 ? (
        <Card style={styles.panel}>
          <Text style={styles.empty}>
            No announcements yet. Check back soon.
          </Text>
        </Card>
      ) : (
        <View style={styles.feed}>
          {announcements.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={
                item.createdAt
                  ? `${item.authorName} · ${formatDateTime(item.createdAt)}`
                  : item.authorName
              }
              headerAccessory={
                canPost ? (
                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.title}`}
                    hitSlop={8}
                    testID={`announcement-delete-${item.id}`}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                ) : null
              }
            >
              {item.body ? (
                <Text style={styles.body}>{item.body}</Text>
              ) : (
                <Text style={styles.muted}>No details.</Text>
              )}
            </Card>
          ))}
        </View>
      )}

      {modalVisible ? (
        <AnnouncementModal
          visible
          submitting={submitting}
          onClose={() => setModalVisible(false)}
          onSubmit={handlePost}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  postButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  panel: {
    marginTop: spacing.sm,
  },
  feed: {
    gap: spacing.lg,
  },
  body: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
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
    marginBottom: spacing.md,
  },
});
