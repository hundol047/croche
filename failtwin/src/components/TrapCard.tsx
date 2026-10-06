import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { TargetIcon, Sparkle } from './icons';
import { errorTypeLabel } from '@/domain/errorTypes';
import type { ErrorType } from '@/domain/types';

interface TrapCardProps {
  targetErrorType: ErrorType;
  children?: React.ReactNode;
}

/**
 * Violet gradient trap challenge card — the hero visual for FailTwin's
 * flagship Trap Mode. Shows the targeted error type as a badge.
 */
export function TrapCard({ targetErrorType, children }: TrapCardProps) {
  return (
    <View style={styles.wrapper}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Rect x="0" y="0" width="100%" height="100%" fill={colors.violet} rx={radius.lg} />
      </Svg>
      <View style={styles.inner}>
        <View style={styles.header}>
          <TargetIcon size={24} color={colors.onDark} />
          <Text style={styles.title}>Trap Mode</Text>
          <Sparkle size={18} color={colors.onDarkMuted} />
        </View>
        <Text style={styles.subtitle}>나를 틀리게 만드는 문제</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>타깃 실수</Text>
          <Text style={styles.badgeValue}>{errorTypeLabel(targetErrorType)}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  inner: { padding: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  title: { ...typography.section, color: colors.onDark, marginLeft: spacing.sm, flex: 1 },
  subtitle: { ...typography.title, color: colors.onDark, marginBottom: spacing.lg },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.md,
  },
  badgeLabel: { ...typography.caption, color: colors.onDarkMuted, marginRight: spacing.sm },
  badgeValue: { ...typography.caption, fontSize: 13, fontWeight: '700', color: colors.onDark },
});
