import { goToMain } from '@/utils/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { PredictionCard } from '@/components/PredictionCard';
import { Title, SectionTitle, Body } from '@/components/typography';
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
      <Title>오답 예측</Title>
      <Body muted style={styles.sub}>
        현재 Error DNA와 관련 기억을 바탕으로 다음 문제에서 발생할 가능성이 높은 실수를 예측합니다.
      </Body>

      {phase === 'loading' ? <LoadingState message="당신의 다음 실수를 예측하고 있어요" /> : null}
      {phase === 'error' ? <ErrorState message="예측에 실패했습니다." onRetry={run} /> : null}

      {phase === 'empty' ? (
        <Card>
          <Body>
            아직 예측할 데이터가 없어요. 문제를 몇 개 풀면 당신만의 Error DNA가 쌓이고, 그에 맞춘 예측을
            보여드릴게요.
          </Body>
          <Button label="첫 문제 풀기" onPress={() => router.push('/practice')} />
        </Card>
      ) : null}

      {phase === 'done' && prediction ? (
        <>
          <PredictionCard prediction={prediction} />
          <SectionTitle>왜 이렇게 예측했나요?</SectionTitle>
          <Card tone="muted">
            <Body>{prediction.reason}</Body>
          </Card>
          <Button
            label="🎯 이 실수를 유발하는 Trap 문제 받기"
            variant="violet"
            onPress={() => router.push({ pathname: '/trap', params: { target: prediction.predictedErrorType } })}
          />
        </>
      ) : null}

      <View style={styles.gap} />
      <Button label="홈으로" variant="ghost" onPress={() => goToMain(router)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginBottom: spacing.lg },
  gap: { height: spacing.md },
});
