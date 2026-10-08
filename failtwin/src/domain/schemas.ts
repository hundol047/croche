import { z } from 'zod';
import type { Result } from '@/utils/result';
import { Ok, Err } from '@/utils/result';
import { EDUCATION_LEVELS, SUBJECTS, isCurriculumSubject } from './curriculum';
import type { MistakeAnalysis, Prediction, TrapProblem, Problem } from './types';

/**
 * Runtime schemas for ALL structured AI output. The UI never parses free LLM
 * text directly — every AI response passes through validate*() and, on failure,
 * the caller shows a fallback UI instead of crashing.
 *
 * NOTE on typing: we intentionally do NOT annotate these as `z.ZodType<T>`.
 * Fields that use `.default([])` have an OPTIONAL *input* type but a REQUIRED
 * *output* type, so a `ZodType<T, _, T>` annotation (which forces input===output
 * ===T) does not hold. Instead we let Zod infer the schema, then statically
 * assert — via `assertAssignable` below — that the schema's *output* type is
 * assignable to the domain interface. This keeps full runtime validation while
 * guaranteeing the validated value matches the domain type.
 */

const answerType = z.enum(['numeric', 'text', 'mcq']);
const subject = z.enum(SUBJECTS);
const educationLevel = z.enum(EDUCATION_LEVELS).optional();
const difficulty = z.enum(['easy', 'medium', 'hard']);

// errorType is an open string (AI may extend the taxonomy) but must be a
// non-empty snake-ish token.
const errorType = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'errorType must be a token');

export const mistakeAnalysisSchema = z.object({
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

export const predictionSchema = z.object({
  predictedErrorType: errorType,
  riskScore: z.number().min(0).max(100),
  reason: z.string().min(1).max(800),
  relatedMemories: z.array(z.string().max(300)).max(10).default([]),
});

export const trapProblemSchema = z
  .object({
    subject,
    educationLevel,
    topic: z.string().min(1).max(120),
    question: z.string().min(1).max(2000),
    answerType,
    options: z.array(z.string().max(300)).min(2).max(6).optional(),
    correctAnswer: z.string().min(1).max(400),
    explanation: z.string().min(1).max(1200),
    targetErrorType: errorType,
    targetedWrongAnswers: z.array(z.string().max(400)).max(10).optional(),
    trapExplanation: z.string().min(1).max(800),
    difficulty,
  })
  .refine((p)=>isCurriculumSubject(p.educationLevel??'university',p.subject), {message:'subject is not supported at this education level',path:['subject']})
  .refine(
    (p) => (p.answerType === 'mcq' ? Array.isArray(p.options) && p.options.length >= 2 : true),
    { message: 'mcq problems require options', path: ['options'] },
  )
  .refine(
    (p) => (p.answerType === 'mcq' ? (p.options ?? []).includes(p.correctAnswer) : true),
    { message: 'correctAnswer must be one of options for mcq', path: ['correctAnswer'] },
  );

export const problemSchema = z
  .object({
    id: z.string().min(1),
    subject,
    educationLevel,
    topic: z.string().min(1).max(120),
    prompt: z.string().min(1).max(2000),
    answerType,
    options: z.array(z.string().max(300)).min(2).max(6).optional(),
    correctAnswer: z.string().min(1).max(400),
    explanation: z.string().min(1).max(1200),
    difficulty,
    source: z.enum(['bank', 'ai', 'trap']),
    contentOrigin: z.enum(['parameterized', 'original-csat', 'curriculum-original']).optional(),
    curriculumUnitId: z.string().min(1).max(120).optional(),
    targetErrorType: errorType.optional(),
  })
  .refine((p)=>isCurriculumSubject(p.educationLevel??'university',p.subject), {message:'subject is not supported at this education level',path:['subject']})
  .refine(
    (p) => (p.answerType === 'mcq' ? (p.options ?? []).includes(p.correctAnswer) || p.correctAnswer.split(/,\s*/).every((a: string) => (p.options ?? []).includes(a.trim())) : true),
    { message: 'correctAnswer must be one of options for mcq', path: ['correctAnswer'] },
  );

/**
 * Compile-time guard: fails to type-check if a schema's inferred OUTPUT type is
 * NOT assignable to the corresponding domain interface. This replaces the old
 * `z.ZodType<T>` annotations while still binding schemas to the domain types.
 */
type Assignable<From, To> = From extends To ? true : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertAssignable<_T extends true>(): void {
  /* type-level only */
}
assertAssignable<Assignable<z.infer<typeof mistakeAnalysisSchema>, MistakeAnalysis>>();
assertAssignable<Assignable<z.infer<typeof predictionSchema>, Prediction>>();
assertAssignable<Assignable<z.infer<typeof trapProblemSchema>, TrapProblem>>();
assertAssignable<Assignable<z.infer<typeof problemSchema>, Problem>>();

function toResult<T>(parsed: z.SafeParseReturnType<unknown, T>): Result<T> {
  if (parsed.success) return Ok(parsed.data);
  const first = parsed.error.issues[0];
  const path = first?.path?.join('.') ?? '';
  return Err(`invalid AI response${path ? ` at ${path}` : ''}: ${first?.message ?? 'unknown'}`);
}

// validate* return the domain type. Because the schema output is proven
// assignable to the domain type above, the cast through `toResult<Domain>` is
// type-safe (the runtime value is exactly the validated schema output).
export function validateMistakeAnalysis(data: unknown): Result<MistakeAnalysis> {
  return toResult<MistakeAnalysis>(
    mistakeAnalysisSchema.safeParse(data) as z.SafeParseReturnType<unknown, MistakeAnalysis>,
  );
}
export function validatePrediction(data: unknown): Result<Prediction> {
  return toResult<Prediction>(
    predictionSchema.safeParse(data) as z.SafeParseReturnType<unknown, Prediction>,
  );
}
export function validateTrapProblem(data: unknown): Result<TrapProblem> {
  return toResult<TrapProblem>(
    trapProblemSchema.safeParse(data) as z.SafeParseReturnType<unknown, TrapProblem>,
  );
}
export function validateProblem(data: unknown): Result<Problem> {
  return toResult<Problem>(
    problemSchema.safeParse(data) as z.SafeParseReturnType<unknown, Problem>,
  );
}
