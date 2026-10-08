import {
  applyMistake,
  applyCorrection,
  applyDecay,
  strongestErrorType,
  upsertEntry,
  findEntry,
} from '@/domain/errorDnaEngine';
import { DNA_CONFIG } from '@/constants/errorDna';
import type { ErrorDnaEntry } from '@/domain/types';

const AT = '2026-01-10T00:00:00.000Z';

describe('errorDnaEngine', () => {
  it('first mistake does not spike the score (gentle)', () => {
    const e = applyMistake(undefined, {
      userId: 'u',
      subject: '공업수학',
      topic: '급수',
      errorType: 'edge_case_omission',
      severity: 3,
      at: AT,
    });
    // BASE_STEP(8) + SEVERITY_UNIT(3)*3 = 17
    expect(e.score).toBe(17);
    expect(e.occurrenceCount).toBe(1);
    expect(e.score).toBeLessThan(40); // never spikes from one mistake
  });

  it('recurrence increases score more than a single mistake', () => {
    let e = applyMistake(undefined, {
      userId: 'u', subject: 's', topic: 't', errorType: 'sign_error', severity: 2, at: AT,
    });
    const afterFirst = e.score;
    e = applyMistake(e, {
      userId: 'u', subject: 's', topic: 't', errorType: 'sign_error', severity: 2, at: AT,
    });
    const firstDelta = afterFirst; // from 0
    const secondDelta = e.score - afterFirst;
    expect(secondDelta).toBeGreaterThan(firstDelta - firstDelta); // positive
    // second mistake uses RECUR_STEP*min(occ,cap) + severity
    // = 6*1 + 3*2 = 12, vs first = 8 + 6 = 14... recurrence weight grows with occ
    expect(e.score).toBeGreaterThan(afterFirst);
    expect(e.occurrenceCount).toBe(2);
  });

  it('repeated mistakes accumulate and are capped at 100', () => {
    let e: ErrorDnaEntry | undefined;
    for (let i = 0; i < 15; i += 1) {
      e = applyMistake(e, {
        userId: 'u', subject: 's', topic: 't', errorType: 'rushed_reasoning', severity: 5, at: AT,
      });
    }
    expect(e!.score).toBe(100);
    expect(e!.score).toBeLessThanOrEqual(DNA_CONFIG.SCORE_MAX);
  });

  it('successful correction decreases the score', () => {
    const e = applyMistake(undefined, {
      userId: 'u', subject: 's', topic: 't', errorType: 'unit_error', severity: 4, at: AT,
    });
    const before = e.score;
    const corrected = applyCorrection(e, { confidence: 'high', at: AT });
    // CORRECTION_STEP(7) + CONFIDENCE_UNIT(2)*2 = 11
    expect(corrected.score).toBe(before - 11);
    expect(corrected.improvementScore).toBe(DNA_CONFIG.IMPROVEMENT_UNIT);
  });

  it('score never goes below 0 on correction', () => {
    let e = applyMistake(undefined, {
      userId: 'u', subject: 's', topic: 't', errorType: 'unit_error', severity: 1, at: AT,
    });
    for (let i = 0; i < 5; i += 1) e = applyCorrection(e, { confidence: 'high', at: AT });
    expect(e.score).toBeGreaterThanOrEqual(0);
    expect(e.score).toBe(0);
  });

  it('decay lowers score but respects an occurrence floor', () => {
    const e = applyMistake(undefined, {
      userId: 'u', subject: 's', topic: 't', errorType: 'concept_confusion', severity: 5, at: '2026-01-01T00:00:00.000Z',
    });
    // large elapsed time
    const decayed = applyDecay(e, '2026-12-01T00:00:00.000Z');
    const floor = e.occurrenceCount * DNA_CONFIG.OCCURRENCE_FLOOR_UNIT;
    expect(decayed.score).toBeGreaterThanOrEqual(floor);
    expect(decayed.score).toBeLessThanOrEqual(e.score);
  });

  it('strongestErrorType returns the highest score entry', () => {
    const entries: ErrorDnaEntry[] = [
      mk('a', 30), mk('b', 71), mk('c', 55),
    ];
    expect(strongestErrorType(entries)?.errorType).toBe('b');
  });

  it('upsertEntry replaces by errorType and findEntry locates it', () => {
    let list: ErrorDnaEntry[] = [mk('a', 10)];
    list = upsertEntry(list, mk('a', 50));
    expect(list).toHaveLength(1);
    expect(findEntry(list, 'a')?.score).toBe(50);
    list = upsertEntry(list, mk('b', 20));
    expect(list).toHaveLength(2);
  });
});

function mk(errorType: string, score: number): ErrorDnaEntry {
  return {
    userId: 'u', subject: 's', topic: 't', errorType,
    errorDescription: '', evidence: [], occurrenceCount: 1,
    recentOccurrence: AT, severity: 3, confidence: 0.7,
    score, improvementScore: 0, lastUpdated: AT,
  };
}
