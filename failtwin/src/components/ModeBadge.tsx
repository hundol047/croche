import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Sparkle } from './icons';
import type { CrocheServiceStatus } from '@/services/ai';

/**
 * Honestly surfaces which AI backend is active so the Mock is NEVER mistaken
 * for a real Croche connection (§6). Shown on the dashboard.
 */
export function ModeBadge({ status }: { status: CrocheServiceStatus }) {
  const cfg = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Sparkle size={12} color={cfg.fg} />
      <Text style={[styles.text, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
}

const CONFIG: Record<CrocheServiceStatus, { label: string; fg: string; bg: string; border: string }> = {
  real: {
    label: 'Real Croche',
    fg: colors.success,
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  mock: {
    label: 'Mock AI · Croche 미연결',
    fg: colors.indigo,
    bg: '#EEF2FF',
    border: '#C7D2FE',
  },
  'real-unavailable': {
    label: 'Mock (Croche 연결 안 됨)',
    fg: colors.warning,
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  text: { ...typography.caption, fontSize: 11, fontWeight: '700', marginLeft: 4 },
});
