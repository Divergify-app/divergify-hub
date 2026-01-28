import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radii, shadow, spacing } from '../constants/colors';

const SectionCard = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
});

export default SectionCard;
