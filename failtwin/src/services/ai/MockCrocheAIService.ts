import type {
  CrocheAIService,
  AnalyzeInput,
  PredictInput,
  TrapInput,
  GenProblemInput,
} from './CrocheAIService';
import type {
  MistakeAnalysis,
  Prediction,
  TrapProblem,
  Problem,
  ErrorType,
  Subject,
} from '@/domain/types';
import {
  validateMistakeAnalysis,
  validatePrediction,
  validateTrapProblem,
  validateProblem,
} from '@/domain/schemas';
import { errorTypeLabel, errorTypeDescription } from '@/domain/errorTypes';
import { predictFromDna } from '@/domain/prediction';
import { sanitizeStrings } from './toneGuard';
import { clamp, round1 } from '@/utils/clamp';
import { seededId } from '@/utils/id';
import type { Result } from '@/utils/result';
import { TRAP_TEMPLATES } from './trapTemplates';

/**
 * Fully-working, DETERMINISTIC mock of the Croche AI service. Seedable so demo
 * and tests are reproducible. It produces the SAME structured JSON shapes a
 * real model would, so the entire app flow works without any network/SDK.
 *
 * Replace with RealCrocheAIService (same interface) once Croche access is
 * granted — no UI/domain changes needed.
 */
export interface MockOptions {
  /** Simulated latency in ms (0 for tests). */
  latencyMs?: number;
  /** Trap template rotation seed. */
  seed?: number;
}

export class MockCrocheAIService implements CrocheAIService {
  readonly kind = 'mock' as const;
  private latencyMs: number;
  private seed: number;

  constructor(opts: MockOptions = {}) {
    this.latencyMs = opts.latencyMs ?? 450;
    this.seed = opts.seed ?? 1;
  }

  private async delay(): Promise<void> {
    if (this.latencyMs > 0) await new Promise((r) => setTimeout(r, this.latencyMs));
  }

  async analyzeMistake(input: AnalyzeInput): Promise<Result<MistakeAnalysis>> {
    await this.delay();
    const { problem, attempt } = input;
    const isCorrect = compareAnswer(problem.answerType, attempt.userAnswer, problem.correctAnswer);

    if (isCorrect) {
      const analysis: MistakeAnalysis = {
        isCorrect: true,
        reason: `정답입니다. ${problem.topic}의 핵심을 정확히 적용했어요.`,
        evidence: [`제출한 답 "${attempt.userAnswer}"이(가) 정답과 일치합니다.`],
        correctionStrategy:
          '지금처럼 답을 확정하기 전 핵심 조건을 한 번 더 확인하는 습관을 유지하세요.',
        severity: 1,
        confidence: 0.95,
        relatedConcepts: [problem.topic],
        recurrenceRisk: 15,
      };
      return validateMistakeAnalysis(sanitizeStrings(analysis, ['reason', 'correctionStrategy', 'evidence']));
    }

    // Wrong → infer the most likely cognitive mistake.
    const errorType = inferErrorType(problem, attempt.userAnswer, attempt.userReasoning);
    const severity = inferSeverity(input);
    const analysis: MistakeAnalysis = {
      isCorrect: false,
      errorType,
      errorTitle: errorTypeLabel(errorType),
      reason: buildReason(problem, errorType, attempt.userAnswer),
      evidence: buildEvidence(problem, attempt.userAnswer, attempt.userReasoning),
      correctionStrategy: buildCorrection(errorType),
      severity,
      confidence: 0.72,
      relatedConcepts: [problem.topic],
      recurrenceRisk: round1(clamp(45 + severity * 8 + input.relevantMemories.length * 3, 0, 100)),
    };
    return validateMistakeAnalysis(
      sanitizeStrings(analysis, ['reason', 'correctionStrategy', 'evidence', 'errorTitle']),
    );
  }

