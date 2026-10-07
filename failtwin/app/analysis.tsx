import { goToMain } from '@/utils/navigation';
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { recordPractice } from '@/domain/learningEvents';
import { buildMemoryContext } from '@/domain/memorySelect';
import { sessionStore } from '@/state/sessionStore';
import { errorTypeLabel } from '@/domain/errorTypes';
import type { MistakeAnalysis } from '@/domain/types';

type Phase = 'loading' | 'error' | 'done';

export default function Analysis() {
  const router = useRouter();
  const { ai, repos, profile, refresh } = useApp();
  const running = useRef(false);
  const completed = useRef<string | null>(null);

  const [phase, setPhase] = useState<Phase>('loading');
  const [analysis, setAnalysis] = useState<MistakeAnalysis | null>(null);
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [afterScore, setAfterScore] = useState<number | null>(null);

  const problem = sessionStore.get('currentProblem');
  const attempt = sessionStore.get('currentAttempt');

  const run = useCallback(async () => {
    if (!problem || !attempt || !profile || attempt.userId !== profile.userId) {
      setPhase('error');
      return;
    }
    if (running.current || completed.current === attempt.id) return;
    running.current = true;
    setPhase('loading');
    try {
      let record = (await repos.mistakes.get(profile.userId)).find((m) => m.attempt.id === attempt.id);
      if (!record) {
        const memories = buildMemoryContext(await repos.dna.get(profile.userId), problem);
        const res = await ai.analyzeMistake({ problem, attempt, relevantMemories: memories });
        if (!res.ok) { setPhase('error'); return; }
        record = await recordPractice(repos, problem, attempt, res.value);
      }
      completed.current = attempt.id;
      setAnalysis(record.analysis);
      setBeforeScore(record.beforeScore ?? null);
      setAfterScore(record.afterScore ?? null);
      setPhase('done');
      await refresh();
    } catch { completed.current = null; setPhase('error'); }
    finally { running.current = false; }
  }, [ai, attempt, problem, profile, repos, refresh]);

  useEffect(() => { void run(); }, [run]);

  if (!problem || !attempt) {
    return <Screen><Title>풀이 기록이 없어요</Title>
      <Body>분석할 답을 먼저 제출해주세요. 저장된 학습 기록은 리포트에서 볼 수 있어요.</Body>
      <Button label="문제 고르기" onPress={() => router.navigate('/practice')} />
      <Button label="홈으로" variant="ghost" onPress={() => goToMain(router)} />
    </Screen>;
  }

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
        <ErrorState message="분석이나 저장에 실패했어요. 다시 시도해도 같은 답은 한 번만 반영됩니다." onRetry={run} />
        <Button label="홈으로" variant="ghost" onPress={() => goToMain(router)} />
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
              {errorTypeLabel(analysis.errorType)}
            </Text>
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

      <Card>
        <SectionTitle>{correct ? '잘한 점' : '실수 원인'}</SectionTitle>
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

      <Button label="다음 실수 예측 보기" onPress={() => router.push('/prediction')} />
      <View style={styles.gap} />
      <Button label="🎯 Trap Challenge 시작" variant="violet" onPress={() => router.push('/trap')} />
      <View style={styles.gap} />
      <Button label="홈으로" variant="ghost" onPress={() => goToMain(router)} />
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
  verdictText: { flex: 1, ...typography.section, color: colors.onDark, marginLeft: spacing.md },
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
