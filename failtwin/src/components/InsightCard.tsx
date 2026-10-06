import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Sparkle, DnaIcon } from './icons';

interface InsightCardProps {
  text: string;
}

/** AI Insight card — non-blaming, correction-focused learning takeaway. */
export function InsightCard({ text }: InsightCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <DnaIcon size={20} color={colors.onDark} />
        <Text style={styles.title}>AI Insight</Text>
        <Sparkle size={18} color={colors.onDarkMuted} />
      </View>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.indigo,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.section, color: colors.onDark, marginLeft: spacing.sm, flex: 1 },
  body: { ...typography.body, color: colors.onDark, lineHeight: 24 },
});
