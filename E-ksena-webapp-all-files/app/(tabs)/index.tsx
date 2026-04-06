import { useState, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import * as Location from 'expo-location';
import {
  Spacing,
  FontSizes,
  Fonts,
  Radius,
  BG_BASE,
  BG_SURFACE,
  BG_INPUT,
  ACCENT_AMBER,
  ACCENT_BLUE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER,
  BORDER_SUBTLE,
  STATUS_GREEN,
} from '@/constants/theme';

const MOA_COORDS = { lat: 14.5351, lng: 120.9820 };

export default function MapScreen() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const mapHeight = Platform.OS === 'web' ? 520 : 300;
  const containerStyle = useMemo(() => ({ width: '100%', height: mapHeight }), [mapHeight]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCzcIhAoj9O07jszQt4knTyvb9fcUTAfiI',
  });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        if (Platform.OS === 'web') {
          const updateLocation = async () => {
            if (cancelled) return;
            try {
              const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              if (!cancelled) {
                setLocation({
                  lat: loc.coords.latitude,
                  lng: loc.coords.longitude,
                });
              }
            } catch {
              // ignore single failure
            }
          };
          await updateLocation();
          intervalId = setInterval(updateLocation, 10000);
        } else {
          subscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10 },
            (newLocation) => {
              if (!cancelled) {
                setLocation({
                  lat: newLocation.coords.latitude,
                  lng: newLocation.coords.longitude,
                });
              }
            }
          );
        }
      } catch {
        // permissions or location error
      }
    })();

    return () => {
      cancelled = true;
      if (intervalId != null) clearInterval(intervalId);
      if (subscription != null) {
        try {
          if (typeof (subscription as { remove?: () => void }).remove === 'function') {
            (subscription as { remove: () => void }).remove();
          }
        } catch {
          // avoid LocationEventEmitter.removeSubscription errors on unmount (e.g. logout)
        }
      }
    };
  }, []);

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠</Text>
        <Text style={styles.errorText}>MAP SYSTEM ERROR</Text>
        <Text style={styles.errorDetail}>{loadError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Page header */}
      <Text style={styles.title}>INCIDENTS & YOUR LOCATION</Text>
      <Text style={styles.subtitle}>Real-time position tracking and nearby incident markers</Text>

      {/* Tactical HUD Frame */}
      <View style={styles.hudOuter}>
        {/* Corner brackets */}
        <View style={[styles.cornerBracket, styles.cornerTL]} />
        <View style={[styles.cornerBracket, styles.cornerTR]} />
        <View style={[styles.cornerBracket, styles.cornerBL]} />
        <View style={[styles.cornerBracket, styles.cornerBR]} />

        {/* Status bar top */}
        <View style={styles.hudStatusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.hudStatusText}>LIVE FEED</Text>
          <Text style={styles.hudStatusRight}>
            {location ? 'GPS LOCKED' : 'ACQUIRING...'}
          </Text>
        </View>

        {/* Map container */}
        <View style={[styles.mapFrame, { height: mapHeight }]}>
          {isLoaded ? (
            <GoogleMap mapContainerStyle={containerStyle} center={location || MOA_COORDS} zoom={14}>
              {location && (
                <Marker
                  position={location}
                  label="You"
                  icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                />
              )}
              <Marker position={MOA_COORDS} label="MOA" title="SM Mall of Asia" />
            </GoogleMap>
          ) : (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={ACCENT_AMBER} />
              <Text style={styles.loaderText}>INITIALIZING MAP...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Coordinate readout – terminal style */}
      <View style={styles.coordsCard}>
        <View style={styles.coordsAccent} />
        <View style={styles.coordsHeader}>
          <Text style={styles.coordsLabel}>COORDINATE READOUT</Text>
          <View style={[styles.statusIndicator, { backgroundColor: location ? STATUS_GREEN : TEXT_MUTED }]} />
        </View>
        {location ? (
          <View style={styles.coordsBody}>
            <Text style={styles.coordsLine}>
              <Text style={styles.coordsKey}>LAT  </Text>
              <Text style={styles.coordsValue}>{location.lat.toFixed(6)}</Text>
            </Text>
            <Text style={styles.coordsLine}>
              <Text style={styles.coordsKey}>LNG  </Text>
              <Text style={styles.coordsValue}>{location.lng.toFixed(6)}</Text>
            </Text>
            <Text style={styles.coordsDMS}>
              {toDMS(location.lat, 'lat')} · {toDMS(location.lng, 'lng')}
            </Text>
          </View>
        ) : (
          <Text style={styles.coordsWaiting}>Awaiting GPS signal...</Text>
        )}
      </View>
    </View>
  );
}

/** Convert decimal degrees to DMS string */
function toDMS(dd: number, type: 'lat' | 'lng'): string {
  const dir = type === 'lat' ? (dd >= 0 ? 'N' : 'S') : dd >= 0 ? 'E' : 'W';
  const abs = Math.abs(dd);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d - m / 60) * 3600).toFixed(1);
  return `${d}°${m}'${s}"${dir}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: BG_BASE,
  },

  /* ── Header ────────────────────────────────────────────── */
  title: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
    marginBottom: Spacing.md,
    letterSpacing: 0.3,
  },

  /* ── HUD Frame ─────────────────────────────────────────── */
  hudOuter: {
    position: 'relative',
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  cornerBracket: {
    position: 'absolute',
    width: 20,
    height: 20,
    zIndex: 5,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: ACCENT_AMBER,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: ACCENT_AMBER,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: ACCENT_AMBER,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: ACCENT_AMBER,
  },

  /* HUD top status bar */
  hudStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: BG_INPUT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_SUBTLE,
    zIndex: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: STATUS_GREEN,
    marginRight: Spacing.sm,
  },
  hudStatusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: STATUS_GREEN,
    fontFamily: Fonts.body,
    letterSpacing: 1.5,
    flex: 1,
  },
  hudStatusRight: {
    fontSize: FontSizes.xs,
    color: TEXT_MUTED,
    fontFamily: Fonts.body,
    letterSpacing: 1,
  },

  /* Map itself */
  mapFrame: {
    minHeight: 300,
    overflow: 'hidden',
  },
  loaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_INPUT,
    gap: Spacing.md,
  },
  loaderText: {
    fontSize: FontSizes.xs,
    color: TEXT_MUTED,
    fontFamily: Fonts.body,
    letterSpacing: 1.5,
  },

  /* ── Error ─────────────────────────────────────────────── */
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_BASE,
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: 32,
    color: '#FF3B3B',
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.subtitle,
    fontWeight: '700',
    color: '#FF3B3B',
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  errorDetail: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
    textAlign: 'center',
  },

  /* ── Coordinate Readout ────────────────────────────────── */
  coordsCard: {
    marginTop: Spacing.lg,
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  coordsAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: ACCENT_BLUE,
  },
  coordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md + 2,
    paddingBottom: Spacing.sm,
  },
  coordsLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: ACCENT_BLUE,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  coordsBody: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  coordsLine: {
    fontSize: FontSizes.body,
    marginBottom: Spacing.xs,
  },
  coordsKey: {
    color: TEXT_MUTED,
    fontFamily: Fonts.mono,
    fontWeight: '500',
    letterSpacing: 1,
  },
  coordsValue: {
    color: STATUS_GREEN,
    fontFamily: Fonts.mono,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  coordsDMS: {
    fontSize: FontSizes.xs,
    color: TEXT_SECONDARY,
    fontFamily: Fonts.mono,
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  coordsWaiting: {
    fontSize: FontSizes.sm,
    color: TEXT_MUTED,
    fontFamily: Fonts.body,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
});
