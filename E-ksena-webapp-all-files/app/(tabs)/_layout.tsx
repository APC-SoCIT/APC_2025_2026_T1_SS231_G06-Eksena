import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Animated, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import {
  BG_BASE,
  BG_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BORDER,
  FontSizes,
  Fonts,
} from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useRoleTheme } from '@/context/role-theme';
import { RoleBadge } from '@/components/role-badge';

export default function TabLayout() {
  const { isResponder } = useAuth();
  const theme = useRoleTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.classList.remove('theme-police', 'theme-firefighter', 'theme-medic');
      document.body.classList.add(theme.themeClass);
    }
  }, [theme.themeClass]);

  if (!isResponder) {
    return <Redirect href="/login" />;
  }

  return (
    <Animated.View style={[styles.wrapper, { opacity: fade }]}>
      {/* Role accent stripe at top */}
      <View style={[styles.accentStripe, { backgroundColor: theme.primary }]} />
      <Drawer
        screenOptions={{
          drawerPosition: 'left',
          headerStyle: {
            backgroundColor: BG_SURFACE,
            borderBottomWidth: 1,
            borderBottomColor: BORDER,
          },
          headerTintColor: TEXT_PRIMARY,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: FontSizes.subtitle,
            fontFamily: Fonts.heading,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          },
          headerRight: () => <RoleBadge />,
          drawerActiveTintColor: theme.primary,
          drawerInactiveTintColor: TEXT_SECONDARY,
          drawerLabelStyle: {
            fontSize: FontSizes.body,
            fontWeight: '500',
            fontFamily: Fonts.body,
            letterSpacing: 1,
            textTransform: 'uppercase',
          },
          drawerStyle: {
            backgroundColor: BG_SURFACE,
            borderRightWidth: 1,
            borderRightColor: BORDER,
          },
          drawerItemStyle: {
            borderRadius: 2,
          },
          drawerActiveBackgroundColor: 'rgba(255,107,43,0.08)',
        }}
      >
        <Drawer.Screen name="index" options={{ title: 'Map', drawerLabel: 'Map' }} />
        <Drawer.Screen name="reports" options={{ title: 'Reports', drawerLabel: 'Reports' }} />
        <Drawer.Screen name="explore" options={{ title: 'Messages', drawerLabel: 'Messages' }} />
        <Drawer.Screen name="profile" options={{ title: 'Profile', drawerLabel: 'Profile' }} />
      </Drawer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  accentStripe: {
    height: 3,
    width: '100%',
  },
});
