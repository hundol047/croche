import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Pill } from './Pill';
import { Caption } from './typography';
import { spacing } from '@/constants/theme';
import type { Confidence } from '@/domain/types';

interface ConfidenceSelectorProps {
  value: Confidence;
  onChange: (c: Confidence) => void;
}

const OPTIONS: { key: Confidence; label: string }[] = [
  { key: 'low', label: '확신 없음' },
  { key: 'medium', label: '보통' },
  { key: 'high', label: '매우 확신' },
];

export function ConfidenceSelector({ value, onChange }: ConfidenceSelectorProps) {
  return (
    <View>
      <Caption>확신도</Caption>
      <View style={styles.row}>
        {OPTIONS.map((o) => (
          <Pill
            key={o.key}
            label={o.label}
            selected={value === o.key}
            onPress={() => onChange(o.key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
});
