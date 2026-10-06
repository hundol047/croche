import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Title, SectionTitle, Body, Caption } from '@/components/typography';
import { CheckIcon, TargetIcon } from '@/components/icons';
import { colors, radius, spacing, typography, scoreColor } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { useErrorDNA } from '@/state/useErrorDNA';
import { sessionStore } from '@/state/sessionStore';
import { errorTypeLabel } from '@/domain/errorTypes';
import { findEntry } from '@/domain/errorDnaEngine';
import type { MistakeAnalysis } from '@/domain/types';

type Phase = 'loading' | 'error' | 'done';

export default function Analysis() {
  const router = useRouter();
  const { ai, repos, profile } = useApp();
  const { recordAnalysis, memoryContextFor } = useErrorDNA();

  const [phase, setPhase] = useState<Phase>('loading');
  const [analysis, setAnalysis] = useState<MistakeAnalysis | null>(null);
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [afterScore, setAfterScore] = useState<number | null>(null);

  const problem = sessionStore.get('currentProblem');
  const attempt = sessionStore.get('currentAttempt');

  const run = useCallback(async () => {
    if (!problem || !attempt || !profile) {
      setPhase('error');
      return;
    }
    setPhase('loading');

    // snapshot the targeted error type score BEFORE updating
    const before = problem.targetErrorType
      ? findEntry(await repos.dna.get(profile.userId), problem.targetErrorType)?.score ?? 0
      : null;

    const memories = memoryContextFor({ subject: problem.subject, topic: problem.topic });
    const res = await ai.analyzeMistake({ problem, attempt, relevantMemories: memories });

    if (!res.ok) {
      setPhase('error');
      return;
    }
    setAnalysis(res.value);
    sessionStore.set('currentAnalysis', res.value);
    await recordAnalysis(problem, attempt, res.value);

    // snapshot score AFTER updating (use errorType from analysis if wrong)
    const key = res.value.errorType ?? problem.targetErrorType;
    const after = key ? findEntry(await repos.dna.get(profile.userId), key)?.score ?? 0 : null;
    setBeforeScore(before);
    setAfterScore(after);
    setPhase('done');
  }, [ai, attempt, memoryContextFor, problem, profile, recordAnalysis, repos]);

  useEffect(() => {
    void run();
  }, [run]);

  if (phase === 'loading') {
    return (
      <Screen>
        <LoadingState message="당신의 풀이 패턴을 분석하고 있어요" />
      </Screen>
    );
  }

  if (phase === 'error' || !analysis) {
    return (
      <Screen>
        <ErrorState onRetry={run} />
      </Screen>
    );
  }

  const correct = analysis.isCorrect;
  const accent = correct ? colors.success : scoreColor(analysis.recurrenceRisk);

  return (
    <Screen>
      <Title>AI 오답 분석</Title>

      {/* 정답 여부 */}
      <View style={[styles.verdict, { backgroundColor: correct ? colors.success : colors.indigo }]}>
        {correct ? <CheckIcon size={26} color={colors.onDark} /> : <TargetIcon size={24} color={colors.onDark} />}
        <Text style={styles.verdictText}>{correct ? '정답입니다!' : '오답이에요 — 함께 교정해봐요'}</Text>
      </View>

      {!correct && analysis.errorType ? (
        <Card>
          <SectionTitle>핵심 실수 유형</SectionTitle>
          <View style={[styles.typeBadge, { backgroundColor: accent }]}>
            <Text style={styles.typeBadgeText}>
              {analysis.errorTitle ?? errorTypeLabel(analysis.errorType)}
            </Text>
          </View>
        </Card>
      ) : null}

      <Card>
        <SectionTitle>실수 원인</SectionTitle>
        <Body>{analysis.reason}</Body>
      </Card>

      {analysis.evidence.length > 0 ? (
        <Card tone="muted">
          <SectionTitle>근거</SectionTitle>
          {analysis.evidence.map((e, i) => (
            <Text key={i} style={styles.evidence}>• {e}</Text>
          ))}
        </Card>
      ) : null}

      <Card>
        <SectionTitle>교정 전략</SectionTitle>
        <Body>{analysis.correctionStrategy}</Body>
      </Card>

      {!correct ? (
        <Card>
          <SectionTitle right={<Caption>0 → 100</Caption>}>다음 문제 재발 위험도</SectionTitle>
          <View style={styles.riskRow}>
            <Text style={[styles.riskScore, { color: accent }]}>{Math.round(analysis.recurrenceRisk)}</Text>
            <Caption>AI 예측 점수</Caption>
          </View>
        </Card>
      ) : null}

      {/* Error DNA 변화 */}
      {beforeScore !== null && afterScore !== null && (analysis.errorType || problem?.targetErrorType) ? (
        <Card>
          <SectionTitle>Error DNA 변화</SectionTitle>
          <View style={styles.dnaChange}>
            <Text style={styles.dnaLabel}>
              {errorTypeLabel(analysis.errorType ?? problem!.targetErrorType!)}
            </Text>
            <Text style={styles.dnaDelta}>
              {Math.round(beforeScore)} <Text style={styles.arrow}>→</Text>{' '}
              <Text style={{ color: afterScore >= beforeScore ? colors.danger : colors.success }}>
                {Math.round(afterScore)}
              </Text>
            </Text>
          </View>
        </Card>
      ) : null}

      <Button label="다음 실수 예측 보기" onPress={() => router.push('/prediction')} />
      <View style={styles.gap} />
      <Button label="🎯 Trap Challenge 시작" variant="violet" onPress={() => router.push('/trap')} />
      <View style={styles.gap} />
      <Button label="홈으로" variant="ghost" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  verdict: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  verdictText: { ...typography.section, color: colors.onDark, marginLeft: spacing.md },
  typeBadge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 8 },
  typeBadgeText: { ...typography.bodyStrong, color: colors.onDark },
  evidence: { ...typography.caption, fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 4 },
  riskRow: { flexDirection: 'row', alignItems: 'baseline' },
  riskScore: { fontSize: 44, fontWeight: '800', marginRight: spacing.md, fontVariant: ['tabular-nums'] },
  dnaChange: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dnaLabel: { ...typography.bodyStrong, color: colors.text },
  dnaDelta: { ...typography.title, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  arrow: { color: colors.textFaint },
  gap: { height: spacing.md },
});
