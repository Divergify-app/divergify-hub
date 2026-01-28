import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import PrimaryButton from '../components/primarybutton';
import SectionCard from '../components/sectioncard';
import BrandBadge from '../components/brandbadge';
import usePersistentState from '../hooks/usepersistentstate';
import { colors, radii, spacing, typography } from '../constants/colors';

export default function OnboardingScreen({ onFinish, onSkip }) {
  const [shadesMode, setShadesMode] = usePersistentState(
    'mode_reduced_interference',
    false
  );
  const [tinfoilMode, setTinfoilMode] = usePersistentState(
    'mode_tinfoil_hat',
    false
  );
  const [, setSidekick] = usePersistentState('sidekickActiveId', 'takota');

  const finish = () => {
    setSidekick('takota');
    onFinish?.();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <BrandBadge tagline="Calm, structured, and ready to ship" />
        <Text style={styles.title}>Welcome to Divergify</Text>
        <Text style={styles.helper}>
          Set your defaults once. You can change them anytime.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Mode defaults</Text>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Reduced Interference</Text>
            <Text style={styles.toggleHelper}>
              Softer visuals, less noise, calmer focus.
            </Text>
          </View>
          <Switch
            value={shadesMode}
            onValueChange={setShadesMode}
            trackColor={{ false: colors.surface, true: colors.accent }}
            thumbColor={colors.text}
          />
        </View>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Tin Foil Hat Mode</Text>
            <Text style={styles.toggleHelper}>
              Tracking hooks stay off. Consent wins.
            </Text>
          </View>
          <Switch
            value={tinfoilMode}
            onValueChange={setTinfoilMode}
            trackColor={{ false: colors.surface, true: colors.accent }}
            thumbColor={colors.text}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Default guide</Text>
        <Text style={styles.helper}>
          TAKOTA is your default Sidekick: direct, supportive, and low drama.
        </Text>
      </SectionCard>

      <View style={styles.actions}>
        <PrimaryButton label="Save & continue" onPress={finish} />
        <PrimaryButton label="Skip for now" onPress={onSkip} variant="ghost" />
      </View>
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
  title: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  helper: {
    color: colors.muted,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  toggleTitle: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  toggleHelper: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
