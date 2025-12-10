import { RouteProp, useRoute } from '@react-navigation/native';
import { Phone, Video } from 'lucide-react-native';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/MainStack';

type ChatScreenRouteProp = RouteProp<MainStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { incidentId, dispatcherName } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dispatcherName}>{dispatcherName}</Text>
          <Text style={styles.incidentId}>Incident #{incidentId}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Phone size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Video size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>Chat Interface</Text>
          <Text style={styles.placeholderText}>
            This is a placeholder for the dispatcher chat interface.
            {'\n\n'}
            In the full implementation, this would include:
            {'\n'}• Real-time messaging
            {'\n'}• Message history
            {'\n'}• File sharing
            {'\n'}• Location sharing
            {'\n'}• Emergency status updates
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#dc2626',
  },
  headerLeft: {
    flex: 1,
  },
  dispatcherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  incidentId: {
    fontSize: 12,
    color: '#fecaca',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderContainer: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ChatScreen;



