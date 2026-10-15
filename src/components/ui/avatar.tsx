import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii } from '@/theme';

type AvatarProps = {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Profile picture link. When set it replaces the generated identicon. */
  url?: string | null;
  /** Accent colour (`#rrggbb`). Falls back to the system cyan. */
  accent?: string | null;
  /** Stable seed for the identicon (usually the uid). Defaults to `name`. */
  seed?: string;
};

const GRID = 5;

/** Small deterministic hash so a user always gets the same identicon. */
function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** 5x5 mirrored block pattern derived from the seed (never fully empty). */
function identicon(seed: string): boolean[] {
  let state = hashSeed(seed) || 1;
  const nextBit = (): boolean => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return (state & 1) === 1;
  };

  const cells: boolean[] = [];
  for (let row = 0; row < GRID; row += 1) {
    const left = [nextBit(), nextBit(), nextBit()];
    cells.push(left[0], left[1], left[2], left[1], left[0]);
  }
  if (!cells.some(Boolean)) cells[Math.floor((GRID * GRID) / 2)] = true;
  return cells;
}

export function Avatar({
  name,
  size = 36,
  style,
  testID,
  url,
  accent,
  seed,
}: AvatarProps) {
  const tint = accent && accent.trim() ? accent : colors.accent;
  const picture = url ? url.trim() : '';

  return (
    <View
      testID={testID}
      accessibilityLabel={`${name} avatar`}
      style={[
        styles.base,
        { width: size, height: size, borderColor: tint },
        style,
      ]}
    >
      {picture ? (
        <Image
          source={{ uri: picture }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.grid}>
          {identicon(seed || name).map((on, index) => (
            <View
              key={index}
              style={[
                styles.cell,
                { backgroundColor: on ? tint : 'transparent' },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cell: {
    width: `${100 / GRID}%`,
    height: `${100 / GRID}%`,
  },
});
