import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { BlinkingCursor } from '@/components/blinking-cursor';
import { colors, fontSizes, fonts, spacing } from '@/theme';

const GLYPHS =
  '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFabcdef#$%&*+=<>/\\|{}[]';

const TOKENS = [
  '0x', 'fn', 'init', 'auth', '>>', '::', 'null', 'sec', 'decrypt', 'handshake',
  'root', 'sudo', 'ping', 'ACK', 'SYN', '0b', '0xFF', 'token', 'key', 'xor',
  'hash', 'chmod', './', 'ssh', 'grep', 'inject', 'payload', 'traverse', 'bypass',
];

const GLYPH_INDEX = Array.from(GLYPHS);

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomLine(): string {
  const width = 18 + randomInt(26);
  let out = '';
  while (out.length < width) {
    out +=
      Math.random() < 0.35
        ? TOKENS[randomInt(TOKENS.length)]
        : GLYPH_INDEX[randomInt(GLYPH_INDEX.length)];
  }
  return out.slice(0, width);
}

function buildBuffer(rows: number): string[] {
  return Array.from({ length: rows }, () => randomLine());
}

type HackingLoaderProps = {
  message?: string;
  rows?: number;
  error?: boolean;
  testID?: string;
};

/**
 * Full-screen "hacking" boot sequence: a scrolling stream of pseudo-code with a
 * cycling progress bar. Used during startup and while applying an OTA update.
 */
export function HackingLoader({
  message = 'DECRYPTING...',
  rows = 13,
  error = false,
  testID,
}: HackingLoaderProps) {
  const [buffer, setBuffer] = useState<string[]>(() => buildBuffer(rows));
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const id = setInterval(() => {
      setBuffer((prev) => [...prev.slice(1), randomLine()]);
    }, 85);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const accent = error ? colors.error : colors.primary;
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['3%', '100%'],
  });

  return (
    <View style={styles.overlay} testID={testID}>
      <View style={styles.terminal}>
        <Text style={[styles.title, { color: accent }]}>{'>_ NULLSEC'}</Text>

        <View style={styles.stream}>
          {buffer.map((line, index) => (
            <Text
              key={index}
              numberOfLines={1}
              style={[
                styles.line,
                {
                  opacity: 0.18 + (index / buffer.length) * 0.82,
                  color: index === buffer.length - 1 ? accent : colors.textDim,
                },
              ]}
            >
              {line}
            </Text>
          ))}
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressBar, { width: barWidth, backgroundColor: accent }]}
          />
        </View>

        <View style={styles.statusRow}>
          <BlinkingCursor style={{ color: accent }} />
          <Text style={[styles.status, { color: accent }]}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
  },
  terminal: {
    flex: 1,
    maxHeight: '100%',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.lg,
    letterSpacing: 4,
    marginBottom: spacing.lg,
  },
  stream: {
    height: 13 * 18,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  line: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    backgroundColor: colors.transparent,
  },
  progressBar: {
    height: 2,
    marginTop: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  status: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 2,
  },
});
