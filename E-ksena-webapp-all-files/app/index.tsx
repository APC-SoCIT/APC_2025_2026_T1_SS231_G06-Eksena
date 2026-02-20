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
} from 'react-native';
import { useRouter, Link, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth';
import { PrimaryButton } from '@/components/primary-button';
import {
  Spacing,
  FontSizes,
  BRAND_RED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WHITE,
  BRAND_RED_SUBTLE,
  OFF_WHITE,
  BORDER,
  Radius,
  CardShadow,
} from '@/constants/theme';
import type { RoleThemeKey } from '@/constants/theme';
import { findRegisteredUser } from '@/lib/registered-users';

// Demo accounts for each role (password is same for all)
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

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logoBadge}>
            <Text style={styles.logo}>E-ksena</Text>
          </View>
          <Text style={styles.tagline}>Responder log in</Text>
        </View>

        <View style={[styles.card, CardShadow]}>
          <Text style={styles.cardTitle}>Responder log in</Text>

          {showRegisteredMessage ? (
            <Text style={styles.successText}>Account created. Log in with your email or username and password.</Text>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Email or username</Text>
          <TextInput
            style={styles.input}
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            placeholder="Enter your email or username"
            placeholderTextColor={TEXT_SECONDARY}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={TEXT_SECONDARY}
            secureTextEntry
          />

          <View style={styles.demoBox}>
            <Text style={styles.demoLabel}>Demo or your registered account</Text>
            <Text style={styles.demoText}>
              Demo: <Text style={styles.demoValue}>police</Text> / <Text style={styles.demoValue}>firefighter</Text> / <Text style={styles.demoValue}>medic</Text> — password: demo123
            </Text>
            <Text style={styles.demoText}>
              Or log in with the email/username and password you used when you registered.
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl * 2,
    paddingBottom: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: BRAND_RED_SUBTLE,
    borderWidth: 1,
    borderColor: BRAND_RED,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: BRAND_RED,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSizes.body,
    color: TEXT_SECONDARY,
    marginTop: Spacing.md,
  },
  card: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: FontSizes.title,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.lg,
  },
  successText: {
    fontSize: FontSizes.sm,
    color: '#059669',
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: BRAND_RED,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.body,
    color: TEXT_PRIMARY,
    backgroundColor: WHITE,
    marginBottom: Spacing.md,
  },
  demoBox: {
    backgroundColor: BRAND_RED_SUBTLE,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: BRAND_RED,
  },
  demoLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.xs,
  },
  demoText: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },
  demoValue: {
    fontWeight: '600',
    color: BRAND_RED,
  },
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
  },
  link: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: BRAND_RED,
  },
});
