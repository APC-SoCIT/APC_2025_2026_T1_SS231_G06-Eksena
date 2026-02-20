import { useState, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import * as Location from 'expo-location';
import {
  Spacing,
  FontSizes,
  BRAND_RED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WHITE,
  OFF_WHITE,
  BRAND_RED_SUBTLE,
  BORDER,
  Radius,
  CardShadow,
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
        <Text style={styles.errorText}>Map Error: {loadError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incidents & your location</Text>
      <Text style={styles.subtitle}>Your position and nearby incidents on the map</Text>

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
          <ActivityIndicator size="large" color={BRAND_RED} />
        )}
      </View>

      {location && (
        <View style={[styles.coordsCard, CardShadow]}>
          <Text style={styles.coordsText}>
            Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: OFF_WHITE,
  },
  title: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    marginBottom: Spacing.md,
  },
  mapFrame: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    minHeight: 300,
    backgroundColor: WHITE,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_RED_SUBTLE,
    margin: Spacing.md,
    borderRadius: Radius.lg,
  },
  errorText: {
    fontSize: FontSizes.body,
    color: BRAND_RED,
    padding: Spacing.md,
    textAlign: 'center',
  },
  coordsCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.lg,
  },
  coordsText: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
});

