import type {
  CrocheAIService,
  AnalyzeInput,
  PredictInput,
  TrapInput,
  GenProblemInput,
} from './CrocheAIService';
import type { MistakeAnalysis, Prediction, TrapProblem, Problem } from '@/domain/types';
import {
  validateMistakeAnalysis,
  validatePrediction,
  validateTrapProblem,
  validateProblem,
} from '@/domain/schemas';
import { sanitizeStrings } from './toneGuard';
import { modelForTask } from './modelPolicy';
import type { CrocheClient } from '@/services/croche/client';
import type { Result } from '@/utils/result';
import { Err } from '@/utils/result';

/**
 * Real Croche-backed AI service.
 *
 * ⚠️ REAL CROCHE INTEGRATION POINT ⚠️
 * The structure is complete: it builds compact prompts, selects the model tier
 * via modelPolicy, passes ONLY the pre-selected relevant memories as context,
 * calls the Croche client for JSON output, then validates with the SAME Zod
 * schemas as the Mock and applies the tone guard.
 *
 * The ONLY thing missing is a live Croche client (createCrocheClient returns
 * null until the SDK is installed + configured). When a client is present this
 * class is fully functional and the app behaves identically — just backed by a
 * real model instead of the deterministic mock.
 */
export class RealCrocheAIService implements CrocheAIService {
  readonly kind = 'real' as const;
  constructor(private client: CrocheClient) {}

  async analyzeMistake(input: AnalyzeInput): Promise<Result<MistakeAnalysis>> {
    const raw = await this.safeComplete({
      model: modelForTask('analyze_mistake'),
      system: SYS_ANALYZE,
      user: JSON.stringify({
        problem: {
          subject: input.problem.subject,
          topic: input.problem.topic,
          prompt: input.problem.prompt,
          correctAnswer: input.problem.correctAnswer,
          explanation: input.problem.explanation,
          targetErrorType: input.problem.targetErrorType,
        },
        answer: input.attempt.userAnswer,
        reasoning: input.attempt.userReasoning ?? '',
        confidence: input.attempt.confidence,
      }),
      context: input.relevantMemories.map(memoryLine),
    });
    if (!raw.ok) return raw;
    const v = validateMistakeAnalysis(raw.value);
    if (!v.ok) return v;
    return {
      ok: true,
      value: sanitizeStrings(v.value, ['reason', 'correctionStrategy', 'evidence', 'errorTitle']),
    };
  }

  async predictNextMistake(input: PredictInput): Promise<Result<Prediction>> {
    const raw = await this.safeComplete({
      model: modelForTask('predict_mistake'),
      system: SYS_PREDICT,
      user: JSON.stringify({ subject: input.subject, topic: input.topic }),
      context: input.relevantMemories.map(memoryLine),
    });
    if (!raw.ok) return raw;
    const v = validatePrediction(raw.value);
    if (!v.ok) return v;
    return { ok: true, value: sanitizeStrings(v.value, ['reason', 'relatedMemories']) };
  }

  async generateTrapProblem(input: TrapInput): Promise<Result<TrapProblem>> {
    const raw = await this.safeComplete({
      model: modelForTask('generate_trap'),
      system: SYS_TRAP,
      user: JSON.stringify({
        targetErrorType: input.targetErrorType,
        subject: input.subject,
        avoidTopics: input.recentTopics,
      }),
      context: input.relevantMemories.map(memoryLine),
    });
    if (!raw.ok) return raw;
    const v = validateTrapProblem(raw.value);
    if (!v.ok) return v;
    return { ok: true, value: sanitizeStrings(v.value, ['explanation', 'trapExplanation']) };
  }

  async generateProblem(input: GenProblemInput): Promise<Result<Problem>> {
    const raw = await this.safeComplete({
      model: modelForTask('generate_problem'),
      system: SYS_GEN,
      user: JSON.stringify(input),
      context: [],
    });
    if (!raw.ok) return raw;
    return validateProblem(raw.value);
  }

  private async safeComplete(args: {
    model: string;
    system: string;
    user: string;
    context: string[];
  }): Promise<Result<unknown>> {
    try {
      const out = await this.client.completeJson(args);
      return { ok: true, value: out };
    } catch (e) {
      return Err(`AI 호출에 실패했습니다: ${(e as Error).message ?? 'unknown error'}`);
    }
  }
}

function memoryLine(m: { label: string; score: number; note: string }): string {
  return `${m.label} (위험도 ${Math.round(m.score)}) · ${m.note}`;
}

// Prompts instruct JSON-only output and a non-blaming, correction-focused tone.
const JSON_RULE =
  '반드시 지정된 JSON 스키마에 맞는 JSON만 출력하라. 설명 텍스트를 JSON 밖에 추가하지 마라.';
const TONE_RULE =
  '학습자를 비난하거나 능력을 단정하지 말고, 교정 가능한 행동 패턴으로 설명하라.';

const SYS_ANALYZE = `너는 학습자의 오답 원인을 분석하는 조력자다. ${TONE_RULE} 정답 여부, 핵심 실수 유형(errorType), 원인(reason), 근거(evidence), 교정 전략(correctionStrategy), severity(1-5), confidence(0-1), relatedConcepts, recurrenceRisk(0-100)을 포함한 MistakeAnalysis JSON을 출력하라. ${JSON_RULE}`;
const SYS_PREDICT = `너는 학습자의 과거 실수 메모리를 바탕으로 다음 문제에서 발생 가능성이 높은 실수를 예측한다. riskScore는 통계적 확률이 아니라 AI 예측 점수(0-100)다. Prediction JSON(predictedErrorType, riskScore, reason, relatedMemories)을 출력하라. ${JSON_RULE}`;
const SYS_TRAP = `너는 학습자가 특정 인지적 실수(targetErrorType)를 범하기 쉬운 새로운 문제를 설계한다. 이전 문제의 숫자만 바꾸지 말고 내용이 다른 새 문제를 만들되 같은 실수를 유발해야 한다. ${TONE_RULE} TrapProblem JSON을 출력하라. ${JSON_RULE}`;
const SYS_GEN = `너는 지정된 과목/주제의 연습문제를 만든다. Problem JSON을 출력하라. ${JSON_RULE}`;
