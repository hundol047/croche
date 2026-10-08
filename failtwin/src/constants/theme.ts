/** A quiet learning workspace: ink blue, paper surfaces and functional DNA marks. */
export const colors = {
  bg: '#F4F5F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EAEEF2',
  brand: '#243F63',
  brandTint: '#E8EEF5',
  ink: '#202D40',
  trapAccent: '#827394',
  success: '#2D6A55',
  successTint: '#EDF4F0',
  warning: '#93601D',
  danger: '#B4483D',
  text: '#202B3B',
  textMuted: '#586679',
  textFaint: '#627082',
  onDark: '#FFFFFF',
  onDarkMuted: '#CCD6E3',
  border: '#D9DFE5',
  controlBorder: '#7E8B9D',
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
} as const;

export const radius = {
  sm: 8, md: 10, lg: 12, xl: 16,
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 36, fontWeight: '600' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const, letterSpacing: -0.3 },
  section: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 24, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 24, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
  mono: { fontSize: 14, lineHeight: 22, fontWeight: '500' as const, fontFamily: 'monospace' as const },
} as const;

/** Learning risk uses warm attention, not emergency red. Green means correction. */
export function scoreColor(score: number): string {
  if (score >= 70) return colors.warning;
  if (score >= 45) return colors.brand;
  return colors.textMuted;
}
