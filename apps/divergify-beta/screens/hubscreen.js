import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionCard from '../components/sectioncard';
import PrimaryButton from '../components/primarybutton';
import BrandBadge from '../components/brandbadge';
import { colors, radii, spacing, typography } from '../constants/colors';

const HUB_URL = 'https://divergify.app/hub.html';

async function openHub() {
  try {
    const supported = await Linking.canOpenURL(HUB_URL);
    if (!supported) {
      Alert.alert('Unable to open The Hub', 'Please try again from your browser.');
      return;
    }
    await Linking.openURL(HUB_URL);
  } catch (err) {
    Alert.alert('Unable to open The Hub', 'Please try again from your browser.');
  }
}

export default function HubScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard style={styles.heroCard}>
        <BrandBadge tagline="Control center for the Divergify ecosystem" />
        <Text style={styles.heroTitle}>The Hub</Text>
        <Text style={styles.helper}>
          Divergify helps neurodivergent brains turn chaos into momentum with adaptive tools, honest support, and AI that works the way you think.
        </Text>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Open The Hub" onPress={openHub} />
          <PrimaryButton
            label="What is in beta"
            onPress={openHub}
            variant="ghost"
          />
        </View>
        <Text style={styles.helperSmall}>
          Opens in your browser to keep the beta stable.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>What lives in the Hub</Text>
        <View style={styles.featureRow}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Field Notes</Text>
            <Text style={styles.featureText}>Guides, case studies, and the no-gross ethics line.</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Dopamine Depot</Text>
            <Text style={styles.featureText}>Merch drops that fund stability-first tools.</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Divergipedia</Text>
            <Text style={styles.featureText}>Shared language for patterns you already feel.</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>App Updates</Text>
            <Text style={styles.featureText}>New tools, sidekicks, and beta release notes.</Text>
          </View>
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.cardElevated,
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  helper: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  helperSmall: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  buttonRow: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  subheading: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  featureTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  featureText: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
  },
});