  async predictNextMistake(input: PredictInput): Promise<Result<Prediction>> {
    await this.delay();
    // Reuse the deterministic DNA baseline, phrased via memory snippets.
    const synthetic = input.relevantMemories.map((m) => ({
      userId: 'ctx',
      subject: input.subject ?? '',
      topic: input.topic ?? '',
      errorType: m.errorType,
      errorDescription: errorTypeDescription(m.errorType),
      evidence: [],
      occurrenceCount: m.occurrenceCount,
      recentOccurrence: m.recentOccurrence,
      severity: 3,
      confidence: 0.7,
      score: m.score,
      improvementScore: 0,
      lastUpdated: m.recentOccurrence,
    }));

    const base = predictFromDna(synthetic, { subject: input.subject, topic: input.topic });
    const prediction: Prediction =
      base ?? {
        predictedErrorType: 'verification_omission',
        riskScore: 30,
        reason: '아직 데이터가 적어 일반적인 검산 생략 위험을 기준으로 예측했어요.',
        relatedMemories: [],
      };
    return validatePrediction(sanitizeStrings(prediction, ['reason', 'relatedMemories']));
  }

  async generateTrapProblem(input: TrapInput): Promise<Result<TrapProblem>> {
    await this.delay();
    const templates = TRAP_TEMPLATES[input.targetErrorType] ?? TRAP_TEMPLATES['verification_omission'];
    const list = templates.filter((t) => t.subject === input.subject);
    const pool = list.length > 0 ? list : templates;
    // Deterministic rotation: vary by seed + recentTopics length so repeated
    // taps produce a DIFFERENT problem (not just new numbers).
    const idx = (this.seed + input.recentTopics.length) % pool.length;
    this.seed += 1;
    const tpl = pool[idx]!;

    const trap: TrapProblem = {
      subject: tpl.subject,
      topic: tpl.topic,
      question: tpl.question,
      answerType: tpl.answerType,
      options: tpl.options,
      correctAnswer: tpl.correctAnswer,
      explanation: tpl.explanation,
      targetErrorType: input.targetErrorType,
      trapExplanation: tpl.trapExplanation,
      difficulty: tpl.difficulty,
    };
    return validateTrapProblem(sanitizeStrings(trap, ['explanation', 'trapExplanation']));
  }

  async generateProblem(input: GenProblemInput): Promise<Result<Problem>> {
    await this.delay();
    const topic = input.topic ?? defaultTopic(input.subject);
    const spec = GENERATED[input.subject];
    const problem: Problem = {
      id: seededId('ai', `${input.subject}-${this.seed++}`),
      subject: input.subject,
      topic,
      prompt: spec.prompt,
      answerType: spec.answerType,
      options: spec.options,
      correctAnswer: spec.correctAnswer,
      explanation: spec.explanation,
      difficulty: input.difficulty ?? 'medium',
      source: 'ai',
      targetErrorType: spec.targetErrorType,
    };
    return validateProblem(problem);
  }
}

// ───────────────────────── heuristics ─────────────────────────

function compareAnswer(type: Problem['answerType'], a: string, correct: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');
  if (type === 'numeric') {
    const na = parseFloat(a.replace(/[^0-9.+-eE]/g, ''));
    const nc = parseFloat(correct.replace(/[^0-9.+-eE]/g, ''));
    if (Number.isNaN(na) || Number.isNaN(nc)) return norm(a) === norm(correct);
    return Math.abs(na - nc) < 1e-6;
  }
  if (type === 'mcq') {
    const setA = new Set(a.split(/[,/\s]+/).map(norm).filter(Boolean));
    const setC = new Set(correct.split(/[,/\s]+/).map(norm).filter(Boolean));
    if (setA.size !== setC.size) return false;
    for (const x of setC) if (!setA.has(x)) return false;
    return true;
  }
  return norm(a) === norm(correct);
}

function inferErrorType(problem: Problem, answer: string, reasoning?: string): ErrorType {
  // Prefer the problem's designed target (the mistake it was built to probe)
  // unless the reasoning text strongly signals a different pattern.
  const text = `${answer} ${reasoning ?? ''}`.toLowerCase();
  if (/빨리|급하게|대충|just|quick/.test(text)) return 'rushed_reasoning';
  if (/단위|unit|km|m\/s/.test(text) && problem.topic.includes('단위')) return 'unit_error';
  if (/부호|minus|음수|negative|\+|-/.test(text) && problem.targetErrorType === 'sign_error')
    return 'sign_error';
  return problem.targetErrorType ?? 'calculation_error';
}

function inferSeverity(input: AnalyzeInput): number {
  // Higher severity when the user was very confident but wrong, or when this
  // error type already recurs in memory.
  let s = 2;
  if (input.attempt.confidence === 'high') s += 2;
  else if (input.attempt.confidence === 'medium') s += 1;
  const inMemory = input.relevantMemories.some(
    (m) => m.errorType === input.problem.targetErrorType,
  );
  if (inMemory) s += 1;
  return clamp(s, 1, 5);
}

