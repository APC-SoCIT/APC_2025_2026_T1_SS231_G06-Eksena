import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useAuth } from '@/context/auth';
import { useRoleTheme } from '@/context/role-theme';
import { PrimaryButton } from '@/components/primary-button';
import { Spacing, FontSizes, TEXT_PRIMARY, TEXT_SECONDARY, WHITE, OFF_WHITE, BORDER, Radius, CardShadow } from '@/constants/theme';

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
      <Text style={styles.title}>Account</Text>
      <View style={[styles.card, CardShadow]}>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Role</Text>
          <Text style={[styles.value, { color: theme.primary, fontWeight: '600' }]}>{theme.displayName}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={TEXT_SECONDARY}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldRow}>
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
        </View>

        <PrimaryButton title="Save changes" onPress={handleSave} style={styles.saveBtn} />
      </View>
      <PrimaryButton title="Log out" onPress={handleLogout} style={styles.logoutBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: OFF_WHITE,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.md,
    width: '100%',
    maxWidth: 560,
  },
  card: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    width: '100%',
    maxWidth: 560,
  },
  fieldRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    minWidth: Platform.OS === 'web' ? 120 : undefined,
  },
  value: {
    fontSize: FontSizes.body,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    flex: Platform.OS === 'web' ? 1 : undefined,
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
