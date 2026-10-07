import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { LineChart } from '@/components/LineChart';
import { InsightCard } from '@/components/InsightCard';
import { Title, Body, Caption } from '@/components/typography';
import { colors, spacing, typography, scoreColor } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { buildReport } from '@/domain/report';
import { errorTypeLabel } from '@/domain/errorTypes';

export default function Report() {
  const { dna, mistakes, traps, refresh, profile } = useApp();
  const [chartWidth, setChartWidth] = useState(280);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const report = useMemo(() => buildReport(mistakes, traps, dna), [mistakes, traps, dna]);
  const hasHistory = mistakes.length > 0 || traps.length > 0;

  const latest = [...mistakes, ...traps].map((event) => event.createdAt).sort().pop();

  return (
    <Screen>
      <Caption>{profile?.isDemo ? '예시 DNA 포함 · ' : ''}{latest ? `최근 기록 · ${new Date(latest).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}` : '나의 학습 기록'}</Caption>
      <Title style={styles.title}>학습 리포트</Title>
      <Body muted style={styles.sub}>{mistakes.length}회 풀이 · Trap {traps.length}회에서 확인한 변화</Body>

      {!hasHistory ? <Card><EmptyState title="아직 학습 기록이 없어요"
        description="문제를 풀고 Trap에 도전하면 실제 기록으로 리포트가 채워집니다."
        ctaLabel="첫 문제 풀기" onCta={() => router.push('/practice')} /></Card> : null}

      <View style={styles.metrics}>
        <View style={styles.metric}><Text style={styles.metricValue}>{traps.length ? `${Math.round(report.predictionHitRate * 100)}%` : '—'}</Text><Caption>예측 적중률</Caption></View>
        <View style={[styles.metric, styles.metricLast]}><Text style={[styles.metricValue, { color: colors.success }]}>{report.correctedCount}개</Text><Caption>교정 완료 실수</Caption></View>
      </View>
      <Caption>Trap {traps.length}회 중 예측 적중 {traps.filter((t) => t.predictionHit).length}회 · 관찰된 비율이며 미래 확률이 아닙니다</Caption>

      <Section title="주차별 실수 재발률">
        <View style={styles.chartWrap} onLayout={(e) => setChartWidth(Math.max(120, Math.min(480, e.nativeEvent.layout.width)))}>
          <LineChart data={report.recurrenceTrend} width={chartWidth} />
        </View>
      </Section>

      <Section title="Error DNA 변화">
        <View style={styles.highlightRow}>
          <Caption>가장 줄어든 실수</Caption>
          <Text style={[styles.highlightValue, { color: colors.success }]}>
            {report.mostImprovedErrorType ? errorTypeLabel(report.mostImprovedErrorType) : '—'}
            {report.mostImprovedDelta > 0 ? ` · ${Math.round(report.mostImprovedDelta)}점 개선` : ''}
          </Text>
        </View>
        <View style={styles.highlightRow}>
          <Caption>아직 자주 나타나는 실수</Caption>
          <Text style={[styles.highlightValue, { color: scoreColor(report.mostDangerousScore) }]}>
            {report.mostDangerousErrorType ? errorTypeLabel(report.mostDangerousErrorType) : '—'}
            {report.mostDangerousScore > 0 ? ` · ${Math.round(report.mostDangerousScore)}` : ''}
          </Text>
        </View>
      </Section>

      <InsightCard text={report.insight} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  sub: { marginTop: spacing.sm, marginBottom: spacing.xl },
  metrics: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, marginBottom: spacing.md, paddingVertical: spacing.lg },
  metric: { flex: 1, paddingHorizontal: spacing.lg },
  metricLast: { borderLeftWidth: 1, borderLeftColor: colors.border },
  metricValue: { ...typography.title, color: colors.brand, marginBottom: spacing.xs, fontVariant: ['tabular-nums'] },
  chartWrap: { width: '100%', alignItems: 'center' },
  highlightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  highlightValue: { ...typography.bodyStrong, fontSize: 13, flexShrink: 1, textAlign: 'right', marginLeft: spacing.md },
});
