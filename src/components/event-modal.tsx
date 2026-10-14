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

import { TerminalButton } from '@/components/terminal-button';
import { TerminalInput } from '@/components/terminal-input';
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH } from '@/services/events';
import { colors, fontSizes, fonts, spacing } from '@/theme';
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
      setError('ERROR: TITLE REQUIRED');
      return;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError(`ERROR: TITLE MAX ${MAX_TITLE_LENGTH} CHARS`);
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
              <Text style={styles.title}>NEW EVENT</Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close event form"
                hitSlop={12}
              >
                <Text style={styles.close}>[X]</Text>
              </Pressable>
            </View>

            {date ? (
              <Text style={styles.dateLabel}>{formatDateLabel(date)}</Text>
            ) : null}

            <TerminalInput
              label="title"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                if (error) setError(null);
              }}
              placeholder="deploy payload"
              error={Boolean(error)}
              testID="event-title"
            />

            <TerminalInput
              label="details"
              value={notes}
              onChangeText={(value) => setNotes(value.slice(0, MAX_NOTES_LENGTH))}
              placeholder="optional notes"
              testID="event-notes"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <TerminalButton
                label="ADD EVENT"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting || title.trim().length === 0}
                testID="event-submit"
              />
              <TerminalButton
                label="Cancel"
                variant="ghost"
                onPress={onClose}
                disabled={submitting}
                style={styles.cancel}
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  box: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 0,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.lg,
    letterSpacing: 3,
  },
  close: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 2,
  },
  dateLabel: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
    marginTop: spacing.md,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancel: {
    marginTop: 0,
  },
});
