import { goToMain } from '@/utils/navigation';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ActionRow } from '@/components/ActionRow';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Pill } from '@/components/Pill';
import { Title, SectionTitle, Body, Caption } from '@/components/typography';
import { ArrowIcon } from '@/components/icons';
import { colors, spacing, typography } from '@/constants/theme';
import { problemsBySubject } from '@/content/problems';
import { useApp } from '@/state/AppContext';
import { sessionStore } from '@/state/sessionStore';
import type { Subject, Problem, EducationLevel } from '@/domain/types';
import { issuePractice, practiceAvailability } from '@/domain/questionIssuance';
import { DIFFICULTIES, PROBLEMS_PER_DIFFICULTY, PROBLEMS_PER_SUBJECT, practiceProblemAt, type Difficulty } from '@/content/practiceVariants';

import { EDUCATION_LEVELS, educationLabel, curriculumSubjects, curriculumDescription, isCurriculumSubject } from '@/domain/curriculum';

type Availability = ReturnType<typeof practiceAvailability>;
const number = (n: number) => n.toLocaleString('ko-KR');
const difficultyLabel = (d: Difficulty) => d === 'easy' ? '쉬움' : d === 'medium' ? '보통' : '어려움';
const difficultyHint: Record<Difficulty, string> = {
  easy: '기본 개념을 한 단계씩 적용합니다.',
  medium: '조건을 확인하고 계산을 연결합니다.',
  hard: '여러 개념과 풀이 단계를 함께 다룹니다.',
};

