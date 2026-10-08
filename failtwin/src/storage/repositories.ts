import type { KVStore } from './kv';
import { getKV } from './kv';
import { uid } from '@/utils/id';
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

export class StorageCorruptionError extends Error {
  constructor(readonly key: string) { super('저장된 기록이 손상되었습니다. 원본을 보존했습니다.'); }
}


function assertRecordShape(key: string, value: unknown): void {
  const legacy = key.match(/^ft:[^:]+:(dna|mistakes|traps)$/);
  if (legacy) {
    try { assertRecordShape('legacy:learning', {dna:[],mistakes:[],traps:[],[legacy[1]!]:value}); }
    catch { throw new StorageCorruptionError(key); }
  }
  if (key.endsWith(':learning')) {
    const v = value as LearningState | null;
    if (!v || typeof v !== 'object' || Array.isArray(v) || !Array.isArray(v.dna) || !Array.isArray(v.mistakes) || !Array.isArray(v.traps)
      || v.dna.some(e => !e || typeof e.errorType !== 'string' || typeof e.subject !== 'string' || !Number.isFinite(e.score) || !Array.isArray(e.evidence))
      || v.mistakes.some(m => !m || typeof m.id !== 'string' || typeof m.problemId !== 'string' || typeof m.isCorrect !== 'boolean' || !m.attempt || typeof m.attempt.id !== 'string' || !m.analysis)
      || v.traps.some(t => !t || typeof t.id !== 'string' || typeof t.solvedCorrectly !== 'boolean')) throw new StorageCorruptionError(key);
  }
  if (key.startsWith('ft:profile:') && value !== null) {
    const p = value as UserProfile;
    if (!p || typeof p !== 'object' || typeof p.userId !== 'string' || typeof p.name !== 'string' || !Array.isArray(p.interests) || typeof p.isDemo !== 'boolean' || typeof p.createdAt !== 'string') throw new StorageCorruptionError(key);
  }
  if (key.endsWith(':session') && (!value || typeof value !== 'object' || Array.isArray(value))) throw new StorageCorruptionError(key);
}

export async function exportDamagedRecord(key: string, kv: KVStore = getKV()): Promise<string> {
  const keys = (await kv.getAllKeys()).filter(k => k.startsWith(`${key}:damaged:`));
  const archives = await Promise.all(keys.map(async k => ({key:k,raw:await kv.getItem(k)})));
  return JSON.stringify({ format: 'failtwin-recovery-v1', key, raw: await kv.getItem(key), backup: await kv.getItem(`${key}:backup`), archives });
}
export async function restoreRecordBackup(key: string, kv: KVStore = getKV()): Promise<void> {
  const backup = await kv.getItem(`${key}:backup`);
  if (!backup) throw new Error('복원할 이전 기록이 없습니다. 원본을 내보내 보관해주세요.');
  try { assertRecordShape(key, JSON.parse(backup)); } catch { throw new StorageCorruptionError(`${key}:backup`); }
  const raw = await kv.getItem(key);
  if (raw !== null) await kv.setItem(`${key}:damaged:${uid('record')}`, raw);
  await kv.setItem(key, backup);
}


/** Explicit user action after reviewing the warning; archive first, never delete the damaged value. */
export async function archiveAndResetRecord(key: string, kv: KVStore = getKV()): Promise<void> {
  const learning = key.match(/^ft:([^:]+):learning$/);
  const empty = key.endsWith(':learning') ? {dnaScopeVersion:2,dna:[],mistakes:[],traps:[]} : key.endsWith(':session') ? {} : key.startsWith('ft:profile:') ? null : [];
  const raw = await kv.getItem(key);
  if (raw !== null) await kv.setItem(`${key}:damaged:${uid('record')}`,raw);
  if (learning) {
    const sessionKey = `ft:${learning[1]}:session`, session = await kv.getItem(sessionKey);
    if (session !== null) await kv.setItem(`${sessionKey}:damaged:${uid('record')}`,session);
    await kv.setItem(sessionKey,'{}');
  }
  await kv.setItem(key,JSON.stringify(empty));
}

export async function readStoredJson<T>(kv: KVStore, key: string, fallback: T): Promise<T> {
  const raw = await kv.getItem(key);
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw); assertRecordShape(key, parsed); return parsed as T;
  } catch {
    throw new StorageCorruptionError(key);
  }
}

export async function writeStoredJson(kv: KVStore, key: string, value: unknown): Promise<void> {
  assertRecordShape(key,value);
  const previous = await kv.getItem(key);
  if (previous !== null) {
    try { assertRecordShape(key, JSON.parse(previous)); } catch { throw new StorageCorruptionError(key); }
    await kv.setItem(`${key}:backup`, previous);
  }
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
    return readStoredJson<UserProfile | null>(this.kv, PROFILE_PREFIX + userId, null);
  }

  async getActive(): Promise<UserProfile | null> {
    const uid = await this.getActiveUserId();
    if (!uid) return null;
    return this.get(uid);
  }

  async save(profile: UserProfile): Promise<void> {
    await writeStoredJson(this.kv, PROFILE_PREFIX + profile.userId, profile);
    await this.setActiveUserId(profile.userId);
  }

  async clearActive(): Promise<void> {
    await this.kv.removeItem(ACTIVE_USER_KEY);
  }
}

export interface LearningState {
  dnaScopeVersion?: 2;
  /** Durable handoff to the session; resolves only to an immutable authored item. */
  curriculumPending?: { problemId: string; token: string };
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
    const saved = await readStoredJson<LearningState | null>(this.kv, `ft:${userId}:learning`, null);
    if (saved !== null) {
      if (!saved || typeof saved !== 'object' || !Array.isArray(saved.dna) || !Array.isArray(saved.mistakes) || !Array.isArray(saved.traps)
        || [...saved.dna, ...saved.mistakes, ...saved.traps].some(r => !r || typeof r !== 'object' || Array.isArray(r))) throw new StorageCorruptionError(`ft:${userId}:learning`);
      return saved.dnaScopeVersion === 2 ? saved : {...saved, dnaScopeVersion: 2, dna: saved.dna.map(e => ({...e, legacyAggregate: true}))};
    }
    // Read the original MVP keys without deleting any existing user history.
    const [dna, mistakes, traps] = await Promise.all([
      readStoredJson<ErrorDnaEntry[]>(this.kv, DNA_KEY(userId), []),
      readStoredJson<MistakeRecord[]>(this.kv, MISTAKES_KEY(userId), []),
      readStoredJson<TrapResult[]>(this.kv, TRAPS_KEY(userId), []),
    ]);
    return { dnaScopeVersion: 2, dna: dna.map(e => ({...e, legacyAggregate: true})), mistakes, traps };
  }

  async update(userId: string, change: (state: LearningState) => LearningState): Promise<LearningState> {
    let byUser = queues.get(this.kv);
    if (!byUser) { byUser = new Map(); queues.set(this.kv, byUser); }
    const previous = byUser.get(userId) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(async () => {
      const state = change(await this.get(userId));
      await writeStoredJson(this.kv, `ft:${userId}:learning`, state);
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
    await this.learning.update(userId, (s) => ({ ...s, dna: entries, dnaScopeVersion: 2 }));
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
