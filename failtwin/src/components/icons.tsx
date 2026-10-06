import React from 'react';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
}

/** Double-helix DNA mark — FailTwin's core brand asset. */
export function DnaIcon({ size = 24, color = colors.indigo }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3c0 4 10 6 10 10S7 17 7 21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M17 3c0 4-10 6-10 10s10 6 10 10"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line x1="8.5" y1="6.5" x2="15.5" y2="6.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1="9.5" y1="10" x2="14.5" y2="10" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1="9.5" y1="14" x2="14.5" y2="14" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1="8.5" y1="17.5" x2="15.5" y2="17.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/** Target / bullseye — used for Prediction and Trap targeting. */
export function TargetIcon({ size = 24, color = colors.violet }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="12" r="1.6" fill={color} />
    </Svg>
  );
}

/** AI sparkle — marks AI-generated content. */
export function Sparkle({ size = 20, color = colors.violet }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l1.6 4.9L18.5 9.5 13.6 11 12 16l-1.6-5L5.5 9.5l4.9-1.6L12 3z"
        fill={color}
      />
      <Path d="M18.5 15l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z" fill={color} opacity={0.7} />
    </Svg>
  );
}

/** Gradient-friendly check mark for success states. */
export function CheckIcon({ size = 24, color = colors.success }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4 10-11"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BrandGradientDefs({ id }: { id: string }) {
  return (
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={colors.indigo} />
        <Stop offset="1" stopColor={colors.violet} />
      </LinearGradient>
    </Defs>
  );
}