export default function PracticeIndex() {
  const router = useRouter();
  const { ai, repos, profile } = useApp();
  const [level,setLevel]=useState<EducationLevel>(profile?.educationLevel??'university');
  const [ready,setReady]=useState(false);
  const [subject, setSubject] = useState<Subject>(profile?.interests.find(s=>isCurriculumSubject(profile.educationLevel??'university',s))??curriculumSubjects[profile?.educationLevel??'university'][0]!);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [generating, setGenerating] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [exhausted, setExhausted] = useState(false);

  useEffect(()=>{
    let active=true;
    if(profile)void repos.learning.get(profile.userId).then(s=>{
      if(!active)return;
      const selection=s.practiceSelection;
      if(selection && EDUCATION_LEVELS.includes(selection.educationLevel) && isCurriculumSubject(selection.educationLevel,selection.subject) && DIFFICULTIES.includes(selection.difficulty)){
        setLevel(selection.educationLevel);setSubject(selection.subject);setDifficulty(selection.difficulty);
      }
      setReady(true);
    }).catch(()=>{if(active){setReady(true);setError(true);}});
    return()=>{active=false;};
  },[repos,profile]);
  const loadAvailability = useCallback(async () => {
    if (!ready || !profile || ai.kind !== 'mock') return null;
    return practiceAvailability(await repos.learning.get(profile.userId), subject, difficulty, level);
  }, [repos, profile, ai, subject, difficulty, level, ready]);

  useFocusEffect(useCallback(() => {
    let active = true;
    setAvailability(null); setExhausted(false); setError(false);
    void loadAvailability().then((items) => {
      if (active) { setAvailability(items); setExhausted(items !== null && items.every(f => f.remaining === 0)); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [loadAvailability]));

  const openProblem = async (p: Problem) => {
    await sessionStore.startPractice(p);
    router.push('/practice/solve');
  };
  const generate = async (topic?: string) => {
    if (!profile || busy.current) return;
    busy.current = true; setGenerating(true); setError(false);
    try {
      const next = await issuePractice(repos, ai, profile.userId, subject, difficulty, topic, level);
      setAvailability(await loadAvailability());
      await openProblem(next);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('EXHAUSTED:')) setExhausted(true);
      else setError(true);
    } finally { busy.current = false; setGenerating(false); }
  };
  const remaining = availability?.reduce((count, f) => count + f.remaining, 0);

  return (
    <Screen>
      <Title>문제 풀기</Title>
      <Body muted style={styles.sub}>과목과 난이도를 고르고 연습을 시작하세요.</Body>
      <Caption>학습 단계</Caption>
      <View style={styles.choices}>{EDUCATION_LEVELS.map(l=><Pill key={l} label={educationLabel[l]} selected={level===l} onPress={generating?undefined:()=>{setLevel(l);setSubject(curriculumSubjects[l][0]!);}} />)}</View>
      <Caption>과목</Caption>
      <View style={styles.choices}>
        {curriculumSubjects[level].map(s => <Pill key={s} label={s} selected={subject === s} onPress={generating ? undefined : () => setSubject(s)} />)}
      </View>
      <View style={styles.choices}>
        {DIFFICULTIES.map(d => <Pill key={d} label={difficultyLabel(d)} selected={difficulty === d} onPress={generating ? undefined : () => setDifficulty(d)} />)}
      </View>
      <Body muted>{difficultyHint[difficulty]}</Body>
      <Caption style={styles.hint}>{curriculumDescription[level]}</Caption>
      <Caption style={styles.hint}>{ai.kind === 'mock' ? `${educationLabel[level]} ${subject} ${number(PROBLEMS_PER_SUBJECT)}개 · 난이도별 ${number(PROBLEMS_PER_DIFFICULTY)}개` : '선택한 과목과 난이도로 문제를 요청합니다.'}</Caption>
      <Button label="새 문제 풀기" loading={generating} disabled={exhausted || (ai.kind === 'mock' && !availability)} onPress={() => generate()} testID="generate-problem" />
      <Caption style={styles.hint}>{remaining !== undefined ? `${difficultyLabel(difficulty)} · 남은 ${number(remaining)} / ${number(PROBLEMS_PER_DIFFICULTY)}개` : '새 문제도 같은 학습 기록에 연결됩니다.'}</Caption>
      {exhausted ? <Body>선택한 난이도의 문제를 모두 열어봤습니다. 다른 난이도나 아래 기본 문제를 선택하세요.</Body> : null}
      {error ? <ErrorState message="문제를 불러오지 못했어요." onRetry={() => generate()} /> : null}

      {availability ? <View style={styles.section}>
        <SectionTitle>유형을 골라 연습하기</SectionTitle>
        <View style={styles.list}>
          {availability.map(f => <Pressable key={f.id} disabled={generating || f.remaining === 0} accessibilityRole="button"
            accessibilityState={{ disabled: generating || f.remaining === 0 }} accessibilityLabel={`${f.topic} 유형 풀기`}
            onPress={() => generate(f.topic)} style={({ pressed }) => [styles.typeRow, pressed ? styles.pressed : undefined]}>
            <Text style={styles.typeTopic}>{f.topic}</Text>
            <Text style={styles.count}>{f.remaining === 0 ? '모두 열어봄' : `${number(f.remaining)}개`}</Text>
            <ArrowIcon size={18} />
          </Pressable>)}
        </View>
        <Caption>유형별 조건·지문 조합 문제입니다. 독립적으로 집필한 기출 문항 수가 아닙니다. 이미 열린 문제는 다음 출제에서 제외됩니다. Mock AI · Croche 미연결</Caption>
      </View> : null}

      <View style={styles.section}>
        <ActionRow label="단원·기출 보기" hint="학년별 자체 문항 · 기출 수록 및 감수 상태" onPress={() => router.push('/curriculum')} testID="go-curriculum" />
        <SectionTitle>{level==='university'?'기본 문제 다시 풀기':'유형별 예시 다시 풀기'}</SectionTitle>
        <View style={styles.list}>
          {(level==='university'?problemsBySubject(subject):[0,1,2,3,4].map(i=>practiceProblemAt(subject,difficulty,i,level))).map(p => <Pressable key={p.id} disabled={generating} accessibilityState={{ disabled: generating }} accessibilityRole="button" accessibilityLabel={`${p.topic} 문제 풀기`}
            onPress={() => { void openProblem(p).catch(() => setError(true)); }} style={({ pressed }) => [styles.problem, pressed ? styles.pressed : undefined]}>
            <View style={styles.problemHeader}>
              <Text style={styles.topic}>{p.topic}</Text>
              <Text style={styles.count}>{difficultyLabel(p.difficulty)}</Text>
              <ArrowIcon size={18} />
            </View>
            <Text style={styles.prompt} numberOfLines={3}>{p.prompt}</Text>
          </Pressable>)}
        </View>
      </View>
      <ActionRow label="홈으로" onPress={() => goToMain(router)} quiet />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: spacing.sm, marginBottom: spacing.lg },
  choices: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  section: { marginTop: spacing.xl },
  list: { borderTopWidth: 1, borderTopColor: colors.border, marginBottom: spacing.md },
  problem: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  problemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  typeRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  typeTopic: { ...typography.body, flex: 1, color: colors.text, marginRight: spacing.sm },
  topic: { ...typography.section, flex: 1, color: colors.text, marginRight: spacing.sm },
  count: { ...typography.caption, color: colors.textMuted, marginRight: spacing.sm },
  prompt: { ...typography.body, fontSize: 14, color: colors.textMuted },
  hint: { marginTop: spacing.sm, marginBottom: spacing.md },
  pressed: { opacity: 0.7 },
});
