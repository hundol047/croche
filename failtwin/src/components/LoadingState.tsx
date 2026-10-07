import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { DnaIcon } from './icons';

interface LoadingStateProps {
  message: string;
}

/**
 * Loading state with quiet DNA rails and a context-specific utility message.
 * Animation is subtle (opacity pulse) — no heavy motion (R13 / R11.1).
 */
export function LoadingState({ message }: LoadingStateProps) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.container}>
      <View style={styles.sparkleRow}>
        <DnaIcon size={24} color={colors.brand} />
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
    height: 4,
    borderRadius: 1,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.md,
  },
});
