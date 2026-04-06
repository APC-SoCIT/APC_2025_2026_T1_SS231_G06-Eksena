import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert, StyleSheet, Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';
import { PrimaryButton } from '@/components/primary-button';
import { useRoleTheme } from '@/context/role-theme';
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
      {/* New Ticket Card */}
      <View style={styles.card}>
        <View style={styles.cardAccent} />
        <Text style={styles.sectionTitle}>
          {editingId ? 'EDITING TICKET' : 'NEW TICKET'}
        </Text>

        <Text style={styles.label}>TITLE</Text>
        <TextInput
          placeholder="Incident title"
          placeholderTextColor={TEXT_MUTED}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>DETAILS</Text>
        <TextInput
          placeholder="Incident details and observations"
          placeholderTextColor={TEXT_MUTED}
          value={content}
          onChangeText={setContent}
          style={[styles.input, styles.inputMultiline]}
          multiline
        />

        <PrimaryButton title="Save Report" onPress={handleSave} style={styles.button} />
      </View>

      {/* All Tickets header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>ALL TICKETS</Text>
        <Text style={styles.listCount}>{reports.length} records</Text>
      </View>

      {/* Ticket list */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={[styles.reportCardAccent, { backgroundColor: theme.primary }]} />
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportContent}>{item.content}</Text>
            {item.created_at ? (
              <Text style={styles.reportDate}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            ) : null}
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
                pressed && { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Text
                style={[
                  styles.editBtnText,
                  { color: theme.primary },
                ]}
              >
                EDIT
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
    backgroundColor: BG_BASE,
  },

  /* ── Form Card ─────────────────────────────────────────── */
  card: {
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  sectionTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
    marginBottom: Spacing.md,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: Spacing.sm,
  },

  /* ── List Header ───────────────────────────────────────── */
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  listTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontFamily: Fonts.heading,
    letterSpacing: 2,
  },
  listCount: {
    fontSize: FontSizes.xs,
    color: TEXT_MUTED,
    fontFamily: Fonts.body,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },

  /* ── Report Cards ──────────────────────────────────────── */
  reportCard: {
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  reportCardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  reportTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontFamily: Fonts.heading,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  reportContent: {
    fontSize: FontSizes.sm,
    color: TEXT_SECONDARY,
    fontFamily: Fonts.body,
    marginBottom: Spacing.sm,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  reportDate: {
    fontSize: FontSizes.xs,
    color: TEXT_MUTED,
    fontFamily: Fonts.mono,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  editBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.sm,
    backgroundColor: 'transparent',
  },
  editBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    fontFamily: Fonts.heading,
    letterSpacing: 1.5,
  },
});
