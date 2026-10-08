import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ErrorState } from '@/components/ErrorState';
import { assessAnswer } from '@/domain/answerAssessment';
import { Button } from '@/components/Button';
import { ConfidenceSelector } from '@/components/ConfidenceSelector';
import { ArrowIcon } from '@/components/icons';
import { Title, Body, Caption } from '@/components/typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { sessionStore } from '@/state/sessionStore';
import { uid } from '@/utils/id';
import { nowIso } from '@/utils/date';
import { educationLabel } from '@/domain/curriculum';
import type { Confidence, Attempt } from '@/domain/types';

export default function Solve() {
  const router = useRouter();
  const { profile } = useApp();
  const problem = sessionStore.get('currentProblem');

  const saved = sessionStore.get('currentAttempt');
  const [answer, setAnswer] = useState(saved?.userAnswer ?? '');
  const [guidance, setGuidance] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [reasoning, setReasoning] = useState(saved?.userReasoning ?? '');
  const [confidence, setConfidence] = useState<Confidence>(saved?.confidence ?? 'medium');

  if (!problem) {
    return (
      <Screen>
        <Body>문제를 불러오지 못했어요.</Body>
        <Button label="돌아가기" variant="ghost" onPress={() => router.navigate('/practice')} />
      </Screen>
    );
  }

  const submit = async () => {
    if (!profile || busy) return;
    const assessment = assessAnswer(problem, answer);
    if (assessment.verdict === 'ungradable') { setGuidance(assessment.guidance); return; }
    setGuidance('');
    setBusy(true);
    setError(false);
    const attempt: Attempt = {
      id: uid('attempt'),
      userId: profile?.userId ?? 'anon',
      problemId: problem.id,
      userAnswer: answer.trim(),
      userReasoning: reasoning.trim() || undefined,
      confidence,
      createdAt: nowIso(),
    };
    try {
      await sessionStore.set('currentAttempt', attempt);
      router.push('/analysis');
    } catch { setError(true); }
    finally { setBusy(false); }
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="문제 목록으로 돌아가기" onPress={() => router.navigate('/practice')} hitSlop={12}>
          <View style={styles.back}><ArrowIcon direction="left" /></View>
        </Pressable>
        <Caption style={styles.context}>{educationLabel[problem.educationLevel??'university']} · {problem.subject} · {problem.topic}</Caption>
      </View>

      <View style={styles.question}>
        <Title style={styles.qTitle}>문제</Title>
        <Text style={styles.prompt}>{problem.prompt}</Text>
        {problem.answerType === 'mcq' && problem.options ? (
          <View style={styles.options}>
            {problem.options.map((o) => (
              <Pressable key={o} accessibilityRole="button" aria-pressed={answer===o} accessibilityState={{selected:answer===o}} accessibilityLabel={`보기 ${o}`} onPress={()=>{setAnswer(o);setGuidance('');}} style={[styles.optionButton,answer===o?styles.selectedOption:undefined]}><Text style={styles.option}>{o}</Text></Pressable>
            ))}
            <Caption style={styles.mcqHint}>보기를 선택하거나 직접 입력하세요. 복수 정답은 쉼표로 입력하세요.</Caption>
          </View>
        ) : null}
      </View>

      <Caption>내 답</Caption>
      <TextInput
        style={styles.input}
        placeholder={problem.answerType === 'numeric' ? '숫자를 입력' : '답을 입력'}
        placeholderTextColor={colors.textFaint}
        value={answer}
        onChangeText={(text) => { setAnswer(text); setGuidance(''); }}
        keyboardType={problem.answerType === 'numeric' ? 'numbers-and-punctuation' : 'default'}
        accessibilityLabel="답 입력"
      />
      {guidance ? <View accessibilityLiveRegion="polite" style={styles.guidance}>
        <Text style={styles.guidanceTitle}>판정 불가</Text>
        <Body>{guidance}</Body><Caption>학습 기록과 Error DNA에는 반영하지 않았습니다.</Caption>
      </View> : null}

      <Caption style={styles.spacer}>풀이 과정 (선택)</Caption>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="어떤 조건을 확인했는지 함께 적어주세요."
        placeholderTextColor={colors.textFaint}
        value={reasoning}
        onChangeText={setReasoning}
        multiline
        accessibilityLabel="풀이 과정 입력"
      />

      <View style={styles.spacer}>
        <ConfidenceSelector value={confidence} onChange={setConfidence} />
      </View>

      {error ? <ErrorState message="답을 저장하지 못했어요. 다시 시도해주세요." onRetry={submit} /> : null}
      <View style={styles.submit}>
        <Button label="답 제출하고 분석 보기" onPress={submit} loading={busy} disabled={answer.trim().length === 0} testID="submit-answer" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  back: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  context: { flex: 1 },
  qTitle: { ...typography.section, marginBottom: spacing.sm },
  question: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: spacing.lg, marginBottom: spacing.xl },
  guidance: { borderLeftWidth: 2, borderLeftColor: colors.controlBorder, paddingLeft: spacing.md, marginTop: spacing.md },
  guidanceTitle: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.xs },
  prompt: { ...typography.body, color: colors.text, lineHeight: 24 },
  options: { marginTop: spacing.md },
  optionButton: {minHeight:48,justifyContent:'center',padding:spacing.md,borderWidth:1,borderColor:colors.controlBorder,marginBottom:spacing.sm,borderRadius:radius.md},
  selectedOption:{borderColor:colors.brand,backgroundColor:colors.surface},
  option: { ...typography.body, color: colors.text, marginBottom: 4 },
  mcqHint: { marginTop: spacing.sm },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
    marginTop: spacing.sm,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  spacer: { marginTop: spacing.lg },
  submit: { marginTop: spacing.xl },
});
