import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PrimaryButton from './primarybutton';
import { colors, radii, spacing, typography } from '../constants/colors';
import { useStickys } from '../src/stickys/StickysProvider';
import { isValidISODate, todayISO } from '../src/stickys/utils';

const routes = [
  { id: 'task', label: 'Task' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'note', label: 'Note' },
];

const QuickCaptureModal = ({ visible, onClose }) => {
  const {
    addToInbox,
    routeToTask,
    routeToNote,
    routeToCalendar,
  } = useStickys();
  const [draft, setDraft] = useState('');
  const [route, setRoute] = useState('inbox');
  const [dateISO, setDateISO] = useState(todayISO());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      setDraft('');
      setRoute('inbox');
      setDateISO(todayISO());
      setError('');
    }
  }, [visible]);

  const handleSave = () => {
    if (!draft.trim()) return;
    if (route === 'calendar' && !isValidISODate(dateISO)) {
      setError('Calendar needs a real date (YYYY-MM-DD).');
      return;
    }
    const sticky = addToInbox(draft);
    if (route === 'task') {
      routeToTask(sticky);
    } else if (route === 'note') {
      routeToNote(sticky);
    } else if (route === 'calendar') {
      const result = routeToCalendar(sticky, dateISO);
      if (!result.ok) {
        setError(result.error);
        return;
      }
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Quick Sticky</Text>
          <Text style={styles.helper}>
            Capture it fast. Route it before it becomes a graveyard.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="What is on your brain?"
            placeholderTextColor={colors.muted}
            value={draft}
            onChangeText={(text) => {
              setDraft(text);
              if (error) setError('');
            }}
            multiline
          />

          <Text style={styles.subheading}>Route on save</Text>
          <View style={styles.routeRow}>
            {routes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.routePill,
                  route === item.id && styles.routePillActive,
                ]}
                onPress={() => setRoute(item.id)}
              >
                <Text
                  style={[
                    styles.routeText,
                    route === item.id && styles.routeTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {route === 'calendar' ? (
            <View style={styles.dateRow}>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                value={dateISO}
                onChangeText={setDateISO}
              />
              <TouchableOpacity onPress={() => setDateISO(todayISO())}>
                <Text style={styles.action}>Use today</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setRoute('inbox')}>
              <Text style={styles.action}>Keep in Inbox for later</Text>
            </TouchableOpacity>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <PrimaryButton label="Save Sticky" onPress={handleSave} />
            <PrimaryButton label="Cancel" onPress={onClose} variant="ghost" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardElevated,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  helper: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 90,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    padding: spacing.sm,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  routeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  routePill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
  },
  routePillActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  routeText: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  routeTextActive: {
    color: colors.ink,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateInput: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    padding: spacing.xs,
  },
  action: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});

export default QuickCaptureModal;
