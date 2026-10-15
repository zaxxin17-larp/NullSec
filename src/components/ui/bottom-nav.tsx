import { usePathname, useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActivity } from '@/context/activity-context';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

type IconName = 'home' | 'calendar' | 'people' | 'chat' | 'more';

const PRIMARY = [
  { label: 'HOME', icon: 'home', href: '/(app)/home', match: '/home' },
  { label: 'ATTEND', icon: 'calendar', href: '/(app)/calendar', match: '/calendar' },
  { label: 'CLASS', icon: 'people', href: '/(app)/members', match: '/members' },
  { label: 'CHAT', icon: 'chat', href: '/(app)/messages', match: '/messages' },
] as const satisfies readonly {
  label: string;
  icon: IconName;
  href: Href;
  match: string;
}[];

const MORE_ITEMS = [
  { key: 'announcements', label: 'Notices', meta: 'Class announcements', href: '/(app)/announcements' },
  { key: 'notifications', label: 'Alerts', meta: 'Recent activity', href: '/(app)/notifications' },
  { key: 'settings', label: 'Settings', meta: 'Operator & client', href: '/(app)/settings' },
] as const satisfies readonly {
  key: string;
  label: string;
  meta: string;
  href: Href;
}[];

const TAB_COUNT = PRIMARY.length + 1;

/** Crisp geometric tab icons drawn with views (no glyph/font dependency). */
function TabIcon({ name, color }: { name: IconName; color: string }) {
  switch (name) {
    case 'home':
      return (
        <View style={styles.icGrid}>
          <View style={[styles.icCell, { backgroundColor: color }]} />
          <View style={[styles.icCell, { borderColor: color }]} />
          <View style={[styles.icCell, { borderColor: color }]} />
          <View style={[styles.icCell, { borderColor: color }]} />
        </View>
      );
    case 'calendar':
      return (
        <View style={styles.icCalendar}>
          <View style={[styles.icCalBox, { borderColor: color }]} />
          <View style={[styles.icCalBar, { backgroundColor: color }]} />
        </View>
      );
    case 'people':
      return (
        <View style={styles.icPeople}>
          <View style={[styles.icPersonBack, { borderColor: color }]} />
          <View style={[styles.icPersonFront, { borderColor: color }]} />
        </View>
      );
    case 'chat':
      return (
        <View style={styles.icChat}>
          <View style={[styles.icChatBox, { borderColor: color }]} />
          <View style={[styles.icChatTail, { backgroundColor: color }]} />
        </View>
      );
    case 'more':
    default:
      return (
        <View style={styles.icMore}>
          <View style={[styles.icDot, { backgroundColor: color }]} />
          <View style={[styles.icDot, { backgroundColor: color }]} />
          <View style={[styles.icDot, { backgroundColor: color }]} />
        </View>
      );
  }
}

/**
 * Persistent bottom navigation. The active tab is tracked by an animated
 * indicator that slides between destinations; secondary routes live behind a
 * slide-up "MORE" sheet.
 */
