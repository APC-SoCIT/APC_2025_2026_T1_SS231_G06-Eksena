import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, CameraType, CameraView } from 'expo-camera';
import { ArrowLeft, RotateCcw, Video, VideoOff } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/MainStack';
import { sendVideoReport, initializeReportService, setPendingResponderRoute } from '../../services/ReportService';

type VideoCameraScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

const { width, height } = Dimensions.get('window');

const VideoCameraScreen: React.FC = () => {
  const navigation = useNavigation<VideoCameraScreenNavigationProp>();
  const { state } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isEmergencyDetected, setIsEmergencyDetected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access to use emergency reporting features.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setIsAnalyzing(true);
      
      // Simulate AI analysis after 2 seconds
      setTimeout(() => {
        setIsEmergencyDetected(true);
        setIsAnalyzing(false);
      }, 2000);

      // Mock recording - in a real app, this would start actual video recording
      console.log('[MOCK] Starting video recording...');
      
      // Simulate recording for 5 seconds
      setTimeout(() => {
        stopRecording();
      }, 5000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsEmergencyDetected(false);
      
      // Real video processing and report sending
      console.log('[REAL API] Stopping video recording...');
      
      const videoUri = `video_${Date.now()}.mp4`; // In real app, this would be the actual recorded video URI
      const { latitude, longitude, address } = state.location;
      
      if (latitude && longitude) {
        // Initialize ReportService with auth token if available
        if (state.auth.token) {
          initializeReportService(state.auth.token);
        }
        
        console.log('[REAL API] Sending video report...', {
          videoUri,
          location: { latitude, longitude, address },
        });
        
        // Call real API
        const result = await sendVideoReport(videoUri, { latitude, longitude, address });
        
        if (result.success) {
          // Seed a responder start position ~0.01 degrees away (approx 1km)
          const responderStart = {
            latitude: latitude + 0.01,
            longitude: longitude - 0.01,
          };

          setPendingResponderRoute({
            incidentId: result.report.id,
            responderStart,
            userLocation: { latitude, longitude, address },
            dispatcherName: result.report.assignedDispatcher?.name || 'Dispatcher',
          });

          Alert.alert(
            'Report Sent',
            result.message,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to Home to show responder route
                  navigation.navigate('MainTabs' as any);
                },
              },
            ]
          );
        } else {
          Alert.alert('Report Failed', result.message);
        }
      } else {
        Alert.alert('Location Error', 'Unable to get your location. Please try again.');
      }
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to process video. Please try again.');
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera access denied</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestCameraPermission}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Camera</Text>
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
          <RotateCcw size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
        >

          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>RECORDING</Text>
            </View>
          )}

          {/* AI Analyzing Overlay */}
          {(isAnalyzing || isEmergencyDetected) && (
            <View style={styles.aiOverlay}>
              <View style={styles.aiAlert}>
                <Text style={styles.aiAlertText}>{isAnalyzing ? 'Analyzing...' : 'Emergency Detected'}</Text>
                <Text style={styles.aiSubText}>
                  {isAnalyzing ? 'AI is analyzing the video in real-time' : 'Preparing report and contacting responders'}
                </Text>
              </View>
            </View>
          )}
        </CameraView>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <VideoOff size={32} color="#ffffff" />
          ) : (
            <Video size={32} color="#ffffff" />
          )}
        </TouchableOpacity>
        
        <Text style={styles.instructionText}>
          {isRecording ? 'Tap to stop recording' : 'Tap to start emergency recording'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flipButton: {
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  aiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  aiAlert: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiAlertText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiSubText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  recordingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#ef4444',
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default VideoCameraScreen;

