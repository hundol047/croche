import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'violet';

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
        <ActivityIndicator color={variant === 'ghost' ? colors.indigo : colors.onDark} />
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
  primary: { backgroundColor: colors.blue },
  secondary: { backgroundColor: colors.indigo },
  violet: { backgroundColor: colors.violet },
  ghost: { backgroundColor: colors.surfaceAlt },
};

const labelStyle = StyleSheet.create({
  primary: { color: colors.onDark },
  secondary: { color: colors.onDark },
  violet: { color: colors.onDark },
  ghost: { color: colors.indigo },
});

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: spacing.sm },
  label: { ...typography.bodyStrong, fontSize: 16 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
