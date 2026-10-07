import { goToMain } from '@/utils/navigation';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Pill } from '@/components/Pill';
import { Title, SectionTitle, Body, Caption } from '@/components/typography';
import { Sparkle } from '@/components/icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { DEMO_SUBJECTS, problemsBySubject } from '@/content/problems';
import { useApp } from '@/state/AppContext';
import { sessionStore } from '@/state/sessionStore';
import type { Subject, Problem } from '@/domain/types';

export default function PracticeIndex() {
  const router = useRouter();
  const { ai } = useApp();
  const [subject, setSubject] = useState<Subject>('공업수학');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);

  const problems = problemsBySubject(subject);

  const openProblem = async (p: Problem) => {
    try { await sessionStore.startPractice(p); router.push('/practice/solve'); }
    catch { setError(true); }
  };

  const generate = async () => {
    setGenerating(true);
    setError(false);
    try {
      const res = await ai.generateProblem({ subject });
      if (!res.ok) { setError(true); return; }
      await openProblem(res.value);
    } catch { setError(true); }
    finally { setGenerating(false); }
  };

  return (
    <Screen>
      <Title>문제 풀기</Title>
      <Body muted style={styles.sub}>
        과목을 고르고 문제를 선택하거나, AI에게 새 문제를 요청하세요.
      </Body>

      <View style={styles.pillRow}>
        {DEMO_SUBJECTS.map((s) => (
          <Pill key={s} label={s} tone="indigo" selected={subject === s} onPress={() => setSubject(s)} />
        ))}
      </View>

      <Button
        label="✨ AI에게 새 문제 요청"
        variant="violet"
        loading={generating}
        onPress={generate}
        testID="generate-problem"
      />

      {error ? <ErrorState message="문제를 불러오지 못했어요." onRetry={generate} /> : null}
      <Button label="홈으로" variant="ghost" onPress={() => goToMain(router)} />

      <SectionTitle>{subject} 문제</SectionTitle>
      {problems.map((p) => (
        <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`${p.topic} 문제 풀기`} onPress={() => openProblem(p)}>
          <Card>
            <View style={styles.cardHeader}>
              <Text style={styles.topic}>{p.topic}</Text>
              <View style={styles.diffBadge}>
                <Text style={styles.diffText}>{difficultyLabel(p.difficulty)}</Text>
              </View>
            </View>
            <Text style={styles.prompt} numberOfLines={3}>
              {p.prompt}
            </Text>
            <View style={styles.cardFooter}>
              <Caption>탭하여 풀기 →</Caption>
            </View>
          </Card>
        </Pressable>
      ))}

      <View style={styles.hint}>
        <Sparkle size={14} color={colors.textFaint} />
        <Caption>AI 생성 문제는 당신의 Error DNA와 연결되어 분석됩니다.</Caption>
      </View>
    </Screen>
  );
}

function difficultyLabel(d: Problem['difficulty']): string {
  return d === 'easy' ? '쉬움' : d === 'medium' ? '보통' : '어려움';
}

const styles = StyleSheet.create({
  sub: { marginBottom: spacing.lg },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  topic: { ...typography.section, color: colors.text },
  diffBadge: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  diffText: { ...typography.caption, color: colors.textMuted },
  prompt: { ...typography.body, color: colors.textMuted, lineHeight: 21 },
  cardFooter: { marginTop: spacing.md },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
});
