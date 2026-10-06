import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { clamp } from '@/utils/clamp';

interface ProgressBarProps {
  value: number; // 0..100
  color?: string;
  trackColor?: string;
  height?: number;
}

export function ProgressBar({
  value,
  color = colors.indigo,
  trackColor = colors.surfaceAlt,
  height = 10,
}: ProgressBarProps) {
  const pct = clamp(value, 0, 100);
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, backgroundColor: color, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: radius.pill },
  fill: { height: '100%' },
});
