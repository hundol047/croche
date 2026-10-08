import type {
  MistakeAnalysis,
  Prediction,
  TrapProblem,
  Problem,
  Attempt,
  MemorySnippet,
  Subject,
  ErrorType,
  EducationLevel,
} from '@/domain/types';
import type { Result } from '@/utils/result';

/**
 * The single AI contract the whole app depends on. UI and domain code only ever
 * talk to this interface — never to Croche/LLM directly. Swapping Mock ↔ Real
 * is a one-line change in index.ts.
 *
 * Every method returns a `Result`: on an invalid/failed AI response the caller
 * shows a fallback UI instead of crashing (R4.4).
 */
export interface AnalyzeInput {
  problem: Problem;
  attempt: Attempt;
  /** Only the memories relevant to this problem (selectRelevantMemories output). */
  relevantMemories: MemorySnippet[];
}

export interface PredictInput {
  subject?: Subject;
  topic?: string;
  relevantMemories: MemorySnippet[];
}

export interface TrapInput {
  educationLevel?: EducationLevel;
  /** Previously issued question text, including abandoned questions. */
  avoidQuestions?: string[];
  /** The strongest error type to target. */
  targetErrorType: ErrorType;
  subject: Subject;
  /** Topics the user has recently struggled with, for variety. */
  recentTopics: string[];
  relevantMemories: MemorySnippet[];
}

export interface GenProblemInput {
  educationLevel?: EducationLevel;
  avoidPrompts?: string[];
  subject: Subject;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CrocheAIService {
  readonly kind: 'mock' | 'real';
  analyzeMistake(input: AnalyzeInput): Promise<Result<MistakeAnalysis>>;
  predictNextMistake(input: PredictInput): Promise<Result<Prediction>>;
  generateTrapProblem(input: TrapInput): Promise<Result<TrapProblem>>;
  generateProblem(input: GenProblemInput): Promise<Result<Problem>>;
}
