import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTopInsetHandled } from '@/context/chrome-context';
import { colors, spacing } from '@/theme';

const GRID_STEP = 40;

/** Faint fixed technical grid behind the page content (ctOS canvas). */
function CanvasGrid() {
  const { width, height } = useWindowDimensions();
  const cols = Math.ceil(width / GRID_STEP) + 1;
  const rows = Math.ceil(height / GRID_STEP) + 1;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: cols }, (_, i) => (
        <View
          key={`v${i}`}
          style={[styles.gridLine, styles.gridV, { left: i * GRID_STEP }]}
        />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <View
          key={`h${i}`}
          style={[styles.gridLine, styles.gridH, { top: i * GRID_STEP }]}
        />
      ))}
    </View>
  );
}

type ScreenContainerProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Light ctOS canvas: safe area + keyboard avoidance + a centered content column
 * that stays readable on wide web/tablet layouts.
 */
export function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
  testID,
}: ScreenContainerProps) {
  const topInsetHandled = useTopInsetHandled();
  const edges: Edge[] = topInsetHandled
    ? ['left', 'right', 'bottom']
    : ['top', 'left', 'right', 'bottom'];

  return (
    <SafeAreaView style={styles.safe} edges={edges} testID={testID}>
      <CanvasGrid />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, styles.flex, contentStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: colors.gridLine,
  },
  gridV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  gridH: {
    left: 0,
    right: 0,
    height: 1,
  },
});
