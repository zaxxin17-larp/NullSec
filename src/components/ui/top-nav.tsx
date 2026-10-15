import { usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BlinkingCursor } from '@/components/blinking-cursor';
import { Avatar } from '@/components/ui/avatar';
import { useActivity } from '@/context/activity-context';
import { useAuth } from '@/context/auth-context';
import { subscribeToMember, type MemberProfile } from '@/services/members';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

const NAV_ITEMS = [
  { label: 'SYSTEM', href: '/(app)/home', match: '/home' },
  { label: 'ATTENDANCE', href: '/(app)/calendar', match: '/calendar' },
  { label: 'CLASSMATES', href: '/(app)/members', match: '/members' },
  { label: 'NOTICES', href: '/(app)/announcements', match: '/announcements' },
  { label: 'MESSAGES', href: '/(app)/messages', match: '/messages' },
  { label: 'ALERTS', href: '/(app)/notifications', match: '/notifications' },
  { label: 'SETTINGS', href: '/(app)/settings', match: '/settings' },
] as const;

const WIDE_BREAKPOINT = 1080;
const BAR_HEIGHT = 58;

function formatClock(date: Date): string {
  return date.toTimeString().slice(0, 8);
}

/** Overlapping pulse ring for the "online" indicator. */
function PulseDot() {
  const anim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={styles.statusWrap}>
      <Animated.View
        style={[styles.statusRing, { opacity, transform: [{ scale }] }]}
      />
      <View style={styles.statusDot} />
    </View>
  );
}

/** Hamburger that morphs into a close "X" — drawn with views (no font glyphs). */
function MenuGlyph({ open }: { open: boolean }) {
  const anim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, open]);

  const topStyle = {
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) },
      { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) },
    ],
  };
  const bottomStyle = {
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
      { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] }) },
    ],
  };
  const middleStyle = {
    opacity: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 0, 0] }),
  };

  return (
    <View style={styles.glyph}>
      <Animated.View style={[styles.glyphBar, topStyle]} />
      <Animated.View style={[styles.glyphBar, middleStyle]} />
      <Animated.View style={[styles.glyphBar, bottomStyle]} />
    </View>
  );
}

/** Active tab underline that grows in when a route becomes active. */
function NavUnderline() {
  const anim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[styles.navUnderline, { opacity: anim, transform: [{ scaleX: anim }] }]}
    />
  );
}

