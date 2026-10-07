import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { DnaIcon } from './icons';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
}

/**
 * Friendly empty state for brand-new users (no Error DNA yet). Never shows
 * fabricated numbers — invites the user to generate their own data (§23).
 */
export function EmptyState({ title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <DnaIcon size={24} color={colors.brand} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      {ctaLabel && onCta ? (
        <Button label={ctaLabel} onPress={onCta} style={styles.cta} testID="empty-cta" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', paddingVertical: spacing.md },
  iconWrap: {
    marginBottom: spacing.md,
  },
  title: { ...typography.section, color: colors.text, marginBottom: spacing.sm },
  desc: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  cta: { width: '100%' },
});
