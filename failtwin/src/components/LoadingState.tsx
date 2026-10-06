import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Sparkle } from './icons';

interface LoadingStateProps {
  message: string;
}

/**
 * Loading state with a subtle shimmering skeleton + an AI sparkle and a
 * context-specific message (e.g. "당신의 풀이 패턴을 분석하고 있어요").
 * Animation is subtle (opacity pulse) — no heavy motion (R13 / R11.1).
 */
export function LoadingState({ message }: LoadingStateProps) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.container}>
      <View style={styles.sparkleRow}>
        <Sparkle size={28} color={colors.violet} />
      </View>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.skeletonBlock}>
        {[0.9, 0.75, 0.6].map((w, i) => (
          <Animated.View
            key={i}
            style={[styles.skeletonLine, { width: `${w * 100}%`, opacity: pulse }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxxl },
  sparkleRow: { marginBottom: spacing.lg },
  message: { ...typography.bodyStrong, color: colors.text, textAlign: 'center', marginBottom: spacing.xl },
  skeletonBlock: { width: '100%', alignItems: 'center' },
  skeletonLine: {
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.md,
  },
});
