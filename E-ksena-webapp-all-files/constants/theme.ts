/**
 * E-ksena Dark Tactical Theme
 * Mission-control / emergency-operations-center aesthetic.
 *
 * All visual tokens in ONE file:
 *   Colors · Spacing · Radius · Shadows · Typography · Role themes
 */

import { Platform } from 'react-native';

/* ──────────────────────────── CORE COLORS ──────────────────────────── */

/** Near-black base background */
export const BG_BASE = '#0D0F14';
/** Dark panel / card surface */
export const BG_SURFACE = '#141820';
/** Slightly lighter elevated surface */
export const BG_ELEVATED = '#1A1E28';
/** Input field inset background */
export const BG_INPUT = '#10131A';

/** Primary CTA accent – emergency amber/orange */
export const ACCENT_AMBER = '#FF6B2B';
export const ACCENT_AMBER_HOVER = '#FF8A55';
export const ACCENT_AMBER_SUBTLE = 'rgba(255,107,43,0.10)';

/** Secondary accent – cold steel blue (informational / map) */
export const ACCENT_BLUE = '#4A9EFF';

/** Status colors */
export const STATUS_GREEN = '#00D4AA';
export const STATUS_RED = '#FF3B3B';
export const STATUS_AMBER = '#FFB020';

/** Text */
export const TEXT_PRIMARY = '#E8ECF1';
export const TEXT_SECONDARY = '#6B7A8D';
export const TEXT_MUTED = '#3E4A5A';

/** Borders */
export const BORDER = 'rgba(255,107,43,0.15)';
export const BORDER_SUBTLE = 'rgba(255,255,255,0.06)';

/** Legacy aliases (kept so unchanged imports don't break) */
export const BRAND_RED = ACCENT_AMBER;
export const BRAND_RED_HOVER = ACCENT_AMBER_HOVER;
export const BRAND_RED_SUBTLE = ACCENT_AMBER_SUBTLE;
export const WHITE = TEXT_PRIMARY;          // primary text on dark bg
export const OFF_WHITE = BG_BASE;          // page background

/* ──────────────────────────── SPACING ──────────────────────────── */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/* ──────────────────────────── BORDER RADIUS ──────────────────────────── */

/** Sharp / geometric – tactical feel */
export const Radius = {
  none: 0,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6,
} as const;

/* ──────────────────────────── SHADOWS ──────────────────────────── */

export const CardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  android: { elevation: 6 },
  default: {},
});

/* ──────────────────────────── TYPOGRAPHY ──────────────────────────── */

export const FontSizes = {
  xs: 11,
  sm: 13,
  body: 15,
  subtitle: 17,
  title: 22,
  large: 28,
  display: 36,
} as const;

/**
 * Font families – web uses Google Fonts (Chakra Petch for headings,
 * IBM Plex Mono for body/data).  Native falls back to system fonts.
 */
export const Fonts = Platform.select({
  web: {
    heading: "'Chakra Petch', 'Rajdhani', sans-serif",
    body: "'IBM Plex Mono', 'Fira Code', monospace",
    mono: "'IBM Plex Mono', 'Fira Code', monospace",
  },
  ios: {
    heading: 'system-ui',
    body: 'ui-monospace',
    mono: 'ui-monospace',
  },
  default: {
    heading: 'normal',
    body: 'monospace',
    mono: 'monospace',
  },
})!;

/* ──────────────────────────── ROLE THEMES ──────────────────────────── */

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
    primary: '#4A9EFF',
    primaryHover: '#6DB3FF',
    gradientStart: '#4A9EFF',
    gradientEnd: '#1A3A6B',
    glow: 'rgba(74,158,255,0.35)',
    badgeBg: 'rgba(74,158,255,0.18)',
    displayName: 'Police',
  },
  firefighter: {
    primary: '#FF3B3B',
    primaryHover: '#FF6060',
    gradientStart: '#FF3B3B',
    gradientEnd: '#7A1A1A',
    glow: 'rgba(255,59,59,0.35)',
    badgeBg: 'rgba(255,59,59,0.18)',
    displayName: 'Firefighter',
  },
  medic: {
    primary: '#00D4AA',
    primaryHover: '#33E0BF',
    gradientStart: '#00D4AA',
    gradientEnd: '#0A5244',
    glow: 'rgba(0,212,170,0.35)',
    badgeBg: 'rgba(0,212,170,0.18)',
    displayName: 'Medic',
  },
};

export function getRoleTheme(role: RoleThemeKey | undefined): RoleThemeColors {
  if (role === 'police' || role === 'firefighter' || role === 'medic') {
    return RoleThemes[role];
  }
  return RoleThemes.firefighter;
}

/* ──────────────────────────── COLORS PALETTE (aggregate) ──────────────────────────── */

export const Colors = {
  light: {
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    background: BG_BASE,
    backgroundAlt: BG_SURFACE,
    tint: ACCENT_AMBER,
    border: BORDER,
    icon: TEXT_SECONDARY,
    tabIconDefault: TEXT_SECONDARY,
    tabIconSelected: ACCENT_AMBER,
    button: ACCENT_AMBER,
    buttonHover: ACCENT_AMBER_HOVER,
    cardBg: BG_SURFACE,
    inputBorder: BORDER,
  },
  dark: {
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    background: BG_BASE,
    backgroundAlt: BG_SURFACE,
    tint: ACCENT_AMBER,
    border: BORDER,
    icon: TEXT_SECONDARY,
    tabIconDefault: TEXT_SECONDARY,
    tabIconSelected: ACCENT_AMBER,
    button: ACCENT_AMBER,
    buttonHover: ACCENT_AMBER_HOVER,
    cardBg: BG_SURFACE,
    inputBorder: BORDER,
  },
};
