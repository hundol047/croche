import type { KVStore } from './kv';
import { getKV } from './kv';
import type { IssuedQuestion } from '@/domain/questionIssuance';
import type {
  UserProfile,
  ErrorDnaEntry,
  MistakeRecord,
  TrapResult,
} from '@/domain/types';

/**
 * Per-userId repositories. All keys are namespaced `ft:{userId}:...` so one
 * user's learning history can never mix with another account's (R10.3).
 * Profile is stored under a global key plus the "active user" pointer.
 */

const PROFILE_PREFIX = 'ft:profile:'; // ft:profile:{userId}
const ACTIVE_USER_KEY = 'ft:activeUser';
const DNA_KEY = (uid: string) => `ft:${uid}:dna`;
const MISTAKES_KEY = (uid: string) => `ft:${uid}:mistakes`;
const TRAPS_KEY = (uid: string) => `ft:${uid}:traps`;

async function readJson<T>(kv: KVStore, key: string, fallback: T): Promise<T> {
  const raw = await kv.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(kv: KVStore, key: string, value: unknown): Promise<void> {
  await kv.setItem(key, JSON.stringify(value));
}

export class ProfileRepo {
  constructor(private kv: KVStore = getKV()) {}

  async getActiveUserId(): Promise<string | null> {
    return this.kv.getItem(ACTIVE_USER_KEY);
  }

  async setActiveUserId(userId: string): Promise<void> {
    await this.kv.setItem(ACTIVE_USER_KEY, userId);
  }

  async get(userId: string): Promise<UserProfile | null> {
    return readJson<UserProfile | null>(this.kv, PROFILE_PREFIX + userId, null);
  }

  async getActive(): Promise<UserProfile | null> {
    const uid = await this.getActiveUserId();
    if (!uid) return null;
    return this.get(uid);
  }

  async save(profile: UserProfile): Promise<void> {
    await writeJson(this.kv, PROFILE_PREFIX + profile.userId, profile);
    await this.setActiveUserId(profile.userId);
  }

  async clearActive(): Promise<void> {
    await this.kv.removeItem(ACTIVE_USER_KEY);
  }
}

export interface LearningState {
  /** Separate versioned reservations for fixed authored unit questions. */
  curriculumProgress?: Record<string, number>;
  curriculumSelection?: {educationLevel: import('@/domain/types').EducationLevel; subject: import('@/domain/types').Subject; group: string};
  issued?: IssuedQuestion[];
  practiceSelection?: {educationLevel: import('@/domain/types').EducationLevel; subject: import('@/domain/types').Subject; difficulty: import('@/domain/types').Problem['difficulty']};
  /** Versioned next variant per subject/difficulty/family; 45 university counters plus 360 school counters. */
  practiceProgress?: Record<string, number>;
  dna: ErrorDnaEntry[];
  mistakes: MistakeRecord[];
  traps: TrapResult[];
}

// Serialize writes per store/user; each learning event and DNA change commit
// as one value so retries cannot leave half an event in durable storage.
const queues = new WeakMap<KVStore, Map<string, Promise<unknown>>>();
export class LearningRepo {
  constructor(private kv: KVStore = getKV()) {}

  async get(userId: string): Promise<LearningState> {
    const saved = await readJson<LearningState | null>(this.kv, `ft:${userId}:learning`, null);
    if (saved) return saved;
    // Read the original MVP keys without deleting any existing user history.
    const [dna, mistakes, traps] = await Promise.all([
      readJson<ErrorDnaEntry[]>(this.kv, DNA_KEY(userId), []),
      readJson<MistakeRecord[]>(this.kv, MISTAKES_KEY(userId), []),
      readJson<TrapResult[]>(this.kv, TRAPS_KEY(userId), []),
    ]);
    return { dna, mistakes, traps };
  }

  async update(userId: string, change: (state: LearningState) => LearningState): Promise<LearningState> {
    let byUser = queues.get(this.kv);
    if (!byUser) { byUser = new Map(); queues.set(this.kv, byUser); }
    const previous = byUser.get(userId) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(async () => {
      const state = change(await this.get(userId));
      await writeJson(this.kv, `ft:${userId}:learning`, state);
      return state;
    });
    byUser.set(userId, next);
    try { return await next; }
    finally { if (byUser.get(userId) === next) byUser.delete(userId); }
  }
}

export class DnaRepo {
  private learning: LearningRepo;
  constructor(kv: KVStore = getKV()) { this.learning = new LearningRepo(kv); }
  async get(userId: string): Promise<ErrorDnaEntry[]> { return (await this.learning.get(userId)).dna; }
  async save(userId: string, entries: ErrorDnaEntry[]): Promise<void> {
    await this.learning.update(userId, (s) => ({ ...s, dna: entries }));
  }
}

export class MistakeRepo {
  private learning: LearningRepo;
  constructor(kv: KVStore = getKV()) { this.learning = new LearningRepo(kv); }
  async get(userId: string): Promise<MistakeRecord[]> { return (await this.learning.get(userId)).mistakes; }
  async add(userId: string, record: MistakeRecord): Promise<MistakeRecord[]> {
    return (await this.learning.update(userId, (s) => ({ ...s, mistakes: [...s.mistakes, record] }))).mistakes;
  }
  async save(userId: string, records: MistakeRecord[]): Promise<void> {
    await this.learning.update(userId, (s) => ({ ...s, mistakes: records }));
  }
}

export class TrapRepo {
  private learning: LearningRepo;
  constructor(kv: KVStore = getKV()) { this.learning = new LearningRepo(kv); }
  async get(userId: string): Promise<TrapResult[]> { return (await this.learning.get(userId)).traps; }
  async add(userId: string, result: TrapResult): Promise<TrapResult[]> {
    return (await this.learning.update(userId, (s) => ({ ...s, traps: [...s.traps, result] }))).traps;
  }
}

export interface Repositories {
  learning: LearningRepo;
  profile: ProfileRepo;
  dna: DnaRepo;
  mistakes: MistakeRepo;
  traps: TrapRepo;
}

export function makeRepositories(kv: KVStore = getKV()): Repositories {
  return {
    learning: new LearningRepo(kv),
    profile: new ProfileRepo(kv),
    dna: new DnaRepo(kv),
    mistakes: new MistakeRepo(kv),
    traps: new TrapRepo(kv),
  };
}
