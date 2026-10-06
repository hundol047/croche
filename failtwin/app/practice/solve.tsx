import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ConfidenceSelector } from '@/components/ConfidenceSelector';
import { Title, Body, Caption } from '@/components/typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { sessionStore } from '@/state/sessionStore';
import { uid } from '@/utils/id';
import { nowIso } from '@/utils/date';
import type { Confidence, Attempt } from '@/domain/types';

export default function Solve() {
  const router = useRouter();
  const { profile } = useApp();
  const problem = sessionStore.get('currentProblem');

  const [answer, setAnswer] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [confidence, setConfidence] = useState<Confidence>('medium');

  if (!problem) {
    return (
      <Screen>
        <Body>문제를 불러오지 못했어요.</Body>
        <Button label="돌아가기" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  const submit = () => {
    const attempt: Attempt = {
      id: uid('attempt'),
      userId: profile?.userId ?? 'anon',
      problemId: problem.id,
      userAnswer: answer.trim(),
      userReasoning: reasoning.trim() || undefined,
      confidence,
      createdAt: nowIso(),
    };
    sessionStore.set('currentAttempt', attempt);
    router.push('/analysis');
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Caption>{problem.subject} · {problem.topic}</Caption>
      </View>

      <Card>
        <Title style={styles.qTitle}>문제</Title>
        <Text style={styles.prompt}>{problem.prompt}</Text>
        {problem.answerType === 'mcq' && problem.options ? (
          <View style={styles.options}>
            {problem.options.map((o) => (
              <Text key={o} style={styles.option}>• {o}</Text>
            ))}
            <Caption style={styles.mcqHint}>정답을 입력란에 적어주세요 (복수 정답은 쉼표로).</Caption>
          </View>
        ) : null}
      </Card>

      <Caption>내 답</Caption>
      <TextInput
        style={styles.input}
        placeholder={problem.answerType === 'numeric' ? '숫자를 입력' : '답을 입력'}
        placeholderTextColor={colors.textFaint}
        value={answer}
        onChangeText={setAnswer}
        keyboardType={problem.answerType === 'numeric' ? 'numbers-and-punctuation' : 'default'}
        accessibilityLabel="답 입력"
      />

      <Caption style={styles.spacer}>풀이 과정 (선택)</Caption>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="어떻게 풀었는지 적으면 AI가 실수 원인을 더 정확히 분석해요."
        placeholderTextColor={colors.textFaint}
        value={reasoning}
        onChangeText={setReasoning}
        multiline
        accessibilityLabel="풀이 과정 입력"
      />

      <View style={styles.spacer}>
        <ConfidenceSelector value={confidence} onChange={setConfidence} />
      </View>

      <View style={styles.submit}>
        <Button label="제출하고 AI 분석 받기" onPress={submit} disabled={answer.trim().length === 0} testID="submit-answer" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  back: { fontSize: 24, color: colors.text, marginRight: spacing.md },
  qTitle: { fontSize: 18, marginBottom: spacing.sm },
  prompt: { ...typography.body, color: colors.text, lineHeight: 24 },
  options: { marginTop: spacing.md },
  option: { ...typography.body, color: colors.text, marginBottom: 4 },
  mcqHint: { marginTop: spacing.sm },
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
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  spacer: { marginTop: spacing.lg },
  submit: { marginTop: spacing.xl },
});
