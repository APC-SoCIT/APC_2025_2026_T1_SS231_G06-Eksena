/**
 * E-ksena theme: red (#e10600) and white only.
 * Flat design, consistent spacing and typography.
 */

import { Platform } from 'react-native';

export const BRAND_RED = '#e10600';
export const BRAND_RED_HOVER = '#c80500';
export const BRAND_RED_SUBTLE = '#fde8e7';
export const WHITE = '#ffffff';
export const OFF_WHITE = '#fafafa';
export const BORDER = '#eee';
export const TEXT_PRIMARY = '#1a1a1a';
export const TEXT_SECONDARY = '#666';

export const Colors = {
  light: {
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    background: WHITE,
    backgroundAlt: OFF_WHITE,
    tint: BRAND_RED,
    border: BORDER,
    icon: TEXT_SECONDARY,
    tabIconDefault: TEXT_SECONDARY,
    tabIconSelected: BRAND_RED,
    button: BRAND_RED,
    buttonHover: BRAND_RED_HOVER,
    cardBg: WHITE,
    inputBorder: BORDER,
  },
  dark: {
    text: WHITE,
    textSecondary: '#aaa',
    background: TEXT_PRIMARY,
    backgroundAlt: '#2a2a2a',
    tint: BRAND_RED,
    border: '#333',
    icon: '#aaa',
    tabIconDefault: '#aaa',
    tabIconSelected: BRAND_RED,
    button: BRAND_RED,
    buttonHover: BRAND_RED_HOVER,
    cardBg: '#2a2a2a',
    inputBorder: '#444',
  },
};

// Consistent spacing (in px)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border radius
export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
};

// Card shadow (iOS + Android elevation; web uses shadowColor/shadowOffset)
export const CardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
  default: {},
});


// Typography
export const FontSizes = {
  xs: 12,
  sm: 14,
  body: 16,
  subtitle: 18,
  title: 22,
  large: 28,
};

// Role-based UI theme. Strictly 3 roles: police (blue), firefighter (red), medic (green).
export type RoleThemeKey = 'police' | 'firefighter' | 'medic';

export type RoleThemeColors = {
  primary: string;
  primaryHover: string;
  gradientStart: string;
  gradientEnd: string;
  glow: string;
  badgeBg: string;
  displayName: string;
};

export const RoleThemes: Record<RoleThemeKey, RoleThemeColors> = {
  police: {
    primary: '#1e40af',
    primaryHover: '#1d4ed8',
    gradientStart: '#3b82f6',
    gradientEnd: '#1e3a8a',
    glow: 'rgba(59, 130, 246, 0.4)',
    badgeBg: 'rgba(30, 64, 175, 0.9)',
    displayName: 'Police',
  },
  firefighter: {
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    gradientStart: '#ef4444',
    gradientEnd: '#991b1b',
    glow: 'rgba(239, 68, 68, 0.4)',
    badgeBg: 'rgba(185, 28, 28, 0.9)',
    displayName: 'Firefighter',
  },
  medic: {
    primary: '#059669',
    primaryHover: '#047857',
    gradientStart: '#10b981',
    gradientEnd: '#065f46',
    glow: 'rgba(16, 185, 129, 0.4)',
    badgeBg: 'rgba(5, 150, 105, 0.9)',
    displayName: 'Medic',
  },
};

export function getRoleTheme(role: RoleThemeKey | undefined): RoleThemeColors {
  if (role === 'police' || role === 'firefighter' || role === 'medic') {
    return RoleThemes[role];
  }
  return RoleThemes.firefighter;
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
