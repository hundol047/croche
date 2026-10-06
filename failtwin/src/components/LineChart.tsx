import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line as SvgLine, Text as SvgText, G } from 'react-native-svg';
import { colors, spacing, typography } from '@/constants/theme';
import type { WeeklyRecurrence } from '@/domain/types';

interface LineChartProps {
  data: WeeklyRecurrence[]; // recurrenceRate 0..1
  width?: number;
  height?: number;
}

/**
 * Lightweight dependency-free line chart (SVG) for weekly recurrence rate.
 * Avoids pulling in a heavy charting library — keeps the bundle lean.
 */
export function LineChart({ data, width = 300, height = 160 }: LineChartProps) {
  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>데이터가 쌓이면 주차별 추이가 표시됩니다.</Text>
      </View>
    );
  }

  const padX = 28;
  const padY = 20;
  const w = width;
  const h = height;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const maxVal = 1; // rate is 0..1
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padX + stepX * i;
    const y = padY + innerH * (1 - d.recurrenceRate / maxVal);
    return { x, y, d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View>
      <Svg width={w} height={h}>
        {/* gridlines at 0, 50, 100% */}
        {[0, 0.5, 1].map((g) => {
          const y = padY + innerH * (1 - g);
          return (
            <G key={`grid-${g}`}>
              <SvgLine x1={padX} y1={y} x2={w - padX} y2={y} stroke={colors.border} strokeWidth={1} />
              <SvgText x={4} y={y + 4} fontSize={10} fill={colors.textFaint}>
                {Math.round(g * 100)}
              </SvgText>
            </G>
          );
        })}

        <Polyline points={polyline} fill="none" stroke={colors.indigo} strokeWidth={2.5} />

        {points.map((p, i) => (
          <G key={`pt-${i}`}>
            <Circle cx={p.x} cy={p.y} r={4} fill={colors.violet} />
            <SvgText x={p.x} y={h - 4} fontSize={10} fill={colors.textMuted} textAnchor="middle">
              {p.d.weekLabel}
            </SvgText>
          </G>
        ))}
      </Svg>
      <Text style={styles.axisNote}>세로축: 실수 재발률 (%)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.textMuted },
  axisNote: { ...typography.caption, color: colors.textFaint, marginTop: spacing.xs },
});
