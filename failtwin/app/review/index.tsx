import React, { useMemo, useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { exportRecord } from '@/utils/exportRecord';
import { Screen } from '@/components/Screen';
import { ActionRow } from '@/components/ActionRow';
import { Pill } from '@/components/Pill';
import { Title, Body, Caption } from '@/components/typography';
import { ErrorState } from '@/components/ErrorState';
import { useApp } from '@/state/AppContext';
import { latestProblemRecords, reviewProblem } from '@/domain/review';
import { educationLabel } from '@/domain/curriculum';
import { colors, spacing, typography } from '@/constants/theme';

export default function ReviewList() {
  const { mistakes, refresh, repos, profile } = useApp(); const router = useRouter();
  const [exporting,setExporting] = useState(false);
  const exportHistory = async () => { if(!profile)return;setExporting(true);try{const learning=await repos.learning.get(profile.userId);await exportRecord(JSON.stringify({format:'failtwin-learning-export-v1',profile,learning}),'failtwin-learning-records.json');}catch{setError(true);}finally{setExporting(false);} };
  const [subject,setSubject] = useState('전체'), [level,setLevel] = useState('전체'), [query,setQuery] = useState(''), [onlyWrong,setOnlyWrong] = useState(true), [error,setError] = useState(false);
  const reload = React.useCallback(async () => { try { await refresh(); setError(false); } catch { setError(true); } }, [refresh]);
  useFocusEffect(React.useCallback(() => { void reload(); }, [reload]));
  const records = useMemo(() => latestProblemRecords(mistakes), [mistakes]);
  const subjects = [...new Set(records.map(r=>r.subject))], levels = [...new Set(records.map(r=>r.educationLevel??'university'))];
  const rows = records.filter(r => (!onlyWrong || !r.isCorrect) && (subject==='전체'||r.subject===subject) && (level==='전체'||(r.educationLevel??'university')===level)
    && `${r.topic} ${reviewProblem(r)?.prompt??''}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <Screen><Title>오답·복습 기록</Title><Body muted>문항별 마지막 풀이를 확인하고 다시 연습하세요.</Body>
    <View style={styles.choices}><Pill label="다시 볼 오답" selected={onlyWrong} onPress={()=>setOnlyWrong(true)} /><Pill label="전체 풀이" selected={!onlyWrong} onPress={()=>setOnlyWrong(false)} /></View>
    <Caption>학습 단계</Caption><View style={styles.choices}>{['전체',...levels].map(l=><Pill key={l} label={l==='전체'?'모든 단계':educationLabel[l as keyof typeof educationLabel]} selected={level===l} onPress={()=>setLevel(l)} />)}</View>
    <Caption>과목</Caption><View style={styles.choices}>{['전체',...subjects].map(s=><Pill key={s} label={s==='전체'?'모든 과목':s} selected={subject===s} onPress={()=>setSubject(s)} />)}</View>
    <TextInput accessibilityLabel="복습 문제 검색" placeholder="단원이나 문제 내용 검색" value={query} onChangeText={setQuery} maxLength={100} style={styles.input} />
    <Caption>{rows.length}문제 · 반복 제출은 하나의 문항으로 표시합니다.</Caption>
    {error ? <ErrorState message="기록을 불러오지 못했습니다. 기존 기록은 보존했습니다." onRetry={reload} /> : null}
    {!rows.length ? <Body>조건에 맞는 기록이 없습니다. 전체 풀이를 보거나 새 문제를 풀어보세요.</Body> : rows.map(r=><ActionRow key={r.id} label={`${r.subject} · ${r.topic}`} hint={`${educationLabel[r.educationLevel??'university']} · ${r.isCorrect?'마지막 풀이 정답':'다시 볼 오답'} · ${new Date(r.createdAt).toLocaleDateString('ko-KR')}`}
      onPress={()=>router.push({pathname:'/review/detail',params:{recordId:r.id}})} />)}
    <ActionRow label="학습 기록 내보내기" hint="이 프로필의 기록과 답안을 파일로 보관합니다. 자동 동기화는 아닙니다." loading={exporting} onPress={()=>{void exportHistory();}} quiet />
    <ActionRow label="문제 고르기" onPress={()=>router.navigate('/practice')} quiet />
  </Screen>;
}
const styles=StyleSheet.create({choices:{flexDirection:'row',flexWrap:'wrap',marginVertical:spacing.md},input:{...typography.body,minHeight:48,borderWidth:1,borderColor:colors.controlBorder,borderRadius:8,padding:spacing.md,marginBottom:spacing.md,color:colors.text,backgroundColor:colors.surface}});
