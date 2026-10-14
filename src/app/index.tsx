import { Redirect } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/auth-context';
import { isFirebaseConfigured } from '@/firebase';
import { colors, fontSizes, fonts, spacing } from '@/theme';

export default function IndexScreen() {
  const { user, initializing } = useAuth();

  if (!isFirebaseConfigured) {
    return (
      <ScreenContainer contentStyle={styles.content} testID="config-error">
        <Text style={styles.title}>Setup required</Text>
        <Text style={styles.message}>
          This build is missing its Firebase configuration. Add the
          EXPO_PUBLIC_FIREBASE_* values to .env and rebuild.
        </Text>
      </ScreenContainer>
    );
  }

  if (initializing) {
    return <Loader label="Establishing connection" testID="boot-loader" />;
  }

  return <Redirect href={user ? '/(app)/home' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
