import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { Button } from './Button';
import { WarningIcon } from './icons';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

/** Error state shown when an AI call fails (R11.2). Always offers a retry. */
export function ErrorState({ message = '분석에 실패했습니다.', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}><WarningIcon size={24} /></View>
      <Text style={styles.message}>{message}</Text>
      <Button label="다시 시도" variant="secondary" onPress={onRetry} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxxl },
  icon: { marginBottom: spacing.md },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  btn: { minWidth: 160 },
});
