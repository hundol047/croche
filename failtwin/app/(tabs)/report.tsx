import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/Card';
import { LineChart } from '@/components/LineChart';
import { InsightCard } from '@/components/InsightCard';
import { Title, SectionTitle, Body, Caption } from '@/components/typography';
import { colors, radius, spacing, typography, scoreColor } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { buildReport } from '@/domain/report';
import { errorTypeLabel } from '@/domain/errorTypes';

export default function Report() {
  const { dna, mistakes, traps, refresh } = useApp();
  const [chartWidth, setChartWidth] = useState(280);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const report = useMemo(() => buildReport(mistakes, traps, dna), [mistakes, traps, dna]);
  const hasHistory = mistakes.length > 0 || traps.length > 0;

  return (
    <Screen>
      <Title>학습 리포트</Title>
      <Body muted style={styles.sub}>당신의 실수 패턴이 어떻게 변하고 있는지 보여줍니다.</Body>

      {!hasHistory ? <Card><EmptyState title="아직 학습 기록이 없어요"
        description="문제를 풀고 Trap에 도전하면 실제 기록으로 리포트가 채워집니다."
        ctaLabel="첫 문제 풀기" onCta={() => router.push('/practice')} /></Card> : null}

      {/* 핵심 지표 */}
      <View style={styles.metricRow}>
        <View style={styles.metricCol}>
          <Metric label="AI 예측 적중률" value={traps.length ? `${Math.round(report.predictionHitRate * 100)}%` : '—'} tone={colors.violet} />
        </View>
        <View style={styles.metricColLast}>
          <Metric label="교정 완료 실수" value={`${report.correctedCount}개`} tone={colors.success} />
        </View>
      </View>

      <Caption>Trap {traps.length}회 중 예측 적중 {traps.filter((t) => t.predictionHit).length}회 · 관찰된 비율이며 미래 확률이 아닙니다</Caption>

      {/* 재발률 추이 */}
      <Card>
        <SectionTitle>주차별 실수 재발률</SectionTitle>
        <View style={styles.chartWrap} onLayout={(e) => setChartWidth(Math.max(120, Math.min(480, e.nativeEvent.layout.width)))}>
          <LineChart data={report.recurrenceTrend} width={chartWidth} />
        </View>
      </Card>

      {/* 가장 개선 / 가장 위험 */}
      <Card>
        <SectionTitle>Error DNA 하이라이트</SectionTitle>
        <View style={styles.highlightRow}>
          <Caption>가장 개선된 실수</Caption>
          <Text style={[styles.highlightValue, { color: colors.success }]}>
            {report.mostImprovedErrorType ? errorTypeLabel(report.mostImprovedErrorType) : '-'}
            {report.mostImprovedDelta > 0 ? `  ▲${Math.round(report.mostImprovedDelta)}` : ''}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.highlightRow}>
          <Caption>현재 가장 위험한 실수</Caption>
          <Text style={[styles.highlightValue, { color: scoreColor(report.mostDangerousScore) }]}>
            {report.mostDangerousErrorType ? errorTypeLabel(report.mostDangerousErrorType) : '-'}
            {report.mostDangerousScore > 0 ? `  ${Math.round(report.mostDangerousScore)}` : ''}
          </Text>
        </View>
      </Card>

      {/* AI Insight */}
      <InsightCard text={report.insight} />
    </Screen>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: tone }]}>{value}</Text>
      <Caption>{label}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { marginBottom: spacing.lg },
  metricRow: { flexDirection: 'row', marginBottom: spacing.lg },
  metricCol: { flex: 1, marginRight: spacing.md },
  metricColLast: { flex: 1 },
  metric: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  metricValue: { fontSize: 28, fontWeight: '800', marginBottom: 2, fontVariant: ['tabular-nums'] },
  chartWrap: { width: '100%', alignItems: 'center', marginTop: spacing.sm },
  highlightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  highlightValue: { ...typography.bodyStrong, flexShrink: 1, textAlign: 'right', marginLeft: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
