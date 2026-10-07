import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, scoreColor } from '@/constants/theme';
import { ProgressBar } from './ProgressBar';
import { errorTypeLabel } from '@/domain/errorTypes';
import type { ErrorDnaEntry } from '@/domain/types';

interface ErrorDnaBarsProps {
  entries: ErrorDnaEntry[];
  limit?: number;
}

/**
 * The signature Error DNA visualization: a ranked list of error types with a
 * thin segmented rail, observed occurrence count and compact score per type.
 */
export function ErrorDnaBars({ entries, limit = 5 }: ErrorDnaBarsProps) {
  const ranked = [...entries].sort((a, b) => b.score - a.score).slice(0, limit);

  if (ranked.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          아직 Error DNA가 없어요. 문제를 풀면 당신만의 실수 패턴이 여기에 쌓입니다.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {ranked.map((e, i) => {
        const c = scoreColor(e.score);
        return (
          <View key={e.errorType} style={[styles.row, i === ranked.length - 1 ? styles.lastRow : undefined]}>
            <View style={styles.labelRow}>
              <Text style={styles.label} numberOfLines={1}>
                {errorTypeLabel(e.errorType)}
              </Text>
              <Text style={styles.count}>기록 {e.occurrenceCount}회</Text>
              <Text style={[styles.score, { color: c }]}>{Math.round(e.score)}</Text>
            </View>
            <ProgressBar value={e.score} color={c} segmented />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: spacing.lg },
  lastRow: { marginBottom: 0 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.body, color: colors.text, flex: 1, marginRight: spacing.sm },
  count: { ...typography.caption, color: colors.textMuted, marginRight: spacing.md },
  score: { ...typography.bodyStrong, minWidth: 28, textAlign: 'right', fontVariant: ['tabular-nums'] },
  empty: { paddingVertical: spacing.lg },
  emptyText: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
});
