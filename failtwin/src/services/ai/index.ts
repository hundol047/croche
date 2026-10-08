import type { CrocheAIService } from './CrocheAIService';
import { MockCrocheAIService } from './MockCrocheAIService';
import { RealCrocheAIService } from './RealCrocheAIService';
import { createCrocheClient } from '@/services/croche/client';

export type CrocheMode = 'mock' | 'real';

export function resolveMode(): CrocheMode {
  const env = (process.env.EXPO_PUBLIC_CROCHE_MODE ?? 'mock').toLowerCase();
  return env === 'real' ? 'real' : 'mock';
}

/**
 * Honest, judge-facing status of the AI backend. Distinguishes:
 *  - 'mock'            : running the deterministic Mock (dev / offline demo)
 *  - 'real'            : connected to a real Croche client
 *  - 'real-unavailable': configured for real but no client → fell back to Mock
 * The UI shows this so Mock is NEVER presented as real Croche (§6).
 */
export type CrocheServiceStatus = 'mock' | 'real' | 'real-pending' | 'real-error' | 'real-unavailable';

let lastStatus: CrocheServiceStatus = 'mock';

export function getServiceStatus(): CrocheServiceStatus {
  return lastStatus;
}

let singleton: CrocheAIService | null = null;

/**
 * The single factory the app uses to obtain the AI service.
 *
 * - mode=real + a configured client → RealCrocheAIService
 * - otherwise → MockCrocheAIService (always works, no network/SDK)
 *
 * This is the ONE place to flip once Croche access is granted.
 */
export function getAIService(mode: CrocheMode = resolveMode()): CrocheAIService {
  if (singleton) return singleton;

  if (mode === 'real') {
    const client = createCrocheClient((connected) => { lastStatus = connected ? 'real' : 'real-error'; });
    if (client) {
      lastStatus = 'real-pending';
      singleton = new RealCrocheAIService(client);
      return singleton;
    }
    // Configured for real but no client available → fall back to mock so the
    // app still runs. (Logged for the developer; surfaced honestly in the UI.)
    lastStatus = 'real-unavailable';
    // eslint-disable-next-line no-console
    console.warn(
      '[FailTwin] CROCHE_MODE=real but no Croche client configured. Falling back to MockCrocheAIService.',
    );
    singleton = new MockCrocheAIService();
    return singleton;
  }

  lastStatus = 'mock';
  singleton = new MockCrocheAIService();
  return singleton;
}

/** Test hook. */
export function setAIService(svc: CrocheAIService | null): void {
  singleton = svc;
  if (svc) lastStatus = svc.kind;
}

export type { CrocheAIService } from './CrocheAIService';
export { MockCrocheAIService } from './MockCrocheAIService';
export { RealCrocheAIService } from './RealCrocheAIService';
