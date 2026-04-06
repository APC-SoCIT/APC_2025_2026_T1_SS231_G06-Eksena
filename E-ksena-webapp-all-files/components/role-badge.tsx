import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRoleTheme } from '@/context/role-theme';
import { useAuth } from '@/context/auth';
import { FontSizes, Fonts, Radius, Spacing, TEXT_PRIMARY, BG_SURFACE, BORDER } from '@/constants/theme';

export function RoleBadge() {
  const theme = useRoleTheme();
  const { user } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
    ]).start();
  }, [opacity, scale]);

  // Set the web CSS class for the pulsing glow animation
  useEffect(() => {
    // The pulse animation is handled by CSS class .role-badge-glow
  }, []);

  return (
    <View style={styles.container}>
      {user ? (
        <Text style={styles.username} numberOfLines={1}>
          {user.username}
        </Text>
      ) : null}
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor: theme.badgeBg,
            borderColor: theme.primary,
            opacity,
            transform: [{ scale }],
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 4,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.primary }]} numberOfLines={1}>
          {theme.displayName}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Platform.OS === 'web' ? 16 : 8,
    gap: Spacing.sm,
  },
  username: {
    color: TEXT_PRIMARY,
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body,
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    fontFamily: Fonts.heading,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
