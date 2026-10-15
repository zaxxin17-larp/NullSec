import Constants from 'expo-constants';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { useActivity } from '@/context/activity-context';
import { useAuth } from '@/context/auth-context';
import { logOut, sendPasswordReset, updateUsername } from '@/services/auth';
import { subscribeToMember, type MemberRole } from '@/services/members';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { checkForUpdates } from '@/updates';

export default function SettingsScreen() {
  const { user } = useAuth();
  const { unreadCount, markSeen } = useActivity();

  const [role, setRole] = useState<MemberRole>('student');

  // Editing is draft-based: `draftName` is null until the user types, so the
  // field tracks the auth profile without a syncing effect.
  const [committedName, setCommittedName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const [sendingReset, setSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const uid = user?.uid;
  const email = user?.email ?? '';

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToMember(
      uid,
      (member) => setRole(member?.role ?? 'student'),
      () => {},
    );
    return unsubscribe;
  }, [uid]);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const baseName = committedName ?? user.displayName?.trim() ?? '';
  const name = draftName ?? baseName;
  const trimmedName = name.trim();
  const nameChanged =
    draftName !== null && trimmedName.length >= 3 && trimmedName !== baseName;

  async function handleSaveName() {
    if (!uid || !nameChanged || savingName) return;
    setSavingName(true);
    setNameError(null);
    setNameMessage(null);
    try {
      await updateUsername(uid, trimmedName);
      setCommittedName(trimmedName);
      setDraftName(null);
      setNameMessage('Profile updated.');
    } catch {
      setNameError('Could not update your name. Check your connection and try again.');
    } finally {
      setSavingName(false);
    }
  }

  async function handleReset() {
    if (!email || sendingReset) return;
    setSendingReset(true);
    setResetMessage(null);
    try {
      await sendPasswordReset(email);
      setResetMessage(`Reset link sent to ${email}.`);
    } catch {
      setResetMessage('Could not send the reset email. Try again later.');
    } finally {
      setSendingReset(false);
    }
  }

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

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logOut();
    } finally {
      setSigningOut(false);
      setConfirmSignOut(false);
    }
  }

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Settings"
        subtitle="Operator profile, account and client."
        testID="settings-title"
      />

      <Card title="Operator" subtitle="Shown across the class network">
        <View style={styles.profileRow}>
          <Avatar name={trimmedName || email || '?'} size={46} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {trimmedName || 'Unnamed operator'}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {email || 'no email on file'}
            </Text>
          </View>
          <Text style={styles.roleTag}>{role === 'admin' ? 'ADMIN' : 'STUDENT'}</Text>
        </View>

        <TextField
          label="Display name"
          value={name}
          onChangeText={setDraftName}
          placeholder="Your name"
          autoCapitalize="words"
          maxLength={32}
          returnKeyType="done"
          onSubmitEditing={handleSaveName}
          style={styles.field}
          testID="settings-name"
        />
        {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
        {nameMessage ? <Text style={styles.success}>{nameMessage}</Text> : null}
        <Button
          label="Save changes"
          onPress={handleSaveName}
          disabled={!nameChanged}
          loading={savingName}
          style={styles.button}
          testID="settings-save-name"
        />
      </Card>

      <Card title="Account" subtitle="Sign-in and security" delay={80}>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>EMAIL</Text>
          <Text style={styles.kvValue} numberOfLines={1}>
            {email || '—'}
          </Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>ROLE</Text>
          <Text style={styles.kvValue}>
            {role === 'admin' ? 'Administrator' : 'Student'}
          </Text>
        </View>
        <Button
          label="Send password reset"
          onPress={handleReset}
          variant="secondary"
          loading={sendingReset}
          style={styles.button}
          testID="settings-reset"
        />
        {resetMessage ? <Text style={styles.muted}>{resetMessage}</Text> : null}
      </Card>

      <Card title="Alerts" subtitle="Activity badge">
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>UNREAD</Text>
          <Text style={styles.kvValue}>
            {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
          </Text>
        </View>
        <Button
          label="Mark all as read"
          onPress={markSeen}
          disabled={unreadCount === 0}
          variant="secondary"
          style={styles.button}
          testID="settings-mark-read"
        />
      </Card>

      <Card title="Client" subtitle="NullSec build information">
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>VERSION</Text>
          <Text style={styles.kvValue}>v{appVersion}</Text>
        </View>
        <Button
          label={checkingUpdate ? 'Checking…' : 'Check for updates'}
          onPress={handleCheckUpdates}
          disabled={checkingUpdate}
          variant="secondary"
          style={styles.button}
          testID="settings-check-updates"
        />
        {updateMessage ? <Text style={styles.muted}>{updateMessage}</Text> : null}
      </Card>

      <Button
        label="Sign out"
        onPress={() => setConfirmSignOut(true)}
        variant="danger"
        style={styles.signOut}
        testID="settings-signout"
      />

      <ConfirmDialog
        visible={confirmSignOut}
        title="Sign out"
        message="End this session and return to the sign-in screen?"
        confirmLabel="Sign out"
        destructive
        loading={signingOut}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmSignOut(false)}
        testID="settings-confirm-signout"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.lg,
    letterSpacing: 0.5,
  },
  profileEmail: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  roleTag: {
    color: colors.panel,
    backgroundColor: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  field: {
    marginBottom: spacing.sm,
  },
  button: {
    alignSelf: 'flex-start',
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginBottom: spacing.sm,
  },
  success: {
    color: colors.success,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginBottom: spacing.sm,
  },
  kvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  kvLabel: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1.5,
  },
  kvValue: {
    flexShrink: 1,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 0.5,
  },
  muted: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    marginTop: spacing.sm,
  },
  signOut: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
  },
});
