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
import type { Result } from '@/utils/result';
import { TRAP_TEMPLATES } from './trapTemplates';
import { assessAnswer } from '@/domain/answerAssessment';
import { practiceVariants } from '@/content/practiceVariants';
import { Err } from '@/utils/result';

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
  private trapTurns = new Map<string, number>();
  private practiceTurns = new Map<Subject, number>();

  constructor(opts: MockOptions = {}) {
    this.latencyMs = opts.latencyMs ?? 450;
  }

  private async delay(): Promise<void> {
    if (this.latencyMs > 0) await new Promise((r) => setTimeout(r, this.latencyMs));
  }

  async analyzeMistake(input: AnalyzeInput): Promise<Result<MistakeAnalysis>> {
    await this.delay();
    const { problem, attempt } = input;
    const assessment = assessAnswer(problem, attempt.userAnswer);
    if (assessment.verdict === 'ungradable') return Err(assessment.guidance);
    const isCorrect = assessment.verdict === 'correct';

    if (isCorrect) {
      const analysis: MistakeAnalysis = {
        isCorrect: true,
        reason: `정답입니다. ${problem.topic}의 핵심을 정확히 적용했어요.`,
        evidence: [`제출한 답: ${attempt.userAnswer}`, `정답 근거: ${problem.explanation}`],
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
    const matching = list.length > 0 ? list : templates;
    const available = matching.filter((t) => !(input.avoidQuestions ?? []).includes(t.question));
    if (!available.length) return Err('EXHAUSTED: 이 패턴의 준비된 문제를 모두 열어봤습니다. 다른 패턴이나 기본 문제를 선택해주세요.');
    const unseen = available.filter((t) => !input.recentTopics.includes(t.topic));
    const pool = unseen.length ? unseen : available;
    // Rotation is independent of unrelated generateProblem calls.
    const key = `${input.targetErrorType}:${input.subject}`;
    const turn = this.trapTurns.get(key) ?? 0;
    const idx = turn % pool.length;
    this.trapTurns.set(key, turn + 1);
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
      targetedWrongAnswers: tpl.targetedWrongAnswers,
      trapExplanation: tpl.trapExplanation,
      difficulty: tpl.difficulty,
    };
    return validateTrapProblem(sanitizeStrings(trap, ['explanation', 'trapExplanation']));
  }

  async generateProblem(input: GenProblemInput): Promise<Result<Problem>> {
    await this.delay();
    const available = practiceVariants(input.subject).filter((p) => !(input.avoidPrompts ?? []).includes(p.prompt));
    if (!available.length) return Err('EXHAUSTED: 이 과목의 추가 문제를 모두 열어봤습니다. 기본 문제를 다시 연습해주세요.');
    const turn = this.practiceTurns.get(input.subject) ?? 0;
    this.practiceTurns.set(input.subject, turn + 1);
    const next = available[input.avoidPrompts ? 0 : turn % available.length]!;
    return validateProblem(next);
  }
}

// ───────────────────────── heuristics ─────────────────────────

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
    case 'condition_omission':
      return `주어진 정의역이나 전제조건을 모두 반영하지 않아 "${answer}"로 답했어요. 정답 해설과 조건을 하나씩 비교해보세요.`;
    case 'edge_case_omission':
      return `답 "${answer}"가 정답의 끝점 조건과 다릅니다. 끝점·경계값을 각각 확인해보세요.`;
    case 'unit_error':
      return `답 "${answer}"가 요구 단위의 정답과 다릅니다. 단위 변환을 확인해보세요.`;
    case 'sign_error':
      return `답 "${answer}"의 계수나 부호가 정답과 다릅니다. 해설과 각 항을 비교해보세요.`;
    case 'rushed_reasoning':
      return `충분히 검토하기 전에 답을 빠르게 확정하면서 "${answer}"로 적었습니다. ${label} 패턴입니다.`;
    case 'concept_confusion':
      return `유사하지만 다른 개념을 적용해 "${answer}"로 답했습니다. ${label}입니다.`;
    default:
      return `중간 과정에서 계산이 어긋나 "${answer}"가 되었습니다. ${label}로 분류됩니다.`;
  }
}

function buildEvidence(problem: Problem, answer: string, reasoning?: string): string[] {
  const ev = [`제출한 답: ${answer}`, `정답: ${problem.correctAnswer}`];
  if (reasoning && reasoning.trim().length > 0) {
    ev.push(`작성한 풀이: "${reasoning.trim().slice(0, 160)}"`);
  }
  ev.push(`정답 근거: ${problem.explanation}`);
  return ev;
}

function buildCorrection(errorType: ErrorType): string {
  switch (errorType) {
    case 'condition_omission':
      return '계산을 시작하기 전 정의역·분모·전제조건을 적고, 답을 낸 뒤 모든 조건을 만족하는지 확인하세요.';
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
