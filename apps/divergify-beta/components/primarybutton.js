import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/colors';

const PrimaryButton = ({ label, onPress, disabled, style, variant = 'primary' }) => {
  const variantStyle = variant === 'ghost' ? styles.ghost : styles.primary;
  const textStyle = variant === 'ghost' ? styles.ghostLabel : styles.label;
  return (
    <TouchableOpacity
      style={[styles.button, variantStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  primary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  ghost: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  label: {
    color: colors.ink,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    fontSize: typography.sizes.md,
  },
  ghostLabel: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    fontSize: typography.sizes.md,
  },
});

export default PrimaryButton;
