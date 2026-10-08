import type { Problem, Attempt, TrapProblem, ErrorType, Confidence } from '@/domain/types';
import { getKV, type KVStore } from '@/storage/kv';
import { readStoredJson, writeStoredJson, StorageCorruptionError } from '@/storage/repositories';
import { validateProblem, validateTrapProblem } from '@/domain/schemas';

export interface PracticeDraft { problemId: string; answer: string; reasoning: string; confidence: Confidence }
interface SessionData {
  practiceDraft?: PracticeDraft;
  trapDraft?: PracticeDraft;
  practiceReturnTo?: 'review';
  curriculumHandoffToken?: string;
  currentProblem?: Problem;
  currentAttempt?: Attempt;
  currentTrap?: TrapProblem;
  trapAttempt?: Attempt;
  trapTarget?: ErrorType;
  trapId?: string;
}

/** Serialize snapshots and reject damaged data rather than silently discarding it. */
export class SessionStore {
  private data: SessionData = {};
  private userId: string | null = null;
  private tail: Promise<unknown> = Promise.resolve();
  constructor(private store: () => KVStore = getKV) {}
  async bind(userId: string | null): Promise<void> {
    await this.tail.catch(() => undefined);
    if (this.userId === userId) return;
    if (!userId) { this.data = {}; this.userId = null; return; }
    const key = `ft:${userId}:session`;
    const data = await readStoredJson<SessionData>(this.store(), key, {});
    if ((data.currentProblem !== undefined && (!data.currentProblem || !validateProblem(data.currentProblem).ok))
      || (data.currentTrap !== undefined && (!data.currentTrap || !validateTrapProblem(data.currentTrap).ok))
      || (data.currentAttempt !== undefined && (!data.currentAttempt || typeof data.currentAttempt.id !== 'string' || typeof data.currentAttempt.userAnswer !== 'string' || data.currentAttempt.userId !== userId || data.currentAttempt.problemId !== data.currentProblem?.id))
      || (data.trapAttempt !== undefined && (!data.trapAttempt || typeof data.trapAttempt.id !== 'string' || data.trapAttempt.userId !== userId || data.trapAttempt.problemId !== data.trapId))) throw new StorageCorruptionError(key);
    for (const [draft, id] of [[data.practiceDraft,data.currentProblem?.id],[data.trapDraft,data.trapId]] as const) {
      if (draft !== undefined && (!draft || draft.problemId !== id || typeof draft.answer !== 'string' || draft.answer.length > 256
        || typeof draft.reasoning !== 'string' || draft.reasoning.length > 4000 || !['low','medium','high'].includes(draft.confidence))) throw new StorageCorruptionError(key);
    }
    this.data = data; this.userId = userId;
  }
  get<K extends keyof SessionData>(key: K): SessionData[K] { return this.data[key]; }
  async set<K extends keyof SessionData>(key: K, value: SessionData[K]): Promise<void> {
    await this.change(data => {
      const next = { ...data, [key]: value }; if (key === 'currentAttempt') delete next.practiceDraft; if (key === 'trapAttempt') delete next.trapDraft; return next;
    });
  }
  async savePracticeDraft(draft: PracticeDraft, replaceAttemptId?: string): Promise<void> {
    if (draft.answer.length > 256 || draft.reasoning.length > 4000) throw new Error('입력 길이를 확인해주세요.');
    await this.change(data => {
      if (data.currentProblem?.id !== draft.problemId || (data.currentAttempt && data.currentAttempt.id !== replaceAttemptId)) return data;
      const next = {...data, practiceDraft:draft};delete next.currentAttempt;return next;
    });
  }
  async startPractice(problem: Problem, handoffToken?: string, returnTo?: 'review'): Promise<void> {
    await this.change(data => {
      if (handoffToken && data.curriculumHandoffToken === handoffToken && data.currentProblem?.id === problem.id) return data;
      const next = {...data, currentProblem: problem}; delete next.currentAttempt; delete next.practiceDraft; delete next.curriculumHandoffToken; delete next.practiceReturnTo;
      if (returnTo) next.practiceReturnTo = returnTo;
      if (handoffToken) next.curriculumHandoffToken = handoffToken;
      return next;
    });
  }
  async saveTrapDraft(draft: PracticeDraft, replaceAttemptId?: string): Promise<void> {
    if (draft.answer.length > 256 || draft.reasoning.length > 4000) throw new Error('입력 길이를 확인해주세요.');
    await this.change(data => {
      if (data.trapId !== draft.problemId || (data.trapAttempt && data.trapAttempt.id !== replaceAttemptId)) return data;
      const next = {...data, trapDraft:draft};delete next.trapAttempt;return next;
    });
  }
  async startTrap(trap: TrapProblem, id: string): Promise<void> {
    await this.change(data => { const next = {...data,currentTrap:trap,trapTarget:trap.targetErrorType,trapId:id};delete next.trapAttempt;delete next.trapDraft;return next; });
  }
  async clear(): Promise<void> { await this.change(() => ({})); }
  private async change(update: (data: SessionData) => SessionData): Promise<void> {
    const owner = this.userId;
    const next = this.tail.catch(() => undefined).then(async () => {
      if (this.userId !== owner) return;
      const value = update(this.data);
      if (value === this.data) return;
      if (owner) await writeStoredJson(this.store(), `ft:${owner}:session`, value);
      this.data = value;
    });
    this.tail = next; await next;
  }
}
export const sessionStore = new SessionStore();
