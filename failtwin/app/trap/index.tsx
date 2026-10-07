import { goToMain } from '@/utils/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ActionRow } from '@/components/ActionRow';
import { Section } from '@/components/Section';
import { TrapCard } from '@/components/TrapCard';
import { ConfidenceSelector } from '@/components/ConfidenceSelector';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Title, Body, Caption } from '@/components/typography';
import { CheckIcon, TargetIcon, ArrowIcon } from '@/components/icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { useErrorDNA } from '@/state/useErrorDNA';
import { buildMemoryContext } from '@/domain/memorySelect';
import { errorTypeLabel } from '@/domain/errorTypes';
import { recordTrap } from '@/domain/learningEvents';
import { sessionStore } from '@/state/sessionStore';
import { uid } from '@/utils/id';
import { nowIso } from '@/utils/date';
import type { TrapProblem, Confidence, ErrorType, Subject, Attempt, TrapResult as StoredTrapResult } from '@/domain/types';

type Phase = 'intro' | 'generating' | 'solving' | 'error' | 'result';

export default function Trap() {
  const router = useRouter();
  const { ai, dna, profile, repos, refresh, traps: trapHistory } = useApp();
  const { strongest } = useErrorDNA();

  const { target: requestedTarget } = useLocalSearchParams<{ target?: string }>();
  const targetEntry = dna.find((e) => e.errorType === requestedTarget) ?? strongest;
  const target: ErrorType = targetEntry?.errorType ?? 'verification_omission';
  const savedTrap = sessionStore.get('currentTrap');
  const canResume = savedTrap && (!requestedTarget || savedTrap.targetErrorType === requestedTarget);
  const [trap, setTrap] = useState<TrapProblem | null>(canResume ? savedTrap : null);
  const [phase, setPhase] = useState<Phase>(canResume ? 'solving' : 'intro');
  const [answer, setAnswer] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [confidence, setConfidence] = useState<Confidence>('medium');
  const [result, setResult] = useState<StoredTrapResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const submitting = useRef(false);
  const [savedAttempt] = useState(canResume ? sessionStore.get('trapAttempt') : undefined);

  useEffect(() => {
    if (!savedAttempt || !trap || !profile) return;
    let active = true;
    void recordTrap(repos, trap, savedAttempt).then(async (restored) => {
      if (!active) return;
      setResult(restored);
      setPhase('result');
      await refresh();
    }).catch(() => { if (active) setSaveError(true); });
    return () => { active = false; };
    // Restore only the attempt captured when this route mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAttempt, repos]);

  const generate = async () => {
    setPhase('generating');
    setSaveError(false);
    try {
      const subject: Subject = (targetEntry?.subject as Subject) ?? '공업수학';
      const res = await ai.generateTrapProblem({
        targetErrorType: target, subject,
        recentTopics: [...dna.slice(0, 3).map((e) => e.topic), ...trapHistory.map((t) => t.topic ?? ''), ...(trap ? [trap.topic] : [])],
        relevantMemories: buildMemoryContext(dna, { subject, topic: targetEntry?.topic ?? '' }),
      });
      if (!res.ok) { setPhase('error'); return; }
      await sessionStore.startTrap(res.value, uid('trapq'));
      setTrap(res.value);
      setResult(null);
      setAnswer('');
      setReasoning('');
      setPhase('solving');
    } catch { setPhase('error'); }
  };

  const submit = async () => {
    if (!trap || !profile || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setSaveError(false);
    try {
      const previous = sessionStore.get('trapAttempt');
      const attempt: Attempt = previous ?? {
        id: uid('trap'), userId: profile.userId,
        problemId: sessionStore.get('trapId') ?? uid('trapq'),
        userAnswer: answer.trim(), userReasoning: reasoning.trim(), confidence, createdAt: nowIso(),
      };
      await sessionStore.set('trapAttempt', attempt);
      const outcome = await recordTrap(repos, trap, attempt);
      setResult(outcome);
      setPhase('result');
      await refresh();
    } catch { setSaveError(true); }
    finally { submitting.current = false; setBusy(false); }
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="홈으로 돌아가기" onPress={() => goToMain(router)} hitSlop={8}>
          <View style={styles.back}><ArrowIcon direction="left" /></View>
        </Pressable>
        <Caption>실수 패턴 집중 훈련</Caption>
      </View>
      <Title>Trap Mode</Title>
      {phase === 'intro' ? <>
        <TrapCard targetErrorType={target}>
          <Body style={styles.trapIntro}>같은 실수 유형을 노리는 새로운 문제를 풀어보세요. 답을 제출하면 패턴을 확인하고 기록에 반영합니다.</Body>
        </TrapCard>
        <Body muted style={styles.introNote}>나를 틀리게 만드는 문제로, 시험 전에 반복 패턴을 확인합니다.</Body>
        <Button label="집중 훈련 시작" variant="trap" onPress={generate} testID="trap-start" />
      </> : null}
      {phase === 'generating' ? <LoadingState message="맞춤 문제 준비 중" /> : null}
      {phase === 'error' ? <><ErrorState message="문제 생성이나 저장에 실패했어요." onRetry={generate} /><ActionRow label="홈으로" onPress={() => goToMain(router)} quiet /></> : null}
      {saveError ? <ErrorState message="결과를 저장하지 못했어요. 다시 시도해주세요." onRetry={submit} /> : null}

      {phase === 'solving' && trap ? <>
        <View style={styles.targetTag}><TargetIcon size={16} /><Text style={styles.targetTagText}>타깃: {errorTypeLabel(trap.targetErrorType)}</Text></View>
        <Card>
          <Caption>{trap.subject} · {trap.topic}</Caption>
          <Text style={styles.question}>{trap.question}</Text>
          {trap.answerType === 'mcq' && trap.options ? <View style={styles.options}>
            {trap.options.map((o) => <Text key={o} style={styles.option}>• {o}</Text>)}
          </View> : null}
        </Card>
        <Caption>내 답</Caption>
        <TextInput style={styles.input} placeholder="답을 입력" placeholderTextColor={colors.textFaint}
          value={answer} onChangeText={setAnswer} accessibilityLabel="Trap 답 입력" />
        <Caption style={styles.spacer}>풀이 과정 (선택)</Caption>
        <TextInput style={[styles.input, styles.multiline]} placeholder="어떤 조건을 확인했는지 함께 적어주세요."
          placeholderTextColor={colors.textFaint} value={reasoning} onChangeText={setReasoning} multiline accessibilityLabel="Trap 풀이 과정 입력" />
        <View style={styles.spacer}><ConfidenceSelector value={confidence} onChange={setConfidence} /></View>
        <View style={styles.spacer}><Button label="제출" variant="trap" onPress={submit} loading={busy}
          disabled={answer.trim().length === 0} testID="trap-submit" /></View>
      </> : null}

      {phase === 'result' && trap && result ? <TrapResult trap={trap} result={result} onRetry={generate}
        onHome={() => goToMain(router)} onReport={() => goToMain(router, '/(tabs)/report')} /> : null}
    </Screen>
  );
}

function TrapResult({ trap, result, onRetry, onHome, onReport }: {
  trap: TrapProblem; result: StoredTrapResult; onRetry: () => void; onHome: () => void; onReport: () => void;
}) {
  const { solvedCorrectly, predictionHit } = result;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [opacity]);
  const accent = solvedCorrectly ? colors.success : predictionHit ? colors.warning : colors.brand;
  const bannerTitle = solvedCorrectly ? 'Trap 극복' : predictionHit ? '예측 적중 (Prediction HIT)' : '함께 교정해봐요';

  return <>
    <Animated.View style={[styles.resultBanner, { opacity, borderLeftColor: accent,
      backgroundColor: solvedCorrectly ? colors.successTint : colors.brandTint }]}>
      {solvedCorrectly ? <CheckIcon size={22} color={accent} /> : <TargetIcon size={22} color={accent} />}
      <Text style={styles.resultTitle}>{bannerTitle}</Text>
    </Animated.View>

    <Card>
      {result.beforeScore != null && result.afterScore != null ? <View style={styles.dna}>
        <Text style={styles.dnaTitle}>Error DNA 변화</Text>
        <Body>{errorTypeLabel(solvedCorrectly ? trap.targetErrorType : result.actualErrorType!)} {Math.round(result.beforeScore)} → {Math.round(result.afterScore)}</Body>
      </View> : null}
      <Section title="이 문제가 노린 실수" first>
        <Text style={styles.pattern}>{errorTypeLabel(trap.targetErrorType)}</Text>
        <Body muted>{trap.trapExplanation}</Body>
      </Section>
      <Section title="정답과 해설">
        <Text style={styles.answer}>정답: {trap.correctAnswer}</Text>
        <Body muted>{trap.explanation}</Body>
      </Section>
    </Card>

    <Body muted style={styles.resultNote}>{solvedCorrectly
      ? `이번 문제를 맞혔어요. ${errorTypeLabel(trap.targetErrorType)} 교정 결과를 학습 기록에 반영했습니다.`
      : predictionHit
        ? `이번 문제에서도 ${errorTypeLabel(trap.targetErrorType)} 패턴이 나타났어요. 해설을 확인하고 다른 문제로 연습해보세요.`
        : result.actualErrorType ? '예상과는 다른 실수가 관찰됐어요. 해설을 보고 다시 도전해봐요.'
        : '답만으로는 실수 유형을 확인하기 어려워요. 예측 적중으로 집계하지 않고 해설을 안내합니다.'}</Body>
    {solvedCorrectly ? <>
      <Button label="학습 리포트 보기" onPress={onReport} />
      <ActionRow label="다시 도전" onPress={onRetry} />
    </> : <>
      <Button label="다시 도전" variant="trap" onPress={onRetry} />
      <ActionRow label="학습 리포트 보기" onPress={onReport} />
    </>}
    <ActionRow label="홈으로" onPress={onHome} quiet />
  </>;
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  back: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  trapIntro: { color: colors.onDarkMuted },
  introNote: { marginBottom: spacing.xl },
  targetTag: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg },
  targetTagText: { ...typography.caption, color: colors.brand, marginLeft: spacing.sm },
  question: { ...typography.body, color: colors.text, marginTop: spacing.sm },
  options: { marginTop: spacing.md },
  option: { ...typography.body, color: colors.text, marginBottom: spacing.xs },
  input: { ...typography.body, color: colors.text, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.controlBorder,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 48, marginTop: spacing.sm },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  spacer: { marginTop: spacing.lg },
  resultBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.sm, borderLeftWidth: 2,
    padding: spacing.lg, marginVertical: spacing.lg },
  resultTitle: { ...typography.section, color: colors.text, marginLeft: spacing.sm, flex: 1 },
  dna: { borderLeftWidth: 2, borderLeftColor: colors.brand, paddingLeft: spacing.md, marginBottom: spacing.xl },
  dnaTitle: { ...typography.caption, color: colors.brand, marginBottom: spacing.xs },
  pattern: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.sm },
  answer: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.sm },
  resultNote: { marginBottom: spacing.xl },
});
