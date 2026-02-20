import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { PrimaryButton } from '@/components/primary-button';
import { Spacing, FontSizes, BRAND_RED, BRAND_RED_SUBTLE, TEXT_PRIMARY, TEXT_SECONDARY, WHITE, OFF_WHITE, BORDER, Radius, CardShadow } from '@/constants/theme';
import type { RoleThemeKey } from '@/constants/theme';
import { registerUser } from '@/lib/registered-users';

const MIN_PASSWORD_LENGTH = 6;

const ROLES: { key: RoleThemeKey; label: string }[] = [
  { key: 'police', label: 'Police' },
  { key: 'firefighter', label: 'Firefighter' },
  { key: 'medic', label: 'Medic' },
];

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleThemeKey>('firefighter');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async () => {
    setError(null);
    const u = username.trim();
    const e = email.trim();
    const p = password;

    if (!u) {
      setError('Username is required.');
      return;
    }
    if (!e) {
      setError('Email is required.');
      return;
    }
    if (!p) {
      setError('Password is required.');
      return;
    }
    if (p.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    try {
      await registerUser({ email: e, username: u, password: p, role });
      router.replace('/?registered=1');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.card, CardShadow]}>
          <Text style={styles.title}>Responder registration</Text>
          <Text style={styles.subtitle}>Create an account with your personal and contact information.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor={TEXT_SECONDARY}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={TEXT_SECONDARY}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            placeholderTextColor={TEXT_SECONDARY}
            secureTextEntry
          />

          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => setRole(r.key)}
                style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
              >
                <Text style={[styles.roleBtnText, role === r.key && styles.roleBtnTextActive]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton title="Save" onPress={handleSignup} style={styles.button} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.link}>Log in</Text>
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
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
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
  title: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    marginBottom: Spacing.lg,
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
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: BRAND_RED,
    backgroundColor: BRAND_RED_SUBTLE,
  },
  roleBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  roleBtnTextActive: {
    color: BRAND_RED,
    fontWeight: '600',
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
