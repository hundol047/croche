import React, { useState, useRef, useEffect } from 'react';
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
import { OFFICIAL_EXAMS } from '@/content/officialExams';
import type { Confidence, Attempt } from '@/domain/types';

export default function Solve() {
  const router = useRouter();
  const { profile } = useApp();
  const problem = sessionStore.get('currentProblem');

  const saved = sessionStore.get('currentAttempt');
  const draft = sessionStore.get('practiceDraft');
  const restored = draft?.problemId === problem?.id ? draft : undefined;
  const [answer, setAnswer] = useState(restored?.answer ?? saved?.userAnswer ?? '');
  const [guidance, setGuidance] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [reasoning, setReasoning] = useState(restored?.reasoning ?? saved?.userReasoning ?? '');
  const [confidence, setConfidence] = useState<Confidence>(restored?.confidence ?? saved?.confidence ?? 'medium');

  const [draftStatus, setDraftStatus] = useState<'idle'|'saving'|'saved'|'error'>(restored ? 'saved' : 'idle');
  const draftValues = useRef({answer, reasoning, confidence});
  const sequence = useRef(0);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const persistDraft = (values: Partial<typeof draftValues.current>) => {
    draftValues.current = {...draftValues.current, ...values};
    if (!problem) return;
    const turn = ++sequence.current; setDraftStatus('saving');
    void sessionStore.savePracticeDraft({...draftValues.current, problemId: problem.id}, saved?.id).then(() => {
      if (alive.current && turn === sequence.current) setDraftStatus('saved');
    }).catch(() => { if (alive.current && turn === sequence.current) setDraftStatus('error'); });
  };

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
        <Pressable accessibilityRole="button" accessibilityLabel={sessionStore.get('practiceReturnTo') === 'review' ? '복습 목록으로 돌아가기' : problem.curriculumUnitId ? '단원 목록으로 돌아가기' : '문제 목록으로 돌아가기'} onPress={() => router.navigate(sessionStore.get('practiceReturnTo') === 'review' ? '/review' : problem.curriculumUnitId ? '/curriculum' : '/practice')} hitSlop={12}>
          <View style={styles.back}><ArrowIcon direction="left" /></View>
        </Pressable>
        <Caption style={styles.context}>{educationLabel[problem.educationLevel??'university']} · {problem.subject} · {problem.topic}</Caption>
      </View>

      <View style={styles.question}>
        <Title style={styles.qTitle}>문제</Title>
        {OFFICIAL_EXAMS.some(e => e.problem.id === problem.id) ? <Caption>공식 기출 · 원문·확정 정답·이용 조건 대조 기록 포함</Caption> : null}
        {problem.contentOrigin === 'curriculum-original' ? <Caption>단원별 자체 제작 연습 · 공식 교육과정 대조 전</Caption> : null}
        {problem.subject === '한국사' ? <Caption>한국사 학습용 요약 · 전문가 감수 전</Caption> : null}
        <Text style={styles.prompt}>{problem.prompt}</Text>
        {problem.answerType === 'mcq' && problem.options ? (
          <View style={styles.options}>
            {problem.options.map((o) => (
              <Pressable key={o} accessibilityRole="button" aria-pressed={answer===o} accessibilityState={{selected:answer===o}} accessibilityLabel={`보기 ${o}`} disabled={busy} onPress={()=>{setAnswer(o);setGuidance('');persistDraft({answer:o});}} style={[styles.optionButton,answer===o?styles.selectedOption:undefined]}><Text style={styles.option}>{o}</Text></Pressable>
            ))}
            <Caption style={styles.mcqHint}>보기를 선택하거나 직접 입력하세요. 복수 정답은 쉼표로 입력하세요.</Caption>
          </View>
        ) : null}
      </View>

      <Caption>내 답</Caption>
      {draftStatus !== 'idle' ? <Caption>{draftStatus === 'saved' ? '입력 저장됨 · 제출 전에는 학습 기록에 반영되지 않습니다.' : draftStatus === 'saving' ? '입력 저장 중' : '입력 저장 실패 · 이 화면에는 입력이 남아 있습니다.'}</Caption> : null}
      {draftStatus === 'error' ? <Button label="입력 저장 다시 시도" variant="secondary" onPress={() => persistDraft({})} /> : null}
      <TextInput
        style={styles.input}
        placeholder={problem.answerType === 'numeric' ? '숫자 또는 분수 입력 (예: 1/2)' : '답을 입력'}
        placeholderTextColor={colors.textFaint}
        value={answer}
        maxLength={256} editable={!busy} onChangeText={(text) => { setAnswer(text); setGuidance(''); persistDraft({answer:text}); }}
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
        maxLength={4000} editable={!busy} onChangeText={text => { setReasoning(text); persistDraft({reasoning:text}); }}
        multiline
        accessibilityLabel="풀이 과정 입력"
      />

      <View style={styles.spacer}>
        <ConfidenceSelector disabled={busy} value={confidence} onChange={c => { setConfidence(c); persistDraft({confidence:c}); }} />
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
