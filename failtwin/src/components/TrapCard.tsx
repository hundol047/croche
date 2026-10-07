import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { TargetIcon } from './icons';
import { errorTypeLabel } from '@/domain/errorTypes';
import type { ErrorType } from '@/domain/types';

/** The one ink surface: a focused training target, with a restrained violet rule. */
export function TrapCard({ targetErrorType, children }: { targetErrorType: ErrorType; children?: React.ReactNode }) {
  return <View style={styles.panel}>
    <View style={styles.header}>
      <TargetIcon size={20} color={colors.onDarkMuted} />
      <Text style={styles.eyebrow}>집중 훈련</Text>
    </View>
    <Text style={styles.title}>실수 패턴 훈련</Text>
    <View style={styles.target}>
      <Text style={styles.caption}>이번에 확인할 패턴</Text>
      <Text style={styles.targetValue}>{errorTypeLabel(targetErrorType)}</Text>
    </View>
    {children}
  </View>;
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.ink, borderRadius: radius.xl, borderLeftWidth: 3,
    borderLeftColor: colors.trapAccent, padding: spacing.xl, marginTop: spacing.lg, marginBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  eyebrow: { ...typography.caption, color: colors.onDarkMuted, marginLeft: spacing.sm },
  caption: { ...typography.caption, color: colors.onDarkMuted },
  title: { ...typography.title, color: colors.onDark, marginBottom: spacing.xl },
  target: { borderTopWidth: 1, borderTopColor: colors.trapAccent, paddingTop: spacing.lg, marginBottom: spacing.lg },
  targetValue: { ...typography.section, color: colors.onDark, marginTop: spacing.xs },
});
