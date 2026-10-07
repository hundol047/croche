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
import { sessionStore } from './sessionStore';
import { ToolRunner } from '@/services/ai/tools';
import type { UserProfile, ErrorDnaEntry, MistakeRecord, TrapResult } from '@/domain/types';

interface AppState {
  ready: boolean;
  bootstrapError: boolean;
  retryBootstrap: () => Promise<void>;
  profile: UserProfile | null;
  dna: ErrorDnaEntry[];
  mistakes: MistakeRecord[];
  traps: TrapResult[];
  repos: Repositories;
  ai: CrocheAIService;
  tools: ToolRunner;
  setProfile: (p: UserProfile | null) => Promise<void>;
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
  const [bootstrapError, setBootstrapError] = useState(false);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [dna, setDna] = useState<ErrorDnaEntry[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [traps, setTraps] = useState<TrapResult[]>([]);

  const loadFor = useCallback(
    async (userId: string) => {
      const { dna: d, mistakes: m, traps: t } = await repos.learning.get(userId);
      setDna(d);
      setMistakes(m);
      setTraps(t);
    },
    [repos],
  );

  const refresh = useCallback(async () => {
    const p = await repos.profile.getActive();
    await sessionStore.bind(p?.userId ?? null);
    if (p) await loadFor(p.userId);
    else {
      setDna([]);
      setMistakes([]);
      setTraps([]);
    }
    setProfileState(p);
  }, [repos, loadFor]);

  const retryBootstrap = useCallback(async () => {
    setBootstrapError(false);
    try { await refresh(); setReady(true); }
    catch { setBootstrapError(true); }
  }, [refresh]);

  useEffect(() => { void retryBootstrap(); }, [retryBootstrap]);

  const setProfile = useCallback(async (p: UserProfile | null) => {
    await sessionStore.bind(p?.userId ?? null);
    if (p) await loadFor(p.userId);
    setProfileState(p);
  }, [loadFor]);

  const resetAll = useCallback(async () => {
    await sessionStore.clear();
    await sessionStore.bind(null);
    await repos.profile.clearActive();
    setProfileState(null);
    setDna([]);
    setMistakes([]);
    setTraps([]);
  }, [repos]);

  const value: AppState = {
    ready,
    bootstrapError,
    retryBootstrap,
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
