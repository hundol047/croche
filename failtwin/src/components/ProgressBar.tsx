import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { clamp } from '@/utils/clamp';

interface ProgressBarProps {
  value: number; // 0..100
  color?: string;
  trackColor?: string;
  height?: number;
  segmented?: boolean;
}

export function ProgressBar({
  value,
  color = colors.brand,
  trackColor = colors.surfaceAlt,
  height = 4,
  segmented = false,
}: ProgressBarProps) {
  const pct = clamp(value, 0, 100);
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={[styles.track, { height, backgroundColor: trackColor }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, backgroundColor: color },
        ]}
      />
      {segmented ? [25, 50, 75].map((tick) => <View key={tick} style={[styles.tick, { left: `${tick}%` }]} />) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: 1 },
  fill: { height: '100%' },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.surface },
});