function buildReason(problem: Problem, errorType: ErrorType, answer: string): string {
  const label = errorTypeLabel(errorType);
  switch (errorType) {
    case 'edge_case_omission':
      return `접근 방식과 중간 계산은 올바르지만, 끝점·경계값 검토를 생략해 "${answer}"로 답했습니다. ${label}이(가) 결과를 바꾼 지점입니다.`;
    case 'unit_error':
      return `계산 자체는 맞지만 단위 변환을 반영하지 않아 "${answer}"가 되었습니다. ${label}로 분류됩니다.`;
    case 'sign_error':
      return `풀이 흐름은 맞으나 부호 처리에서 어긋나 "${answer}"가 나왔습니다. ${label}입니다.`;
    case 'rushed_reasoning':
      return `충분히 검토하기 전에 답을 빠르게 확정하면서 "${answer}"로 적었습니다. ${label} 패턴입니다.`;
    case 'concept_confusion':
      return `유사하지만 다른 개념을 적용해 "${answer}"로 답했습니다. ${label}입니다.`;
    default:
      return `중간 과정에서 계산이 어긋나 "${answer}"가 되었습니다. ${label}로 분류됩니다.`;
  }
}

function buildEvidence(problem: Problem, answer: string, reasoning?: string): string[] {
  const ev = [`제출한 답 "${answer}"이(가) 정답 "${problem.correctAnswer}"과(와) 다릅니다.`];
  if (reasoning && reasoning.trim().length > 0) {
    ev.push(`작성한 풀이: "${reasoning.trim().slice(0, 160)}"`);
  }
  ev.push(`정답 근거: ${problem.explanation}`);
  return ev;
}

function buildCorrection(errorType: ErrorType): string {
  switch (errorType) {
    case 'edge_case_omission':
      return '답을 확정하기 전, 끝점·경계값을 따로 대입해 검증하는 단계를 루틴으로 추가하세요.';
    case 'unit_error':
      return '최종 답에 단위를 명시하고, 주어진 값과 요구 단위가 일치하는지 마지막에 점검하세요.';
    case 'sign_error':
      return '부호가 바뀌는 단계(이항·제곱·적분)마다 한 줄로 부호를 다시 적어 추적하세요.';
    case 'rushed_reasoning':
      return '제출 전 10초 규칙: 답을 확정하기 전 핵심 조건 1개를 소리내어 재확인하세요.';
    case 'concept_confusion':
      return '혼동되는 두 개념을 한 문장 정의로 나란히 적어 차이를 분명히 한 뒤 적용하세요.';
    default:
      return '중간 계산 결과를 역으로 대입해 검산하는 습관을 들이세요.';
  }
}

function defaultTopic(subject: Subject): string {
  if (subject === '공업수학') return '급수의 수렴구간';
  if (subject === '일반물리') return '등가속도 운동';
  return '반복문 경계';
}

const GENERATED: Record<Subject, Omit<Problem, 'id' | 'subject' | 'topic' | 'source' | 'difficulty'>> = {
  '공업수학': {
    prompt: '멱급수 Σ (xⁿ / n²) (n=1→∞)의 수렴구간을 끝점 포함 여부까지 구하시오.',
    answerType: 'text',
    correctAnswer: '[-1,1]',
    explanation: 'R=1. x=±1에서 Σ1/n² 수렴. 따라서 양 끝점 포함 [-1,1].',
    targetErrorType: 'edge_case_omission',
  },
  '일반물리': {
    prompt: '정지 상태에서 3 m/s²로 가속하는 물체가 4초 후 이동한 거리는? (숫자만)',
    answerType: 'numeric',
    correctAnswer: '24',
    explanation: 's = ½·3·4² = 24 m.',
    targetErrorType: 'calculation_error',
  },
  'Python 프로그래밍': {
    prompt: 'range(0, 10, 3)이 생성하는 값들의 합은? (숫자만)',
    answerType: 'numeric',
    correctAnswer: '18',
    explanation: '0,3,6,9 → 합 18 (10 미포함).',
    targetErrorType: 'edge_case_omission',
  },
};
