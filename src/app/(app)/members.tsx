import { Redirect } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/auth-context';
import { subscribeToMembers, type MemberProfile } from '@/services/members';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

function describeError(error: Error): string {
  const code = (error as { code?: string }).code;
  if (code === 'permission-denied') {
    return 'The class directory is not available yet. The rules may need deploying.';
  }
  if (code === 'unavailable') return 'Network unavailable. Retrying…';
  return 'Could not load the directory right now.';
}

export default function MembersScreen() {
  const { user } = useAuth();

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToMembers(
      (next) => {
        setMembers(next);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(describeError(err));
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const uid = user?.uid;

  const adminCount = useMemo(
    () => members.filter((member) => member.role === 'admin').length,
    [members],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) =>
      member.username.toLowerCase().includes(term),
    );
  }, [members, search]);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Classmates directory"
        kicker="CLASS NETWORK // DIRECTORY"
        code="SEC-01"
        subtitle="Everyone in your class section."
        testID="members-title"
      />

      <TextField
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name"
        autoCapitalize="none"
        returnKeyType="done"
        testID="members-search"
        style={styles.search}
      />

      <Card
        title="Class members"
        subtitle="Section roster"
        headerAccessory={
          <Text style={styles.count} testID="members-count">
            {members.length} member{members.length === 1 ? '' : 's'}
          </Text>
        }
      >
        {loading ? (
          <Loader compact />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : visible.length === 0 ? (
          <Text style={styles.empty}>
            {members.length === 0
              ? 'No classmates have joined yet.'
              : 'No members match your search.'}
          </Text>
        ) : (
          <View style={styles.list}>
            {visible.map((member) => {
              const isSelf = member.uid === uid;
              const isAdminMember = member.role === 'admin';
              return (
                <View
                  key={member.uid}
                  style={styles.row}
                  testID={`member-${member.uid}`}
                >
                  <Avatar
                    name={member.username}
                    size={36}
                    url={member.avatarUrl}
                    accent={member.accent}
                  />
                  <View style={styles.rowInfo}>
                    <Text
                      style={[styles.rowName, isSelf && styles.rowSelf]}
                      numberOfLines={1}
                    >
                      {member.username}
                      {isSelf ? ' (you)' : ''}
                    </Text>
                    <Text
                      style={[styles.rowMeta, member.bio && styles.rowBio]}
                      numberOfLines={1}
                    >
                      {member.bio || (isAdminMember ? 'Administrator' : 'Student')}
                    </Text>
                  </View>
                  {isAdminMember ? (
                    <Text style={styles.adminBadge}>ADMIN</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
        {!loading && !error && adminCount > 0 ? (
          <Text style={styles.hint}>
            {adminCount} administrator{adminCount === 1 ? '' : 's'} in this class.
          </Text>
        ) : null}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  search: {
    marginBottom: spacing.lg,
  },
  count: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDim,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  rowSelf: {
    color: colors.accentStrong,
  },
  rowMeta: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginTop: 1,
    letterSpacing: 0.5,
  },
  rowBio: {
    color: colors.textDim,
    fontFamily: fonts.sans,
    fontStyle: 'italic',
  },
  adminBadge: {
    color: colors.panel,
    backgroundColor: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    marginTop: spacing.md,
  },
});
