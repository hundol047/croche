import { Platform, type ViewStyle } from 'react-native';
/**
 * FailTwin design tokens.
 * White base with blue / indigo / violet accents — modern EdTech feel.
 */

export const colors = {
  // surfaces
  bg: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F3FB',

  // brand
  blue: '#3B5BFF',
  indigo: '#4F46E5',
  violet: '#7C3AED',

  // gradients (used by components building their own gradient stops)
  gradientStart: '#4F46E5',
  gradientMid: '#6D5BF5',
  gradientEnd: '#7C3AED',

  // semantic
  success: '#047857',
  warning: '#B45309',
  danger: '#DC2626',

  // text
  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#6B7280',
  onDark: '#FFFFFF',
  onDarkMuted: '#E0E7FF',

  // lines / shadows
  border: '#E2E8F0',
  shadow: '#1E293B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const },
  section: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  bodyStrong: { fontSize: 15, fontWeight: '700' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  mono: { fontSize: 14, fontWeight: '600' as const, fontFamily: 'monospace' as const },
} as const;

const webCardShadow: ViewStyle & { boxShadow: string } = { boxShadow: '0 8px 20px rgba(30,41,59,0.08)' };
const webSoftShadow: ViewStyle & { boxShadow: string } = { boxShadow: '0 4px 12px rgba(30,41,59,0.06)' };
export const shadow = {
  card: Platform.OS === 'web' ? webCardShadow : {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  soft: Platform.OS === 'web' ? webSoftShadow : {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
} as const;

/** Severity (0-100 score) → semantic color for Error DNA bars. */
export function scoreColor(score: number): string {
  if (score >= 70) return colors.danger;
  if (score >= 45) return colors.warning;
  return colors.success;
}

/** Risk score (0-100) → label color for prediction cards. */
export function riskColor(score: number): string {
  if (score >= 66) return colors.violet;
  if (score >= 40) return colors.indigo;
  return colors.blue;
}
