import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radii } from '@/theme';

type AvatarProps = {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 36, style, testID }: AvatarProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radii.pill,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: Math.max(11, size * 0.38) }]}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.accentStrong,
    fontFamily: fonts.mono,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
