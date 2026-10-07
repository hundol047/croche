import { PROBLEM_BANK } from '@/content/problems';
import {
  validateMistakeAnalysis,
  validatePrediction,
  validateTrapProblem,
  validateProblem,
} from '@/domain/schemas';

describe('schemas (AI JSON validation)', () => {
  it('accepts a valid MistakeAnalysis', () => {
    const r = validateMistakeAnalysis({
      isCorrect: false,
      errorType: 'edge_case_omission',
      errorTitle: '경계조건 누락',
      reason: '끝점 검사를 생략했습니다.',
      evidence: ['제출 답이 정답과 다릅니다.'],
      correctionStrategy: '끝점을 대입해 검증하세요.',
      severity: 3,
      confidence: 0.7,
      relatedConcepts: ['수렴구간'],
      recurrenceRisk: 72,
    });
    expect(r.ok).toBe(true);
  });

  it('rejects out-of-range severity', () => {
    const r = validateMistakeAnalysis({
      isCorrect: false, reason: 'x', correctionStrategy: 'y',
      severity: 9, confidence: 0.5, evidence: [], relatedConcepts: [], recurrenceRisk: 10,
    });
    expect(r.ok).toBe(false);
  });

  it('rejects missing required fields without throwing', () => {
    const r = validateMistakeAnalysis({ isCorrect: true });
    expect(r.ok).toBe(false);
  });

  it('accepts an open/extended errorType token', () => {
    const r = validatePrediction({
      predictedErrorType: 'novel_ai_discovered_type',
      riskScore: 55,
      reason: '최근 패턴 기반 예측',
      relatedMemories: [],
    });
    expect(r.ok).toBe(true);
  });

  it('rejects riskScore above 100', () => {
    const r = validatePrediction({
      predictedErrorType: 'sign_error', riskScore: 140, reason: 'x', relatedMemories: [],
    });
    expect(r.ok).toBe(false);
  });

  it('validates mcq trap requires options containing the correct answer', () => {
    const bad = validateTrapProblem({
      subject: 'Python 프로그래밍', topic: 't', question: 'q', answerType: 'mcq',
      options: ['a', 'b'], correctAnswer: 'c',
      explanation: 'e', targetErrorType: 'concept_confusion', trapExplanation: 'x', difficulty: 'easy',
    });
    expect(bad.ok).toBe(false);

    const good = validateTrapProblem({
      subject: 'Python 프로그래밍', topic: 't', question: 'q', answerType: 'mcq',
      options: ['a', 'b'], correctAnswer: 'b',
      explanation: 'e', targetErrorType: 'concept_confusion', trapExplanation: 'x', difficulty: 'easy',
    });
    expect(good.ok).toBe(true);
  });

  it('validates a bank Problem', () => {
    const r = validateProblem({
      id: 'p1', subject: '일반물리', topic: '등가속도', prompt: 'q', answerType: 'numeric',
      correctAnswer: '25', explanation: 'e', difficulty: 'easy', source: 'bank',
    });
    expect(r.ok).toBe(true);
  });

  it('returns an error string on invalid input (no crash)', () => {
    const r = validateTrapProblem({ nonsense: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('invalid AI response');
  });
});

describe('complete practice bank', () => {
  it('validates all bank problems including multi-select Python answers', () => {
    for (const problem of PROBLEM_BANK) expect(validateProblem(problem).ok).toBe(true);
  });
});
