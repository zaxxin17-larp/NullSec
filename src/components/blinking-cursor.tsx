import { useEffect, useState } from 'react';
import { Animated, type StyleProp, type TextStyle } from 'react-native';

import { colors, fonts, fontSizes } from '@/theme';

type BlinkingCursorProps = {
  char?: string;
  style?: StyleProp<TextStyle>;
};

/** A block cursor that blinks on a 530ms cadence, terminal style. */
export function BlinkingCursor({ char = '\u2588', style }: BlinkingCursorProps) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 530,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 530,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.Text
      style={[
        {
          opacity,
          color: colors.primary,
          fontFamily: fonts.mono,
          fontSize: fontSizes.md,
        },
        style,
      ]}
    >
      {char}
    </Animated.Text>
  );
}
