import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface PillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

/** Compact choice control; shape and border communicate selection as well as color. */
export function Pill({ label, selected, onPress, disabled = false }: PillProps) {
  const body = <View style={[styles.control, selected ? styles.selected : undefined]}>
    <Text style={[styles.label, selected ? styles.selectedLabel : undefined]}>{label}</Text>
  </View>;
  return onPress || disabled ? <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" aria-pressed={!!selected} accessibilityState={{ selected, disabled }}>{body}</Pressable> : body;
}

const styles = StyleSheet.create({
  control: {
    minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1,
    borderColor: colors.controlBorder, backgroundColor: colors.surface,
    marginRight: spacing.sm, marginBottom: spacing.sm,
  },
  selected: { backgroundColor: colors.brandTint, borderColor: colors.brand },
  label: { ...typography.body, fontSize: 13, color: colors.textMuted },
  selectedLabel: { color: colors.brand, fontWeight: '600' },
});
