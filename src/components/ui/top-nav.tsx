import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { BlinkingCursor } from '@/components/blinking-cursor';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/context/auth-context';
import { logOut } from '@/services/auth';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

const NAV_ITEMS = [
  { label: 'SYSTEM', href: '/(app)/home', match: '/home' },
  { label: 'ATTENDANCE', href: '/(app)/calendar', match: '/calendar' },
  { label: 'CLASSMATES', href: '/(app)/members', match: '/members' },
  { label: 'NOTICES', href: '/(app)/announcements', match: '/announcements' },
  { label: 'MESSAGES', href: '/(app)/messages', match: '/messages' },
] as const;

const WIDE_BREAKPOINT = 820;

function formatClock(date: Date): string {
  return date.toTimeString().slice(0, 8);
}

export function TopNav() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  const name = user?.displayName?.trim() || user?.email || 'OPERATOR';

  function isActive(match: string): boolean {
    return pathname === match || pathname.startsWith(`${match}/`);
  }

  function navigate(href: (typeof NAV_ITEMS)[number]['href']) {
    setMenuOpen(false);
    router.push(href);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logOut();
    } finally {
      setSigningOut(false);
      setConfirmSignOut(false);
    }
  }

  return (
    <View style={styles.header} testID="top-nav">
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
                    <Text
                      style={[styles.navLabel, active && styles.navLabelActive]}
                    >
                      {item.label}
                    </Text>
                    {active ? <View style={styles.navUnderline} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.right}>
          <Text style={styles.clock}>{clock}</Text>

          <View style={styles.status}>
            <View style={styles.statusDot} />
            {isWide ? <Text style={styles.statusText}>ONLINE</Text> : null}
          </View>

          {isWide ? <Text style={styles.userName}>{name}</Text> : null}

          <Avatar name={name} size={30} testID="nav-avatar" />

          {isWide ? (
            <Button
              label="SIGN OUT"
              variant="secondary"
              size="sm"
              onPress={() => setConfirmSignOut(true)}
              testID="nav-signout"
            />
          ) : (
            <Pressable
              onPress={() => setMenuOpen((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel="Toggle navigation menu"
              hitSlop={8}
              style={styles.menuButton}
              testID="nav-menu"
            >
              <Text style={styles.menuGlyph}>{menuOpen ? '\u2715' : '\u2630'}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.scanline} />

      {!isWide && menuOpen ? (
        <View style={styles.mobileMenu}>
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
                <Text
                  style={[styles.mobileLabel, active && styles.mobileLabelActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => {
              setMenuOpen(false);
              setConfirmSignOut(true);
            }}
            accessibilityRole="button"
            style={styles.mobileItem}
            testID="nav-mobile-signout"
          >
            <Text style={[styles.mobileLabel, styles.mobileSignOut]}>SIGN OUT</Text>
          </Pressable>
        </View>
      ) : null}

      <ConfirmDialog
        visible={confirmSignOut}
        title="Sign out"
        message="End this session and return to the sign-in screen?"
        confirmLabel="Sign out"
        destructive
        loading={signingOut}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmSignOut(false)}
        testID="confirm-signout"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.panel,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 58,
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
    flex: 1,
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
    alignItems: 'center',
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
  navUnderline: {
    position: 'absolute',
    bottom: -6,
    height: 2,
    width: '100%',
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
  statusDot: {
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
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.panelLine,
  },
  menuGlyph: {
    color: colors.ink,
    fontSize: fontSizes.md,
  },
  mobileMenu: {
    backgroundColor: colors.panelAlt,
    borderTopWidth: 1,
    borderTopColor: colors.panelLine,
  },
  mobileItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mobileItemActive: {
    backgroundColor: colors.panel,
  },
  mobileLabel: {
    color: colors.inkDim,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    letterSpacing: 1.5,
  },
  mobileLabelActive: {
    color: colors.cyan,
  },
  mobileSignOut: {
    color: colors.orange,
  },
});
