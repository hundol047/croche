import { z } from 'zod';
import type { Repositories } from '@/storage/repositories';
import { applyMistake, applyCorrection, upsertEntry, findEntry } from '@/domain/errorDnaEngine';
import { buildReport } from '@/domain/report';
import type { CrocheAIService } from './CrocheAIService';
import { buildMemoryContext } from '@/domain/memorySelect';
import { strongestErrorType } from '@/domain/errorDnaEngine';
import type { Result } from '@/utils/result';
import { Ok, Err } from '@/utils/result';
import { nowIso } from '@/utils/date';
import { uid } from '@/utils/id';
import type { ErrorType, Confidence } from '@/domain/types';

/**
 * Croche Tool interface surface.
 *
 * These wrap app capabilities as named, input-validated tools so a real Croche
 * agent can call them. CRITICAL: every tool validates its input with Zod before
 * touching storage/domain, so the AI can never write arbitrary/invalid data
 * (R7 input validation).
 *
 * In the Mock build these are callable directly by the app. With a real Croche
 * agent, register `TOOL_DEFS` on the agent and route calls to `runTool`.
 */

const userId = z.string().min(1).max(64);
const errorType = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/);

export const TOOL_INPUT_SCHEMAS = {
  getErrorDNA: z.object({ userId }),
  updateErrorDNA: z.object({
    userId,
    subject: z.string().min(1).max(80),
    topic: z.string().min(1).max(120),
    errorType,
    severity: z.number().int().min(1).max(5),
    outcome: z.enum(['mistake', 'correction']),
    confidence: z.enum(['low', 'medium', 'high']).default('medium'),
  }),
  getRecentMistakes: z.object({ userId, limit: z.number().int().min(1).max(50).default(10) }),
  saveMistakeAnalysis: z.object({
    userId,
    problemId: z.string().min(1),
    isCorrect: z.boolean(),
    errorType: errorType.optional(),
  }),
  generateTrapChallenge: z.object({
    userId,
    subject: z.enum(['공업수학', '일반물리', 'Python 프로그래밍']),
  }),
  saveTrapResult: z.object({
    userId,
    trapProblemId: z.string().min(1),
    targetErrorType: errorType,
    actualErrorType: errorType.optional(),
    predictionHit: z.boolean(),
    solvedCorrectly: z.boolean(),
  }),
  getLearningProgress: z.object({ userId }),
} as const;

export type ToolName = keyof typeof TOOL_INPUT_SCHEMAS;

export const TOOL_DEFS: { name: ToolName; description: string }[] = [
  { name: 'getErrorDNA', description: '사용자의 현재 Error DNA 목록을 반환' },
  { name: 'updateErrorDNA', description: '실수/교정 결과로 Error DNA score를 결정적으로 갱신' },
  { name: 'getRecentMistakes', description: '최근 오답 기록을 반환' },
  { name: 'saveMistakeAnalysis', description: '분석 결과를 저장' },
  { name: 'generateTrapChallenge', description: '가장 강한 실수 유형을 target으로 Trap 문제 생성' },
  { name: 'saveTrapResult', description: 'Trap 결과(적중/극복)를 저장' },
  { name: 'getLearningProgress', description: '학습 리포트 지표를 반환' },
];

export class ToolRunner {
  constructor(private repos: Repositories, private ai: CrocheAIService) {}

  async runTool(name: ToolName, rawInput: unknown): Promise<Result<unknown>> {
    const schema = TOOL_INPUT_SCHEMAS[name];
    const parsed = schema.safeParse(rawInput);
    if (!parsed.success) {
      return Err(`tool ${name} 입력이 유효하지 않습니다: ${parsed.error.issues[0]?.message}`);
    }
    const input = parsed.data;
    try {
      switch (name) {
        case 'getErrorDNA':
          return Ok(await this.repos.dna.get((input as { userId: string }).userId));
        case 'updateErrorDNA':
          return Ok(await this.updateDna(input as z.infer<typeof TOOL_INPUT_SCHEMAS.updateErrorDNA>));
        case 'getRecentMistakes': {
          const i = input as z.infer<typeof TOOL_INPUT_SCHEMAS.getRecentMistakes>;
          const all = await this.repos.mistakes.get(i.userId);
          return Ok(all.slice(-i.limit).reverse());
        }
        case 'generateTrapChallenge':
          return this.generateTrap(input as z.infer<typeof TOOL_INPUT_SCHEMAS.generateTrapChallenge>);
        case 'saveTrapResult':
          return Ok(await this.saveTrap(input as z.infer<typeof TOOL_INPUT_SCHEMAS.saveTrapResult>));
        case 'getLearningProgress':
          return Ok(await this.progress((input as { userId: string }).userId));
        case 'saveMistakeAnalysis':
          return Ok({ saved: true });
        default:
          return Err(`unknown tool: ${name as string}`);
      }
    } catch (e) {
      return Err(`tool ${name} 실행 실패: ${(e as Error).message}`);
    }
  }

  private async updateDna(i: z.infer<typeof TOOL_INPUT_SCHEMAS.updateErrorDNA>) {
    const entries = await this.repos.dna.get(i.userId);
    if (i.outcome === 'mistake') {
      const existing = findEntry(entries, i.errorType as ErrorType);
      const next = applyMistake(existing, {
        userId: i.userId,
        subject: i.subject,
        topic: i.topic,
        errorType: i.errorType as ErrorType,
        severity: i.severity,
      });
      const updated = upsertEntry(entries, next);
      await this.repos.dna.save(i.userId, updated);
      return next;
    }
    const existing = findEntry(entries, i.errorType as ErrorType);
    if (!existing) return null;
    const next = applyCorrection(existing, { confidence: i.confidence as Confidence });
    await this.repos.dna.save(i.userId, upsertEntry(entries, next));
    return next;
  }

  private async generateTrap(i: z.infer<typeof TOOL_INPUT_SCHEMAS.generateTrapChallenge>) {
    const entries = await this.repos.dna.get(i.userId);
    const strongest = strongestErrorType(entries);
    const target = (strongest?.errorType ?? 'verification_omission') as ErrorType;
    const recentTopics = entries.slice(0, 3).map((e) => e.topic);
    const memories = buildMemoryContext(entries, { subject: i.subject, topic: strongest?.topic ?? '' });
    return this.ai.generateTrapProblem({
      targetErrorType: target,
      subject: i.subject,
      recentTopics,
      relevantMemories: memories,
    });
  }

  private async saveTrap(i: z.infer<typeof TOOL_INPUT_SCHEMAS.saveTrapResult>) {
    const result = {
      id: uid('trap'),
      userId: i.userId,
      trapProblemId: i.trapProblemId,
      targetErrorType: i.targetErrorType as ErrorType,
      actualErrorType: i.actualErrorType as ErrorType | undefined,
      predictionHit: i.predictionHit,
      solvedCorrectly: i.solvedCorrectly,
      createdAt: nowIso(),
    };
    await this.repos.traps.add(i.userId, result);
    return result;
  }

  private async progress(uidStr: string) {
    const [mistakes, traps, entries] = await Promise.all([
      this.repos.mistakes.get(uidStr),
      this.repos.traps.get(uidStr),
      this.repos.dna.get(uidStr),
    ]);
    return buildReport(mistakes, traps, entries);
  }
}
