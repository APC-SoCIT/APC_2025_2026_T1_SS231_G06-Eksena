import { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { PrimaryButton } from '@/components/primary-button';
import {
  Spacing,
  FontSizes,
  Fonts,
  Radius,
  BG_BASE,
  BG_SURFACE,
  BG_INPUT,
  ACCENT_AMBER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER,
  BORDER_SUBTLE,
} from '@/constants/theme';

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
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location is required to save reports.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});

      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .upsert(
          { phone_number: phoneNumber, last_message: content },
          { onConflict: 'phone_number' }
        )
        .select()
        .single();

      if (convError) throw convError;
      const conv = convData as Conversation | null;
      if (!conv) throw new Error("Could not retrieve conversation data");

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
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Save Error:", errorMessage);
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Amber accent line */}
        <View style={styles.cardAccent} />

        <Text style={styles.title}>NEW REPORT</Text>

        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor={TEXT_MUTED}
          value={phone}
          onChangeText={(text: string) => setPhone(text)}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>MESSAGE CONTENT</Text>
        <TextInput
          placeholder="Message Content"
          placeholderTextColor={TEXT_MUTED}
          value={message}
          onChangeText={(text: string) => setMessage(text)}
          multiline
          style={[styles.input, styles.inputMultiline]}
        />

        <PrimaryButton
          title="Send Report"
          onPress={() => handleSaveSMS(phone, message)}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: BG_BASE,
  },
  card: {
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: ACCENT_AMBER,
  },
  title: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    borderBottomColor: BORDER,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.body,
    color: TEXT_PRIMARY,
    backgroundColor: BG_INPUT,
    fontFamily: Fonts.body,
    marginBottom: Spacing.md,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: Spacing.sm,
  },
});
