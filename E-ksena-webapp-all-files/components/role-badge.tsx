import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRoleTheme } from '@/context/role-theme';
import { FontSizes, Radius } from '@/constants/theme';

export function RoleBadge() {
  const theme = useRoleTheme();
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

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: theme.badgeBg,
          borderColor: theme.primary,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={[styles.glow, { shadowColor: theme.primary }]} />
      <Text style={styles.label} numberOfLines={1}>
        {theme.displayName}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginRight: Platform.OS === 'web' ? 12 : 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    color: '#fff',
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
});
