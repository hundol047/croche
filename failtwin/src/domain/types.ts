import type { ErrorType } from './errorTypes';

export type { ErrorType };

export type Confidence = 'low' | 'medium' | 'high';
export type AnswerType = 'numeric' | 'text' | 'mcq';
export type Subject = '공업수학' | '일반물리' | 'Python 프로그래밍';
export type LearningGoal = '대학교 전공' | '수능' | '자격증' | '코딩' | '기타';
export type ModelTier = 'cheap' | 'quality';

export interface UserProfile {
  userId: string;
  name: string;
  goal: LearningGoal;
  interests: Subject[];
  isDemo: boolean;
  createdAt: string;
}

/**
 * A single Error DNA entry. This is the local projection of one Croche Memory
 * record. Fields map 1:1 to the Memory concept required by the spec.
 */
export interface ErrorDnaEntry {
  userId: string;
  subject: string;
  topic: string;
  errorType: ErrorType;
  errorDescription: string;
  evidence: string[];
  occurrenceCount: number;
  recentOccurrence: string; // ISO date
  severity: number; // 1..5 (latest observed)
  confidence: number; // 0..1 (AI confidence in classification)
  score: number; // 0..100 (deterministic risk score)
  improvementScore: number; // cumulative, grows with corrections
  lastUpdated: string; // ISO date
}

export interface Problem {
  id: string;
  subject: Subject;
  topic: string;
  prompt: string;
  answerType: AnswerType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'bank' | 'ai' | 'trap';
  /** For trap/ai problems: the cognitive mistake this problem is designed to probe. */
  targetErrorType?: ErrorType;
}

export interface Attempt {
  id: string;
  userId: string;
  problemId: string;
  userAnswer: string;
  userReasoning?: string;
  confidence: Confidence;
  createdAt: string;
}

/** Structured AI output for mistake analysis (schema-validated at runtime). */
export interface MistakeAnalysis {
  isCorrect: boolean;
  errorType?: ErrorType;
  errorTitle?: string;
  reason: string;
  evidence: string[];
  correctionStrategy: string;
  severity: number; // 1..5
  confidence: number; // 0..1
  relatedConcepts: string[];
  recurrenceRisk: number; // 0..100 — AI-estimated risk of recurrence
}

/** Structured AI output for next-mistake prediction. */
export interface Prediction {
  predictedErrorType: ErrorType;
  riskScore: number; // 0..100 — "AI prediction score", NOT a validated probability
  reason: string;
  relatedMemories: string[];
}

/** Structured AI output for a generated trap problem. */
export interface TrapProblem {
  /** Explicit misconception answers used by the deterministic Mock evaluator. */
  targetedWrongAnswers?: string[];
  subject: Subject;
  topic: string;
  question: string;
  answerType: AnswerType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  targetErrorType: ErrorType;
  trapExplanation: string; // why this problem tends to trigger the target mistake
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MistakeRecord {
  beforeScore?: number | null;
  afterScore?: number | null;
  id: string;
  userId: string;
  problemId: string;
  subject: string;
  topic: string;
  isCorrect: boolean;
  errorType?: ErrorType;
  analysis: MistakeAnalysis;
  attempt: Attempt;
  createdAt: string;
}

export interface TrapResult {
  topic?: string;
  beforeScore?: number | null;
  afterScore?: number | null;
  id: string;
  userId: string;
  trapProblemId: string;
  targetErrorType: ErrorType;
  actualErrorType?: ErrorType;
  predictionHit: boolean;
  solvedCorrectly: boolean;
  createdAt: string;
}

export interface WeeklyRecurrence {
  weekLabel: string; // e.g. "W1"
  recurrenceRate: number; // 0..1
}

export interface LearningReport {
  recurrenceTrend: WeeklyRecurrence[];
  predictionHitRate: number; // 0..1
  correctedCount: number;
  mostImprovedErrorType?: ErrorType;
  mostImprovedDelta: number;
  mostDangerousErrorType?: ErrorType;
  mostDangerousScore: number;
  insight: string;
}

/** Memory snippet passed into AI context (a trimmed projection of ErrorDnaEntry). */
export interface MemorySnippet {
  errorType: ErrorType;
  label: string;
  score: number;
  occurrenceCount: number;
  recentOccurrence: string;
  note: string;
}
