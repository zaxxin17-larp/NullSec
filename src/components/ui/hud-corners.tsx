import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type HudCornersProps = {
  color?: string;
  /** Length of each bracket arm, in px. */
  size?: number;
  thickness?: number;
  /** Distance the brackets sit inside the parent edge. */
  inset?: number;
  opacity?: number;
};

/**
 * Four targeting-corner brackets, the signature ctOS framing detail. Rendered as
 * a non-interactive overlay so it can be dropped into any panel or card.
 */
export function HudCorners({
  color = colors.cyan,
  size = 10,
  thickness = 1,
  inset = 0,
  opacity = 0.55,
}: HudCornersProps) {
  const arm = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderColor: color,
    opacity,
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          arm,
          {
            top: inset,
            left: inset,
            borderTopWidth: thickness,
            borderLeftWidth: thickness,
          },
        ]}
      />
      <View
        style={[
          arm,
          {
            top: inset,
            right: inset,
            borderTopWidth: thickness,
            borderRightWidth: thickness,
          },
        ]}
      />
      <View
        style={[
          arm,
          {
            bottom: inset,
            left: inset,
            borderBottomWidth: thickness,
            borderLeftWidth: thickness,
          },
        ]}
      />
      <View
        style={[
          arm,
          {
            bottom: inset,
            right: inset,
            borderBottomWidth: thickness,
            borderRightWidth: thickness,
          },
        ]}
      />
    </View>
  );
}
