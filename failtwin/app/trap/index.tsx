import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TrapCard } from '@/components/TrapCard';
import { ConfidenceSelector } from '@/components/ConfidenceSelector';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Title, SectionTitle, Body, Caption } from '@/components/typography';
import { CheckIcon, TargetIcon } from '@/components/icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { useErrorDNA } from '@/state/useErrorDNA';
import { buildMemoryContext } from '@/domain/memorySelect';
import { errorTypeLabel } from '@/domain/errorTypes';
import { applyMistake, applyCorrection, findEntry, upsertEntry } from '@/domain/errorDnaEngine';
import { checkAnswer, inferTrapErrorType } from '@/domain/trapEval';
import { uid } from '@/utils/id';
import { nowIso } from '@/utils/date';
import type { TrapProblem, Confidence, ErrorType, Subject } from '@/domain/types';

type Phase = 'intro' | 'generating' | 'solving' | 'error' | 'result';

export default function Trap() {
  const router = useRouter();
  const { ai, dna, profile, repos, refresh } = useApp();
  const { strongest } = useErrorDNA();

  const [phase, setPhase] = useState<Phase>('intro');
  const [trap, setTrap] = useState<TrapProblem | null>(null);
  const [answer, setAnswer] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [confidence, setConfidence] = useState<Confidence>('medium');
  const [solvedCorrectly, setSolvedCorrectly] = useState(false);
  const [predictionHit, setPredictionHit] = useState(false);

  const target: ErrorType = strongest?.errorType ?? 'verification_omission';

  const generate = async () => {
    setPhase('generating');
    const subject: Subject = (strongest?.subject as Subject) ?? '공업수학';
    const recentTopics = dna.slice(0, 3).map((e) => e.topic);
    const memories = buildMemoryContext(dna, { subject, topic: strongest?.topic ?? '' });
    const res = await ai.generateTrapProblem({
      targetErrorType: target,
      subject,
      recentTopics,
      relevantMemories: memories,
    });
    if (!res.ok) {
      setPhase('error');
      return;
    }
    setTrap(res.value);
    setAnswer('');
    setReasoning('');
    setPhase('solving');
  };

  const submit = async () => {
    if (!trap || !profile) return;
    const correct = checkAnswer(trap, answer);
    setSolvedCorrectly(correct);

    // Did the AI's targeted mistake actually happen?
    const actualError = correct ? undefined : inferTrapErrorType(trap, answer, reasoning);
    const hit = !correct && actualError === trap.targetErrorType;
    setPredictionHit(hit);

    // Update Error DNA deterministically from the trap outcome.
    let entries = await repos.dna.get(profile.userId);
    if (correct) {
      const existing = findEntry(entries, trap.targetErrorType);
      if (existing) {
        entries = upsertEntry(entries, applyCorrection(existing, { confidence }));
      }
    } else {
      const et = (actualError ?? trap.targetErrorType) as ErrorType;
      const existing = findEntry(entries, et);
      entries = upsertEntry(
        entries,
        applyMistake(existing, {
          userId: profile.userId,
          subject: trap.subject,
          topic: trap.topic,
          errorType: et,
          severity: 3,
        }),
      );
    }
    await repos.dna.save(profile.userId, entries);

    // Persist the trap result.
    await repos.traps.add(profile.userId, {
      id: uid('trap'),
      userId: profile.userId,
      trapProblemId: uid('trapq'),
      targetErrorType: trap.targetErrorType,
      actualErrorType: actualError,
      predictionHit: hit,
      solvedCorrectly: correct,
      createdAt: nowIso(),
    });

    await refresh();
    setPhase('result');
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Caption>FailTwin의 핵심 기능</Caption>
      </View>

      {phase === 'intro' ? (
        <>
          <TrapCard targetErrorType={target}>
            <Body style={styles.trapIntro}>
              당신의 Error DNA에서 가장 강한 실수 유형을 골라, 같은 실수를 유발하되 내용은 새로운 문제를
              AI가 설계합니다. 시험 전에 당신의 실수를 미리 경험하고 교정하세요.
            </Body>
          </TrapCard>
          <Card tone="muted">
            <Body muted>
              목표는 당신을 틀리게 만드는 것이 아니라, 반복되는 실수를 <Body>인지하고 교정</Body>하도록 돕는
              것입니다.
            </Body>
          </Card>
          <Button label="나를 틀리게 만드는 문제 받기" variant="violet" onPress={generate} testID="trap-start" />
        </>
      ) : null}

      {phase === 'generating' ? (
        <LoadingState message="당신이 가장 실수하기 쉬운 문제를 설계하고 있어요" />
      ) : null}

      {phase === 'error' ? <ErrorState message="문제 생성에 실패했습니다." onRetry={generate} /> : null}

      {phase === 'solving' && trap ? (
        <>
          <View style={[styles.targetTag, { backgroundColor: colors.violet }]}>
            <TargetIcon size={16} color={colors.onDark} />
            <Text style={styles.targetTagText}>타깃: {errorTypeLabel(trap.targetErrorType)}</Text>
          </View>
          <Card>
            <Caption>{trap.subject} · {trap.topic}</Caption>
            <Text style={styles.question}>{trap.question}</Text>
            {trap.answerType === 'mcq' && trap.options ? (
              <View style={styles.options}>
                {trap.options.map((o) => (
                  <Text key={o} style={styles.option}>• {o}</Text>
                ))}
              </View>
            ) : null}
          </Card>

          <Caption>내 답</Caption>
          <TextInput
            style={styles.input}
            placeholder="답을 입력"
            placeholderTextColor={colors.textFaint}
            value={answer}
            onChangeText={setAnswer}
            accessibilityLabel="Trap 답 입력"
          />
          <Caption style={styles.spacer}>풀이 과정 (선택)</Caption>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="풀이를 적으면 예측 적중 판정이 더 정확해져요."
            placeholderTextColor={colors.textFaint}
            value={reasoning}
            onChangeText={setReasoning}
            multiline
          />
          <View style={styles.spacer}>
            <ConfidenceSelector value={confidence} onChange={setConfidence} />
          </View>
          <View style={styles.spacer}>
            <Button label="제출" variant="violet" onPress={submit} disabled={answer.trim().length === 0} testID="trap-submit" />
          </View>
        </>
      ) : null}

      {phase === 'result' && trap ? (
        <TrapResult
          trap={trap}
          solvedCorrectly={solvedCorrectly}
          predictionHit={predictionHit}
          onRetry={generate}
          onHome={() => router.replace('/(tabs)')}
          onReport={() => router.replace('/(tabs)/report')}
        />
      ) : null}
    </Screen>
  );
}

