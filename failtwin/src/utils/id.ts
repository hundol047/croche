/**
 * Lightweight id generator. Deterministic-friendly: when a seed counter is
 * supplied by tests/mock, ids are reproducible; otherwise uses time + random.
 */
let counter = 0;

export function uid(prefix = 'id'): string {
  counter += 1;
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${t}${r}${counter.toString(36)}`;
}

/** Deterministic id for reproducible mock/test flows. */
export function seededId(prefix: string, seed: string | number): string {
  return `${prefix}_${String(seed)}`;
}
