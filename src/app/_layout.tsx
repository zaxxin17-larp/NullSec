import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '@/context/auth-context';
import { colors } from '@/theme';

// Firestore's WebChannel streaming transport occasionally drops and logs a
// benign, self-healing "transport errored" warning on React Native. The SDK
// retries automatically (and we enable long-polling auto-detection in
// firebase.ts), so keep the noise out of the dev LogBox overlay.
LogBox.ignoreLogs([/transport errored/i]);

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden on fast refresh — safe to ignore.
});

export default function RootLayout() {
  const [loaded, error] = useFonts({ ShareTechMono_400Regular });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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
