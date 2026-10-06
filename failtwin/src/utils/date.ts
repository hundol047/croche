export function nowIso(): string {
  return new Date().toISOString();
}

export function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.abs(b - a) / (1000 * 60 * 60 * 24);
}

export function isoDaysAgo(days: number, from: string = nowIso()): string {
  const base = new Date(from).getTime();
  return new Date(base - days * 24 * 60 * 60 * 1000).toISOString();
}
