import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ActionRow } from '@/components/ActionRow';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Pill } from '@/components/Pill';
import { Body, Caption, SectionTitle, Title } from '@/components/typography';
import { colors, spacing, typography } from '@/constants/theme';
import { EDUCATION_LEVELS, curriculumSubjects, educationLabel, isCurriculumSubject } from '@/domain/curriculum';
import { curriculumUnits, type CurriculumUnit } from '@/content/curriculumUnits';
import { coverageGaps, COVERAGE_NOTICE } from '@/content/coverage';
import { OFFICIAL_EXAMS, OFFICIAL_SOURCE_PORTALS } from '@/content/officialExams';
import { HISTORY_FACTS } from '@/content/schoolHistory';
import { prepareCurriculum, pendingCurriculumProblem, finishCurriculumHandoff, unitAvailability, unitCompletion } from '@/domain/curriculumIssuance';
import { useApp } from '@/state/AppContext';
import { sessionStore } from '@/state/sessionStore';
import type { LearningState } from '@/storage/repositories';
import type { EducationLevel, Problem, Subject } from '@/domain/types';

type Mode = 'units' | 'exams' | 'review';
export default function CurriculumScreen() {
  const router = useRouter();
  const { profile, repos } = useApp();
  const initialLevel = profile?.educationLevel ?? 'university';
  const [level, setLevel] = useState<EducationLevel>(initialLevel);
  const [subject, setSubject] = useState<Subject>(profile?.interests.find(s => isCurriculumSubject(initialLevel, s)) ?? curriculumSubjects[initialLevel][0]!);
  const [group, setGroup] = useState('전체');
  const [mode, setMode] = useState<Mode>('units');
  const [state, setState] = useState<LearningState | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reviewUnit, setReviewUnit] = useState<string | null>(null);
  const [showGaps, setShowGaps] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const preparing = useRef(false);
  const pending = useRef<Problem | null>(null);
  const allUnits = useMemo(() => curriculumUnits(level, subject), [level, subject]);
  const groups = [...new Set(allUnits.map(u => u.group))];
  const visibleUnits = useMemo(() => allUnits.filter(u => group === '전체' || u.group === group), [allUnits, group]);
  const availability = useMemo(() => {
    try {
      return { rows: state ? visibleUnits.map(unit => ({ unit, ...unitAvailability(state, unit), ...unitCompletion(state, unit) })) : [], invalid: false };
    } catch { return { rows: [], invalid: true }; }
  }, [state, visibleUnits]);

  const reload = useCallback(async () => {
    if (!profile) return;
    try {
      const saved = await repos.learning.get(profile.userId);
      setState(saved);
      const prepared = pendingCurriculumProblem(saved);
      if (prepared) pending.current = prepared;
      setError('');
    }
    catch { setError('학습 기록을 불러오지 못했습니다. 저장 공간을 확인해주세요.'); }
  }, [profile, repos]);
  useFocusEffect(useCallback(() => { void reload(); }, [reload]));
  useEffect(() => {
    let active = true;
    if (profile) void repos.learning.get(profile.userId).then(s => {
      const selection = s.curriculumSelection;
      if (active && selection && EDUCATION_LEVELS.includes(selection.educationLevel) && isCurriculumSubject(selection.educationLevel, selection.subject)) {
        setLevel(selection.educationLevel); setSubject(selection.subject);
        const matches = curriculumUnits(selection.educationLevel, selection.subject);
        setGroup(matches.some(u => u.group === selection.group) ? selection.group : '전체');
        setFiltersOpen(false);
      }
    }).catch(() => { if (active) setError('저장된 선택을 불러오지 못했습니다.'); });
    return () => { active = false; };
  }, [profile, repos]);

  const handoff = async (problem: Problem) => {
    if (!profile) return;
    // A partial handoff must not erase a submitted attempt after refresh.
    const saved = await repos.learning.get(profile.userId);
    const token = saved.curriculumPending?.problemId === problem.id ? saved.curriculumPending.token : undefined;
    if (problem.curriculumUnitId && !token) throw new Error('이어 풀 문제의 저장 기록을 확인해주세요.');
    await sessionStore.startPractice(problem, token);
    const submitted = !!sessionStore.get('currentAttempt');
    const next = problem.curriculumUnitId && token ? await finishCurriculumHandoff(repos, profile.userId, problem.id, token) : saved;
    pending.current = null;
    setState(next);
    setReviewUnit(null);
    setFiltersOpen(false);
    router.push(submitted ? '/analysis' : '/practice/solve');
  };
  const openPending = async () => {
    if (!pending.current || preparing.current) return;
    preparing.current = true; setBusy(true); setError('');
    try { await handoff(pending.current); }
    catch { setError('문제 화면을 저장하지 못했습니다. 다시 시도하면 같은 문항을 엽니다.'); }
    finally { preparing.current = false; setBusy(false); }
  };
  const generate = async (unit: CurriculumUnit, reviewIndex?: number) => {
    if (!profile || preparing.current || pending.current) return;
    preparing.current = true; setBusy(true); setError('');
    try {
      pending.current = await prepareCurriculum(repos, profile.userId, unit, group, reviewIndex);
      setFiltersOpen(false);
      setState(await repos.learning.get(profile.userId));
      await handoff(pending.current);
    } catch (e) {
      setError(pending.current ? '문제 화면을 저장하지 못했습니다. 다시 시도하면 같은 문항을 엽니다.' :
        e instanceof Error && e.message.startsWith('EXHAUSTED:') ? '이 단원의 준비된 문항을 모두 열어봤습니다.' : '문제를 준비하지 못했습니다. 저장 공간을 확인하고 다시 시도해주세요.');
    } finally { preparing.current = false; setBusy(false); }
  };
  const openSource = async (url: string) => {
    try { await Linking.openURL(url); }
    catch { setError('공식 사이트를 열지 못했습니다. 네트워크 연결을 확인해주세요.'); }
  };
  const openExam = async (problem: Problem) => {
    if (preparing.current) return;
    preparing.current = true; setBusy(true); setError('');
    pending.current = problem;
    try { await sessionStore.startPractice(problem); pending.current = null; router.push('/practice/solve'); }
    catch { setError('기출 문제 화면을 저장하지 못했습니다. 다시 시도해주세요.'); }
    finally { preparing.current = false; setBusy(false); }
  };

  return <Screen>
    <Title>단원·기출</Title>
    <Body muted style={styles.intro}>단원을 골라 기본부터 풀고, 열어본 문제는 다시 연습하세요.</Body>
    <View style={styles.choices}>{([['units', '단원별 연습'], ['exams', '공식 기출'], ['review', '한국사 감수']] as const).map(([key, label]) =>
      <Pill key={key} label={label} selected={mode === key} disabled={busy || !!pending.current} onPress={busy || pending.current ? undefined : () => { setMode(key); setError(''); }} />)}</View>
    {error ? <ErrorState message={error} onRetry={() => { if (pending.current) void openPending(); else void reload(); }} /> : null}
    {pending.current && !error ? <View style={styles.resume}>
      <Body>이전 문제로 이어갈 수 있습니다.</Body>
      <Caption style={styles.note}>{pending.current.subject} · {pending.current.topic} · 새 문항을 추가하지 않고 이어 엽니다.</Caption>
      <Button label="준비한 문제 이어 열기" loading={busy} onPress={() => { void openPending(); }} />
    </View> : null}
    {mode === 'units' ? <>
      <Pressable accessibilityRole="button" accessibilityLabel={filtersOpen ? '학습 범위 접기' : '학습 범위 바꾸기'}
        accessibilityState={{expanded: filtersOpen, disabled: busy || !!pending.current}} disabled={busy || !!pending.current}
        onPress={() => setFiltersOpen(!filtersOpen)} style={styles.filterSummary}>
        <Body>{educationLabel[level]} · {subject} · {group}</Body>
        <Caption>{filtersOpen ? '접기' : '변경'}</Caption>
      </Pressable>
      {filtersOpen ? <>
      <Caption>학습 단계</Caption>
      <View style={styles.choices}>{EDUCATION_LEVELS.map(l => <Pill key={l} label={educationLabel[l]} selected={level === l} disabled={busy || !!pending.current}
        onPress={busy || pending.current ? undefined : () => { setLevel(l); setSubject(curriculumSubjects[l][0]!); setGroup('전체'); }} />)}</View>
      <Caption>과목</Caption>
      <View style={styles.choices}>{curriculumSubjects[level].map(s => <Pill key={s} label={s} selected={subject === s} disabled={busy || !!pending.current}
        onPress={busy || pending.current ? undefined : () => { setSubject(s); setGroup('전체'); }} />)}</View>
      <Caption>학년·범위</Caption>
      <View style={styles.choices}>{['전체', ...groups].map(g => <Pill key={g} label={g} selected={group === g} disabled={busy || !!pending.current} onPress={busy || pending.current ? undefined : () => setGroup(g)} />)}</View>
      </> : null}
      <Body>{visibleUnits.length}개 단원 · 자체 제작 {visibleUnits.reduce((n, u) => n + u.items.length, 0)}문항</Body>
      <Caption style={styles.note}>풀이 {availability.rows.reduce((n, r) => n + r.answered, 0)}문항 · 마지막 풀이 정답 {availability.rows.reduce((n, r) => n + r.correct, 0)}문항</Caption>
      <Caption style={styles.note}>기본 → 응용 순서 · 공식 교육과정 대조 전{subject === '한국사' ? ' · 전문가 감수 전' : ''}</Caption>
      <View style={styles.list}>{availability.rows.map(({ unit, next, remaining, answered, correct }) => <View key={unit.id}>
        <Pressable key={unit.id} accessibilityRole="button" accessibilityLabel={`${unit.title} 다음 문제`}
          disabled={busy || !!pending.current || remaining === 0} accessibilityState={{ disabled: busy || !!pending.current || remaining === 0 }}
          onPress={() => { void generate(unit); }} style={({ pressed }) => [styles.row, pressed ? styles.pressed : undefined]}>
          <View style={styles.rowText}><Text style={styles.label}>{unit.title}</Text><Caption>{unit.group} · {unit.scope}</Caption>{next > 0 ? <Caption>풀이 {answered}/{unit.items.length} · 마지막 정답 {correct}</Caption> : null}</View>
          <Text style={styles.remaining}>{remaining ? `${next === 0 ? '기본' : '응용'}\n남은 ${remaining}문항` : '새 문항 없음'}</Text>
        </Pressable>
        {next > 0 ? <Pressable accessibilityRole="button" accessibilityLabel={`${unit.title} 복습 문제 고르기`}
          accessibilityState={{ expanded: reviewUnit === unit.id, disabled: busy || !!pending.current }} disabled={busy || !!pending.current}
          onPress={() => setReviewUnit(reviewUnit === unit.id ? null : unit.id)} style={styles.reviewLink}>
          <Text style={styles.reviewLabel}>{reviewUnit === unit.id ? '복습 목록 닫기' : '열어본 문제 복습'}</Text>
        </Pressable> : null}
        {reviewUnit === unit.id ? <View style={styles.reviewChoices}>{Array.from({length: next}, (_, i) =>
          <View key={i} style={styles.reviewChoice}><Button label={`${i === 0 ? '기본' : '응용'} 다시 풀기`} variant="secondary" disabled={busy || !!pending.current}
            onPress={() => { void generate(unit, i); }} /></View>)}</View> : null}
        </View>)}</View>
      {!state && !error ? <Caption>출제 이력을 불러오고 있습니다.</Caption> : null}
      {availability.invalid ? <ErrorState message="단원 출제 이력이 올바르지 않습니다. 기존 기록을 보존했습니다." onRetry={() => { void reload(); }} /> : null}
      <Caption style={styles.note}>{COVERAGE_NOTICE}</Caption>
      {level === 'csat' ? <Caption style={styles.note}>고교 기초를 포함한 보충 연습입니다. 2027·2028학년도 수능별 공식 출제 범위를 대조하지 않았습니다.</Caption> : null}
      {subject === '한국사' ? <Caption style={styles.note}>초등 한국사는 사회의 역사 영역을 별도로 연습하는 분류입니다. 모든 한국사 문항은 전문가 감수 전입니다.</Caption> : null}
      <Caption style={styles.note}>난도와 학년 분류는 작성안이며, 수능 실제 난도 검증은 하지 않았습니다. Mock AI · Croche 미연결</Caption>
      <ActionRow label={showGaps ? '부족한 범위 접기' : '아직 준비되지 않은 범위 보기'} onPress={() => setShowGaps(!showGaps)} quiet />
      {showGaps ? coverageGaps(level, subject).map(g => <Body key={g} style={styles.gap}>{g}</Body>) : null}
      <Caption style={styles.note}>현재 지원 과목의 일부 범위입니다. 다른 고교 선택 과목과 예체능·도덕·기술가정·정보 등의 전 교육과정, 대학의 다른 전공은 포함하지 않았습니다.</Caption>
    </> : mode === 'exams' ? <>
      <SectionTitle>실제 기출 {OFFICIAL_EXAMS.length}문항 수록</SectionTitle>
      <Body style={styles.note}>{OFFICIAL_EXAMS.length ? '아래 기출은 목록에서 선택해 다시 풀 수 있습니다. 새 문제 생성의 출제 이력과 별도로 관리합니다.' : '공식 문제·확정 정답·이용 조건을 확인한 문항이 아직 없습니다.'} 자체 제작 수능형 문제는 기출 수에 포함하지 않습니다.</Body>
      {OFFICIAL_EXAMS.map(exam => <ActionRow key={exam.id} label={`${exam.year} ${exam.title} · ${exam.subject} ${exam.questionNumber}번`}
        hint={`${exam.kind === 'csat' ? '수능' : exam.kind === 'csat-mock' ? '평가원 모의평가' : '한국사능력검정'} 기출 · 다시 풀기`} loading={busy} onPress={() => { void openExam(exam.problem); }} />)}
      <Caption style={styles.note}>아래 링크는 공식 자료를 찾을 수 있는 홈페이지입니다. 앱에 수록된 기출 원문의 출처 표시는 아닙니다.</Caption>
      {OFFICIAL_SOURCE_PORTALS.map(p => <ActionRow key={p.url} label={p.name} hint={p.purpose} onPress={() => { void openSource(p.url); }} />)}
      <View style={styles.section}><SectionTitle>수록 전 확인할 항목</SectionTitle></View>
      <Body style={styles.gap}>시험명·학년도·과목·문항 번호, 공식 원문과 확정 정답의 일치</Body>
      <Body style={styles.gap}>문항·지문·그림의 재배포 권한과 제3자 저작물 이용 조건</Body>
      <Body style={styles.gap}>전사 오류·보기·수식·이미지와 접근성 설명, 채점 회귀 검증</Body>
    </> : <>
      <SectionTitle>전문가 감수 미완료</SectionTitle>
      <Body style={styles.note}>{HISTORY_FACTS.length}개 사건의 연도·설명과 문항을 확인할 감수 자료를 준비했습니다. 실제 감수자가 아직 정해지지 않았습니다.</Body>
      <Body style={styles.gap}>자동 검사: 문항 구조, 정답 채점, 연표 계산과 출제 이력</Body>
      <Body style={styles.gap}>대기: 공식 근거 자료의 세부 위치 대조, 시대 해석·표현의 적절성, 실제 역사 전문가의 승인</Body>
      <Caption style={styles.note}>학습용 설명은 직접 작성한 요약입니다. 사료나 전문가의 인용으로 표시하지 않습니다. 자동 검사를 전문가 감수로 표현하지 않습니다.</Caption>
      <ActionRow label="우리역사넷 공식 홈페이지" hint="근거 자료 조사 시작점 · 개별 사건 출처 대조 전" onPress={() => { void openSource('https://contents.history.go.kr'); }} />
    </>}
    <ActionRow label="문제 목록으로" onPress={() => router.navigate('/practice')} quiet />
  </Screen>;
}
const styles = StyleSheet.create({
  intro: { marginTop: spacing.sm, marginBottom: spacing.lg },
  choices: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  note: { marginTop: spacing.sm, marginBottom: spacing.md },
  list: { borderTopWidth: 1, borderTopColor: colors.border, marginBottom: spacing.xl },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.md },
  rowText: { flex: 1, marginRight: spacing.md }, label: { ...typography.bodyStrong, color: colors.brand, marginBottom: spacing.xs },
  remaining: { ...typography.caption, color: colors.textMuted, textAlign: 'right', maxWidth: 90 },
  resume: { marginBottom: spacing.lg },
  filterSummary: { minHeight: 48, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewLink: { minHeight: 44, justifyContent: 'center', alignItems: 'flex-start' },
  reviewLabel: { ...typography.caption, color: colors.brand },
  reviewChoices: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  reviewChoice: { flex: 1 },
  gap: { marginTop: spacing.sm }, section: { marginTop: spacing.xl }, pressed: { opacity: 0.7 },
});
