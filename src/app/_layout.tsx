import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '@/context/auth-context';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden on fast refresh — safe to ignore.
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = {
  root: { flex: 1, backgroundColor: colors.background },
} as const;
