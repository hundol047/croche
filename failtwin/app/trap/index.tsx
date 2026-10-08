import { goToMain } from '@/utils/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ActionRow } from '@/components/ActionRow';
import { Section } from '@/components/Section';
import { TrapCard } from '@/components/TrapCard';
import { ConfidenceSelector } from '@/components/ConfidenceSelector';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Title, Body, Caption } from '@/components/typography';
import { CheckIcon, TargetIcon, ArrowIcon } from '@/components/icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { useErrorDNA } from '@/state/useErrorDNA';
import { buildMemoryContext } from '@/domain/memorySelect';
import { strongestErrorType } from '@/domain/errorDnaEngine';
import { errorTypeLabel } from '@/domain/errorTypes';
import { recordTrap } from '@/domain/learningEvents';
import { assessAnswer, UngradableAnswerError } from '@/domain/answerAssessment';
import { issueTrap } from '@/domain/questionIssuance';
import { sessionStore } from '@/state/sessionStore';
import { uid } from '@/utils/id';
import { nowIso } from '@/utils/date';
import type { TrapProblem, Confidence, ErrorType, Subject, Attempt, TrapResult as StoredTrapResult } from '@/domain/types';

type Phase = 'intro' | 'generating' | 'solving' | 'error' | 'result';

