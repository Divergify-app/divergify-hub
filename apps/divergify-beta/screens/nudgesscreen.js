import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Share,
} from 'react-native';
import SectionCard from '../components/sectioncard';
import PrimaryButton from '../components/primarybutton';
import BrandBadge from '../components/brandbadge';
import usePersistentState from '../hooks/usepersistentstate';
import { nudges } from '../constants/nudges';
import { colors, radii, spacing, typography } from '../constants/colors';

export default function NudgesScreen() {
  const [current, setCurrent] = useState(nudges[0]);
  const [pinned, setPinned] = usePersistentState('pinnedNudges', []);

  const queue = useMemo(() => nudges.filter((n) => n !== current), [current]);

  const shuffle = () => {
    const random = nudges[Math.floor(Math.random() * nudges.length)];
    setCurrent(random);
  };

  const pinCurrent = () => {
    if (pinned.includes(current)) return;
    setPinned((prev) => [current, ...prev].slice(0, 10));
  };

  const shareCurrent = async () => {
    await Share.share({ message: current });
  };

  const removePinned = (text) => {
    setPinned((prev) => prev.filter((n) => n !== text));
  };

  return (
    <View style={styles.container}>
      <SectionCard>
        <BrandBadge tagline="Your brain = the superpower" />
        <Text style={styles.heading}>Nudge Assistant</Text>
        <Text style={styles.helper}>
          Behavioral science, but funny. Use them as focus spells or text them to your hype buddy.
        </Text>
        <View style={styles.nudgeCard}>
          <Text style={styles.nudgeText}>{current}</Text>
        </View>
        <PrimaryButton label="Shuffle Nudge" onPress={shuffle} />
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={pinCurrent}>
            <Text style={styles.action}>Pin it</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={shareCurrent}>
            <Text style={styles.action}>Share</Text>
          </TouchableOpacity>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Pinned ({pinned.length})</Text>
        {pinned.length === 0 ? (
          <Text style={styles.helper}>Hold onto the ones that hype you.</Text>
        ) : (
          pinned.map((text) => (
            <View key={text} style={styles.pinRow}>
              <Text style={styles.pinText}>{text}</Text>
              <TouchableOpacity onPress={() => removePinned(text)}>
                <Text style={styles.delete}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Nudge Queue</Text>
        <FlatList
          data={queue}
          keyExtractor={(item) => item}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setCurrent(item)}>
              <Text style={styles.queueItem}>• {item}</Text>
            </TouchableOpacity>
          )}
        />
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
  nudgeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nudgeText: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    lineHeight: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  action: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  subheading: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pinText: {
    color: colors.text,
    flex: 1,
  },
  delete: {
    color: colors.danger,
    fontSize: 24,
  },
  queueItem: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
});
