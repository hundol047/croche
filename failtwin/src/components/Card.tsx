import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  tone?: 'default' | 'muted';
}

/** Bordered paper panel. Elevation is deliberately absent from normal content. */
export function Card({ children, style, tone = 'default' }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        tone === 'muted' ? styles.muted : undefined,
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
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  muted: { backgroundColor: colors.surfaceAlt },
});
