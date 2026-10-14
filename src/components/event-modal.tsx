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
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH } from '@/services/events';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { formatDateLabel, type DateKey } from '@/utils/date';

type EventModalProps = {
  visible: boolean;
  date: DateKey | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (input: { title: string; notes: string }) => void;
};

export function EventModal({
  visible,
  date,
  submitting = false,
  onClose,
  onSubmit,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Title is required.');
      return;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
      return;
    }
    setError(null);
    onSubmit({ title: trimmed, notes: notes.trim() });
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
              <Text style={styles.title}>New event</Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close event form"
                hitSlop={12}
              >
                <Text style={styles.close}>{'\u2715'}</Text>
              </Pressable>
            </View>

            {date ? <Text style={styles.dateLabel}>{formatDateLabel(date)}</Text> : null}

            <TextField
              label="Title"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                if (error) setError(null);
              }}
              placeholder="e.g. Group presentation"
              error={error}
              autoFocus
              testID="event-title"
            />
            <TextField
              label="Details (optional)"
              value={notes}
              onChangeText={(value) => setNotes(value.slice(0, MAX_NOTES_LENGTH))}
              placeholder="Add a short note"
              multiline
              numberOfLines={3}
              testID="event-notes"
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
                label="Add event"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting || title.trim().length === 0}
                style={styles.action}
                testID="event-submit"
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
    marginBottom: spacing.md,
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
  dateLabel: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
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
