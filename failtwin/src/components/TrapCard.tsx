import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { errorTypeLabel } from '@/domain/errorTypes';
import type { ErrorType } from '@/domain/types';

/** The one ink surface: a focused training target, with a restrained violet rule. */
export function TrapCard({ targetErrorType, children }: { targetErrorType: ErrorType; children?: React.ReactNode }) {
  return <View style={styles.panel}>
    <View style={styles.target}>
      <Text style={styles.caption}>이번 연습에서 확인할 조건</Text>
      <Text style={styles.targetValue}>{errorTypeLabel(targetErrorType)}</Text>
    </View>
    {children}
  </View>;
}

const styles = StyleSheet.create({
  panel: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.xl },
  caption: { ...typography.caption, color: colors.textMuted },
  target: { marginBottom: spacing.md },
  targetValue: { ...typography.section, fontSize: 20, color: colors.text, marginTop: spacing.sm },
});
