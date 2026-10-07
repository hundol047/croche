import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ActionRow } from '@/components/ActionRow';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Pill } from '@/components/Pill';
import { DnaIcon } from '@/components/icons';
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
      <View style={styles.brandRow}><DnaIcon size={22} /><Text style={styles.brand}>FailTwin</Text></View>
      <Text style={styles.title}>반복되는 실수를{ '\n' }발견해보세요</Text>
      <Text style={styles.tagline}>AI가 당신의 실수를 먼저 예측합니다</Text>
      <Text style={styles.support}>풀이를 남기면 Error DNA로 실수 패턴을 기록하고, 같은 약점을 새로운 문제로 연습합니다.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>이름</Text>
        <TextInput style={styles.input} placeholder="이름을 입력하세요" placeholderTextColor={colors.textFaint}
          value={name} onChangeText={setName} returnKeyType="done" accessibilityLabel="이름 입력" />

        <Text style={[styles.label, styles.spacer]}>주요 학습 목적</Text>
        <View style={styles.choices}>
          {GOALS.map((g) => <Pill key={g} label={g} selected={goal === g} onPress={() => setGoal(g)} />)}
        </View>

        <Text style={[styles.label, styles.spacer]}>관심 과목 <Text style={styles.optional}>· 여러 개 선택 가능</Text></Text>
        <View style={styles.choices}>
          {SUBJECTS.map((s) => <Pill key={s} label={s} selected={interests.includes(s)} onPress={() => toggleInterest(s)} />)}
        </View>
      </View>

      {error ? <ErrorState message="저장에 실패했어요. 브라우저의 저장 공간을 확인해주세요." onRetry={start} /> : null}
      <Button label="시작하기" onPress={start} loading={busy}
        disabled={interests.length === 0 || name.trim().length === 0} testID="onboarding-start" />
      <View style={styles.demo}>
        <ActionRow label="심사용 빠른 데모" onPress={quickDemo} loading={busy} testID="onboarding-demo" quiet />
        <Text style={styles.demoHint}>예시 학습 기록으로 2분 안에 전체 흐름을 확인할 수 있어요.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.xxl },
  brand: { ...typography.section, color: colors.brand, marginLeft: spacing.sm },
  title: { ...typography.display, color: colors.text },
  tagline: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
  support: { ...typography.body, color: colors.textMuted, marginTop: spacing.md },
  form: { marginVertical: spacing.xxl },
  label: { ...typography.bodyStrong, fontSize: 13, color: colors.text, marginBottom: spacing.sm },
  optional: { ...typography.caption, color: colors.textMuted },
  spacer: { marginTop: spacing.xl },
  input: { ...typography.body, color: colors.text, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.controlBorder,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, minHeight: 48 },
  choices: { flexDirection: 'row', flexWrap: 'wrap' },
  demo: { marginTop: spacing.lg },
  demoHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
});
