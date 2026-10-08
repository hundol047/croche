import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

/** A standard progress indicator with the actual operation being performed. */
export function LoadingState({ message }: { message: string }) {
  return <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
    <ActivityIndicator size="small" color={colors.brand} />
    <Text style={styles.message}>{message}</Text>
  </View>;
}
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xxl },
  message: { ...typography.body, color: colors.textMuted, marginLeft: spacing.md },
});
