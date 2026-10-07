import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { DnaIcon } from './icons';

/** A margin note in the learning report, rather than an AI promotional banner. */
export function InsightCard({ text }: { text: string }) {
  return <View style={styles.note}>
    <View style={styles.header}><DnaIcon size={18} /><Text style={styles.title}>최근 학습 패턴</Text></View>
    <Text style={styles.body}>{text}</Text>
  </View>;
}

const styles = StyleSheet.create({
  note: { borderLeftWidth: 2, borderLeftColor: colors.brand, paddingLeft: spacing.lg,
    marginTop: spacing.xxl, marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  title: { ...typography.section, color: colors.text, marginLeft: spacing.sm },
  body: { ...typography.body, color: colors.textMuted },
});
