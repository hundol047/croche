import type { Problem, Attempt, MistakeAnalysis, TrapProblem, ErrorType } from '@/domain/types';

/**
 * Ephemeral in-memory store for passing rich objects between screens during a
 * single practice/trap flow (Expo Router params only carry primitives well).
 * Not persisted — the durable data lives in storage repositories.
 */
interface SessionData {
  currentProblem?: Problem;
  currentAttempt?: Attempt;
  currentAnalysis?: MistakeAnalysis;
  currentTrap?: TrapProblem;
  trapTarget?: ErrorType;
}

const data: SessionData = {};

export const sessionStore = {
  set<K extends keyof SessionData>(key: K, value: SessionData[K]): void {
    data[key] = value;
  },
  get<K extends keyof SessionData>(key: K): SessionData[K] {
    return data[key];
  },
  clearPractice(): void {
    delete data.currentProblem;
    delete data.currentAttempt;
    delete data.currentAnalysis;
  },
  clearTrap(): void {
    delete data.currentTrap;
    delete data.trapTarget;
  },
};
