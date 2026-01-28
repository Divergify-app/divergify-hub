import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import SectionCard from '../components/sectioncard';
import PrimaryButton from '../components/primarybutton';
import BrandBadge from '../components/brandbadge';
import { useStickys } from '../src/stickys/StickysProvider';
import { colors, radii, spacing, typography } from '../constants/colors';

const typeOptions = ['Task', 'Appointment', 'Body Double'];
const todayISO = () => new Date().toISOString().split('T')[0];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [entryText, setEntryText] = useState('');
  const [entryType, setEntryType] = useState(typeOptions[0]);
  const {
    calendarTasks,
    addCalendarEntry,
    toggleCalendarEntry,
    deleteCalendarEntry,
  } = useStickys();

  const dayItems = calendarTasks?.[selectedDate] ?? [];

  const markedDates = useMemo(() => {
    const marks = Object.keys(calendarTasks ?? {}).reduce((acc, date) => {
      if ((calendarTasks[date] ?? []).length > 0) {
        acc[date] = {
          marked: true,
          dotColor: colors.accent,
        };
      }
      return acc;
    }, {});

    return {
      ...marks,
      [selectedDate]: {
        ...(marks[selectedDate] ?? {}),
        selected: true,
        selectedColor: colors.accentMuted,
      },
    };
  }, [calendarTasks, selectedDate]);

  const handleSave = () => {
    if (!entryText.trim()) return;
    const payload = {
      id: Date.now().toString(),
      text: entryText.trim(),
      type: entryType,
      done: false,
    };
    addCalendarEntry(selectedDate, payload);
    setEntryText('');
  };

  const toggleDone = (id) => {
    toggleCalendarEntry(selectedDate, id);
  };

  const removeItem = (id) => {
    deleteCalendarEntry(selectedDate, id);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SectionCard>
        <BrandBadge tagline="Orbit rituals for chaos-brains" />
        <Text style={styles.heading}>Orbit Calendar</Text>
        <Calendar
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            dayTextColor: colors.text,
            monthTextColor: colors.text,
            arrowColor: colors.accent,
            selectedDayBackgroundColor: colors.accent,
            todayTextColor: colors.accent,
            textDisabledColor: '#555',
          }}
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          initialDate={selectedDate}
          hideExtraDays
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>
          {new Date(selectedDate).toDateString()}
        </Text>
        <View style={styles.pills}>
          {typeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.pill, option === entryType && styles.pillActive]}
              onPress={() => setEntryType(option)}
            >
              <Text
                style={[styles.pillText, option === entryType && styles.pillTextActive]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Brain dump the task / appointment..."
          placeholderTextColor={colors.muted}
          value={entryText}
          onChangeText={setEntryText}
          multiline
        />
        <PrimaryButton
          label="Save to this day"
          onPress={handleSave}
          disabled={!entryText.trim()}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Receipts ({dayItems.length})</Text>
        {dayItems.length === 0 ? (
          <Text style={styles.emptyText}>
            Nothing logged yet. Drop a task so future-you knows what happened.
          </Text>
        ) : (
          <FlatList
            data={dayItems}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.entryRow}>
                <TouchableOpacity
                  style={[styles.checkbox, item.done && styles.checkboxDone]}
                  onPress={() => toggleDone(item.id)}
                >
                  {item.done && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.entryText, item.done && styles.entryTextDone]}
                  >
                    {item.text}
                  </Text>
                  <Text style={styles.entryType}>{item.type}</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={styles.delete}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
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
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillText: {
    color: colors.text,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#05141a',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.muted,
    fontStyle: 'italic',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: spacing.sm,
  },
  checkboxDone: {
    backgroundColor: colors.accent,
  },
  checkmark: {
    color: '#05141a',
    fontWeight: '700',
  },
  entryText: {
    color: colors.text,
    fontSize: typography.sizes.md,
  },
  entryTextDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  entryType: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
  },
  delete: {
    color: colors.danger,
    fontSize: 26,
    paddingHorizontal: 8,
  },
});
