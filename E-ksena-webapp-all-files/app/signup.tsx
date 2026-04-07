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
import { useRouter, Link } from 'expo-router';
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
  ACCENT_AMBER_SUBTLE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER,
  BORDER_SUBTLE,
  RoleThemes,
} from '@/constants/theme';
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
      router.replace('/login?registered=1');
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Amber accent top line */}
          <View style={styles.cardAccent} />

          <Text style={styles.title}>RESPONDER REGISTRATION</Text>
          <Text style={styles.subtitle}>
            Create an account with your personal and contact information.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>● {error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor={TEXT_MUTED}
            autoCapitalize="none"
          />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={TEXT_MUTED}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            placeholderTextColor={TEXT_MUTED}
            secureTextEntry
          />

          <Text style={styles.label}>ROLE</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => {
              const isActive = role === r.key;
              const roleColor = RoleThemes[r.key].primary;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  style={[
                    styles.roleBtn,
                    isActive && {
                      borderColor: roleColor,
                      backgroundColor: `${roleColor}15`,
                    },
                  ]}
                >
                  {/* Small status dot */}
                  <View
                    style={[
                      styles.roleDot,
                      { backgroundColor: isActive ? roleColor : TEXT_MUTED },
                    ]}
                  />
                  <Text
                    style={[
                      styles.roleBtnText,
                      isActive && { color: roleColor, fontWeight: '700' },
                    ]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton title="Save" onPress={handleSignup} style={styles.button} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
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
    backgroundColor: BG_BASE,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
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
  title: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
    marginBottom: Spacing.lg,
    letterSpacing: 0.3,
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
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    backgroundColor: BG_INPUT,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
    letterSpacing: 0.5,
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
    fontFamily: Fonts.body,
  },
  link: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: ACCENT_AMBER,
    fontFamily: Fonts.body,
  },
});
