import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadow, spacing } from '../constants/colors';

const QuickCaptureFab = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.9}>
    <Ionicons name="add" size={26} color={colors.ink} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
});

export default QuickCaptureFab;
