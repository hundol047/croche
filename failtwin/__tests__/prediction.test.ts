import { predictFromDna } from '@/domain/prediction';
import type { ErrorDnaEntry } from '@/domain/types';

const AT = '2026-01-10T00:00:00.000Z';

function mk(errorType: string, score: number, occ = 1, days = 0): ErrorDnaEntry {
  const recent = new Date(new Date(AT).getTime() - days * 86400000).toISOString();
  return {
    userId: 'u', subject: '공업수학', topic: '급수', errorType,
    errorDescription: '', evidence: [], occurrenceCount: occ, recentOccurrence: recent,
    severity: 3, confidence: 0.7, score, improvementScore: 0, lastUpdated: recent,
  };
}

describe('prediction', () => {
  it('returns null when there is no data', () => {
    expect(predictFromDna([], {}, AT)).toBe(null);
  });

  it('predicts the highest-weighted error type', () => {
    const p = predictFromDna([mk('edge_case_omission', 80, 4, 0), mk('sign_error', 40)], {}, AT);
    expect(p?.predictedErrorType).toBe('edge_case_omission');
    expect(p!.riskScore).toBeGreaterThan(0);
    expect(p!.riskScore).toBeLessThanOrEqual(100);
  });

  it('risk score is deterministic for the same input', () => {
    const entries = [mk('rushed_reasoning', 72, 3, 1)];
    const a = predictFromDna(entries, { subject: '공업수학', topic: '급수' }, AT);
    const b = predictFromDna(entries, { subject: '공업수학', topic: '급수' }, AT);
    expect(a!.riskScore).toBe(b!.riskScore);
  });

  it('includes related memories and a reason', () => {
    const p = predictFromDna(
      [mk('edge_case_omission', 80, 4), mk('rushed_reasoning', 60), mk('sign_error', 40)],
      { topic: '급수' },
      AT,
    );
    expect(p!.reason.length).toBeGreaterThan(0);
    expect(p!.relatedMemories.length).toBeGreaterThanOrEqual(1);
  });
});
