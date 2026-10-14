import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/context/auth-context';
import { logOut } from '@/services/auth';
import { colors, fontSizes, fonts, radii, spacing } from '@/theme';

const NAV_ITEMS = [
  { label: 'System', href: '/(app)/home', match: '/home' },
  { label: 'Attendance', href: '/(app)/calendar', match: '/calendar' },
] as const;

const WIDE_BREAKPOINT = 760;

export function TopNav() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const name = user?.displayName?.trim() || user?.email || 'Operator';

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
            <View>
              <Text style={styles.brand}>NULLSEC</Text>
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
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ONLINE</Text>

          {isWide ? <Text style={styles.userName}>{name}</Text> : null}

          <Avatar name={name} size={32} testID="nav-avatar" />

          {isWide ? (
            <Button
              label="Sign out"
              variant="ghost"
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
            <Text style={[styles.mobileLabel, styles.mobileSignOut]}>Sign out</Text>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 60,
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
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
  },
  brand: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    fontWeight: '700',
    letterSpacing: 2,
  },
  brandSub: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
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
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  navLabelActive: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  navUnderline: {
    position: 'absolute',
    bottom: -6,
    height: 2,
    width: '100%',
    backgroundColor: colors.accent,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.present,
  },
  statusText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  userName: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  menuButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  menuGlyph: {
    color: colors.text,
    fontSize: fontSizes.md,
  },
  mobileMenu: {
    borderTopWidth: 1,
    borderTopColor: colors.borderDim,
    paddingVertical: spacing.xs,
  },
  mobileItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mobileItemActive: {
    backgroundColor: colors.accentSoft,
  },
  mobileLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  mobileLabelActive: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  mobileSignOut: {
    color: colors.danger,
  },
});
