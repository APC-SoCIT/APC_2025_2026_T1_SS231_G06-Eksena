import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { MapPin, MessageSquare, Video } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Polyline } from 'react-native-maps';
import { consumePendingResponderRoute } from '../../services/ReportService';
import { MainStackParamList } from '../../navigation/MainStack';
import { sendSMSReport, initializeReportService } from '../../services/ReportService';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { state, setLocation } = useAuth();
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [responderPosition, setResponderPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Consume pending responder route if any when landing on Home
  useEffect(() => {
    const payload = consumePendingResponderRoute();
    if (payload && payload.userLocation && payload.responderStart) {
      setActiveIncidentId(payload.incidentId);
      setResponderPosition(payload.responderStart);

      // Simulate responder movement towards user
      let tick = 0;
      const steps = 60; // ~60 ticks
      const interval = setInterval(() => {
        tick++;
        setResponderPosition(prev => {
          if (!prev) return prev;
          const { latitude: ulat, longitude: ulng } = payload.userLocation;
          const dlat = (ulat - prev.latitude) / (steps - tick + 1);
          const dlng = (ulng - prev.longitude) / (steps - tick + 1);
          return { latitude: prev.latitude + dlat, longitude: prev.longitude + dlng };
        });
        if (tick >= steps) clearInterval(interval);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        setLocationPermission(false);
        setIsLoadingLocation(false);
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use emergency features.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsLoadingLocation(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addressResponse[0] 
        ? `${addressResponse[0].street || ''} ${addressResponse[0].city || ''} ${addressResponse[0].region || ''}`.trim()
        : 'Unknown Location';

      setLocation(latitude, longitude, address);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleEmergencyReport = () => {
    navigation.navigate('Video' as any);
  };

  const handleSMSFallback = async () => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('SMS Not Available', 'SMS is not available on this device.');
        return;
      }

      const { latitude, longitude, address } = state.location;
      
      if (latitude && longitude) {
        // Initialize ReportService with auth token if available
        if (state.auth.token) {
          initializeReportService(state.auth.token);
        }
        
        const locationText = address || `${latitude}, ${longitude}`;
        const message = `EMERGENCY: I need help at ${locationText}. Please send assistance immediately.`;

        // Send SMS via device
        await SMS.sendSMSAsync(['0123456789'], message);
        
        // Also send report to backend
        const result = await sendSMSReport(message, { latitude, longitude, address });
        
        if (result.success) {
          Alert.alert('SMS Sent', 'Emergency SMS has been sent to emergency services and logged in the system.');
        } else {
          Alert.alert('SMS Sent', 'Emergency SMS has been sent to emergency services, but failed to log in system.');
        }
      } else {
        Alert.alert('Location Error', 'Unable to get your location. Please try again.');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      Alert.alert('SMS Error', 'Failed to send emergency SMS. Please try again.');
    }
  };

  

  const { latitude, longitude, address } = state.location;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {state.auth.user?.name}</Text>
        <Text style={styles.subtitle}>Emergency Response System</Text>
      </View>

      <View style={styles.mapContainer}>
        {locationPermission && latitude && longitude ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              title="Your Location"
              description={address || 'Current Location'}
            />

            {responderPosition && (
              <>
                <Marker
                  coordinate={responderPosition}
                  title={activeIncidentId ? `Responder (Incident ${activeIncidentId})` : 'Responder'}
                  description={'En route to your location'}
                  pinColor="#2563eb"
                />
                <Polyline
                  coordinates={[responderPosition, { latitude, longitude }]}
                  strokeColor="#2563eb"
                  strokeWidth={4}
                />
              </>
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color="#9ca3af" />
            <Text style={styles.mapPlaceholderText}>
              {isLoadingLocation ? 'Loading location...' : 'Location not available'}
            </Text>
            {!locationPermission && (
              <TouchableOpacity style={styles.enableLocationButton} onPress={requestLocationPermission}>
                <Text style={styles.enableLocationText}>Enable Location</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Location Info */}
        {latitude && longitude && (
          <View style={styles.locationInfo}>
            <MapPin size={16} color="#dc2626" />
            <Text style={styles.locationText}>
              {address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
            </Text>
          </View>
        )}
      </View>

      {/* Emergency Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyReport}>
          <Video size={24} color="#ffffff" />
          <Text style={styles.emergencyButtonText}>Press to Send Report</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleSMSFallback}>
            <MessageSquare size={20} color="#dc2626" />
            <Text style={styles.quickActionText}>SMS</Text>
          </TouchableOpacity>

          {/* Call action removed per request */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  enableLocationButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  enableLocationText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  locationInfo: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 6,
    flex: 1,
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  quickActionText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default HomeScreen;

