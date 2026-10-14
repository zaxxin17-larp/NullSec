import { Redirect } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { HackingLoader } from '@/components/hacking-loader';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/context/auth-context';
import { isFirebaseConfigured } from '@/firebase';
import { colors, fontSizes, fonts, spacing } from '@/theme';

export default function IndexScreen() {
  const { user, initializing } = useAuth();

  if (!isFirebaseConfigured) {
    return (
      <ScreenContainer contentStyle={styles.content} testID="config-error">
        <Text style={styles.title}>{'>_ CONFIG ERROR'}</Text>
        <Text style={styles.message}>
          Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* values to
          .env and make sure they are included in your build.
        </Text>
      </ScreenContainer>
    );
  }

  if (initializing) {
    return (
      <HackingLoader message="ESTABLISHING SECURE LINK..." testID="boot-loader" />
    );
  }

  return <Redirect href={user ? '/(app)/home' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  title: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xl,
    letterSpacing: 3,
    marginBottom: spacing.lg,
  },
  message: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
});
