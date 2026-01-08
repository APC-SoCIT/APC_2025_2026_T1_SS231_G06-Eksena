import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

// We only import the native library if we are NOT on the web
let MapView: any, Marker: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} else {
  // For web, we use the Google Maps JS library
  const WebMaps = require('@react-google-maps/api');
  MapView = WebMaps.GoogleMap;
  Marker = WebMaps.Marker;
}

const containerStyle = { width: '100%', height: '100%' };
const center = { lat: 14.676, lng: 121.043 }; // Default to Quezon City

export default function MapsScreen() {
  if (Platform.OS === 'web') {
    const { useJsApiLoader } = require('@react-google-maps/api');
    const { isLoaded } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: "YOUR_API_KEY_HERE" // Put your key here directly for web testing
    });

    return isLoaded ? (
      <MapView mapContainerStyle={containerStyle} center={center} zoom={13}>
        <Marker position={center} />
      </MapView>
    ) : <View />;
  }

  // Native Mobile Rendering
  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={{
          latitude: 14.676,
          longitude: 121.043,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});