import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Pill } from '@/components/Pill';
import { DnaIcon, Sparkle } from '@/components/icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { createRealProfile, seedDemo } from '@/state/onboarding';
import type { LearningGoal, Subject } from '@/domain/types';

const GOALS: LearningGoal[] = ['대학교 전공', '수능', '자격증', '코딩', '기타'];
const SUBJECTS: Subject[] = ['공업수학', '일반물리', 'Python 프로그래밍'];

export default function Onboarding() {
  const router = useRouter();
  const { repos, setProfile } = useApp();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState<LearningGoal>('대학교 전공');
  const [interests, setInterests] = useState<Subject[]>(['공업수학']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const toggleInterest = (s: Subject) => {
    setInterests((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const launch = async (demo: boolean) => {
    setBusy(true);
    setError(false);
    try {
      const profile = demo ? await seedDemo(repos) : await createRealProfile(repos, { name, goal, interests });
      await setProfile(profile);
      if (router.canDismiss()) router.dismissAll();
      router.replace('/(tabs)');
    } catch { setError(true); }
    finally { setBusy(false); }
  };
  const start = () => launch(false);
  const quickDemo = () => launch(true);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logoBadge}>
          <DnaIcon size={34} color={colors.onDark} />
        </View>
        <Text style={styles.brand}>FailTwin</Text>
        <View style={styles.taglineRow}>
          <Sparkle size={16} color={colors.violet} />
          <Text style={styles.tagline}>AI가 당신의 실수를 먼저 예측합니다</Text>
        </View>
      </View>

      <Card tone="muted">
        <Text style={styles.desc}>
          FailTwin은 당신이 <Text style={styles.descStrong}>무엇을 모르는지</Text>가 아니라{' '}
          <Text style={styles.descStrong}>어떻게 반복해서 틀리는지</Text>를 학습합니다. 풀이와 오답을
          분석해 개인별 Error DNA를 만들고, 다음 실수를 예측하며, 당신이 가장 실수하기 쉬운 맞춤 문제를
          시험 전에 미리 경험하게 합니다.
        </Text>
      </Card>

      <Card>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          placeholder="이름을 입력하세요"
          placeholderTextColor={colors.textFaint}
          value={name}
          onChangeText={setName}
          returnKeyType="done"
          accessibilityLabel="이름 입력"
        />

        <Text style={[styles.label, styles.spacer]}>주요 학습 목적</Text>
        <View style={styles.pillRow}>
          {GOALS.map((g) => (
            <Pill key={g} label={g} tone="indigo" selected={goal === g} onPress={() => setGoal(g)} />
          ))}
        </View>

        <Text style={[styles.label, styles.spacer]}>관심 과목</Text>
        <View style={styles.pillRow}>
          {SUBJECTS.map((s) => (
            <Pill
              key={s}
              label={s}
              tone="violet"
              selected={interests.includes(s)}
              onPress={() => toggleInterest(s)}
            />
          ))}
        </View>
      </Card>

      {error ? <ErrorState message="저장에 실패했어요. 브라우저의 저장 공간을 확인해주세요." onRetry={start} /> : null}
      <Button
        label="시작하기"
        onPress={start}
        loading={busy}
        disabled={interests.length === 0 || name.trim().length === 0}
        testID="onboarding-start"
      />
      <View style={styles.gap} />
      <Button
        label="⚡ 심사용 빠른 데모"
        variant="ghost"
        onPress={quickDemo}
        loading={busy}
        testID="onboarding-demo"
      />
      <Text style={styles.demoHint}>
        데모에는 예시 Error DNA가 미리 들어 있어 2분 안에 전체 흐름을 체험할 수 있어요.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.lg },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.indigo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brand: { ...typography.display, color: colors.text },
  taglineRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  tagline: { ...typography.body, color: colors.textMuted, marginLeft: spacing.xs },
  desc: { ...typography.body, color: colors.textMuted, lineHeight: 23 },
  descStrong: { color: colors.indigo, fontWeight: '700' },
  label: { ...typography.caption, fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  spacer: { marginTop: spacing.lg },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap' },
  gap: { height: spacing.md },
  demoHint: { ...typography.caption, color: colors.textFaint, textAlign: 'center', marginTop: spacing.md },
});
