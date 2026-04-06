import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, Redirect, usePathname } from 'expo-router';
import {
  BG_SURFACE,
  TEXT_PRIMARY,
  FontSizes,
  Fonts,
} from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth';
import { IncidentStatusProvider } from '@/context/incident-status';
import { RoleThemeProvider, useRoleTheme } from '@/context/role-theme';

/* ── Global CSS injected inline on web ─────────────────────── */
const GLOBAL_CSS = `
/* ── Google Fonts ─────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');

/* ── CSS Custom Properties ───────────────────────────────── */
:root {
  --bg-base:      #0D0F14;
  --bg-surface:   #141820;
  --bg-elevated:  #1A1E28;
  --bg-input:     #10131A;
  --accent-amber:       #FF6B2B;
  --accent-amber-hover: #FF8A55;
  --accent-blue:        #4A9EFF;
  --status-green: #00D4AA;
  --status-red:   #FF3B3B;
  --status-amber: #FFB020;
  --text-primary:   #E8ECF1;
  --text-secondary: #6B7A8D;
  --text-muted:     #3E4A5A;
  --border:        rgba(255,107,43,0.15);
  --border-subtle: rgba(255,255,255,0.06);
  --font-heading: 'Chakra Petch', 'Rajdhani', sans-serif;
  --font-body:    'IBM Plex Mono', 'Fira Code', monospace;
  --role-primary: #FF3B3B;
  --role-glow:    rgba(255,59,59,0.35);
}
body.theme-police  { --role-primary: #4A9EFF; --role-glow: rgba(74,158,255,0.35); }
body.theme-firefighter { --role-primary: #FF3B3B; --role-glow: rgba(255,59,59,0.35); }
body.theme-medic   { --role-primary: #00D4AA; --role-glow: rgba(0,212,170,0.35); }

/* ── Global Reset ────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }
html, body, #root {
  margin: 0; padding: 0;
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

/* ── Scrollbar ───────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }

/* ── Keyframe Animations ─────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 4px var(--role-glow); }
  50%      { box-shadow: 0 0 14px var(--role-glow); }
}
@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

/* ── Input Focus ─────────────────────────────────────────── */
input:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-amber) !important;
  box-shadow: 0 0 0 1px var(--accent-amber), 0 0 12px rgba(255,107,43,0.15);
}

/* ── Reduced Motion ──────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

function useGlobalCSS() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const existing = document.getElementById('eksena-global-css');
    if (!existing) {
      const style = document.createElement('style');
      style.id = 'eksena-global-css';
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }

    // Dark background immediately
    document.documentElement.style.backgroundColor = '#0D0F14';
    document.body.style.backgroundColor = '#0D0F14';
    document.body.style.color = '#E8ECF1';
    document.body.style.margin = '0';
  }, []);
}

function RootStack() {
  const { user } = useAuth();
  const theme = useRoleTheme();

  useGlobalCSS();

  const headerOptions = {
    headerStyle: {
      backgroundColor: BG_SURFACE,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,107,43,0.15)',
    },
    headerTintColor: TEXT_PRIMARY,
    headerTitleStyle: {
      fontWeight: '600' as const,
      fontSize: FontSizes.subtitle,
      fontFamily: Fonts.heading,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
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
