import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { ActionRow } from '@/components/ActionRow';
import { ErrorDnaBars } from '@/components/ErrorDnaBars';
import { Title, SectionTitle, Caption } from '@/components/typography';
import { DnaIcon, TargetIcon } from '@/components/icons';
import { colors, spacing, typography } from '@/constants/theme';
import { resetDemo } from '@/state/onboarding';
import { sessionStore } from '@/state/sessionStore';
import { ErrorState } from '@/components/ErrorState';
import { useApp } from '@/state/AppContext';
import { predictFromDna } from '@/domain/prediction';
import { errorTypeLabel } from '@/domain/errorTypes';
import { totalRisk } from '@/domain/report';
import { ModeBadge } from '@/components/ModeBadge';
import { EmptyState } from '@/components/EmptyState';
import { getServiceStatus } from '@/services/ai';

export default function Home() {
  const router = useRouter();
  const { profile, dna, refresh, resetAll, repos } = useApp();
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(false);
  const restartDemo = async () => {
    setResetting(true);
    try { await resetDemo(repos); await sessionStore.clear(); await refresh(); setResetError(false); }
    catch { setResetError(true); }
    finally { setResetting(false); }
  };
  const switchProfile = async () => {
    try { await resetAll(); if (router.canDismiss()) router.dismissAll(); router.replace('/onboarding'); }
    catch { setResetError(true); }
  };

  // Refresh when the tab regains focus so Error DNA changes show immediately.
  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const prediction = useMemo(() => predictFromDna(dna), [dna]);
  const avgRisk = useMemo(() => totalRisk(dna), [dna]);
  const hasData = dna.length > 0;

  return (
    <Screen>
      <View style={styles.brandRow}><DnaIcon size={20} /><Text style={styles.brand}>FailTwin</Text><View style={styles.mode}><ModeBadge status={getServiceStatus()} /></View></View>
      <Caption>{profile?.name ?? '학습자'}님 · {profile?.goal ?? '학습 기록'}</Caption>
      <Title style={styles.title}>오늘의 학습 상태</Title>

      <View style={styles.dnaSection}>
        <SectionTitle right={dna.some(e=>!e.legacyAggregate) ? <Caption>평균 위험도 {Math.round(avgRisk)}</Caption> : null}>Error DNA</SectionTitle>
        {hasData ? <>
          <Caption>{profile?.isDemo ? '예시 기록' : '풀이 기록'} · 위험 점수 0–100</Caption>
          <View style={styles.dnaBlock}><ErrorDnaBars entries={dna} /></View>
        </> : <EmptyState title="아직 Error DNA가 없어요" description="근거가 확인된 실수 패턴만 기록합니다. 모든 답안은 풀이 복습에서 확인할 수 있습니다." />}
      </View>

      <Button label={hasData ? '문제 풀기' : '첫 문제 풀기'} onPress={() => router.push('/practice')} testID="go-practice" />

      <ActionRow label="오답·복습 기록" onPress={() => router.push('/review')} quiet />
      <View style={styles.next}>
        {prediction ? <>
          <View style={styles.patternRow}><TargetIcon size={18} /><Text style={styles.patternCaption}>다음에 확인할 패턴</Text></View>
          <Text style={styles.pattern}>{errorTypeLabel(prediction.predictedErrorType)}</Text>
          <Caption>위험 점수 {Math.round(prediction.riskScore)} / 100 · 기록에 기반한 예측</Caption>
        </> : <SectionTitle>다음 학습</SectionTitle>}
        <ActionRow label={prediction ? `${errorTypeLabel(prediction.predictedErrorType)} 훈련하기` : '실수 패턴 훈련하기'}
          hint="Trap Mode · 같은 패턴을 새로운 문제로" onPress={() => router.push('/trap')} testID="go-trap" />
        <ActionRow label="예측 자세히 보기" onPress={() => router.push('/prediction')} />
      </View>

      <View style={styles.profileControls}>
        {profile?.isDemo ? <ActionRow label="데모 처음부터 · 예시 기록 초기화" onPress={restartDemo} loading={resetting} testID="reset-demo" quiet /> : null}
        <ActionRow label="새 프로필 / 데모 선택" onPress={switchProfile} testID="switch-profile" quiet />
      </View>
      {resetError ? <ErrorState message="저장 공간을 확인하고 다시 시도해주세요." onRetry={profile?.isDemo ? restartDemo : switchProfile} /> : null}
      <View style={styles.footer}>
        <Caption>{profile?.isDemo ? '데모 · 예시 데이터가 포함되어 있습니다' : '이 기기에 학습 기록이 저장됩니다'}</Caption>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  brand: { ...typography.bodyStrong, color: colors.brand, marginLeft: spacing.sm },
  mode: { flex: 1, alignItems: 'flex-end', marginLeft: spacing.md },
  title: { marginTop: spacing.xs, marginBottom: spacing.xl },
  dnaBlock: { marginTop: spacing.lg },
  dnaSection: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: spacing.lg, marginBottom: spacing.xl },
  next: { marginTop: spacing.xxl },
  patternRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  patternCaption: { ...typography.caption, color: colors.textMuted, marginLeft: spacing.sm },
  pattern: { ...typography.section, color: colors.text, marginBottom: spacing.xs },
  profileControls: { marginTop: spacing.xxl },
  footer: { marginTop: spacing.lg },
});
