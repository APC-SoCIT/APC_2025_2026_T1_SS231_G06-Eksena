import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert, StyleSheet, Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';
import { PrimaryButton } from '@/components/primary-button';
import { useRoleTheme } from '@/context/role-theme';
import { Spacing, FontSizes, TEXT_PRIMARY, TEXT_SECONDARY, WHITE, OFF_WHITE, BORDER, Radius, CardShadow } from '@/constants/theme';

interface Report {
  id: string;
  title: string;
  content: string;
  created_at?: string;
}

export default function ReportsScreen() {
  const theme = useRoleTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pressedEditId, setPressedEditId] = useState<string | null>(null);

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
      setReports(data || []); 
    }
  };

  const handleSave = async () => {
    if (editingId) {
      await supabase.from('reports').update({ title, content }).eq('id', editingId);
    } else {
      await supabase.from('reports').insert([{ title, content }]);
    }
    setTitle('');
    setContent('');
    setEditingId(null);
    fetchReports();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.card, CardShadow]}>
        <Text style={styles.sectionTitle}>
          {editingId ? 'Editing Ticket' : 'New Ticket'}
        </Text>
        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="Title"
          placeholderTextColor={TEXT_SECONDARY}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <Text style={styles.label}>Details</Text>
        <TextInput
          placeholder="Details"
          placeholderTextColor={TEXT_SECONDARY}
          value={content}
          onChangeText={setContent}
          style={[styles.input, styles.inputMultiline]}
          multiline
        />
        <PrimaryButton title="Save Report" onPress={handleSave} style={styles.button} />
      </View>

      <Text style={styles.listTitle}>All Tickets</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.reportCard, CardShadow]}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportContent}>{item.content}</Text>
            <Pressable
              onPress={() => {
                setEditingId(item.id);
                setTitle(item.title);
                setContent(item.content);
              }}
              onPressIn={() => setPressedEditId(item.id)}
              onPressOut={() => setPressedEditId(null)}
              style={({ pressed }) => [
                styles.editBtn,
                { borderColor: theme.primary },
                pressed && [styles.editBtnPressed, { backgroundColor: theme.primary }],
              ]}
            >
              <Text style={[
                styles.editBtnText,
                { color: theme.primary },
                pressedEditId === item.id && styles.editBtnTextPressed,
              ]}>
                Edit
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: OFF_WHITE,
  },
  card: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.body,
    color: TEXT_PRIMARY,
    backgroundColor: WHITE,
    marginBottom: Spacing.md,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: Spacing.sm,
  },
  listTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  reportCard: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  reportTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: Spacing.xs,
  },
  reportContent: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    marginBottom: Spacing.md,
  },
  editBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  editBtnPressed: {},
  editBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  editBtnTextPressed: {
    color: WHITE,
  },
});
