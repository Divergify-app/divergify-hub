import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import SectionCard from '../components/sectioncard';
import PrimaryButton from '../components/primarybutton';
import usePersistentState from '../hooks/usepersistentstate';
import { colors, radii, spacing, typography } from '../constants/colors';

const categories = ['Groceries', 'Essentials', 'Self-Care', 'Errands'];

export default function ShoppingScreen() {
  const [items, setItems] = usePersistentState('shoppingItems', []);
  const [draft, setDraft] = useState('');
  const [intention, setIntention] = useState('');
  const [category, setCategory] = useState(categories[0]);

  const progress = useMemo(() => {
    if (!items.length) return 0;
    const done = items.filter((item) => item.done).length;
    return Math.round((done / items.length) * 100);
  }, [items]);

  const filteredItems = items.filter((item) => item.category === category);

  const addItem = () => {
    if (!draft.trim()) return;
    const payload = {
      id: Date.now().toString(),
      text: draft.trim(),
      intention: intention.trim(),
      category,
      done: false,
    };
    setItems((prev) => [payload, ...prev]);
    setDraft('');
    setIntention('');
  };

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <SectionCard>
        <Text style={styles.heading}>Shopping Focus Mode</Text>
        <Text style={styles.helper}>
          Make a list, set an intention, dodge impulse buys with ruthless clarity.
        </Text>

        <View style={styles.pills}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.pill, cat === category && styles.pillActive]}
            >
              <Text
                style={[styles.pillText, cat === category && styles.pillTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Item (e.g., oat milk, focus snacks)"
          placeholderTextColor={colors.muted}
          value={draft}
          onChangeText={setDraft}
        />
        <TextInput
          style={styles.input}
          placeholder="Intention (e.g., prevent 3PM crash)"
          placeholderTextColor={colors.muted}
          value={intention}
          onChangeText={setIntention}
        />
        <PrimaryButton label="Add to run" onPress={addItem} disabled={!draft.trim()} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Progress: {progress}% locked in</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressThumb, { width: `${progress}%` }]} />
        </View>
        {filteredItems.length === 0 ? (
          <Text style={styles.helper}>No items yet for {category}. Toss one in.</Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <TouchableOpacity
                  style={[styles.checkbox, item.done && styles.checkboxDone]}
                  onPress={() => toggleItem(item.id)}
                >
                  {item.done && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
                    {item.text}
                  </Text>
                  {item.intention ? (
                    <Text style={styles.intention}>Focus: {item.intention}</Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                  <Text style={styles.delete}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  helper: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
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
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm / 2,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: '#1d1d27',
    marginBottom: spacing.sm,
  },
  progressThumb: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 30,
    height: 30,
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
  itemText: {
    color: colors.text,
    fontSize: typography.sizes.md,
  },
  itemTextDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  intention: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
  },
  delete: {
    color: colors.danger,
    fontSize: 26,
    paddingHorizontal: 6,
  },
});
