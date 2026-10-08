import { selectRelevantMemories, buildMemoryContext, toMemorySnippet } from '@/domain/memorySelect';
import type { ErrorDnaEntry } from '@/domain/types';

const AT = '2026-01-10T00:00:00.000Z';

function mk(partial: Partial<ErrorDnaEntry>): ErrorDnaEntry {
  return {
    userId: 'u', subject: '공업수학', topic: '급수', errorType: 'edge_case_omission',
    errorDescription: '', evidence: [], occurrenceCount: 1, recentOccurrence: AT,
    severity: 3, confidence: 0.7, score: 50, improvementScore: 0, lastUpdated: AT,
    ...partial,
  };
}

describe('memorySelect', () => {
  it('selects only the top-N relevant memories', () => {
    const entries = [
      mk({ errorType: 'edge_case_omission', score: 80 }),
      mk({ errorType: 'rushed_reasoning', score: 70 }),
      mk({ errorType: 'calculation_error', score: 60 }),
      mk({ errorType: 'sign_error', score: 10, subject: '일반물리' }),
      mk({ errorType: 'unit_error', score: 5, subject: '일반물리' }),
    ];
    const sel = selectRelevantMemories(entries, { subject: '공업수학', topic: '급수' }, 3, AT);
    expect(sel).toHaveLength(3);
    // highest-scoring, subject/topic-matching entries come first
    expect(sel[0]!.errorType).toBe('edge_case_omission');
  });

  it('subject/topic match boosts relevance over raw score', () => {
    const entries = [
      mk({ errorType: 'high_other', score: 65, subject: '일반물리', topic: '운동' }),
      mk({ errorType: 'match_lower', score: 55, subject: '공업수학', topic: '급수' }),
    ];
    const sel = selectRelevantMemories(entries, { subject: '공업수학', topic: '급수' }, 1, AT);
    expect(sel[0]!.errorType).toBe('match_lower');
  });

  it('buildMemoryContext returns compact snippets, not full entries', () => {
    const entries = [mk({ errorType: 'edge_case_omission', score: 80, occurrenceCount: 3 })];
    const ctx = buildMemoryContext(entries, { subject: '공업수학', topic: '급수' }, 4);
    expect(ctx).toHaveLength(1);
    expect(ctx[0]!.label).toBe('경계조건 누락');
    expect(ctx[0]!.score).toBe(80);
    // snippet carries a human note, not the whole entry
    expect(ctx[0]!.note).toContain('반복');
  });

  it('toMemorySnippet notes recency', () => {
    const s = toMemorySnippet(mk({ recentOccurrence: AT, occurrenceCount: 1 }), AT);
    expect(s.note).toContain('최근');
  });
});
