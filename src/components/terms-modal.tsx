import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type TermsModalProps = {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
};

const TERMS_SECTIONS = [
  {
    heading: 'Using NullSec',
    body: 'NullSec is a classroom community space for attendance, classmates and messaging. Use it only for your section and follow your school\'s rules.',
  },
  {
    heading: 'Your data',
    body: 'We store your name, email address and the information you choose to add to your profile. Passwords are handled securely and never stored in plain text.',
  },
  {
    heading: 'Attendance',
    body: 'Attendance records are maintained by authorized class members. Private attendance notes are not shown on public profiles or shared in chats.',
  },
  {
    heading: 'Conduct',
    body: 'Be respectful. Do not share others\' private information. Accounts that misuse the service may be suspended.',
  },
  {
    heading: 'Changes',
    body: 'We may update these terms as the platform evolves. Continued use means you accept the latest version.',
  },
];

export function TermsModal({ visible, onAccept, onClose }: TermsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.title}>Terms &amp; Conditions</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close terms"
              hitSlop={12}
            >
              <Text style={styles.close}>{'\u2715'}</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            {TERMS_SECTIONS.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={styles.heading}>{section.heading}</Text>
                <Text style={styles.body}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.action} />
            <Button label="I agree" onPress={onAccept} style={styles.action} testID="terms-accept" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  box: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDim,
    paddingBottom: spacing.md,
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
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    minWidth: 110,
  },
});
