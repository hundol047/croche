import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface IconProps { size?: number; color?: string; }

/** Shared 24px, 1.8px round-stroke language. DNA is the product mark. */
export function DnaIcon({ size = 24, color = colors.brand }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 3c0 4 10 6 10 10S7 17 7 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M17 3c0 4-10 6-10 10s10 6 10 10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    {[6.5, 10, 14, 17.5].map((y, i) => <Line key={y} x1={i === 0 || i === 3 ? 8.5 : 9.5} y1={y} x2={i === 0 || i === 3 ? 15.5 : 14.5} y2={y} stroke={color} strokeWidth={1.8} strokeLinecap="round" />)}
  </Svg>;
}

export function TargetIcon({ size = 24, color = colors.brand }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.8} />
    <Circle cx="12" cy="12" r="1.6" fill={color} />
  </Svg>;
}

export function CheckIcon({ size = 24, color = colors.success }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13l4 4 10-11" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

export function ArrowIcon({ size = 20, color = colors.brand, direction = 'right' }: IconProps & { direction?: 'left' | 'right' }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d={direction === 'left' ? 'M20 12H4m7-7-7 7 7 7' : 'M4 12h16m-7-7 7 7-7 7'} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

export function ReportIcon({ size = 24, color = colors.brand }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3v18h16M9 16v-4m5 4V7m5 9V5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

export function WarningIcon({ size = 24, color = colors.warning }: IconProps) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="m12 3 10 18H2L12 3Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>;
}
