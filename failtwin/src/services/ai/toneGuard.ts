/**
 * Safety tone guard (R10): AI output must never judge the person ("you're bad
 * at this", "no talent"). It describes mistakes as correctable behaviour.
 * This runs on any AI-produced natural-language field before display.
 */
const BANNED_PATTERNS: { re: RegExp; replace: string }[] = [
  { re: /머리가?\s*나쁘|머리가?\s*안\s*좋/g, replace: '아직 익숙하지 않은 부분이 있을 뿐이에요' },
  { re: /소질이?\s*없|재능이?\s*없/g, replace: '연습으로 충분히 교정할 수 있는 부분이에요' },
  { re: /바보|멍청|한심/g, replace: '' },
  { re: /you(?:'| a)?re\s+(?:bad|dumb|stupid|not\s+smart)/gi, replace: 'this is a correctable habit' },
  { re: /no\s+talent|not\s+(?:cut\s+out|good\s+enough)/gi, replace: 'something practice can fix' },
];

export function sanitizeTone(text: string): string {
  let out = text;
  for (const { re, replace } of BANNED_PATTERNS) {
    out = out.replace(re, replace);
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

export function sanitizeStrings<T extends object>(obj: T, fields: (keyof T)[]): T {
  const copy: T = { ...obj };
  for (const f of fields) {
    const v = copy[f] as unknown;
    if (typeof v === 'string') {
      copy[f] = sanitizeTone(v) as T[keyof T];
    } else if (Array.isArray(v)) {
      copy[f] = v.map((x) => (typeof x === 'string' ? sanitizeTone(x) : x)) as T[keyof T];
    }
  }
  return copy;
}
