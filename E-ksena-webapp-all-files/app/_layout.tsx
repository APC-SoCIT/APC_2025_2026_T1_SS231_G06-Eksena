import { Stack, Redirect, usePathname } from 'expo-router';
import { BRAND_RED, WHITE, FontSizes } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth';
import { IncidentStatusProvider } from '@/context/incident-status';
import { RoleThemeProvider, useRoleTheme } from '@/context/role-theme';

function RootStack() {
  const { user } = useAuth();
  const theme = useRoleTheme();
  const headerBg = user ? theme.primary : BRAND_RED;

  const headerOptions = {
    headerStyle: { backgroundColor: headerBg },
    headerTintColor: WHITE,
    headerTitleStyle: { fontWeight: '600' as const, fontSize: FontSizes.subtitle },
  };

  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: 'Responder log in', headerShown: true }} />
      <Stack.Screen name="signup" options={{ title: 'Responder registration', headerShown: true }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Details' }} />
    </Stack>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isResponder } = useAuth();
  const isPublicRoute = pathname === '/' || pathname === '/signup';
  if (!isResponder && !isPublicRoute) {
    return <Redirect href="/" />;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RoleThemeProvider>
        <IncidentStatusProvider>
          <AuthGuard>
            <RootStack />
          </AuthGuard>
        </IncidentStatusProvider>
      </RoleThemeProvider>
    </AuthProvider>
  );
}
