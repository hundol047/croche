import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';
import type { CrocheServiceStatus } from '@/services/ai';

/** Plain secondary disclosure. Mock must never read as a live Croche connection. */
export function ModeBadge({ status }: { status: CrocheServiceStatus }) {
  return <Text style={[styles.status, status === 'real-unavailable' ? styles.unavailable : undefined]}>{LABELS[status]}</Text>;
}
const LABELS: Record<CrocheServiceStatus, string> = {
  real: '서버 AI · 응답 확인', 'real-pending': '서버 AI · 연결 미확인', 'real-error': '서버 AI · 연결 오류',
  mock: 'Mock AI · Croche 미연결', 'real-unavailable': 'Mock AI · Croche 연결 불가',
};
const styles = StyleSheet.create({
  status: { ...typography.caption, color: colors.textMuted },
  unavailable: { color: colors.warning },
});
