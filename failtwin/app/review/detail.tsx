import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Title, Body, Caption } from '@/components/typography';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { ActionRow } from '@/components/ActionRow';
import { ErrorState } from '@/components/ErrorState';
import { useApp } from '@/state/AppContext';
import { reviewProblem } from '@/domain/review';
import { sessionStore } from '@/state/sessionStore';
import { educationLabel } from '@/domain/curriculum';

export default function ReviewDetail() {
  const {recordId}=useLocalSearchParams<{recordId?:string}>();const router=useRouter();const {mistakes}=useApp();
  const record=mistakes.find(r=>r.id===recordId), problem=record ? reviewProblem(record) : undefined;
  const [busy,setBusy]=useState(false),[error,setError]=useState(false);
  const replay=async()=>{if(!problem||busy)return;setBusy(true);setError(false);try{await sessionStore.startPractice(problem,undefined,'review');router.push('/practice/solve');}catch{setError(true);}finally{setBusy(false);}};
  if(!record)return <Screen><Title>기록을 찾을 수 없습니다</Title><ActionRow label="복습 목록으로" onPress={()=>router.navigate('/review')} /></Screen>;
  const attempts=mistakes.filter(r=>r.problemId===record.problemId);
  return <Screen><Caption>{educationLabel[record.educationLevel??'university']} · {record.subject} · {record.topic}</Caption><Title>풀이 다시 보기</Title>
    <Caption>{attempts.length}회 제출 · {record.isCorrect?'선택한 풀이 정답':'선택한 풀이 오답'}</Caption>
    <Section title="문제" first><Body>{problem?.prompt??'이 기록에는 복원할 수 있는 문제 원문이 없습니다. 답과 분석 기록은 보존했습니다.'}</Body>{problem?.options?.map(o=><Body key={o}>{o}</Body>)}</Section>
    <Section title="내 답"><Body>{record.attempt.userAnswer}</Body>{record.attempt.userReasoning ? <Body>{record.attempt.userReasoning}</Body> : null}</Section>
    <Section title="정답·해설"><Body>{problem?.correctAnswer??'원문 없는 기록'}</Body><Body>{problem?.explanation??record.analysis.reason}</Body></Section>
    <Section title="이전 제출">{attempts.map(r=><ActionRow key={r.id} label={`${new Date(r.createdAt).toLocaleString('ko-KR')} · ${r.isCorrect?'정답':'오답'}`} hint={r.attempt.userAnswer}
      onPress={()=>router.setParams({recordId:r.id})} />)}</Section>
    {error ? <ErrorState message="문제 화면을 저장하지 못했습니다. 기존 기록과 입력은 유지했습니다." onRetry={replay} /> : null}
    {problem ? <Button label="이 문제 다시 풀기" loading={busy} onPress={replay} /> : null}
    <Caption>다시 풀기는 새 시도로 기록되며 새 문제 출제 횟수를 늘리지 않습니다.</Caption>
    <ActionRow label="복습 목록으로" onPress={()=>router.navigate('/review')} quiet />
  </Screen>;
}
