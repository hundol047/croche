import React from 'react';
import { ScrollView, View, StyleSheet, ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  footer?: React.ReactNode;
}

/**
 * Base screen wrapper: applies SafeArea on all edges so content is never
 * clipped on small phones (R11.3), with the app background and consistent
 * horizontal padding.
 */
export function Screen({ children, scroll = true, padded = true, style, footer }: ScreenProps) {
  const content = (
    <View style={[styles.column, padded ? styles.padded : undefined, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled={Platform.OS !== 'web'}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{content}</View>
      )}
      {footer ? <View style={styles.footer}><View style={styles.footerColumn}>{footer}</View></View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  column: { width: '100%', maxWidth: 600, alignSelf: 'center' },
  padded: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  footerColumn: { width: '100%', maxWidth: 600 - 2 * spacing.xl, alignSelf: 'center' },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
