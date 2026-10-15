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
import { HudCorners } from '@/components/ui/hud-corners';
import { colors, spacing } from '@/theme';

const GRID_STEP = 40;
const SCAN_STEP = 3;

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

/** CRT scanline texture over the canvas — the "screen glow" of the console. */
function Scanlines() {
  const { height } = useWindowDimensions();
  const count = Math.min(Math.ceil(height / SCAN_STEP), 400);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.scanline, { top: i * SCAN_STEP }]} />
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
 * ctOS canvas: safe area, a fixed HUD frame, optional scroll, and a centered
 * content column that stays readable on wide web/tablet layouts.
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
      <Scanlines />

      <View pointerEvents="none" style={styles.frame}>
        <HudCorners size={22} thickness={2} inset={9} opacity={0.5} />
      </View>

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
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(63, 214, 232, 0.035)',
  },
});
