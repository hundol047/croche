import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  tone?: 'default' | 'muted';
}

/** Rounded card with a soft shadow — the primary surface primitive. */
export function Card({ children, style, tone = 'default' }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        tone === 'muted' ? styles.muted : undefined,
        shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  muted: { backgroundColor: colors.surfaceAlt },
});