export function TopNav() {
  const { user } = useAuth();
  const { unreadCount } = useActivity();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= WIDE_BREAKPOINT;
  const showClock = width >= 520;

  const [menuOpen, setMenuOpen] = useState(false);
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  const menuAnim = useMemo(() => new Animated.Value(0), []);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    return subscribeToMember(uid, setProfile, () => {});
  }, [uid]);

  useEffect(() => {
    const timer = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 190,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [menuAnim, menuOpen]);

  const name = user?.displayName?.trim() || user?.email || 'OPERATOR';

  function isActive(match: string): boolean {
    return pathname === match || pathname.startsWith(`${match}/`);
  }

  function navigate(href: (typeof NAV_ITEMS)[number]['href']) {
    setMenuOpen(false);
    router.push(href);
  }

  const menuTranslate = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
  });

  return (
    <View style={[styles.header, { paddingTop: insets.top }]} testID="top-nav">
      <View style={styles.bar}>
        <View style={styles.left}>
          <Pressable
            onPress={() => navigate('/(app)/home')}
            accessibilityRole="button"
            accessibilityLabel="NullSec home"
            style={styles.brandRow}
          >
            <View style={styles.brandMark} />
            <View style={styles.brandText}>
              <View style={styles.brandLine}>
                <Text style={styles.brand}>NULLSEC</Text>
                <BlinkingCursor style={styles.brandCursor} />
              </View>
              <Text style={styles.brandSub}>CLASS NETWORK</Text>
            </View>
          </Pressable>

          {isWide ? (
            <View style={styles.nav}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.match);
                return (
                  <Pressable
                    key={item.href}
                    onPress={() => navigate(item.href)}
                    accessibilityRole="link"
                    accessibilityState={{ selected: active }}
                    style={styles.navItem}
                    testID={`nav-${item.match.replace('/', '')}`}
                  >
                    <View style={styles.navItemInner}>
                      <Text
                        style={[styles.navLabel, active && styles.navLabelActive]}
                      >
                        {item.label}
                      </Text>
                      {item.match === '/notifications' && unreadCount > 0 ? (
                        <Text style={styles.navBadge}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      ) : null}
                    </View>
                    {active ? <NavUnderline /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.right}>
          {showClock ? <Text style={styles.clock}>{clock}</Text> : null}

          <View style={styles.status}>
            <PulseDot />
            {isWide ? <Text style={styles.statusText}>ONLINE</Text> : null}
          </View>

          {isWide ? <Text style={styles.userName}>{name}</Text> : null}

          <Avatar
            name={name}
            size={30}
            testID="nav-avatar"
            url={profile?.avatarUrl}
            accent={profile?.accent}
          />

          {!isWide ? (
            <Pressable
              onPress={() => setMenuOpen((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel="Toggle navigation menu"
              accessibilityState={{ expanded: menuOpen }}
              hitSlop={8}
              style={styles.menuButton}
              testID="nav-menu"
            >
              <MenuGlyph open={menuOpen} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.scanline} />

      <Modal
        visible={!isWide && menuOpen}
        transparent
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
        statusBarTranslucent
      >
        <View style={styles.menuOverlay}>
          <Pressable
            style={styles.menuBackdrop}
            onPress={() => setMenuOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          />
          <Animated.View
            style={[
              styles.mobileMenu,
              {
                top: insets.top + BAR_HEIGHT + 1,
                opacity: menuAnim,
                transform: [{ translateY: menuTranslate }],
              },
            ]}
          >
            <Text style={styles.menuHeading}>NAVIGATION</Text>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.match);
              return (
                <Pressable
                  key={item.href}
                  onPress={() => navigate(item.href)}
                  accessibilityRole="link"
                  accessibilityState={{ selected: active }}
                  style={[styles.mobileItem, active && styles.mobileItemActive]}
                  testID={`nav-mobile-${item.match.replace('/', '')}`}
                >
                  <View
                    style={[
                      styles.mobileBullet,
                      active && styles.mobileBulletActive,
                    ]}
                  />
                  <Text
                    style={[styles.mobileLabel, active && styles.mobileLabelActive]}
                  >
                    {item.label}
                  </Text>
                  {item.match === '/notifications' && unreadCount > 0 ? (
                    <Text style={styles.mobileCount}>{unreadCount}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.panel,
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: BAR_HEIGHT,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  scanline: {
    height: 1,
    backgroundColor: colors.cyan,
    opacity: 0.55,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    flexShrink: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 10,
    height: 10,
    backgroundColor: colors.cyan,
  },
  brandText: {
    justifyContent: 'center',
  },
  brandLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    color: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 3,
  },
  brandCursor: {
    color: colors.cyan,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    marginLeft: 2,
  },
  brandSub: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 1,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  navItem: {
    paddingVertical: spacing.sm,
  },
  navItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navLabel: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 1.5,
  },
  navLabelActive: {
    color: colors.cyan,
  },
  navBadge: {
    color: colors.panel,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    backgroundColor: colors.cyan,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
    borderRadius: radii.sm,
  },
  navUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: colors.cyan,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clock: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  statusRing: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  statusText: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  userName: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    letterSpacing: 0.5,
    maxWidth: 160,
  },
  menuButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.panelLine,
    backgroundColor: colors.panelAlt,
  },
  glyph: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
  },
  glyphBar: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.ink,
  },
  menuOverlay: {
    flex: 1,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 12, 16, 0.5)',
  },
  mobileMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.panelAlt,
    borderTopWidth: 1,
    borderTopColor: colors.cyan,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelLine,
    paddingVertical: spacing.sm,
    maxWidth: 1180,
    alignSelf: 'center',
    width: '100%',
  },
  menuHeading: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  mobileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mobileItemActive: {
    backgroundColor: colors.panel,
  },
  mobileBullet: {
    width: 6,
    height: 6,
    backgroundColor: colors.panelLine,
  },
  mobileBulletActive: {
    backgroundColor: colors.cyan,
  },
  mobileLabel: {
    flex: 1,
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 1.5,
  },
  mobileLabelActive: {
    color: colors.cyan,
  },
  mobileCount: {
    color: colors.panel,
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    backgroundColor: colors.cyan,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    overflow: 'hidden',
    borderRadius: radii.sm,
  },
});
