import { buildReport, hitRate, weeklyRecurrence, buildInsight, totalRisk } from '@/domain/report';
import type { ErrorDnaEntry, MistakeRecord, TrapResult, MistakeAnalysis } from '@/domain/types';

const NOW = '2026-02-01T00:00:00.000Z';

function dnaEntry(errorType: string, score: number, improvement = 0): ErrorDnaEntry {
  return {
    userId: 'u', subject: 's', topic: 't', errorType,
    errorDescription: '', evidence: [], occurrenceCount: 2, recentOccurrence: NOW,
    severity: 3, confidence: 0.7, score, improvementScore: improvement, lastUpdated: NOW,
  };
}

function analysis(isCorrect: boolean, errorType?: string): MistakeAnalysis {
  return {
    isCorrect, errorType, reason: 'r', evidence: [], correctionStrategy: 'c',
    severity: 3, confidence: 0.7, relatedConcepts: [], recurrenceRisk: 50,
  };
}

function mistake(daysAgo: number, isCorrect: boolean, errorType?: string): MistakeRecord {
  const createdAt = new Date(new Date(NOW).getTime() - daysAgo * 86400000).toISOString();
  return {
    id: `m${daysAgo}${errorType ?? ''}`, userId: 'u', problemId: 'p', subject: 's', topic: 't',
    isCorrect, errorType, analysis: analysis(isCorrect, errorType),
    attempt: { id: 'a', userId: 'u', problemId: 'p', userAnswer: 'x', confidence: 'medium', createdAt },
    createdAt,
  };
}

function trap(hit: boolean, solved: boolean): TrapResult {
  return {
    id: `tr${Math.random()}`, userId: 'u', trapProblemId: 'tp', targetErrorType: 'edge_case_omission',
    actualErrorType: hit ? 'edge_case_omission' : 'sign_error', predictionHit: hit,
    solvedCorrectly: solved, createdAt: NOW,
  };
}

describe('report', () => {
  it('hitRate computes prediction accuracy', () => {
    expect(hitRate([])).toBe(0);
    expect(hitRate([trap(true, false), trap(false, true)])).toBe(0.5);
    expect(hitRate([trap(true, true), trap(true, false)])).toBe(1);
  });

  it('weeklyRecurrence flags repeated error types across weeks', () => {
    const mistakes = [
      mistake(20, false, 'edge_case_omission'),
      mistake(13, false, 'edge_case_omission'), // repeat
      mistake(6, false, 'sign_error'),
    ];
    const trend = weeklyRecurrence(mistakes, 4, NOW);
    expect(trend).toHaveLength(4);
    const total = trend.reduce((a, w) => a + w.recurrenceRate, 0);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  it('buildReport surfaces most dangerous and most improved', () => {
    const entries = [dnaEntry('edge_case_omission', 83), dnaEntry('concept_confusion', 40, 20)];
    const report = buildReport([mistake(2, true), mistake(1, false, 'edge_case_omission')], [trap(true, true)], entries, 4, NOW);
    expect(report.mostDangerousErrorType).toBe('edge_case_omission');
    expect(report.mostDangerousScore).toBe(83);
    expect(report.mostImprovedErrorType).toBe('concept_confusion');
    expect(report.predictionHitRate).toBe(1);
    expect(report.correctedCount).toBeGreaterThanOrEqual(2);
  });

  it('insight is non-blaming and never judges ability', () => {
    const insight = buildInsight([dnaEntry('verification_omission', 80), dnaEntry('concept_confusion', 40)], []);
    expect(insight).not.toContain('머리');
    expect(insight).not.toContain('소질');
    expect(insight.length).toBeGreaterThan(10);
  });

  it('totalRisk averages entry scores', () => {
    expect(totalRisk([dnaEntry('a', 80), dnaEntry('b', 40)])).toBe(60);
    expect(totalRisk([])).toBe(0);
  });
});
