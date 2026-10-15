import Constants from 'expo-constants';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
import {
  AVATAR_URL_MAX_LENGTH,
  BIO_MAX_LENGTH,
  subscribeToMember,
  updateProfileDetails,
  type MemberProfile,
} from '@/services/members';
import { avatarColors, colors, fontSizes, fonts, radii, spacing } from '@/theme';
import { checkForUpdates } from '@/updates';

export default function SettingsScreen() {
  const { user } = useAuth();
  const { unreadCount, markSeen } = useActivity();

  const [member, setMember] = useState<MemberProfile | null>(null);

  // Editing is draft-based: each draft is null until the user edits it, so the
  // fields track the stored profile without a syncing effect.
  const [committedName, setCommittedName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const [draftUrl, setDraftUrl] = useState<string | null>(null);
  const [draftAccent, setDraftAccent] = useState<string | null>(null);
  const [draftBio, setDraftBio] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [sendingReset, setSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const uid = user?.uid;
  const email = user?.email ?? '';
  const role = member?.role ?? 'student';

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToMember(uid, setMember, () => {});
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

  const storedUrl = member?.avatarUrl ?? '';
  const storedAccent = member?.accent ?? '';
  const storedBio = member?.bio ?? '';
  const avatarUrl = draftUrl ?? storedUrl;
  const accent = draftAccent ?? storedAccent;
  const bio = draftBio ?? storedBio;
  const profileChanged =
    (draftUrl !== null && avatarUrl !== storedUrl) ||
    (draftAccent !== null && accent !== storedAccent) ||
    (draftBio !== null && bio !== storedBio);

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

  async function handleSaveProfile() {
    if (!uid || !profileChanged || savingProfile) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      await updateProfileDetails(uid, {
        avatarUrl: avatarUrl.trim(),
        accent: accent.trim(),
        bio: bio.trim(),
      });
      setDraftUrl(null);
      setDraftAccent(null);
      setDraftBio(null);
      setProfileMessage('Profile saved.');
    } catch {
      setProfileError(
        'Could not save your profile. Check your connection and deployed rules.',
      );
    } finally {
      setSavingProfile(false);
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
          <Avatar
            name={trimmedName || email || '?'}
            size={46}
            seed={uid}
            url={avatarUrl}
            accent={accent}
          />
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

      <Card title="Profile picture" subtitle="Avatar, accent and status" delay={40}>
        <View style={styles.avatarPreview}>
          <Avatar
            name={trimmedName || email || '?'}
            size={72}
            seed={uid}
            url={avatarUrl}
            accent={accent}
          />
          <Text style={styles.avatarHint}>
            {avatarUrl
              ? 'Using your linked picture.'
              : 'Generated from your operator ID.'}
          </Text>
        </View>

        <Text style={styles.fieldLabel}>ACCENT</Text>
        <View style={styles.swatches}>
          <Pressable
            onPress={() => setDraftAccent('')}
            accessibilityRole="button"
            accessibilityLabel="Default accent"
            accessibilityState={{ selected: accent === '' }}
            style={[
              styles.swatch,
              styles.swatchDefault,
              accent === '' && styles.swatchActive,
            ]}
            testID="settings-accent-default"
          >
            <Text style={styles.swatchDefaultText}>A</Text>
          </Pressable>
          {avatarColors.map((swatch) => {
            const active = accent.toLowerCase() === swatch.toLowerCase();
            return (
              <Pressable
                key={swatch}
                onPress={() => setDraftAccent(swatch)}
                accessibilityRole="button"
                accessibilityLabel={`Accent ${swatch}`}
                accessibilityState={{ selected: active }}
                style={[
                  styles.swatch,
                  { backgroundColor: swatch },
                  active && styles.swatchActive,
                ]}
                testID={`settings-accent-${swatch.replace('#', '')}`}
              />
            );
          })}
        </View>

        <TextField
          label="Picture link"
          value={avatarUrl}
          onChangeText={setDraftUrl}
          placeholder="https://…/photo.jpg"
          autoCapitalize="none"
          keyboardType="url"
          maxLength={AVATAR_URL_MAX_LENGTH}
          style={styles.field}
          testID="settings-avatar-url"
        />
        <Text style={styles.hint}>
          Paste a link to an image, or leave it blank to keep the generated avatar.
        </Text>

        <TextField
          label="Status"
          value={bio}
          onChangeText={setDraftBio}
          placeholder="A short line about you"
          autoCapitalize="sentences"
          multiline
          maxLength={BIO_MAX_LENGTH}
          style={styles.field}
          testID="settings-bio"
        />

        {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
        {profileMessage ? <Text style={styles.success}>{profileMessage}</Text> : null}
        <Button
          label="Save profile"
          onPress={handleSaveProfile}
          disabled={!profileChanged}
          loading={savingProfile}
          style={styles.button}
          testID="settings-save-profile"
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
  avatarPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarHint: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  swatchActive: {
    borderColor: colors.text,
    borderWidth: 2,
  },
  swatchDefault: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchDefaultText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
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
