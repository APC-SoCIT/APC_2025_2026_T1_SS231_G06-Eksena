import { RouteProp, useRoute } from '@react-navigation/native';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react-native';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/MainStack';

type CallingScreenRouteProp = RouteProp<MainStackParamList, 'Calling'>;

const { width, height } = Dimensions.get('window');

const CallingScreen: React.FC = () => {
  const route = useRoute<CallingScreenRouteProp>();
  const { incidentId, dispatcherName } = route.params;
  
  const [isMuted, setIsMuted] = React.useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = React.useState(false);

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = () => {
    // In a real app, this would end the actual call
    // For now, just navigate back
    // navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Dispatcher Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {dispatcherName.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        </View>

        {/* Dispatcher Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.dispatcherName}>{dispatcherName}</Text>
          <Text style={styles.callingStatus}>Calling...</Text>
          <Text style={styles.incidentId}>Incident #{incidentId}</Text>
        </View>

        {/* Call Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={handleMute}
            >
              {isMuted ? (
                <MicOff size={24} color="#ffffff" />
              ) : (
                <Mic size={24} color="#ffffff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
              onPress={handleSpeaker}
            >
              {isSpeakerOn ? (
                <Volume2 size={24} color="#ffffff" />
              ) : (
                <VolumeX size={24} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>

          {/* End Call Button */}
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <PhoneOff size={32} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoContainer: {
    alignItems: 'center',
  },
  dispatcherName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  callingStatus: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 4,
  },
  incidentId: {
    fontSize: 14,
    color: '#6b7280',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#dc2626',
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CallingScreen;



