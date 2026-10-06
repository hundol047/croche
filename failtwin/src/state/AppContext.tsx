import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type Context,
} from 'react';
import { makeRepositories, type Repositories } from '@/storage/repositories';
import { getAIService, type CrocheAIService } from '@/services/ai';
import { ToolRunner } from '@/services/ai/tools';
import type { UserProfile, ErrorDnaEntry, MistakeRecord, TrapResult } from '@/domain/types';

interface AppState {
  ready: boolean;
  profile: UserProfile | null;
  dna: ErrorDnaEntry[];
  mistakes: MistakeRecord[];
  traps: TrapResult[];
  repos: Repositories;
  ai: CrocheAIService;
  tools: ToolRunner;
  setProfile: (p: UserProfile | null) => void;
  refresh: () => Promise<void>;
  resetAll: () => Promise<void>;
}

// Explicitly typed so the generic can never collapse to `{}` under a mixed
// @types/react resolution. useContext(AppCtx) is then always AppState | null.
const AppCtx: Context<AppState | null> = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const repos = useMemo(() => makeRepositories(), []);
  const ai = useMemo(() => getAIService(), []);
  const tools = useMemo(() => new ToolRunner(repos, ai), [repos, ai]);

  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [dna, setDna] = useState<ErrorDnaEntry[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [traps, setTraps] = useState<TrapResult[]>([]);

  const loadFor = useCallback(
    async (userId: string) => {
      const [d, m, t] = await Promise.all([
        repos.dna.get(userId),
        repos.mistakes.get(userId),
        repos.traps.get(userId),
      ]);
      setDna(d);
      setMistakes(m);
      setTraps(t);
    },
    [repos],
  );

  const refresh = useCallback(async () => {
    const p = await repos.profile.getActive();
    setProfileState(p);
    if (p) await loadFor(p.userId);
    else {
      setDna([]);
      setMistakes([]);
      setTraps([]);
    }
  }, [repos, loadFor]);

  useEffect(() => {
    (async () => {
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const setProfile = useCallback(
    (p: UserProfile | null) => {
      setProfileState(p);
      if (p) void loadFor(p.userId);
    },
    [loadFor],
  );

  const resetAll = useCallback(async () => {
    await repos.profile.clearActive();
    setProfileState(null);
    setDna([]);
    setMistakes([]);
    setTraps([]);
  }, [repos]);

  const value: AppState = {
    ready,
    profile,
    dna,
    mistakes,
    traps,
    repos,
    ai,
    tools,
    setProfile,
    refresh,
    resetAll,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
