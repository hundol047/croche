import { z } from 'zod';
import type { Result } from '@/utils/result';
import { Ok, Err } from '@/utils/result';
import type { MistakeAnalysis, Prediction, TrapProblem, Problem } from './types';

/**
 * Runtime schemas for ALL structured AI output. The UI never parses free LLM
 * text directly — every AI response passes through validate*() and, on failure,
 * the caller shows a fallback UI instead of crashing.
 */

const answerType = z.enum(['numeric', 'text', 'mcq']);
const subject = z.enum(['공업수학', '일반물리', 'Python 프로그래밍']);
const difficulty = z.enum(['easy', 'medium', 'hard']);

// errorType is an open string (AI may extend the taxonomy) but must be a
// non-empty snake-ish token.
const errorType = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'errorType must be a token');

export const mistakeAnalysisSchema: z.ZodType<MistakeAnalysis> = z.object({
  isCorrect: z.boolean(),
  errorType: errorType.optional(),
  errorTitle: z.string().max(120).optional(),
  reason: z.string().min(1).max(1200),
  evidence: z.array(z.string().max(400)).max(10).default([]),
  correctionStrategy: z.string().min(1).max(800),
  severity: z.number().int().min(1).max(5),
  confidence: z.number().min(0).max(1),
  relatedConcepts: z.array(z.string().max(120)).max(10).default([]),
  recurrenceRisk: z.number().min(0).max(100),
});

export const predictionSchema: z.ZodType<Prediction> = z.object({
  predictedErrorType: errorType,
  riskScore: z.number().min(0).max(100),
  reason: z.string().min(1).max(800),
  relatedMemories: z.array(z.string().max(300)).max(10).default([]),
});

export const trapProblemSchema: z.ZodType<TrapProblem> = z
  .object({
    subject,
    topic: z.string().min(1).max(120),
    question: z.string().min(1).max(2000),
    answerType,
    options: z.array(z.string().max(300)).min(2).max(6).optional(),
    correctAnswer: z.string().min(1).max(400),
    explanation: z.string().min(1).max(1200),
    targetErrorType: errorType,
    trapExplanation: z.string().min(1).max(800),
    difficulty,
  })
  .refine(
    (p) => (p.answerType === 'mcq' ? Array.isArray(p.options) && p.options.length >= 2 : true),
    { message: 'mcq problems require options', path: ['options'] },
  )
  .refine(
    (p) => (p.answerType === 'mcq' ? (p.options ?? []).includes(p.correctAnswer) : true),
    { message: 'correctAnswer must be one of options for mcq', path: ['correctAnswer'] },
  );

export const problemSchema: z.ZodType<Problem> = z
  .object({
    id: z.string().min(1),
    subject,
    topic: z.string().min(1).max(120),
    prompt: z.string().min(1).max(2000),
    answerType,
    options: z.array(z.string().max(300)).min(2).max(6).optional(),
    correctAnswer: z.string().min(1).max(400),
    explanation: z.string().min(1).max(1200),
    difficulty,
    source: z.enum(['bank', 'ai', 'trap']),
    targetErrorType: errorType.optional(),
  })
  .refine(
    (p) => (p.answerType === 'mcq' ? (p.options ?? []).includes(p.correctAnswer) : true),
    { message: 'correctAnswer must be one of options for mcq', path: ['correctAnswer'] },
  );

function toResult<T>(parsed: z.SafeParseReturnType<unknown, T>): Result<T> {
  if (parsed.success) return Ok(parsed.data);
  const first = parsed.error.issues[0];
  const path = first?.path?.join('.') ?? '';
  return Err(`invalid AI response${path ? ` at ${path}` : ''}: ${first?.message ?? 'unknown'}`);
}

export function validateMistakeAnalysis(data: unknown): Result<MistakeAnalysis> {
  return toResult(mistakeAnalysisSchema.safeParse(data));
}
export function validatePrediction(data: unknown): Result<Prediction> {
  return toResult(predictionSchema.safeParse(data));
}
export function validateTrapProblem(data: unknown): Result<TrapProblem> {
  return toResult(trapProblemSchema.safeParse(data));
}
export function validateProblem(data: unknown): Result<Problem> {
  return toResult(problemSchema.safeParse(data));
}
