import { isoDaysAgo, nowIso } from '@/utils/date';
import { errorTypeDescription } from '@/domain/errorTypes';
import type { ErrorDnaEntry, ErrorType } from '@/domain/types';

export const DEMO_USER_ID = 'demo-user';
export const DEMO_NAME = '민준';

/**
 * Demo seed so a judge never sees an empty app. Matches the spec example:
 *   조건 누락 83 / 계산 실수 61 / 개념 혼동 47 / 성급한 판단 72
 * Real new users start empty and build their own DNA from actual attempts.
 */
interface SeedSpec {
  errorType: ErrorType;
  subject: string;
  topic: string;
  score: number;
  occurrenceCount: number;
  daysAgo: number;
  severity: number;
}

const SEED: SeedSpec[] = [
  { errorType: 'condition_omission', subject: '공업수학', topic: '급수의 수렴구간', score: 83, occurrenceCount: 4, daysAgo: 1, severity: 4 },
  { errorType: 'rushed_reasoning', subject: '공업수학', topic: '극한', score: 72, occurrenceCount: 3, daysAgo: 2, severity: 3 },
  { errorType: 'calculation_error', subject: '일반물리', topic: '등가속도 운동', score: 61, occurrenceCount: 3, daysAgo: 3, severity: 3 },
  { errorType: 'concept_confusion', subject: 'Python 프로그래밍', topic: '리스트 vs 튜플', score: 47, occurrenceCount: 2, daysAgo: 5, severity: 2 },
  { errorType: 'edge_case_omission', subject: 'Python 프로그래밍', topic: '반복문 경계', score: 38, occurrenceCount: 2, daysAgo: 6, severity: 2 },
];

export function buildDemoDna(userId: string = DEMO_USER_ID): ErrorDnaEntry[] {
  const now = nowIso();
  return SEED.map((s) => ({
    userId,
    subject: s.subject,
    topic: s.topic,
    errorType: s.errorType,
    errorDescription: errorTypeDescription(s.errorType),
    evidence: ['이전 유사 문제에서 동일 유형 오류가 관찰됨'],
    occurrenceCount: s.occurrenceCount,
    recentOccurrence: isoDaysAgo(s.daysAgo, now),
    severity: s.severity,
    confidence: 0.8,
    score: s.score,
    improvementScore: s.errorType === 'concept_confusion' ? 10 : 0,
    lastUpdated: isoDaysAgo(s.daysAgo, now),
  }));
}
