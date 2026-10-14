import { useEffect, useMemo } from 'react';
import { Animated, type StyleProp, type TextStyle } from 'react-native';

type BlinkingCursorProps = {
  /** Glyph to blink. Defaults to a terminal block. */
  char?: string;
  style?: StyleProp<TextStyle>;
};

/** Block cursor that mimics a terminal's blinking caret. */
export function BlinkingCursor({ char = '\u258c', style }: BlinkingCursorProps) {
  const opacity = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(520),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(520),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.Text style={[style, { opacity }]}>{char}</Animated.Text>;
}
