import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { supabase } from '../supabase'; // Ensure this path is correct

// 1. Define the shape of your Report/Ticket
interface Report {
  id: string; // or number, depending on your Supabase column type
  title: string;
  content: string;
  created_at?: string;
}

export default function ReportsScreen() {
  // 2. Explicitly tell useState this is an array of Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // 3. This will no longer throw an error because reports is typed
      setReports(data || []); 
    }
  };

  const handleSave = async () => {
    if (editingId) {
      // UPDATE logic (PUT)
      await supabase.from('reports').update({ title, content }).eq('id', editingId);
    } else {
      // INSERT logic (POST)
      await supabase.from('reports').insert([{ title, content }]);
    }
    setTitle('');
    setContent('');
    setEditingId(null);
    fetchReports();
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text><strong>{editingId ? "Editing Ticket" : "New Ticket"}</strong></Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ borderWidth: 1, marginBottom: 5 }} />
      <TextInput placeholder="Details" value={content} onChangeText={setContent} style={{ borderWidth: 1, height: 60 }} multiline />
      <Button title="Save Report" onPress={handleSave} />

      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>All Tickets</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()} // 4. TypeScript now knows 'id' exists
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text><strong>{item.title}</strong></Text>
            <Text>{item.content}</Text>
            <Button title="Edit" onPress={() => {
              setEditingId(item.id);
              setTitle(item.title);
              setContent(item.content);
            }} />
          </View>
        )}
      />
    </View>
  );
}