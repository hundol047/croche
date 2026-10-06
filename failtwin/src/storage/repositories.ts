import type { KVStore } from './kv';
import { getKV } from './kv';
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

export class DnaRepo {
  constructor(private kv: KVStore = getKV()) {}

  async get(userId: string): Promise<ErrorDnaEntry[]> {
    return readJson<ErrorDnaEntry[]>(this.kv, DNA_KEY(userId), []);
  }

  async save(userId: string, entries: ErrorDnaEntry[]): Promise<void> {
    await writeJson(this.kv, DNA_KEY(userId), entries);
  }
}

export class MistakeRepo {
  constructor(private kv: KVStore = getKV()) {}

  async get(userId: string): Promise<MistakeRecord[]> {
    return readJson<MistakeRecord[]>(this.kv, MISTAKES_KEY(userId), []);
  }

  async add(userId: string, record: MistakeRecord): Promise<MistakeRecord[]> {
    const all = await this.get(userId);
    const next = [...all, record];
    await writeJson(this.kv, MISTAKES_KEY(userId), next);
    return next;
  }

  async save(userId: string, records: MistakeRecord[]): Promise<void> {
    await writeJson(this.kv, MISTAKES_KEY(userId), records);
  }
}

export class TrapRepo {
  constructor(private kv: KVStore = getKV()) {}

  async get(userId: string): Promise<TrapResult[]> {
    return readJson<TrapResult[]>(this.kv, TRAPS_KEY(userId), []);
  }

  async add(userId: string, result: TrapResult): Promise<TrapResult[]> {
    const all = await this.get(userId);
    const next = [...all, result];
    await writeJson(this.kv, TRAPS_KEY(userId), next);
    return next;
  }
}

export interface Repositories {
  profile: ProfileRepo;
  dna: DnaRepo;
  mistakes: MistakeRepo;
  traps: TrapRepo;
}

export function makeRepositories(kv: KVStore = getKV()): Repositories {
  return {
    profile: new ProfileRepo(kv),
    dna: new DnaRepo(kv),
    mistakes: new MistakeRepo(kv),
    traps: new TrapRepo(kv),
  };
}
