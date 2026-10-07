import React from 'react';
import { Text, StyleSheet, TextStyle, View } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

export function Title({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text accessibilityRole="header" style={[styles.title, style]}>{children}</Text>;
}

export function SectionTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section} accessibilityRole="header">{children}</Text>
      {right}
    </View>
  );
}

export function Body({
  children,
  muted,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  style?: TextStyle;
}) {
  return <Text style={[styles.body, muted ? styles.muted : undefined, style]}>{children}</Text>;
}

export function Caption({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.caption, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  section: { ...typography.section, color: colors.text },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  body: { ...typography.body, color: colors.text, lineHeight: 22 },
  muted: { color: colors.textMuted },
  caption: { ...typography.caption, color: colors.textFaint },
});
