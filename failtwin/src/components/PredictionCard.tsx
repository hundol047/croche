import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, scoreColor } from '@/constants/theme';
import { TargetIcon } from './icons';
import { ProgressBar } from './ProgressBar';
import { errorTypeLabel } from '@/domain/errorTypes';
import type { Prediction } from '@/domain/types';

/** The mistake and its evidence lead; the uncalibrated score supports the next action. */
export function PredictionCard({ prediction, compact }: { prediction: Prediction; compact?: boolean }) {
  return <View style={styles.panel}>
    <View style={styles.header}>
      <TargetIcon size={20} />
      <Text style={styles.eyebrow}>다음에 주의할 실수</Text>
    </View>
    <Text style={styles.target}>{errorTypeLabel(prediction.predictedErrorType)}</Text>
    <View style={styles.scoreRow}>
      <Text style={styles.caption}>예상 실수 위험도</Text>
      <Text style={styles.score}>{Math.round(prediction.riskScore)} / 100</Text>
    </View>
    <ProgressBar value={prediction.riskScore} color={scoreColor(prediction.riskScore)} segmented />
    {!compact ? <Text style={styles.reason}>{prediction.reason}</Text> : null}
    {!compact && prediction.relatedMemories.length > 0 ? <View style={styles.related}>
      <Text style={styles.caption}>함께 확인할 기록</Text>
      {prediction.relatedMemories.map((m, i) => <Text key={i} style={styles.memory}>{m}</Text>)}
    </View> : null}
    <Text style={styles.disclaimer}>Error DNA로 계산한 위험 점수입니다. 검증된 확률이 아닙니다.</Text>
  </View>;
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  eyebrow: { ...typography.caption, color: colors.textMuted, marginLeft: spacing.sm },
  caption: { ...typography.caption, color: colors.textMuted },
  target: { ...typography.title, color: colors.text, marginBottom: spacing.xl },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sm },
  score: { ...typography.bodyStrong, color: colors.text, fontVariant: ['tabular-nums'] },
  reason: { ...typography.body, color: colors.text, marginTop: spacing.xl },
  related: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, marginTop: spacing.lg },
  memory: { ...typography.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  disclaimer: { ...typography.caption, color: colors.textMuted, marginTop: spacing.lg },
});
