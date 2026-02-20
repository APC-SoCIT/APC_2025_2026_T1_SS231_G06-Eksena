import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { StyleSheet, Animated } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { WHITE, TEXT_SECONDARY, FontSizes } from '@/constants/theme';
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
    return null;
  }

  return (
    <Animated.View style={[styles.wrapper, { opacity: fade }]}>
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Drawer
        screenOptions={{
          drawerPosition: 'left',
          headerStyle: {
            backgroundColor: theme.primary,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.2)',
          },
          headerTintColor: WHITE,
          headerTitleStyle: { fontWeight: '600', fontSize: FontSizes.subtitle },
          headerRight: () => <RoleBadge />,
          drawerActiveTintColor: theme.primary,
          drawerInactiveTintColor: TEXT_SECONDARY,
          drawerLabelStyle: { fontSize: FontSizes.body, fontWeight: '500' },
          drawerStyle: { backgroundColor: 'rgba(255,255,255,0.95)' },
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
  },
});
