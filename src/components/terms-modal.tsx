import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TerminalButton } from '@/components/terminal-button';
import { BlinkingCursor } from '@/components/blinking-cursor';
import { colors, fontSizes, fonts, spacing } from '@/theme';

type TermsModalProps = {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
};

const TERMS_SECTIONS = [
  {
    heading: '01 // ACCEPTANCE',
    body: 'By accessing NullSec you agree to operate within authorized systems only. Unauthorized access is prohibited and will be logged.',
  },
  {
    heading: '02 // DATA HANDLING',
    body: 'Credentials are transmitted over encrypted channels. Your profile record stores a username, email address, and acceptance timestamp. No plaintext passwords are retained.',
  },
  {
    heading: '03 // CONDUCT',
    body: 'You agree not to abuse, reverse engineer, or disrupt the service. Accounts found violating this clause may be suspended without notice.',
  },
  {
    heading: '04 // LIABILITY',
    body: 'NullSec is provided "as is" without warranty. The operators accept no liability for damages arising from use of this terminal.',
  },
  {
    heading: '05 // TERMINATION',
    body: 'You may terminate this agreement at any time by logging out and requesting account deletion. Continued use constitutes ongoing acceptance.',
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
            <Text style={styles.title}>TERMS &amp; CONDITIONS</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close terms"
              hitSlop={12}
            >
              <Text style={styles.close}>[X]</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            indicatorStyle="white"
          >
            <Text style={styles.intro}>
              NULLSEC PROTOCOL // v1.0
              {'\n'}
              READ CAREFULLY BEFORE PROCEEDING
            </Text>
            {TERMS_SECTIONS.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={styles.heading}>{section.heading}</Text>
                <Text style={styles.body}>{section.body}</Text>
              </View>
            ))}
            <View style={styles.footerCursor}>
              <BlinkingCursor />
              <Text style={styles.footerText}>END OF TRANSMISSION</Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TerminalButton
              label="I ACCEPT"
              onPress={onAccept}
              testID="terms-accept"
            />
            <TerminalButton
              label="Decline"
              variant="ghost"
              onPress={onClose}
              style={styles.decline}
            />
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  box: {
    flex: 1,
    maxHeight: '88%',
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
    marginBottom: spacing.md,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  intro: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.primary,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  footerCursor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  decline: {
    marginTop: 0,
  },
});
