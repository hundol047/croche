import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import { SectionTitle } from './typography';

/** A reading section separated by a rule, rather than another floating card. */
export function Section({ title, right, children, first }: {
  title: string; right?: React.ReactNode; children: React.ReactNode; first?: boolean;
}) {
  return <View style={[styles.section, first ? styles.first : undefined]}>
    <SectionTitle right={right}>{title}</SectionTitle>
    {children}
  </View>;
}

const styles = StyleSheet.create({
  section: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.xl, marginTop: spacing.xl },
  first: { borderTopWidth: 0, paddingTop: 0, marginTop: 0 },
});
