import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import * as Location from 'expo-location';

const containerStyle = {
  width: '100%',
  height: 250,
};

// Coordinates for SM Mall of Asia
const MOA_COORDS = { lat: 14.5351, lng: 120.9820 };

export default function MapDashboard() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyCzcIhAoj9O07jszQt4knTyvb9fcUTAfiI" 
  });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission denied');
        return;
      }

      // Real-time tracking: updates whenever you move
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // update every 10 meters
        },
        (newLocation) => {
          setLocation({
            lat: newLocation.coords.latitude,
            lng: newLocation.coords.longitude
          });
        }
      );
    })();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text>Map Error: {loadError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tracker</Text>
      
      <View style={styles.mapFrame}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            // Centers on your location, or defaults to MOA if GPS isn't ready
            center={location || MOA_COORDS}
            zoom={14}
          >
            {/* Marker for YOU */}
            {location && (
              <Marker 
                position={location} 
                label="You"
                icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
              />
            )}

            {/* Marker for Mall of Asia */}
            <Marker 
              position={MOA_COORDS} 
              label="MOA" 
              title="SM Mall of Asia"
            />
          </GoogleMap>
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
      </View>
      {location && (
        <Text style={styles.coordsText}>
          My Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  mapFrame: {
    height: 250,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
  },
  coordsText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  }
});