export function BottomNav() {
  const { unreadCount } = useActivity();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [barWidth, setBarWidth] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  const indicator = useMemo(() => new Animated.Value(0), []);
  const sheet = useMemo(() => new Animated.Value(0), []);

  const activeIndex = useMemo(() => {
    const index = PRIMARY.findIndex(
      (tab) => pathname === tab.match || pathname.startsWith(`${tab.match}/`),
    );
    return index === -1 ? PRIMARY.length : index;
  }, [pathname]);

  const tabWidth = barWidth > 0 ? barWidth / TAB_COUNT : 0;

  useEffect(() => {
    Animated.timing(indicator, {
      toValue: activeIndex,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [indicator, activeIndex]);

  const translateX = useMemo(
    () => Animated.multiply(indicator, tabWidth),
    [indicator, tabWidth],
  );

  const sheetTranslate = sheet.interpolate({
    inputRange: [0, 1],
    outputRange: [340, 0],
  });

  function openSheet() {
    setSheetOpen(true);
    Animated.timing(sheet, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  function closeSheet(after?: () => void) {
    Animated.timing(sheet, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSheetOpen(false);
      after?.();
    });
  }

  const moreActive = activeIndex === PRIMARY.length;

  return (
    <View
      style={[styles.bar, { paddingBottom: insets.bottom }]}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      testID="bottom-nav"
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, { width: tabWidth, transform: [{ translateX }] }]}
      />

      {PRIMARY.map((tab) => {
        const active = pathname === tab.match || pathname.startsWith(`${tab.match}/`);
        const tint = active ? colors.cyan : colors.inkDim;
        return (
          <Pressable
            key={tab.href}
            onPress={() => {
              if (!active) router.push(tab.href);
            }}
            accessibilityRole="link"
            accessibilityState={{ selected: active }}
            testID={`nav-${tab.match.replace('/', '')}`}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <TabIcon name={tab.icon} color={tint} />
            <Text style={[styles.label, { color: tint }]}>{tab.label}</Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityState={{ selected: moreActive, expanded: sheetOpen }}
        testID="nav-more"
        style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
      >
        <View>
          <TabIcon name="more" color={moreActive ? colors.cyan : colors.inkDim} />
          {unreadCount > 0 ? <View style={styles.badgeDot} /> : null}
        </View>
        <Text style={[styles.label, { color: moreActive ? colors.cyan : colors.inkDim }]}>
          MORE
        </Text>
      </Pressable>

      <Modal
        visible={sheetOpen}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => closeSheet()}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, { opacity: sheet }]}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => closeSheet()}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: insets.bottom + spacing.md,
                opacity: sheet,
                transform: [{ translateY: sheetTranslate }],
              },
            ]}
          >
            <View style={styles.sheetGrip} />
            <Text style={styles.sheetHeading}>MORE DESTINATIONS</Text>
            {MORE_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => closeSheet(() => router.push(item.href))}
                accessibilityRole="link"
                testID={`nav-${item.key}`}
                style={({ pressed }) => [styles.sheetItem, pressed && styles.sheetItemPressed]}
              >
                <View style={styles.sheetBullet} />
                <View style={styles.sheetText}>
                  <Text style={styles.sheetLabel}>{item.label}</Text>
                  <Text style={styles.sheetMeta}>{item.meta}</Text>
                </View>
                {item.key === 'notifications' && unreadCount > 0 ? (
                  <Text style={styles.sheetCount}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                ) : null}
                <Text style={styles.sheetChevron}>{'→'}</Text>
              </Pressable>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderTopWidth: 1,
    borderTopColor: colors.panelLine,
    paddingTop: spacing.xs,
    zIndex: 100,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: colors.cyan,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  tabPressed: {
    opacity: 0.55,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.orange,
  },

  // Icons
  icGrid: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  icCell: {
    width: 7.5,
    height: 7.5,
    borderWidth: 1.5,
  },
  icCalendar: {
    width: 18,
    height: 17,
  },
  icCalBox: {
    position: 'absolute',
    top: 0,
    left: 1,
    right: 1,
    bottom: 0,
    borderWidth: 1.5,
  },
  icCalBar: {
    position: 'absolute',
    top: 0,
    left: 1,
    right: 1,
    height: 4,
  },
  icPeople: {
    width: 20,
    height: 16,
  },
  icPersonBack: {
    position: 'absolute',
    left: 0,
    top: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  icPersonFront: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.5,
  },
  icChat: {
    width: 18,
    height: 16,
  },
  icChatBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    borderWidth: 1.5,
    borderRadius: radii.sm,
  },
  icChatTail: {
    position: 'absolute',
    bottom: 1,
    left: 4,
    width: 5,
    height: 5,
    transform: [{ rotate: '45deg' }],
  },
  icMore: {
    width: 18,
    height: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Sheet
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.panelAlt,
    borderTopWidth: 2,
    borderTopColor: colors.cyan,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  sheetGrip: {
    alignSelf: 'center',
    width: 40,
    height: 3,
    backgroundColor: colors.panelLine,
    marginBottom: spacing.md,
  },
  sheetHeading: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.panelLine,
  },
  sheetItemPressed: {
    backgroundColor: colors.panel,
  },
  sheetBullet: {
    width: 6,
    height: 6,
    backgroundColor: colors.cyan,
  },
  sheetText: {
    flex: 1,
  },
  sheetLabel: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 1,
  },
  sheetMeta: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    marginTop: 1,
  },
  sheetCount: {
    color: colors.panel,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  sheetChevron: {
    color: colors.cyanDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
  },
});
