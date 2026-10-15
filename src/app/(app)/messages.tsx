import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useAuth } from '@/context/auth-context';
import { subscribeToMember } from '@/services/members';
import {
  deleteMessage,
  MAX_MESSAGE_LENGTH,
  sendMessage,
  subscribeToMessages,
  type Message,
} from '@/services/messages';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

function describeError(error: Error): string {
  const code = (error as { code?: string }).code;
  if (code === 'permission-denied') {
    return 'You cannot do that, or the rules need deploying.';
  }
  if (code === 'unavailable') return 'Network unavailable. Retrying…';
  return 'Could not sync messages right now.';
}

function timeLabel(date: Date | null): string {
  if (!date) return '…';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const uid = user?.uid;
  const name = user?.displayName?.trim() || user?.email || 'classmate';

  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      (next) => {
        setMessages(next);
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

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  async function handleSend() {
    if (!uid || sending) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setActionError(null);
    try {
      await sendMessage(uid, name, text);
      setDraft('');
    } catch (error) {
      setActionError(describeError(error as Error));
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await deleteMessage(id);
    } catch (error) {
      setActionError(describeError(error as Error));
    }
  }

  return (
    <ScreenContainer scroll={false}>
      <ScreenHeader
        title="Class messages"
        subtitle="One room for the whole section."
        testID="messages-title"
      />

      {syncError ? <Text style={styles.error}>{syncError}</Text> : null}
      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <View style={styles.chat}>
        {loading ? (
          <View style={styles.center}>
            <Loader compact />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.empty}>
              No messages yet. Say hello to your class.
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((message) => {
              const isSelf = message.authorUid === uid;
              const canDelete = isSelf || isAdmin;
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    isSelf ? styles.rowSelf : styles.rowOther,
                  ]}
                  testID={`message-${message.id}`}
                >
                  {canDelete ? (
                    <Pressable
                      onPress={() => handleDelete(message.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Delete message"
                      hitSlop={8}
                      style={styles.deleteButton}
                      testID={`message-delete-${message.id}`}
                    >
                      <Text style={styles.deleteGlyph}>{'\u2715'}</Text>
                    </Pressable>
                  ) : null}
                  <View
                    style={[
                      styles.bubble,
                      isSelf ? styles.bubbleSelf : styles.bubbleOther,
                    ]}
                  >
                    <View style={styles.bubbleMeta}>
                      <Text style={styles.authorName}>
                        {isSelf ? 'You' : message.authorName}
                      </Text>
                      <Text style={styles.time}>
                        {timeLabel(message.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.text}>{message.text}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={(value) => setDraft(value.slice(0, MAX_MESSAGE_LENGTH))}
            placeholder="Write a message"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={MAX_MESSAGE_LENGTH}
            onKeyPress={(event) => {
              const native = event.nativeEvent as { key?: string; shiftKey?: boolean };
              if (native.key === 'Enter' && !native.shiftKey) {
                event.preventDefault?.();
                handleSend();
              }
            }}
            selectionColor={colors.accent}
            underlineColorAndroid="transparent"
            testID="message-input"
          />
          <Button
            label="Send"
            onPress={handleSend}
            loading={sending}
            disabled={sending || draft.trim().length === 0}
            style={styles.sendButton}
            testID="message-send"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  chat: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '100%',
  },
  rowSelf: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  deleteGlyph: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
  bubble: {
    maxWidth: '78%',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleSelf: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderDim,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  authorName: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
  },
  time: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 10,
  },
  text: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 19,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  sendButton: {
    minWidth: 88,
  },
});
