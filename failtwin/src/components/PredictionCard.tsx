import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, riskColor } from '@/constants/theme';
import { TargetIcon } from './icons';
import { errorTypeLabel } from '@/domain/errorTypes';
import type { Prediction } from '@/domain/types';

interface PredictionCardProps {
  prediction: Prediction;
  compact?: boolean;
}

/**
 * Prediction score card. The big number is labelled "AI 예측 점수" (NOT a
 * validated probability) per the MVP honesty requirement (R5.2).
 */
export function PredictionCard({ prediction, compact }: PredictionCardProps) {
  const c = riskColor(prediction.riskScore);
  return (
    <View style={[styles.card, { borderColor: c + '33' }]}>
      <View style={styles.header}>
        <TargetIcon size={22} color={c} />
        <Text style={styles.title}>예상 실수 위험도</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: c }]}>{Math.round(prediction.riskScore)}</Text>
        <Text style={styles.scoreCaption}>/ 100 · AI 예측 점수</Text>
      </View>

      <View style={styles.targetRow}>
        <Text style={styles.targetLabel}>가장 가능성 높은 실수</Text>
        <View style={[styles.badge, { backgroundColor: c }]}>
          <Text style={styles.badgeText}>{errorTypeLabel(prediction.predictedErrorType)}</Text>
        </View>
      </View>

      {!compact ? <Text style={styles.reason}>{prediction.reason}</Text> : null}

      {!compact && prediction.relatedMemories.length > 0 ? (
        <View style={styles.related}>
          {prediction.relatedMemories.map((m, i) => (
            <Text key={i} style={styles.relatedItem}>
              • {m}
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={styles.disclaimer}>
        ※ 통계적으로 검증된 확률이 아니라, 당신의 Error DNA로 계산한 AI 위험도 점수입니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.section, color: colors.text, marginLeft: spacing.sm },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.lg },
  score: { fontSize: 56, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  scoreCaption: { ...typography.caption, color: colors.textMuted, marginLeft: spacing.sm },
  targetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  targetLabel: { ...typography.body, color: colors.textMuted },
  badge: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  badgeText: { ...typography.caption, fontSize: 13, fontWeight: '700', color: colors.onDark },
  reason: { ...typography.body, color: colors.text, lineHeight: 22, marginBottom: spacing.md },
  related: { marginBottom: spacing.md },
  relatedItem: { ...typography.caption, fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  disclaimer: { ...typography.caption, color: colors.textFaint, lineHeight: 16 },
});
