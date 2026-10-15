import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { TopNav } from '@/components/ui/top-nav';
import { ActivityProvider } from '@/context/activity-context';
import { colors } from '@/theme';

/** Shared shell for all signed-in screens: persistent horizontal top nav. */
export default function AppLayout() {
  return (
    <ActivityProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <TopNav />
        <View style={styles.body}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          />
        </View>
      </View>
    </ActivityProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
});
