import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'trap';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  icon,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      disabled={!!isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        variantStyle[variant],
        pressed && !isDisabled ? styles.pressed : undefined,
        isDisabled ? styles.disabled : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'trap' ? colors.onDark : colors.brand} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.label, labelStyle[variant]]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const variantStyle: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.brand },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.controlBorder },
  trap: { backgroundColor: colors.ink },
  ghost: { backgroundColor: 'transparent' },
};

const labelStyle = StyleSheet.create({
  primary: { color: colors.onDark },
  secondary: { color: colors.brand },
  trap: { color: colors.onDark },
  ghost: { color: colors.brand },
});

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: spacing.sm },
  label: { ...typography.bodyStrong, textAlign: 'center', flexShrink: 1 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
