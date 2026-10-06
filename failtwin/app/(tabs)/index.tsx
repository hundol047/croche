import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ErrorDnaBars } from '@/components/ErrorDnaBars';
import { Title, SectionTitle, Body, Caption } from '@/components/typography';
import { DnaIcon, TargetIcon, Sparkle } from '@/components/icons';
import { colors, radius, spacing, typography, riskColor } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { predictFromDna } from '@/domain/prediction';
import { errorTypeLabel } from '@/domain/errorTypes';
import { totalRisk } from '@/domain/report';
import { ModeBadge } from '@/components/ModeBadge';
import { EmptyState } from '@/components/EmptyState';
import { getServiceStatus } from '@/services/ai';

export default function Home() {
  const router = useRouter();
  const { profile, dna, refresh } = useApp();

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
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Caption>안녕하세요</Caption>
          <Title>{profile?.name ?? '학습자'}님</Title>
          <View style={styles.badgeRow}>
            <ModeBadge status={getServiceStatus()} />
          </View>
        </View>
        <View style={styles.logoBadge}>
          <DnaIcon size={26} color={colors.onDark} />
        </View>
      </View>

      {/* 오늘의 학습 진단 */}
      <Card>
        <SectionTitle
          right={hasData ? <Caption>평균 위험도 {Math.round(avgRisk)}</Caption> : undefined}
        >
          오늘의 학습 진단
        </SectionTitle>
        {hasData ? (
          <>
            <Body muted>
              당신의 Error DNA는 지금까지의 풀이에서 반복된 실수 패턴을 보여줍니다.
            </Body>
            <View style={styles.dnaBlock}>
              <ErrorDnaBars entries={dna} />
            </View>
          </>
        ) : (
          <EmptyState
            title="아직 Error DNA가 없어요"
            description="문제를 풀면 당신이 어떻게 틀리는지를 AI가 학습해 나만의 실수 패턴(Error DNA)을 만들어 드려요."
            ctaLabel="첫 문제 풀기"
            onCta={() => router.push('/practice')}
          />
        )}
      </Card>

      {/* 다음 실수 예측 */}
      {prediction ? (
        <Pressable onPress={() => router.push('/prediction')}>
          <View style={[styles.predictBanner, { backgroundColor: riskColor(prediction.riskScore) }]}>
            <View style={styles.predictLeft}>
              <TargetIcon size={22} color={colors.onDark} />
              <View style={styles.predictText}>
                <Text style={styles.predictCaption}>다음 문제에서 가장 가능성 높은 실수</Text>
                <Text style={styles.predictValue}>
                  {errorTypeLabel(prediction.predictedErrorType)}
                </Text>
              </View>
            </View>
            <View style={styles.predictScoreWrap}>
              <Text style={styles.predictScore}>{Math.round(prediction.riskScore)}</Text>
              <Text style={styles.predictScoreCap}>위험도</Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      {/* 액션 */}
      <SectionTitle>무엇을 할까요?</SectionTitle>
      <Button label="문제 풀기" onPress={() => router.push('/practice')} testID="go-practice" />
      <View style={styles.gap} />
      <Button
        label="🎯 Trap Challenge 시작"
        variant="violet"
        onPress={() => router.push('/trap')}
        testID="go-trap"
      />
      <View style={styles.gap} />
      <Button
        label="오답 예측 보기"
        variant="ghost"
        onPress={() => router.push('/prediction')}
      />

      <View style={styles.footerNote}>
        <Sparkle size={14} color={colors.textFaint} />
        <Caption>
          {profile?.isDemo ? '데모 모드 · 예시 데이터가 포함되어 있습니다' : '당신의 실제 학습 데이터로 분석됩니다'}
        </Caption>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLeft: { flex: 1 },
  badgeRow: { marginTop: spacing.sm },
  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dnaBlock: { marginTop: spacing.lg },
  predictBanner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  predictLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  predictText: { marginLeft: spacing.md, flex: 1 },
  predictCaption: { ...typography.caption, color: colors.onDarkMuted },
  predictValue: { ...typography.section, color: colors.onDark, marginTop: 2 },
  predictScoreWrap: { alignItems: 'center', marginLeft: spacing.md },
  predictScore: { fontSize: 30, fontWeight: '800', color: colors.onDark, fontVariant: ['tabular-nums'] },
  predictScoreCap: { ...typography.caption, color: colors.onDarkMuted },
  gap: { height: spacing.md },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
});
