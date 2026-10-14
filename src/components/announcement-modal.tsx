import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import {
  MAX_ANNOUNCEMENT_BODY,
  MAX_ANNOUNCEMENT_TITLE,
} from '@/services/announcements';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type AnnouncementModalProps = {
  visible: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (input: { title: string; body: string }) => void;
};

export function AnnouncementModal({
  visible,
  submitting = false,
  onClose,
  onSubmit,
}: AnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Title is required.');
      return;
    }
    if (trimmed.length > MAX_ANNOUNCEMENT_TITLE) {
      setError(`Title must be ${MAX_ANNOUNCEMENT_TITLE} characters or fewer.`);
      return;
    }
    setError(null);
    onSubmit({ title: trimmed, body: body.trim() });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.box}>
            <View style={styles.header}>
              <Text style={styles.title}>New announcement</Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close announcement form"
                hitSlop={12}
              >
                <Text style={styles.close}>{'\u2715'}</Text>
              </Pressable>
            </View>

            <TextField
              label="Title"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                if (error) setError(null);
              }}
              placeholder="e.g. Exam moved to Friday"
              error={error}
              autoFocus
              testID="announcement-title"
            />
            <TextField
              label="Message"
              value={body}
              onChangeText={(value) =>
                setBody(value.slice(0, MAX_ANNOUNCEMENT_BODY))
              }
              placeholder="Write the details for your class"
              multiline
              numberOfLines={5}
              testID="announcement-body"
            />

            <View style={styles.actions}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={onClose}
                disabled={submitting}
                style={styles.action}
              />
              <Button
                label="Post"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting || title.trim().length === 0}
                style={styles.action}
                testID="announcement-submit"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  box: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  close: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    minWidth: 110,
  },
});
