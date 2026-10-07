import { goToMain } from '@/utils/navigation';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ActionRow } from '@/components/ActionRow';
import { Section } from '@/components/Section';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Title, Body, Caption } from '@/components/typography';
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
        <LoadingState message="풀이 분석 중" />
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
      <Caption>{problem.subject} · {problem.topic}</Caption>
      <Title style={styles.title}>풀이 분석</Title>
      <View style={styles.verdict}>
        {correct ? <CheckIcon size={22} color={colors.success} /> : <TargetIcon size={22} color={accent} />}
        <Text style={[styles.verdictText, { color: correct ? colors.success : colors.text }]}>
          {correct ? '정답입니다!' : '오답 · 함께 확인해봐요'}
        </Text>
      </View>

      <Card>
        {!correct && analysis.errorType ? <View style={styles.errorType}>
          <Caption>이번 풀이에서 확인한 실수</Caption>
          <Text style={styles.pattern}>{errorTypeLabel(analysis.errorType)}</Text>
        </View> : null}

        {beforeScore !== null && afterScore !== null && (analysis.errorType || problem.targetErrorType) ? <View style={styles.dna}>
          <Text style={styles.dnaTitle}>Error DNA 변화</Text>
          <View style={styles.dnaRow}>
            <Text style={styles.dnaLabel}>{errorTypeLabel(analysis.errorType ?? problem.targetErrorType!)}</Text>
            <Text style={styles.dnaDelta}>{Math.round(beforeScore)} → <Text style={{ color: afterScore < beforeScore ? colors.success : colors.warning }}>{Math.round(afterScore)}</Text></Text>
          </View>
        </View> : null}

        <Section title={correct ? '잘한 점' : '실수 원인'} first><Body>{analysis.reason}</Body></Section>
        {analysis.evidence.length > 0 ? <Section title="근거">
          {analysis.evidence.map((e, i) => <Text key={i} style={styles.evidence}>• {e}</Text>)}
        </Section> : null}
        <Section title="다음에 확인할 것"><Body>{analysis.correctionStrategy}</Body></Section>
        {!correct ? <Section title="다음 문제 재발 위험도">
          <View style={styles.riskRow}><Text style={[styles.riskScore, { color: accent }]}>{Math.round(analysis.recurrenceRisk)} / 100</Text><Caption>위험 점수 · 확률이 아닙니다</Caption></View>
        </Section> : null}
      </Card>

      <Button label="다음 실수 예측 보기" onPress={() => router.push('/prediction')} />
      <ActionRow label="실수 패턴 훈련하기" hint="Trap Mode" onPress={() => router.push('/trap')} />
      <ActionRow label="홈으로" onPress={() => goToMain(router)} quiet />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  verdict: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  verdictText: { flex: 1, ...typography.bodyStrong, marginLeft: spacing.sm },
  errorType: { marginBottom: spacing.lg },
  pattern: { ...typography.section, color: colors.text, marginTop: spacing.xs },
  dna: { backgroundColor: colors.brandTint, borderRadius: radius.sm, borderLeftWidth: 2,
    borderLeftColor: colors.brand, padding: spacing.md, marginBottom: spacing.xl },
  dnaTitle: { ...typography.caption, color: colors.brand, marginBottom: spacing.xs },
  dnaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dnaLabel: { ...typography.body, color: colors.text, flex: 1, marginRight: spacing.sm },
  dnaDelta: { ...typography.section, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  evidence: { ...typography.body, fontSize: 13, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xs },
  riskRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between' },
  riskScore: { ...typography.bodyStrong, fontVariant: ['tabular-nums'], marginRight: spacing.md },
});
