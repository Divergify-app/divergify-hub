import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import SectionCard from '../components/sectioncard';
import BrandBadge from '../components/brandbadge';
import PrimaryButton from '../components/primarybutton';
import { colors, radii, spacing, typography } from '../constants/colors';
import { useStickys } from '../src/stickys/StickysProvider';
import { isValidISODate, todayISO } from '../src/stickys/utils';

export default function StickysScreen() {
  const {
    inbox,
    tasks,
    notes,
    routeToTask,
    routeToNote,
    routeToCalendar,
    editInboxSticky,
    editTask,
    editNote,
    toggleTask,
    deleteTask,
    deleteNote,
    remindIfNeeded,
  } = useStickys();
  const isFocused = useIsFocused();
  const [calendarDrafts, setCalendarDrafts] = useState({});
  const [editing, setEditing] = useState({ id: null, type: null, text: '' });

  useEffect(() => {
    if (!isFocused) return;
    if (inbox.length && remindIfNeeded()) {
      Alert.alert(
        'Sticky Inbox',
        `You have ${inbox.length} sticky${inbox.length === 1 ? '' : 's'} to route.`
      );
    }
  }, [isFocused, inbox.length, remindIfNeeded]);

  const startEdit = (item, type) => {
    setEditing({ id: item.id, type, text: item.text });
  };

  const saveEdit = () => {
    if (!editing.text.trim()) return;
    if (editing.type === 'inbox') editInboxSticky(editing.id, editing.text);
    if (editing.type === 'task') editTask(editing.id, editing.text);
    if (editing.type === 'note') editNote(editing.id, editing.text);
    setEditing({ id: null, type: null, text: '' });
  };

  const routeCalendar = (item) => {
    const dateISO = calendarDrafts[item.id] || '';
    if (!isValidISODate(dateISO)) {
      Alert.alert('Calendar date', 'Add a valid date (YYYY-MM-DD) to route.');
      return;
    }
    routeToCalendar(item, dateISO);
    setCalendarDrafts((prev) => ({ ...prev, [item.id]: todayISO() }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <BrandBadge tagline="Route your brain dump before it fossilizes" />
        <Text style={styles.heading}>Stickys</Text>
        <Text style={styles.helper}>
          Inbox first, then route to Tasks, Calendar, or Notes. No graveyards.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Sticky Inbox ({inbox.length})</Text>
        {inbox.length === 0 ? (
          <Text style={styles.helper}>Inbox is clear. Nice work.</Text>
        ) : (
          inbox.map((item) => (
            <View key={item.id} style={styles.stickyRow}>
              {editing.id === item.id && editing.type === 'inbox' ? (
                <View style={styles.editBlock}>
                  <TextInput
                    value={editing.text}
                    onChangeText={(text) =>
                      setEditing((prev) => ({ ...prev, text }))
                    }
                    style={styles.editInput}
                    multiline
                  />
                  <PrimaryButton label="Save edit" onPress={saveEdit} />
                </View>
              ) : (
                <>
                  <Text style={styles.stickyText}>{item.text}</Text>
                  <View style={styles.routeRow}>
                    <TouchableOpacity onPress={() => routeToTask(item)}>
                      <Text style={styles.routeAction}>Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => routeToNote(item)}>
                      <Text style={styles.routeAction}>Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => startEdit(item, 'inbox')}>
                      <Text style={styles.routeAction}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.calendarRow}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.muted}
                      value={calendarDrafts[item.id] ?? ''}
                      onChangeText={(text) =>
                        setCalendarDrafts((prev) => ({ ...prev, [item.id]: text }))
                      }
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setCalendarDrafts((prev) => ({ ...prev, [item.id]: todayISO() }))
                      }
                    >
                      <Text style={styles.routeAction}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => routeCalendar(item)}>
                      <Text style={styles.routeAction}>Calendar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Tasks ({tasks.length})</Text>
        {tasks.length === 0 ? (
          <Text style={styles.helper}>Route a sticky here to build a task list.</Text>
        ) : (
          tasks.map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <TouchableOpacity
                style={[styles.checkbox, task.done && styles.checkboxDone]}
                onPress={() => toggleTask(task.id)}
              >
                {task.done && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              {editing.id === task.id && editing.type === 'task' ? (
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={editing.text}
                    onChangeText={(text) =>
                      setEditing((prev) => ({ ...prev, text }))
                    }
                    style={styles.editInput}
                    multiline
                  />
                  <PrimaryButton label="Save edit" onPress={saveEdit} />
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskText, task.done && styles.taskDone]}>
                    {task.text}
                  </Text>
                  {task.edited ? (
                    <Text style={styles.editedTag}>Edited</Text>
                  ) : null}
                </View>
              )}
              <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => startEdit(task, 'task')}>
                  <Text style={styles.routeAction}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(task.id)}>
                  <Text style={styles.delete}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Notes ({notes.length})</Text>
        {notes.length === 0 ? (
          <Text style={styles.helper}>Route a sticky here for quick notes.</Text>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={styles.noteRow}>
              {editing.id === note.id && editing.type === 'note' ? (
                <View style={styles.editBlock}>
                  <TextInput
                    value={editing.text}
                    onChangeText={(text) =>
                      setEditing((prev) => ({ ...prev, text }))
                    }
                    style={styles.editInput}
                    multiline
                  />
                  <PrimaryButton label="Save edit" onPress={saveEdit} />
                </View>
              ) : (
                <>
                  <Text style={styles.stickyText}>{note.text}</Text>
                  {note.edited ? <Text style={styles.editedTag}>Edited</Text> : null}
                </>
              )}
              <View style={styles.noteActions}>
                <TouchableOpacity onPress={() => startEdit(note, 'note')}>
                  <Text style={styles.routeAction}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteNote(note.id)}>
                  <Text style={styles.delete}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  helper: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  stickyRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  stickyText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
  routeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  routeAction: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    backgroundColor: colors.card,
    color: colors.text,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.accent,
  },
  checkmark: {
    color: colors.ink,
    fontWeight: typography.weights.bold,
  },
  taskText: {
    color: colors.text,
    fontSize: typography.sizes.md,
  },
  taskDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  taskActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  editedTag: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xxs,
  },
  noteRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  editBlock: {
    gap: spacing.sm,
  },
  editInput: {
    minHeight: 64,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.text,
    padding: spacing.sm,
    textAlignVertical: 'top',
  },
  delete: {
    color: colors.danger,
    fontSize: 22,
  },
});
