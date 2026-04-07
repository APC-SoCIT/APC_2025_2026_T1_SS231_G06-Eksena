import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useRouter, Link, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth';
import { PrimaryButton } from '@/components/primary-button';
import {
  Spacing,
  FontSizes,
  Fonts,
  Radius,
  BG_BASE,
  BG_SURFACE,
  BG_INPUT,
  ACCENT_AMBER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER,
  BORDER_SUBTLE,
  STATUS_GREEN,
} from '@/constants/theme';
import type { RoleThemeKey } from '@/constants/theme';
import { findRegisteredUser } from '@/lib/registered-users';

const DEMO_ACCOUNTS: { username: string; password: string; role: RoleThemeKey }[] = [
  { username: 'police', password: 'demo123', role: 'police' },
  { username: 'firefighter', password: 'demo123', role: 'firefighter' },
  { username: 'medic', password: 'demo123', role: 'medic' },
];

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const showRegisteredMessage = registered === '1';
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 800;

  const handleLogin = async () => {
    setError(null);
    if (!emailOrUsername.trim() || !password.trim()) {
      setError('Please enter your email or username and password.');
      return;
    }
    const input = emailOrUsername.trim();
    const p = password.trim();

    const demoMatch = DEMO_ACCOUNTS.find(
      (acc) => acc.username === input.toLowerCase() && acc.password === p
    );
    if (demoMatch) {
      login({ role: demoMatch.role, username: demoMatch.username });
      router.replace('/(tabs)');
      return;
    }

    const registered = await findRegisteredUser(input, p);
    if (registered) {
      login({
        role: registered.role,
        username: registered.username,
        email: registered.email,
      });
      router.replace('/(tabs)');
      return;
    }

    setError('Incorrect email/username or password.');
  };

  /* ── Left branding panel (desktop only) ─────────────────── */
  const brandingPanel = isWide ? (
    <View style={styles.brandPanel}>
      {/* Grid pattern overlay */}
      <View style={styles.gridOverlay} />
      {/* Scanline texture */}
      <View style={styles.scanlineOverlay} />
      <View style={styles.brandContent}>
        <Text style={styles.brandLogo}>E-KSENA</Text>
        <View style={styles.brandDivider} />
        <Text style={styles.brandSubtitle}>EMERGENCY DISPATCH</Text>
        <Text style={styles.brandTagline}>COORDINATION PLATFORM</Text>
      </View>
      {/* Decorative corner brackets */}
      <View style={styles.cornerTL} />
      <View style={styles.cornerBR} />
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={isWide ? styles.splitContainer : styles.stackContainer}>
        {brandingPanel}
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            isWide && styles.scrollWide,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mobile logo */}
          {!isWide && (
            <View style={styles.mobileHero}>
              <Text style={styles.mobileLogo}>E-KSENA</Text>
              <Text style={styles.mobileTagline}>EMERGENCY DISPATCH</Text>
            </View>
          )}

          <View style={styles.card}>
            {/* Amber accent line at top of card */}
            <View style={styles.cardAccent} />

            <Text style={styles.cardTitle}>RESPONDER LOG IN</Text>

            {showRegisteredMessage ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  ● Account created. Log in with your credentials.
                </Text>
              </View>
            ) : null}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>● {error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>EMAIL OR USERNAME</Text>
            <TextInput
              style={styles.input}
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              placeholder="Enter your email or username"
              placeholderTextColor={TEXT_MUTED}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry
            />

            {/* Demo credentials – terminal style */}
            <View style={styles.demoBox}>
              <Text style={styles.demoLabel}>DEMO ACCOUNTS</Text>
              <Text style={styles.demoText}>
                <Text style={styles.demoKey}>user:</Text>{' '}
                <Text style={styles.demoValue}>police</Text>
                {' | '}
                <Text style={styles.demoValue}>firefighter</Text>
                {' | '}
                <Text style={styles.demoValue}>medic</Text>
              </Text>
              <Text style={styles.demoText}>
                <Text style={styles.demoKey}>pass:</Text>{' '}
                <Text style={styles.demoValue}>demo123</Text>
              </Text>
              <Text style={[styles.demoText, { marginTop: 6 }]}>
                <Text style={styles.demoKey}>Or use your registered account</Text>
              </Text>
            </View>

            <PrimaryButton title="Log in" onPress={handleLogin} style={styles.button} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Link href="/signup" asChild>
                <Pressable hitSlop={8}>
                  <Text style={styles.link}>Registration</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG_BASE,
  },

  /* ── Split layout (desktop) ────────────────────────────── */
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  stackContainer: {
    flex: 1,
  },

  /* ── Branding Panel (left side, desktop) ───────────────── */
  brandPanel: {
    flex: 1,
    backgroundColor: BG_SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Simulated grid pattern via borders
    borderWidth: 0,
    opacity: 0.4,
    backgroundColor: 'transparent',
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  brandContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  brandLogo: {
    fontSize: 52,
    fontWeight: '700',
    color: ACCENT_AMBER,
    fontFamily: Fonts.heading,
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  brandDivider: {
    width: 60,
    height: 2,
    backgroundColor: ACCENT_AMBER,
    marginVertical: Spacing.lg,
    opacity: 0.6,
  },
  brandSubtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  brandTagline: {
    fontSize: FontSizes.xs,
    color: TEXT_MUTED,
    fontFamily: Fonts.body,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: Spacing.xs,
  },
  cornerTL: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 32,
    height: 32,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: ACCENT_AMBER,
    opacity: 0.3,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 32,
    height: 32,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: ACCENT_AMBER,
    opacity: 0.3,
  },

  /* ── Scroll / Form panel ───────────────────────────────── */
  scroll: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl * 2,
    paddingBottom: Spacing.xl,
    justifyContent: 'center',
  },
  scrollWide: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  /* ── Mobile logo ───────────────────────────────────────── */
  mobileHero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  mobileLogo: {
    fontSize: 32,
    fontWeight: '700',
    color: ACCENT_AMBER,
    fontFamily: Fonts.heading,
    letterSpacing: 6,
  },
  mobileTagline: {
    fontSize: FontSizes.xs,
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
    letterSpacing: 3,
    marginTop: Spacing.sm,
  },

  /* ── Card ───────────────────────────────────────────────── */
  card: {
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.sm,
    padding: Spacing.xl,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: ACCENT_AMBER,
  },
  cardTitle: {
    fontSize: FontSizes.title,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },

  /* ── Messages ──────────────────────────────────────────── */
  successBox: {
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: FontSizes.sm,
    color: STATUS_GREEN,
    fontFamily: Fonts.body,
  },
  errorBox: {
    backgroundColor: 'rgba(255,59,59,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,59,0.25)',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: '#FF3B3B',
    fontFamily: Fonts.body,
  },

  /* ── Form Fields ───────────────────────────────────────── */
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    borderBottomColor: BORDER,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.body,
    color: TEXT_PRIMARY,
    backgroundColor: BG_INPUT,
    fontFamily: Fonts.body,
    marginBottom: Spacing.md,
  },

  /* ── Demo Box (terminal style) ─────────────────────────── */
  demoBox: {
    backgroundColor: BG_INPUT,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_AMBER,
  },
  demoLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: TEXT_MUTED,
    fontFamily: Fonts.body,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  demoText: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  demoKey: {
    color: TEXT_MUTED,
  },
  demoValue: {
    fontWeight: '600',
    color: ACCENT_AMBER,
  },

  /* ── Button & Footer ───────────────────────────────────── */
  button: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
  },
  link: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: ACCENT_AMBER,
    fontFamily: Fonts.body,
  },
});