export default function Trap() {
  const router = useRouter();
  const { ai, dna, profile, repos, refresh, traps: trapHistory } = useApp();
  const { strongest } = useErrorDNA();

  const { target: requestedTarget, subject: requestedSubject, educationLevel: requestedLevel } = useLocalSearchParams<{ target?: string; subject?: string; educationLevel?: string }>();
  const targetEntry = strongestErrorType(dna.filter(e=>e.errorType===requestedTarget && (!requestedSubject||e.subject===requestedSubject) && (!requestedLevel||(e.educationLevel??'university')===requestedLevel))) ?? strongest;
  const target: ErrorType = targetEntry?.errorType ?? 'verification_omission';
  const savedTrap = sessionStore.get('currentTrap');
  const canResume = savedTrap && (!requestedTarget || savedTrap.targetErrorType === requestedTarget) && (!requestedSubject||savedTrap.subject===requestedSubject) && (!requestedLevel||(savedTrap.educationLevel??'university')===requestedLevel);
  const [trap, setTrap] = useState<TrapProblem | null>(canResume ? savedTrap : null);
  const [phase, setPhase] = useState<Phase>(canResume ? 'solving' : 'intro');
  const restoredDraft = canResume && sessionStore.get('trapDraft')?.problemId === sessionStore.get('trapId') ? sessionStore.get('trapDraft') : undefined;
  const [answer, setAnswer] = useState(restoredDraft?.answer ?? '');
  const [reasoning, setReasoning] = useState(restoredDraft?.reasoning ?? '');
  const [confidence, setConfidence] = useState<Confidence>(restoredDraft?.confidence ?? 'medium');
  const [result, setResult] = useState<StoredTrapResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [guidance, setGuidance] = useState('');
  const [exhaustionMessage,setExhaustionMessage]=useState('');
  const [exhausted, setExhausted] = useState(false);
  const submitting = useRef(false);
  const [draftStatus, setDraftStatus] = useState<'idle'|'saving'|'saved'|'error'>(restoredDraft ? 'saved' : 'idle');
  const draftValues = useRef({answer, reasoning, confidence});
  const draftTurn = useRef(0);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const persistDraft = (value: Partial<typeof draftValues.current>) => {
    draftValues.current = {...draftValues.current, ...value};
    const problemId = sessionStore.get('trapId'); if (!problemId) return;
    const turn = ++draftTurn.current; setDraftStatus('saving');
    void sessionStore.saveTrapDraft({...draftValues.current, problemId}, savedAttempt?.id).then(() => {
      if (alive.current && turn === draftTurn.current) setDraftStatus('saved');
    }).catch(() => { if (alive.current && turn === draftTurn.current) setDraftStatus('error'); });
  };
  const [savedAttempt] = useState(canResume ? sessionStore.get('trapAttempt') : undefined);

  useEffect(() => {
    if (!savedAttempt || !trap || !profile) return;
    let active = true;
    void recordTrap(repos, trap, savedAttempt).then(async (restored) => {
      if (!active) return;
      setResult(restored);
      setPhase('result');
      await refresh();
    }).catch((e) => {
      if (!active) return;
      if (e instanceof UngradableAnswerError) {
        setGuidance(e.guidance);
        void sessionStore.set('trapAttempt', undefined).catch(() => setSaveError(true));
      } else setSaveError(true);
    });
    return () => { active = false; };
    // Restore only the attempt captured when this route mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAttempt, repos]);

  const generate = async () => {
    if (!profile) return;
    setPhase('generating');
    setSaveError(false);
    setGuidance(''); setExhausted(false);
    try {
      const subject: Subject = (targetEntry?.subject as Subject) ?? profile.interests[0] ?? '공업수학';
      const next = await issueTrap(repos, ai, profile.userId, {
        targetErrorType: target, subject, educationLevel: targetEntry ? targetEntry.educationLevel??'university' : profile.educationLevel,
        recentTopics: [...dna.slice(0, 3).map((e) => e.topic), ...trapHistory.map((t) => t.topic ?? ''), ...(trap ? [trap.topic] : [])],
        relevantMemories: buildMemoryContext(dna, { subject, educationLevel: targetEntry ? targetEntry.educationLevel??'university' : profile.educationLevel, topic: targetEntry?.topic ?? '' }),
      });
      await sessionStore.startTrap(next, uid('trapq'));
      setTrap(next);
      setResult(null);
      setAnswer('');
      setReasoning(''); setConfidence('medium'); draftValues.current = {answer:'',reasoning:'',confidence:'medium'}; ++draftTurn.current; setDraftStatus('idle');
      setPhase('solving');
    } catch (e) { setExhausted(e instanceof Error && /^(EXHAUSTED|UNAVAILABLE):/.test(e.message));setExhaustionMessage(e instanceof Error?e.message.replace(/^(EXHAUSTED|UNAVAILABLE): /,''):''); setPhase('error'); }
  };

  const submit = async () => {
    if (!trap || !profile || submitting.current) return;
    const assessment = assessAnswer(trap, answer);
    if (assessment.verdict === 'ungradable') { setGuidance(assessment.guidance); return; }
    setGuidance('');
    submitting.current = true;
    setBusy(true);
    setSaveError(false);
    try {
      const previous = sessionStore.get('trapAttempt');
      const attempt: Attempt = previous ?? {
        id: uid('trap'), userId: profile.userId,
        problemId: sessionStore.get('trapId') ?? uid('trapq'),
        userAnswer: answer.trim(), userReasoning: reasoning.trim(), confidence, createdAt: nowIso(),
      };
      await sessionStore.set('trapAttempt', attempt);
      const outcome = await recordTrap(repos, trap, attempt);
      setResult(outcome);
      setPhase('result');
      await refresh();
    } catch { setSaveError(true); }
    finally { submitting.current = false; setBusy(false); }
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="홈으로 돌아가기" onPress={() => goToMain(router)} hitSlop={8}>
          <View style={styles.back}><ArrowIcon direction="left" /></View>
        </Pressable>
        <Caption>실수 패턴 집중 훈련</Caption>
      </View>
      <Title>실수 패턴 훈련</Title>
      {phase === 'intro' ? <>
        <TrapCard targetErrorType={target}>
          <Body style={styles.trapIntro}>다른 문제에서도 이 조건을 확인할 수 있는지 연습합니다. 결과는 기존 학습 기록에 이어서 남깁니다.</Body>
        </TrapCard>
        <Button label="집중 훈련 시작" variant="trap" onPress={generate} testID="trap-start" />
      </> : null}
      {phase === 'generating' ? <LoadingState message="연습 문제 준비 중" /> : null}
      {phase === 'error' ? <>{exhausted ? <Body style={styles.introNote}>{exhaustionMessage}</Body> : <ErrorState message="문제 생성이나 저장에 실패했어요." onRetry={generate} />}<ActionRow label="기본 문제 풀기" onPress={() => router.navigate('/practice')} /><ActionRow label="홈으로" onPress={() => goToMain(router)} quiet /></> : null}
      {saveError ? <ErrorState message="결과를 저장하지 못했어요. 다시 시도해주세요." onRetry={submit} /> : null}

      {phase === 'solving' && trap ? <>
        <View style={styles.targetTag}><TargetIcon size={16} /><Text style={styles.targetTagText}>타깃: {errorTypeLabel(trap.targetErrorType)}</Text></View>
        <Card>
          <Caption>{trap.subject} · {trap.topic}</Caption>
          {trap.subject === '한국사' ? <Caption>한국사 학습용 요약 · 전문가 감수 전</Caption> : null}
          <Text style={styles.question}>{trap.question}</Text>
          {trap.answerType === 'mcq' && trap.options ? <View style={styles.options}>
            {trap.options.map((o) => <Pressable key={o} accessibilityRole="button" accessibilityLabel={`보기 ${o}`} aria-pressed={answer===o} accessibilityState={{selected:answer===o}} disabled={busy} onPress={()=>{setAnswer(o);setGuidance('');persistDraft({answer:o});}} style={[styles.optionButton,answer===o?styles.selectedOption:undefined]}><Text style={styles.option}>{o}</Text></Pressable>)}
          </View> : null}
        </Card>
        <Caption>내 답</Caption>
        {draftStatus !== 'idle' ? <Caption>{draftStatus === 'saved' ? '입력 저장됨 · 제출 전에는 학습 기록에 반영되지 않습니다.' : draftStatus === 'saving' ? '입력 저장 중' : '입력 저장 실패 · 이 화면에는 입력이 남아 있습니다.'}</Caption> : null}
        {draftStatus === 'error' ? <Button label="입력 저장 다시 시도" variant="secondary" onPress={() => persistDraft({})} /> : null}
        <TextInput style={styles.input} placeholder="답을 입력" placeholderTextColor={colors.textFaint}
          value={answer} maxLength={256} editable={!busy} onChangeText={(text) => { setAnswer(text); setGuidance(''); persistDraft({answer:text}); }} accessibilityLabel="Trap 답 입력" />
        {guidance ? <View accessibilityLiveRegion="polite" style={styles.spacer}><Text style={styles.pattern}>판정 불가</Text><Body>{guidance}</Body><Caption>HIT와 Error DNA에는 반영하지 않았습니다.</Caption></View> : null}
        <Caption style={styles.spacer}>풀이 과정 (선택)</Caption>
        <TextInput style={[styles.input, styles.multiline]} placeholder="어떤 조건을 확인했는지 함께 적어주세요."
          placeholderTextColor={colors.textFaint} value={reasoning} maxLength={4000} editable={!busy} onChangeText={text=>{setReasoning(text);persistDraft({reasoning:text});}} multiline accessibilityLabel="Trap 풀이 과정 입력" />
        <View style={styles.spacer}><ConfidenceSelector disabled={busy} value={confidence} onChange={c=>{setConfidence(c);persistDraft({confidence:c});}} /></View>
        <View style={styles.spacer}><Button label="제출" variant="trap" onPress={submit} loading={busy}
          disabled={answer.trim().length === 0} testID="trap-submit" /></View>
      </> : null}

      {phase === 'result' && trap && result ? <TrapResult trap={trap} result={result} onRetry={generate}
        onHome={() => goToMain(router)} onReport={() => goToMain(router, '/(tabs)/report')} /> : null}
    </Screen>
  );
}

function TrapResult({ trap, result, onRetry, onHome, onReport }: {
  trap: TrapProblem; result: StoredTrapResult; onRetry: () => void; onHome: () => void; onReport: () => void;
}) {
  const { solvedCorrectly, predictionHit } = result;
  const accent = solvedCorrectly ? colors.success : predictionHit ? colors.warning : colors.brand;
  const bannerTitle = solvedCorrectly ? 'Trap 극복' : predictionHit ? '예측 적중 (Prediction HIT)' : '함께 교정해봐요';

  return <>
    <View style={[styles.resultBanner, { opacity: 1, borderLeftColor: accent,
      backgroundColor: solvedCorrectly ? colors.successTint : colors.brandTint }]}>
      {solvedCorrectly ? <CheckIcon size={22} color={accent} /> : <TargetIcon size={22} color={accent} />}
      <Text style={styles.resultTitle}>{bannerTitle}</Text>
    </View>

    <Card>
      {result.beforeScore != null && result.afterScore != null ? <View style={styles.dna}>
        <Text style={styles.dnaTitle}>Error DNA 변화</Text>
        <Body>{errorTypeLabel(solvedCorrectly ? trap.targetErrorType : result.actualErrorType!)} {Math.round(result.beforeScore)} → {Math.round(result.afterScore)}</Body>
      </View> : null}
      <Section title="이 문제가 노린 실수" first>
        <Text style={styles.pattern}>{errorTypeLabel(trap.targetErrorType)}</Text>
        <Body muted>{trap.trapExplanation}</Body>
      </Section>
      <Section title="정답과 해설">
        <Text style={styles.answer}>정답: {trap.correctAnswer}</Text>
        <Body muted>{trap.explanation}</Body>
      </Section>
    </Card>

    <Body muted style={styles.resultNote}>{solvedCorrectly
      ? `이번 문제를 맞혔어요. ${errorTypeLabel(trap.targetErrorType)} 교정 결과를 학습 기록에 반영했습니다.`
      : predictionHit
        ? `이번 문제에서도 ${errorTypeLabel(trap.targetErrorType)} 패턴이 나타났어요. 해설을 확인하고 다른 문제로 연습해보세요.`
        : result.actualErrorType ? '예상과는 다른 실수가 관찰됐어요. 해설을 보고 다시 도전해봐요.'
        : '답만으로는 실수 유형을 확인하기 어려워요. 예측 적중으로 집계하지 않고 해설을 안내합니다.'}</Body>
    {solvedCorrectly ? <>
      <Button label="학습 리포트 보기" onPress={onReport} />
      <ActionRow label="다시 도전" onPress={onRetry} />
    </> : <>
      <Button label="다시 도전" variant="trap" onPress={onRetry} />
      <ActionRow label="학습 리포트 보기" onPress={onReport} />
    </>}
    <ActionRow label="홈으로" onPress={onHome} quiet />
  </>;
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  back: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  trapIntro: { color: colors.textMuted },
  introNote: { marginBottom: spacing.xl },
  targetTag: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg },
  targetTagText: { ...typography.caption, color: colors.brand, marginLeft: spacing.sm },
  question: { ...typography.body, color: colors.text, marginTop: spacing.sm },
  options: { marginTop: spacing.md },
  optionButton:{minHeight:48,justifyContent:'center',padding:spacing.md,borderWidth:1,borderColor:colors.controlBorder,marginBottom:spacing.sm,borderRadius:radius.md},
  selectedOption:{borderColor:colors.brand},
  option: { ...typography.body, color: colors.text, marginBottom: spacing.xs },
  input: { ...typography.body, color: colors.text, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.controlBorder,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 48, marginTop: spacing.sm },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  spacer: { marginTop: spacing.lg },
  resultBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.sm, borderLeftWidth: 2,
    padding: spacing.lg, marginVertical: spacing.lg },
  resultTitle: { ...typography.section, color: colors.text, marginLeft: spacing.sm, flex: 1 },
  dna: { borderLeftWidth: 2, borderLeftColor: colors.brand, paddingLeft: spacing.md, marginBottom: spacing.xl },
  dnaTitle: { ...typography.caption, color: colors.brand, marginBottom: spacing.xs },
  pattern: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.sm },
  answer: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.sm },
  resultNote: { marginBottom: spacing.xl },
});
