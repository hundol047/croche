import { goToMain } from '@/utils/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ActionRow } from '@/components/ActionRow';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { PredictionCard } from '@/components/PredictionCard';
import { Title, Body } from '@/components/typography';
import { spacing } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { useErrorDNA } from '@/state/useErrorDNA';
import { predictFromDna } from '@/domain/prediction';
import { buildMemoryContext } from '@/domain/memorySelect';
import { DEMO_SUBJECTS } from '@/content/problems';
import type { Prediction } from '@/domain/types';

type Phase = 'loading' | 'error' | 'done' | 'empty';

export default function PredictionScreen() {
  const router = useRouter();
  const { ai, dna } = useApp();
  const { strongest } = useErrorDNA();

  const [phase, setPhase] = useState<Phase>('loading');
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const run = useCallback(async () => {
    if (dna.length === 0) {
      setPhase('empty');
      return;
    }
    setPhase('loading');
    const subject = DEMO_SUBJECTS.find((s) => s === strongest?.subject);
    const topic = strongest?.topic;
    const memories = buildMemoryContext(dna, {
      subject: subject ?? '공업수학',
      topic: topic ?? '',
    });
    try {
    const res = await ai.predictNextMistake({ subject, topic, relevantMemories: memories });
    if (!res.ok) {
      // Fall back to the deterministic baseline prediction so the user still
      // sees a useful result instead of only an error.
      const fallback = predictFromDna(dna);
      if (fallback) {
        setPrediction(fallback);
        setPhase('done');
      } else {
        setPhase('error');
      }
      return;
    }
    setPrediction(res.value);
    setPhase('done');
    } catch {
      const fallback = predictFromDna(dna);
      setPrediction(fallback);
      setPhase(fallback ? 'done' : 'error');
    }
  }, [ai, dna, strongest]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <Screen>
      <Title>다음 실수 예측</Title>
      <Body muted style={styles.sub}>현재 Error DNA 기록을 바탕으로 다음 연습을 고릅니다.</Body>
      {phase === 'loading' ? <LoadingState message="예측 확인 중" /> : null}
      {phase === 'error' ? <ErrorState message="예측에 실패했습니다." onRetry={run} /> : null}
      {phase === 'empty' ? <Card>
        <Body style={styles.sub}>아직 예측할 기록이 없어요. 문제를 풀면 실수 패턴을 확인할 수 있습니다.</Body>
        <Button label="첫 문제 풀기" onPress={() => router.push('/practice')} />
      </Card> : null}
      {phase === 'done' && prediction ? <>
        <PredictionCard prediction={prediction} />
        <Button label="이 유형 훈련하기" variant="trap"
          onPress={() => router.push({ pathname: '/trap', params: { target: prediction.predictedErrorType } })} />
      </> : null}
      <View style={styles.gap} />
      <ActionRow label="홈으로" onPress={() => goToMain(router)} quiet />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: spacing.sm, marginBottom: spacing.xl },
  gap: { height: spacing.sm },
});
