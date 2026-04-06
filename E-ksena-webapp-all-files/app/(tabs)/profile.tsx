import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useAuth } from '@/context/auth';
import { useRoleTheme } from '@/context/role-theme';
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
} from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const theme = useRoleTheme();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  useEffect(() => {
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
  }, [user?.username, user?.email]);

  const handleSave = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }
    updateProfile({ username: username.trim(), email: email.trim() || undefined });
    Alert.alert('Saved', 'Your account has been updated.');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>ACCOUNT</Text>

      <View style={styles.card}>
        {/* Role-colored accent line */}
        <View style={[styles.cardAccent, { backgroundColor: theme.primary }]} />

        {/* Role badge row */}
        <View style={styles.fieldRow}>
          <Text style={styles.label}>ROLE</Text>
          <View style={styles.roleValueRow}>
            <View style={[styles.roleDot, { backgroundColor: theme.primary, shadowColor: theme.primary }]} />
            <Text
              style={[
                styles.roleValue,
                {
                  color: theme.primary,
                },
              ]}
            >
              {theme.displayName}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Username */}
        <View style={styles.fieldRow}>
          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={TEXT_MUTED}
            autoCapitalize="none"
          />
        </View>

        {/* Email */}
        <View style={styles.fieldRow}>
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
        </View>

        <PrimaryButton title="Save changes" onPress={handleSave} style={styles.saveBtn} />
      </View>

      {/* Logout – ghost/outline destructive style */}
      <PrimaryButton
        title="Log out"
        onPress={handleLogout}
        ghost
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: BG_BASE,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    marginBottom: Spacing.md,
    width: '100%',
    maxWidth: 560,
  },
  card: {
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    paddingTop: Spacing.lg + 2,
    marginBottom: Spacing.lg,
    width: '100%',
    maxWidth: 560,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  fieldRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    minWidth: Platform.OS === 'web' ? 120 : undefined,
  },
  roleValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  roleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
  roleValue: {
    fontSize: FontSizes.body,
    fontWeight: '700',
    fontFamily: Fonts.heading,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_SUBTLE,
    marginVertical: Spacing.md,
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
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
  logoutBtn: {
    width: '100%',
    maxWidth: 560,
  },
});
