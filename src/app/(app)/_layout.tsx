import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { TopNav } from '@/components/ui/top-nav';
import { colors } from '@/theme';

/** Shared shell for all signed-in screens: persistent horizontal top nav. */
export default function AppLayout() {
  return (
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
