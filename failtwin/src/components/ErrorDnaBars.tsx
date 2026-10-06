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
 * horizontal progress bar and score per type. Highest risk is highlighted.
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
          <View key={e.errorType} style={[styles.row, i === 0 ? styles.topRow : undefined]}>
            <View style={styles.labelRow}>
              <Text style={styles.label} numberOfLines={1}>
                {errorTypeLabel(e.errorType)}
              </Text>
              <Text style={[styles.score, { color: c }]}>{Math.round(e.score)}%</Text>
            </View>
            <ProgressBar value={e.score} color={c} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: spacing.lg },
  topRow: {},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.bodyStrong, color: colors.text, flex: 1, marginRight: spacing.sm },
  score: { ...typography.bodyStrong, fontVariant: ['tabular-nums'] },
  empty: { paddingVertical: spacing.lg },
  emptyText: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
});
