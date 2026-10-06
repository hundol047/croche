/**
 * Basic rendering smoke tests for key presentational components.
 *
 * These run under the real Jest + jest-expo preset on a networked machine
 * (`npm test`). They are NOT part of the offline logic harness (which cannot
 * render react-native). See verify/README.md.
 */
import React from 'react';
import renderer from 'react-test-renderer';

import { ErrorDnaBars } from '@/components/ErrorDnaBars';
import { PredictionCard } from '@/components/PredictionCard';
import { TrapCard } from '@/components/TrapCard';
import { InsightCard } from '@/components/InsightCard';
import { LineChart } from '@/components/LineChart';
import { ModeBadge } from '@/components/ModeBadge';
import { EmptyState } from '@/components/EmptyState';
import type { ErrorDnaEntry, Prediction, WeeklyRecurrence } from '@/domain/types';

const AT = '2026-01-10T00:00:00.000Z';
const dna: ErrorDnaEntry[] = [
  {
    userId: 'u', subject: '공업수학', topic: '급수', errorType: 'condition_omission',
    errorDescription: '', evidence: [], occurrenceCount: 4, recentOccurrence: AT,
    severity: 4, confidence: 0.8, score: 83, improvementScore: 0, lastUpdated: AT,
  },
];
const prediction: Prediction = {
  predictedErrorType: 'condition_omission',
  riskScore: 68,
  reason: '경계조건 누락 경향이 높습니다.',
  relatedMemories: ['계산 실수 61'],
};
const trend: WeeklyRecurrence[] = [
  { weekLabel: 'W1', recurrenceRate: 0.6 },
  { weekLabel: 'W2', recurrenceRate: 0.4 },
];

describe('component rendering', () => {
  it('renders ErrorDnaBars without crashing', () => {
    const tree = renderer.create(<ErrorDnaBars entries={dna} />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders ErrorDnaBars empty state', () => {
    const tree = renderer.create(<ErrorDnaBars entries={[]} />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders PredictionCard with the AI-score disclaimer', () => {
    const tree = renderer.create(<PredictionCard prediction={prediction} />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders TrapCard with a target error type', () => {
    const tree = renderer.create(<TrapCard targetErrorType="condition_omission" />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders InsightCard', () => {
    const tree = renderer.create(<InsightCard text="조건 검증을 생략하는 경향이 있어요." />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders LineChart with data and empty', () => {
    expect(renderer.create(<LineChart data={trend} />).toJSON()).toBeTruthy();
    expect(renderer.create(<LineChart data={[]} />).toJSON()).toBeTruthy();
  });

  it('renders ModeBadge for every status', () => {
    expect(renderer.create(<ModeBadge status="mock" />).toJSON()).toBeTruthy();
    expect(renderer.create(<ModeBadge status="real" />).toJSON()).toBeTruthy();
    expect(renderer.create(<ModeBadge status="real-unavailable" />).toJSON()).toBeTruthy();
  });

  it('renders EmptyState with a CTA', () => {
    const tree = renderer
      .create(<EmptyState title="아직 Error DNA가 없어요" description="문제를 풀어보세요." ctaLabel="첫 문제 풀기" onCta={() => {}} />)
      .toJSON();
    expect(tree).toBeTruthy();
  });
});
