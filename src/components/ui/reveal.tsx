import { useEffect, useMemo, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type RevealProps = {
  children: ReactNode;
  /** Stagger the entrance (ms). */
  delay?: number;
  duration?: number;
  /** Distance (px) the content rises from. */
  offset?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Fades + lifts its children into place on mount. Uses the built-in Animated
 * API (native driver) so it stays smooth and works on web without extra setup.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 420,
  offset = 14,
  style,
}: RevealProps) {
  const progress = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offset, 0],
  });

  return (
    <Animated.View
      style={[style, { opacity: progress, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}
