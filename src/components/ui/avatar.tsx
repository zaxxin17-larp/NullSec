import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radii } from '@/theme';

type AvatarProps = {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Profile picture link. When set it fills the tile. */
  url?: string | null;
  /** Accent colour (`#rrggbb`). Falls back to the system cyan. */
  accent?: string | null;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Pick readable text for a tile filled with `hex`. */
function inkFor(hex: string): string {
  const value = hex.slice(1);
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? colors.panel : colors.white;
}

export function Avatar({
  name,
  size = 36,
  style,
  testID,
  url,
  accent,
}: AvatarProps) {
  const tint =
    accent && HEX.test(accent.trim()) ? accent.trim() : colors.cyan;
  const picture = url ? url.trim() : '';

  return (
    <View
      testID={testID}
      accessibilityLabel={name}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Math.max(radii.sm, size * 0.26),
          backgroundColor: picture ? colors.panel : tint,
          borderColor: picture ? tint : 'transparent',
        },
        style,
      ]}
    >
      {picture ? (
        <Image source={{ uri: picture }} style={styles.image} resizeMode="cover" />
      ) : (
        <Text
          numberOfLines={1}
          style={[
            styles.text,
            {
              color: inkFor(tint),
              fontSize: Math.max(11, Math.round(size * 0.4)),
            },
          ]}
        >
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontFamily: fonts.mono,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
