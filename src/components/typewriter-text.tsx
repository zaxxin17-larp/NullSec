import { useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

type TypewriterTextProps = {
  text: string;
  /** Milliseconds between characters. */
  speed?: number;
  /** Delay before typing starts. */
  startDelay?: number;
  style?: StyleProp<TextStyle>;
  onComplete?: () => void;
};

/** Reveals `text` one character at a time, terminal-style. */
export function TypewriterText({
  text,
  speed = 90,
  startDelay = 0,
  style,
  onComplete,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setVisibleCount((count) => {
          const next = count + 1;
          if (next >= text.length) {
            if (interval) clearInterval(interval);
            onCompleteRef.current?.();
            return text.length;
          }
          return next;
        });
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return <Text style={style}>{text.slice(0, visibleCount)}</Text>;
}
