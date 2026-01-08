import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase'; 

export default function MessagingDisplay() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const sendSMSViaGateway = async () => {
    if (!phone || !message) {
      // 2. Fix: Alert is capitalized in React Native
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      // LOGIC: POST to Supabase Database
      const { error: dbError } = await supabase
        .from('messages')
        .insert([{ recipient_phone: phone, body: message }]);

      if (dbError) throw dbError;

      // LOGIC: POST to SMS Gateway API (Sample)
      // This is where your external SMS provider link goes
      const response = await fetch('https://api.sms-provider-example.com/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_GATEWAY_TOKEN'
        },
        body: JSON.stringify({
          to: phone,
          text: message
        })
      });

      if (response.ok) {
        Alert.alert("Success", "Message sent to SMS Gateway");
        setPhone('');
        setMessage('');
      } else {
        Alert.alert("Notice", "Logged to DB, but Gateway API rejected the request.");
      }
    } catch (error: any) {
      Alert.alert("Database Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>SMS Gateway Dispatch</Text>
      
      <TextInput 
        placeholder="Phone Number (+63...)" 
        value={phone} 
        onChangeText={setPhone} 
        keyboardType="phone-pad"
        style={{ borderWidth: 1, marginVertical: 10, padding: 8 }} 
      />
      
      <TextInput 
        placeholder="Type SMS Message..." 
        value={message} 
        onChangeText={setMessage} 
        multiline
        style={{ borderWidth: 1, height: 100, padding: 8, textAlignVertical: 'top' }} 
      />

      <View style={{ marginTop: 10 }}>
        <Button title="Send via SMS Gateway" onPress={sendSMSViaGateway} />
      </View>

      <ScrollView style={{ marginTop: 20 }}>
        <Text style={{ color: 'gray' }}>Note: SMS Gateway triggers a POST request to a third-party provider and logs the transaction in Supabase.</Text>
      </ScrollView>
    </View>
  );
}