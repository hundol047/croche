import { goToMain } from '@/utils/navigation';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ActionRow } from '@/components/ActionRow';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Pill } from '@/components/Pill';
import { Title, Body, Caption } from '@/components/typography';
import { ArrowIcon } from '@/components/icons';
import { colors, spacing, typography } from '@/constants/theme';
import { DEMO_SUBJECTS, problemsBySubject } from '@/content/problems';
import { useApp } from '@/state/AppContext';
import { sessionStore } from '@/state/sessionStore';
import type { Subject, Problem } from '@/domain/types';
import { issuePractice } from '@/domain/questionIssuance';
import { practiceVariants } from '@/content/practiceVariants';

export default function PracticeIndex() {
  const router = useRouter();
  const { ai, repos, profile } = useApp();
  const [subject, setSubject] = useState<Subject>('공업수학');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [exhausted, setExhausted] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setRemaining(null); setExhausted(false); setError(false);
    if (profile && ai.kind === 'mock') void repos.learning.get(profile.userId).then((state) => {
      if (!active) return;
      const seen = (state.issued ?? []).filter((q) => q.kind === 'practice' && q.subject === subject).map((q) => q.text);
      const left = practiceVariants(subject).filter((p) => !seen.includes(p.prompt)).length;
      setRemaining(left); setExhausted(left === 0);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [repos, profile, ai, subject]));

  const problems = problemsBySubject(subject);

  const openProblem = async (p: Problem) => {
    try { await sessionStore.startPractice(p); router.push('/practice/solve'); }
    catch { setError(true); }
  };

  const generate = async () => {
    if (!profile || generating) return;
    setGenerating(true);
    setError(false);
    try {
      const next = await issuePractice(repos, ai, profile.userId, subject);
      await openProblem(next);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('EXHAUSTED:')) setExhausted(true);
      else setError(true);
    }
    finally { setGenerating(false); }
  };

  return (
    <Screen>
      <Title>문제 풀기</Title>
      <Body muted style={styles.sub}>과목을 고르고 풀 문제를 선택하세요.</Body>
      <View style={styles.choices}>
        {DEMO_SUBJECTS.map((s) => <Pill key={s} label={s} selected={subject === s} onPress={() => setSubject(s)} />)}
      </View>

      <View style={styles.list}>
        {problems.map((p) => <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`${p.topic} 문제 풀기`}
          onPress={() => openProblem(p)} style={({ pressed }) => [styles.problem, pressed ? styles.pressed : undefined]}>
          <View style={styles.problemHeader}>
            <Text style={styles.topic}>{p.topic}</Text>
            <Text style={styles.difficulty}>{difficultyLabel(p.difficulty)}</Text>
            <ArrowIcon size={18} />
          </View>
          <Text style={styles.prompt} numberOfLines={3}>{p.prompt}</Text>
        </Pressable>)}
      </View>

      <Button label="새 문제 만들기" variant="secondary" loading={generating} disabled={exhausted} onPress={generate} testID="generate-problem" />
      <Caption style={styles.hint}>{remaining !== null ? `준비된 추가 문제 · 남은 ${remaining}개` : '새 문제도 같은 학습 기록에 연결됩니다.'}</Caption>
      {exhausted ? <Body>이 과목의 추가 문제를 모두 열어봤습니다. 위의 기본 문제를 다시 연습하거나 다른 과목을 선택하세요.</Body> : null}
      {error ? <ErrorState message="문제를 불러오지 못했어요." onRetry={generate} /> : null}
      <ActionRow label="홈으로" onPress={() => goToMain(router)} quiet />
    </Screen>
  );
}

function difficultyLabel(d: Problem['difficulty']): string {
  return d === 'easy' ? '쉬움' : d === 'medium' ? '보통' : '어려움';
}

const styles = StyleSheet.create({
  sub: { marginTop: spacing.sm, marginBottom: spacing.xl },
  choices: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  list: { borderTopWidth: 1, borderTopColor: colors.border, marginBottom: spacing.xl },
  problem: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  problemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  topic: { ...typography.section, flex: 1, color: colors.text, marginRight: spacing.sm },
  difficulty: { ...typography.caption, color: colors.textMuted, marginRight: spacing.md },
  prompt: { ...typography.body, fontSize: 14, color: colors.textMuted },
  hint: { marginTop: spacing.sm, marginBottom: spacing.md },
  pressed: { opacity: 0.7 },
});