function TrapResult({
  trap,
  solvedCorrectly,
  predictionHit,
  onRetry,
  onHome,
  onReport,
}: {
  trap: TrapProblem;
  solvedCorrectly: boolean;
  predictionHit: boolean;
  onRetry: () => void;
  onHome: () => void;
  onReport: () => void;
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, [scale]);

  const bannerColor = solvedCorrectly ? colors.success : predictionHit ? colors.violet : colors.indigo;
  const bannerTitle = solvedCorrectly ? 'Trap 극복! 🎉' : predictionHit ? '예측 적중 (Prediction HIT)' : '함께 교정해봐요';

  return (
    <>
      <Animated.View style={[styles.resultBanner, { backgroundColor: bannerColor, transform: [{ scale }] }]}>
        {solvedCorrectly ? <CheckIcon size={30} color={colors.onDark} /> : <TargetIcon size={28} color={colors.onDark} />}
        <Text style={styles.resultTitle}>{bannerTitle}</Text>
      </Animated.View>

      <Card>
        <SectionTitle>이 문제가 노린 실수</SectionTitle>
        <Body>{errorTypeLabel(trap.targetErrorType)}</Body>
        <View style={styles.divider} />
        <Caption>왜 이 문제가 함정인가</Caption>
        <Body style={styles.trapExp}>{trap.trapExplanation}</Body>
      </Card>

      <Card tone="muted">
        <SectionTitle>정답 & 해설</SectionTitle>
        <Body>정답: {trap.correctAnswer}</Body>
        <Body muted style={styles.exp}>{trap.explanation}</Body>
      </Card>

      {solvedCorrectly ? (
        <Card>
          <Body>
            이 유형의 실수를 극복했어요. 해당 Error DNA 점수가 내려갔습니다. 같은 함정을 반복해 완전히 몸에
            익혀보세요.
          </Body>
        </Card>
      ) : (
        <Card>
          <Body>
            {predictionHit
              ? 'AI가 예측한 실수가 실제로 나타났어요. 지금 그 패턴을 인지한 것이 교정의 시작입니다.'
              : '예상과는 다른 지점에서 어긋났어요. 해설을 보고 다시 도전해봐요.'}
          </Body>
        </Card>
      )}

      <Button label="다시 도전" variant="violet" onPress={onRetry} />
      <View style={styles.gap} />
      <Button label="학습 리포트 보기" onPress={onReport} />
      <View style={styles.gap} />
      <Button label="홈으로" variant="ghost" onPress={onHome} />
    </>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  back: { fontSize: 24, color: colors.text, marginRight: spacing.md },
  trapIntro: { color: colors.onDark, lineHeight: 23 },
  targetTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.md,
  },
  targetTagText: { ...typography.caption, fontSize: 13, fontWeight: '700', color: colors.onDark, marginLeft: spacing.xs },
  question: { ...typography.body, color: colors.text, lineHeight: 24, marginTop: spacing.sm },
  options: { marginTop: spacing.md },
  option: { ...typography.body, color: colors.text, marginBottom: 4 },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
    marginTop: spacing.sm,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  spacer: { marginTop: spacing.lg },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginVertical: spacing.lg,
  },
  resultTitle: { ...typography.title, color: colors.onDark, marginLeft: spacing.md, flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.md },
  trapExp: { marginTop: spacing.xs },
  exp: { marginTop: spacing.sm, lineHeight: 22 },
  gap: { height: spacing.md },
});
