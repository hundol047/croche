import type { Problem, Attempt, TrapProblem, ErrorType } from '@/domain/types';
import { getKV, type KVStore } from '@/storage/kv';

interface SessionData {
  curriculumHandoffToken?: string;
  currentProblem?: Problem;
  currentAttempt?: Attempt;
  currentTrap?: TrapProblem;
  trapAttempt?: Attempt;
  trapTarget?: ErrorType;
  trapId?: string;
}

/** Per-user flow snapshot, restored before routes mount. Durable outcomes live in repositories. */
export class SessionStore {
  private data: SessionData = {};
  private userId: string | null = null;
  constructor(private store: () => KVStore = getKV) {}

  async bind(userId: string | null): Promise<void> {
    if (this.userId === userId) return;
    if (!userId) { this.data = {}; this.userId = null; return; }
    const raw = await this.store().getItem(`ft:${userId}:session`);
    try { this.data = raw ? JSON.parse(raw) as SessionData : {}; }
    catch { this.data = {}; }
    this.userId = userId;
  }
  get<K extends keyof SessionData>(key: K): SessionData[K] { return this.data[key]; }
  async set<K extends keyof SessionData>(key: K, value: SessionData[K]): Promise<void> {
    await this.save({ ...this.data, [key]: value });
  }
  async startPractice(problem: Problem, handoffToken?: string): Promise<void> {
    // Retrying the same durable handoff preserves answers; a new review token resets them.
    if (handoffToken && this.data.curriculumHandoffToken === handoffToken && this.data.currentProblem?.id === problem.id) return;
    const rest = { ...this.data };
    delete rest.currentAttempt;
    delete rest.curriculumHandoffToken;
    if (handoffToken) rest.curriculumHandoffToken = handoffToken;
    await this.save({ ...rest, currentProblem: problem });
  }
  async startTrap(trap: TrapProblem, id: string): Promise<void> {
    const rest = { ...this.data };
    delete rest.trapAttempt;
    await this.save({ ...rest, currentTrap: trap, trapTarget: trap.targetErrorType, trapId: id });
  }
  async clear(): Promise<void> { await this.save({}); }
  private async save(next: SessionData): Promise<void> {
    if (this.userId) await this.store().setItem(`ft:${this.userId}:session`, JSON.stringify(next));
    this.data = next;
  }
}
export const sessionStore = new SessionStore();
