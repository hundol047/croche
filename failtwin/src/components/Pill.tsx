import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface PillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'indigo' | 'violet' | 'blue' | 'neutral';
}

export function Pill({ label, selected, onPress, tone = 'indigo' }: PillProps) {
  const accent = toneColor[tone];
  const body = (
    <View
      style={[
        styles.pill,
        selected ? { backgroundColor: accent, borderColor: accent } : styles.unselected,
      ]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : { color: accent }]}>
        {label}
      </Text>
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" aria-pressed={!!selected} accessibilityState={{ selected }}>
      {body}
    </Pressable>
  );
}

const toneColor = {
  indigo: colors.indigo,
  violet: colors.violet,
  blue: colors.blue,
  neutral: colors.textMuted,
};

const styles = StyleSheet.create({
  pill: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  unselected: { backgroundColor: colors.surface, borderColor: colors.border },
  label: { ...typography.caption, fontSize: 13, fontWeight: '600' },
  labelSelected: { color: colors.onDark },
});
