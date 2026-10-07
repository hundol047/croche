import React from 'react';
import { Pressable, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { ArrowIcon } from './icons';

/** Secondary navigation stays a row so a screen can have one clear primary button. */
export function ActionRow({ label, hint, onPress, testID, quiet, loading }: {
  label: string; hint?: string; onPress: () => void; testID?: string; quiet?: boolean; loading?: boolean;
}) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label}
    disabled={!!loading} accessibilityState={{ disabled: !!loading }} onPress={onPress}
    style={({ pressed }) => [styles.row, pressed ? styles.pressed : undefined]}>
    <View style={styles.text}>
      <Text style={[styles.label, quiet ? styles.quiet : undefined]}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
    {loading ? <ActivityIndicator color={colors.brand} /> : <ArrowIcon size={18} color={quiet ? colors.textMuted : colors.brand} />}
  </Pressable>;
}

const styles = StyleSheet.create({
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1,
    borderBottomColor: colors.border, paddingVertical: spacing.md },
  text: { flex: 1, marginRight: spacing.md },
  label: { ...typography.bodyStrong, color: colors.brand },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  quiet: { ...typography.body, color: colors.textMuted },
  pressed: { opacity: 0.7 },
});
