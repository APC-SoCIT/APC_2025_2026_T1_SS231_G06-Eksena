import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';

// 1. Define the shape of your Database rows for TypeScript
interface Conversation {
  id: number;
  phone_number: string;
  last_message: string;
}

export default function ExploreScreen() {
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSaveSMS = async (phoneNumber: string, content: string): Promise<void> => {
    try {
      // Get location coordinates
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location is required to save reports.");
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({});

      // 1. Find or Create the Conversation
      // We cast the response to <Conversation> so TS knows 'conv' has an 'id'
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .upsert(
          { phone_number: phoneNumber, last_message: content }, 
          { onConflict: 'phone_number' }
        )
        .select()
        .returns<Conversation>() // Explictly tell TS the return type
        .single();

      if (convError) throw convError;
      if (!conv) throw new Error("Could not retrieve conversation data");

      // 2. Save the message with location
      const { error: msgError } = await supabase
        .from('messages')
        .insert([
          { 
            conversation_id: conv.id, 
            content: content, 
            sender: 'incoming',
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          }
        ]);

      if (msgError) throw msgError;

      Alert.alert("Success", "Message and Location saved!");
      setPhone('');
      setMessage('');

    } catch (err: unknown) { 
      // Safe Error handling for TypeScript
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Save Error:", errorMessage);
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Report</Text>
      
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={(text: string) => setPhone(text)}
        style={styles.input}
        keyboardType="phone-pad"
      />
      
      <TextInput
        placeholder="Message Content"
        value={message}
        onChangeText={(text: string) => setMessage(text)}
        multiline
        style={[styles.input, { height: 100 }]}
      />

      <Button 
        title="Send Report" 
        onPress={() => handleSaveSMS(phone, message)} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
});