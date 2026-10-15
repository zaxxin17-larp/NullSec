import { useEffect, useMemo } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { BlinkingCursor } from '@/components/blinking-cursor';
import { colors, fontSizes, fonts, spacing } from '@/theme';

const BOOT_LINES = [
  '> nullsec kernel v1.0.0',
  '> mounting secure filesystem',
  '> linking class datastore',
  '> authenticating operator',
  '> access granted',
];

type BootSplashProps = {
  onFinish: () => void;
};

/**
 * Animated "boot" overlay shown once on launch, on top of the (briefly visible)
 * static native splash. Plays a short terminal boot sequence, then fades away.
 */
export function BootSplash({ onFinish }: BootSplashProps) {
  const timeline = useMemo(() => new Animated.Value(0), []);
  const fade = useMemo(() => new Animated.Value(1), []);
  const sweep = useMemo(() => new Animated.Value(0), []);
  const { height } = useWindowDimensions();

  useEffect(() => {
    const sweepLoop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    sweepLoop.start();

    const sequence = Animated.sequence([
      Animated.timing(timeline, {
        toValue: 1,
        duration: 1350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.delay(130),
      Animated.timing(fade, {
        toValue: 0,
        duration: 340,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    sequence.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => {
      sweepLoop.stop();
      sequence.stop();
    };
  }, [timeline, fade, sweep, onFinish]);

  const brandOpacity = timeline.interpolate({
    inputRange: [0, 0.28],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const brandTranslate = timeline.interpolate({
    inputRange: [0, 0.28],
    outputRange: [16, 0],
    extrapolate: 'clamp',
  });
  const taglineOpacity = timeline.interpolate({
    inputRange: [0.18, 0.4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const barWidth = timeline.interpolate({
    inputRange: [0.08, 0.92],
    outputRange: ['4%', '100%'],
    extrapolate: 'clamp',
  });
  const sweepTranslate = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, height],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={index} style={styles.gridLine} />
        ))}
      </View>

      <Animated.View
        pointerEvents="none"
        style={[styles.sweep, { transform: [{ translateY: sweepTranslate }] }]}
      />

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.brandBlock,
            { opacity: brandOpacity, transform: [{ translateY: brandTranslate }] },
          ]}
        >
          <View style={styles.brandRow}>
            <Text style={styles.brand}>NULLSEC</Text>
            <BlinkingCursor style={styles.cursor} />
          </View>
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            CLASS NETWORK // SECURE ACCESS
          </Animated.Text>
        </Animated.View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>

        <View style={styles.log}>
          {BOOT_LINES.map((line, index) => {
            const start = 0.32 + index * 0.12;
            const opacity = timeline.interpolate({
              inputRange: [start, start + 0.1],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            });
            return (
              <Animated.Text key={line} style={[styles.logLine, { opacity }]}>
                {line}
              </Animated.Text>
            );
          })}
        </View>
      </View>

      <Text style={styles.version}>NULLSEC CLIENT v1.0.0</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    zIndex: 1000,
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  gridLine: {
    height: 1,
    backgroundColor: colors.panelLine,
    opacity: 0.6,
  },
  center: {
    alignItems: 'center',
  },
  brandBlock: {
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    color: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    letterSpacing: 8,
  },
  cursor: {
    color: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xxl,
    marginLeft: 4,
  },
  tagline: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 3,
    marginTop: spacing.sm,
  },
  progressTrack: {
    width: 240,
    maxWidth: '80%',
    height: 3,
    backgroundColor: colors.panelLine,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.cyan,
  },
  log: {
    marginTop: spacing.lg,
    minHeight: 92,
    width: 240,
    maxWidth: '80%',
  },
  logLine: {
    color: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  sweep: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.cyan,
    opacity: 0.35,
  },
  version: {
    position: 'absolute',
    bottom: spacing.xl,
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
});
