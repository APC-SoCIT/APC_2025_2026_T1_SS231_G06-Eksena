import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxGL from '@rnmapbox/maps';
import '../../services/mapbox';
import { Phone, MessageSquare, Video, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { consumePendingResponderRoute } from '../../services/ReportService';
import { getDirections } from '../../services/mapbox';

const { width, height } = Dimensions.get('window');

interface ResponderData {
  incidentId: string;
  userLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  responderLocation: {
    latitude: number;
    longitude: number;
  };
  responderBase?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string | null;
  };
  dispatcherName: string;
  dispatcherPhone?: string | null;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state, pendingResponderRoute } = useAuth();
  console.log('[HomeScreen] Rendered with pendingResponderRoute:', pendingResponderRoute);
  const [responderData, setResponderData] = useState<ResponderData | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: state.location.latitude || 14.5310248,
    longitude: state.location.longitude || 121.0215128,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [distance, setDistance] = useState<number>(0);
  const [eta, setETA] = useState<string>('--');

  // When responder route arrives from context (via AuthContext subscription), show it
  useEffect(() => {
    if (pendingResponderRoute) {
      console.log('[HomeScreen] Responder route received from context:', pendingResponderRoute);
      setResponderData({
        incidentId: pendingResponderRoute.incidentId,
        userLocation: pendingResponderRoute.userLocation,
        responderLocation: pendingResponderRoute.responderStart,
        responderBase: pendingResponderRoute.responderBase,
        dispatcherName: pendingResponderRoute.dispatcherName || 'Emergency Responder',
        dispatcherPhone: pendingResponderRoute.dispatcherPhone,
      });
    }
  }, [pendingResponderRoute]);

  // Check for pending responder route on mount (from previous session)
  useEffect(() => {
    const checkPendingRoute = () => {
      const pending = consumePendingResponderRoute();
      if (pending) {
        console.log('[HomeScreen] Found pending responder route on mount:', pending);
        setResponderData({
          incidentId: pending.incidentId,
          userLocation: pending.userLocation,
          responderLocation: pending.responderStart,
          responderBase: pending.responderBase,
          dispatcherName: pending.dispatcherName || 'Emergency Responder',
          dispatcherPhone: pending.dispatcherPhone,
        });
      }
    };

    checkPendingRoute();

    // Set up navigation listener for when screen comes into focus
    const unsubscribe = (navigation as any).addListener('focus', () => checkPendingRoute());
    return () => unsubscribe?.();
  }, [navigation]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update map and distance/ETA when responder data arrives
  useEffect(() => {
    if (responderData) {
      const distKm = calculateDistance(
        responderData.userLocation.latitude,
        responderData.userLocation.longitude,
        responderData.responderLocation.latitude,
        responderData.responderLocation.longitude
      );
      setDistance(distKm);

      const avgSpeed = 40;
      const etaMinutes = Math.round((distKm / avgSpeed) * 60);
      setETA(etaMinutes > 0 ? `${etaMinutes} min` : 'Arriving soon');

      // Fit map to show both markers
      const minLat = Math.min(
        responderData.userLocation.latitude,
        responderData.responderLocation.latitude
      );
      const maxLat = Math.max(
        responderData.userLocation.latitude,
        responderData.responderLocation.latitude
      );
      const minLng = Math.min(
        responderData.userLocation.longitude,
        responderData.responderLocation.longitude
      );
      const maxLng = Math.max(
        responderData.userLocation.longitude,
        responderData.responderLocation.longitude
      );

      const latitude = (minLat + maxLat) / 2;
      const longitude = (minLng + maxLng) / 2;
      const latitudeDelta = maxLat - minLat + 0.02;
      const longitudeDelta = maxLng - minLng + 0.02;

      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: Math.max(latitudeDelta, 0.05),
        longitudeDelta: Math.max(longitudeDelta, 0.05),
      });
    } else {
      // Default view: centered on user location
      setMapRegion({
        latitude: state.location.latitude || 14.5310248,
        longitude: state.location.longitude || 121.0215128,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [responderData, state.location]);

  useEffect(() => {
    const unsubscribe = (navigation as any).addListener?.('focus', () => {
      const pending = consumePendingResponderRoute();
      if (pending) {
        console.log('[HomeScreen] Focus listener - found pending responder route:', pending);
        setResponderData({
          incidentId: pending.incidentId,
          userLocation: pending.userLocation,
          responderLocation: pending.responderStart,
          responderBase: pending.responderBase,
          dispatcherName: pending.dispatcherName || 'Emergency Responder',
          dispatcherPhone: pending.dispatcherPhone,
        });
      }
    });
    return () => unsubscribe?.();
  }, [navigation]);

  const handleEmergencyReport = () => {
    (navigation as any).navigate('Video');
  };

  const handleCallResponder = () => {
    if (responderData?.dispatcherPhone) {
      Alert.alert(
        'Call Dispatcher',
        `Call ${responderData.dispatcherName} at ${responderData.dispatcherPhone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              Alert.alert('Info', 'Calling integration would be implemented here');
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map */}
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          centerCoordinate={[mapRegion.longitude, mapRegion.latitude]}
          zoomLevel={12}
        {/* User Location Marker */}
            <MapboxGL.ShapeSource
              id="route-line"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates || [
                    [
                      responderData.userLocation.longitude,
                      responderData.userLocation.latitude,
                    ],
                    [
                      responderData.responderLocation.longitude,
                      responderData.responderLocation.latitude,
                    ],
                  ],
                },
                properties: {},
              }}
            >
              <MapboxGL.LineLayer
                id="route-layer"
                style={{ lineColor: '#3b82f6', lineWidth: 3 }}
              />
            </MapboxGL.ShapeSource>
          </>
        )}
        <MapboxGL.PointAnnotation
          id="user-location"
          coordinate={[
            responderData?.userLocation.longitude || state.location.longitude || 121.0215128,
            responderData?.userLocation.latitude || state.location.latitude || 14.5310248,
          ]}
        >
          <View style={{ backgroundColor: '#3b82f6', borderRadius: 8, padding: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
          </View>
        </MapboxGL.PointAnnotation>

        {/* Responder + route */}
        {responderData && (
          <>
            <MapboxGL.PointAnnotation
              id="responder-location"
              coordinate={[
                responderData.responderLocation.longitude,
                responderData.responderLocation.latitude,
              ]}
            >
              <View style={{ backgroundColor: '#ef4444', borderRadius: 8, padding: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
              </View>
            </MapboxGL.PointAnnotation>

            {responderData.responderBase && (
              <MapboxGL.PointAnnotation
                id="responder-base"
                coordinate={[
                  responderData.responderBase.longitude,
                  responderData.responderBase.latitude,
                ]}
              >
                <View style={{ backgroundColor: '#fbbf24', borderRadius: 8, padding: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                </View>
              </MapboxGL.PointAnnotation>
            )}

            <MapboxGL.ShapeSource
              id="route-line"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [
                      responderData.userLocation.longitude,
                      responderData.userLocation.latitude,
                    ],
                    [
                      responderData.responderLocation.longitude,
                      responderData.responderLocation.latitude,
                    ],
                  ],
                },
                properties: {},
              }}
            >
              <MapboxGL.LineLayer
                id="route-layer"
                style={{ lineColor: '#3b82f6', lineWidth: 3 }}
              />
            </MapboxGL.ShapeSource>
          </>
        )}
      </MapboxGL.MapView>

      {/* Overlay Controls */}
      <View style={styles.controlsOverlay}>
        {/* Emergency Recording Button (always visible) */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyReport}>
          <Video size={24} color="#ffffff" />
          <Text style={styles.emergencyButtonText}>Send Emergency Report</Text>
        </TouchableOpacity>

        {/* Responder Info Panel (when incident active) */}
        {responderData && (
          <View style={styles.responderPanel}>
            <View style={styles.responderHeader}>
              <View>
                <Text style={styles.responderName}>{responderData.dispatcherName}</Text>
                <Text style={styles.incidentId}>Incident #{responderData.incidentId.substring(0, 8)}</Text>
              </View>
            </View>

            <View style={styles.distanceRow}>
              <View style={styles.distanceItem}>
                <Text style={styles.distanceLabel}>Distance</Text>
                <Text style={styles.distanceValue}>{distance.toFixed(2)} km</Text>
              </View>
              <View style={styles.distanceItem}>
                <Text style={styles.distanceLabel}>ETA</Text>
                <Text style={styles.distanceValue}>{eta}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.callButton} onPress={handleCallResponder}>
                <Phone size={18} color="#ffffff" />
                <Text style={styles.buttonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.callButton, styles.messageButton]}>
                <MessageSquare size={18} color="#ffffff" />
                <Text style={styles.buttonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* No Incident Message */}
        {!responderData && (
          <View style={styles.noIncidentPanel}>
            <Zap size={32} color="#fbbf24" />
            <Text style={styles.noIncidentText}>No active emergency</Text>
            <Text style={styles.noIncidentSubtext}>Tap above to send a report</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  responderPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  responderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  responderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  incidentId: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  distanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  distanceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  messageButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  noIncidentPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  noIncidentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  noIncidentSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
});
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]> | null>(null);

  // Fetch road directions when responder data is set
  useEffect(() => {
    if (responderData) {
      const fetchRoute = async () => {
        console.log('[HomeScreen] Fetching road directions...');
        const coordinates = await getDirections(
          responderData.userLocation.longitude,
          responderData.userLocation.latitude,
          responderData.responderLocation.longitude,
          responderData.responderLocation.latitude
        );
        if (coordinates) {
          console.log('[HomeScreen] Got route with', coordinates.length, 'points');
          setRouteCoordinates(coordinates);
        } else {
          console.log('[HomeScreen] Directions API failed, using straight line');
          setRouteCoordinates([[
            responderData.userLocation.longitude,
            responderData.userLocation.latitude,
          ], [
            responderData.responderLocation.longitude,
            responderData.responderLocation.latitude,
          ]]);
        }
      };
      fetchRoute();
    }
  }, [responderData]);

export default HomeScreen;

